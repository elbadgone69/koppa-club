const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Vérif mot de passe admin
  const { password } = JSON.parse(event.body || '{}');
  if (password !== process.env.ADMIN_PASSWORD) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Non autorisé' }) };
  }

  try {
    // Récupérer les 200 derniers PaymentIntents réussis
    const intents = await stripe.paymentIntents.list({ limit: 100 });
    const paid = intents.data.filter(p => p.status === 'succeeded');

    const orders = paid.map(p => ({
      id: p.id,
      date: new Date(p.created * 1000).toLocaleDateString('fr-FR'),
      timestamp: p.created,
      prenom: p.metadata.prenom || '',
      nom: p.metadata.nom || '',
      email: p.metadata.email || p.receipt_email || '',
      club_id: p.metadata.club_id || 'inconnu',
      club_name: p.metadata.club_name || 'Inconnu',
      items: p.metadata.items || '',
      total: (p.amount / 100).toFixed(2)
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
