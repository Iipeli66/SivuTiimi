exports.handler = async function(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const SUPABASE_URL = 'https://olrhdjfkqqeqsgklyqhf.supabase.co';
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  try {
    const { action, data } = JSON.parse(event.body);

    if (action === 'fetch') {
      const { from, to } = data;
      const res = await fetch(`${SUPABASE_URL}/rest/v1/varaukset?paivamaara=gte.${from}&paivamaara=lte.${to}&select=paivamaara,kellonaika`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
      });
      const bookings = await res.json();
      return { statusCode: 200, headers, body: JSON.stringify(bookings) };
    }

    if (action === 'insert') {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/varaukset`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
      } else {
        const err = await res.text();
        return { statusCode: 400, headers, body: JSON.stringify({ error: err }) };
      }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch(e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
