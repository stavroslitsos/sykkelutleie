export const indexTranslations = {
  pageTitle: "Transkribera anteckningar",
  headerTitle: "Transkribera anteckningar",
  headerSubtitle: "Avancerad AI-driven tal-till-text och anteckningsgenerering för vårdkonsultationer",
  startText: "Du kan nu också välja mellan olika modeller från olika leverantörer. Har du ingen API-nyckel ännu? Klicka på «API-nyckel – Hur du skapar» för enkel vägledning.",
  apiPlaceholder: "Skriv in OpenAI API-nyckel här",
  enterButton: "Gå till transkriberingsverktyget",
  guideButton: "API-guide – Så använder du den",
  securityButton: "Säkerhet",
  aboutButton: "Om",
  // Accordion tab #1 (left): AI models
  modelsModalHeading: "AI-modeller",
  modelsModalText: `
<div>
  <p><strong>Modellval i Nordlys Journal</strong></p>
  <p>Appen låter dig välja separata modeller för <strong>tal-till-text (STT)</strong> och <strong>anteckningsgenerering</strong>. En korrekt transkription ger textmodellen ett bättre underlag, medan en stark anteckningsmodell är bättre på att strukturera innehållet och följa vald prompt.</p>

  <hr><br>
  <p><strong>1) Tal-till-text-modeller</strong></p>
  <ul>
    <li><strong>Soniox</strong> – batch- eller realtidstranskription, med valfria talaretiketter</li>
    <li><strong>OpenAI</strong> – gpt-4o-transcribe</li>
    <li><strong>Mistral</strong> – Voxtral Mini Transcribe</li>
  </ul>
  <p><strong>Praktisk STT-rangordning</strong></p>
  <ol>
    <li><strong>Soniox</strong> – rekommenderat. Mycket god kvalitet, stöd för talaretiketter och möjlighet till EU-regional slutpunkt.</li>
    <li><strong>OpenAI gpt-4o-transcribe</strong> – ett starkt alternativ, men standardkonfigurationen ger inte samma enkla väg till EU-dataresidens.</li>
    <li><strong>Mistral Voxtral Mini</strong> – ett prisvärt europeiskt alternativ när kostnaden väger tyngst.</li>
  </ol>
  <p>För att hålla ljud och transkriptionsinnehåll inom EU med Soniox måste du använda en API-nyckel från ett Soniox-projekt i EU-regionen och välja EU-slutpunkten i appen. Talaretiketter kan hjälpa anteckningsmodellen att skilja mellan personer i ett samtal.</p>

  <hr><br>
  <p><strong>2) Leverantörer och modeller för anteckningsgenerering</strong></p>
  <p><strong>Requesty — rekommenderas för nya användare</strong></p>
  <p>Requesty ger tillgång till modeller från flera utvecklare genom en enda API-nyckel. Valen i appen är avsiktligt begränsade till utvalda driftsättningar som är avsedda för behandling inom EU, utan återanvändning för modellträning och med lämpliga inställningar för lagring.</p>
  <ul>
    <li>Claude Opus 5.5</li><li>Claude Sonnet 5</li><li>GPT-6 Sol</li><li>GPT-6 Luna</li><li>GPT-5.6 Sol</li><li>GPT-5.6 Terra</li><li>GPT-5.6 Luna</li><li>GPT-5.5</li><li>GPT-5 Nano</li><li>Gemini 3.8 Flash</li><li>DeepSeek V4 Pro</li><li>DeepSeek V4.1 Flash</li><li>Kimi K3</li>
  </ul>
  <p><strong>Andra leverantörer som stöds</strong></p>
  <ul>
    <li><strong>OpenAI</strong> – GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna och GPT-5 Nano</li>
    <li><strong>AWS Bedrock</strong> – Claude Haiku 4.5, Claude Sonnet 4.5/4.6 och Claude Opus 4.5/4.6/4.7</li>
    <li><strong>Mistral</strong> – Mistral Large</li>
  </ul>
  <p>AWS Bedrock finns kvar för användare som redan har AWS-åtkomst eller vill hantera en egen AWS-miljö. Installationen är betydligt mer komplicerad och modellutbudet kan ligga efter de senaste lanseringarna. Det är därför <strong>inte den rekommenderade startpunkten för nya användare</strong>.</p>

  <p><strong>Praktisk vägledning för Requesty-modeller</strong></p>
  <ul>
    <li><strong>Högsta kvalitet:</strong> Claude Opus 5.5 och GPT-5.6 Sol</li>
    <li><strong>Starka allroundval:</strong> Claude Sonnet 5, GPT-5.6 Terra, GPT-5.5 och DeepSeek V4 Pro</li>
    <li><strong>Snabbhet och värde:</strong> GPT-5.6 Luna, Gemini 3.8 Flash och DeepSeek V4.1 Flash</li>
    <li><strong>Billigast för sammanfattning och förbehandling:</strong> GPT-5 Nano</li>
    <li><strong>Ytterligare alternativ:</strong> Kimi K3</li>
  </ul>
  <p>Claude Opus 5.5 stöder reasoning-nivåerna Low, Medium och High i appen; standardvalet är Low.</p>
  <p>GPT-6 Sol och GPT-6 Luna stöder reasoning-nivåerna None, Low, Medium och High i appen; om inget tidigare reasoning-val finns sparat är standardvalet Low.</p>
  <p>DeepSeek V4 Pro och DeepSeek V4.1 Flash stöder reasoning-nivåerna None, Low, High och Max; appens standardval är Low.</p>
  <p>För långa dokument kan en billigare modell, till exempel GPT-5 Nano, först skapa en kort sammanfattning för Kompletterande information. En starkare huvudmodell kan sedan skapa slutanteckningen utan att ta emot hela dokumentet, vilket kan sänka kostnaden avsevärt.</p>

  <hr><br>
  <p><strong>Pris kontra kvalitet</strong></p>
  <p>De starkaste modellerna kostar oftast mer per token. Appen visar ungefärligt USD-pris per en miljon input- och output-token bredvid vald modell och, när användningsdata finns, en uppskattad kostnad efter genereringen.</p>

  <hr><br>
  <p><strong>Rekommenderad konfiguration för nya kliniska användare</strong></p>
  <p>Börja med <strong>Soniox med EU-projekt, EU-API-nyckel och EU-slutpunkt</strong> för tal-till-text, kombinerat med <strong>Requesty</strong> för anteckningsgenerering.</p>
  <p>Ingen leverantör eller modell gör arbetsflödet automatiskt GDPR-kompatibelt. Verksamheten måste fortfarande kontrollera DPA, slutpunkt och lagringsinställningar, genomföra nödvändiga DPIA/TIA-bedömningar och granska varje anteckning före klinisk användning.</p>
</div>
`,

  securityModalHeading: "Integritet",
  securityModalText: `
<strong>Integritet och databehandling</strong><br><br>

Denna webbapp är ett verktyg för tal-till-text och anteckningsgenerering. Som hälso- och sjukvårdspersonal och personuppgiftsansvarig ansvarar du för att användningen följer gällande regelverk, bland annat GDPR, den norska hälso- och sjukvårdspersonallagen och Normen för informationssäkerhet i hälso- och omsorgssektorn.<br><br>
Utvecklaren kan inte avgöra om den enskilda verksamhetens användning är laglig. Detta är inte juridisk rådgivning. Involvera dataskyddsombud eller juridisk rådgivare vid behov.<br><br>

<hr><br>

<strong>1. Rekommenderad konfiguration för nya användare</strong><br><br>

<strong>Tal-till-text</strong><br>
Den rekommenderade lösningen är Soniox med EU-projekt, EU-API-nyckel och EU-endpoint. Soniox uppger att ljud- och transkriptionsinnehåll förblir i den valda regionen när projektets regionala nyckel och rätt API-domän används. Soniox uppger också att inskickat innehåll inte används för modellträning. Konto-, fakturerings- och användningsmetadata kan ändå behandlas utanför den valda regionen. När Soniox används i denna app kommer ljudinspelningar och producerade diktat alltid att raderas från Soniox servrar så snart transkriptionsjobbet är slutfört.<br><br>

<strong>Anteckningsgenerering</strong><br>
Den rekommenderade lösningen för nya användare är Requesty. Appen skickar Requesty-anrop genom företagets EU-gateway och visar ett medvetet kurerat urval av namngivna modelldistributioner som är avsedda för databehandling inom EU, utan återanvändning för modellträning och med lämpliga kontrollmöjligheter för datalagring. Detta ger tillgång till flera nyare modeller genom en enda Requesty-API-nyckel.<br><br>

Appens modellval aktiverar inte i sig Zero Data Retention på Requesty-kontot. Requesty dokumenterar att loggning av prompts och outputs på självbetjäningsabonnemang är aktiverad som standard med 30 dagars lagring. Loggning kan och bör inaktiveras per API-nyckel, och organisationsomfattande Zero Data Retention kan begäras från Requesty.<br><br>

<hr><br>

<strong>2. Hur webbappen behandlar data</strong><br><br>

- Ljud spelas in och behandlas tillfälligt i webbläsarens minne.<br>
- Ljudet skickas krypterat via HTTPS till den valda tal-till-text-leverantören: Soniox, OpenAI eller Mistral/Voxtral.<br>
- Transkriptionen visas i valt Workspace i webbläsaren.<br>
- När du genererar en anteckning skickas transkriptionen, vald prompt och eventuell Kompletterande information till den valda anteckningsleverantören.<br>
- När Requesty används skickas begäran från webbläsaren till Requestys EU-gateway, som vidarebefordrar den till den specifikt valda modelldistributionen (ZDR, ingen modellträning, med databehandling uteslutande inom EU).<br>
- Anteckningsutkastet returneras till webbläsaren via en krypterad anslutning.<br><br>

Själva webbappen har ingen applikationsserver som lagrar ljud, transkriptioner eller anteckningar. Kommunikationen sker mellan din egen webbläsare och de tjänster du väljer.<br><br>

<hr><br>

<strong>3. API-nycklar och inloggningsuppgifter</strong><br><br>

Du använder egna leverantörsnycklar eller, för AWS Bedrock, en egen backend-URL och secret. Webbappens utvecklare tar inte emot dessa uppgifter eller det kliniska innehåll som skickas genom dem.<br><br>

API-nycklar som skrivs in på startsidan lagras tillfälligt i webbläsarens SessionStorage och tas bort när fliken/sessionen stängs eller när du väljer Clear keys. Om du exporterar en krypterad säkerhetskopia av nycklarna används lösenordet lokalt i webbläsaren för att kryptera filen innan den sparas eller laddas upp.<br><br>

Behandla API-nycklar, säkerhetskopior och lösenord som konfidentiell information. Använd individuella nycklar, leverantörens förbrukningsgränser och åtkomstbegränsningar där dessa finns, och spärra nyckeln omedelbart om den kan ha exponerats.<br><br>

<hr><br>

<strong>4. Leverantörsspecifika hänsyn</strong><br><br>

<strong>Soniox EU</strong><br>
EU-datalokalisering kräver ett Soniox-projekt som skapats i EU-regionen, API-nyckeln som tillhör detta projekt och att rätt EU-endpoint är vald i appen. Soniox uppger att innehållsdata då förblir i EU-regionen och inte används för modellträning. Kontrollera lagrings-/raderingsrutiner och ingå nödvändigt avtal för verksamheten.<br><br>

<strong>Requesty</strong><br>
Appen använder Requestys EU-gateway och fasta, kurerade modellrutter i stället för en obegränsad modellväljare. Requesty uppger att prompts och svar inte används för modellträning. EU-gatewayen håller Requestys egen behandling och lagring inom EU, medan fullständig EU-datalokalisering också kräver en EU-värdbaserad modelldistribution. Appen är utformad för att välja sådana distributioner, men användaren måste fortfarande kontrollera aktuella modelldetaljer och inaktivera prompt-/output-loggning för API-nyckeln eller få organisationsomfattande ZDR innan identifierbara patientuppgifter används.<br><br>

<strong>AWS Bedrock</strong><br>
Bedrock finns kvar för användare som redan har AWS-åtkomst eller som föredrar egen AWS-infrastruktur. Lösningen kräver en separat backend och noggrann regional konfiguration. Den är mer komplicerad och rekommenderas inte längre som utgångspunkt för nya användare, men kan fortfarande passa verksamheter med en etablerad och godkänd AWS-miljö.<br><br>

<strong>Mistral</strong><br>
Mistral tillhandahåller Voxtral för tal-till-text och Mistral Large för anteckningsgenerering i appen. Kontrollera aktuell driftregion, DPA, lagringsinställning och träningspreferens. Om användningen kräver Zero Data Retention måste detta vara beviljat, aktiverat och dokumenterat innan patientuppgifter skickas.<br><br>

<strong>OpenAI</strong><br>
OpenAI är fortfarande tillgängligt för direkt tal-till-text och anteckningsgenerering. Standard-API-data används som utgångspunkt inte för modellträning, men regional behandling och lagring beror på produkt, konto och avtalskonfiguration. Utgå inte från att en vanlig direkt API-nyckel automatiskt ger behandling endast inom EU eller Zero Data Retention. Kontrollera aktuella villkor och genomför nödvändig TIA.<br><br>

<hr><br>

<strong>5. Översikt över lokal och extern lagring</strong><br><br>

<strong>API-nycklar och backend-uppgifter</strong><br>
- Lagras i: webbläsarens SessionStorage.<br>
- Varaktighet: tills fliken/sessionen stängs eller nycklarna raderas.<br>
- Åtkomst: användaren och den aktuella webbläsarsessionen.<br><br>

<strong>Ljud under inspelning</strong><br>
- Lagras i: webbläsarens minne under inspelning och behandling.<br>
- Varaktighet: tillfälligt; appen behåller inget permanent lokalt ljudarkiv.<br>
- Extern behandling: den valda STT-leverantören tar emot ljudet.<br><br>

<strong>Transkriptioner, Kompletterande information och genererade anteckningar</strong><br>
- Lagras i: den aktiva webbläsarflikens session och tillhörande Workspace-/historikfunktioner.<br>
- Varaktighet: normalt tills fliken/sessionen stängs eller innehållet/historiken raderas.<br>
- Extern behandling: relevant text skickas till den valda anteckningsleverantören när generering startas.<br><br>

<strong>Prompts och inställningar i Workspace Set</strong><br>
- Prompts och valda inställningar kan lagras lokalt i webbläsaren.<br>
- Export av Workspace Set omfattar konfiguration som ordningsföljd, prompts, valda leverantörer/modeller och relevanta toggles, men inte transkriptioner, Kompletterande information, genererade anteckningar, historik, ljud, API-nycklar eller lösenord.<br>
- Molnexport krypteras i webbläsaren med valt lösenord. Lokala JSON-exporter är läsbara och måste förvaras säkert.<br><br>

Leverantörernas behandling och lagring tillkommer utöver webbläsarlagringen och måste kontrolleras hos varje tjänst som används.<br><br>

<hr><br>

<strong>6. Källkod och ansvar</strong><br><br>

Webbappens källkod är öppet tillgänglig, och huvudapplikationen körs i webbläsaren. Utvecklaren tar inte emot klinisk text genom en applikationsbackend. Grundläggande, icke-klinisk användningsstatistik kan fortfarande samlas in enligt webbplatsens beskrivning.<br><br>

Det genererade innehållet är ett utkast. Hälso- och sjukvårdspersonalen ansvarar för att kontrollera medicinsk korrekthet, rätta fel och avgöra vad som förs in i patientjournalen.
`,

  aboutModalHeading: "Om",
  aboutModalText: `Denna webbplats skapades för att ge vårdpersonal och andra användare direkt tillgång till tal-till-text av hög kvalitet och klinisk anteckningsgenerering – utan onödiga kostnader eller mellanhänder.<br><br>
Genom att använda dina egna API-nycklar till leverantörer av tal-till-text och textgenereringsmodeller kopplar du dig direkt till källan för tekniken. Detta innebär att du endast betalar det faktiska användningspriset som fastställs av varje leverantör, utan påslag eller abonnemangsavgifter från denna webbplats.<br><br>
Många befintliga leverantörer erbjuder liknande tjänster, men tar betydligt mer – ofta många gånger den verkliga kostnaden för den underliggande tekniken. Denna plattform låter dig använda samma modeller i princip till «inköpspris», så att kostnaden per konsultation blir mycket låg.<br><br>
<strong>Nyckelpunkter:</strong><br>
• Ingen prenumeration, inget konto krävs på denna webbplats.<br>
• Du betalar endast direkt till API-leverantörerna för det du använder (tal-till-text och textgenerering).<br>
• Själva webbplatsen är helt gratis att använda.<br><br>
`,
 
  guideModalHeading: "API-nyckel – så kommer du igång",
  guideModalText: `
<strong>API-nycklar — kom igång</strong><br><br>
Den enklaste rekommenderade konfigurationen för nya användare är:<br>
1. <strong>Soniox med EU-regionnyckel</strong> för tal-till-text.<br>
2. <strong>Requesty</strong> för anteckningsgenerering.<br><br>

<strong>STT-alternativ:</strong> Soniox batch, Soniox batch med talaretiketter, Soniox realtid, OpenAI gpt-4o-transcribe och Mistral Voxtral Mini Transcribe.<br><br>
<strong>Anteckningsleverantörer:</strong> Requesty (Claude Opus 5.5, Claude Sonnet 5, GPT-6 Sol, GPT-6 Luna, GPT-5.6 Sol/Terra/Luna, GPT-5.5, GPT-5 Nano, Gemini 3.8 Flash, DeepSeek V4 Pro, DeepSeek V4.1 Flash och Kimi K3), OpenAI (GPT-5.6 Sol/Terra/Luna och GPT-5 Nano), AWS Bedrock (Claude Haiku/Sonnet/Opus) och Mistral Large.<br><br>

<hr><br>
<strong>Soniox — rekommenderad STT-konfiguration</strong><br>
1. Skapa konto på <a href="https://soniox.com" target="_blank" rel="noopener noreferrer">soniox.com</a> och lägg till betalning/krediter.<br>
2. Begär åtkomst till regionala driftsättningar via <a href="mailto:support@soniox.com">support@soniox.com</a>.<br>
3. Skapa eller välj ett projekt i regionen <strong>European Union</strong> och kopiera dess regionspecifika nyckel.<br>
4. Klistra in nyckeln i fältet <strong>Soniox API key</strong> och välj <strong>EU</strong> som Soniox-slutpunkt. Både EU-nyckeln och EU-slutpunkten krävs.<br><br>
Använd länken <strong>Guide</strong> bredvid Soniox-fältet för fullständig steg-för-steg-hjälp och läs Soniox aktuella dokumentation om dataresidens.<br><br>

<hr><br>
<strong>Requesty — rekommenderad anteckningskonfiguration</strong><br>
1. Skapa konto på <a href="https://requesty.ai" target="_blank" rel="noopener noreferrer">requesty.ai</a> och lägg till krediter eller betalning.<br>
2. Öppna <strong>API Keys</strong>, skapa en ny nyckel och begränsa den till godkända modeller/Access Lists där det är möjligt.<br>
3. Kopiera nyckeln säkert och klistra in den i fältet <strong>Requesty API key</strong>.<br>
4. Stäng av prompt-/svarsloggning för nyckeln eller begär organisationsomfattande Zero Data Retention innan identifierbara patientuppgifter används. Kontrollera DPA och modellrutter.<br><br>
Använd länken <strong>Guide</strong> bredvid Requesty-fältet för detaljer om konto, krediter, nyckel, modellåtkomst, EU-routing och sekretessinställningar.<br><br>

<hr><br>
<strong>OpenAI</strong><br>
Skapa konto på <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a>, konfigurera betalning, skapa en API-nyckel och klistra in den i OpenAI-fältet. Kontrollera aktuell DPA, lagring och regional behandling; en standardnyckel ska inte automatiskt betraktas som EU-only eller ZDR.<br><br>

<strong>Mistral</strong><br>
Skapa konto på <a href="https://console.mistral.ai" target="_blank" rel="noopener noreferrer">console.mistral.ai</a>, konfigurera betalning och skapa en nyckel. Den kan användas med Voxtral Mini och Mistral Large. Kontrollera EU-hosting, DPA, lagring och ZDR.<br><br>

<strong>AWS Bedrock — valfritt för befintliga AWS-användare</strong><br>
Bedrock kräver AWS-konto, regional modellåtkomst och en separat backend-URL/hemlighet. Det är mer komplicerat och rekommenderas inte som normal startpunkt för nya användare. Använd <a href="#" data-open-guide="bedrock"><strong>Guide</strong></a> bredvid AWS-fälten om du väljer denna lösning.<br><br>

<hr><br>
<strong>Innan patientuppgifter matas in</strong><br>
En API-nyckel gör inte en tjänst automatiskt GDPR-kompatibel. Kontrollera DPA, underbiträden, slutpunkt, dataresidens, lagring/ZDR och träningsinställningar, genomför DPIA/TIA, skydda uppgifterna, minimera patientinformationen och granska varje genererad anteckning.
`,

  priceButton: "Pris",
  priceModalHeading: "Kostnadsinformation",
  priceModalText: `
<div>
  <p><strong>Kostnadsinformation</strong></p>
  <p>Appen har ingen abonnemangsavgift eller marginal. Du betalar vald leverantör direkt för faktisk API-användning. Priser kan ändras; leverantörens kontrollpanel och faktura gäller.</p>

  <p><strong>Prisvisning i appen</strong></p>
  <ul>
    <li>Ungefärligt USD-pris per en miljon input- och output-token visas bredvid vald anteckningsmodell.</li>
    <li>Efter generering visas tokenanvändning och uppskattad kostnad när leverantören returnerar tillräckliga data.</li>
    <li>Reasoning-token, cache, rabatter, gatewayavgifter, växelkurs och särskilda faktureringsregler kan påverka slutbeloppet.</li>
  </ul>

  <hr><br>
  <p><strong>1. Tal-till-text</strong> (ungefärligt pris per ljudminut)</p>
  <p><strong>Soniox — rekommenderas:</strong> cirka 0,0017 USD/minut; 15 minuter cirka 0,026 USD.</p>
  <p><strong>OpenAI gpt-4o-transcribe:</strong> cirka 0,006 USD/minut; 15 minuter cirka 0,09 USD.</p>
  <p><strong>Mistral Voxtral Mini:</strong> kontrollera Mistrals aktuella officiella pris.</p>

  <hr><br>
  <p><strong>2. Anteckningsgenerering</strong> (USD per en miljon input-/output-token)</p>
  <ul>
    <li>Claude Opus 5.5: cirka 4,40 / 22,00 USD</li>
    <li>Claude Sonnet 5: cirka 2,20 / 11,00 USD</li>
    <li>GPT-6 Sol: cirka 2,40 / 12,00 USD</li>
    <li>GPT-6 Luna: cirka 0,12 / 0,60 USD</li>
    <li>GPT-5.6 Sol: cirka 4,40 / 22,00 USD</li>
    <li>GPT-5.6 Terra: cirka 2,20 / 13,20 USD</li>
    <li>GPT-5.6 Luna: cirka 0,22 / 1,32 USD</li>
    <li>GPT-5.5: cirka 5,00 / 30,00 USD</li>
    <li>GPT-5 Nano: cirka 0,055 / 0,44 USD</li>
    <li>Gemini 3.8 Flash: cirka 0,825 / 4,125 USD (nuvarande 50 % rabatt på slutpunkten)</li>
    <li>DeepSeek V4 Pro: cirka 1,75 / 3,50 USD (cachad input: 0,44 USD)</li>
    <li>DeepSeek V4.1 Flash: cirka 0,50 / 1,50 USD (cachad input: 0,05 USD)</li>
    <li>Kimi K3: cirka 3,00 / 15,00 USD</li>
  </ul>
  <p>Beloppen motsvarar appens nuvarande uppskattningar och kan ändras när Requesty eller uppströmsleverantören ändrar pris. Kontrollera priset bredvid modellen och Requestys användningsrapport.</p>
  <p>Andra leverantörer som stöds är direkt OpenAI (GPT-5.6 Sol/Terra/Luna och GPT-5 Nano), AWS Bedrock (Claude Haiku/Sonnet/Opus, främst för befintliga AWS-användare) och Mistral Large. Aktuella modellpriser visas i appen.</p>

  <hr><br>
  <p><strong>3. Vad är token?</strong></p>
  <p>Som grov tumregel motsvarar 1 token omkring 4 tecken eller tre fjärdedels ord; 1 000 token är omkring 750 engelska ord. Medicinska termer, svenska, formatering och långa promptar ändrar förhållandet. Input omfattar prompt, transkription, Kompletterande information och annan kontext. Output omfattar anteckningen och eventuell debiterbar reasoning/output.</p>

  <hr><br>
  <p><strong>4. Exempel: 15 minuters konsultation</strong></p>
  <p>Med cirka 2 200 input-token och 450 output-token för huvudanteckningen:</p>
  <ul>
    <li>Soniox-transkription: cirka 0,026 USD</li>
    <li>GPT-5 Nano-anteckning: cirka 0,0003 USD</li>
    <li>Gemini 3.8 Flash: cirka 0,004 USD</li>
    <li>Claude Sonnet 5: cirka 0,010 USD</li>
    <li>Claude Opus 5.5: cirka 0,020 USD</li>
    <li>GPT-5.6 Sol: cirka 0,020 USD</li>
  </ul>
  <p>Verklig kostnad beror på transkriptionslängd, prompt, Kompletterande information och reasoning-nivå.</p>

  <hr><br>
  <p><strong>5. Sänk kostnaden för långa dokument</strong></p>
  <p>Secondary Note Generation kan låta en billig modell, exempelvis GPT-5 Nano, sammanfatta ett långt dokument. Sammanfattningen kan läggas i Kompletterande information innan en starkare huvudmodell skapar slutanteckningen. Det kan vara betydligt billigare än att skicka exempelvis 50 sidor direkt till en dyrare modell.</p>

  <hr><br>
  <p><strong>6. Månadsexempel</strong></p>
  <p>20 konsultationer per dag, 4 dagar per vecka och 4 veckor ger cirka 320 konsultationer. Vid 15 minuter per konsultation blir det cirka 80 ljudtimmar. Med 0,0017 USD/minut blir Soniox-transkription cirka 8,16 USD före skatt och prisändringar. Anteckningskostnaden tillkommer efter modell och faktisk tokenanvändning.</p>
  <p>Ingen API-användning innebär ingen användningskostnad från appen. Leverantörernas minimibelopp, förbetalda krediter, skatter eller andra villkor kan ändå gälla.</p>
</div>
`,
};

export const transcribeTranslations = {
  pageTitle: "Transkriberingsverktyg",
  openaiUsageLinkText: "Kostnadsöversikt",
  openaiWalletLinkText: "Kredit",
  btnFunctions: "Funktioner",
  btnGuide: "Guide",
  btnNews: "Status & uppdateringar",
  priceOverlay: {
    button: "Priser",
    heading: "Priser",
    intro: "Aktuella priser för modellerna som finns i appen.",
    textModels: "Textmodeller",
    speechToText: "Tal-till-text",
    model: "Modell",
    context: "Kontext",
    input: "Input / 1M",
    output: "Output / 1M",
    billing: "Debitering",
    price: "Pris",
    audioDuration: "Ljudtid",
    tokenBased: "Tokenbaserad",
    perMinute: "/ min",
    perHour: "/ timme",
    approx: "ca",
    close: "Stäng",
    contextNote: "Kontext är det maximala publicerade kontextfönstret för den konfigurerade modellen eller routen.",
    requestyNote: "Requesty-priserna gäller de exakta router som är konfigurerade i appen. Eventuellt kontopåslag hos Requesty ingår inte.",
    sttNote: "Tal-till-text-priserna är aktuella offentliga pay-as-you-go-priser. Soniox debiteras per token; minutpriserna som visas är ungefärliga motsvarigheter beräknade från Soniox publicerade timpriser.",
  },
  backToHome: "Tillbaka till startsidan",
  recordingAreaTitle: "Inspelningsområde",
  recordTimer: "Inspelningstid: 0 sek",
  transcribeTimer: "Slutförandetid: 0 sek",
  transcriptionPlaceholder: "Transkriberingsresultatet kommer att visas här...",
  startButton: "Starta inspelning",
  readFirstText: "Läs först! ➔",
  stopButton: "Stopp/Slutför",
  pauseButton: "Pausa inspelning",
  statusMessage: "Välkommen! Klicka på \"Starta inspelning\" för att börja.",
  noteGenerationTitle: "Anteckningsgenerering",
  generateNoteButton: "Generera anteckning",
  noteTimer: "Slutförandetid: 0 sek",
  generatedNotePlaceholder: "Genererad anteckning kommer att visas här...",
  customPromptTitle: "Anpassad prompt",
  promptSlotLabel: "Promptplats:",
  customPromptPlaceholder: "Skriv in anpassad prompt här",
  guideHeading: "Guide & instruktioner",
guideText: `Välkommen till <strong>Nordlys Journal</strong>. Appen kan spela in och transkribera samtal och använda den färdiga texten för att skapa en anteckning. Inhämta alltid nödvändigt samtycke före inspelning och granska alltid medicinskt innehåll före användning.<br><br>

<strong>Rekommenderad webbläsare:</strong> Google Chrome ger det mest tillförlitliga stödet för alla funktioner i appen.<br><br>

<strong>Snabbstart</strong><br>
<ol>
  <li>Välj Workspace, transkriptionsleverantör och önskade inställningar.</li>
  <li>Klicka på <strong>Starta inspelning</strong>. Använd <strong>Pausa</strong>, <strong>Fortsätt</strong>, <strong>Stoppa/Slutför</strong> eller <strong>Avbryt</strong> vid behov.</li>
  <li>Välj prompt, leverantör och modell för anteckningen och klicka på <strong>Generera anteckning</strong>. Du kan också aktivera Auto-generate.</li>
</ol>

<details open>
  <summary><strong>Inspelning och transkription</strong></summary>
  <ul>
    <li>Välj tal-till-text-leverantör innan inspelningen startar. Google Chrome eller Microsoft Edge rekommenderas.</li>
    <li><strong>Pausa</strong> slutför det aktuella ljudsegmentet och låter dig fortsätta senare. <strong>Stoppa/Slutför</strong> avslutar inspelningen och inväntar återstående transkription. <strong>Avbryt</strong> kasserar den aktiva inspelningen utan normal slutföring.</li>
    <li><strong>Speaker Labels</strong> är endast tillgängligt med Soniox och försöker markera vem som talar, till exempel Speaker 1 och Speaker 2.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Workspaces och Workspace Sets</strong></summary>
  <ul>
    <li>Ett <strong>Workspace</strong> är en separat arbetsyta i webbläsarfliken. Varje Workspace har egna texter, valda prompts, leverantörer, modeller, inställningar och aktiva processer. Klonade Workspaces delar historik med sin klonfamilj, medan Workspaces som läggs till med + har separat historik. Byte mellan Workspaces stoppar inte inspelning eller generering.</li>
    <li>Namnet följer normalt etiketten för vald promptplats. Använd <strong>+</strong> för att lägga till och <strong>×</strong> för att stänga ett Workspace. Upp till 12 Workspaces kan vara öppna.</li>
    <li>Alla öppna Workspaces bildar ett <strong>Workspace Set</strong>. Import och export kan göras med en lokal JSON-fil, Microsoft OneDrive eller Google Drive.</li>
    <li>Ett Workspace Set sparar antal och ordning, namn, valda promptplatser med prompttext och etiketter, leverantörer, modeller, reasoning-val, relevanta kryssrutor och öppna moduler. Transkriptioner, kompletterande information, anteckningar, historik, ljud, API-nycklar, lösenord och annan patientinformation ingår inte.</li>
    <li>Molnkopior krypteras i webbläsaren med ditt valda lösenord. Lokala JSON-filer är läsbara och måste förvaras säkert.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Mini Panel</strong></summary>
  <ul>
    <li><strong>Google Chrome rekommenderas för Mini Panel.</strong> Funktionen kanske inte fungerar korrekt i andra webbläsare.</li>
    <li>Öppna panelen med knappen <strong>Mini-panel</strong>. Ikonen uppe till höger växlar mellan de två vyerna.</li>
    <li><strong>Mini Panel — Browser Tabs</strong> styr separata Nordlys Journal-flikar och passar när du vill ha ett Workspace per webbläsarflik.</li>
    <li><strong>Mini Panel — Workspaces</strong> visar alla Workspaces i den valda Nordlys Journal-fliken och passar när du vill ha flera arbetsytor i samma flik.</li>
    <li>Inspelningar och generering fortsätter i bakgrunden när du byter vy eller Workspace.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Auto-generate, Auto-copy och primär anteckningsgenerering</strong></summary>
  <ul>
    <li><strong>Auto-generate</strong> startar anteckningsgenereringen automatiskt när transkriptionen är klar. När funktionen är av använder du <strong>Generera anteckning</strong> manuellt.</li>
    <li><strong>Auto-copy</strong> kan automatiskt kopiera den färdiga transkriptionen eller anteckningen och kräver det tillhörande Chrome-tillägget. Manuella kopieringsknappar fungerar ändå.</li>
    <li>Huvudanteckningen använder transkriptionen, eventuell vald prompt och texten i <strong>Kompletterande information</strong>. Välj leverantör, modell och eventuellt reasoning-nivå före generering.</li>
    <li>AI-genererade anteckningar kan innehålla fel eller utelämna information. Granska och validera alltid anteckningen före användning.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Secondary Note Generation</strong></summary>
  <p>Modulen är användbar när ett långt dokument först bör förkortas. Klistra in texten i källfältet, välj en separat prompt och modell och skapa en sammanfattning. Resultatet kan kopieras automatiskt eller manuellt till <strong>Kompletterande information</strong>.</p>
  <p>Du kan till exempel använda en billig modell som GPT-5 Nano via Requesty för att sammanfatta ett dokument på 50 sidor. Huvudmodellen, till exempel GPT-5.6 Sol eller Claude Opus 5.5, får då den korta sammanfattningen tillsammans med transkriptionen i stället för hela dokumentet. Det kan minska tokenanvändning och kostnad betydligt. Kontrollera sammanfattningen innan den används som medicinsk kontext.</p>
</details><br>

<details>
  <summary><strong>Pris och tokenanvändning</strong></summary>
  <ul>
    <li>När prisdata finns visas den valda modellens pris i USD per en miljon input- och output-tokens.</li>
    <li>Efter generering visas tokenanvändning och uppskattat pris när leverantörens svar innehåller nödvändiga användningsdata. Vissa leverantörer kan rapportera en mer exakt kostnad.</li>
    <li><strong>Kostnadsöversikt</strong> öppnar länkar till leverantörernas egna användnings- och faktureringssidor. Appens priser är vägledande; leverantörens fakturering gäller.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Promptplatser, historik, Redactor och OCR</strong></summary>
  <ul>
    <li>Det finns 20 promptplatser. De sparas i den här webbläsaren och kan importeras eller exporteras som JSON eller som krypterade säkerhetskopior via OneDrive och Google Drive.</li>
    <li>Historikkolumnen visar de 30 senaste slutförda primära anteckningsgenereringarna i aktivt Workspace. Klicka på ett objekt för att se transkription, kompletterande information och genererad anteckning. Klonade Workspaces delar historik med sin klonfamilj, medan andra Workspaces har separat historik.</li>
    <li><strong>Redactor</strong> kan ta bort valda allmänna och specifika termer från transkriptionen och kompletterande information. Kontrollera alltid resultatet innan texten skickas vidare.</li>
    <li><strong>OCR</strong> kan hämta text från en inklistrad skärmbild eller bildfil och skicka texten till listan med specifika termer eller råtextfältet.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Lagring och integritet</strong></summary>
  <ul>
    <li>Arbetstext och Workspace-historik finns kvar i den aktuella webbläsarflikens session och tas bort när sessionen avslutas. <strong>Clear</strong> kan tömma aktivt innehåll eller historik.</li>
    <li>API-nycklar lagras inte i localStorage. De behålls endast under den aktiva webbläsarsessionen och kan rensas manuellt på startsidan.</li>
    <li>Data skickas till den leverantör och region du väljer. Lagring och behandling beror på vald leverantör, konto, konfiguration och aktuella villkor. Kontrollera att lösningen är lämplig för informationen du behandlar.</li>
  </ul>
</details><br><br>

Klicka på <strong>Guide</strong> igen eller använd stängningsknappen för att återgå till huvudvyn.
`,

  // Sekundär anteckningsgenerator
  secondaryNote: {
    showButton: "Visa sekundär anteckningsgenerator",
    hideButton: "Dölj sekundär anteckningsgenerator",
    title: "Sekundär anteckningsgenerator",
    sourceLabel: "Källtext",
    sourcePlaceholder: "Klistra in eller skriv källtext här...",
    providerLabel: "Leverantör:",
    modelLabel: "Modell:",
    modeLabel: "Läge:",
    reasoningLabel: "Resonemangsnivå:",
    thinkingLabel: "Tankenivå:",
    promptLabel: "Prompt:",
    generateButton: "Generera anteckning",
    abortButton: "Avbryt",
    copyButton: "Kopiera",
    copiedButton: "Kopierat",
    pushButton: "Infoga",
    clearOnGenerateLabel: "Töm Kompletterande information vid generering",
    autoTransferLabel: "Kopiera resultatet automatiskt till Kompletterande information",
    sourceDateLabel: "Datum",
    sourceDateToggleAriaLabel: "Behåll dagens datum i källtexten",
    sourceDateHelp: 'När PÅ: Behåller raden "Dagens dato er DD.MM.YYYY" överst i källtexten och återställer den efter att sidan har uppdaterats. När AV: Tar bort denna datumrad från källtexten.',
    outputPlaceholder: "Den genererade anteckningen visas här...",
    timerLabel: "Timer för anteckningsgenerering",
    statusGenerating: "Genererar…",
    statusCompleted: "Textgenerering klar!",
    statusFailed: "Genereringen misslyckades",
    statusAborted: "Anteckningsgenerering avbruten.",
    noSourceText: "Ingen källtext",
    noPromptSelected: "Ingen prompt vald",
    noOutputToPush: "Ingen anteckning att kopiera ännu",
    transferred: "Resultatet kopierades till Kompletterande information."
  },
};

export default { indexTranslations, transcribeTranslations };
