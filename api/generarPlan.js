import promptTemplate from './prompt_plan.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.3-70b-versatile';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: 'Falta GROQ_API_KEY en el entorno del servidor.' });
  }

  const {
    edad, peso, altura, sexo,
    GET, objetivo,
    tipoEntreno, horaEntreno, intensidad, duracion,
    intolerancias,
  } = req.body || {};

  const datosUsuario = `
EDAD: ${edad}
PESO: ${peso} kg
ALTURA: ${altura} cm
SEXO: ${sexo}
GET (kcal objetivo del día): ${GET} kcal
OBJETIVO: ${objetivo}

ENTRENAMIENTO:
- Tipo: ${tipoEntreno || 'No especificado'}
- Hora: ${horaEntreno || 'No especificada'}
- Intensidad: ${intensidad || 'No especificada'}
- Duración: ${duracion || 0} min

INTOLERANCIAS: ${Array.isArray(intolerancias) && intolerancias.length ? intolerancias.join(', ') : 'Ninguna'}
`.trim();

  const systemPrompt = promptTemplate.replace('{KCAL}', String(GET ?? ''));
  const userPrompt = `Datos del usuario:\n${datosUsuario}\n\nGenera el plan ahora.`;

  try {
    const groqRes = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 2048,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('🔴 Groq error:', groqRes.status, errText);
      return res.status(502).json({ error: `Groq API error ${groqRes.status}: ${errText.slice(0, 300)}` });
    }

    const data = await groqRes.json();
    const plan = data?.choices?.[0]?.message?.content?.trim();

    if (!plan) {
      return res.status(502).json({ error: 'Respuesta vacía del modelo.' });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    console.error('🔴 Error generando plan:', error);
    return res.status(500).json({ error: error.message || 'Error desconocido' });
  }
}
