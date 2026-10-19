# Amsterdam Roleplay — nieuw ontwerp

Het nieuwe Amsterdam-ontwerp staat rechtstreeks in deze repository. Het gebruikt de uitstraling en regelgeving van Heerlen Roleplay, met Amsterdam als identiteit. Dit project komt overeen met de lokale preview op poort 4300. De eerdere statische website staat in de [geschiedenis van amsterdamrp](https://github.com/GillesVGB/amsterdamrp/commit/d5b2811f8224ac94233012d7f7523c15a0eed86d).

Inbegrepen: navigatie, responsive styling, thema, paginazoeker, 65 APV-artikelen, strafcategorieën, algemene regels, Discord-regels, zoeken en filters, bewaarde artikelen, artikellinks en afdrukken. De serverstatuskaart bevat status, spelers, capaciteit, controletijd en vernieuwen. De knop Open FiveM is verwijderd.

## Lokaal bekijken

Node.js 20 of nieuwer en internettoegang zijn nodig. Er zijn geen npm-dependencies nodig.

```sh
npm run preview
```

Open http://127.0.0.1:4300/regels#apv. Voor de homepage: http://127.0.0.1:4300/.

## Adminpreview zonder login

Open http://127.0.0.1:4300/admin/ of direct http://127.0.0.1:4300/admin/#themes. Deze preview heeft bewust geen login, op verzoek van de eigenaar. Er zijn geen onbeveiligde beheer-API's toegevoegd. Instellingen worden uitsluitend in de browser opgeslagen en veranderen geen serverinstellingen of gegevens van andere bezoekers.

Beschikbaar: overzicht met live openbare server- en winkelgegevens, seizoensthema’s met desktop- en mobielvoorbeeld, decoraties en beweging aan/uit, mededeling, onderhoudsvoorbeeld, Discord- en FiveM-links, instellingen importeren/exporteren en herstellen. De thema’s zijn Standaard, Halloween (gloeiende pompoenen, maanlicht, vleermuizen, spinnenweb, mist en een spookje dat periodiek door beeld zweeft), Kerst (donkere winterstijl met witte accenten, subtiele lichtslingers, sneeuwranden op kaarten, vertakte sneeuwvlokken, zilveren kerstballen, besneeuwde bomen en een vliegende slee met kerstman en drie rendieren) en Pasen (eieren, paashaas en bloesem). Minder-bewegingvoorkeuren worden standaard gerespecteerd. De optie ‘Ook bij minder beweging’ biedt een bewuste keuze om de animaties toch af te spelen.

Na opslaan worden andere previewtabbladen in dezelfde browser bijgewerkt. Tijdens onderhoud is uitsluitend de schermvullende titel en melding zichtbaar; navigatie, pagina-inhoud en decoraties worden verborgen. De admin blijft bereikbaar om onderhoud uit te schakelen. De lokale preview toont de eigen appbasis, ook als de oorspronkelijke website onderhoud heeft ingesteld; de live hostinginstellingen worden daarmee niet aangepast.

Discord-ID `1521182074118082599` is genoteerd voor de latere beveiligde koppeling. Die authenticatie en gedeelde serveropslag zijn nog niet aangezet. Productprijzen, transacties en rolclaims blijven bij het bestaande beveiligde winkelbeheer.

Het voorbeeld haalt de publieke Amsterdam-app en gegevens van amsterdamrp.nl op en voegt de ontwerpbestanden lokaal toe. Deze repository bevat niet de oorspronkelijke React-broncode of backend. De preview is alleen-lezen: accountwijzigingen, betalingen, uploads en rolclaims worden geblokkeerd. De Discord-login gaat naar de bestaande website.

## Publiceren op Netlify

De repository bevat `netlify.toml`. De juiste instellingen zijn:

- Build command: `npm run build`
- Publish directory: `outputs`
- Functions directory: `netlify/functions`

De build werkt zonder netwerktoegang of extra npm-dependencies en maakt `outputs/index.html`, de ontwerpassets en de SPA-routering. Daardoor werken ook directe links naar `/regels`, `/doneren` en andere pagina's.

De oorspronkelijke appbundels en media worden tijdens het bezoeken via Netlify-proxyregels van amsterdamrp.nl geladen. Openbare API-gegevens lopen via een Netlify Function zonder cache. Dit blijft afhankelijk van de bereikbaarheid van de bestaande website. Accountwijzigingen, betalingen en claims zijn, net als in de lokale preview, niet vanuit dit ontwerpvoorbeeld beschikbaar. Discord-login verwijst naar de bestaande website; de oorspronkelijke OAuth- en betaalbackend zijn niet gemigreerd.

Laat amsterdamrp.nl op zijn huidige hosting staan. Als dat domein naar deze Netlify-site gaat wijzen, ontstaan er terugverwijzingen naar dezelfde site. Voor een volledige verhuizing zijn de oorspronkelijke appbroncode en backendconfiguratie nodig.

## Installeren op de bestaande Amsterdam-app

```sh
npm run apply -- --root /volledig/pad/naar/de/bestaande/publieke/webmap
```

Het script controleert de bestaande React-build, bewaart de originele index en voegt de vijf ontwerpassets toe. De bestaande backend blijft verantwoordelijk voor inloggen, afrekenen, betalingen, winkelgegevens, skins en rolclaims.

Installatie van de ontwerpassets op de bestaande server behoudt daar de oorspronkelijke backendfuncties. De Netlify-publicatie is het ontwerpvoorbeeld met de hiervoor beschreven koppelingen.

Zie [installatie en terugzetten](LEES-MIJ.md) en [uitgevoerde controles](CONTROLE.md).

## Bestanden controleren

```sh
npm run check
```

## Updates en vacatures

De pagina’s `/updates` en `/vacatures` gebruiken dezelfde gedeelde navigatie en stijl. Updates kunnen een serverupdate of APV-wijziging zijn, met links naar bestaande artikelen. Vacatures ondersteunen teamfilters, vereisten, aantallen, een HTTPS-sollicitatielink en een sluitingsdatum; verstreken vacatures accepteren geen sollicitaties meer.

De adminpreview bevat aparte editors voor concepten, publiceren, bewerken en terugzetten naar concept. Content wordt samen met de andere preview-instellingen in deze browser bewaard, inclusief import/export. Er worden geen voorbeeldberichten gepubliceerd. Dit is nog geen gedeeld CMS: andere browsers zien pas dezelfde berichten wanneer beveiligde backendopslag en adminlogin zijn gekoppeld. De bestaande OAuth- en betaalroutes blijven naar de oorspronkelijke website verwijzen.
