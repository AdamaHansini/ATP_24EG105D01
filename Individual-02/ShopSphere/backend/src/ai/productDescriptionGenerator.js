// backend/src/ai/productDescriptionGenerator.js
import { getAiClient } from './aiClient.js';

export async function generateProductDescription({ name, brand = '', category = '', features = '', keywords = [] }) {
  const prompt = `You are a professional e-commerce copywriter for ShopSphere marketplace.
Generate a compelling, conversion-focused product description package for:
Product: ${name}
Brand: ${brand}
Category: ${category}
Key Features: ${features}
Keywords: ${keywords.join(', ')}

Return ONLY valid JSON with this structure:
{
  "productDescription": "Rich, multi-paragraph markdown or HTML styled description highlighting build quality, ergonomics, and real-world advantages.",
  "shortDescription": "1-2 punchy sentences summarizing the core value proposition.",
  "keySellingPoints": [
    "Feature point 1 with benefit",
    "Feature point 2 with benefit",
    "Feature point 3 with benefit",
    "Feature point 4 with benefit"
  ],
  "searchKeywords": ["keyword1", "keyword2", "keyword3", "keyword4"]
}`;

  const ai = getAiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });
      return JSON.parse(response.text.trim());
    } catch (err) {
      console.warn('Gemini description generator failed, fallback:', err.message);
    }
  }

  // Fallback
  return {
    productDescription: `Experience uncompromising craftsmanship with the ${name} by ${brand || 'ShopSphere Essentials'}. Engineered for demanding everyday use, it balances premium materials with intuitive functionality, making it an essential addition to your daily routine.`,
    shortDescription: `Top-tier ${category || 'product'} from ${brand || 'ShopSphere'} built for performance and durability.`,
    keySellingPoints: [
      `Precision engineered by ${brand || 'top manufacturers'}`,
      'Designed for long-lasting durability and peak efficiency',
      'Ergonomic, modern aesthetic suited for any environment',
      'Includes complete warranty and dedicated customer support',
    ],
    searchKeywords: [name.toLowerCase(), (brand + ' ' + category).toLowerCase(), 'best ' + category.toLowerCase(), 'buy online'],
  };
}

export async function generateProductTags({ name, category = '', description = '' }) {
  const prompt = `Generate 6-10 e-commerce search tags for the product: "${name}", category: "${category}".
Return ONLY a JSON array of string tags: ["tag1", "tag2", ...]`;

  const ai = getAiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });
      return JSON.parse(response.text.trim());
    } catch (e) {
      // Fallback
    }
  }
  return [
    category.toLowerCase() || 'lifestyle',
    'trending',
    'quality',
    'best-value',
    'authentic',
    name.split(' ')[0].toLowerCase(),
  ];
}
