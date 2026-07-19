# Claude nettside sykkel

## Om prosjektet
Dette er en gratis nettside for utleie av to sykler (Kalkhoff Entice 3.B Move Trapez og Richmond SL Composite 29), under navnet **Pedal Point Oslo**. Statisk HTML/CSS/JS, ingen rammeverk. Norsk/engelsk språkbytte (knapp øverst, styrt av `data-lang`-attributter + `script.js`, lagres i `localStorage`).

**Filstruktur:**
- [index.html](index.html) — hele siden (promo-bar, header/nav, hero, priser-seksjon med 2 kort, sykkeldetaljer, vilkår, kontakt)
- [style.css](style.css) — lys tema, grønn profil (`--accent: #1e8a45`)
- [script.js](script.js) — språkbytte-logikk
- [images/](images/) — `kalkhoff-*.jpg` og `richmond-*.jpg` (egne bilder av syklene), `lifestyle-*.jpg` (stemningsbilder brukt i hero, bruker har bekreftet rettigheter)

**Live nettside:** https://stavroslitsos.github.io/sykkelutleie/
**GitHub-repo:** https://github.com/stavroslitsos/sykkelutleie (ingen lokal git-auth satt opp — push skjer via GitHub sin web-opplasting i nettleser, ikke `git push`)
**Kontakt på siden:** stav.li@hotmail.com
**Levering/henting:** Kiwi Jerikoveien, Øvre Lindeberg, Oslo

## Status

**Sist oppdatert:** 2026-07-19

**Gjort:**
- Bygget hele nettsiden (norsk/engelsk, priser, sykkeldetaljer, vilkår, kontakt).
- Omdesignet i lys stil med grønn profil, inspirert av referansenettside (promo-bar, header-nav, delt hero-bilde, priser-seksjon med 2 kort).
- Lagt inn ekte bilder av begge syklene + stemningsbilder i hero.
- Opprettet GitHub-repo `stavroslitsos/sykkelutleie` og publisert siden via GitHub Pages (live på stavroslitsos.github.io/sykkelutleie).
- Brukeren registrerte domenet **bikerentaloslo.no** hos Domeneshop.
- La til `bikerentaloslo.no` som custom domain i GitHub Pages-innstillinger (lagret, venter på DNS).

**Neste steg:**
- Domenet `bikerentaloslo.no` venter fortsatt på godkjenning hos Norid («Søknad til behandling» i Domeneshop, ligger under «Mine søknader», ikke «Mine domener» ennå).
- Når domenet er godkjent/aktivt: gå til Domeneshop → DNS-pekere, legg til A-poster for apex-domenet mot GitHub Pages sine IP-er (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153).
- Etter DNS er satt opp og verifisert av GitHub: skru på «Enforce HTTPS» i GitHub Pages-innstillingene.
- Test siden på det nye domenet når alt er live.

## Fast regel for økter

Når brukeren sier «nå avslutter jeg økten» (eller lignende formulering), skal Status-seksjonen over **alltid** oppdateres med:
- Hva som ble gjort i økten.
- Hva som gjenstår / neste steg.

Når en ny økt starter, les Status-seksjonen og fortsett arbeidet derfra uten at brukeren trenger å forklare noe på nytt.
