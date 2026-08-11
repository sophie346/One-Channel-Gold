import { ArrowLeft, Lock } from "lucide-react";

interface CheckoutHeaderProps {
  onClose: () => void;
}

export default function CheckoutHeader({ onClose }: CheckoutHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-4">
        <div className="flex items-center justify-center">
          {/* <button
            onClick={onClose}
            className="flex items-center gap-2 text-black hover:text-[#f21f1f] transition-colors font-medium"
          >
            <ArrowLeft className="size-5" />
            <span>Back to Cart</span>
          </button> */}
          <div className="flex items-center gap-2 text-green-600">
            <Lock className="size-4" />
            <span className="text-[14px] font-medium">Secure Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
}

