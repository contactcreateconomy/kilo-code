/**
 * Orders Domain — Barrel Export
 *
 * Re-exports the public API of the orders domain modules.
 */

// Types
export type {
  OrderStatus,
  StatusTransition,
  OrderTotals,
  OrderStatusUpdate,
  CreateOrderInput,
  CancelOrderInput,
  ShippingAddress,
  BillingAddress,
  ValidatedOrderItem,
} from "./orders.types";

// Policies
export {
  ALLOWED_TRANSITIONS,
  canCancel,
  assertCanViewOrder,
} from "./orders.policies";

// Service (business logic)
export {
  resolveUserRole,
  validateCart,
  calculateOrderTotals,
  buildOrderStatusUpdate,
  restoreInventoryForOrderItems,
} from "./orders.service";

// Repository (DB operations)
export {
  getOrderById,
  getOrderWithItems,
  getOrdersByUser,
  getOrderItemsBySeller,
  getOrderItems,
  getPaymentForOrder,
  getOrderByNumber,
  getUserCart,
  getCartItems,
  createOrderRecord,
  createOrderItems,
  updateOrderStatus,
  updateOrderItemsStatus,
  clearCart,
  getSellerItemsForOrder,
} from "./orders.repository";

// Mappers (response shaping)
export {
  toOrderResponse,
  enrichOrderItem,
  toOrderListItem,
  toSellerOrderView,
  toPaymentSummary,
} from "./orders.mappers";
