import { Truck } from "lucide-react";

interface CartItem {
  sku?: string;
  title?: string;
  price: number;
  quantity: number;
  total?: number;
  original__Total?: number;
  original__Price?: number;
  images?: Array<{ url: string }>;
  tax?: number;
  shipping?: number;
  totalShipping?: number;
  extraCharges?: { [key: string]: number };
  options?: Array<{ name: string; value: string }>;
}

interface OrderSummaryProps {
  itemsCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  cart?: CartItem[];
  couponCode?: string;
  readOnlyCouponUI?: boolean;
  onCouponChange?: (code: string) => void;
  onCouponApply?: (code?: string) => void;
  paymentMethod?: string | boolean;
  affirmExtraPercentage?: number;
  /** Square payment processing fee amount (displayed when > 0) */
  squareFees?: number;
  /** Square fee percentage (e.g. 2.9 for 2.9%) - used for label when squareFees is shown */
  squareExtraPercentage?: number;
}

export default function OrderSummary({
  itemsCount,
  subtotal,
  shipping,
  tax,
  total,
  cart = [],
  couponCode = "",
  readOnlyCouponUI = false,
  onCouponChange,
  onCouponApply,
  paymentMethod,
  affirmExtraPercentage = 0,
  squareFees = 0,
  squareExtraPercentage = 0,
}: OrderSummaryProps) {
  const trimString = (str: string | undefined, length: number) => {
    if (!str) return "";
    return str.length > length ? str.substring(0, length) + "..." : str;
  };

  return (
    <div className="bg-white rounded-[16px] shadow-sm p-6 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <h3 className="text-[18px] font-bold text-black mb-4">
        Order Summary
      </h3>

      {/* Cart Items List */}
      {Array.isArray(cart) && cart.length > 0 ? (
        <div className="mb-4 pb-4 border-b border-gray-200 max-h-[400px] overflow-y-auto">
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={item.sku || index} className="flex gap-3">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <img
                    src={
                      item.images && item.images.length > 0
                        ? item.images[0].url
                        : "https://storage.googleapis.com/oneauto_maindb_image/imagecomingsoone.png"
                    }
                    alt={item.title || "Product"}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://storage.googleapis.com/oneauto_maindb_image/imagecomingsoone.png";
                    }}
                    className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-[14px] font-medium text-gray-900 mb-1">
                    {item?.title}
                  </h4>
                  {item.options && item.options.length > 0 && (
                    <ul className="text-[12px] text-gray-600 mb-1">
                      {item.options.map((option, optIndex) => (
                        <li key={optIndex}>
                          {option.name}: {option.value}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[12px] text-gray-600">
                      Qty: {item.quantity}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-900">
                      {item.total !== item.original__Total && item.original__Total && (
                        <span className="text-gray-400 line-through mr-1">
                          ${(parseFloat(String(item.original__Total)) || 0).toFixed(2)}
                        </span>
                      )}
                      ${(parseFloat(String(item.price)) || 0).toFixed(2)}
                    </span>
                  </div>
                  {/* Show tax and shipping if available */}
                  {(item.tax !== undefined || item.totalShipping !== undefined || (item.extraCharges && Object.keys(item.extraCharges).length > 0)) && (
                    <div className="flex flex-wrap gap-2 mt-1 text-[11px] text-gray-600">
                      {item.tax !== undefined && item.tax > 0 && (
                        <span>Tax: ${(item.tax || 0).toFixed(2)}</span>
                      )}
                      {item.totalShipping !== undefined && item.totalShipping > 0 && (
                        <span>Ship: ${(item.totalShipping || 0).toFixed(2)}</span>
                      )}
                      {item.extraCharges &&
                        Object.keys(item.extraCharges).length > 0 && (
                          <span>
                            Extra: $
                            {(
                              Object.values(item.extraCharges || {}).reduce(
                                (acc, val) =>
                                  acc +
                                  (typeof val === "number" && !isNaN(val) ? val : 0),
                                0
                              ) || 0
                            ).toFixed(2)}
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-[14px] text-gray-500 text-center py-4">
            No items in cart
          </p>
        </div>
      )}

      <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between text-[14px]">
          <span className="text-gray-600">
            Subtotal ({itemsCount} items)
          </span>
          <span className="text-black font-medium">
            ${subtotal.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-gray-600">Shipping</span>
          <span
            className={`font-medium ${
              shipping === 0 ? "text-green-600" : "text-black"
            }`}
          >
            {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-[14px]">
          <span className="text-gray-600">Estimated Tax</span>
          <span className="text-black font-medium">
            ${tax.toFixed(2)}
          </span>
        </div>
        {paymentMethod === "paybyaffirm" && affirmExtraPercentage > 0 && (
          <div className="flex justify-between text-[14px]">
            <span className="text-gray-600">
              Affirm Charges ({`${(affirmExtraPercentage * 100).toFixed(0)}%`} extra):
            </span>
            <span className="text-black font-medium">
              ${(subtotal * affirmExtraPercentage).toFixed(2)}
            </span>
          </div>
        )}
        {squareFees > 0 && (
          <div className="flex justify-between text-[14px]">
            <span className="text-gray-600">
              Payment processing fee{squareExtraPercentage > 0 ? ` (${squareExtraPercentage}%)` : ""}:
            </span>
            <span className="text-black font-medium">
              ${squareFees.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Coupon Code Section */}
      {onCouponChange && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (onCouponApply) {
                onCouponApply(couponCode);
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={couponCode}
              onChange={(e) => onCouponChange(e.target.value)}
              readOnly={readOnlyCouponUI}
              placeholder="Coupon Code"
              className="flex-1 h-[40px] px-3 border-2 border-gray-300 rounded-[8px] outline-none focus:border-[#f21f1f] transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                if (readOnlyCouponUI) {
                  // Remove coupon: clear the code and pass empty string directly to API
                  if (onCouponChange) {
                    onCouponChange("");
                  }
                  // Pass empty string directly to onCouponApply to avoid state update race condition
                  if (onCouponApply) {
                    onCouponApply("");
                  }
                } else {
                  // Apply coupon: pass current coupon code or undefined to use state value
                  if (onCouponApply) {
                    onCouponApply(couponCode);
                  }
                }
              }}
              className="h-[40px] px-4 bg-[#f21f1f] text-white rounded-[8px] font-medium hover:bg-[#cc0000] transition-colors"
            >
              {readOnlyCouponUI ? "Remove" : "Apply"}
            </button>
          </form>
          {readOnlyCouponUI && (
            <p className="text-green-600 text-[12px] mt-2">✓ Coupon Applied</p>
          )}
        </div>
      )}

      <div className="flex justify-between mb-4">
        <span className="font-bold text-black text-[18px]">Total</span>
        <span className="font-bold text-[#f21f1f] text-[24px]">
          ${total.toFixed(2)}
        </span>
      </div>

      {/* {shipping > 0 && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded text-[13px] text-blue-800">
          Add ${(99 - subtotal).toFixed(2)} more to qualify for FREE shipping!
        </div>
      )}

      {shipping === 0 && (
        <div className="flex items-center gap-2 bg-green-50 p-3 rounded">
          <Truck className="size-5 text-green-600" />
          <span className="text-[13px] text-green-800 font-medium">
            You qualify for FREE shipping!
          </span>
        </div>
      )} */}
    </div>
  );
}

