export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  const TOKEN = process.env.AIRTABLE_TOKEN;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;

  if (!TOKEN || !BASE_ID) {
    return res.status(500).json({ error: 'Variables de entorno no configuradas' });
  }

  const headers = {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  };

  try {
    // Fetch vinos y piscos en paralelo
    const [vinosRes, piscosRes] = await Promise.all([
      fetch(`https://api.airtable.com/v0/${BASE_ID}/Vinos`, { headers }),
      fetch(`https://api.airtable.com/v0/${BASE_ID}/Piscos`, { headers })
    ]);

    const vinosData = await vinosRes.json();
    const piscosData = await piscosRes.json();

    const vinos = (vinosData.records || []).map(r => ({
      nombre:      r.fields['Nombre']      || '',
      tipo:        r.fields['Tipo']        || '',
      descripcion: r.fields['Descripción'] || '',
      precio:      r.fields['Precio']      || 0,
      stock:       r.fields['Stock']       || 'disponible',
      badge:       r.fields['Badge']       || null,
    }));

    const piscos = (piscosData.records || []).map(r => ({
      nombre:      r.fields['Nombre']      || '',
      variedad:    r.fields['Variedad']    || '',
      descripcion: r.fields['Descripción'] || '',
      precio:      r.fields['Precio']      || 0,
      grado:       r.fields['Grado']       || '',
      stock:       r.fields['Stock']       || 'disponible',
      badge:       r.fields['Badge']       || null,
    }));

    res.status(200).json({ vinos, piscos });

  } catch (error) {
    res.status(500).json({ error: 'Error al conectar con Airtable', detail: error.message });
  }
}
