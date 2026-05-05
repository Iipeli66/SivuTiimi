exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
 
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'API key puuttuu' }) };
    }
 
    const { messages } = JSON.parse(event.body);
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: `Olet SivuTiimin ystävällinen ja asiantunteva asiakaspalveluassistentti. Vastaat suomeksi, rennosti mutta asiallisesti. Pidä vastaukset lyhyinä ja selkeinä.
 
SivuTiimi on nettisivuyritys joka rakentaa ammattimaiset nettisivut yrityksille. Iiro hoitaa kaiken — domain, hosting, design ja ylläpito. Asiakas ei tarvitse teknistä osaamista.
 
PAKETIT:
- Aloita: 479€ kertamaksu + 31€/kk (domain, hosting, muokkaukset sisältyy)
- Erotu: 799€ kertamaksu + 47€/kk (sama + SEO, Google Analytics, laajempi sivusto)
 
TÄRKEÄÄ:
- Kuukausimaksu sisältää kaiken: domain, hosting ja kuukausittaiset päivitykset
- Toimitusaika noin 1 viikko
- Ei piilomaksuja
- Sähköposti: hei@sivutiimi.fi
 
Jos asiakas haluaa tarjouksen tai on valmis aloittamaan, kehota heitä täyttämään tarjouslomake sanomalla: "Paina 'Pyydä tarjous' -nappia niin pääset lomakkeelle!"`,
        messages: messages
      })
    });
 
    const data = await response.json();
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
 
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Jotain meni pieleen' })
    };
  }
};
