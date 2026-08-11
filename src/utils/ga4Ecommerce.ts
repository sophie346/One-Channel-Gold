/** No-op GA4 stubs so Nexus Checkout can import tracking helpers. */
export const extractOrderTransactionId = (_res?: unknown) => '';
export const mapCartLinesToPurchaseItems = (_lines?: unknown[]) => [];
export const trackBeginCheckout = (..._a: unknown[]) => {};
export const trackAddShippingInfo = (..._a: unknown[]) => {};
export const trackAddPaymentInfo = (..._a: unknown[]) => {};
export const trackPurchase = (..._a: unknown[]) => {};
