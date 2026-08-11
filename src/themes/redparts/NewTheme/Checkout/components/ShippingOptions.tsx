import { AlertTriangle } from "lucide-react";

interface ShippingRate {
  service: string;
  carrier: string;
  rate: number;
  delivery_days?: number;
  displayName: string;
  carrier_account_id: string;
}

interface TaxOrderLine {
  tax: number;
  shipping: number;
  totalShipping: number;
  rates: ShippingRate[];
}

interface ShipOption {
  [key: number]: {
    service: string;
    carrier_account_id: string;
    rate: number;
  };
}

interface ShippingOptionsProps {
  taxOrderLines: TaxOrderLine[];
  cart: any[];
  shipOption: ShipOption;
  onShipOptionChange: (option: ShipOption) => void;
  onCalculateTax: (address: any, shipOption?: ShipOption) => Promise<void>;
  shippingAddress: any;
  customRateLoading: boolean;
}

export default function ShippingOptions({
  taxOrderLines,
  cart,
  shipOption,
  onShipOptionChange,
  onCalculateTax,
  shippingAddress,
  customRateLoading,
}: ShippingOptionsProps) {
  const handleRateChange = (itemIndex: number, rate: ShippingRate) => {
    const newShipOption = {
      ...shipOption,
      [itemIndex]: {
        service: rate.service,
        carrier_account_id: rate.carrier_account_id,
        rate: rate.rate,
      },
    };
    onShipOptionChange(newShipOption);
    // Recalculate tax with new shipping option
    onCalculateTax(shippingAddress, newShipOption);
  };

  const trimString = (str: string, length: number) => {
    if (!str) return "";
    return str.length > length ? str.substring(0, length) + "..." : str;
  };

  if (customRateLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f21f1f]"></div>
      </div>
    );
  }

  if (!taxOrderLines || taxOrderLines.length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h3 className="text-[18px] font-bold text-black mb-4">
        Select Shipping Option
      </h3>
      <div className="space-y-6">
        {taxOrderLines.map((taxLine, itemIndex) => {
          const cartItem = cart[itemIndex];
          if (!cartItem) {
            return null;
          }

          const hasNoShippingRates =
            !taxLine.rates || taxLine.rates.length === 0;

          return (
            <div key={itemIndex} className="border-t border-gray-200 pt-6">
              {/* Item Info */}
              <div className="flex gap-4 mb-4">
                {cartItem?.images?.length > 0 && (
                  <img
                    src={cartItem.images[0].url}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://dublin.anglican.org/cmsfiles/placeholder.png";
                    }}
                    className="w-24 h-24 object-contain rounded-lg"
                    alt={cartItem.title || "Product"}
                  />
                )}
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-700 mb-1">
                    Item {itemIndex + 1}
                  </h5>
                  <p className="text-[14px] text-gray-600 font-medium">
                    {cartItem?.title}
                  </p>
                </div>
              </div>

              {hasNoShippingRates ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-amber-900 mb-1">
                        No shipping options available
                      </p>
                      <p className="text-[14px] text-amber-800">
                        We couldn&apos;t find a shipping method for this item to
                        your address. Remove this product from your cart to
                        continue checkout.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
              <div className="space-y-3">
                {taxLine.rates.map((rate) => {
                  const isSelected =
                    shipOption[itemIndex]?.service === rate.service;
                  return (
                    <label
                      key={rate.service}
                      className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-[#f21f1f] bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`shipping-${itemIndex}`}
                        value={rate.service}
                        checked={isSelected}
                        onChange={() => handleRateChange(itemIndex, rate)}
                        className="w-5 h-5 text-[#f21f1f] cursor-pointer"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900">
                            {rate.displayName}
                          </span>
                          <span className="text-[14px] text-gray-600">
                            {rate.carrier} {rate.service}
                          </span>
                        </div>
                        {rate.delivery_days && (
                          <span className="inline-block bg-purple-50 text-purple-700 text-[12px] px-3 py-1 rounded-full mt-1">
                            Deliver in {rate.delivery_days} days
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-gray-900">
                        ${rate.rate?.toFixed(2)}
                      </div>
                    </label>
                  );
                })}
              </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

