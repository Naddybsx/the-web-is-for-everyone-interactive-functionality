// Importeer het npm package Express (uit de door npm aangemaakte node_modules map)
// Deze package is geïnstalleerd via `npm install`, en staat als 'dependency' in package.json
import express from 'express'

// Importeer de Liquid package (ook als dependency via npm geïnstalleerd)
import { Liquid } from 'liquidjs';

// Maak een nieuwe Express applicatie aan, waarin we de server configureren
const app = express()

// Hier definieer ik de API URL, waar ik data vandaan wil halen
const apiUrl = "https://fdnd-agency.directus.app/items/bib_stekjes";

const afbeeldingenUrl = "https://fdnd-agency.directus.app/items/bib_afbeeldingen?filter={%20%22type%22:%20{%20%22_eq%22:%20%22stekjes%22%20}}";

// Maak werken met data uit formulieren iets prettiger
app.use(express.urlencoded({extended: true}))

// Gebruik de map 'public' voor statische bestanden (resources zoals CSS, JavaScript, afbeeldingen en fonts)
// Bestanden in deze map kunnen dus door de browser gebruikt worden
app.use(express.static('public'))

// Stel Liquid in als 'view engine'
const engine = new Liquid();
app.engine('liquid', engine.express());

// Stel de map met Liquid templates in
// Let op: de browser kan deze bestanden niet rechtstreeks laden (zoals voorheen met HTML bestanden)
app.set('views', './views')

// Get route voor de homepage
app.get('/', async function (request, response) {
  // ----------------- Hier haal ik de stekjes op -----------------
   // Hier doe ik een FETCH naar de API URL
   const stekjesResponse = await fetch(apiUrl);
   // Hier wordt de response omgezet naar JSON
   const stekjesResponseJSON = await stekjesResponse.json();
  // ----------------- Hier haal ik de afbeeldingen op -----------------
    // Hier doe ik een FETCH naar de API URL
   const afbeeldingenResponse = await fetch(afbeeldingenUrl);
    // Hier wordt de response omgezet naar JSON
   const afbeeldingenResponseJSON = await afbeeldingenResponse.json();
    // Hier render ik de index.liquid template, en geef ik de data(stekjes) van de API mee
   response.render('index.liquid', {stekjes: stekjesResponseJSON.data, afbeeldingen: afbeeldingenResponseJSON.data})
})

// Get route voor de detailpagina

app.get('/stekjes', async function (request, response) {
  // hier komt de detailpagina van de stekjes
    response.render('stekjes.liquid')
});

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 9000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})
