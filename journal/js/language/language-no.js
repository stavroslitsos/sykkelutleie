// js/language-no.js

export const indexTranslations = {
  pageTitle: "Nordlys Journal",
  headerTitle: "Nordlys Journal",
  headerSubtitle: "Avansert AI-drevet tale-til-tekst og notatgenerering for helsekonsultasjoner",
  startText: "Du kan nå også velge mellom ulike modeller fra forskjellige leverandører. For instruksjoner om hvordan å bruke denne webappen, les info-modulene nederst på forsiden.",
  apiPlaceholder: "Skriv inn OpenAI API-nøkkel her",
  keysIoHint: "Eksporter nøklene til en fil og oppbevar den sikkert. Neste gang kan du importere filen for å fylle inn feltene på nytt, noe som sparer tid og gjør at du slipper å skrive dem inn. Nøklene slettes automatisk når du lukker webappen/nettleser-fanen, eller manuelt med Clear keys.",
  gdprColumnTitle: "GDPR-kompatibel:",
  gdprColumnFootnote: "(EU data-residens/databehandling + ingen datalagring + data brukes ikke for modelltrening – forutsatt korrekt oppsett)",
  nonGdprColumnTitle: "Ikke GDPR-kompatibel:",
  nonGdprColumnFootnote: "(Typisk global databehandling + kan ha midlertidig datalagring)",
  enterButton: "Gå til transkripsjonsverktøyet",
  guideButton: "API-guide – Slik bruker du den",
  securityButton: "Sikkerhet",
  aboutButton: "Om",
  modelsModalHeading: "AI-modeller",
  modelsModalText: `
<div>
  <p><strong>Modellvalg i Nordlys Journal</strong></p>
  <p>
    I appen kan du velge separate modeller for <strong>tale-til-tekst (STT)</strong> og <strong>notatgenerering</strong>.
    Det ferdige notatet avhenger av begge trinnene: En nøyaktig transkripsjon gir tekstmodellen et bedre grunnlag, mens en sterk
    notatmodell er bedre til å strukturere, prioritere og følge valgt prompt.
  </p>

  <hr><br>

  <p><strong>1) Tale-til-tekst-modeller</strong></p>
  <ul>
    <li><strong>Soniox</strong> – batch- eller sanntidstranskripsjon, med valgfrie speaker labels</li>
    <li><strong>OpenAI</strong> – gpt-4o-transcribe</li>
    <li><strong>Mistral</strong> – Voxtral Mini Transcribe</li>
  </ul>

  <p><strong>Praktisk rangering av tale-til-tekst</strong></p>
  <ol>
    <li><strong>Soniox</strong> – anbefalt valg. Gir vanligvis svært god transkripsjonskvalitet, støtter speaker labels og kan bruke et regionalt EU-endepunkt.</li>
    <li><strong>OpenAI gpt-4o-transcribe</strong> – et godt alternativ, men standard API-oppsett gir ikke den samme enkle veien til dokumentert EU-datalokalisering.</li>
    <li><strong>Mistral Voxtral Mini</strong> – et rimelig europeisk alternativ som kan passe når kostnad er viktigst.</li>
  </ol>
  <p>
    For at lyd- og transkripsjonsinnhold hos Soniox skal holdes i EU, må du bruke en API-nøkkel som tilhører et Soniox-prosjekt i EU-regionen
    og velge EU-endepunktet i appen. Speaker labels kan være spesielt nyttig i lege–pasient-samtaler fordi notatmodellen lettere kan skille talerne.
  </p>

  <hr><br>

  <p><strong>2) Leverandører og modeller for notatgenerering</strong></p>

  <p><strong>Requesty — anbefalt for nye brukere</strong></p>
  <p>
    Requesty gir tilgang til modeller fra flere utviklere gjennom én API-nøkkel. Requesty-valgene i denne appen er bevisst begrenset
    til utvalgte modellutrullinger som er ment for databehandling i EU, uten bruk til modelltrening og med egnede kontrollmuligheter for datalagring.
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

  <p><strong>Andre støttede leverandører</strong></p>
  <ul>
    <li><strong>OpenAI</strong> – GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna og GPT-5 Nano</li>
    <li><strong>AWS Bedrock</strong> – Claude Haiku 4.5, Claude Sonnet 4.5/4.6 og Claude Opus 4.5/4.6/4.7</li>
    <li><strong>Mistral</strong> – Mistral Large</li>
  </ul>

  <p>
    AWS Bedrock beholdes for brukere som allerede har AWS-tilgang, eller som spesifikt ønsker å administrere sin egen AWS-løsning.
    Oppsettet er betydelig mer komplisert, og modellutvalget kan ligge etter de nyeste lanseringene. AWS Bedrock er derfor
    <strong>ikke anbefalt som utgangspunkt for nye brukere</strong>.
  </p>

  <br>
  <p><strong>Praktisk veiledning for Requesty-modellene</strong></p>
  <p>Dette er en skjønnsmessig veiledning for vanlig notatgenerering, ikke en objektiv medisinsk benchmark:</p>
  <ul>
    <li><strong>Maksimal kvalitet:</strong> Claude Opus 5.5 og GPT-5.6 Sol</li>
    <li><strong>Sterke allroundvalg:</strong> Claude Sonnet 5, GPT-5.6 Terra, GPT-5.5 og DeepSeek V4 Pro</li>
    <li><strong>Raskere og rimeligere valg:</strong> GPT-5.6 Luna, Gemini 3.8 Flash og DeepSeek V4.1 Flash</li>
    <li><strong>Billigst til sammendrag og forbehandling:</strong> GPT-5 Nano</li>
    <li><strong>Ytterligere alternativ:</strong> Kimi K3</li>
  </ul>
  <p>Claude Opus 5.5 støtter reasoning-nivåene Low, Medium og High i appen; standardvalget er Low.</p>
  <p>GPT-6 Sol og GPT-6 Luna støtter reasoning-nivåene None, Low, Medium og High i appen; når ingen tidligere reasoning-verdi er lagret, er standardvalget Low.</p>
  <p>DeepSeek V4 Pro og DeepSeek V4.1 Flash støtter reasoning-nivåene None, Low, High og Max; appens standardvalg er Low.</p>
  <p>
    Ved svært lange kildedokumenter kan en rimelig modell som GPT-5 Nano først lage et kort sammendrag til Supplerende informasjon.
    En sterkere hovedmodell kan deretter lage sluttresultatet uten å motta hele dokumentet, noe som kan redusere kostnaden betydelig.
  </p>

  <hr><br>

  <p><strong>Pris mot kvalitet</strong></p>
  <p>
    De sterkeste modellene koster vanligvis mer per token, men notatgenerering er ofte fortsatt rimelig sammenlignet med abonnementsbaserte
    dokumentasjonstjenester. Appen viser omtrentlig USD-pris per én million input- og output-tokens ved valgt modell og, når bruksdata er tilgjengelige,
    et kostnadsestimat etter generering. Se Pris-delen for eksempler.
  </p>

  <hr><br>

  <p><strong>Anbefalt oppsett for nye kliniske brukere</strong></p>
  <p>
    Anbefalt utgangspunkt er <strong>Soniox med EU-prosjekt, EU-API-nøkkel og EU-endepunkt</strong> for tale-til-tekst,
    kombinert med <strong>Requesty</strong> for notatgenerering. Dette gir høy transkripsjonskvalitet og enkel tilgang til et kuratert utvalg
    av nyere notatmodeller gjennom én Requesty-nøkkel.
  </p>
  <p>
    Ingen leverandør eller modell gjør en arbeidsflyt automatisk GDPR-kompatibel. Virksomheten må fortsatt kontrollere DPA, endepunkt og lagringsinnstillinger,
    gjennomføre nødvendige DPIA/TIA-vurderinger og kontrollere hvert genererte notat før klinisk bruk. Se Personvern-delen for mer informasjon.
  </p>
</div>
`,

  securityModalHeading: "Personvern",
securityModalText: `
<strong>Personvern og databehandling</strong><br><br>

Denne webappen er et verktøy for tale-til-tekst og notatgenerering. Som helsepersonell og behandlingsansvarlig er du ansvarlig for at bruken er i samsvar med gjeldende regelverk, blant annet GDPR, helsepersonelloven og Normen for informasjonssikkerhet i helse- og omsorgssektoren.<br><br>
Utvikleren kan ikke avgjøre om den enkelte virksomhetens bruk er lovlig. Dette er ikke juridisk rådgivning. Involver personvernombud eller juridisk rådgiver ved behov.<br><br>

<hr><br>

<strong>1. Anbefalt oppsett for nye brukere</strong><br><br>

<strong>Tale-til-tekst</strong><br>
Anbefalt løsning er Soniox med EU-prosjekt, EU-API-nøkkel og EU-endepunkt. Soniox opplyser at lyd- og transkripsjonsinnhold forblir i valgt region når man bruker prosjektets regionale nøkkel og korrekt API-domene. Soniox opplyser også at innsendt innhold ikke brukes til modelltrening. Konto-, fakturerings- og bruksmetadata kan likevel behandles utenfor valgt region. Ved bruk av Soniox i denne app, så vil lydopptak og produserte diktater alltid slettes fra Soniox sine servere med en gang transkripsjonsjobben er fullført.<br><br>

<strong>Notatgenerering</strong><br>
Anbefalt løsning for nye brukere er Requesty. Appen sender Requesty-kall gjennom selskapets EU-gateway og viser et bevisst kuratert utvalg navngitte modellutrullinger som er ment for EU-databehandling, uten gjenbruk til modelltrening og med egnede kontrollmuligheter for datalagring. Dette gir tilgang til flere nyere modeller gjennom én Requesty-API-nøkkel.<br><br>

Appens modellvalg aktiverer ikke i seg selv Zero Data Retention på Requesty-kontoen. Requesty dokumenterer at logging av prompts og outputs på selvbetjente abonnementer er aktivert som standard med 30 dagers lagring. Logging kan og bør deaktiveres per API-nøkkel, og virksomhetsomfattende Zero Data Retention kan forespørres hos Requesty.<br><br>

<hr><br>

<strong>2. Hvordan webappen behandler data</strong><br><br>

- Lyd tas opp og behandles midlertidig i nettleserens minne.<br>
- Lyden sendes kryptert over HTTPS til valgt tale-til-tekst-leverandør: Soniox, OpenAI eller Mistral/Voxtral.<br>
- Transkripsjonen vises i valgt Workspace i nettleseren.<br>
- Når du genererer et notat, sendes transkripsjonen, valgt prompt og eventuell Supplerende informasjon til valgt notatleverandør.<br>
- Ved bruk av Requesty sendes forespørselen fra nettleseren til Requestys EU-gateway, som videresender den til den spesifikt valgte modellutrullingen(ZDR, ingen modell trening, med data behandling utelukkende innenfor EU)<br>
- Notatutkastet returneres til nettleseren over en kryptert forbindelse.<br><br>

Selve webappen har ingen applikasjonsserver som lagrer lyd, transkripsjon eller notat. Kommunikasjonen skjer mellom din egen nettleseren og tjenestene du velger.<br><br>

<hr><br>

<strong>3. API-nøkler og påloggingsopplysninger</strong><br><br>

Du bruker egne leverandørnøkler eller, for AWS Bedrock, egen backend-URL og secret. Utvikleren av webappen mottar ikke disse opplysningene eller det kliniske innholdet som sendes gjennom dem.<br><br>

API-nøkler som skrives inn på forsiden, lagres midlertidig i nettleserens SessionStorage og fjernes når fanen/økten lukkes eller når du velger Clear keys. Dersom du eksporterer en kryptert sikkerhetskopi av nøklene, brukes passordet lokalt i nettleseren til å kryptere filen før den lagres eller lastes opp.<br><br>

Behandle API-nøkler, sikkerhetskopier og passord som konfidensiell informasjon. Bruk individuelle nøkler, leverandørens forbruksgrenser og tilgangsbegrensninger der dette finnes, og sperr nøkkelen umiddelbart dersom den kan være eksponert.<br><br>

<hr><br>

<strong>4. Leverandørspesifikke hensyn</strong><br><br>

<strong>Soniox EU</strong><br>
EU-datalokalisering krever et Soniox-prosjekt opprettet i EU-regionen, API-nøkkelen som tilhører dette prosjektet, og at korrekt EU-endepunkt er valgt i appen. Soniox opplyser at innholdsdata da forblir i EU-regionen og ikke brukes til modelltrening. Kontroller lagrings-/slettepraksis og inngå nødvendig avtale for virksomheten.<br><br>

<strong>Requesty</strong><br>
Appen bruker Requestys EU-gateway og faste, kuraterte modellruter fremfor en ubegrenset modellvelger. Requesty opplyser at prompts og svar ikke brukes til modelltrening. EU-gatewayen holder Requestys egen behandling og lagring i EU, mens full EU-datalokalisering også krever en EU-hostet modellutrulling. Appen er laget for å velge slike utrullinger, men brukeren må fortsatt kontrollere gjeldende modelldetaljer og deaktivere prompt-/output-logging for API-nøkkelen eller få virksomhetsomfattende ZDR før identifiserbare pasientopplysninger brukes.<br><br>

<strong>AWS Bedrock</strong><br>
Bedrock beholdes for brukere som allerede har AWS-tilgang, eller som foretrekker egen AWS-infrastruktur. Løsningen krever separat backend og nøye regional konfigurasjon. Den er mer komplisert og er ikke lenger anbefalt som utgangspunkt for nye brukere, men kan fortsatt passe for virksomheter med et etablert og godkjent AWS-miljø.<br><br>

<strong>Mistral</strong><br>
Mistral leverer Voxtral for tale-til-tekst og Mistral Large for notatgenerering i appen. Kontroller gjeldende driftsregion, DPA, lagringsinnstilling og treningspreferanse. Dersom bruken krever Zero Data Retention, må dette være innvilget, aktivert og dokumentert før pasientopplysninger sendes.<br><br>

<strong>OpenAI</strong><br>
OpenAI er fortsatt tilgjengelig for direkte tale-til-tekst og notatgenerering. Standard API-data brukes ikke til modelltrening som utgangspunkt, men regional behandling og lagring avhenger av produkt, konto og avtaleoppsett. Ikke legg til grunn at en vanlig direkte API-nøkkel automatisk gir kun EU-behandling eller Zero Data Retention. Kontroller gjeldende vilkår og gjennomfør nødvendig TIA.<br><br>

<hr><br>

<strong>5. Oversikt over lokal og ekstern lagring</strong><br><br>

<strong>API-nøkler og backend-opplysninger</strong><br>
- Lagres i: nettleserens SessionStorage.<br>
- Varighet: til fanen/økten lukkes eller nøklene slettes.<br>
- Tilgang: brukeren og den aktuelle nettleserøkten.<br><br>

<strong>Lyd under opptak</strong><br>
- Lagres i: nettleserens minne under opptak og behandling.<br>
- Varighet: midlertidig; appen beholder ikke et permanent lokalt lydarkiv.<br>
- Ekstern behandling: valgt STT-leverandør mottar lyden.<br><br>

<strong>Transkripsjoner, Supplerende informasjon og genererte notater</strong><br>
- Lagres i: den aktive nettleserfanens økt og tilhørende Workspace-/historikkfunksjoner.<br>
- Varighet: normalt til fanen/økten lukkes eller innhold/historikk slettes.<br>
- Ekstern behandling: relevant tekst sendes til valgt notatleverandør når generering startes.<br><br>

<strong>Prompts og innstillinger i Workspace Set</strong><br>
- Prompts og valgte innstillinger kan lagres lokalt i nettleseren.<br>
- Eksport av Workspace Set inkluderer konfigurasjon som rekkefølge, prompts, valgte leverandører/modeller og relevante toggles, men ikke transkripsjoner, Supplerende informasjon, genererte notater, historikk, lyd, API-nøkler eller passord.<br>
- Skyeksport krypteres i nettleseren med valgt passord. Lokale JSON-eksporter er lesbare og må oppbevares sikkert.<br><br>

Leverandørenes behandling og lagring kommer i tillegg til nettleserlagringen og må kontrolleres hos hver tjeneste som brukes.<br><br>

<hr><br>

<strong>6. Kildekode og ansvar</strong><br><br>

Webappens kildekode er åpent tilgjengelig, og hovedapplikasjonen kjører i nettleseren. Utvikleren mottar ikke klinisk tekst gjennom en applikasjonsbackend. Grunnleggende, ikke-klinisk bruksstatistikk kan fortsatt samles inn slik nettstedet beskriver.<br><br>

Det genererte innholdet er et utkast. Helsepersonellet er ansvarlig for å kontrollere medisinsk korrekthet, rette feil og avgjøre hva som legges inn i pasientjournalen.
`,


  aboutModalHeading: "Om",
aboutModalText: `Denne nettsiden ble opprettet for å gi helsepersonell og andre brukere direkte tilgang til høykvalitets tale-til-tekst og klinisk notatgenerering – uten unødvendige kostnader eller mellomledd.<br><br>
Ved å bruke dine egne API-nøkler til leverandører av tale-til-tekst og tekstgenereringsmodeller kobler du deg direkte til kilden for teknologien. Dette betyr at du kun betaler den faktiske bruksprisen fastsatt av hver enkelt leverandør, uten påslag eller abonnementsavgifter fra denne nettsiden.<br><br>
Mange eksisterende leverandører tilbyr lignende tjenester, men tar betydelig mer – ofte mange ganger den reelle kostnaden for den underliggende teknologien. Denne plattformen lar deg bruke de samme modellene tilnærmet til «innkjøpspris», slik at kostnaden per konsultasjon blir svært lav.<br><br>
<strong>Nøkkelpunkter:</strong><br>
• Ingen abonnement, ingen konto kreves på denne nettsiden.<br>
• Du betaler kun direkte til API-leverandørene for det du bruker (tale-til-tekst og tekstgenerering).<br>
• Nettsiden i seg selv er helt gratis å bruke.<br><br>
`,
 
  guideModalHeading: "API nøkkel - Hvordan lage",
guideModalText: `
<strong>API-nøkler — kom i gang</strong><br><br>

Det enkleste anbefalte oppsettet for nye brukere er:<br>
1. <strong>Soniox med API-nøkkel for EU-regionen</strong> til tale-til-tekst.<br>
2. <strong>Requesty</strong> til notatgenerering.<br><br>

Dette gir tilgang til transkripsjon av høy kvalitet og et kuratert utvalg nyere notatmodeller med bare to leverandørkontoer. Alternative leverandører kan fortsatt brukes dersom virksomheten har vurdert og godkjent dem.<br><br>

<strong>Tale-til-tekst-alternativer i appen</strong><br>
- Soniox batch-transkripsjon<br>
- Soniox batch-transkripsjon med Speaker Labels<br>
- Soniox sanntidstranskripsjon<br>
- OpenAI gpt-4o-transcribe<br>
- Mistral Voxtral Mini Transcribe<br><br>

<strong>Leverandører for notatgenerering i appen</strong><br>
- Requesty: Claude Opus 5.5, Claude Sonnet 5, GPT-6 Sol, GPT-6 Luna, GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna, GPT-5.5, GPT-5 Nano, Gemini 3.8 Flash, DeepSeek V4 Pro, DeepSeek V4.1 Flash og Kimi K3<br>
- OpenAI: GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna og GPT-5 Nano<br>
- AWS Bedrock: Claude Haiku 4.5, Claude Sonnet 4.5/4.6 og Claude Opus 4.5/4.6/4.7<br>
- Mistral: Mistral Large<br><br>

<hr><br>

<strong>Soniox — anbefalt oppsett for tale-til-tekst</strong><br>
1. Opprett konto på <a href="https://soniox.com" target="_blank" rel="noopener noreferrer">soniox.com</a>.<br>
2. Legg inn betalingsinformasjon/kreditter ved behov og opprett et prosjekt.<br>
3. For EU-datalokalisering må du be om tilgang til Soniox' regionale utrullinger. Soniox' dokumentasjon ber brukere kontakte <a href="mailto:support@soniox.com">support@soniox.com</a>.<br>
4. Når regional tilgang er aktivert, oppretter eller velger du et prosjekt i regionen <strong>European Union</strong>. Prosjektet får regionsspesifikke API-nøkler.<br>
5. Kopier nøkkelen fra EU-prosjektet og lim den inn i feltet <strong>Soniox API key</strong> på forsiden.<br>
6. Velg <strong>EU</strong> som Soniox-endepunkt i appen. Både EU-prosjektnøkkelen og EU-endepunktet er nødvendig for EU-datalokalisering av innhold.<br><br>

Soniox kan brukes i batch- eller sanntidsmodus. Speaker Labels er tilgjengelig ved Soniox batch-transkripsjon og kan gjøre det lettere å skille talere i en konsultasjon. Les gjeldende <a href="https://soniox.com/docs/data-residency" target="_blank" rel="noopener noreferrer">Soniox-dokumentasjon om datalokalisering</a> før klinisk bruk.<br><br>

<hr><br>

<strong id="requesty-guide-section">Requesty — anbefalt oppsett for notatgenerering</strong><br>
Requesty er en LLM-gateway som gir tilgang til modeller fra flere utviklere gjennom én API-nøkkel. Appen sender Requesty-kall gjennom EU-gatewayen og viser bare et kuratert utvalg navngitte utrullinger som er ment for EU-databehandling og egnede personvernkontroller.<br><br>

Slik oppretter du en nøkkel:<br>
1. Gå til <a href="https://requesty.ai" target="_blank" rel="noopener noreferrer">requesty.ai</a>, velg <strong>Get started</strong> og opprett en konto.<br>
2. Legg inn kreditter eller konfigurer fakturering i Requesty-kontrollpanelet. Eventuelle prøvekreditter eller kampanjer kan endres, så kontroller gjeldende vilkår på kontoen.<br>
3. Åpne <strong>API Keys</strong> og velg <strong>Create API Key</strong>.<br>
4. Gi nøkkelen et tydelig navn, og begrens den til godkjente modeller eller en passende tilgangsliste når dette er tilgjengelig.<br>
5. Kopier nøkkelen med en gang og oppbevar den sikkert. Den vises kanskje ikke igjen.<br>
6. Lim den inn i feltet <strong>Requesty API key</strong> på forsiden.<br><br>

<strong>Viktig personverninnstilling:</strong> Requesty opplyser at forespørsler og svar ikke brukes til modelltrening. Logging av prompts og outputs på selvbetjente abonnementer er imidlertid dokumentert som aktivert som standard med 30 dagers lagring. Deaktiver logging for API-nøkkelen eller be om virksomhetsomfattende Zero Data Retention, og kontroller DPA og valgte modellruter før identifiserbare pasientopplysninger brukes. Se <a href="https://www.requesty.ai/dpa" target="_blank" rel="noopener noreferrer">Requestys DPA-informasjon</a> og <a href="https://docs.requesty.ai/features/eu-routing" target="_blank" rel="noopener noreferrer">dokumentasjon om EU-ruting</a>.<br><br>

<hr><br>

<strong>OpenAI</strong><br>
1. Opprett konto på <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a>.<br>
2. Konfigurer fakturering og opprett en API-nøkkel.<br>
3. Oppbevar nøkkelen sikkert og lim den inn i feltet <strong>OpenAI API key</strong>.<br>
4. Nøkkelen kan brukes til OpenAI tale-til-tekst og de tilgjengelige direkte OpenAI-modellene for notatgenerering.<br><br>

Kontroller gjeldende DPA, lagring og muligheter for regional databehandling før pasientopplysninger brukes. En standard API-nøkkel bør ikke automatisk behandles som kun EU eller Zero Data Retention.<br><br>

<hr><br>

<strong>Mistral</strong><br>
1. Opprett konto på <a href="https://console.mistral.ai" target="_blank" rel="noopener noreferrer">console.mistral.ai</a>.<br>
2. Konfigurer fakturering og opprett en Mistral-API-nøkkel.<br>
3. Lim nøkkelen inn i feltet <strong>Mistral API key</strong>.<br>
4. Nøkkelen kan brukes med Voxtral Mini til tale-til-tekst og Mistral Large til notatgenerering.<br><br>

Kontroller gjeldende EU-hosting, DPA, lagring og innstilling for modelltrening. Be om og dokumenter Zero Data Retention dersom virksomheten krever dette.<br><br>

<hr><br>

<strong>AWS Bedrock — valgfritt oppsett for eksisterende AWS-brukere</strong><br>
AWS Bedrock beholdes for brukere som allerede har AWS-tilgang, eller som spesifikt foretrekker egen AWS-infrastruktur. Oppsettet krever AWS-konto, regional modelltilgang og en separat backend-URL/secret for appen. Det er mer komplisert og får ikke nødvendigvis de nyeste modellene like raskt som Requesty. Det er derfor <strong>ikke anbefalt som normalt utgangspunkt for nye brukere</strong>.<br><br>

Dersom du velger Bedrock, bruker du <a href="#" data-open-guide="bedrock"><strong>Guide</strong></a>-lenken ved AWS Bedrock-feltene på forsiden. Kontroller valgt AWS-region, modelltilgang, IAM-rettigheter, logging, lagring og virksomhetens avtaler før klinisk bruk.<br><br>

<hr><br>

<strong>Før du legger inn pasientopplysninger</strong><br>
En API-nøkkel alene gjør ikke en tjeneste GDPR-kompatibel. Kontroller leverandørens DPA, underdatabehandlere, endepunkt, datalokalisering, lagring/ZDR og treningsinnstillinger; gjennomfør nødvendig DPIA/TIA; beskytt nøklene; begrens mengden pasientinformasjon; og kontroller hvert genererte notat.
`,

  priceButton: "Pris",
  priceModalHeading: "Kostnadsinformasjon",
  priceModalText: `
<div>
  <p><strong>Kostnadsinformasjon</strong></p>

  <p>
    Appen har ingen abonnementsavgift eller påslag. Du betaler valgte leverandører direkte for faktisk API-bruk.
    Priser kan endres, så tallene nedenfor er omtrentlige eksempler. Leverandørens kontrollpanel og faktura er fasiten.
  </p>

  <p><strong>Løpende prisinformasjon i appen</strong></p>
  <ul>
    <li>Omtrentlig USD-pris per én million input- og output-tokens vises ved siden av valgt notatmodell.</li>
    <li>Etter notatgenerering viser appen tokenbruk og estimert pris når leverandøren returnerer tilstrekkelige bruksdata.</li>
    <li>Reasoning-tokens, caching, rabatter, gateway-gebyrer, valutakurser og leverandørspesifikke faktureringsregler kan påvirke sluttbeløpet.</li>
  </ul>

  <hr><br>

  <p><strong>1. Tale-til-tekst</strong><br>(omtrentlig pris per minutt lyd)</p>

  <p><strong>Soniox — anbefalt</strong><br>
  Omtrent 0,0017 USD per minutt.<br>
  En konsultasjon på 15 minutter: omtrent 0,026 USD.</p>

  <p><strong>OpenAI — gpt-4o-transcribe</strong><br>
  Omtrent 0,006 USD per minutt.<br>
  En konsultasjon på 15 minutter: omtrent 0,09 USD.</p>

  <p><strong>Mistral — Voxtral Mini Transcribe</strong><br>
  Prisen kan variere med gjeldende API-tilbud. Kontroller Mistrals offisielle priser og kostnadsestimatet hos leverandøren.</p>

  <hr><br>

  <p><strong>2. Notatgenerering</strong><br>(USD per én million input-/output-tokens)</p>

  <p><strong>Requesty-modeller som nå er konfigurert i appen</strong></p>
  <ul>
    <li>Claude Opus 5.5: omtrent 4,40 / 22,00 USD</li>
    <li>Claude Sonnet 5: omtrent 2,20 / 11,00 USD</li>
    <li>GPT-6 Sol: omtrent 2,40 / 12,00 USD</li>
    <li>GPT-6 Luna: omtrent 0,12 / 0,60 USD</li>
    <li>GPT-5.6 Sol: omtrent 4,40 / 22,00 USD</li>
    <li>GPT-5.6 Terra: omtrent 2,20 / 13,20 USD</li>
    <li>GPT-5.6 Luna: omtrent 0,22 / 1,32 USD</li>
    <li>GPT-5.5: omtrent 5,00 / 30,00 USD</li>
    <li>GPT-5 Nano: omtrent 0,055 / 0,44 USD</li>
    <li>Gemini 3.8 Flash: omtrent 0,825 / 4,125 USD (nåværende endepunktsrabatt på 50 %)</li>
    <li>DeepSeek V4 Pro: omtrent 1,75 / 3,50 USD (bufret input: 0,44 USD)</li>
    <li>DeepSeek V4.1 Flash: omtrent 0,50 / 1,50 USD (bufret input: 0,05 USD)</li>
    <li>Kimi K3: omtrent 3,00 / 15,00 USD</li>
  </ul>
  <p>
    Verdiene gjenspeiler estimatene som er konfigurert i appen, og kan endres når Requesty eller den underliggende modellutrullingen endrer pris.
    Kontroller prisen ved valgt modell og Requestys faktiske bruksrapport.
  </p>

  <p><strong>Andre støttede notatleverandører</strong></p>
  <ul>
    <li><strong>OpenAI:</strong> direkte GPT-5.6 Sol-, GPT-5.6 Terra-, GPT-5.6 Luna- og GPT-5 Nano-modeller.</li>
    <li><strong>AWS Bedrock:</strong> Claude Haiku-, Sonnet- og Opus-modeller. Beholdes hovedsakelig for eksisterende AWS-brukere.</li>
    <li><strong>Mistral:</strong> Mistral Large.</li>
  </ul>
  <p>Gjeldende pris for input/output vises ved siden av valgt modell i appen.</p>

  <hr><br>

  <p><strong>3. Hva er tokens?</strong></p>
  <p>Tekstmodeller teller tokens, ikke vanlige ord. Som en svært grov regel for engelsk tekst:</p>
  <ul>
    <li>1 token er omtrent 4 tegn eller tre fjerdedeler av et ord.</li>
    <li>100 tokens er omtrent 75 ord.</li>
    <li>1 000 tokens er omtrent 750 ord.</li>
  </ul>
  <p>
    Medisinske uttrykk, norsk tekst, formatering og lange prompts kan endre forholdet. Input-tokens inkluderer prompt, transkripsjon,
    Supplerende informasjon og annen kontekst som sendes til modellen. Output-tokens er det genererte notatet og eventuell fakturerbar reasoning/output som leverandøren rapporterer.
  </p>

  <hr><br>

  <p><strong>4. Eksempel på én konsultasjon</strong></p>
  <p>
    En konsultasjon på 15 minutter kan for eksempel bruke omtrent 2 200 input-tokens og 450 output-tokens til hovednotatet.
    Den faktiske mengden avhenger mye av transkripsjonens lengde, prompt, Supplerende informasjon og valgt reasoning-nivå.
  </p>
  <ul>
    <li><strong>Soniox-transkripsjon:</strong> omtrent 0,026 USD.</li>
    <li><strong>GPT-5 Nano-notat:</strong> omtrent 0,0003 USD med eksempelets tokenmengde.</li>
    <li><strong>Gemini 3.8 Flash-notat:</strong> omtrent 0,004 USD.</li>
    <li><strong>Claude Sonnet 5-notat:</strong> omtrent 0,010 USD.</li>
    <li><strong>Claude Opus 5.5-notat:</strong> omtrent 0,020 USD.</li>
    <li><strong>GPT-5.6 Sol-notat:</strong> omtrent 0,020 USD.</li>
  </ul>
  <p>
    Ved vanlige korte konsultasjoner kan tale-til-tekst fortsatt utgjøre en stor del av totalprisen. Ved svært lang Supplerende informasjon
    kan derimot inputkostnaden til notatmodellen bli viktigere.
  </p>

  <hr><br>

  <p><strong>5. Reduser kostnaden ved lange dokumenter</strong></p>
  <p>
    Hvis du har et langt dokument, kan Secondary Note Generation-modulen bruke en rimeligere modell — for eksempel GPT-5 Nano — til å lage et kort sammendrag.
    Sammendraget kan legges inn i Supplerende informasjon før en sterkere hovedmodell lager det endelige notatet. Dette kan være betydelig billigere
    enn å sende for eksempel 50 sider direkte til en kostbar modell hver gang.
  </p>

  <hr><br>

  <p><strong>6. Eksempel på månedlig bruk</strong></p>
  <p>
    Ved 20 konsultasjoner per dag, 4 dager per uke og 4 uker per måned blir det omtrent 320 konsultasjoner.
    Med 15 minutter per konsultasjon tilsvarer det omtrent 80 timer lyd. Med en pris på omtrent 0,0017 USD per minutt vil Soniox-transkripsjon koste
    rundt 8,16 USD før eventuelle avgifter og prisendringer. Notatgenerering kommer i tillegg etter valgt modell og faktisk tokenbruk.
  </p>
  <p>
    Appen har ingen fast abonnementspris. Hvis du ikke bruker API-ene, oppstår ingen brukskostnad fra appen. Minstebeløp, forhåndsbetalte kreditter,
    avgifter eller andre leverandørvilkår kan likevel gjelde.
  </p>
</div>
`,

};

export const transcribeTranslations = {
  pageTitle: "Transkripsjonsverktøy",
  openaiUsageLinkText: "Kostnadsoversikt",
  openaiWalletLinkText: "Kreditt",
  btnFunctions: "Funksjoner",
  btnGuide: "Guide",
  btnNews: "Status/Oppdateringer",
  priceOverlay: {
    button: "Priser",
    heading: "Priser",
    intro: "Gjeldende priser for modellene som er tilgjengelige i denne appen.",
    textModels: "Tekstmodeller",
    speechToText: "Tale-til-tekst",
    model: "Modell",
    context: "Kontekst",
    input: "Input / 1M",
    output: "Output / 1M",
    billing: "Fakturering",
    price: "Pris",
    audioDuration: "Lydvarighet",
    tokenBased: "Tokenbasert",
    perMinute: "/ min",
    perHour: "/ time",
    approx: "ca.",
    close: "Lukk",
    contextNote: "Kontekst er det maksimale publiserte kontekstvinduet for den konfigurerte modellen eller ruten.",
    requestyNote: "Requesty-prisene gjelder de eksakte rutene som er konfigurert i appen. Eventuelt kontopåslag hos Requesty er ikke inkludert.",
    sttNote: "Tale-til-tekst-prisene er gjeldende offentlige pay-as-you-go-priser. Soniox faktureres etter tokens; minuttprisene som vises er omtrentlige ekvivalenter beregnet fra Soniox sine publiserte timepriser.",
  },
  backToHome: "Tilbake til forsiden",
  recordingAreaTitle: "Opptaksområde",
  recordTimer: "Opptakstimer: 0 sek",
  transcribeTimer: "Fullføringstimer: 0 sek",
  transcriptionPlaceholder: "Transkripsjonsresultatet vil vises her...",
  supplementaryInfoPlaceholder: "Supplerende informasjon (valgfritt)",
  startButton: "Start opptak",
  readFirstText: "Les først! ➔",
  stopButton: "Stopp/Fullfør",
  pauseButton: "Pause opptak",
  statusMessage: "Velkommen! Klikk på \"Start opptak\" for å begynne.",
  noteGenerationTitle: "Notatgenerering",
  generateNoteButton: "Generer notat",
  noteTimer: "Fullføringstimer: 0 sek",
  generatedNotePlaceholder: "Generert notat vil vises her...",
  customPromptTitle: "Tilpasset prompt",
  promptExportButton: "Eksporter",
  promptImportButton: "Importer",
  promptSlotLabel: "Prompt Slot:",
  customPromptPlaceholder: "Skriv inn tilpasset prompt her",
  guideHeading: "Guide & Instruksjoner",
guideText: `Velkommen til <strong>Nordlys Journal</strong>. Appen kan ta opp og transkribere samtaler og bruke den ferdige teksten til å generere et notat. Innhent alltid nødvendig samtykke før opptak, og kontroller alltid medisinsk innhold før det brukes.<br><br>

<strong>Anbefalt nettleser:</strong> Google Chrome gir den mest pålitelige støtten for alle funksjonene i appen.<br><br>

<strong>Hurtigstart</strong><br>
<ol>
  <li>Velg Workspace, transkripsjonstilbyder og eventuelle innstillinger.</li>
  <li>Trykk <strong>Start opptak</strong>. Bruk <strong>Pause</strong>, <strong>Fortsett</strong>, <strong>Stopp/Fullfør</strong> eller <strong>Abort</strong> ved behov.</li>
  <li>Velg prompt, tilbyder og modell for notatet, og trykk <strong>Generer notat</strong>. Du kan også slå på Auto-generate.</li>
</ol>

<details open>
  <summary><strong>Opptak og transkripsjon</strong></summary>
  <ul>
    <li>Velg tale-til-tekst-tilbyder før opptaket starter. Vi anbefaler Google Chrome eller Microsoft Edge.</li>
    <li><strong>Pause</strong> ferdigstiller det aktuelle lydsegmentet og lar deg fortsette senere. <strong>Stopp/Fullfør</strong> avslutter opptaket og venter på resten av transkripsjonen. <strong>Abort</strong> forkaster det aktive opptaket uten normal fullføring.</li>
    <li><strong>Speaker Labels</strong> er bare tilgjengelig med Soniox. Funksjonen forsøker å merke hvem som snakker, for eksempel Speaker 1 og Speaker 2.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Workspaces og Workspace Sets</strong></summary>
  <ul>
    <li>Et <strong>Workspace</strong> er et eget arbeidsområde i nettleserfanen. Hvert Workspace har egne tekster, valgte prompts, tilbydere, modeller, innstillinger og aktive prosesser. Klonede Workspaces deler historikk med klonefamilien, mens Workspaces som legges til med + har separat historikk. Bytte mellom Workspaces stopper ikke opptak eller generering.</li>
    <li>Navnet følger normalt navnet på den valgte promptplassen. Bruk <strong>+</strong> for å legge til og <strong>×</strong> for å lukke et Workspace. Du kan ha opptil 12 åpne Workspaces.</li>
    <li>Alle åpne Workspaces utgjør et <strong>Workspace Set</strong>. Import og eksport kan gjøres med lokal JSON-fil, Microsoft OneDrive eller Google Drive.</li>
    <li>Et Workspace Set lagrer antall og rekkefølge, navn, valgte promptplasser med prompttekst og navn, tilbydere, modeller, reasoning-valg, relevante avkrysningsbokser og åpne moduler. Det tar ikke med transkripsjoner, supplerende informasjon, notater, historikk, lyd, API-nøkler, passord eller andre pasientopplysninger.</li>
    <li>Skykopier krypteres i nettleseren med passordet du velger. Lokale JSON-filer er lesbare og må oppbevares sikkert.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Mini Panel</strong></summary>
  <ul>
    <li><strong>Google Chrome anbefales for Mini Panel.</strong> Andre nettlesere fungerer kanskje ikke som de skal med denne funksjonen.</li>
    <li>Åpne panelet med <strong>Mini-panel</strong>-knappen. Ikonet øverst til høyre bytter mellom de to visningene.</li>
    <li><strong>Mini Panel — Browser Tabs</strong> styrer separate Nordlys Journal-faner. Dette passer når du vil bruke ett Workspace per nettleserfane.</li>
    <li><strong>Mini Panel — Workspaces</strong> viser alle Workspaces i den valgte Nordlys Journal-fanen. Dette passer når du vil arbeide med flere oppgaver i samme fane.</li>
    <li>Du kan bytte visning eller Workspace mens opptak og generering fortsetter i bakgrunnen.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Auto-generate, Auto-copy og primær notatgenerering</strong></summary>
  <ul>
    <li><strong>Auto-generate</strong> starter notatgenereringen automatisk når transkripsjonen er ferdig. Når funksjonen er av, bruker du <strong>Generer notat</strong> manuelt.</li>
    <li><strong>Auto-copy</strong> kan automatisk kopiere den ferdige transkripsjonen eller det ferdige notatet. Funksjonen krever den tilhørende Chrome-utvidelsen. Manuelle kopieringsknapper fungerer uavhengig av dette.</li>
    <li>Hovednotatet bruker transkripsjonen, eventuell valgt prompt og teksten i <strong>Supplerende informasjon</strong>. Velg tilbyder, modell og eventuelt reasoning-nivå før generering.</li>
    <li>AI-genererte notater kan inneholde feil eller utelate opplysninger. Les og valider alltid notatet før det lagres eller sendes.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Secondary Note Generation</strong></summary>
  <p>Denne modulen er nyttig når du har et langt dokument som først bør forkortes. Lim teksten inn i kildefeltet, velg en egen prompt og modell, og generer et sammendrag. Resultatet kan kopieres automatisk eller manuelt til <strong>Supplerende informasjon</strong>.</p>
  <p>Du kan for eksempel bruke en rimelig modell som GPT-5 Nano via Requesty til å oppsummere et dokument på 50 sider. Hovedmodellen, for eksempel GPT-5.6 Sol eller Claude Opus 5.5, mottar da det korte sammendraget sammen med transkripsjonen i stedet for hele dokumentet. Dette kan redusere tokenbruken og kostnaden betydelig. Kontroller sammendraget før det brukes som medisinsk kontekst.</p>
</details><br>

<details>
  <summary><strong>Pris og tokenbruk</strong></summary>
  <ul>
    <li>Ved den valgte modellen vises pris i USD per én million input- og output-tokens når appen har prisdata.</li>
    <li>Etter notatgenerering vises tokenbruk og estimert pris når tilbyderens svar inneholder nødvendige bruksdata. Enkelte tilbydere kan rapportere en mer presis kostnad.</li>
    <li><strong>Kostnadsoversikt</strong> åpner lenker til tilbydernes egne sider for bruk og fakturering. Prisene i appen er veiledende; tilbyderens faktura er fasiten.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Promptplasser, historikk, Redactor og OCR</strong></summary>
  <ul>
    <li>Du har 20 promptplasser. De huskes i denne nettleseren og kan importeres eller eksporteres som JSON eller som krypterte kopier via OneDrive og Google Drive.</li>
    <li>Historikkolonnen viser de 30 siste fullførte primære notatgenereringene i det aktive Workspace-et. Klikk på et element for å se transkripsjon, supplerende informasjon og generert notat. Klonede Workspaces deler historikk med klonefamilien, mens andre Workspaces har separat historikk.</li>
    <li><strong>Redactor</strong> kan fjerne valgte generelle og spesifikke begreper fra transkripsjonen og supplerende informasjon. Kontroller alltid resultatet før teksten sendes videre.</li>
    <li><strong>OCR</strong> kan hente tekst fra et innlimt skjermbilde eller en bildefil og sende teksten til listen over spesifikke begreper eller til råtekstfeltet.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Lagring og personvern</strong></summary>
  <ul>
    <li>Arbeidstekst og Workspace-historikk beholdes i den aktuelle nettleserfanens økt og fjernes når faneøkten avsluttes. <strong>Clear</strong> kan brukes til å tømme aktivt innhold eller historikk.</li>
    <li>API-nøkler legges ikke i localStorage. De oppbevares bare for den aktive nettleserøkten og kan tømmes manuelt fra forsiden.</li>
    <li>Data sendes til den tilbyderen og regionen du velger. Lagring, databehandling og eventuell bruk av data styres av valgt tilbyder, konto, oppsett og gjeldende vilkår. Kontroller at løsningen er egnet for opplysningene du behandler.</li>
  </ul>
</details><br><br>

Klikk på <strong>Guide</strong> igjen eller bruk lukkeknappen for å gå tilbake til hovedvisningen.
`,

  redactorToggleShow: "Vis redactor",
  redactorToggleHide: "Skjul redactor",
  redactorTitle: "Redactor",
  redactorHelp: "Legg til ett begrep per linje. Både generelle og spesifikke begreper brukes når du klikker Redact, som da vil fjerne disse begrepene fra diktat- og supplerende informasjon- innholded. Generelle begreper beholdes så lenge denne fanen er åpen, men tømmes når fanen lukkes.",
  redactorOcrSectionTitle: "Skjermbilde → OCR",
  redactorOcrMiniHelp: "Bruk Windows + Shift + S, og klikk deretter Paste image. Du kan også trykke Ctrl + V mens bildefeltet er fokusert, eller laste opp en bildefil.",
  redactorPasteImageButton: "Paste image",
  redactorUploadImageButton: "Last opp bilde",
  redactorClearImageButton: "Tøm bilde",
  redactorFetchSpecificButton: "Fetch OCR → Specific",
  redactorFetchRawButton: "Fetch OCR → Raw text",
  redactorImageFrameAriaLabel: "OCR-bildeforhåndsvisning. Lim inn et bilde her med Ctrl pluss V.",
  redactorImagePreviewAlt: "OCR-skjermbilde forhåndsvisning",
  redactorImagePlaceholder: "Intet bilde lastet inn ennå. Lim inn et skjermbilde her eller last opp et bilde.",
  redactorGeneralTermsLabel: "Generelle begreper",
  redactorGeneralTermsPlaceholder: "Generelle begreper (ett per linje)\nf.eks. sykehus\nNavn",
  redactorImportGeneralButton: "Importer General.txt",
  redactorExportGeneralButton: "Eksporter General.txt",
  redactorClearGeneralButton: "Tøm generelle",
  redactorSpecificTermsLabel: "Spesifikke begreper",
  redactorSpecificTermsPlaceholder: "Spesifikke begreper (ett per linje)\nOla Nordmann\n12345678",
  redactorClearSpecificButton: "Tøm spesifikke",
  redactorApplyButton: "Redact",
  redactorRawOutputLabel: "OCR-råtekst",
  redactorRawOutputPlaceholder: "Rå OCR-tekst vises her uten formatering eller opprydding. Nyttig når du bare vil kopiere transkripsjonen.",
  redactorCopyRawButton: "Kopier råtekst",
  redactorClearRawButton: "Tøm råtekst",
  redactorBirthdateLabel: "Fødselsdatohjelper",
  redactorBirthdatePlaceholder: "DDMMYY, f.eks. 180289",
  redactorAddBirthdateButton: "Legg til datoer",
  redactorStatusGeneralCleared: "Generelle begreper tømt.",
  redactorStatusSpecificCleared: "Spesifikke begreper og fødselsdato tømt.",
  redactorStatusSpecificNormalized: "Spesifikke begreper ryddet og normalisert.",
  redactorStatusNeedTerms: "Legg til minst ett generelt eller spesifikt begrep som skal sladdes.",
  redactorStatusRawEmpty: "Råtekst er tom.",
  redactorStatusRawCopied: "Råtekst kopiert til utklippstavlen.",
  redactorStatusRawCopyError: "Kunne ikke kopiere råtekst i denne nettleserfanen.",
  redactorStatusRawCleared: "Råtekst tømt.",
  redactorStatusNoClipboardImage: "Fant ikke noe bilde i utklippstavlen. Bruk Windows + Shift + S først, og prøv igjen.",
  redactorStatusClipboardReadError: "Kunne ikke lese et bilde fra utklippstavlen.",
  redactorStatusImageReady: "Bilde limt inn og klart for OCR.",
  redactorStatusImageCleared: "Bilde tømt.",
  redactorStatusLoadedImagePrefix: "Lastet bilde:",
  redactorStatusPasteHint: "Lim inn fra utklippstavlen med Ctrl + V, eller bruk knappen Paste image.",
  redactorStatusNoImageForOcr: "Ingen bilde å kjøre OCR på. Lim inn eller last opp et bilde først.",
  redactorStatusOcrRunningPrefix: "OCR kjører…",
  redactorStatusOcrLoadingLanguage: "OCR laster språkdata…",
  redactorStatusOcrStarting: "OCR starter…",
  redactorStatusOcrNoText: "Ingen tekst ble oppdaget i bildet.",
  redactorStatusOcrNoUsableSpecific: "OCR ble fullført, men ga ingen brukbare spesifikke begreper.",
  redactorStatusOcrNoNewTerms: "OCR ble fullført ({lang}), men ingen nye unike begreper ble lagt til.",
  redactorStatusOcrComplete: "OCR fullført ({lang}) → la til {count} {termLabel} i Specific.",
  redactorStatusOcrCompleteWithBirthdate: "OCR fullført ({lang}) → la til {count} {termLabel} i Specific. Fødselsdatofeltet ble autofylt med {birthdate}.",
  redactorStatusOcrErrorPrefix: "OCR-feil:",
  redactorStatusBirthdateInvalid: "Skriv inn en gyldig 6-sifret fødselsdato i DDMMYY-format, for eksempel 180289.",
  redactorStatusBirthdateAlreadyPresent: "Disse fødselsdatoformatene finnes allerede i Specific terms.",
  redactorStatusBirthdateAdded: "La til {count} fødselsdatoformat {targetLabel}.",
  redactorStatusRedacted: "Sladdet {count} {termLabel} i Transcript og Supplementary information.",
  redactorStatusNoMatch: "Fant ingen matchende tekst i Transcript eller Supplementary information.",
  redactorStatusLoadedGeneralFile: "Lastet {fileName} inn i General terms.",
  redactorStatusReadGeneralFileError: "Kunne ikke lese {fileName}: {error}",
  redactorStatusSavedGeneralPicker: "Lagret General.txt til valgt plassering.",
  redactorStatusSavedGeneralDownload: "Lagret General.txt med nettleserens nedlastingsflyt.",
  redactorStatusSaveCanceled: "Lagring avbrutt.",
  redactorStatusExportGeneralError: "Kunne ikke eksportere General.txt: {error}",
  redactorOneTerm: "begrep",
  redactorManyTerms: "begreper",


  // Sekundær notatgenerator
  secondaryNote: {
    showButton: "Vis sekundær notatgenerator",
    hideButton: "Skjul sekundær notatgenerator",
    title: "Sekundær notatgenerator",
    sourceLabel: "Kildetekst",
    sourcePlaceholder: "Lim inn eller skriv kildetekst her...",
    providerLabel: "Leverandør:",
    modelLabel: "Modell:",
    modeLabel: "Modus:",
    reasoningLabel: "Resonneringsnivå:",
    thinkingLabel: "Tenkenivå:",
    promptLabel: "Prompt:",
    generateButton: "Generer notat",
    abortButton: "Avbryt",
    copyButton: "Kopier",
    copiedButton: "Kopiert",
    pushButton: "Sett inn",
    clearOnGenerateLabel: "Tøm Tilleggsopplysninger ved generering",
    autoTransferLabel: "Kopier resultatet automatisk til Tilleggsopplysninger",
    sourceDateLabel: "Dato",
    sourceDateToggleAriaLabel: "Behold dagens dato i kildeteksten",
    sourceDateHelp: 'Når PÅ: Holder linjen "Dagens dato er DD.MM.YYYY" øverst i kildeteksten og legger den inn igjen etter oppdatering av siden. Når AV: Fjerner denne datolinjen fra kildeteksten.',
    outputPlaceholder: "Generert notat vises her...",
    timerLabel: "Notatgenereringstid",
    statusGenerating: "Genererer…",
    statusCompleted: "Tekstgenerering fullført!",
    statusFailed: "Generering mislyktes",
    statusAborted: "Notatgenerering avbrutt.",
    noSourceText: "Ingen kildetekst",
    noPromptSelected: "Ingen prompt valgt",
    noOutputToPush: "Ingen notat å kopiere over ennå",
    transferred: "Resultatet ble kopiert til Tilleggsopplysninger."
  },
};

export default { indexTranslations, transcribeTranslations };
