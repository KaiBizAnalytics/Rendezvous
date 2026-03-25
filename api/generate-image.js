const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Style → descriptor phrases that steer toward realism, not fantasy
const STYLE_DESCRIPTORS = {
  'Elegant & Formal':    'elegant, structured symmetry, refined luxury decor',
  'Rustic & Natural':    'rustic, organic wood and greenery, natural earthy textures',
  'Boho & Whimsical':    'bohemian, relaxed layering, pampas grass and wildflower arrangements',
  'Modern & Minimalist': 'modern minimalist, clean lines, architectural simplicity',
  'Romantic & Floral':   'romantic, lush floral arrangements, garden-inspired soft florals',
  'Fun & Laid-back':     'casual and warm, festive relaxed atmosphere, colourful accents',
};

const SETTING_MAP = {
  'Indoor':        'indoor',
  'Outdoor':       'outdoor',
  'Mix of both':   'semi-outdoor',
  'No preference': 'outdoor',
};

function getSeason(dateStr) {
  if (!dateStr) return 'summer';
  const m = new Date(dateStr + 'T00:00:00').getMonth() + 1;
  if (m >= 3 && m <= 5)  return 'spring';
  if (m >= 6 && m <= 8)  return 'summer';
  if (m >= 9 && m <= 11) return 'fall';
  return 'winter';
}

function parseGuestMid(g) {
  if (!g) return 80;
  const nums = g.match(/\d+/g);
  if (!nums) return 80;
  if (nums.length >= 2) return Math.round((+nums[0] + +nums[1]) / 2);
  return +nums[0];
}

function buildPrompt(profile) {
  const styleDesc = STYLE_DESCRIPTORS[profile.style] || 'romantic, soft floral arrangements';
  const setting   = SETTING_MAP[profile.setting] || 'outdoor';
  const season    = getSeason(profile.date);
  const guests    = parseGuestMid(profile.guests);

  // Palette: use user's input if provided, else derive a sensible default from style
  const defaultPalettes = {
    'Elegant & Formal':    'white and gold',
    'Rustic & Natural':    'ivory and terracotta',
    'Boho & Whimsical':    'dusty rose and sage',
    'Modern & Minimalist': 'white and charcoal',
    'Romantic & Floral':   'blush pink and cream',
    'Fun & Laid-back':     'coral and white',
  };
  const palette = profile.colors || defaultPalettes[profile.style] || 'white and blush';

  // Base — photorealism anchor at the front, same pattern as the proven sample prompt
  let prompt =
    `A photorealistic wedding ceremony setup, no people, refined ceremony arch, clean composition. ` +
    `STYLE: ${styleDesc}, ${palette} palette. ` +
    `SETTING: ${setting}. SEASON: ${season}. ` +
    `Guests: ${guests} persons. ` +
    `Photo orientation: landscape.`;

  // Append cultural note if provided
  if (profile.cultural) {
    prompt += ` Subtle ${profile.cultural} cultural design elements incorporated into the decor.`;
  }

  return prompt;
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
      model:   'gpt-image-1',
      prompt,
      size:    '1536x1024',
      quality: 'medium',
      n:       1,
    });

    // gpt-image-1 returns base64 (no URL option)
    const b64 = response.data[0].b64_json;
    if (!b64) throw new Error('No image data returned from gpt-image-1');

    const url = `data:image/png;base64,${b64}`;
    res.status(200).json({ url, prompt });
  } catch (err) {
    console.error('Image generation error:', err?.message || err);
    res.status(500).json({ error: 'Image generation failed', detail: err?.message });
  }
};
