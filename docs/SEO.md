# Audit e manutenzione SEO — 27 novembre 2026

## Stato verificato

- Dominio ufficiale: https://www.simonepinetti.it/ (CNAME coerente).
- HTTP, dominio senza www e indirizzo GitHub Pages restituiscono redirect 301 verso HTTPS con www; homepage HTTP 200, nessun X-Robots-Tag noindex.
- Prima dell'intervento mancavano canonical, sitemap, robots.txt, Open Graph, Twitter Cards e JSON-LD. L'assenza di robots.txt/sitemap non impediva di per sé l'indicizzazione.
- Un H1, dodici H2, tredici sezioni; nessun ID duplicato, nessuna ancora interna senza destinazione e nessuna immagine senza alt.
- Profilo, curriculum, pubblicazioni e didattica sono già presenti nell'HTML statico. La mappa e la traduzione EN dipendono da JavaScript. I post restano contenuti esterni LinkedIn: non vengono ricostruiti né considerati testo editoriale del dominio.
- Foto principale WebP circa 125 KB, dimensioni dichiarate e fetchpriority high già corretti; poster con dimensioni esplicite e caricamento differito già presenti. CSS e JS locali e modulari; nessun framework o font remoto aggiunto.

## Interventi

- index.html: title e description IT/EN, canonical, metadati social, JSON-LD Person / WebSite / ProfilePage. UNIMORE rappresentata come CollegeOrUniversity in alumniOf; nessuna affiliazione lavorativa corrente dedotta.
- sameAs: solo LinkedIn fornito dal proprietario e già presente nei Contatti, e account GitHub proprietario del repository. LinkedIn limita la verifica automatica del profilo (HTTP 999); nessun ORCID, Scholar o profilo universitario indovinato.
- Dati strutturati limitati all'identità; ScholarlyArticle non aggiunto per evitare di duplicare senza revisione puntuale i dati bibliografici della sezione Pubblicazioni.
- CSP conservata e aggiornata con un hash SHA-256 esatto del solo blocco JSON-LD: non aggiunto unsafe-inline. Se il JSON-LD cambia, aggiornare anche l'hash.
- robots.txt: scansione consentita e riferimento alla sitemap.
- sitemap.xml: esclusivamente homepage canonica, nessuna ancora o URL inesistente; lastmod omesso anziché inventare una data.
- assets/social-preview.png: 1200 × 630, circa 48 KB; grafica tipografica con palette del sito, nessuna foto artificiale. assets/social-preview.svg è la sorgente modificabile. Favicon SVG esistente conservata.
- I 15 iframe LinkedIn e quello Open Badge Passport usano loading="lazy": caricamento automatico all'avvicinarsi alla viewport, senza pulsanti di attivazione. URL, altezze e controllo mostra/nascondi conservati. Non garantisce che i provider esterni siano sempre accessibili.
- Nessuna modifica a CSS, moduli JavaScript, date, contenuti biografici, pubblicazioni o DNS.

## Verifiche e limiti

- JSON e XML parsabili, hash CSP coerente, canonical unico, nessun noindex, corpo HTML identico salvo loading degli iframe.
- Anteprima in Chrome desktop: homepage e fotografia visibili, rotazione delle qualifiche osservata, cambio IT→EN→IT funzionante anche nel title, nessun overflow orizzontale. Nessun errore applicativo o CSP osservato nei log consultati (presenti messaggi dell'estensione del browser).
- Nessun test effettuato su Safari/iPhone. Nessun audit Lighthouse/PSI o misurazione affidabile di LCP, CLS e INP eseguito in questa sessione. Nessun dato CrUX/Search Console acquisito: non sono dichiarati punteggi né miglioramenti quantitativi.
- Controllati collegamenti interni e risorse locali; non certificato lo stato di tutti i siti esterni/DOI. Non modificati i riferimenti bibliografici.
- Verificare la sintassi con il Rich Results Test sulla homepage pubblicata. La validazione locale del JSON non equivale all'idoneità a risultati avanzati Google. Nessuna garanzia di indicizzazione, prima posizione o Knowledge Panel.

## Multilingue: proposta successiva, non implementata

Il selettore attuale mantiene un unico URL. Google può leggere l'italiano statico, ma non dispone di una pagina inglese autonoma: non basta che il testo EN sia negli attributi data-en.
Proposta: mantenere / in italiano e creare /en/ con HTML inglese prerenderizzato, asset condivisi, link di lingua che conservano la sezione, canonical autoreferenziali e hreflang reciproci it/en/x-default. Generare entrambe le pagine da un'unica fonte per evitare divergenze. Solo dopo la pubblicazione effettiva aggiungere /en/ alla sitemap. Questa modifica architetturale richiede una decisione separata; il selettore attuale è conservato.

## Search Console — operazioni del proprietario

1. Nella proprietà del dominio, aprire **Sitemap** e inviare https://www.simonepinetti.it/sitemap.xml. Controllare che l'elaborazione riesca.
2. In **Controllo URL**, inserire https://www.simonepinetti.it/, eseguire il test dell'URL pubblicato e verificare canonical e accessibilità. La richiesta di indicizzazione già inviata non garantisce tempi; non serve ripeterla quotidianamente.
3. In **Indicizzazione → Pagine**, monitorare se la homepage viene indicizzata e leggere eventuali motivazioni di esclusione.
4. In **Rendimento → Risultati di ricerca**, attivare clic, impressioni, CTR e posizione media. Filtrare la query “Simone Pinetti”, poi confrontare le query professionali e i periodi disponibili. Un sito nuovo può avere pochi o nessun dato.
5. In **Esperienza → Core Web Vitals**, verificare i gruppi mobile e desktop quando esistono dati sufficienti. Integrare con PageSpeed Insights: i test di laboratorio non equivalgono ai dati reali né misurano in modo completo l'INP sul campo.

## Autorevolezza senza costi

Inserire l'URL canonico nel profilo LinkedIn, nel profilo GitHub, nei profili ORCID/Scholar eventualmente posseduti, nelle firme professionali e nelle biografie dei contributi scientifici. Richiedere un collegamento nelle pagine istituzionali o dei progetti quando pertinente e consentito, distinguendo collaborazione e appartenenza. Nessun acquisto di link, iscrizione automatica a directory o invio di messaggi effettuato.

## Fonti ufficiali

- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/appearance/structured-data/profile-page
- https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- https://schema.org/Person
- https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Ripristino

Le modifiche sono isolate in un commit SEO. Usare un revert di quel commit per annullarle preservando gli aggiornamenti successivi; non effettuare reset forzati di main.
