export const indexTranslations = {
  pageTitle: "Nordlys Journal",
  headerTitle: "Nordlys Journal",
  headerSubtitle: "Advanced AI-Powered Speech-to-Text and Clinical Note Generation for Healthcare Consultations",
  startText: "You can now also choose between different models from various providers. Read the info modules at the bottom of the frontpage, for instructions on how to use the app.",
  apiPlaceholder: "Enter OpenAI API Key here",
  keysIoHint: "Export keys to a file and store it securely. Next time, import the file to refill the fields, which saves time and avoids typing. The keys are deleted automatically when you close the webapp/tab, or manually by clicking Clear keys.",
  gdprColumnTitle: "GDPR compliant:",
  gdprColumnFootnote: "(EU data residency/processing + zero data retention + data not used for model traning - assuming correct configuration)",
  nonGdprColumnTitle: "Non-GDPR compliant:",
  nonGdprColumnFootnote: "(Varying degrees of data retention + data processing/residency in US)",
  enterButton: "Enter Transcription Tool",
  guideButton: "API guide - How to use",
  securityButton: "Security",
  aboutButton: "About",
  // Accordion tab #1 (left): AI models
  modelsModalHeading: "AI models",
  modelsModalText: `
<div>
  <p><strong>Model selection in Nordlys Journal</strong></p>
  <p>
    The app lets you choose separate models for <strong>speech-to-text (STT)</strong> and <strong>note generation</strong>.
    The final note depends on both stages: an accurate transcript provides the text model with a better foundation, while a capable
    note model is better able to structure, prioritise and follow the selected prompt.
  </p>

  <hr><br>

  <p><strong>1) Speech-to-text models</strong></p>
  <ul>
    <li><strong>Soniox</strong> – batch or real-time transcription, with optional speaker labels</li>
    <li><strong>OpenAI</strong> – gpt-4o-transcribe</li>
    <li><strong>Mistral</strong> – Voxtral Mini Transcribe</li>
  </ul>

  <p><strong>Practical STT ranking</strong></p>
  <ol>
    <li><strong>Soniox</strong> – the recommended choice. It generally provides excellent transcription quality, supports speaker labels and can use an EU regional endpoint.</li>
    <li><strong>OpenAI gpt-4o-transcribe</strong> – a strong alternative, but the standard API setup does not provide the same straightforward EU-residency path.</li>
    <li><strong>Mistral Voxtral Mini</strong> – an inexpensive European alternative that may be suitable when cost is the main priority.</li>
  </ol>
  <p>
    To keep Soniox audio and transcript content in the EU, use an API key belonging to an EU-region Soniox project and select the EU endpoint in the app.
    Speaker labels can be particularly useful in doctor–patient conversations because they help the note model distinguish between speakers.
  </p>

  <hr><br>

  <p><strong>2) Note-generation providers and models</strong></p>

  <p><strong>Requesty — recommended for new users</strong></p>
  <p>
    Requesty provides access to models from several developers through one API key. The Requesty choices in this app are deliberately limited
    to selected deployments intended for EU processing, no model-training reuse and suitable retention controls.
  </p>
  <ul>
    <li>Claude Opus 5.5</li>
    <li>Claude Sonnet 5</li>
    <li>GPT-6 Sol</li>
    <li>GPT-6 Luna</li>
    <li>GPT-5.6 Sol</li>
    <li>GPT-5.6 Terra</li>
    <li>GPT-5.6 Luna</li>
    <li>GPT-5.5</li>
    <li>GPT-5 Nano</li>
    <li>Gemini 3.8 Flash</li>
    <li>DeepSeek V4 Pro</li>
    <li>DeepSeek V4.1 Flash</li>
    <li>Kimi K3</li>
  </ul>

  <p><strong>Other supported providers</strong></p>
  <ul>
    <li><strong>OpenAI</strong> – GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna and GPT-5 Nano</li>
    <li><strong>AWS Bedrock</strong> – Claude Haiku 4.5, Claude Sonnet 4.5/4.6 and Claude Opus 4.5/4.6/4.7</li>
    <li><strong>Mistral</strong> – Mistral Large</li>
  </ul>

  <p>
    AWS Bedrock is retained for users who already have AWS access or specifically want to manage their own AWS deployment.
    Its setup is considerably more complicated and its available model selection may lag behind the newest releases. It is therefore
    <strong>not the recommended starting point for new users</strong>.
  </p>

  <br>
  <p><strong>Practical Requesty model guide</strong></p>
  <p>This is an opinionated guide for typical note-generation use rather than an objective medical benchmark:</p>
  <ul>
    <li><strong>Maximum quality:</strong> Claude Opus 5.5 and GPT-5.6 Sol</li>
    <li><strong>Strong general-purpose choices:</strong> Claude Sonnet 5, GPT-5.6 Terra, GPT-5.5 and DeepSeek V4 Pro</li>
    <li><strong>Faster/value-oriented choices:</strong> GPT-5.6 Luna, Gemini 3.8 Flash and DeepSeek V4.1 Flash</li>
    <li><strong>Lowest-cost summarisation and preprocessing:</strong> GPT-5 Nano</li>
    <li><strong>Additional alternative:</strong> Kimi K3</li>
  </ul>
  <p>Claude Opus 5.5 supports Low, Medium and High reasoning in the app; the default is Low.</p>
  <p>GPT-6 Sol and GPT-6 Luna support None, Low, Medium and High reasoning in the app; when no reasoning choice is stored, the app defaults to Low.</p>
  <p>DeepSeek V4 Pro and DeepSeek V4.1 Flash support None, Low, High and Max reasoning; the app defaults to Low.</p>
  <p>
    For long source documents, a less expensive model such as GPT-5 Nano can first create a short summary for Supplementary Information.
    A stronger primary model can then generate the final note without receiving the full long document, which may substantially reduce cost.
  </p>

  <hr><br>

  <p><strong>Price versus quality</strong></p>
  <p>
    The strongest models usually cost more per token, but note generation is often still inexpensive compared with subscription-based clinical
    documentation services. The app shows the approximate USD price per one million input and output tokens beside the selected model and,
    when usage data are available, an estimated cost after generation. See the Price section for examples.
  </p>

  <hr><br>

  <p><strong>Recommended setup for new clinical users</strong></p>
  <p>
    The recommended starting point is <strong>Soniox with an EU-region project, EU API key and EU endpoint</strong> for speech-to-text,
    combined with <strong>Requesty</strong> for note generation. This gives high transcription quality and simple access to a curated selection
    of newer note models through one Requesty key.
  </p>
  <p>
    No provider or model makes a workflow automatically GDPR-compliant. Your organisation must still verify the DPA, endpoint and retention settings,
    complete the necessary DPIA/TIA assessments and review every generated note before clinical use. See the Privacy section for details.
  </p>
</div>
`,

  securityModalHeading: "Privacy",
securityModalText: `
<strong>Privacy and data processing</strong><br><br>

This web app is a tool for speech-to-text and note generation. As a healthcare professional and data controller, you are responsible for ensuring that its use complies with applicable regulations, including the GDPR, the Norwegian Health Personnel Act and the Norwegian Code of Conduct for Information Security and Data Protection in the Health and Care Sector (“Normen”).<br><br>
The developer cannot determine whether an individual organisation’s use is lawful. This is not legal advice. Involve your data protection officer or legal adviser when needed.<br><br>

<hr><br>

<strong>1. Recommended setup for new users</strong><br><br>

<strong>Speech-to-text</strong><br>
The recommended solution is Soniox with an EU project, EU API key and EU endpoint. Soniox states that audio and transcription content remains in the selected region when the project’s regional key and the correct API domain are used. Soniox also states that submitted content is not used for model training. Account, billing and usage metadata may nevertheless be processed outside the selected region. When Soniox is used in this app, audio recordings and produced dictations will always be deleted from Soniox’s servers as soon as the transcription job is complete.<br><br>

<strong>Note generation</strong><br>
The recommended solution for new users is Requesty. The app sends Requesty calls through the company’s EU gateway and presents a deliberately curated selection of named model deployments intended for EU data processing, without reuse for model training and with suitable controls for data retention. This provides access to several newer models through a single Requesty API key.<br><br>

The app’s model selection does not by itself activate Zero Data Retention on the Requesty account. Requesty documents that prompt and output logging on self-service plans is enabled by default with 30 days of retention. Logging can and should be disabled per API key, and organisation-wide Zero Data Retention can be requested from Requesty.<br><br>

<hr><br>

<strong>2. How the web app processes data</strong><br><br>

- Audio is recorded and processed temporarily in the browser’s memory.<br>
- The audio is sent encrypted over HTTPS to the selected speech-to-text provider: Soniox, OpenAI or Mistral/Voxtral.<br>
- The transcript is displayed in the selected Workspace in the browser.<br>
- When you generate a note, the transcript, selected prompt and any Supplementary Information are sent to the selected note provider.<br>
- When Requesty is used, the request is sent from the browser to Requesty’s EU gateway, which forwards it to the specifically selected model deployment (ZDR, no model training, with data processing exclusively within the EU).<br>
- The draft note is returned to the browser over an encrypted connection.<br><br>

The web app itself has no application server that stores audio, transcripts or notes. Communication takes place between your own browser and the services you choose.<br><br>

<hr><br>

<strong>3. API keys and login credentials</strong><br><br>

You use your own provider keys or, for AWS Bedrock, your own backend URL and secret. The developer of the web app does not receive these details or the clinical content sent through them.<br><br>

API keys entered on the front page are stored temporarily in the browser’s SessionStorage and are removed when the tab/session is closed or when you select Clear keys. If you export an encrypted backup of the keys, the password is used locally in the browser to encrypt the file before it is saved or uploaded.<br><br>

Treat API keys, backups and passwords as confidential information. Use individual keys, provider spending limits and access restrictions where available, and revoke the key immediately if it may have been exposed.<br><br>

<hr><br>

<strong>4. Provider-specific considerations</strong><br><br>

<strong>Soniox EU</strong><br>
EU data residency requires a Soniox project created in the EU region, the API key belonging to that project and the correct EU endpoint selected in the app. Soniox states that content data then remains in the EU region and is not used for model training. Check retention/deletion practices and enter into the necessary agreement for your organisation.<br><br>

<strong>Requesty</strong><br>
The app uses Requesty’s EU gateway and fixed, curated model routes rather than an unrestricted model picker. Requesty states that prompts and responses are not used for model training. The EU gateway keeps Requesty’s own processing and storage in the EU, while full EU data residency also requires an EU-hosted model deployment. The app is designed to select such deployments, but the user must still check current model details and disable prompt/output logging for the API key or obtain organisation-wide ZDR before identifiable patient information is used.<br><br>

<strong>AWS Bedrock</strong><br>
Bedrock is retained for users who already have AWS access or who prefer their own AWS infrastructure. The solution requires a separate backend and careful regional configuration. It is more complicated and is no longer recommended as the starting point for new users, but it may still suit organisations with an established and approved AWS environment.<br><br>

<strong>Mistral</strong><br>
Mistral provides Voxtral for speech-to-text and Mistral Large for note generation in the app. Check the current operating region, DPA, retention setting and training preference. If the use requires Zero Data Retention, this must be granted, activated and documented before patient information is sent.<br><br>

<strong>OpenAI</strong><br>
OpenAI remains available for direct speech-to-text and note generation. Standard API data is not used for model training by default, but regional processing and retention depend on the product, account and contractual setup. Do not assume that a regular direct API key automatically provides EU-only processing or Zero Data Retention. Check the current terms and carry out the necessary TIA.<br><br>

<hr><br>

<strong>5. Overview of local and external storage</strong><br><br>

<strong>API keys and backend details</strong><br>
- Stored in: the browser’s SessionStorage.<br>
- Duration: until the tab/session is closed or the keys are deleted.<br>
- Access: the user and the current browser session.<br><br>

<strong>Audio during recording</strong><br>
- Stored in: the browser’s memory during recording and processing.<br>
- Duration: temporary; the app does not keep a permanent local audio archive.<br>
- External processing: the selected STT provider receives the audio.<br><br>

<strong>Transcripts, Supplementary Information and generated notes</strong><br>
- Stored in: the active browser tab’s session and its associated Workspace/history functions.<br>
- Duration: normally until the tab/session is closed or the content/history is deleted.<br>
- External processing: relevant text is sent to the selected note provider when generation is started.<br><br>

<strong>Prompts and settings in a Workspace Set</strong><br>
- Prompts and selected settings can be stored locally in the browser.<br>
- Exporting a Workspace Set includes configuration such as order, prompts, selected providers/models and relevant toggles, but not transcripts, Supplementary Information, generated notes, history, audio, API keys or passwords.<br>
- Cloud exports are encrypted in the browser with the selected password. Local JSON exports are readable and must be stored securely.<br><br>

Provider processing and retention are additional to browser storage and must be checked with each service used.<br><br>

<hr><br>

<strong>6. Source code and responsibility</strong><br><br>

The web app’s source code is openly available, and the main application runs in the browser. The developer does not receive clinical text through an application backend. Basic, non-clinical usage statistics may still be collected as described by the website.<br><br>

The generated content is a draft. The healthcare professional is responsible for checking medical accuracy, correcting errors and deciding what is entered into the patient record.
`,


  aboutModalHeading: "About",
  aboutModalText: `This website was created to give healthcare professionals and other users direct access to high-quality speech-to-text and clinical note generation — without unnecessary costs or intermediaries.<br><br>
By using your own API keys for speech-to-text and text-generation providers, you connect directly to the source of the technology. This means you only pay the actual usage cost set by each provider, with no markup or subscription fees from this website.<br><br>
Many existing providers offer similar services but charge significantly more — often many times the real cost of the underlying technology. This platform allows you to use the same models at essentially “wholesale price,” making the cost per consultation extremely low.<br><br>

<strong>Key points:</strong><br>
• No subscription, no account required on this website.<br>
• You pay only the providers directly for what you use (speech-to-text and text generation).<br>
• The website itself is completely free to use.<br><br>
`,

  guideModalHeading: "API key - How to Get",
guideModalText: `
<strong>API keys — getting started</strong><br><br>

The simplest recommended setup for new users is:<br>
1. <strong>Soniox with an EU-region API key</strong> for speech-to-text.<br>
2. <strong>Requesty</strong> for note generation.<br><br>

This gives access to high-quality transcription and a curated selection of newer note models using only two provider accounts. Alternative providers can still be used if your organisation has assessed and approved them.<br><br>

<strong>Speech-to-text options in the app</strong><br>
- Soniox batch transcription<br>
- Soniox batch transcription with Speaker Labels<br>
- Soniox real-time transcription<br>
- OpenAI gpt-4o-transcribe<br>
- Mistral Voxtral Mini Transcribe<br><br>

<strong>Note-generation providers in the app</strong><br>
- Requesty: Claude Opus 5.5, Claude Sonnet 5, GPT-6 Sol, GPT-6 Luna, GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna, GPT-5.5, GPT-5 Nano, Gemini 3.8 Flash, DeepSeek V4 Pro, DeepSeek V4.1 Flash and Kimi K3<br>
- OpenAI: GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna and GPT-5 Nano<br>
- AWS Bedrock: Claude Haiku 4.5, Claude Sonnet 4.5/4.6 and Claude Opus 4.5/4.6/4.7<br>
- Mistral: Mistral Large<br><br>

<hr><br>

<strong>Soniox — recommended speech-to-text setup</strong><br>
1. Create an account at <a href="https://soniox.com" target="_blank" rel="noopener noreferrer">soniox.com</a>.<br>
2. Add billing/credits as required and create a project.<br>
3. For EU data residency, request access to Soniox regional deployments. Soniox's documentation directs users to contact <a href="mailto:support@soniox.com">support@soniox.com</a>.<br>
4. When regional access is enabled, create/select a project in the <strong>European Union</strong> region. The project receives region-specific API keys.<br>
5. Copy the EU-project key and paste it into the <strong>Soniox API key</strong> field on the front page.<br>
6. Select <strong>EU</strong> as the Soniox endpoint in the app. Both the EU project key and the EU endpoint are required for EU content residency.<br><br>

Soniox can be used in batch or real-time mode. Speaker Labels are available for Soniox batch transcription and can help distinguish speakers in a consultation. Read the current <a href="https://soniox.com/docs/data-residency" target="_blank" rel="noopener noreferrer">Soniox data-residency documentation</a> before clinical use.<br><br>

<hr><br>

<strong id="requesty-guide-section">Requesty — recommended note-generation setup</strong><br>
Requesty is an LLM gateway that provides access to models from several developers through one API key. This app sends Requesty calls through the EU gateway and exposes only a curated subset of named deployments intended for EU processing and appropriate privacy controls.<br><br>

To create a key:<br>
1. Go to <a href="https://requesty.ai" target="_blank" rel="noopener noreferrer">requesty.ai</a>, select <strong>Get started</strong> and create an account.<br>
2. Add credits or configure billing in the Requesty dashboard. Any trial credits or promotions may change, so check the current terms in your account.<br>
3. Open <strong>API Keys</strong> and choose <strong>Create API Key</strong>.<br>
4. Give the key a clear name and restrict it to approved models or an appropriate access list when available.<br>
5. Copy the key immediately and store it securely; it may not be displayed again.<br>
6. Paste it into the <strong>Requesty API key</strong> field on the front page.<br><br>

<strong>Important privacy configuration:</strong> Requesty states that it does not train on requests or responses. However, prompt/output logging on self-service plans is documented as enabled by default with 30-day retention. Disable logging for the API key or request organisation-wide Zero Data Retention, and verify the DPA and selected model routes, before using identifiable patient data. See <a href="https://www.requesty.ai/dpa" target="_blank" rel="noopener noreferrer">Requesty's DPA information</a> and <a href="https://docs.requesty.ai/features/eu-routing" target="_blank" rel="noopener noreferrer">EU-routing documentation</a>.<br><br>

<hr><br>

<strong>OpenAI</strong><br>
1. Create an account at <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a>.<br>
2. Configure billing and create an API key.<br>
3. Store the key securely and paste it into the <strong>OpenAI API key</strong> field.<br>
4. The key can be used for OpenAI speech-to-text and the available direct OpenAI note models.<br><br>

Verify the current DPA, retention and regional-processing options before using patient information. A standard API key should not automatically be treated as EU-only or Zero Data Retention.<br><br>

<hr><br>

<strong>Mistral</strong><br>
1. Create an account at <a href="https://console.mistral.ai" target="_blank" rel="noopener noreferrer">console.mistral.ai</a>.<br>
2. Configure billing and create a Mistral API key.<br>
3. Paste the key into the <strong>Mistral API key</strong> field.<br>
4. The key can be used with Voxtral Mini for speech-to-text and Mistral Large for note generation.<br><br>

Verify the current EU-hosting, DPA, retention and model-training settings. Request and document Zero Data Retention if required by your organisation.<br><br>

<hr><br>

<strong>AWS Bedrock — optional setup for existing AWS users</strong><br>
AWS Bedrock is retained for users who already have AWS access or specifically prefer their own AWS infrastructure. The setup requires an AWS account, regional model access and a separately deployed backend URL/secret for this app. It is more complicated and may not offer the newest models as quickly as Requesty, so it is <strong>not recommended as the normal starting point for new users</strong>.<br><br>

If you choose Bedrock, use the <a href="#" data-open-guide="bedrock"><strong>Guide</strong></a> link beside the AWS Bedrock fields on the front page. Verify the selected AWS region, model access, IAM permissions, logging, retention and organisational agreements before clinical use.<br><br>

<hr><br>

<strong>Before entering patient information</strong><br>
An API key alone does not make a service GDPR-compliant. Confirm the provider's DPA, subprocessors, endpoint, data residency, retention/ZDR and training settings; complete the necessary DPIA/TIA; protect the credentials; minimise submitted patient information; and verify every generated note.
`,

  priceButton: "Price",
  priceModalHeading: "Price",
priceModalText: `
<div>
  <p><strong>Cost Information</strong></p>

  <p>
    This app has no subscription fee or markup. You pay the selected providers directly for actual API usage.
    Prices can change, so the figures below are approximate examples. The provider's dashboard and invoice are authoritative.
  </p>

  <p><strong>Live price information in the app</strong></p>
  <ul>
    <li>The approximate USD price per one million input and output tokens is shown beside the selected note model.</li>
    <li>After note generation, the app shows token usage and an estimated price when the provider returns sufficient usage information.</li>
    <li>Reasoning tokens, caching, discounts, gateway fees, exchange rates and provider-specific billing rules can affect the final amount.</li>
  </ul>

  <hr><br>

  <p><strong>1. Speech-to-text</strong><br>(approximate price per minute of audio)</p>

  <p><strong>Soniox — recommended</strong><br>
  Approximately 0.0017 USD per minute.<br>
  A 15-minute consultation: approximately 0.026 USD.</p>

  <p><strong>OpenAI — gpt-4o-transcribe</strong><br>
  Approximately 0.006 USD per minute.<br>
  A 15-minute consultation: approximately 0.09 USD.</p>

  <p><strong>Mistral — Voxtral Mini Transcribe</strong><br>
  Pricing may vary by the current API offering. Check Mistral's official pricing and the estimate shown by the provider.</p>

  <hr><br>

  <p><strong>2. Note generation</strong><br>(USD per one million input/output tokens)</p>

  <p><strong>Requesty models currently configured in the app</strong></p>
  <ul>
    <li>Claude Opus 5.5: approximately 4.40 / 22.00 USD</li>
    <li>Claude Sonnet 5: approximately 2.20 / 11.00 USD</li>
    <li>GPT-6 Sol: approximately 2.40 / 12.00 USD</li>
    <li>GPT-6 Luna: approximately 0.12 / 0.60 USD</li>
    <li>GPT-5.6 Sol: approximately 4.40 / 22.00 USD</li>
    <li>GPT-5.6 Terra: approximately 2.20 / 13.20 USD</li>
    <li>GPT-5.6 Luna: approximately 0.22 / 1.32 USD</li>
    <li>GPT-5.5: approximately 5.00 / 30.00 USD</li>
    <li>GPT-5 Nano: approximately 0.055 / 0.44 USD</li>
    <li>Gemini 3.8 Flash: approximately 0.825 / 4.125 USD (current 50% endpoint discount)</li>
    <li>DeepSeek V4 Pro: approximately 1.75 / 3.50 USD (cached input: 0.44 USD)</li>
    <li>DeepSeek V4.1 Flash: approximately 0.50 / 1.50 USD (cached input: 0.05 USD)</li>
    <li>Kimi K3: approximately 3.00 / 15.00 USD</li>
  </ul>
  <p>
    These values mirror the estimates configured in the app and can change when Requesty or the upstream deployment changes its pricing.
    Check the price displayed beside the model and Requesty's actual usage report.
  </p>

  <p><strong>Other supported note providers</strong></p>
  <ul>
    <li><strong>OpenAI:</strong> direct GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna and GPT-5 Nano models.</li>
    <li><strong>AWS Bedrock:</strong> Claude Haiku, Sonnet and Opus models. Retained mainly for existing AWS users.</li>
    <li><strong>Mistral:</strong> Mistral Large.</li>
  </ul>
  <p>Current per-model input/output prices are shown beside the selected model in the app.</p>

  <hr><br>

  <p><strong>3. What are tokens?</strong></p>
  <p>Text models count tokens rather than words. As a rough English-language rule:</p>
  <ul>
    <li>1 token is approximately 4 characters or three quarters of a word.</li>
    <li>100 tokens are approximately 75 words.</li>
    <li>1,000 tokens are approximately 750 words.</li>
  </ul>
  <p>
    Medical terminology, Norwegian text, formatting and long prompts can change this ratio. Input tokens include the prompt, transcript,
    Supplementary Information and other context sent to the model. Output tokens are the generated note and any billable reasoning/output reported by the provider.
  </p>

  <hr><br>

  <p><strong>4. Example consultation</strong></p>
  <p>
    A 15-minute consultation might use approximately 2,200 input tokens and 450 output tokens for the primary note.
    The actual amount depends heavily on transcript length, prompt size, Supplementary Information and reasoning level.
  </p>
  <ul>
    <li><strong>Soniox transcription:</strong> approximately 0.026 USD.</li>
    <li><strong>GPT-5 Nano note:</strong> approximately 0.0003 USD at the example token count.</li>
    <li><strong>Gemini 3.8 Flash note:</strong> approximately 0.004 USD.</li>
    <li><strong>Claude Sonnet 5 note:</strong> approximately 0.010 USD.</li>
    <li><strong>Claude Opus 5.5 note:</strong> approximately 0.020 USD.</li>
    <li><strong>GPT-5.6 Sol note:</strong> approximately 0.020 USD.</li>
  </ul>
  <p>
    In normal short consultations, speech-to-text may still represent a large share of the total cost. With very long Supplementary Information,
    however, note-generation input cost can become more important.
  </p>

  <hr><br>

  <p><strong>5. Reducing the cost of long documents</strong></p>
  <p>
    If you have a long document, the Secondary Note Generation module can use a less expensive model—such as GPT-5 Nano—to create a shorter summary.
    That summary can be inserted into Supplementary Information before the stronger primary model creates the final note. This can be much cheaper
    than repeatedly sending, for example, 50 pages directly to a high-cost model.
  </p>

  <hr><br>

  <p><strong>6. Example monthly use</strong></p>
  <p>
    At 20 consultations per day, 4 days per week and 4 weeks per month, the total is approximately 320 consultations.
    With 15-minute consultations, that is about 80 hours of audio. At approximately 0.0017 USD per minute, Soniox transcription would be around
    8.16 USD before any taxes or pricing changes. Note generation is added according to the selected model and the actual token usage.
  </p>
  <p>
    There is no fixed app subscription. If you do not use the APIs, no usage cost is generated by this app. Provider account minimums, prepaid credits,
    taxes or other provider-specific terms may still apply.
  </p>
</div>
`,

};

export const transcribeTranslations = {
  pageTitle: "Transcription Tool",
  openaiUsageLinkText: "Cost Usage Overview",
  openaiWalletLinkText: "Wallet Balance",
  btnFunctions: "Functions",
  btnGuide: "Guide",
  btnNews: "Status & Updates",
  priceOverlay: {
    button: "Prices",
    heading: "Prices",
    intro: "Current prices for the models available in this app.",
    textModels: "Text models",
    speechToText: "Speech-to-text",
    model: "Model",
    context: "Context",
    input: "Input / 1M",
    output: "Output / 1M",
    billing: "Billing",
    price: "Price",
    audioDuration: "Audio duration",
    tokenBased: "Token-based",
    perMinute: "/ min",
    perHour: "/ hour",
    approx: "approx.",
    close: "Close",
    contextNote: "Context is the maximum published context window for the configured model or route.",
    requestyNote: "Requesty prices match the exact routes configured in this app. Any account-level Requesty markup is not included.",
    sttNote: "Speech-to-text prices are current public pay-as-you-go rates. Soniox is token-billed; the per-minute figures shown are approximate equivalents derived from Soniox's published hourly rates.",
  },
  backToHome: "Back to frontpage",
  recordingAreaTitle: "Recording Area",
  recordTimer: "Recording Timer: 0 sec",
  transcribeTimer: "Completion Timer: 0 sec",
  transcriptionPlaceholder: "Transcription result will appear here...",
  supplementaryInfoPlaceholder: "Supplementary information (optional)",
  startButton: "Start Recording",
  readFirstText: "Read first! ➔",
  stopButton: "Stop/Complete",
  pauseButton: "Pause Recording",
  statusMessage: "Welcome! Click \"Start Recording\" to begin.",
  noteGenerationTitle: "Note Generation",
  generateNoteButton: "Generate Note",
  noteTimer: "Completion Timer: 0 sec",
  generatedNotePlaceholder: "Generated note will appear here...",
  customPromptTitle: "Custom Prompt",
  promptExportButton: "Export",
  promptImportButton: "Import",
  promptSlotLabel: "Prompt Slot:",
  customPromptPlaceholder: "Enter custom prompt here",
  guideHeading: "Guide & Instructions",
guideText: `Welcome to <strong>Nordlys Journal</strong>. The app can record and transcribe conversations and use the finished text to generate a note. Always obtain any required consent before recording, and always review clinical content before use.<br><br>

<strong>Recommended browser:</strong> Google Chrome provides the most reliable support for all app features.<br><br>

<strong>Quick start</strong><br>
<ol>
  <li>Select a Workspace, transcription provider and any required settings.</li>
  <li>Select <strong>Start Recording</strong>. Use <strong>Pause</strong>, <strong>Resume</strong>, <strong>Stop/Complete</strong> or <strong>Abort</strong> as needed.</li>
  <li>Select the prompt, provider and model for the note, then select <strong>Generate Note</strong>. You can also enable Auto-generate.</li>
</ol>

<details open>
  <summary><strong>Recording and transcription</strong></summary>
  <ul>
    <li>Select the speech-to-text provider before recording. Google Chrome or Microsoft Edge is recommended.</li>
    <li><strong>Pause</strong> completes the current audio segment and lets you resume later. <strong>Stop/Complete</strong> ends the recording and waits for the remaining transcript. <strong>Abort</strong> discards the active recording without normal completion.</li>
    <li><strong>Speaker Labels</strong> is available only with Soniox. It attempts to identify who is speaking, for example Speaker 1 and Speaker 2.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Workspaces and Workspace Sets</strong></summary>
  <ul>
    <li>A <strong>Workspace</strong> is a separate work area within the browser tab. Each Workspace has its own text, selected prompts, providers, models, settings and active processes. Cloned Workspaces share history with their clone family; Workspaces added with + have separate history. Switching Workspaces does not stop recording or generation.</li>
    <li>The name normally follows the selected prompt-slot label. Use <strong>+</strong> to add and <strong>×</strong> to close a Workspace. Up to 12 Workspaces can be open.</li>
    <li>All open Workspaces form a <strong>Workspace Set</strong>. Import and export are available through a local JSON file, Microsoft OneDrive or Google Drive.</li>
    <li>A Workspace Set stores the number and order of Workspaces, names, selected prompt slots with prompt text and labels, providers, models, reasoning selections, relevant checkboxes and open modules. It does not include transcripts, supplementary information, notes, history, audio, API keys, passwords or other patient information.</li>
    <li>Cloud backups are encrypted in the browser with your chosen password. Local JSON files are readable and must be stored securely.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Mini Panel</strong></summary>
  <ul>
    <li><strong>Google Chrome is recommended for the Mini Panel.</strong> Other browsers may not work properly with this function.</li>
    <li>Open it with the <strong>Mini-panel</strong> button. The icon in the upper-right corner switches between its two views.</li>
    <li><strong>Mini Panel — Browser Tabs</strong> controls separate Nordlys Journal tabs. This is useful when you want one Workspace per browser tab.</li>
    <li><strong>Mini Panel — Workspaces</strong> shows every Workspace in the selected Nordlys Journal tab. This is useful when you want several work areas in one tab.</li>
    <li>You can switch view or Workspace while recordings and generation continue in the background.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Auto-generate, Auto-copy and primary note generation</strong></summary>
  <ul>
    <li><strong>Auto-generate</strong> starts note generation automatically when transcription finishes. When it is off, use <strong>Generate Note</strong> manually.</li>
    <li><strong>Auto-copy</strong> can automatically copy the completed transcript or completed note. It requires the companion Chrome extension. Manual copy buttons work independently.</li>
    <li>The primary note uses the transcript, any selected prompt and the text in <strong>Supplementary Information</strong>. Select the provider, model and reasoning level, when available, before generation.</li>
    <li>AI-generated notes can contain errors or omit information. Always review and validate a note before saving or sending it.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Secondary Note Generation</strong></summary>
  <p>This module is useful when a long document should be shortened first. Paste the text into the source field, select a separate prompt and model, and generate a summary. The result can be copied automatically or manually to <strong>Supplementary Information</strong>.</p>
  <p>For example, you can use an inexpensive model such as GPT-5 Nano through Requesty to summarize a 50-page document. The primary model, such as GPT-5.6 Sol or Claude Opus 5.5, then receives the short summary with the transcript instead of the entire document. This can substantially reduce token use and cost. Review the summary before using it as clinical context.</p>
</details><br>

<details>
  <summary><strong>Price and token use</strong></summary>
  <ul>
    <li>When pricing data is available, the selected model shows its USD price per one million input and output tokens.</li>
    <li>After note generation, token use and an estimated price are shown when the provider response contains the required usage data. Some providers may report a more precise cost.</li>
    <li><strong>Cost Usage Overview</strong> opens links to the providers' own usage and billing pages. Prices shown in the app are estimates; the provider's billing is authoritative.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Prompt slots, history, Redactor and OCR</strong></summary>
  <ul>
    <li>There are 20 prompt slots. They are remembered in this browser and can be imported or exported as JSON or as encrypted backups through OneDrive and Google Drive.</li>
    <li>The history column shows the 30 most recent completed primary note generations in the active Workspace. Select an item to view the transcript, supplementary information and generated note. Cloned Workspaces share history with their clone family; other Workspaces have separate history.</li>
    <li><strong>Redactor</strong> can remove selected General and Specific terms from the transcript and supplementary information. Always inspect the result before sending the text.</li>
    <li><strong>OCR</strong> can extract text from a pasted screenshot or image file and send it to the Specific terms list or the raw-text field.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Storage and privacy</strong></summary>
  <ul>
    <li>Working text and Workspace history remain in the current browser-tab session and are removed when that tab session ends. <strong>Clear</strong> can be used to remove active content or history.</li>
    <li>API keys are not placed in localStorage. They are kept only for the active browser session and can be cleared manually from the front page.</li>
    <li>Data is sent to the provider and region you select. Storage, data processing and any use of data depend on the selected provider, account, configuration and current terms. Confirm that the setup is suitable for the information you process.</li>
  </ul>
</details><br><br>

Select <strong>Guide</strong> again or use the close button to return to the main view.
`,

  // Redactor
  showRedactor: "Show redactor",
  hideRedactor: "Hide redactor",
  redactorTitle: "Redactor",
  redactorHelp: "Add one term per line. Both General and Specific terms are used when you click Redact. General terms stay available while this tab is open, but are cleared when the tab is closed.",
  redactorGeneralTermsLabel: "General terms",
  redactorGeneralTermsPlaceholder: "General terms, 1 per line",
  redactorSpecificTermsLabel: "Specific terms",
  redactorSpecificTermsPlaceholder: "Specific terms, 1 per line",
  redactorButton: "Redact",
  redactorBirthdateHelperLabel: "Birthdate helper",
  redactorBirthdateHelperPlaceholder: "e.g. 01011990",
  redactorAddDatesButton: "Add dates",
  redactorClearGeneralButton: "Clear general",
  redactorClearSpecificButton: "Clear specific",
  redactorImportGeneralButton: "Import General.txt",
  redactorExportGeneralButton: "Export General.txt",
  redactorOcrTitle: "OCR helper (paste/upload image)",
  redactorOcrHelp: "Use Windows + Shift + S, then click Paste image. You can also press Ctrl + V while the image area is focused, or upload an image file.",
  redactorPasteImageButton: "Paste image",
  redactorUploadImageButton: "Upload image",
  redactorClearImageButton: "Clear image",
  redactorFetchOcrSpecificButton: "Fetch OCR → Specific",
  redactorFetchOcrRawButton: "Fetch OCR → Raw text",
  redactorImageAlt: "Pasted screenshot preview",
  redactorImagePlaceholder: "No image loaded yet. Paste a screenshot here or upload an image.",
  redactorRawTextLabel: "OCR raw text",
  redactorRawTextPlaceholder: "Raw OCR text will appear here…",
  redactorCopyRawButton: "Copy raw",
  redactorClearRawButton: "Clear raw",

  // Redactor runtime messages
  redactorStatusGeneralCleared: "General terms cleared.",
  redactorStatusSpecificCleared: "Specific terms and birthdate cleared.",
  redactorStatusAddTermsFirst: "Add at least one General or Specific term to redact.",
  redactorStatusRawCopied: "Raw text copied to clipboard.",
  redactorStatusNoImage: "No image to OCR. Paste or upload one first.",
  redactorStatusOcrRunning: "OCR running…",
  redactorStatusOcrLoading: "OCR is loading language data…",
  redactorStatusOcrStarting: "OCR is starting…",

  // Secondary Note Generator
  secondaryNote: {
    showButton: "Show secondary note generator",
    hideButton: "Hide secondary note generator",
    title: "Secondary Note Generator",
    sourceLabel: "Source text",
    sourcePlaceholder: "Paste or type source text here...",
    providerLabel: "Provider:",
    modelLabel: "Model:",
    modeLabel: "Mode:",
    reasoningLabel: "Reasoning effort:",
    thinkingLabel: "Thinking level:",
    promptLabel: "Prompt:",
    generateButton: "Generate Note",
    abortButton: "Abort",
    copyButton: "Copy",
    copiedButton: "Copied",
    pushButton: "Insert",
    clearOnGenerateLabel: "Clear Supplementary Information on Generate",
    autoTransferLabel: "Automatically copy result to Supplementary Information",
    sourceDateLabel: "Date",
    sourceDateToggleAriaLabel: "Keep today's date in source text",
    sourceDateHelp: 'When ON: Keeps the line "Dagens dato er DD.MM.YYYY" at the top of the source text and restores it after refresh. When OFF: Removes that date line from the source text.',
    outputPlaceholder: "Generated note will appear here...",
    timerLabel: "Note Generation Timer",
    statusGenerating: "Generating…",
    statusCompleted: "Text generation completed!",
    statusFailed: "Generation failed",
    statusAborted: "Note generation aborted.",
    noSourceText: "No source text",
    noPromptSelected: "No prompt selected",
    noOutputToPush: "No note to copy over yet",
    transferred: "Result copied to Supplementary Information."
  },
};

export default { indexTranslations, transcribeTranslations };
