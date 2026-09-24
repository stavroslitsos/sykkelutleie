// Shared by the main page and the floating panel. Resolve the Chrome extension
// download from this module so the same help content works in both views.
const chromeZip = new URL('../../div/autocopy.zip', import.meta.url).href;

export function autoCopyHelpHtml(language = 'en') {
  const no = ['no', 'nb', 'nn'].includes(language);
  return no
    ? `<strong>Krever Chrome-utvidelse</strong><br/>
For å bruke Auto-copy må du først laste ned og installere Chrome-utvidelsen:
<a href="${chromeZip}" download>autocopy.zip</a><br/><br/>
Pakk ut filen, les README-filen inni mappen, åpne <code>chrome://extensions</code>, slå på Developer mode, velg Load unpacked og oppdater siden etterpå.<br/><br/>
Når utvidelsen er installert, kan ferdige transkripsjoner eller notater kopieres automatisk avhengig av valgt modus.<br/><br/>
Når du slår Auto-generer PÅ, byttes Auto-copy automatisk til Notat.
Når du slår Auto-generer AV, byttes Auto-copy automatisk til Transkripsjon.<br/><br/>
Du kan fortsatt endre Auto-copy manuelt etterpå. Det valget beholdes helt til du bytter Auto-generer igjen.<br/><br/>
Hvis varsler er tillatt i Chrome/Windows, kan du også få et varsel når kopieringen er fullført.`
    : `<strong>Chrome extension required</strong><br/>
To use Auto-copy, first download and install the Chrome extension:
<a href="${chromeZip}" download>autocopy.zip</a><br/><br/>
Unzip the file, read the README inside the folder, open <code>chrome://extensions</code>, turn on Developer mode, choose Load unpacked, and refresh this page afterwards.<br/><br/>
After installation, finished transcripts or notes can be copied automatically depending on the selected mode.<br/><br/>
When you turn Auto-generate ON, Auto-copy automatically switches to Note.
When you turn Auto-generate OFF, Auto-copy automatically switches to Transcript.<br/><br/>
You can still change Auto-copy manually afterward. That manual choice stays active until Auto-generate is toggled again.<br/><br/>
If notifications are allowed in Chrome/Windows, you may also get a notification when copying is complete.`;
}
