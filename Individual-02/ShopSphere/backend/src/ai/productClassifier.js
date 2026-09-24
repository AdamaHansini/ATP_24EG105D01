import { getAiClient, toAiProviderError } from './aiClient.js';
import { Category } from '../models/index.js';

export async function predictProductTaxonomy({
  name,
  description = '',
  brand = '',
  features = '',
  specifications = '',
  color = '',
  material = '',
  targetAudience = '',
}) {
  const ai = getAiClient();
  const categories = await Category.find().select('name');
  const categoryNames = categories.map(({ name: categoryName }) => categoryName);
  if (!categoryNames.length) {
    const error = new Error('Add marketplace categories before requesting product classification.');
    error.statusCode = 409;
    error.errorCode = 'CATEGORY_CATALOG_EMPTY';
    throw error;
  }

  const prompt = `Classify this product using only the provided product details and choose one exact category from the marketplace category list.
Product Name: "${name}"
Description: "${description}"
Brand: "${brand}"
Features: "${features}"
Specifications: "${specifications}"
Color: "${color}"
Material: "${material}"
Target Audience: "${targetAudience}"
Available Marketplace Categories: ${categoryNames.join(', ')}

Return only a JSON object matching this schema:
{
  "category": "one exact available category",
  "subcategory": "specific subcategory",
  "tags": ["relevant tag"],
  "attributes": {"key": "supported value"},
  "keywords": ["relevant keyword"],
  "confidence": 0.0
}`;

  let response;
  try {
    response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json', temperature: 0.2 },
    });
  } catch (cause) {
    throw toAiProviderError(cause, 'Product classification request');
  }

  let data;
  try {
    data = JSON.parse(response.text.trim());
  } catch {
    const error = new Error('The AI provider returned an unreadable classification. Please try again.');
    error.statusCode = 502;
    error.errorCode = 'AI_INVALID_RESPONSE';
    error.expose = true;
    throw error;
  }

  const categoryValue = String(data?.category || '').trim();
  const category = categoryNames.find((value) => value.toLowerCase() === categoryValue.toLowerCase());
  const confidence = Number(data?.confidence);
  if (
    !category ||
    typeof data.subcategory !== 'string' ||
    !Array.isArray(data.tags) ||
    !Array.isArray(data.keywords) ||
    !Number.isFinite(confidence) ||
    !data.attributes || typeof data.attributes !== 'object' || Array.isArray(data.attributes)
  ) {
    const error = new Error('AI returned an incomplete product classification. Please try again.');
    error.statusCode = 502;
    error.errorCode = 'AI_INVALID_RESPONSE';
    throw error;
  }

  const attributes = Object.fromEntries(
    Object.entries(data.attributes)
      .filter(([, value]) => ['string', 'number'].includes(typeof value))
      .map(([key, value]) => [key.trim(), String(value).trim()])
  );

  return {
    category,
    subcategory: data.subcategory.trim(),
    tags: [...new Set(data.tags.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 8),
    attributes,
    keywords: [...new Set(data.keywords.map((keyword) => String(keyword).trim().toLowerCase()).filter(Boolean))].slice(0, 6),
    confidence: Math.min(1, Math.max(0, confidence)),
  };
}
