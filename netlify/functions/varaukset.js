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
  const RESEND_KEY = process.env.RESEND_API_KEY;

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
        // Ilmoitus sinulle
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'hei@sivutiimi.fi',
            subject: `Uusi ajanvaraus — ${data.paivamaara} klo ${data.kellonaika}`,
            html: `
              <h2>Uusi ajanvaraus!</h2>
              <p><strong>Päivä:</strong> ${data.paivamaara} klo ${data.kellonaika}</p>
              <p><strong>Palvelu:</strong> ${data.palvelu || '—'}</p>
              <p><strong>Nimi:</strong> ${data.nimi}</p>
              <p><strong>Sähköposti:</strong> ${data.email}</p>
              <p><strong>Puhelin:</strong> ${data.puhelin || '—'}</p>
              <p><strong>Yritys:</strong> ${data.yritys || '—'}</p>
            `
          })
        });

        // Vahvistus asiakkaalle
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: data.email,
            subject: `Varauksesi vahvistettu — ${data.paivamaara} klo ${data.kellonaika}`,
            html: `
              <h2>Hei ${data.nimi}!</h2>
              <p>Varauksesi on vahvistettu. Tässä yhteenveto:</p>
              <p><strong>Päivä:</strong> ${data.paivamaara} klo ${data.kellonaika}</p>
              <p><strong>Palvelu:</strong> ${data.palvelu || '—'}</p>
              <br>
              <p>Otamme sinuun yhteyttä ennen tapaamista. Jos sinulla on kysyttävää, vastaa tähän sähköpostiin tai soita 040 192 8101.</p>
              <br>
              <p>Nähdään pian!<br><strong>SivuTiimi</strong></p>
            `
          })
        });

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
