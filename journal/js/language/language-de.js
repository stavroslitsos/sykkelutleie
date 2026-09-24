// js/language-de.js

export const indexTranslations = {
  pageTitle: "Nordlys Journal",
  headerTitle: "Nordlys Journal",
  headerSubtitle: "Fortschrittliche KI-gestützte Sprach-zu-Text-Transkription und Notizenerstellung für medizinische Konsultationen",
  startText: "Um zu beginnen, geben Sie bitte Ihren OpenAI API-Schlüssel ein:",
  apiPlaceholder: "Geben Sie hier den API-Schlüssel ein",
  enterButton: "Transkriptionstool öffnen",
  guideButton: "API-Anleitung – So nutzen Sie es",
  securityButton: "Sicherheit",
  aboutButton: "Über",
  // Accordion tab #1 (left): AI models
  modelsModalHeading: "KI-Modelle",
  modelsModalText: `
<div>
  <p><strong>Modellauswahl in Nordlys Journal</strong></p>
  <p>Für <strong>Spracherkennung (STT)</strong> und <strong>Notizerstellung</strong> können getrennte Modelle gewählt werden. Ein genaues Transkript verbessert die Grundlage; ein leistungsfähiges Notizmodell kann Inhalt, Prioritäten und den gewählten Prompt besser umsetzen.</p>

  <hr><br>
  <p><strong>1) Spracherkennungsmodelle</strong></p>
  <ul>
    <li><strong>Soniox</strong> – Batch- oder Echtzeittranskription, optional mit Sprecherkennzeichnung</li>
    <li><strong>OpenAI</strong> – gpt-4o-transcribe</li>
    <li><strong>Mistral</strong> – Voxtral Mini Transcribe</li>
  </ul>
  <p><strong>Praktische STT-Rangfolge</strong></p>
  <ol>
    <li><strong>Soniox</strong> – empfohlen: sehr gute Qualität, Sprecherkennzeichnung und EU-Endpunkt.</li>
    <li><strong>OpenAI gpt-4o-transcribe</strong> – starke Alternative, aber ohne den ebenso einfachen Weg zu EU-Datenresidenz in der Standardkonfiguration.</li>
    <li><strong>Mistral Voxtral Mini</strong> – günstige europäische Alternative, wenn der Preis im Vordergrund steht.</li>
  </ol>
  <p>Für EU-Datenresidenz mit Soniox müssen der API-Schlüssel zu einem EU-Projekt gehören und in der App der EU-Endpunkt gewählt sein. Sprecherkennzeichnungen helfen dem Notizmodell, Gesprächspartner auseinanderzuhalten.</p>

  <hr><br>
  <p><strong>2) Anbieter und Modelle für die Notizerstellung</strong></p>
  <p><strong>Requesty — für neue Nutzer empfohlen</strong></p>
  <p>Requesty bietet über einen API-Schlüssel Modelle mehrerer Entwickler. Die App beschränkt die Auswahl bewusst auf bestimmte Bereitstellungen, die für Verarbeitung in der EU, keine Nutzung zum Modelltraining und geeignete Aufbewahrungseinstellungen vorgesehen sind.</p>
  <ul>
    <li>Claude Opus 5.5</li><li>Claude Sonnet 5</li><li>GPT-6 Sol</li><li>GPT-6 Luna</li><li>GPT-5.6 Sol</li><li>GPT-5.6 Terra</li><li>GPT-5.6 Luna</li><li>GPT-5.5</li><li>GPT-5 Nano</li><li>Gemini 3.8 Flash</li><li>DeepSeek V4 Pro</li><li>DeepSeek V4.1 Flash</li><li>Kimi K3</li>
  </ul>
  <p><strong>Weitere unterstützte Anbieter</strong></p>
  <ul>
    <li><strong>OpenAI</strong> – GPT-5.6 Sol, GPT-5.6 Terra, GPT-5.6 Luna und GPT-5 Nano</li>
    <li><strong>AWS Bedrock</strong> – Claude Haiku 4.5, Claude Sonnet 4.5/4.6 und Claude Opus 4.5/4.6/4.7</li>
    <li><strong>Mistral</strong> – Mistral Large</li>
  </ul>
  <p>AWS Bedrock bleibt für bestehende AWS-Nutzer und selbst verwaltete AWS-Umgebungen verfügbar. Die Einrichtung ist deutlich komplizierter und neue Modelle können später verfügbar sein. Bedrock ist daher <strong>nicht der empfohlene Einstieg für neue Nutzer</strong>.</p>

  <p><strong>Praktischer Requesty-Modellleitfaden</strong></p>
  <ul>
    <li><strong>Maximale Qualität:</strong> Claude Opus 5.5 und GPT-5.6 Sol</li>
    <li><strong>Starke Allround-Modelle:</strong> Claude Sonnet 5, GPT-5.6 Terra, GPT-5.5 und DeepSeek V4 Pro</li>
    <li><strong>Schnell und preisorientiert:</strong> GPT-5.6 Luna, Gemini 3.8 Flash und DeepSeek V4.1 Flash</li>
    <li><strong>Günstigste Zusammenfassung/Vorverarbeitung:</strong> GPT-5 Nano</li>
    <li><strong>Weitere Alternative:</strong> Kimi K3</li>
  </ul>
  <p>Claude Opus 5.5 unterstützt in der App die Reasoning-Stufen Low, Medium und High; standardmäßig wird Low verwendet.</p>
  <p>GPT-6 Sol und GPT-6 Luna unterstützen in der App die Reasoning-Stufen None, Low, Medium und High; wenn keine frühere Auswahl gespeichert ist, verwendet die App Low.</p>
  <p>DeepSeek V4 Pro und DeepSeek V4.1 Flash unterstützen die Reasoning-Stufen None, Low, High und Max; die App verwendet standardmäßig Low.</p>
  <p>Bei langen Dokumenten kann zuerst ein günstiges Modell wie GPT-5 Nano eine kurze Zusammenfassung für Zusatzinformationen erstellen. Das stärkere Hauptmodell erhält dann nicht das vollständige Dokument, wodurch die Kosten deutlich sinken können.</p>

  <hr><br>
  <p><strong>Preis und Qualität</strong></p>
  <p>Stärkere Modelle kosten meist mehr pro Token. Neben dem gewählten Modell zeigt die App den ungefähren USD-Preis je eine Million Eingabe-/Ausgabe-Token und nach der Generierung, sofern Nutzungsdaten vorliegen, eine Kostenschätzung.</p>

  <hr><br>
  <p><strong>Empfohlene Konfiguration für neue klinische Nutzer</strong></p>
  <p>Empfohlen wird <strong>Soniox mit EU-Projekt, EU-API-Schlüssel und EU-Endpunkt</strong> für STT zusammen mit <strong>Requesty</strong> für die Notizerstellung.</p>
  <p>Kein Modell macht einen Ablauf automatisch DSGVO-konform. Die Organisation muss DPA, Endpunkt und Aufbewahrung prüfen, DPIA/TIA durchführen und jede Notiz vor der klinischen Verwendung kontrollieren.</p>
</div>
`,

  securityModalHeading: "Datenschutz",
  securityModalText: `
<strong>Datenschutz und Datenverarbeitung</strong><br><br>

Diese Web-App ist ein Werkzeug für Sprache-zu-Text und die Erstellung von Notizen. Als Gesundheitsfachkraft und Verantwortlicher für die Datenverarbeitung sind Sie dafür verantwortlich, dass die Nutzung den geltenden Vorschriften entspricht, darunter der DSGVO, dem norwegischen Gesundheitspersonalgesetz und der Norm für Informationssicherheit im norwegischen Gesundheits- und Pflegesektor.<br><br>
Der Entwickler kann nicht beurteilen, ob die Nutzung durch eine einzelne Organisation rechtmäßig ist. Dies ist keine Rechtsberatung. Ziehen Sie bei Bedarf den Datenschutzbeauftragten oder einen Rechtsberater hinzu.<br><br>

<hr><br>

<strong>1. Empfohlene Konfiguration für neue Nutzer</strong><br><br>

<strong>Sprache-zu-Text</strong><br>
Die empfohlene Lösung ist Soniox mit EU-Projekt, EU-API-Schlüssel und EU-Endpunkt. Soniox gibt an, dass Audio- und Transkriptionsinhalte in der gewählten Region verbleiben, wenn der regionale Schlüssel des Projekts und die korrekte API-Domain verwendet werden. Soniox gibt außerdem an, dass übermittelte Inhalte nicht für das Modelltraining verwendet werden. Konto-, Abrechnungs- und Nutzungsmetadaten können dennoch außerhalb der gewählten Region verarbeitet werden. Bei der Nutzung von Soniox in dieser App werden Audioaufnahmen und erstellte Diktate stets von den Soniox-Servern gelöscht, sobald der Transkriptionsauftrag abgeschlossen ist.<br><br>

<strong>Notizerstellung</strong><br>
Die empfohlene Lösung für neue Nutzer ist Requesty. Die App sendet Requesty-Aufrufe über das EU-Gateway des Unternehmens und zeigt eine bewusst kuratierte Auswahl benannter Modellbereitstellungen, die für die Datenverarbeitung in der EU vorgesehen sind, ohne Wiederverwendung für das Modelltraining und mit geeigneten Kontrollmöglichkeiten für die Datenspeicherung. Dadurch erhalten Sie mit einem einzigen Requesty-API-Schlüssel Zugriff auf mehrere neuere Modelle.<br><br>

Die Modellauswahl der App aktiviert nicht von sich aus Zero Data Retention im Requesty-Konto. Requesty dokumentiert, dass die Protokollierung von Prompts und Outputs bei Self-Service-Abonnements standardmäßig mit einer Aufbewahrungsdauer von 30 Tagen aktiviert ist. Die Protokollierung kann und sollte für jeden API-Schlüssel deaktiviert werden, und organisationsweites Zero Data Retention kann bei Requesty beantragt werden.<br><br>

<hr><br>

<strong>2. Wie die Web-App Daten verarbeitet</strong><br><br>

- Audio wird aufgenommen und vorübergehend im Speicher des Browsers verarbeitet.<br>
- Das Audio wird verschlüsselt über HTTPS an den gewählten Sprache-zu-Text-Anbieter gesendet: Soniox, OpenAI oder Mistral/Voxtral.<br>
- Das Transkript wird im ausgewählten Workspace im Browser angezeigt.<br>
- Wenn Sie eine Notiz erstellen, werden das Transkript, der ausgewählte Prompt und etwaige Zusatzinformationen an den gewählten Notizanbieter gesendet.<br>
- Bei der Nutzung von Requesty wird die Anfrage vom Browser an das EU-Gateway von Requesty gesendet, das sie an die speziell ausgewählte Modellbereitstellung weiterleitet (ZDR, kein Modelltraining, Datenverarbeitung ausschließlich innerhalb der EU).<br>
- Der Notizentwurf wird über eine verschlüsselte Verbindung an den Browser zurückgegeben.<br><br>

Die Web-App selbst besitzt keinen Anwendungsserver, der Audio, Transkripte oder Notizen speichert. Die Kommunikation findet zwischen Ihrem eigenen Browser und den von Ihnen gewählten Diensten statt.<br><br>

<hr><br>

<strong>3. API-Schlüssel und Anmeldedaten</strong><br><br>

Sie verwenden eigene Anbieterschlüssel oder, bei AWS Bedrock, eine eigene Backend-URL und ein eigenes Secret. Der Entwickler der Web-App erhält weder diese Angaben noch die klinischen Inhalte, die darüber gesendet werden.<br><br>

API-Schlüssel, die auf der Startseite eingegeben werden, werden vorübergehend im SessionStorage des Browsers gespeichert und entfernt, wenn der Tab/die Sitzung geschlossen wird oder Sie Clear keys wählen. Wenn Sie eine verschlüsselte Sicherung der Schlüssel exportieren, wird das Passwort lokal im Browser verwendet, um die Datei zu verschlüsseln, bevor sie gespeichert oder hochgeladen wird.<br><br>

Behandeln Sie API-Schlüssel, Sicherungskopien und Passwörter als vertrauliche Informationen. Verwenden Sie individuelle Schlüssel sowie Ausgabenlimits und Zugriffsbeschränkungen des Anbieters, sofern verfügbar, und sperren Sie den Schlüssel sofort, wenn er offengelegt worden sein könnte.<br><br>

<hr><br>

<strong>4. Anbieterspezifische Hinweise</strong><br><br>

<strong>Soniox EU</strong><br>
Die EU-Datenlokalisierung erfordert ein in der EU-Region erstelltes Soniox-Projekt, den zu diesem Projekt gehörenden API-Schlüssel und die Auswahl des korrekten EU-Endpunkts in der App. Soniox gibt an, dass Inhaltsdaten dann in der EU-Region verbleiben und nicht für das Modelltraining verwendet werden. Prüfen Sie die Speicher-/Löschpraxis und schließen Sie die notwendige Vereinbarung für Ihre Organisation ab.<br><br>

<strong>Requesty</strong><br>
Die App verwendet das EU-Gateway von Requesty und feste, kuratierte Modellrouten anstelle einer uneingeschränkten Modellauswahl. Requesty gibt an, dass Prompts und Antworten nicht für das Modelltraining verwendet werden. Das EU-Gateway hält die eigene Verarbeitung und Speicherung von Requesty in der EU, während eine vollständige EU-Datenlokalisierung zusätzlich eine in der EU gehostete Modellbereitstellung erfordert. Die App ist darauf ausgelegt, solche Bereitstellungen auszuwählen; der Nutzer muss jedoch weiterhin die aktuellen Modelldetails prüfen und die Prompt-/Output-Protokollierung für den API-Schlüssel deaktivieren oder organisationsweites ZDR erhalten, bevor identifizierbare Patientendaten verwendet werden.<br><br>

<strong>AWS Bedrock</strong><br>
Bedrock bleibt für Nutzer erhalten, die bereits AWS-Zugriff haben oder ihre eigene AWS-Infrastruktur bevorzugen. Die Lösung erfordert ein separates Backend und eine sorgfältige regionale Konfiguration. Sie ist komplizierter und wird nicht mehr als Ausgangspunkt für neue Nutzer empfohlen, kann aber weiterhin für Organisationen mit einer etablierten und genehmigten AWS-Umgebung geeignet sein.<br><br>

<strong>Mistral</strong><br>
Mistral stellt in der App Voxtral für Sprache-zu-Text und Mistral Large für die Notizerstellung bereit. Prüfen Sie die aktuelle Betriebsregion, die DPA/AVV, die Speichereinstellung und die Trainingspräferenz. Wenn die Nutzung Zero Data Retention erfordert, muss dies bewilligt, aktiviert und dokumentiert sein, bevor Patientendaten gesendet werden.<br><br>

<strong>OpenAI</strong><br>
OpenAI bleibt für direkte Sprache-zu-Text-Verarbeitung und Notizerstellung verfügbar. Standard-API-Daten werden grundsätzlich nicht für das Modelltraining verwendet, aber regionale Verarbeitung und Speicherung hängen vom Produkt, Konto und Vertragssetup ab. Gehen Sie nicht davon aus, dass ein gewöhnlicher direkter API-Schlüssel automatisch eine ausschließliche EU-Verarbeitung oder Zero Data Retention bietet. Prüfen Sie die aktuellen Bedingungen und führen Sie die notwendige TIA durch.<br><br>

<hr><br>

<strong>5. Übersicht über lokale und externe Speicherung</strong><br><br>

<strong>API-Schlüssel und Backend-Angaben</strong><br>
- Gespeichert in: SessionStorage des Browsers.<br>
- Dauer: bis der Tab/die Sitzung geschlossen oder die Schlüssel gelöscht werden.<br>
- Zugriff: der Nutzer und die aktuelle Browsersitzung.<br><br>

<strong>Audio während der Aufnahme</strong><br>
- Gespeichert in: im Speicher des Browsers während Aufnahme und Verarbeitung.<br>
- Dauer: vorübergehend; die App führt kein dauerhaftes lokales Audioarchiv.<br>
- Externe Verarbeitung: Der ausgewählte STT-Anbieter erhält das Audio.<br><br>

<strong>Transkripte, Zusatzinformationen und erstellte Notizen</strong><br>
- Gespeichert in: der Sitzung des aktiven Browser-Tabs und den zugehörigen Workspace-/Verlaufsfunktionen.<br>
- Dauer: normalerweise bis der Tab/die Sitzung geschlossen oder der Inhalt/Verlauf gelöscht wird.<br>
- Externe Verarbeitung: Relevanter Text wird beim Start der Erstellung an den gewählten Notizanbieter gesendet.<br><br>

<strong>Prompts und Einstellungen in einem Workspace Set</strong><br>
- Prompts und ausgewählte Einstellungen können lokal im Browser gespeichert werden.<br>
- Der Export eines Workspace Set umfasst Konfigurationen wie Reihenfolge, Prompts, ausgewählte Anbieter/Modelle und relevante Schalter, jedoch keine Transkripte, Zusatzinformationen, erstellten Notizen, Verläufe, Audiodaten, API-Schlüssel oder Passwörter.<br>
- Cloud-Exporte werden im Browser mit dem gewählten Passwort verschlüsselt. Lokale JSON-Exporte sind lesbar und müssen sicher aufbewahrt werden.<br><br>

Die Verarbeitung und Speicherung durch die Anbieter erfolgt zusätzlich zur Browserspeicherung und muss bei jedem verwendeten Dienst geprüft werden.<br><br>

<hr><br>

<strong>6. Quellcode und Verantwortung</strong><br><br>

Der Quellcode der Web-App ist offen zugänglich, und die Hauptanwendung läuft im Browser. Der Entwickler erhält keine klinischen Texte über ein Anwendungsbackend. Grundlegende, nicht klinische Nutzungsstatistiken können dennoch wie auf der Website beschrieben erfasst werden.<br><br>

Der generierte Inhalt ist ein Entwurf. Die Gesundheitsfachkraft ist dafür verantwortlich, die medizinische Richtigkeit zu prüfen, Fehler zu korrigieren und zu entscheiden, was in die Patientenakte aufgenommen wird.
`,

  aboutModalHeading: "Über uns",
  aboutModalText: `Diese Website wurde entwickelt, um Gesundheitsfachkräfte und andere Nutzer mit direktem Zugang zu hochwertiger Spracherkennung und klinischer Notizgenerierung zu versorgen – ohne unnötige Kosten oder Zwischenhändler.<br><br>
Durch die Verwendung Ihres eigenen OpenAI API-Schlüssels verbinden Sie sich direkt mit der Quelle der Technologie. Das bedeutet, dass Sie nur die tatsächlichen Nutzungskosten zahlen, die von OpenAI festgelegt werden, ohne Aufschläge oder Abonnementgebühren.<br><br>
Viele bestehende Anbieter offerieren ähnliche Dienste, verlangen jedoch deutlich mehr – oftmals 8 bis 10 Mal die tatsächlichen Kosten der zugrunde liegenden Technologie. Diese Plattform bietet dieselbe Funktionalität zu einem Bruchteil des Preises.<br><br>
<strong>Wichtige Punkte:</strong><br>
• Kein Abonnement, kein Konto erforderlich.<br>
• Sie zahlen nur OpenAI direkt für die tatsächlich genutzte Leistung.<br>
• Die Website selbst ist völlig kostenlos.`,
  guideModalHeading: "API-Schlüssel – Einstieg",
  guideModalText: `
<strong>API-Schlüssel — erste Schritte</strong><br><br>
Die einfachste Empfehlung für neue Nutzer:<br>
1. <strong>Soniox mit EU-Schlüssel</strong> für Spracherkennung.<br>
2. <strong>Requesty</strong> für Notizerstellung.<br><br>

<strong>STT-Optionen:</strong> Soniox Batch, Soniox Batch mit Sprecherkennzeichnung, Soniox Echtzeit, OpenAI gpt-4o-transcribe und Mistral Voxtral Mini.<br><br>
<strong>Notizanbieter:</strong> Requesty (Claude Opus 5.5, Claude Sonnet 5, GPT-6 Sol, GPT-6 Luna, GPT-5.6 Sol/Terra/Luna, GPT-5.5, GPT-5 Nano, Gemini 3.8 Flash, DeepSeek V4 Pro, DeepSeek V4.1 Flash, Kimi K3), OpenAI (GPT-5.6 Sol/Terra/Luna und GPT-5 Nano), AWS Bedrock (Claude Haiku/Sonnet/Opus) und Mistral Large.<br><br>

<hr><br>
<strong>Soniox — empfohlene STT-Einrichtung</strong><br>
1. Konto bei <a href="https://soniox.com" target="_blank" rel="noopener noreferrer">soniox.com</a> erstellen und Abrechnung/Guthaben einrichten.<br>
2. Regionalen Zugriff über <a href="mailto:support@soniox.com">support@soniox.com</a> beantragen.<br>
3. Ein Projekt in der Region <strong>European Union</strong> anlegen/auswählen und dessen regionalen Schlüssel kopieren.<br>
4. Den Schlüssel in <strong>Soniox API key</strong> einfügen und in der App <strong>EU</strong> wählen. EU-Projektschlüssel und EU-Endpunkt sind beide erforderlich.<br><br>
Der Link <strong>Guide</strong> neben dem Soniox-Feld öffnet die vollständige Schritt-für-Schritt-Anleitung.<br><br>

<hr><br>
<strong>Requesty — empfohlene Notiz-Einrichtung</strong><br>
1. Konto bei <a href="https://requesty.ai" target="_blank" rel="noopener noreferrer">requesty.ai</a> erstellen und Guthaben/Abrechnung konfigurieren.<br>
2. Unter <strong>API Keys</strong> einen Schlüssel anlegen und möglichst auf genehmigte Modelle/Access Lists beschränken.<br>
3. Schlüssel sicher kopieren und in <strong>Requesty API key</strong> einfügen.<br>
4. Prompt-/Antwort-Protokollierung deaktivieren oder organisationsweites ZDR beantragen; DPA und Modellrouten prüfen, bevor identifizierbare Patientendaten genutzt werden.<br><br>
Der Link <strong>Guide</strong> neben Requesty erklärt Konto, Guthaben, Schlüssel, Modellzugriff, EU-Routing und Datenschutzeinstellungen ausführlich.<br><br>

<hr><br>
<strong>OpenAI:</strong> Konto unter <a href="https://platform.openai.com" target="_blank" rel="noopener noreferrer">platform.openai.com</a> erstellen, Abrechnung und API-Schlüssel konfigurieren. DPA, Aufbewahrung und Region prüfen; ein Standardschlüssel ist nicht automatisch EU-only oder ZDR.<br><br>

<strong>Mistral:</strong> Konto unter <a href="https://console.mistral.ai" target="_blank" rel="noopener noreferrer">console.mistral.ai</a> erstellen, Abrechnung und Schlüssel einrichten. Er gilt für Voxtral Mini und Mistral Large. EU-Hosting, DPA, Aufbewahrung und ZDR prüfen.<br><br>

<strong>AWS Bedrock — optional für bestehende AWS-Nutzer:</strong> Erfordert AWS-Konto, regionalen Modellzugriff und ein eigenes Backend. Die Einrichtung ist komplizierter und wird neuen Nutzern nicht als Einstieg empfohlen. Nutzen Sie den <a href="#" data-open-guide="bedrock"><strong>Guide</strong></a>-Link neben den AWS-Feldern.<br><br>

<hr><br>
<strong>Vor Eingabe von Patientendaten</strong><br>
Ein API-Schlüssel macht einen Dienst nicht automatisch DSGVO-konform. Prüfen Sie DPA, Unterauftragsverarbeiter, Endpunkt, Datenresidenz, Aufbewahrung/ZDR und Trainingseinstellungen; führen Sie DPIA/TIA durch, schützen Sie Zugangsdaten, minimieren Sie Patientendaten und prüfen Sie jede Notiz.
`,

  priceButton: "Preis",
  priceModalHeading: "Kosteninformationen",
  priceModalText: `
<div>
  <p><strong>Kosteninformationen</strong></p>
  <p>Die App hat keine Abogebühr und keinen Aufschlag. Sie bezahlen die Anbieter direkt für die tatsächliche API-Nutzung. Preise können sich ändern; Dashboard und Rechnung des Anbieters sind maßgeblich.</p>
  <p><strong>Preisanzeige in der App</strong></p>
  <ul>
    <li>Ungefähre USD-Preise je eine Million Eingabe-/Ausgabe-Token stehen neben dem gewählten Notizmodell.</li>
    <li>Nach der Generierung erscheinen Tokenverbrauch und Kostenschätzung, sofern genügend Nutzungsdaten vorliegen.</li>
    <li>Reasoning-Token, Caching, Rabatte, Gatewaygebühren, Wechselkurse und Abrechnungsregeln können den Endbetrag beeinflussen.</li>
  </ul>

  <hr><br>
  <p><strong>1. Spracherkennung</strong> (ungefähr pro Audiominute)</p>
  <p><strong>Soniox — empfohlen:</strong> ca. 0,0017 USD/Minute; 15 Minuten ca. 0,026 USD.</p>
  <p><strong>OpenAI gpt-4o-transcribe:</strong> ca. 0,006 USD/Minute; 15 Minuten ca. 0,09 USD.</p>
  <p><strong>Mistral Voxtral Mini:</strong> aktuellen offiziellen Mistral-Preis prüfen.</p>

  <hr><br>
  <p><strong>2. Notizerstellung</strong> (USD je eine Million Eingabe-/Ausgabe-Token)</p>
  <ul>
    <li>Claude Opus 5.5: ca. 4,40 / 22,00 USD</li><li>Claude Sonnet 5: ca. 2,20 / 11,00 USD</li>
    <li>GPT-6 Sol: ca. 2,40 / 12,00 USD</li><li>GPT-6 Luna: ca. 0,12 / 0,60 USD</li>
    <li>GPT-5.6 Sol: ca. 4,40 / 22,00 USD</li><li>GPT-5.6 Terra: ca. 2,20 / 13,20 USD</li>
    <li>GPT-5.6 Luna: ca. 0,22 / 1,32 USD</li><li>GPT-5.5: ca. 5,00 / 30,00 USD</li>
    <li>GPT-5 Nano: ca. 0,055 / 0,44 USD</li><li>Gemini 3.8 Flash: ca. 0,825 / 4,125 USD (derzeit 50 % Endpunkt-Rabatt)</li><li>DeepSeek V4 Pro: ca. 1,75 / 3,50 USD (Cache-Input: 0,44 USD)</li><li>DeepSeek V4.1 Flash: ca. 0,50 / 1,50 USD (Cache-Input: 0,05 USD)</li><li>Kimi K3: ca. 3,00 / 15,00 USD</li>
  </ul>
  <p>Diese Werte entsprechen den aktuellen App-Schätzungen und können sich mit Requesty oder der Upstream-Bereitstellung ändern. Prüfen Sie den Modellpreis und Requestys Nutzungsbericht.</p>
  <p>Weitere unterstützte Notizanbieter: direktes OpenAI (GPT-5.6 Sol/Terra/Luna und GPT-5 Nano), AWS Bedrock (Claude Haiku/Sonnet/Opus, vor allem für bestehende AWS-Nutzer) und Mistral Large. Aktuelle Modellpreise werden in der App angezeigt.</p>

  <hr><br>
  <p><strong>3. Was sind Token?</strong></p>
  <p>Grob gilt: 1 Token entspricht etwa 4 Zeichen beziehungsweise drei Vierteln eines englischen Wortes; 1.000 Token etwa 750 englischen Wörtern. Medizinische Begriffe, deutsche Texte, Formatierung und lange Prompts verändern das Verhältnis. Eingabe umfasst Prompt, Transkript, Zusatzinformationen und weiteren Kontext; Ausgabe umfasst Notiz und abrechenbare Reasoning-/Ausgabe-Token.</p>

  <hr><br>
  <p><strong>4. Beispiel: 15-minütige Konsultation</strong></p>
  <p>Bei etwa 2.200 Eingabe- und 450 Ausgabe-Token:</p>
  <ul>
    <li>Soniox-Transkription: ca. 0,026 USD</li><li>GPT-5 Nano: ca. 0,0003 USD</li>
    <li>Gemini 3.8 Flash: ca. 0,004 USD</li><li>Claude Sonnet 5: ca. 0,010 USD</li>
    <li>Claude Opus 5.5: ca. 0,020 USD</li><li>GPT-5.6 Sol: ca. 0,020 USD</li>
  </ul>
  <p>Die tatsächliche Menge hängt stark von Transkript, Prompt, Zusatzinformationen und Reasoning-Stufe ab.</p>

  <hr><br>
  <p><strong>5. Kosten langer Dokumente senken</strong></p>
  <p>Secondary Note Generation kann ein langes Dokument mit einem günstigen Modell wie GPT-5 Nano zusammenfassen. Die Zusammenfassung wird als Zusatzinformation eingefügt, bevor das stärkere Hauptmodell die endgültige Notiz erstellt. Das kann deutlich günstiger sein, als beispielsweise 50 Seiten direkt an ein teures Modell zu senden.</p>

  <hr><br>
  <p><strong>6. Monatsbeispiel</strong></p>
  <p>20 Konsultationen täglich, 4 Tage wöchentlich und 4 Wochen ergeben ca. 320 Konsultationen beziehungsweise 80 Audiostunden. Bei 0,0017 USD/Minute kostet Soniox-Transkription etwa 8,16 USD vor Steuern und Preisänderungen. Die Notizerstellung kommt je Modell und Tokenverbrauch hinzu.</p>
  <p>Ohne API-Nutzung entstehen durch die App keine Nutzungskosten. Mindestbeträge, Guthaben, Steuern oder andere Anbieterkonditionen können trotzdem gelten.</p>
</div>
`,
};

export const transcribeTranslations = {
  pageTitle: "Transkriptionstool",
  openaiUsageLinkText: "Kostenübersicht",
  openaiWalletLinkText: "Kontostand",
  btnFunctions: "Funktionen",
  btnGuide: "Anleitung",
  btnNews: "Status & Aktualisierungen",
  priceOverlay: {
    button: "Preise",
    heading: "Preise",
    intro: "Aktuelle Preise für die in dieser App verfügbaren Modelle.",
    textModels: "Textmodelle",
    speechToText: "Speech-to-Text",
    model: "Modell",
    context: "Kontext",
    input: "Input / 1M",
    output: "Output / 1M",
    billing: "Abrechnung",
    price: "Preis",
    audioDuration: "Audiodauer",
    tokenBased: "Tokenbasiert",
    perMinute: "/ Min.",
    perHour: "/ Std.",
    approx: "ca.",
    close: "Schließen",
    contextNote: "Der Kontext ist das maximal veröffentlichte Kontextfenster für das konfigurierte Modell bzw. die konfigurierte Route.",
    requestyNote: "Die Requesty-Preise gelten für die exakten, in dieser App konfigurierten Routen. Ein etwaiger kontoabhängiger Requesty-Aufschlag ist nicht enthalten.",
    sttNote: "Die Speech-to-Text-Preise sind die aktuellen öffentlichen Pay-as-you-go-Preise. Soniox rechnet tokenbasiert ab; die angegebenen Minutenpreise sind ungefähre, aus den veröffentlichten Soniox-Stundenpreisen abgeleitete Werte.",
  },
  backToHome: "Zurück zur Startseite",
  recordingAreaTitle: "Aufnahmebereich",
  recordTimer: "Aufnahmetimer: 0 sek",
  transcribeTimer: "Abschlusstimer: 0 sek",
  transcriptionPlaceholder: "Transkriptionsergebnis wird hier angezeigt...",
  startButton: "Aufnahme starten",
  readFirstText: "Erst lesen! ➔",
  stopButton: "Stoppen/Abschließen",
  pauseButton: "Aufnahme pausieren",
  statusMessage: "Willkommen! Klicken Sie auf 'Aufnahme starten', um zu beginnen.",
  noteGenerationTitle: "Notizenerstellung",
  generateNoteButton: "Notiz generieren",
  noteTimer: "Abschlusstimer: 0 sek",
  generatedNotePlaceholder: "Generierte Notiz erscheint hier...",
  customPromptTitle: "Benutzerdefinierter Prompt",
  promptSlotLabel: "Prompt-Slot:",
  customPromptPlaceholder: "Benutzerdefinierten Prompt hier eingeben",
  guideHeading: "Anleitung & Instruktionen",
guideText: `Willkommen bei <strong>Nordlys Journal</strong>. Die App kann Gespräche aufnehmen und transkribieren und den fertigen Text zur Erstellung einer Notiz verwenden. Holen Sie vor einer Aufnahme immer die erforderliche Einwilligung ein und prüfen Sie medizinische Inhalte vor der Verwendung.<br><br>

<strong>Empfohlener Browser:</strong> Google Chrome bietet die zuverlässigste Unterstützung für alle Funktionen der App.<br><br>

<strong>Schnellstart</strong><br>
<ol>
  <li>Workspace, Transkriptionsanbieter und gewünschte Einstellungen auswählen.</li>
  <li><strong>Aufnahme starten</strong> wählen. Bei Bedarf <strong>Pause</strong>, <strong>Fortsetzen</strong>, <strong>Stopp/Abschließen</strong> oder <strong>Abbrechen</strong> verwenden.</li>
  <li>Prompt, Anbieter und Modell für die Notiz auswählen und <strong>Notiz generieren</strong> wählen. Auto-generate kann ebenfalls aktiviert werden.</li>
</ol>

<details open>
  <summary><strong>Aufnahme und Transkription</strong></summary>
  <ul>
    <li>Vor der Aufnahme den Speech-to-Text-Anbieter wählen. Google Chrome oder Microsoft Edge wird empfohlen.</li>
    <li><strong>Pause</strong> schließt das aktuelle Audiosegment ab und ermöglicht eine spätere Fortsetzung. <strong>Stopp/Abschließen</strong> beendet die Aufnahme und wartet auf das restliche Transkript. <strong>Abbrechen</strong> verwirft die aktive Aufnahme ohne normalen Abschluss.</li>
    <li><strong>Speaker Labels</strong> ist nur mit Soniox verfügbar und versucht, Sprecher zu kennzeichnen, zum Beispiel Speaker 1 und Speaker 2.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Workspaces und Workspace Sets</strong></summary>
  <ul>
    <li>Ein <strong>Workspace</strong> ist ein eigener Arbeitsbereich im Browser-Tab. Jeder Workspace hat eigene Texte, ausgewählte Prompts, Anbieter, Modelle, Einstellungen und aktive Prozesse. Geklonte Workspaces teilen den Verlauf mit ihrer Klonfamilie; mit + hinzugefügte Workspaces haben einen separaten Verlauf. Ein Wechsel stoppt weder Aufnahme noch Generierung.</li>
    <li>Der Name folgt normalerweise der Bezeichnung des ausgewählten Prompt-Slots. Mit <strong>+</strong> wird ein Workspace hinzugefügt, mit <strong>×</strong> geschlossen. Bis zu 12 Workspaces können geöffnet sein.</li>
    <li>Alle geöffneten Workspaces bilden ein <strong>Workspace Set</strong>. Import und Export sind über eine lokale JSON-Datei, Microsoft OneDrive oder Google Drive möglich.</li>
    <li>Ein Workspace Set speichert Anzahl und Reihenfolge, Namen, ausgewählte Prompt-Slots samt Prompttext und Bezeichnungen, Anbieter, Modelle, Reasoning-Auswahl, relevante Kontrollkästchen und geöffnete Module. Transkripte, ergänzende Informationen, Notizen, Verlauf, Audio, API-Schlüssel, Passwörter und andere Patientendaten sind nicht enthalten.</li>
    <li>Cloud-Sicherungen werden im Browser mit dem gewählten Passwort verschlüsselt. Lokale JSON-Dateien sind lesbar und müssen sicher aufbewahrt werden.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Mini Panel</strong></summary>
  <ul>
    <li><strong>Google Chrome wird für das Mini Panel empfohlen.</strong> Andere Browser funktionieren mit dieser Funktion möglicherweise nicht ordnungsgemäß.</li>
    <li>Mit der Schaltfläche <strong>Mini-panel</strong> öffnen. Das Symbol oben rechts wechselt zwischen den beiden Ansichten.</li>
    <li><strong>Mini Panel — Browser Tabs</strong> steuert separate Transcribe-Notes-Tabs und eignet sich für einen Workspace pro Browser-Tab.</li>
    <li><strong>Mini Panel — Workspaces</strong> zeigt alle Workspaces im ausgewählten Transcribe-Notes-Tab und eignet sich für mehrere Arbeitsbereiche in einem Tab.</li>
    <li>Aufnahmen und Generierungen laufen im Hintergrund weiter, wenn Ansicht oder Workspace gewechselt werden.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Auto-generate, Auto-copy und primäre Notizgenerierung</strong></summary>
  <ul>
    <li><strong>Auto-generate</strong> startet die Notizgenerierung automatisch nach Abschluss der Transkription. Andernfalls wird <strong>Notiz generieren</strong> manuell verwendet.</li>
    <li><strong>Auto-copy</strong> kann das fertige Transkript oder die fertige Notiz automatisch kopieren und benötigt die zugehörige Chrome-Erweiterung. Manuelle Kopierschaltflächen funktionieren unabhängig davon.</li>
    <li>Die primäre Notiz verwendet das Transkript, einen eventuell gewählten Prompt und den Text unter <strong>Ergänzende Informationen</strong>. Anbieter, Modell und gegebenenfalls Reasoning-Stufe vor der Generierung auswählen.</li>
    <li>KI-generierte Notizen können Fehler enthalten oder Angaben auslassen. Vor dem Speichern oder Versenden immer prüfen und validieren.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Secondary Note Generation</strong></summary>
  <p>Dieses Modul ist nützlich, wenn ein langes Dokument zuerst gekürzt werden soll. Text in das Quellfeld einfügen, einen eigenen Prompt und ein Modell auswählen und eine Zusammenfassung erstellen. Das Ergebnis kann automatisch oder manuell in <strong>Ergänzende Informationen</strong> übertragen werden.</p>
  <p>Beispielsweise kann ein günstiges Modell wie GPT-5 Nano über Requesty ein 50-seitiges Dokument zusammenfassen. Das Hauptmodell, etwa GPT-5.6 Sol oder Claude Opus 5.5, erhält dann die kurze Zusammenfassung zusammen mit dem Transkript statt des vollständigen Dokuments. Dies kann Tokenverbrauch und Kosten deutlich senken. Die Zusammenfassung vor der Verwendung als medizinischen Kontext prüfen.</p>
</details><br>

<details>
  <summary><strong>Preis und Tokenverbrauch</strong></summary>
  <ul>
    <li>Wenn Preisdaten vorhanden sind, wird beim ausgewählten Modell der USD-Preis pro einer Million Input- und Output-Tokens angezeigt.</li>
    <li>Nach der Generierung werden Tokenverbrauch und geschätzter Preis angezeigt, wenn die Anbieterantwort die erforderlichen Nutzungsdaten enthält. Einige Anbieter melden genauere Kosten.</li>
    <li><strong>Kostenübersicht</strong> öffnet Links zu den Nutzungs- und Abrechnungsseiten der Anbieter. App-Preise sind Richtwerte; maßgeblich ist die Abrechnung des Anbieters.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Prompt-Slots, Verlauf, Redactor und OCR</strong></summary>
  <ul>
    <li>Es gibt 20 Prompt-Slots. Sie werden in diesem Browser gespeichert und können als JSON oder als verschlüsselte Sicherung über OneDrive und Google Drive importiert und exportiert werden.</li>
    <li>Die Verlaufsspalte zeigt die 30 letzten abgeschlossenen primären Notizgenerierungen des aktiven Workspace. Ein Eintrag zeigt Transkript, ergänzende Informationen und generierte Notiz. Geklonte Workspaces teilen den Verlauf mit ihrer Klonfamilie; andere Workspaces haben einen separaten Verlauf.</li>
    <li><strong>Redactor</strong> kann ausgewählte allgemeine und spezifische Begriffe aus Transkript und ergänzenden Informationen entfernen. Ergebnis vor dem Senden immer prüfen.</li>
    <li><strong>OCR</strong> kann Text aus einem eingefügten Screenshot oder einer Bilddatei extrahieren und an die Liste spezifischer Begriffe oder das Rohtextfeld übergeben.</li>
  </ul>
</details><br>

<details>
  <summary><strong>Speicherung und Datenschutz</strong></summary>
  <ul>
    <li>Arbeitstext und Workspace-Verlauf bleiben in der aktuellen Browser-Tab-Sitzung und werden nach Ende dieser Sitzung entfernt. <strong>Clear</strong> kann aktive Inhalte oder den Verlauf leeren.</li>
    <li>API-Schlüssel werden nicht in localStorage abgelegt. Sie bleiben nur während der aktiven Browsersitzung erhalten und können auf der Startseite manuell gelöscht werden.</li>
    <li>Daten werden an den gewählten Anbieter und die gewählte Region gesendet. Speicherung und Verarbeitung hängen von Anbieter, Konto, Konfiguration und aktuellen Bedingungen ab. Prüfen Sie, ob die Einrichtung für die verarbeiteten Informationen geeignet ist.</li>
  </ul>
</details><br><br>

Erneut <strong>Anleitung</strong> wählen oder die Schließen-Schaltfläche verwenden, um zur Hauptansicht zurückzukehren.
`,

  // Sekundärer Notizgenerator
  secondaryNote: {
    showButton: "Sekundären Notizgenerator anzeigen",
    hideButton: "Sekundären Notizgenerator ausblenden",
    title: "Sekundärer Notizgenerator",
    sourceLabel: "Quelltext",
    sourcePlaceholder: "Quelltext hier einfügen oder eingeben...",
    providerLabel: "Anbieter:",
    modelLabel: "Modell:",
    modeLabel: "Modus:",
    reasoningLabel: "Reasoning-Aufwand:",
    thinkingLabel: "Denkstufe:",
    promptLabel: "Prompt:",
    generateButton: "Notiz generieren",
    abortButton: "Abbrechen",
    copyButton: "Kopieren",
    copiedButton: "Kopiert",
    pushButton: "Einfügen",
    clearOnGenerateLabel: "Zusatzinformationen beim Generieren leeren",
    autoTransferLabel: "Ergebnis automatisch in Zusatzinformationen kopieren",
    sourceDateLabel: "Datum",
    sourceDateToggleAriaLabel: "Heutiges Datum im Quelltext beibehalten",
    sourceDateHelp: 'Wenn EIN: Hält die Zeile "Dagens dato er DD.MM.YYYY" am Anfang des Quelltexts und stellt sie nach dem Aktualisieren der Seite wieder her. Wenn AUS: Entfernt diese Datumszeile aus dem Quelltext.',
    outputPlaceholder: "Die generierte Notiz erscheint hier...",
    timerLabel: "Notizgenerierungs-Timer",
    statusGenerating: "Wird generiert…",
    statusCompleted: "Textgenerierung abgeschlossen!",
    statusFailed: "Generierung fehlgeschlagen",
    statusAborted: "Notizgenerierung abgebrochen.",
    noSourceText: "Kein Quelltext",
    noPromptSelected: "Kein Prompt ausgewählt",
    noOutputToPush: "Noch keine Notiz zum Übertragen",
    transferred: "Ergebnis wurde in die Zusatzinformationen kopiert."
  },
};
