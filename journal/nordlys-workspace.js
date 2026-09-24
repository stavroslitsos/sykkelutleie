function configure(){
 document.title='Nordlys Journal · Arbeidsrom';
 const back=document.getElementById('backToHomeButton');if(back)back.textContent='Nøkler og oppsett';
 // Keep local import/export while making unconfigured cloud choices unambiguous.
 for(const el of document.querySelectorAll('button[id*="OneDrive"],button[id*="GoogleDrive"]')){el.disabled=true;el.title='Bruk lokal JSON-fil. Skykopi krever eget oppsett.';}
 for(const el of document.querySelectorAll('option')){if(/GDPR/i.test(el.textContent))el.textContent=el.textContent.replace(/\s*\([^)]*GDPR[^)]*\)/gi,'');}
 const guide=document.getElementById('guideText');if(guide&&!guide.querySelector('.nordlys-local-note')){const note=document.createElement('p');note.className='nordlys-local-note';note.textContent='Nordlys Journal 0.1: Bruk lokale JSON-filer for å flytte maler og arbeidsoppsett. Skykopi er ikke satt opp. Auto-copy krever en separat utvidelse; manuell kopiering er tilgjengelig.';guide.prepend(note);}
}
configure();window.addEventListener('transcribe-language-updated',configure);window.addEventListener('load',configure);
// Cloud actions are also blocked at the exported integration boundary.
document.addEventListener('click',event=>{const button=event.target.closest('button');if(button&&/OneDrive|GoogleDrive/.test(button.id)){event.preventDefault();event.stopImmediatePropagation();}},true);
// Optional WebMCP: expose only non-sensitive UI state and a navigation action.
if(document.modelContext?.registerTool){
 const lifetime=new AbortController();
 const tools=[{name:'read_workspace_configuration',title:'Les arbeidsromsoppsett',description:'Returnerer valgte leverandører og modell, uten nøkler, transkripsjon eller journalinnhold.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).length)throw new Error('Ingen argumenter forventet.');return{transcriptionProvider:document.getElementById('transcribeProvider')?.value,noteProvider:document.getElementById('noteProvider')?.value,model:document.getElementById('openaiModel')?.value};}},{name:'open_workspace_guide',title:'Åpne veiledning',description:'Åpner veiledningen i arbeidsrommet. Starter ikke opptak eller generering.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||Object.keys(input).length)throw new Error('Ingen argumenter forventet.');document.getElementById('btnGuide')?.click();return{opened:true};}}];
 for(const tool of tools){try{Promise.resolve(document.modelContext.registerTool(tool,{signal:lifetime.signal})).catch(()=>{});}catch{}}
 window.addEventListener('pagehide',()=>lifetime.abort(),{once:true});
}
