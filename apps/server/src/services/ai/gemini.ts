import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ContentGenerationRequest, GeneratedContent } from './openai.js';

let geminiClient: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return geminiClient;
}

export async function generateContent(request: ContentGenerationRequest): Promise<GeneratedContent> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
Return ONLY valid JSON, no markdown code blocks or explanations.`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();

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
    console.error('Failed to parse Gemini response:', content);
    throw new Error('Failed to parse AI-generated content');
  }
}

export async function generateProductDescription(
  productTitle: string,
  brandName: string,
  brandDescription?: string
): Promise<{ title: string; description: string }> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error('Gemini API key not configured');
  }

  const model = client.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Write a compelling product title (max 8 words) and description (2-3 sentences) for an Amazon affiliate site:
Product: ${productTitle}
Brand: ${brandName}
Brand Focus: ${brandDescription || 'Quality products'}

Return ONLY valid JSON, no markdown: { "title": "...", "description": "..." }`;

  const result = await model.generateContent(prompt);
  const content = result.response.text();

  if (!content) {
    throw new Error('No content generated');
  }

  let jsonContent = content.trim();
  if (jsonContent.startsWith('```')) {
    jsonContent = jsonContent.replace(/```json?\n?/g, '').replace(/```$/g, '');
  }

  return JSON.parse(jsonContent);
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
