import { encryptKeys, decryptKeys } from './nordlys-crypto.js';
import { PromptManager } from './js/promptManager.js';
const fields = {soniox_api_key:'soniox-key',openai_api_key:'openai-key',mistral_api_key:'mistral-key',requesty_api_key:'requesty-key',bedrock_backend_url:'bedrock-url',bedrock_backend_secret:'bedrock-secret'};
const $ = id => document.getElementById(id);
const status = message => { $('setup-status').textContent=message; };
for (const [key,id] of Object.entries(fields)) $(id).value=sessionStorage.getItem(key)||'';
$('soniox-region').value=sessionStorage.getItem('soniox_region')||'eu';
if (!localStorage.getItem('siteLanguage')) localStorage.setItem('siteLanguage','no');
function values(){return Object.fromEntries(Object.entries(fields).map(([key,id])=>[key,$(id).value.trim()]));}
function persist(){
 for(const [key,value] of Object.entries(values())) {if(value)sessionStorage.setItem(key,value);else sessionStorage.removeItem(key);}
 sessionStorage.setItem('soniox_region',$('soniox-region').value);
 // The active recording adapter reads user_api_key; main.js updates it from its provider selection.
 sessionStorage.setItem('user_api_key',$('soniox-key').value.trim());
}
$('setup-form').addEventListener('submit',event=>{event.preventDefault();persist();location.href='./transcribe.html';});
for (const button of document.querySelectorAll('[data-reveal]')) button.addEventListener('click',()=>{const input=$(button.dataset.reveal);input.type=input.type==='password'?'text':'password';button.textContent=input.type==='password'?'Vis':'Skjul';button.setAttribute('aria-label',`${button.textContent} ${button.dataset.reveal.startsWith('soniox')?'Soniox':'OpenAI'}-nøkkel`);});
$('clear-keys').addEventListener('click',()=>{if(!confirm('Tømme nøklene i denne faneøkten? Sikkerhetskopier påvirkes ikke.'))return;for(const[key,id]of Object.entries(fields)){sessionStorage.removeItem(key);$(id).value='';}sessionStorage.removeItem('user_api_key');status('Nøklene er tømt.');});
function fill(data){const raw=data?.data||data;if(!raw||typeof raw!=='object'||!Object.keys(fields).some(key=>typeof raw[key]==='string'))throw new Error('Filen inneholder ingen gjenkjennelige API-nøkler.');for(const[key,id]of Object.entries(fields)){if(typeof raw[key]==='string')$(id).value=raw[key];}status('Nøkkelfeltene er fylt. Kontroller dem og åpne arbeidsrommet.');}
let pending=null;
function openBackup(mode){$('backup-form').reset();$('backup-error').textContent='';$('backup-confirm-wrap').hidden=mode==='import';$('backup-confirm').required=mode==='export';$('backup-password').minLength=mode==='export'?12:1;$('backup-title').textContent=mode==='export'?'Kryptert sikkerhetskopi':'Åpne kryptert nøkkelfil';$('backup-description').textContent=mode==='export'?'Velg minst 12 tegn. Passordet følger ikke med filen og kan ikke gjenopprettes.':'Skriv inn passordet du brukte da nøkkelfilen ble laget.';$('backup-submit').textContent=mode==='export'?'Last ned kryptert fil':'Åpne fil';$('backup-dialog').dataset.mode=mode;$('backup-dialog').showModal();}
$('export-keys').addEventListener('click',()=>{if(!Object.values(values()).some(Boolean)){status('Legg inn minst én nøkkel først.');return;}openBackup('export');});
$('import-keys').addEventListener('click',()=>$('key-file').click());
$('key-file').addEventListener('change',async()=>{try{const file=$('key-file').files[0];if(!file)return;if(file.size>1000000)throw new Error('Nøkkelfilen er for stor.');const data=JSON.parse(await file.text());if(data.format==='nordlys.keys.v1'){pending=data;openBackup('import');}else fill(data);}catch{status('Kunne ikke lese nøkkelfilen. Bruk JSON fra originalen eller en kryptert Nordlys-fil.');}finally{$('key-file').value='';}});
$('backup-cancel').addEventListener('click',()=>$('backup-dialog').close());
$('backup-dialog').addEventListener('close',()=>{$('backup-form').reset();pending=null;});
$('backup-form').addEventListener('submit',async event=>{event.preventDefault();const pass=$('backup-password').value;const exporting=$('backup-dialog').dataset.mode==='export';$('backup-error').textContent='';if(exporting&&pass!==$('backup-confirm').value){$('backup-error').textContent='Passordene er ikke like.';return;}$('backup-submit').disabled=true;try{if(exporting){const payload=await encryptKeys(values(),pass);const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='nordlys-nokler-kryptert.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);status('Kryptert nøkkelfil er lastet ned.');}else{fill(await decryptKeys(pending,pass));}$('backup-dialog').close();}catch{$('backup-error').textContent='Kunne ikke behandle filen. Kontroller passord og filformat.';}finally{$('backup-submit').disabled=false;}});
// Only initialize empty slots. Never replace the user's imported prompt library.
if(!localStorage.getItem('nordlys_prompt_seeded')){
 PromptManager.setPromptProfileId('default');
 const base='Skriv et presist norsk journalutkast basert bare på opplysningene i transkripsjonen og supplerende informasjon. Ikke legg til undersøkelser, negative funn, diagnoser, behandlinger eller samtykke som ikke er nevnt. Ved uklarhet, marker hva som må avklares. Bruk Pas som forkortelse. ';
 const seeds=[['Undersøkelse',base+'Struktur: Kort oversikt, Aktuelt/anamnese, Undersøkelse, Vurdering, Plan og tiltak. Ta med ultralydfunn bare når de er nevnt.'],['Behandling',base+'Struktur: Status siden sist, Utført behandling, Øvelser og dosering, Respons og videre plan.'],['Epikrise',base+'Struktur: Bakgrunn, Funn, Behandlingsforløp, Status og videre oppfølging.'],['Henvisning',base+'Struktur: Problemstilling, Relevant anamnese, Kliniske funn, Tidligere tiltak og ønsket vurdering.']];
 seeds.forEach(([name,prompt],i)=>{const slot=String(i+1);if(!PromptManager.getPrompt(slot)){PromptManager.savePrompt(slot,prompt);PromptManager.setSlotDisplayName(slot,name,'default');}});
 localStorage.setItem('nordlys_prompt_seeded','1');
}
