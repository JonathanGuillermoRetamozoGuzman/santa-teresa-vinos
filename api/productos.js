module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const TOKEN   = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({
      error: 'Variables de entorno no encontradas',
      token_exists: !!TOKEN,
      base_exists:  !!BASE_ID
    });
  }

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    const [vinosRes, piscosRes] = await Promise.all([
      fetch(`https://api.airtable.com/v0/${BASE_ID}/Vinos`,  { headers }),
      fetch(`https://api.airtable.com/v0/${BASE_ID}/Piscos`, { headers })
    ]);

    if (!vinosRes.ok) {
      const err = await vinosRes.text();
      return res.status(500).json({ error: 'Error Airtable Vinos', detail: err });
    }
    if (!piscosRes.ok) {
      const err = await piscosRes.text();
      return res.status(500).json({ error: 'Error Airtable Piscos', detail: err });
    }

    const vinosData  = await vinosRes.json();
    const piscosData = await piscosRes.json();

    const vinos = (vinosData.records || []).map(r => ({
      nombre:      r.fields['Nombre']       || '',
      tipo:        r.fields['Tipo']         || '',
      descripcion: r.fields['Descripci\u00f3n']  || '',
      precio:      r.fields['Precio']       || 0,
      stock:       r.fields['Stock']        || 'disponible',
      badge:       r.fields['Badge']        || null,
    }));

    const piscos = (piscosData.records || []).map(r => ({
      nombre:      r.fields['Nombre']       || '',
      variedad:    r.fields['Variedad']     || '',
      descripcion: r.fields['Descripci\u00f3n']  || '',
      precio:      r.fields['Precio']       || 0,
      grado:       r.fields['Grado']        || '',
      stock:       r.fields['Stock']        || 'disponible',
      badge:       r.fields['Badge']        || null,
    }));

    return res.status(200).json({ vinos, piscos });

  } catch (error) {
    return res.status(500).json({
      error: 'Error de conexi\u00f3n con Airtable',
      detail: error.message
    });
  }
};
