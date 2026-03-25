const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const STYLE_MAP = {
  'Elegant & Formal':    'elegant formal black-tie',
  'Rustic & Natural':    'rustic natural barn',
  'Boho & Whimsical':    'bohemian whimsical free-spirited',
  'Modern & Minimalist': 'modern minimalist architectural',
  'Romantic & Floral':   'romantic lush floral garden',
  'Fun & Laid-back':     'relaxed fun casual',
};

const SETTING_MAP = {
  'Indoor':       'indoor',
  'Outdoor':      'outdoor',
  'Mix of both':  'semi-outdoor',
  'No preference':'outdoor',
};

function getSeason(dateStr) {
  if (!dateStr) return 'summer';
  const m = new Date(dateStr + 'T00:00:00').getMonth() + 1;
  if (m >= 3 && m <= 5)  return 'spring';
  if (m >= 6 && m <= 8)  return 'summer';
  if (m >= 9 && m <= 11) return 'fall';
  return 'winter';
}

function buildPrompt(profile) {
  const style   = STYLE_MAP[profile.style]     || 'romantic elegant';
  const setting = SETTING_MAP[profile.setting] || 'outdoor';
  const season  = getSeason(profile.date);

  const parts = [
    `A stunning ${style} ${setting} wedding ceremony scene in ${season}`,
    'Wide-angle view of the ceremony setup',
    'Beautifully decorated aisle, floral arch, draped fabric, candles or lanterns',
    'Empty ceremony — no people, no guests, no wedding party',
    'Warm soft natural lighting, golden hour atmosphere',
    'Photorealistic editorial wedding photography style',
    'Ultra high resolution, shallow depth of field',
  ];

  if (profile.colors) {
    parts.push(`Colour palette: ${profile.colors}`);
  }
  if (profile.cultural) {
    parts.push(`Subtle cultural design elements: ${profile.cultural}`);
  }
  if (profile.setting === 'Indoor') {
    parts.push('Grand interior with high ceilings, elegant drapery, ambient lighting');
  } else {
    parts.push('Lush greenery, natural landscape backdrop');
  }

  return parts.join('. ') + '.';
}

module.exports = async function handler(req, res) {
  // Allow CORS for same-origin Vercel deployment
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY not configured' });
  }

  try {
    const prompt = buildPrompt(req.body || {});
    console.log('Generating image with prompt:', prompt);

    const response = await openai.images.generate({
      model:   'dall-e-3',
      prompt,
      size:    '1792x1024',
      quality: 'standard',
      n:       1,
    });

    const url = response.data[0].url;
    res.status(200).json({ url, prompt });
  } catch (err) {
    console.error('DALL-E error:', err?.message || err);
    res.status(500).json({ error: 'Image generation failed', detail: err?.message });
  }
};
