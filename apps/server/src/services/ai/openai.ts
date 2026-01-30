import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

export function getOpenAIClient(): OpenAI | null {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

export interface ContentGenerationRequest {
  brandName: string;
  brandDescription?: string;
  products: Array<{
    asin: string;
    title?: string;
    customTitle?: string;
    customDescription?: string;
  }>;
  template: string;
  language?: string;
}

export interface GeneratedContent {
  hero: {
    badge: string;
    title: string;
    description: string;
  };
  features: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  products: Array<{
    asin: string;
    title: string;
    description: string;
    rating: string;
  }>;
  testimonials: Array<{
    text: string;
    name: string;
    title: string;
    initial: string;
  }>;
  comparison: {
    features: Array<{
      name: string;
      description: string;
    }>;
  };
  cta: {
    sectionTitle: string;
    sectionDescription: string;
    buttonLabel: string;
  };
  meta: {
    title: string;
    description: string;
    tagline: string;
  };
  featuresSection: {
    title: string;
    subtitle: string;
  };
  productsSection: {
    title: string;
    subtitle: string;
  };
  testimonialsSection: {
    title: string;
    subtitle: string;
  };
  comparisonSection: {
    title: string;
    subtitle: string;
  };
}

export async function generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const productList = request.products
    .map((p, i) => `${i + 1}. ${p.customTitle || p.title || `Product ${p.asin}`}`)
    .join('\n');

  const prompt = `You are a professional copywriter for affiliate marketing websites. Generate compelling, conversion-focused content for a "${request.template}" template website.

BRAND INFORMATION:
- Brand Name: ${request.brandName}
- Brand Description: ${request.brandDescription || 'Not provided'}
- Products (${request.products.length}):
${productList || 'No products added yet'}

Generate content in JSON format with the following structure. Make the content persuasive, professional, and focused on driving Amazon affiliate conversions. Use power words and create urgency where appropriate.

{
  "hero": {
    "badge": "Short badge text like 'Top Rated 2024' or 'Expert Picks' (max 3 words)",
    "title": "Compelling headline that includes the brand focus (max 10 words)",
    "description": "Persuasive subheadline explaining value proposition (2-3 sentences)"
  },
  "features": [
    {
      "icon": "One of: ★, ✓, ⚡, 🛡️, 💰, 🎯, 📦, 🔒",
      "title": "Feature benefit title (3-4 words)",
      "description": "Brief explanation of the benefit (1 sentence)"
    }
  ],
  "products": [
    {
      "asin": "Keep the original ASIN",
      "title": "Compelling product title (max 8 words)",
      "description": "Persuasive product description highlighting benefits (2 sentences)",
      "rating": "Rating like '4.8'"
    }
  ],
  "testimonials": [
    {
      "text": "Realistic customer testimonial quote (2-3 sentences)",
      "name": "Realistic first name and last initial",
      "title": "Like 'Verified Buyer' or 'Happy Customer'",
      "initial": "First letter of name"
    }
  ],
  "comparison": {
    "features": [
      {
        "name": "Comparison feature name",
        "description": "Brief description"
      }
    ]
  },
  "cta": {
    "sectionTitle": "Compelling CTA section headline",
    "sectionDescription": "Urgency-creating description (1-2 sentences)",
    "buttonLabel": "Action-oriented button text (2-4 words)"
  },
  "meta": {
    "title": "SEO page title (50-60 chars)",
    "description": "SEO meta description (150-160 chars)",
    "tagline": "Short brand tagline (3-6 words)"
  },
  "featuresSection": {
    "title": "Section title for features",
    "subtitle": "Brief subtitle"
  },
  "productsSection": {
    "title": "Section title for products",
    "subtitle": "Brief subtitle"
  },
  "testimonialsSection": {
    "title": "Section title for testimonials",
    "subtitle": "Brief subtitle"
  },
  "comparisonSection": {
    "title": "Section title for comparison",
    "subtitle": "Brief subtitle"
  }
}

Generate exactly 4 features, ${request.products.length || 3} products (match the input), 3 testimonials, and 4 comparison features.
Return ONLY valid JSON, no markdown code blocks.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert affiliate marketing copywriter. Return only valid JSON without markdown formatting.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
    max_tokens: 2500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content generated');
  }

  // Parse JSON response, handling potential markdown code blocks
  let jsonContent = content.trim();
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '');
  }

  try {
    return JSON.parse(jsonContent) as GeneratedContent;
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    throw new Error('Failed to parse AI-generated content');
  }
}

export async function generateProductDescription(
  productTitle: string,
  brandName: string,
  brandDescription?: string
): Promise<{ title: string; description: string }> {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert product copywriter for Amazon affiliate sites. Write compelling, benefit-focused product descriptions.',
      },
      {
        role: 'user',
        content: `Write a compelling product title (max 8 words) and description (2-3 sentences) for:
Product: ${productTitle}
Brand: ${brandName}
Brand Focus: ${brandDescription || 'Quality products'}

Return JSON: { "title": "...", "description": "..." }`,
      },
    ],
    temperature: 0.7,
    max_tokens: 300,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('No content generated');
  }

  let jsonContent = content.trim();
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '');
  }

  return JSON.parse(jsonContent);
}

export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
