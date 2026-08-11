import { Check } from "lucide-react";

export default function ExpressCheckout() {
  return (
    <div className="mb-8">
      <h3 className="text-[16px] font-semibold text-black mb-4">
        Check out faster with:
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {/* PayPal */}
        <button
          type="button"
          className="h-[48px] bg-[#FFC439] hover:bg-[#F7B500] transition-colors rounded-[6px] flex items-center justify-center font-bold"
        >
          <span className="text-[#003087] text-[18px]">Pay</span>
          <span className="text-[#009CDE] text-[18px]">Pal</span>
          <span className="text-black text-[14px] ml-2">
            Checkout
          </span>
        </button>

        {/* Amazon Pay */}
        <button
          type="button"
          className="h-[48px] bg-[#FFD814] hover:bg-[#F7CA00] transition-colors rounded-[6px] flex flex-col items-center justify-center border border-[#A88734]"
        >
          <div className="flex items-center gap-1">
            <span className="text-black text-[14px]">Pay with</span>
            <span className="text-black font-bold text-[16px]">
              amazon
            </span>
          </div>
          <span className="text-black text-[10px] font-medium">
            USE YOUR AMAZON ACCOUNT
          </span>
        </button>

        {/* Google Pay */}
        <button
          type="button"
          className="h-[48px] bg-black hover:bg-gray-900 transition-colors rounded-[6px] flex items-center justify-center gap-2"
        >
          <span className="text-white text-[20px] font-medium">
            G
          </span>
          <span className="text-white text-[16px] font-medium">
            Pay
          </span>
        </button>
      </div>

      {/* Financing Note */}
      <div className="flex items-center gap-2 text-green-700 mb-6">
        <div className="w-5 h-5 border-2 border-green-700 rounded flex items-center justify-center flex-shrink-0">
          <Check className="size-4" />
        </div>
        <span className="text-[14px] font-medium">
          Financing Options Will Be Made At Payment Step!
        </span>
      </div>

      {/* OR Divider */}
      <div className="flex items-center gap-4 my-6">
        <div className="flex-1 h-[2px] bg-gray-300"></div>
        <span className="text-gray-600 font-semibold text-[14px]">
          OR
        </span>
        <div className="flex-1 h-[2px] bg-gray-300"></div>
      </div>
    </div>
  );
}

