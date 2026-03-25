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
  'Indoor':        'indoor ballroom or hall',
  'Outdoor':       'outdoor',
  'Mix of both':   'semi-outdoor covered terrace',
  'No preference': 'outdoor',
};

// Budget tier → decor scale description
const BUDGET_SCALE = {
  budget:  'simple and elegantly understated',
  mid:     'well-appointed with tasteful floral accents',
  premium: 'lavish with elaborate decorations and premium finishes',
  luxury:  'ultra-luxury opulent with grand floral installations and statement pieces',
};

// Top spending priority → visual feature to emphasise
const PRIORITY_EMPHASIS = {
  'Venue':               'dramatic architectural ceremony space as the centrepiece',
  'Flowers & Décor':     'elaborate floral installations and lush overhead floral canopy',
  'Photography & Video': '',
  'Catering & Drinks':   'beautifully styled tables with elegant place settings visible in background',
  'Music / Entertainment': '',
  'MC & Host':           '',
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

// Derive budget tier from live total (post-vision-board edit) or original budget string
function parseBudgetTier(profile) {
  const live = Number(profile.liveBudget) || 0;
  const b = live > 0 ? live : (() => {
    const s = (profile.budget || '').replace(/,/g, '');
    const nums = s.match(/\d+/g);
    return nums ? Math.max(...nums.map(Number)) : 0;
  })();
  if (b <= 0)      return 'mid';
  if (b < 25000)   return 'budget';
  if (b < 60000)   return 'mid';
  if (b < 100000)  return 'premium';
  return 'luxury';
}

function buildPrompt(profile) {
  const styleDesc = STYLE_DESCRIPTORS[profile.style] || 'romantic, soft floral arrangements';
  const setting   = SETTING_MAP[profile.setting] || 'outdoor';
  const season    = getSeason(profile.date);
  const guests    = parseGuestMid(profile.guests);
  const tier      = parseBudgetTier(profile);
  const scale     = BUDGET_SCALE[tier];

  const defaultPalettes = {
    'Elegant & Formal':    'white and gold',
    'Rustic & Natural':    'ivory and terracotta',
    'Boho & Whimsical':    'dusty rose and sage',
    'Modern & Minimalist': 'white and charcoal',
    'Romantic & Floral':   'blush pink and cream',
    'Fun & Laid-back':     'coral and white',
  };
  const palette = profile.colors || defaultPalettes[profile.style] || 'white and blush';

  // Guest count → scale label
  let guestScale;
  if      (guests <= 30)  guestScale = 'intimate micro-wedding';
  else if (guests <= 75)  guestScale = 'intimate wedding';
  else if (guests <= 120) guestScale = 'medium wedding';
  else                    guestScale = 'large wedding';

  // Venue line: use real venue name (model has world knowledge) + top tags as visual cues
  let venueDesc = setting;
  if (profile.topVenue) {
    const tags = (profile.topVenueTags || []).slice(0, 2).join(', ');
    venueDesc = `${profile.topVenue}${tags ? ' (' + tags + ')' : ''}`;
  }

  let prompt =
    `A photorealistic wedding ceremony, no people, wide establishing shot showing the full ceremony space and aisle from guest perspective, clean composition. ` +
    `STYLE: ${styleDesc}, ${palette} palette, ${scale} decor. ` +
    `VENUE: ${venueDesc}. SEASON: ${season}. ` +
    `SCALE: ${guestScale} (${guests} guests). ` +
    `CAMERA: wide-angle lens, full scene in frame, not a close-up. ` +
    `Photo orientation: landscape 16:9.`;

  const priorityNote = PRIORITY_EMPHASIS[profile.priority] || '';
  if (priorityNote) prompt += ` FEATURE: ${priorityNote}.`;

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
      quality: 'high',
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
