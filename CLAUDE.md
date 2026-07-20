# Claude nettside sykkel

## Om prosjektet
Dette er en gratis nettside for utleie av to sykler (Kalkhoff Entice 3.B Move Trapez og Richmond SL Composite 29), under navnet **Pedal Point Oslo**. Statisk HTML/CSS/JS, ingen rammeverk. Norsk/engelsk språkbytte (knapp øverst, styrt av `data-lang`-attributter + `script.js`, lagres i `localStorage`).

**Filstruktur:**
- [index.html](index.html) — hele siden (promo-bar, header/nav, hero, priser-seksjon med 2 kort, sykkeldetaljer, vilkår, kontakt)
- [style.css](style.css) — lys tema, grønn profil (`--accent: #1e8a45`)
- [script.js](script.js) — språkbytte-logikk
- [images/](images/) — `kalkhoff-*.jpg` og `richmond-*.jpg` (egne bilder av syklene), `lifestyle-*.jpg` (stemningsbilder brukt i hero, bruker har bekreftet rettigheter)

**Live nettside:** https://bikerentaloslo.no/ (custom domain, aktiv) — også tilgjengelig på https://stavroslitsos.github.io/sykkelutleie/
**GitHub-repo:** https://github.com/stavroslitsos/sykkelutleie (ingen lokal git-auth satt opp — push skjer via GitHub sin web-opplasting i nettleser, ikke `git push`)
**Domene:** bikerentaloslo.no registrert hos Domeneshop (eid av STAVROS HELSE OG INVEST AS), DNS-pekere satt opp der (4× A-record til GitHub Pages IP-er + `www`-CNAME)
**Kontakt på siden:** stav.li@hotmail.com
**Levering/henting:** Kiwi Jerikoveien, Øvre Lindeberg, Oslo

## Status

**Sist oppdatert:** 2026-07-20

**Gjort:**
- Bygget hele nettsiden (norsk/engelsk, priser, sykkeldetaljer, vilkår, kontakt).
- Omdesignet i lys stil med grønn profil, inspirert av referansenettside (promo-bar, header-nav, delt hero-bilde, priser-seksjon med 2 kort).
- Lagt inn ekte bilder av begge syklene + stemningsbilder i hero.
- Opprettet GitHub-repo `stavroslitsos/sykkelutleie` og publisert siden via GitHub Pages.
- Registrerte og fikk godkjent domenet **bikerentaloslo.no** hos Domeneshop, satt opp DNS (A-poster + www-CNAME) — siden er live og bekreftet fungerende.
- Lagt til Hygglo-lenker (alternativ betalingsmåte for norske leietakere) under hver sykkel.
- Byttet Richmond-bildesettet til nye bilder, fjernet all EXIF-metadata slik at orienteringen vises korrekt i alle nettlesere (viktig lærdom: EXIF-basert auto-rotasjon er upålitelig — bake alltid rotasjonen inn i pikslene og strip metadata).
- Fikset bilde-beskjæring i priskort/galleri/hero (`object-fit: contain` i stedet for `cover`) slik at hele sykkelen alltid vises.
- SEO-optimalisering: meta-tagger, Open Graph, JSON-LD (SportingGoodsStore), `robots.txt`, `sitemap.xml`, manglende H1 lagt til, søkeord i alt-tekster.
- Google Search Console: domene verifisert (DNS TXT-post hos Domeneshop), sitemap sendt inn, forside meldt til prioritert indeksering.
- Bing Webmaster Tools: importert via Google Search Console, sitemap sendt inn, forside meldt til indeksering.
- Google Business Profile opprettet («Pedal Point Oslo», kategori Bicycle rental service, betjeningsområde Oslo, nettside lenket, beskrivelse skrevet). Adresse-verifisering (postkort) er igangsatt av bruker.

**Neste steg:**
- **Google Business Profile-verifisering pågår:** Google ba om videoverifisering i stedet for/i tillegg til postkort — brukeren må selv filme et sammenhengende opptak som viser (1) omgivelser/gateskilt i Oslo, (2) firmanavnet «Pedal Point Oslo» skrevet/trykket synlig, (3) en av syklene eller nettsiden som bevis på virksomheten. Dette kan ikke gjøres av Claude (krever fysisk kamera). Fortsett fra `business.google.com` når video er klar, eller vurder «Change option» for alternativ verifiseringsmetode.
- Bekreft at «Enforce HTTPS» er skrudd på i GitHub Pages-innstillinger (var ikke bekreftet ved forrige sjekk — sertifikatet utstedes automatisk av GitHub, kan ta litt tid).
- Vurder å legge til bilder av syklene i Google Business Profile når den er verifisert (gjøres enklest fra mobil).
- Ellers er nettsiden ferdig og live.

## Fast regel for økter

Når brukeren sier «nå avslutter jeg økten» (eller lignende formulering), skal Status-seksjonen over **alltid** oppdateres med:
- Hva som ble gjort i økten.
- Hva som gjenstår / neste steg.

Når en ny økt starter, les Status-seksjonen og fortsett arbeidet derfra uten at brukeren trenger å forklare noe på nytt.
