const MICROSOFT_CLIENT_ID = "";
const MICROSOFT_AUTHORITY = "https://login.microsoftonline.com/consumers/oauth2/v2.0";
const MICROSOFT_SCOPES = ["Files.ReadWrite.AppFolder"];

const GOOGLE_CLIENT_ID = "";
const GOOGLE_DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.appdata";
const GOOGLE_IDENTITY_SCRIPT_URL = "https://accounts.google.com/gsi/client";

const PROMPT_BACKUP_FILENAME = "whisper-prompts-backup.enc.json";
const GENERAL_TERMS_BACKUP_FILENAME = "whisper-general-terms-backup.enc.json";
const WORKSPACE_PRESETS_BACKUP_FILENAME = "whisper-workspace-presets-backup.enc.json";
const BACKUP_VERSION = 1;
const KDF_ITERATIONS = 250000;
const MAX_BACKUP_BYTES = 2000000;

const PROMPT_PROVIDERS = {
  oneDrive: {
    schema: "whisper.prompts.onedrive.encrypted",
    providerName: "Microsoft OneDrive",
    backupLabel: "prompt backup",
  },
  googleDrive: {
    schema: "whisper.prompts.google-drive.encrypted",
    providerName: "Google Drive",
    backupLabel: "prompt backup",
  },
};

const GENERAL_TERMS_PROVIDERS = {
  oneDrive: {
    schema: "whisper.redactor-general-terms.onedrive.encrypted",
    providerName: "Microsoft OneDrive",
    backupLabel: "General terms backup",
  },
  googleDrive: {
    schema: "whisper.redactor-general-terms.google-drive.encrypted",
    providerName: "Google Drive",
    backupLabel: "General terms backup",
  },
};

const WORKSPACE_PRESET_PROVIDERS = {
  oneDrive: {
    schema: "whisper.workspace-presets.onedrive.encrypted",
    providerName: "Microsoft OneDrive",
    backupLabel: "workspace preset backup",
  },
  googleDrive: {
    schema: "whisper.workspace-presets.google-drive.encrypted",
    providerName: "Google Drive",
    backupLabel: "workspace preset backup",
  },
};

function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64ToBytes(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64Url(bytes) {
  return bytesToBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function randomBytes(length) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

function assertSecureEncryptionAvailable() {
  if (!window.isSecureContext || !crypto?.subtle) {
    throw new Error("Secure browser encryption is unavailable on this page.");
  }
}

async function deriveBackupKey(password, salt, iterations, usages) {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    usages
  );
}

async function encryptBackupBundle(bundle, password, provider) {
  assertSecureEncryptionAvailable();
  const plaintext = new TextEncoder().encode(JSON.stringify(bundle));
  if (plaintext.byteLength > MAX_BACKUP_BYTES) {
    throw new Error(`The ${provider.backupLabel} is unexpectedly large.`);
  }

  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const key = await deriveBackupKey(password, salt, KDF_ITERATIONS, ["encrypt"]);
  const aad = new TextEncoder().encode(`${provider.schema}:${BACKUP_VERSION}`);
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    key,
    plaintext
  );

  return {
    schema: provider.schema,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    encryption: {
      algorithm: "AES-256-GCM",
      kdf: "PBKDF2-SHA-256",
      iterations: KDF_ITERATIONS,
      salt: bytesToBase64(salt),
      iv: bytesToBase64(iv),
    },
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

async function decryptBackupBundle(container, password, provider) {
  assertSecureEncryptionAvailable();
  if (!container || container.schema !== provider.schema ||
      container.version !== BACKUP_VERSION || !container.encryption) {
    throw new Error(`The ${provider.providerName} ${provider.backupLabel} has an unsupported format.`);
  }

  const iterations = Number(container.encryption.iterations);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 1000000) {
    throw new Error(`The ${provider.providerName} ${provider.backupLabel} has invalid encryption settings.`);
  }

  try {
    const salt = base64ToBytes(container.encryption.salt);
    const iv = base64ToBytes(container.encryption.iv);
    const ciphertext = base64ToBytes(container.ciphertext);
    if (salt.length !== 16 || iv.length !== 12 || ciphertext.length > MAX_BACKUP_BYTES) {
      throw new Error("Invalid encryption parameters");
    }

    const key = await deriveBackupKey(password, salt, iterations, ["decrypt"]);
    const aad = new TextEncoder().encode(`${provider.schema}:${BACKUP_VERSION}`);
    const plaintext = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv, additionalData: aad },
      key,
      ciphertext
    );
    return JSON.parse(new TextDecoder().decode(plaintext));
  } catch {
    throw new Error(`Incorrect password or damaged ${provider.providerName} ${provider.backupLabel}.`);
  }
}

function getMicrosoftRedirectUri() {
  const pathname = window.location.pathname;
  const folderPath = pathname.endsWith("/")
    ? pathname
    : pathname.slice(0, pathname.lastIndexOf("/") + 1);
  return window.location.origin + folderPath;
}

async function requestMicrosoftAccessToken() {
  const popup = window.open("", "whisperMicrosoftSignIn", "popup=yes,width=520,height=720");
  if (!popup) {
    throw new Error("Microsoft sign-in was blocked. Allow pop-ups and try again.");
  }

  try {
    popup.document.title = "Microsoft sign-in";
    popup.document.body.textContent = "Opening Microsoft sign-in…";
  } catch {}

  try {
    const verifier = bytesToBase64Url(randomBytes(64));
    const challengeBytes = new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier))
    );
    const challenge = bytesToBase64Url(challengeBytes);
    const state = `whisper-ms-${bytesToBase64Url(randomBytes(24))}`;
    const redirectUri = getMicrosoftRedirectUri();
    const authUrl = new URL(`${MICROSOFT_AUTHORITY}/authorize`);
    authUrl.search = new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      response_type: "code",
      redirect_uri: redirectUri,
      response_mode: "query",
      scope: MICROSOFT_SCOPES.join(" "),
      state,
      code_challenge: challenge,
      code_challenge_method: "S256",
      prompt: "select_account",
    }).toString();

    return await new Promise((resolve, reject) => {
      let settled = false;
      let callbackReceived = false;
      let popupClosedAt = 0;
      let oauthChannel = null;
      const timeoutId = window.setTimeout(
        () => finish(new Error("Microsoft sign-in timed out.")),
        120000
      );
      const closedPollId = window.setInterval(() => {
        if (!popup.closed) {
          popupClosedAt = 0;
          return;
        }
        if (!popupClosedAt) {
          popupClosedAt = Date.now();
          return;
        }
        // The callback page closes itself after queueing its response. Give
        // that response time to arrive before treating the close as a cancel.
        if (Date.now() - popupClosedAt >= 2000) {
          finish(new Error("Microsoft sign-in was closed before completion."));
        }
      }, 500);

      function cleanup() {
        window.clearTimeout(timeoutId);
        window.clearInterval(closedPollId);
        window.removeEventListener("message", onMessage);
        try { oauthChannel?.removeEventListener("message", onBroadcastMessage); } catch {}
        try { oauthChannel?.close(); } catch {}
        oauthChannel = null;
        try { if (!popup.closed) popup.close(); } catch {}
      }

      function finish(error, token) {
        if (settled) return;
        settled = true;
        cleanup();
        if (error) reject(error);
        else resolve(token);
      }

      async function handleCallback(data) {
        if (settled || callbackReceived ||
            data.type !== "whisper-microsoft-oauth-callback" ||
            data.state !== state) return;
        callbackReceived = true;
        window.clearInterval(closedPollId);
        window.removeEventListener("message", onMessage);
        try { oauthChannel?.removeEventListener("message", onBroadcastMessage); } catch {}
        try { oauthChannel?.close(); } catch {}
        oauthChannel = null;

        if (data.error) {
          finish(new Error(data.errorDescription || data.error));
          return;
        }

        try {
          const tokenResponse = await fetch(`${MICROSOFT_AUTHORITY}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: MICROSOFT_CLIENT_ID,
              grant_type: "authorization_code",
              code: data.code,
              redirect_uri: redirectUri,
              code_verifier: verifier,
              scope: MICROSOFT_SCOPES.join(" "),
            }),
          });
          const tokenData = await tokenResponse.json();
          if (!tokenResponse.ok || !tokenData.access_token) {
            throw new Error(tokenData.error_description || "Microsoft did not return an access token.");
          }
          finish(null, tokenData.access_token);
        } catch (error) {
          finish(error);
        }
      }

      function onMessage(event) {
        if (event.origin !== window.location.origin) return;
        handleCallback(event.data || {});
      }

      function onBroadcastMessage(event) {
        handleCallback(event.data || {});
      }

      window.addEventListener("message", onMessage);
      try {
        if (typeof window.BroadcastChannel === "function") {
          oauthChannel = new window.BroadcastChannel(`whisper-ms-oauth-${state}`);
          oauthChannel.addEventListener("message", onBroadcastMessage);
        }
      } catch {
        oauthChannel = null;
      }
      try {
        popup.location.replace(authUrl.toString());
      } catch (error) {
        finish(error);
      }
    });
  } catch (error) {
    try { if (!popup.closed) popup.close(); } catch {}
    throw error;
  }
}

async function graphRequest(accessToken, path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    let message = `Microsoft Graph error (${response.status})`;
    try {
      const details = await response.clone().json();
      message = details?.error?.message || message;
    } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response;
}

async function uploadToOneDrive(accessToken, filename, encryptedBackup) {
  await graphRequest(accessToken, "/me/drive/special/approot");
  await graphRequest(
    accessToken,
    `/me/drive/special/approot:/${filename}:/content`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(encryptedBackup),
    }
  );
}

async function downloadFromOneDrive(
  accessToken,
  filename,
  backupLabel,
  { required = true } = {}
) {
  try {
    await graphRequest(accessToken, "/me/drive/special/approot");
    const response = await graphRequest(
      accessToken,
      `/me/drive/special/approot:/${filename}:/content`
    );
    const raw = await response.text();
    if (raw.length > MAX_BACKUP_BYTES) {
      throw new Error(`The OneDrive ${backupLabel} is unexpectedly large.`);
    }
    return JSON.parse(raw);
  } catch (error) {
    if (error?.status === 404) {
      if (!required) return null;
      throw new Error(`No OneDrive ${backupLabel} was found. Export prompts to OneDrive first.`);
    }
    if (error instanceof SyntaxError) {
      throw new Error(`The OneDrive ${backupLabel} is not valid JSON.`);
    }
    throw error;
  }
}

let googleIdentityServicesPromise = null;

function loadGoogleIdentityServices() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (googleIdentityServicesPromise) return googleIdentityServicesPromise;

  googleIdentityServicesPromise = new Promise((resolve, reject) => {
    let script = document.querySelector(`script[src="${GOOGLE_IDENTITY_SCRIPT_URL}"]`);
    const timeoutId = window.setTimeout(() => {
      if (!window.google?.accounts?.oauth2) script?.remove();
      reject(new Error("Google sign-in could not be loaded. Check your connection and try again."));
    }, 15000);

    const finish = () => {
      window.clearTimeout(timeoutId);
      if (window.google?.accounts?.oauth2) resolve();
      else reject(new Error("Google sign-in is unavailable in this browser."));
    };

    const fail = () => {
      window.clearTimeout(timeoutId);
      script?.remove();
      reject(new Error("Google sign-in could not be loaded. Check your connection and try again."));
    };

    if (!script) {
      script = document.createElement("script");
      script.src = GOOGLE_IDENTITY_SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", fail, { once: true });
      document.head.appendChild(script);
    } else {
      script.addEventListener("load", finish, { once: true });
      script.addEventListener("error", fail, { once: true });
    }
  }).catch((error) => {
    googleIdentityServicesPromise = null;
    throw error;
  });

  return googleIdentityServicesPromise;
}

function requestGoogleAccessToken() {
  if (!window.google?.accounts?.oauth2) {
    throw new Error("Google sign-in is still loading. Wait a moment and try again.");
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = window.setTimeout(
      () => finish(new Error("Google sign-in timed out.")),
      120000
    );

    function finish(error, token) {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      if (error) reject(error);
      else resolve(token);
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_DRIVE_SCOPE,
        prompt: "select_account",
        callback: (response) => {
          if (response?.error) {
            finish(new Error(response.error_description || response.error));
            return;
          }
          if (!response?.access_token) {
            finish(new Error("Google did not return an access token."));
            return;
          }
          const hasScope = typeof window.google.accounts.oauth2.hasGrantedAllScopes !== "function" ||
            window.google.accounts.oauth2.hasGrantedAllScopes(response, GOOGLE_DRIVE_SCOPE);
          if (!hasScope) {
            finish(new Error("Google Drive app-storage permission was not granted."));
            return;
          }
          finish(null, response.access_token);
        },
        error_callback: (error) => {
          const message = error?.type === "popup_failed_to_open"
            ? "Google sign-in was blocked. Allow pop-ups and try again."
            : error?.type === "popup_closed"
              ? "Google sign-in was closed before completion."
              : "Google sign-in failed. Please try again.";
          finish(new Error(message));
        },
      });
      tokenClient.requestAccessToken();
    } catch (error) {
      finish(error);
    }
  });
}

async function googleDriveRequest(accessToken, url, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);
  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    let message = `Google Drive error (${response.status})`;
    try {
      const details = await response.clone().json();
      message = details?.error?.message || message;
    } catch {}
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response;
}

async function findGoogleDriveBackup(accessToken, filename) {
  const params = new URLSearchParams({
    spaces: "appDataFolder",
    q: `name = '${filename}' and trashed = false`,
    fields: "files(id,name,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: "1",
  });
  const response = await googleDriveRequest(
    accessToken,
    `https://www.googleapis.com/drive/v3/files?${params.toString()}`
  );
  const data = await response.json();
  return Array.isArray(data?.files) && data.files.length ? data.files[0] : null;
}

async function uploadToGoogleDrive(accessToken, filename, encryptedBackup) {
  const existing = await findGoogleDriveBackup(accessToken, filename);
  const content = JSON.stringify(encryptedBackup);

  if (existing?.id) {
    await googleDriveRequest(
      accessToken,
      `https://www.googleapis.com/upload/drive/v3/files/${encodeURIComponent(existing.id)}?uploadType=media`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: content,
      }
    );
    return;
  }

  const boundary = `whisper_prompt_backup_${bytesToBase64Url(randomBytes(18))}`;
  const metadata = JSON.stringify({
    name: filename,
    parents: ["appDataFolder"],
    mimeType: "application/json",
  });
  const multipartBody = [
    `--${boundary}`,
    "Content-Type: application/json; charset=UTF-8",
    "",
    metadata,
    `--${boundary}`,
    "Content-Type: application/json",
    "",
    content,
    `--${boundary}--`,
    "",
  ].join("\r\n");

  await googleDriveRequest(
    accessToken,
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id",
    {
      method: "POST",
      headers: { "Content-Type": `multipart/related; boundary=${boundary}` },
      body: multipartBody,
    }
  );
}

async function downloadFromGoogleDrive(
  accessToken,
  filename,
  backupLabel,
  { required = true } = {}
) {
  const backup = await findGoogleDriveBackup(accessToken, filename);
  if (!backup?.id) {
    if (!required) return null;
    throw new Error(`No Google Drive ${backupLabel} was found. Export prompts to Google Drive first.`);
  }

  const response = await googleDriveRequest(
    accessToken,
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(backup.id)}?alt=media`
  );
  const raw = await response.text();
  if (raw.length > MAX_BACKUP_BYTES) {
    throw new Error(`The Google Drive ${backupLabel} is unexpectedly large.`);
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error(`The Google Drive ${backupLabel} is not valid JSON.`);
  }
}

function normalizeProvider(provider) {
  const value = String(provider || "");
  if (value !== "oneDrive" && value !== "googleDrive") {
    throw new Error("Unsupported cloud backup provider.");
  }
  return value;
}

async function connect(provider, onStatus = () => {}) {
  const normalized = normalizeProvider(provider);
  if (normalized === "oneDrive") {
    onStatus("microsoftSignIn");
    return requestMicrosoftAccessToken();
  }
  onStatus("googleSignIn");
  await loadGoogleIdentityServices();
  return requestGoogleAccessToken();
}

async function downloadProviderFile(
  provider,
  accessToken,
  filename,
  backupLabel,
  options = {}
) {
  return provider === "oneDrive"
    ? downloadFromOneDrive(accessToken, filename, backupLabel, options)
    : downloadFromGoogleDrive(accessToken, filename, backupLabel, options);
}

async function uploadProviderFile(provider, accessToken, filename, encryptedBackup) {
  if (provider === "oneDrive") {
    return uploadToOneDrive(accessToken, filename, encryptedBackup);
  }
  return uploadToGoogleDrive(accessToken, filename, encryptedBackup);
}

async function inspectAvailableBackups(provider, accessToken) {
  const normalized = normalizeProvider(provider);
  const [prompts, workspaceSet] = await Promise.all([
    downloadProviderFile(
      normalized,
      accessToken,
      PROMPT_BACKUP_FILENAME,
      "prompt backup",
      { required: false }
    ),
    downloadProviderFile(
      normalized,
      accessToken,
      WORKSPACE_PRESETS_BACKUP_FILENAME,
      "workspace preset backup",
      { required: false }
    ),
  ]);
  return { prompts: Boolean(prompts), workspaceSet: Boolean(workspaceSet) };
}

async function savePackageWithAccessToken(
  provider,
  accessToken,
  { promptBundle, generalTermsBundle = null },
  password
) {
  const normalized = normalizeProvider(provider);
  const encryptedPrompts = await encryptBackupBundle(
    promptBundle,
    password,
    PROMPT_PROVIDERS[normalized]
  );
  await uploadProviderFile(normalized, accessToken, PROMPT_BACKUP_FILENAME, encryptedPrompts);

  if (generalTermsBundle) {
    const encryptedGeneralTerms = await encryptBackupBundle(
      generalTermsBundle,
      password,
      GENERAL_TERMS_PROVIDERS[normalized]
    );
    await uploadProviderFile(
      normalized,
      accessToken,
      GENERAL_TERMS_BACKUP_FILENAME,
      encryptedGeneralTerms
    );
  }
  return { generalTermsSaved: Boolean(generalTermsBundle) };
}

async function loadPackageWithAccessToken(provider, accessToken, password) {
  const normalized = normalizeProvider(provider);
  const encryptedPrompts = await downloadProviderFile(
    normalized,
    accessToken,
    PROMPT_BACKUP_FILENAME,
    "prompt backup"
  );
  const promptBundle = await decryptBackupBundle(
    encryptedPrompts,
    password,
    PROMPT_PROVIDERS[normalized]
  );

  let generalTermsBundle = null;
  let generalTermsError = null;
  try {
    const encryptedGeneralTerms = await downloadProviderFile(
      normalized,
      accessToken,
      GENERAL_TERMS_BACKUP_FILENAME,
      "General terms backup",
      { required: false }
    );
    if (encryptedGeneralTerms) {
      generalTermsBundle = await decryptBackupBundle(
        encryptedGeneralTerms,
        password,
        GENERAL_TERMS_PROVIDERS[normalized]
      );
    }
  } catch (error) {
    generalTermsError = error;
  }
  return { promptBundle, generalTermsBundle, generalTermsError };
}

async function saveWorkspaceSetWithAccessToken(provider, accessToken, bundle, password) {
  const normalized = normalizeProvider(provider);
  const encrypted = await encryptBackupBundle(
    bundle,
    password,
    WORKSPACE_PRESET_PROVIDERS[normalized]
  );
  await uploadProviderFile(
    normalized,
    accessToken,
    WORKSPACE_PRESETS_BACKUP_FILENAME,
    encrypted
  );
}

async function loadWorkspaceSetWithAccessToken(provider, accessToken, password) {
  const normalized = normalizeProvider(provider);
  const encrypted = await downloadProviderFile(
    normalized,
    accessToken,
    WORKSPACE_PRESETS_BACKUP_FILENAME,
    "workspace preset backup"
  );
  return decryptBackupBundle(
    encrypted,
    password,
    WORKSPACE_PRESET_PROVIDERS[normalized]
  );
}

async function savePackageToProvider(provider, data, password, onStatus = () => {}) {
  const accessToken = await connect(provider, onStatus);
  onStatus("encryptingAndSaving");
  return savePackageWithAccessToken(provider, accessToken, data, password);
}

async function loadPackageFromProvider(provider, password, onStatus = () => {}) {
  const accessToken = await connect(provider, onStatus);
  onStatus("downloadingAndDecrypting");
  return loadPackageWithAccessToken(provider, accessToken, password);
}

async function savePackageToOneDrive(data, password, onStatus = () => {}) {
  return savePackageToProvider("oneDrive", data, password, onStatus);
}

async function loadPackageFromOneDrive(password, onStatus = () => {}) {
  return loadPackageFromProvider("oneDrive", password, onStatus);
}

async function savePackageToGoogleDrive(data, password, onStatus = () => {}) {
  return savePackageToProvider("googleDrive", data, password, onStatus);
}

async function loadPackageFromGoogleDrive(password, onStatus = () => {}) {
  return loadPackageFromProvider("googleDrive", password, onStatus);
}

async function saveToOneDrive(bundle, password, onStatus = () => {}) {
  return savePackageToOneDrive({ promptBundle: bundle }, password, onStatus);
}

async function loadFromOneDrive(password, onStatus = () => {}) {
  const result = await loadPackageFromOneDrive(password, onStatus);
  return result.promptBundle;
}

async function saveToGoogleDrive(bundle, password, onStatus = () => {}) {
  return savePackageToGoogleDrive({ promptBundle: bundle }, password, onStatus);
}

async function loadFromGoogleDrive(password, onStatus = () => {}) {
  const result = await loadPackageFromGoogleDrive(password, onStatus);
  return result.promptBundle;
}

async function saveWorkspacePresetsToOneDrive(bundle, password, onStatus = () => {}) {
  const accessToken = await connect("oneDrive", onStatus);
  onStatus("encryptingAndSaving");
  return saveWorkspaceSetWithAccessToken("oneDrive", accessToken, bundle, password);
}

async function loadWorkspacePresetsFromOneDrive(password, onStatus = () => {}) {
  const accessToken = await connect("oneDrive", onStatus);
  onStatus("downloadingAndDecrypting");
  return loadWorkspaceSetWithAccessToken("oneDrive", accessToken, password);
}

async function saveWorkspacePresetsToGoogleDrive(bundle, password, onStatus = () => {}) {
  const accessToken = await connect("googleDrive", onStatus);
  onStatus("encryptingAndSaving");
  return saveWorkspaceSetWithAccessToken("googleDrive", accessToken, bundle, password);
}

async function loadWorkspacePresetsFromGoogleDrive(password, onStatus = () => {}) {
  const accessToken = await connect("googleDrive", onStatus);
  onStatus("downloadingAndDecrypting");
  return loadWorkspaceSetWithAccessToken("googleDrive", accessToken, password);
}

const unavailable = async () => { throw new Error("Skykopi er ikke konfigurert for Nordlys Journal. Bruk lokal JSON-eksport/import."); };
export const PromptCloudBackup = Object.freeze({
  filename: PROMPT_BACKUP_FILENAME,
  generalTermsFilename: GENERAL_TERMS_BACKUP_FILENAME,
  workspacePresetsFilename: WORKSPACE_PRESETS_BACKUP_FILENAME,
  prepareGoogleSignIn: loadGoogleIdentityServices,
  connect,
  inspectAvailableBackups,
  savePackageWithAccessToken,
  loadPackageWithAccessToken,
  saveWorkspaceSetWithAccessToken,
  loadWorkspaceSetWithAccessToken,
  saveToOneDrive: unavailable,
  loadFromOneDrive: unavailable,
  saveToGoogleDrive: unavailable,
  loadFromGoogleDrive: unavailable,
  savePackageToOneDrive: unavailable,
  loadPackageFromOneDrive: unavailable,
  savePackageToGoogleDrive: unavailable,
  loadPackageFromGoogleDrive: unavailable,
  saveWorkspacePresetsToOneDrive: unavailable,
  loadWorkspacePresetsFromOneDrive: unavailable,
  saveWorkspacePresetsToGoogleDrive: unavailable,
  loadWorkspacePresetsFromGoogleDrive: unavailable,
});
