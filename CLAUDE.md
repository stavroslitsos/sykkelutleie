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

**Sist oppdatert:** 2026-07-19

**Gjort:**
- Bygget hele nettsiden (norsk/engelsk, priser, sykkeldetaljer, vilkår, kontakt).
- Omdesignet i lys stil med grønn profil, inspirert av referansenettside (promo-bar, header-nav, delt hero-bilde, priser-seksjon med 2 kort).
- Lagt inn ekte bilder av begge syklene + stemningsbilder i hero.
- Opprettet GitHub-repo `stavroslitsos/sykkelutleie` og publisert siden via GitHub Pages.
- Brukeren registrerte og fikk godkjent domenet **bikerentaloslo.no** hos Domeneshop.
- Satt opp DNS-pekere hos Domeneshop (A-poster mot GitHub Pages sine 4 IP-er + `www`-CNAME).
- Lagt til `bikerentaloslo.no` som custom domain i GitHub Pages-innstillinger — «DNS check successful», siden er bekreftet live og fungerer på https://bikerentaloslo.no/.

**Neste steg:**
- HTTPS-sertifikat for bikerentaloslo.no var ikke utstedt ennå ved sesjonsslutt (GitHub ordner dette automatisk via Let's Encrypt, tar normalt noen minutter til en time). Sjekk GitHub Pages-innstillinger → skru på «Enforce HTTPS» så snart det er tilgjengelig (sertifikatet må være utstedt før bryteren blir klikkbar).
- Ellers er nettsiden ferdig og live — ingen andre kjente gjenstående oppgaver.

## Fast regel for økter

Når brukeren sier «nå avslutter jeg økten» (eller lignende formulering), skal Status-seksjonen over **alltid** oppdateres med:
- Hva som ble gjort i økten.
- Hva som gjenstår / neste steg.

Når en ny økt starter, les Status-seksjonen og fortsett arbeidet derfra uten at brukeren trenger å forklare noe på nytt.
