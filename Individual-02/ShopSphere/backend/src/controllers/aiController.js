// backend/src/controllers/aiController.js
import { predictProductTaxonomy } from '../ai/productClassifier.js';
import { generateProductDescription, generateProductTags } from '../ai/productDescriptionGenerator.js';
import { getRecommendationsForUser } from '../ai/recommendationService.js';

export async function predictProduct(req, res, next) {
  try {
    const { name, description, brand, features, specifications, color, material, targetAudience } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Product Name is required for AI category and tag prediction',
        errorCode: 'MISSING_PRODUCT_NAME',
      });
    }

    const prediction = await predictProductTaxonomy({
      name,
      description,
      brand,
      features,
      specifications,
      color,
      material,
      targetAudience,
    });

    res.json({
      success: true,
      message: 'AI product taxonomy prediction generated',
      data: prediction,
    });
  } catch (err) {
    next(err);
  }
}

export async function generateDescription(req, res, next) {
  try {
    const { name, brand, category, features, keywords } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const result = await generateProductDescription({ name, brand, category, features, keywords });
    res.json({
      success: true,
      message: 'AI description generated successfully',
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function generateTags(req, res, next) {
  try {
    const { name, category, description } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }

    const tags = await generateProductTags({ name, category, description });
    res.json({
      success: true,
      message: 'AI tags generated successfully',
      data: { tags },
    });
  } catch (err) {
    next(err);
  }
}

export async function getRecommendations(req, res, next) {
  try {
    const userId = req.user ? req.user._id : null;
    const { productId } = req.query;
    const recommendations = await getRecommendationsForUser(userId, productId);

    res.json({
      success: true,
      message: 'Recommendations retrieved',
      data: { products: recommendations },
    });
  } catch (err) {
    next(err);
  }
}
