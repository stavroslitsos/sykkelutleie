// js/language-it.js

export const indexTranslations = {
  pageTitle: "Nordlys Journal",
  headerTitle: "Nordlys Journal",
  headerSubtitle: "Trascrizioni e generazione di note per consultazioni sanitarie avanzate, alimentate da intelligenza artificiale",
  startText: "Per iniziare, inserisci la tua chiave API di OpenAI:",
  apiPlaceholder: "Inserisci qui la chiave API",
  enterButton: "Accedi allo strumento di trascrizione",
  guideButton: "Guida API - Come utilizzare",
  securityButton: "Sicurezza",
  aboutButton: "Informazioni",
  // Accordion tab #1 (left): AI models
  modelsModalHeading: "Modelli di IA",
  modelsModalText: `
<div>
  <p><strong>Scelta dei modelli in Nordlys Journal</strong></p>
  <p>L’app consente di scegliere separatamente i modelli per <strong>speech-to-text (STT)</strong> e <strong>generazione della nota</strong>. Una trascrizione accurata offre una base migliore; un modello di nota potente struttura e prioritizza meglio il contenuto e segue meglio il prompt selezionato.</p>

  <hr><br>
  <p><strong>1) Modelli speech-to-text</strong></p>
  <ul>
    <li><strong>Soniox</strong> – trascrizione batch o in tempo reale, con etichette dei parlanti facoltative</li>
    <li><strong>OpenAI</strong> – gpt-4o-transcribe</li>
    <li><strong>Mistral</strong> – Voxtral Mini Transcribe</li>
  </ul>
  <p><strong>Classifica STT pratica</strong></p>
  <ol>
    <li><strong>Soniox</strong> – consigliato: qualità eccellente, etichette dei parlanti ed endpoint regionale UE.</li>
    <li><strong>OpenAI gpt-4o-transcribe</strong> – ottima alternativa, ma la configurazione standard non offre lo stesso percorso semplice per la residenza dei dati nell’UE.</li>
    <li><strong>Mistral Voxtral Mini</strong> – alternativa europea economica quando il costo è prioritario.</li>
  </ol>
  <p>Per mantenere nell’UE audio e trascrizione con Soniox, usa una chiave appartenente a un progetto Soniox nella regione UE e seleziona l’endpoint UE nell’app. Le etichette aiutano il modello di nota a distinguere i partecipanti.</p>

  <hr><br>
  <p><strong>2) Provider e modelli per la generazione delle note</strong></p>
  <p><strong>Requesty — consigliato ai nuovi utenti</strong></p>
  <p>Requesty offre, con una sola chiave API, modelli di più sviluppatori. L’app limita intenzionalmente la scelta a deployment selezionati, destinati all’elaborazione nell’UE, senza riutilizzo per l’addestramento e con controlli di conservazione appropriati.</p>
  <ul>
    <li>Claude Opus 5.5</li><li>Claude Sonnet 5</li><li>GPT-6 Sol</li><li>GPT-6 Luna</li><li>GPT-5.6 Sol</li><li>GPT-5.6 Terra</li><li>GPT-5.6 Luna</li><li>GPT-5.5</li><li>GPT-5 Nano</li><li>Gemini 3.8 Flash</li><li>DeepSeek V4 Pro</li><li>DeepSeek V4.1 Flash</li><li>Kimi K3</li>
  </ul>
  <p><strong>Altri provider supportati</strong></p>
  <ul>
    <li><strong>OpenAI</strong> – GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna e GPT-5 Nano</li>
    <li><strong>AWS Bedrock</strong> – Claude Haiku 4.5, Claude Sonnet 4.5/4.6 e Claude Opus 4.5/4.6/4.7</li>
    <li><strong>Mistral</strong> – Mistral Large</li>
  </ul>
  <p>AWS Bedrock resta disponibile per chi ha già accesso AWS o vuole gestire la propria infrastruttura. La configurazione è più complessa e i modelli più recenti possono arrivare in ritardo. Non è quindi <strong>il punto di partenza consigliato ai nuovi utenti</strong>.</p>

  <p><strong>Guida pratica ai modelli Requesty</strong></p>
  <ul>
    <li><strong>Qualità massima:</strong> Claude Opus 5.5 e GPT-5.6 Sol</li>
    <li><strong>Ottime scelte generali:</strong> Claude Sonnet 5, GPT-5.6 Terra, GPT-5.5 e DeepSeek V4 Pro</li>
    <li><strong>Velocità e convenienza:</strong> GPT-5.6 Luna, Gemini 3.8 Flash e DeepSeek V4.1 Flash</li>
    <li><strong>Riepilogo/pre-elaborazione al minor costo:</strong> GPT-5 Nano</li>
    <li><strong>Altra alternativa:</strong> Kimi K3</li>
  </ul>
  <p>Claude Opus 5.5 supporta nell’app i livelli di reasoning Low, Medium e High; il valore predefinito è Low.</p>
  <p>GPT-6 Sol e GPT-6 Luna supportano nell’app i livelli di reasoning None, Low, Medium e High; se non è salvata una scelta precedente, il valore predefinito è Low.</p>
  <p>DeepSeek V4 Pro e DeepSeek V4.1 Flash supportano i livelli di reasoning None, Low, High e Max; l’app usa Low come valore predefinito.</p>
  <p>Per documenti lunghi, un modello economico come GPT-5 Nano può creare prima un breve riepilogo per le Informazioni supplementari. Il modello principale più potente genera poi la nota senza ricevere l’intero documento, riducendo sensibilmente il costo.</p>

  <hr><br>
  <p><strong>Prezzo e qualità</strong></p>
  <p>I modelli più potenti in genere costano di più per token. L’app mostra il prezzo USD approssimativo per un milione di token input/output vicino al modello selezionato e, quando disponibili dati di utilizzo, una stima dopo la generazione.</p>

  <hr><br>
  <p><strong>Configurazione consigliata ai nuovi utenti clinici</strong></p>
  <p>La scelta iniziale consigliata è <strong>Soniox con progetto UE, chiave API UE ed endpoint UE</strong> per STT, insieme a <strong>Requesty</strong> per le note.</p>
  <p>Nessun provider rende automaticamente conforme al GDPR un flusso di lavoro. L’organizzazione deve verificare DPA, endpoint e conservazione, completare DPIA/TIA e controllare ogni nota prima dell’uso clinico.</p>
</div>
`,

  securityModalHeading: "Privacy",
  securityModalText: `
<strong>Privacy e trattamento dei dati</strong><br><br>

Questa web app è uno strumento per speech-to-text e generazione di note. Come professionista sanitario e titolare del trattamento, sei responsabile di garantire che l’uso sia conforme alle normative applicabili, tra cui il GDPR, la legge norvegese sul personale sanitario e la Norma norvegese per la sicurezza delle informazioni nel settore sanitario e assistenziale.<br><br>
Lo sviluppatore non può stabilire se l’uso da parte di una singola organizzazione sia legittimo. Questa non è una consulenza legale. Coinvolgi il responsabile della protezione dei dati o un consulente legale quando necessario.<br><br>

<hr><br>

<strong>1. Configurazione consigliata per i nuovi utenti</strong><br><br>

<strong>Speech-to-text</strong><br>
La soluzione consigliata è Soniox con progetto UE, chiave API UE ed endpoint UE. Soniox dichiara che il contenuto audio e delle trascrizioni rimane nella regione selezionata quando si utilizzano la chiave regionale del progetto e il dominio API corretto. Soniox dichiara inoltre che il contenuto inviato non viene utilizzato per l’addestramento dei modelli. I metadati relativi ad account, fatturazione e utilizzo possono tuttavia essere trattati al di fuori della regione selezionata. Quando Soniox viene utilizzato in questa app, le registrazioni audio e i dettati prodotti vengono sempre eliminati dai server di Soniox non appena il processo di trascrizione è completato.<br><br>

<strong>Generazione di note</strong><br>
La soluzione consigliata per i nuovi utenti è Requesty. L’app invia le chiamate Requesty attraverso il gateway UE dell’azienda e mostra una selezione deliberatamente curata di deployment di modelli denominati, destinati al trattamento dei dati nell’UE, senza riutilizzo per l’addestramento dei modelli e con adeguate possibilità di controllo della conservazione dei dati. Ciò consente di accedere a diversi modelli più recenti tramite un’unica chiave API Requesty.<br><br>

La selezione del modello nell’app non attiva di per sé Zero Data Retention nell’account Requesty. Requesty documenta che la registrazione di prompt e output negli abbonamenti self-service è attivata per impostazione predefinita con una conservazione di 30 giorni. La registrazione può e deve essere disattivata per ciascuna chiave API ed è possibile richiedere a Requesty Zero Data Retention per l’intera organizzazione.<br><br>

<hr><br>

<strong>2. Come la web app tratta i dati</strong><br><br>

- L’audio viene registrato e trattato temporaneamente nella memoria del browser.<br>
- L’audio viene inviato in forma cifrata tramite HTTPS al provider speech-to-text selezionato: Soniox, OpenAI o Mistral/Voxtral.<br>
- La trascrizione viene visualizzata nel Workspace selezionato nel browser.<br>
- Quando generi una nota, la trascrizione, il prompt selezionato e le eventuali Informazioni supplementari vengono inviati al provider di note selezionato.<br>
- Quando si utilizza Requesty, la richiesta viene inviata dal browser al gateway UE di Requesty, che la inoltra al deployment del modello specificamente selezionato (ZDR, nessun addestramento del modello, trattamento dei dati esclusivamente all’interno dell’UE).<br>
- La bozza della nota viene restituita al browser tramite una connessione cifrata.<br><br>

La web app stessa non dispone di alcun server applicativo che memorizzi audio, trascrizioni o note. La comunicazione avviene tra il tuo browser e i servizi che scegli.<br><br>

<hr><br>

<strong>3. Chiavi API e credenziali di accesso</strong><br><br>

Utilizzi le tue chiavi dei provider oppure, per AWS Bedrock, il tuo URL backend e il tuo secret. Lo sviluppatore della web app non riceve questi dati né il contenuto clinico trasmesso attraverso di essi.<br><br>

Le chiavi API inserite nella pagina iniziale vengono memorizzate temporaneamente nel SessionStorage del browser e rimosse quando la scheda/sessione viene chiusa o quando selezioni Clear keys. Se esporti un backup cifrato delle chiavi, la password viene utilizzata localmente nel browser per cifrare il file prima che venga salvato o caricato.<br><br>

Tratta le chiavi API, i backup e le password come informazioni riservate. Utilizza chiavi individuali, limiti di consumo del provider e restrizioni di accesso ove disponibili e revoca immediatamente la chiave se potrebbe essere stata esposta.<br><br>

<hr><br>

<strong>4. Considerazioni specifiche per i provider</strong><br><br>

<strong>Soniox UE</strong><br>
La localizzazione dei dati nell’UE richiede un progetto Soniox creato nella regione UE, la chiave API appartenente a tale progetto e la selezione dell’endpoint UE corretto nell’app. Soniox dichiara che i dati dei contenuti rimangono quindi nella regione UE e non vengono utilizzati per l’addestramento dei modelli. Verifica le pratiche di conservazione/eliminazione e stipula l’accordo necessario per la tua organizzazione.<br><br>

<strong>Requesty</strong><br>
L’app utilizza il gateway UE di Requesty e route di modelli fisse e curate invece di un selettore di modelli senza limiti. Requesty dichiara che prompt e risposte non vengono utilizzati per l’addestramento dei modelli. Il gateway UE mantiene nell’UE il trattamento e l’archiviazione propri di Requesty, mentre la piena localizzazione dei dati nell’UE richiede anche un deployment di modello ospitato nell’UE. L’app è progettata per selezionare tali deployment, ma l’utente deve comunque controllare i dettagli attuali del modello e disattivare la registrazione di prompt/output per la chiave API oppure ottenere ZDR per l’intera organizzazione prima di utilizzare dati identificabili dei pazienti.<br><br>

<strong>AWS Bedrock</strong><br>
Bedrock viene mantenuto per gli utenti che dispongono già dell’accesso AWS o che preferiscono la propria infrastruttura AWS. La soluzione richiede un backend separato e un’attenta configurazione regionale. È più complessa e non è più consigliata come punto di partenza per i nuovi utenti, ma può comunque essere adatta alle organizzazioni con un ambiente AWS consolidato e approvato.<br><br>

<strong>Mistral</strong><br>
Mistral fornisce Voxtral per speech-to-text e Mistral Large per la generazione di note nell’app. Verifica l’attuale regione operativa, il DPA, l’impostazione di conservazione e la preferenza di addestramento. Se l’uso richiede Zero Data Retention, questo deve essere concesso, attivato e documentato prima di inviare informazioni sui pazienti.<br><br>

<strong>OpenAI</strong><br>
OpenAI rimane disponibile per speech-to-text diretto e generazione di note. Per impostazione predefinita, i dati API standard non vengono utilizzati per l’addestramento dei modelli, ma il trattamento regionale e la conservazione dipendono dal prodotto, dall’account e dalla configurazione contrattuale. Non presumere che una normale chiave API diretta fornisca automaticamente un trattamento esclusivamente nell’UE o Zero Data Retention. Verifica le condizioni vigenti ed esegui la TIA necessaria.<br><br>

<hr><br>

<strong>5. Panoramica dell’archiviazione locale ed esterna</strong><br><br>

<strong>Chiavi API e dati del backend</strong><br>
- Memorizzati in: SessionStorage del browser.<br>
- Durata: fino alla chiusura della scheda/sessione o all’eliminazione delle chiavi.<br>
- Accesso: l’utente e la sessione corrente del browser.<br><br>

<strong>Audio durante la registrazione</strong><br>
- Memorizzato in: memoria del browser durante la registrazione e il trattamento.<br>
- Durata: temporanea; l’app non conserva un archivio audio locale permanente.<br>
- Trattamento esterno: il provider STT selezionato riceve l’audio.<br><br>

<strong>Trascrizioni, Informazioni supplementari e note generate</strong><br>
- Memorizzate in: sessione della scheda attiva del browser e relative funzioni Workspace/cronologia.<br>
- Durata: normalmente fino alla chiusura della scheda/sessione o all’eliminazione del contenuto/della cronologia.<br>
- Trattamento esterno: il testo pertinente viene inviato al provider di note selezionato all’avvio della generazione.<br><br>

<strong>Prompt e impostazioni in un Workspace Set</strong><br>
- I prompt e le impostazioni selezionate possono essere memorizzati localmente nel browser.<br>
- L’esportazione di un Workspace Set include configurazioni come ordine, prompt, provider/modelli selezionati e toggle pertinenti, ma non trascrizioni, Informazioni supplementari, note generate, cronologia, audio, chiavi API o password.<br>
- Le esportazioni sul cloud vengono cifrate nel browser con la password scelta. Le esportazioni JSON locali sono leggibili e devono essere conservate in modo sicuro.<br><br>

Il trattamento e la conservazione da parte dei provider si aggiungono all’archiviazione nel browser e devono essere verificati presso ogni servizio utilizzato.<br><br>

<hr><br>

<strong>6. Codice sorgente e responsabilità</strong><br><br>

Il codice sorgente della web app è disponibile pubblicamente e l’applicazione principale viene eseguita nel browser. Lo sviluppatore non riceve testo clinico attraverso un backend applicativo. È comunque possibile che vengano raccolte statistiche di utilizzo di base e non cliniche, come descritto dal sito web.<br><br>

Il contenuto generato è una bozza. Il professionista sanitario è responsabile della verifica dell’accuratezza medica, della correzione degli errori e della decisione su ciò che viene inserito nella cartella clinica del paziente.
`,

  aboutModalHeading: "Informazioni",
aboutModalText: `Questo sito è stato creato per offrire ai professionisti sanitari e ad altri utenti un accesso diretto a trascrizioni vocali di alta qualità e alla generazione di note cliniche—senza costi superflui o intermediari.<br><br>
Utilizzando la tua chiave API OpenAI personale, ti connetti direttamente alla fonte della tecnologia. Ciò significa che paghi soltanto il costo effettivo stabilito da OpenAI, senza maggiorazioni o tariffe di abbonamento.<br><br>
Molti fornitori offrono servizi simili, ma applicano prezzi significativamente più elevati—spesso da 8 a 10 volte il costo reale della tecnologia sottostante. Questa piattaforma offre le stesse funzionalità a una frazione del prezzo.<br><br>
<strong>Punti chiave:</strong><br>
• Nessun abbonamento, nessun account richiesto.<br>
• Paghi solo OpenAI per ciò che utilizzi.<br>
• Il sito stesso è completamente gratuito.`,
  guideModalHeading: "Chiavi API – come iniziare",
  guideModalText: `
<strong>Chiavi API — primi passi</strong><br><br>
La configurazione più semplice consigliata ai nuovi utenti è:<br>
1. <strong>Soniox con chiave di regione UE</strong> per speech-to-text.<br>
2. <strong>Requesty</strong> per la generazione delle note.<br><br>

<strong>Opzioni STT:</strong> Soniox batch, batch con etichette dei parlanti, tempo reale, OpenAI gpt-4o-transcribe e Mistral Voxtral Mini.<br><br>
<strong>Provider di note:</strong> Requesty (Claude Opus 5.5, Claude Sonnet 5, GPT-6 Sol, GPT-6 Luna, GPT-5.6 Sol/Terra/Luna, GPT-5.5, GPT-5 Nano, Gemini 3.8 Flash, DeepSeek V4 Pro, DeepSeek V4.1 Flash, Kimi K3), OpenAI (GPT-5.6 Sol/Terra/Luna e GPT-5 Nano), AWS Bedrock (Claude Haiku/Sonnet/Opus) e Mistral Large.<br><br>

<hr><br>
<strong>Soniox — configurazione STT consigliata</strong><br>
1. Crea un account su <a href="https://soniox.com" target="_blank" rel="noopener noreferrer">soniox.com</a> e configura fatturazione/crediti.<br>
2. Richiedi l’accesso regionale a <a href="mailto:support@soniox.com">support@soniox.com</a>.<br>
3. Crea/seleziona un progetto nella regione <strong>European Union</strong> e copia la chiave regionale.<br>
4. Incollala in <strong>Soniox API key</strong> e seleziona l’endpoint <strong>EU</strong>. Sono necessari sia chiave UE sia endpoint UE.<br><br>
Il link <strong>Guide</strong> vicino al campo Soniox apre le istruzioni dettagliate.<br><br>

<hr><br>
<strong>Requesty — configurazione note consigliata</strong><br>
1. Crea un account su <a href="https://requesty.ai" target="_blank" rel="noopener noreferrer">requesty.ai</a> e configura crediti/fatturazione.<br>
2. In <strong>API Keys</strong> crea una chiave e, se possibile, limitala a modelli/Access Lists approvati.<br>
3. Copiala in modo sicuro e incollala in <strong>Requesty API key</strong>.<br>
4. Disattiva il logging prompt/risposta o richiedi ZDR organizzativo; verifica DPA e route prima dei dati identificabili.<br><br>
Il link <strong>Guide</strong> vicino a Requesty spiega account, crediti, chiave, accesso modelli, routing UE e privacy.<br><br>

<hr><br>
<strong>OpenAI:</strong> crea account su <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a>, fatturazione e chiave API. Verifica DPA, conservazione e regione; una chiave standard non è automaticamente solo UE o ZDR.<br><br>

<strong>Mistral:</strong> crea account su <a href="https://console.mistral.ai" target="_blank" rel="noopener noreferrer">console.mistral.ai</a>, fatturazione e chiave utilizzabile con Voxtral Mini e Mistral Large. Verifica hosting UE, DPA, conservazione e ZDR.<br><br>

<strong>AWS Bedrock — opzionale per utenti AWS esistenti:</strong> richiede account AWS, accesso regionale e backend separato. È più complesso e non è consigliato come punto di partenza. Usa il link <a href="#" data-open-guide="bedrock"><strong>Guide</strong></a> vicino ai campi AWS.<br><br>

<hr><br>
<strong>Prima di inserire dati dei pazienti</strong><br>
Una chiave API non rende automaticamente un servizio conforme al GDPR. Verifica DPA, sub-responsabili, endpoint, residenza, conservazione/ZDR e addestramento; completa DPIA/TIA, proteggi le credenziali, minimizza i dati e controlla ogni nota.
`,

  priceButton: "Prezzo",
  priceModalHeading: "Informazioni sui costi",
  priceModalText: `
<div>
  <p><strong>Informazioni sui costi</strong></p>
  <p>L’app non applica abbonamenti o maggiorazioni. Paghi direttamente il provider per l’uso effettivo dell’API. I prezzi possono cambiare; fanno fede dashboard e fattura del provider.</p>
  <p><strong>Prezzi nell’app</strong></p>
  <ul>
    <li>Il prezzo USD approssimativo per un milione di token input/output appare vicino al modello selezionato.</li>
    <li>Dopo la generazione vengono mostrati token e costo stimato se il provider restituisce dati sufficienti.</li>
    <li>Token di reasoning, cache, sconti, costi gateway, cambio e regole di fatturazione possono modificare il totale.</li>
  </ul>

  <hr><br>
  <p><strong>1. Speech-to-text</strong> (prezzo approssimativo per minuto audio)</p>
  <p><strong>Soniox — consigliato:</strong> circa 0,0017 USD/minuto; 15 minuti circa 0,026 USD.</p>
  <p><strong>OpenAI gpt-4o-transcribe:</strong> circa 0,006 USD/minuto; 15 minuti circa 0,09 USD.</p>
  <p><strong>Mistral Voxtral Mini:</strong> verifica il prezzo ufficiale Mistral attuale.</p>

  <hr><br>
  <p><strong>2. Generazione delle note</strong> (USD per un milione di token input/output)</p>
  <ul>
    <li>Claude Opus 5.5: circa 4,40 / 22,00 USD</li><li>Claude Sonnet 5: circa 2,20 / 11,00 USD</li>
    <li>GPT-6 Sol: circa 2,40 / 12,00 USD</li><li>GPT-6 Luna: circa 0,12 / 0,60 USD</li>
    <li>GPT-5.6 Sol: circa 4,40 / 22,00 USD</li><li>GPT-5.6 Terra: circa 2,20 / 13,20 USD</li>
    <li>GPT-5.6 Luna: circa 0,22 / 1,32 USD</li><li>GPT-5.5: circa 5,00 / 30,00 USD</li>
    <li>GPT-5 Nano: circa 0,055 / 0,44 USD</li><li>Gemini 3.8 Flash: circa 0,825 / 4,125 USD (sconto attuale del 50% sull'endpoint)</li><li>DeepSeek V4 Pro: circa 1,75 / 3,50 USD (input in cache: 0,44 USD)</li><li>DeepSeek V4.1 Flash: circa 0,50 / 1,50 USD (input in cache: 0,05 USD)</li><li>Kimi K3: circa 3,00 / 15,00 USD</li>
  </ul>
  <p>I valori rispecchiano le stime attuali dell’app e possono cambiare con Requesty o il deployment upstream. Controlla il prezzo vicino al modello e il rapporto d’uso Requesty.</p>
  <p>Altri provider: OpenAI diretto (GPT-5.6 Sol/Terra/Luna e GPT-5 Nano), AWS Bedrock (Claude Haiku/Sonnet/Opus, soprattutto per utenti AWS esistenti) e Mistral Large. I prezzi attuali sono mostrati nell’app.</p>

  <hr><br>
  <p><strong>3. Cosa sono i token?</strong></p>
  <p>Come stima, 1 token equivale a circa 4 caratteri o tre quarti di una parola inglese; 1.000 token a circa 750 parole inglesi. Terminologia medica, italiano, formattazione e prompt lunghi modificano il rapporto. L’input include prompt, trascrizione, Informazioni supplementari e contesto; l’output include nota e reasoning/output fatturabili.</p>

  <hr><br>
  <p><strong>4. Esempio: consulto di 15 minuti</strong></p>
  <p>Con circa 2.200 token input e 450 output:</p>
  <ul>
    <li>Trascrizione Soniox: circa 0,026 USD</li><li>GPT-5 Nano: circa 0,0003 USD</li>
    <li>Gemini 3.8 Flash: circa 0,004 USD</li><li>Claude Sonnet 5: circa 0,010 USD</li>
    <li>Claude Opus 5.5: circa 0,020 USD</li><li>GPT-5.6 Sol: circa 0,020 USD</li>
  </ul>
  <p>Il costo reale dipende da lunghezza, prompt, Informazioni supplementari e livello di reasoning.</p>

  <hr><br>
  <p><strong>5. Ridurre il costo dei documenti lunghi</strong></p>
  <p>Secondary Note Generation può riassumere un documento lungo con un modello economico come GPT-5 Nano. Il riepilogo viene inserito nelle Informazioni supplementari prima che il modello principale crei la nota finale. Può costare molto meno che inviare, per esempio, 50 pagine direttamente a un modello costoso.</p>

  <hr><br>
  <p><strong>6. Esempio mensile</strong></p>
  <p>20 consulti al giorno, 4 giorni a settimana per 4 settimane equivalgono a circa 320 consulti e 80 ore audio. A 0,0017 USD/minuto, la trascrizione Soniox costa circa 8,16 USD prima di tasse e variazioni. La generazione si aggiunge secondo modello e token effettivi.</p>
  <p>Senza uso delle API, l’app non genera costi d’uso. Possono comunque applicarsi minimi, crediti prepagati, tasse o altre condizioni del provider.</p>
</div>
`,
};

export const transcribeTranslations = {
  pageTitle: "Strumento di trascrizione",
  openaiUsageLinkText: "Riepilogo dei costi",
  openaiWalletLinkText: "Saldo Portafoglio",
  btnFunctions: "Funzioni",
  btnGuide: "Guida",
  btnNews: "Stato e aggiornamenti",
  priceOverlay: {
    button: "Prezzi",
    heading: "Prezzi",
    intro: "Prezzi attuali dei modelli disponibili in questa app.",
    textModels: "Modelli di testo",
    speechToText: "Speech-to-text",
    model: "Modello",
    context: "Contesto",
    input: "Input / 1M",
    output: "Output / 1M",
    billing: "Fatturazione",
    price: "Prezzo",
    audioDuration: "Durata audio",
    tokenBased: "Basata sui token",
    perMinute: "/ min",
    perHour: "/ ora",
    approx: "circa",
    close: "Chiudi",
    contextNote: "Il contesto è la finestra di contesto massima pubblicata per il modello o il routing configurato.",
    requestyNote: "I prezzi Requesty corrispondono ai routing esatti configurati nell’app. Eventuali maggiorazioni a livello di account Requesty non sono incluse.",
    sttNote: "I prezzi speech-to-text sono le tariffe pubbliche pay-as-you-go attuali. Soniox viene fatturato a token; gli importi al minuto mostrati sono equivalenti approssimativi calcolati dalle tariffe orarie pubblicate da Soniox.",
  },
  backToHome: "Torna alla pagina iniziale",
  recordingAreaTitle: "Area di Registrazione",
  recordTimer: "Timer di Registrazione: 0 sec",
  transcribeTimer: "Timer di Completamento: 0 sec",
  transcriptionPlaceholder: "Il risultato della trascrizione apparirà qui...",
  startButton: "Avvia Registrazione",
  readFirstText: "Leggi prima! ➔",
  stopButton: "Ferma/Completa",
  pauseButton: "Pausa Registrazione",
  statusMessage: "Benvenuto! Clicca su \"Avvia Registrazione\" per iniziare.",
  noteGenerationTitle: "Generazione delle Note",
  generateNoteButton: "Genera Nota",
  noteTimer: "Timer di Completamento: 0 sec",
  generatedNotePlaceholder: "La nota generata apparirà qui...",
  customPromptTitle: "Prompt Personalizzato",
  promptSlotLabel: "Slot del Prompt:",
  customPromptPlaceholder: "Inserisci qui il prompt personalizzato",
  guideHeading: "Guida e Istruzioni",
guideText: `Benvenuto in <strong>Nordlys Journal</strong>. L'app può registrare e trascrivere conversazioni e usare il testo finale per generare una nota. Ottieni sempre il consenso necessario prima della registrazione e controlla sempre il contenuto clinico prima dell'uso.<br><br>

<strong>Browser consigliato:</strong> Google Chrome offre il supporto più affidabile per tutte le funzioni dell'app.<br><br>

<strong>Avvio rapido</strong><br>
<ol>
  <li>Seleziona un Workspace, il fornitore di trascrizione e le impostazioni necessarie.</li>
  <li>Seleziona <strong>Avvia registrazione</strong>. Usa <strong>Pausa</strong>, <strong>Riprendi</strong>, <strong>Stop/Completa</strong> o <strong>Interrompi</strong> secondo necessità.</li>
  <li>Seleziona prompt, fornitore e modello per la nota, quindi <strong>Genera nota</strong>. Puoi anche attivare Auto-generate.</li>
</ol>

<details open>
  <summary><strong>Registrazione e trascrizione</strong></summary>
  <ul>
    <li>Seleziona il fornitore speech-to-text prima della registrazione. Si consiglia Google Chrome o Microsoft Edge.</li>
    <li><strong>Pausa</strong> completa il segmento audio corrente e permette di riprendere in seguito. <strong>Stop/Completa</strong> termina la registrazione e attende la trascrizione restante. <strong>Interrompi</strong> scarta la registrazione attiva senza il normale completamento.</li>
    <li><strong>Speaker Labels</strong> è disponibile solo con Soniox e prova a indicare chi sta parlando, ad esempio Speaker 1 e Speaker 2.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Workspaces e Workspace Sets</strong></summary>
  <ul>
    <li>Un <strong>Workspace</strong> è un'area di lavoro separata nella scheda del browser. Ogni Workspace ha testi, prompt selezionati, fornitori, modelli, impostazioni e processi attivi propri. I Workspace clonati condividono la cronologia della loro famiglia di cloni; quelli aggiunti con + hanno una cronologia separata. Cambiare Workspace non interrompe registrazioni o generazioni.</li>
    <li>Il nome segue normalmente l'etichetta dello slot prompt selezionato. Usa <strong>+</strong> per aggiungere e <strong>×</strong> per chiudere un Workspace. Possono essere aperti fino a 12 Workspaces.</li>
    <li>Tutti i Workspaces aperti formano un <strong>Workspace Set</strong>. Importazione ed esportazione sono disponibili tramite file JSON locale, Microsoft OneDrive o Google Drive.</li>
    <li>Un Workspace Set salva numero e ordine, nomi, slot prompt selezionati con testo ed etichette, fornitori, modelli, scelte di reasoning, caselle pertinenti e moduli aperti. Non include trascrizioni, informazioni supplementari, note, cronologia, audio, chiavi API, password o altre informazioni sui pazienti.</li>
    <li>I backup cloud sono crittografati nel browser con la password scelta. I file JSON locali sono leggibili e devono essere conservati in modo sicuro.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Mini Panel</strong></summary>
  <ul>
    <li><strong>Google Chrome è consigliato per il Mini Panel.</strong> Questa funzione potrebbe non funzionare correttamente con altri browser.</li>
    <li>Aprilo con il pulsante <strong>Mini-panel</strong>. L'icona in alto a destra passa da una visualizzazione all'altra.</li>
    <li><strong>Mini Panel — Browser Tabs</strong> controlla schede Nordlys Journal separate ed è adatto a un Workspace per scheda.</li>
    <li><strong>Mini Panel — Workspaces</strong> mostra tutti i Workspaces nella scheda Nordlys Journal selezionata ed è adatto a più aree di lavoro nella stessa scheda.</li>
    <li>Registrazioni e generazioni continuano in background quando cambi visualizzazione o Workspace.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Auto-generate, Auto-copy e generazione primaria</strong></summary>
  <ul>
    <li><strong>Auto-generate</strong> avvia automaticamente la generazione della nota al termine della trascrizione. Quando è disattivato, usa manualmente <strong>Genera nota</strong>.</li>
    <li><strong>Auto-copy</strong> può copiare automaticamente la trascrizione o la nota completata e richiede l'estensione Chrome associata. I pulsanti di copia manuale funzionano comunque.</li>
    <li>La nota primaria usa la trascrizione, l'eventuale prompt selezionato e il testo in <strong>Informazioni supplementari</strong>. Prima della generazione seleziona fornitore, modello e, se disponibile, livello di reasoning.</li>
    <li>Le note generate dall'IA possono contenere errori o omettere informazioni. Controlla e convalida sempre una nota prima di salvarla o inviarla.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Secondary Note Generation</strong></summary>
  <p>Questo modulo è utile quando un documento lungo deve essere prima abbreviato. Incolla il testo nel campo sorgente, seleziona un prompt e un modello separati e genera un riassunto. Il risultato può essere copiato automaticamente o manualmente in <strong>Informazioni supplementari</strong>.</p>
  <p>Ad esempio, puoi usare un modello economico come GPT-5 Nano tramite Requesty per riassumere un documento di 50 pagine. Il modello principale, come GPT-5.6 Sol o Claude Opus 5.5, riceve quindi il breve riassunto insieme alla trascrizione invece dell'intero documento. Ciò può ridurre notevolmente token e costi. Controlla il riassunto prima di usarlo come contesto clinico.</p>
</details><br>

<details>
  <summary><strong>Prezzi e utilizzo dei token</strong></summary>
  <ul>
    <li>Quando i dati sui prezzi sono disponibili, il modello selezionato mostra il prezzo in USD per un milione di token di input e output.</li>
    <li>Dopo la generazione vengono mostrati l'uso dei token e un prezzo stimato se la risposta del fornitore contiene i dati necessari. Alcuni fornitori possono comunicare un costo più preciso.</li>
    <li><strong>Riepilogo dei costi</strong> apre i collegamenti alle pagine di utilizzo e fatturazione dei fornitori. I prezzi nell'app sono indicativi; fa fede la fatturazione del fornitore.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Slot prompt, cronologia, Redactor e OCR</strong></summary>
  <ul>
    <li>Sono disponibili 20 slot prompt. Vengono memorizzati in questo browser e possono essere importati o esportati in formato JSON o come backup crittografati tramite OneDrive e Google Drive.</li>
    <li>La colonna della cronologia mostra le 30 generazioni primarie completate più recenti del Workspace attivo. Seleziona un elemento per vedere trascrizione, informazioni supplementari e nota generata. I Workspace clonati condividono la cronologia della loro famiglia di cloni; gli altri hanno una cronologia separata.</li>
    <li><strong>Redactor</strong> può rimuovere termini generali e specifici selezionati dalla trascrizione e dalle informazioni supplementari. Controlla sempre il risultato prima dell'invio.</li>
    <li><strong>OCR</strong> può estrarre testo da uno screenshot incollato o da un file immagine e inviarlo all'elenco dei termini specifici o al campo di testo grezzo.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Archiviazione e privacy</strong></summary>
  <ul>
    <li>Il testo di lavoro e la cronologia del Workspace rimangono nella sessione della scheda corrente e vengono rimossi al termine della sessione. <strong>Clear</strong> può eliminare contenuto attivo o cronologia.</li>
    <li>Le chiavi API non vengono inserite in localStorage. Restano solo per la sessione attiva del browser e possono essere cancellate manualmente dalla pagina iniziale.</li>
    <li>I dati vengono inviati al fornitore e alla regione selezionati. Archiviazione e trattamento dipendono da fornitore, account, configurazione e condizioni correnti. Verifica che la configurazione sia adatta alle informazioni trattate.</li>
  </ul>
</details><br><br>

Seleziona nuovamente <strong>Guida</strong> o usa il pulsante di chiusura per tornare alla vista principale.
`,

  // Generatore di note secondario
  secondaryNote: {
    showButton: "Mostra generatore di note secondario",
    hideButton: "Nascondi generatore di note secondario",
    title: "Generatore di note secondario",
    sourceLabel: "Testo sorgente",
    sourcePlaceholder: "Incolla o digita qui il testo sorgente...",
    providerLabel: "Fornitore:",
    modelLabel: "Modello:",
    modeLabel: "Modalità:",
    reasoningLabel: "Livello di ragionamento:",
    thinkingLabel: "Livello di riflessione:",
    promptLabel: "Prompt:",
    generateButton: "Genera nota",
    abortButton: "Annulla",
    copyButton: "Copia",
    copiedButton: "Copiato",
    pushButton: "Inserisci",
    clearOnGenerateLabel: "Svuota Informazioni supplementari alla generazione",
    autoTransferLabel: "Copia automaticamente il risultato nelle Informazioni supplementari",
    sourceDateLabel: "Data",
    sourceDateToggleAriaLabel: "Mantieni la data odierna nel testo sorgente",
    sourceDateHelp: 'Quando è attiva: mantiene la riga "Dagens dato er DD.MM.YYYY" all’inizio del testo sorgente e la ripristina dopo l’aggiornamento della pagina. Quando è disattivata: rimuove questa riga della data dal testo sorgente.',
    outputPlaceholder: "La nota generata apparirà qui...",
    timerLabel: "Timer di generazione della nota",
    statusGenerating: "Generazione in corso…",
    statusCompleted: "Generazione del testo completata!",
    statusFailed: "Generazione non riuscita",
    statusAborted: "Generazione della nota annullata.",
    noSourceText: "Nessun testo sorgente",
    noPromptSelected: "Nessun prompt selezionato",
    noOutputToPush: "Nessuna nota da copiare ancora",
    transferred: "Risultato copiato nelle Informazioni supplementari."
  },
};

export default { indexTranslations, transcribeTranslations };
