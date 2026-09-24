import { getAiClient } from './aiClient.js';

function providerError(error) {
  if (error.statusCode) return error;
  const wrapped = new Error('AI generation is temporarily unavailable. Please try again.');
  wrapped.statusCode = 502;
  wrapped.errorCode = 'AI_PROVIDER_ERROR';
  return wrapped;
}

async function generateJson(prompt, temperature = 0.3) {
  try {
    const response = await getAiClient().models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature },
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error('[ai] Generation request failed:', error.name, error.statusCode || error.code);
    throw providerError(error);
  }
}

export async function generateProductDescription({ name, brand = '', category = '', features = '', keywords = [] }) {
  const prompt = `You are an e-commerce copywriter for ShopSphere. Use only the supplied product details. Do not claim certifications, warranty, or performance that are not present in those details.
Product: ${name}
Brand: ${brand}
Category: ${category}
Key Features: ${features}
Keywords: ${keywords.join(', ')}

Return only valid JSON with this structure:
{
  "productDescription": "Description grounded in the supplied product details",
  "shortDescription": "One or two concise sentences",
  "keySellingPoints": ["Supported feature and benefit"],
  "searchKeywords": ["relevant keyword"]
}`;

  const result = await generateJson(prompt);
  if (
    typeof result.productDescription !== 'string' ||
    typeof result.shortDescription !== 'string' ||
    !Array.isArray(result.keySellingPoints) ||
    !Array.isArray(result.searchKeywords)
  ) {
    const error = new Error('AI returned an incomplete product description. Please try again.');
    error.statusCode = 502;
    error.errorCode = 'AI_INVALID_RESPONSE';
    throw error;
  }
  return result;
}

export async function generateProductTags({ name, category = '', description = '' }) {
  const prompt = `Generate relevant product search tags using only these details.
Product: ${name}
Category: ${category}
Description: ${description}
Return only a JSON array of strings.`;
  const result = await generateJson(prompt);
  if (!Array.isArray(result) || result.some((tag) => typeof tag !== 'string')) {
    const error = new Error('AI returned invalid product tags. Please try again.');
    error.statusCode = 502;
    error.errorCode = 'AI_INVALID_RESPONSE';
    throw error;
  }
  return [...new Set(result.map((tag) => tag.trim()).filter(Boolean))].slice(0, 10);
}
