const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };

  try {
    const { clientSecret, prenom, nom, email, club_id, club_name, items } = JSON.parse(event.body);
    const paymentIntentId = clientSecret.split('_secret_')[0];

    await stripe.paymentIntents.update(paymentIntentId, {
      receipt_email: email,
      metadata: {
        prenom,
        nom,
        email,
        club_id,
        club_name,
        items
      }
    });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ ok: true })
    };
  } catch (err) {
    return { statusCode: 400, body: JSON.stringify({ error: err.message }) };
  }
};
