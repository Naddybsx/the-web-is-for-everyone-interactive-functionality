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
//--------------------------------------------------------------------------------------------------------------------//

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
//--------------------------------------------------------------------------------------------------------------------//

// Get route voor de detailpagina
// Hier maak ik een route aan voor de detailpagina van een stekje, met een dynamische parameter
app.get('/stekjes/:id', async function (request, response) {
  // Hier haal ik het stekje op met het juiste ID
  const stekjeId = request.params.id;
  // Hier doe ik een FETCH naar de API URL, met het ID van het stekje
  const stekjeResponse = await fetch(`${apiUrl}/${stekjeId}`);
  // Hier wordt de response omgezet naar JSON
  const stekjeData = await stekjeResponse.json();
  // Hier render ik de stekjes.liquid template, en geef ik de data(stekje) van de API mee
    response.render('stekjes.liquid', {stekje: stekjeData.data})
});
//--------------------------------------------------------------------------------------------------------------------//

// Hier maak ik een POST route aan voor het liken van een stekje
app.post('/stekjes/:id', async function (request, response) {
// Hier haal ik het ID uit de URL
const stekjeId = request.params.id;
// Dit is hardcoded mijn eigen user ID
const userId = 4;

// Hiermee check ik of een stekje al is geliked door mij als user, zodat ik kan bepalen of ik een like wil toevoegen of verwijderen
const userstekjeEntry = await fetch(`https://fdnd-agency.directus.app/items/bib_users_stekjes?filter={"bib_stekjes_id":${stekjeId},"bib_users_id":${userId}}`)
const userstekjeEntryJSON = await userstekjeEntry.json()

// Als de like al bestaat → verwijder de like (unlike)

if (userstekjeEntryJSON.data.length != 0) { // Als de like al bestaat, dan is de lengte van de array niet 0
  await fetch(`https://fdnd-agency.directus.app/items/bib_users_stekjes/${userstekjeEntryJSON.data[0].id}`, { // Ik doe een fetch naar de koppeltabel waar ik mijn likes wil verwijderen
    method: 'DELETE' // Met delete wil ik een like verwijderen uit de database, dus ik gebruik de DELETE methode
  });
} else {
  // Als de like nog niet bestaat → voeg de like toe en verstuur een POST naar de koppeltabel om de like op te slaan

 await fetch('https://fdnd-agency.directus.app/items/bib_users_stekjes', {  // Ik doe een fetch naar het koppeltabel waar ik mijn likes wil opslaan
    method: 'POST',  // Met post wil ik een like toevoegen aan de database, dus ik gebruik de POST methode
    headers: {   // Met headers weet de server dat ik JSON data ga sturen
      'Content-Type': 'application/json' 
    },
// De inhoud van de post(like) voeg je toe in de body
// Hier maak ik twee objecten aan, bib_users_id en bib_stekjes_id
    body: JSON.stringify({
      bib_users_id: userId, // Wie liked? (bib_users_id)
      bib_stekjes_id: stekjeId // Welk stekje wordt geliked? (bib_stekjes_id)
// Met request.params.id worden de waarden dynamisch ingevuld
    })
  });
}
  // Stuurt de gebruiker terug naar de detailpagina van het stekje
  response.redirect(303, `/stekjes/${stekjeId}`);
});
//--------------------------------------------------------------------------------------------------------------------//

// Stel het poortnummer in waar Express op moet gaan luisteren
// Lokaal is dit poort 8000; als deze applicatie ergens gehost wordt, waarschijnlijk poort 80
app.set('port', process.env.PORT || 9000)

// Start Express op, gebruik daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function () {
  // Toon een bericht in de console
  console.log(`Daarna kun je via http://localhost:${app.get('port')}/ jouw interactieve website bekijken.\n\nThe Web is for Everyone. Maak mooie dingen 🙂`)
})
