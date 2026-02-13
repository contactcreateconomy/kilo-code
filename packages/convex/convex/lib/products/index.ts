/**
 * Products Domain — Barrel Export
 */

export type {
  ProductWithImage,
  ProductDetail,
  ProductSearchResult,
} from "./products.types";

export {
  getProductById,
  getProductBySlug,
  getPrimaryImage,
  getProductImages,
  insertProductImage,
} from "./products.repository";

export { assertProductOwnership } from "./products.policies";

export {
  validateProductSlug,
  validateSlugUniqueness,
  validateProductPrice,
} from "./products.service";
