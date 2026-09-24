// backend/src/utils/toPlain.js

/**
 * Safely converts Mongoose Documents or internal models to plain JavaScript objects
 * to prevent shallow-spread defects ({ ...doc }) when returning API responses.
 */
export function toPlain(doc) {
  if (!doc) return doc;
  if (Array.isArray(doc)) {
    return doc.map(toPlain);
  }
  if (typeof doc.toObject === 'function') {
    return doc.toObject();
  }
  if (doc._doc) {
    return { ...doc._doc };
  }
  return doc;
}
