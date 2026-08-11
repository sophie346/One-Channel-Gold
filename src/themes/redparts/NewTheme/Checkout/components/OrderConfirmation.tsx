import { Check } from "lucide-react";

interface OrderConfirmationProps {
  orderNumber: string;
  total: number;
  email: string;
  onClose: () => void;
}

export default function OrderConfirmation({
  orderNumber,
  total,
  email,
  onClose,
}: OrderConfirmationProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-[600px] w-full bg-white rounded-[16px] shadow-xl p-8 md:p-12 text-center my-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="size-10 text-green-600" />
        </div>

        <h1 className="text-[32px] font-bold text-black mb-3">
          Order Confirmed!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="bg-gray-50 rounded-[12px] p-6 mb-6">
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <span className="text-gray-600">Order Number</span>
            <span className="font-bold text-black text-[18px]">
              {orderNumber}
            </span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
            <span className="text-gray-600">Total Amount</span>
            <span className="font-bold text-black text-[18px]">
              ${total.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Email</span>
            <span className="font-medium text-black">{email}</span>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6 text-left">
          <p className="text-[14px] text-blue-800">
            <strong>What's next?</strong> We've sent a confirmation email to{" "}
            <strong>{email}</strong> with your order details and tracking
            information.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-[52px] bg-[#f21f1f] text-white rounded-[8px] font-semibold hover:bg-[#cc0000] transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}

