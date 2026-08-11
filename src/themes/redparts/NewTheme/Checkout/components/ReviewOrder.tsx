import type { ShippingFormData } from "./ShippingForm";
import type { PaymentFormData } from "./PaymentForm";

interface ReviewOrderProps {
  shippingForm: ShippingFormData;
  paymentForm: PaymentFormData;
  onEditShipping: () => void;
  onEditPayment: () => void;
  onBack: () => void;
  onPlaceOrder: () => void;
  paymentMethod?: string | boolean;
}

export default function ReviewOrder({
  shippingForm,
  paymentForm,
  onEditShipping,
  onEditPayment,
  onBack,
  onPlaceOrder,
  paymentMethod,
}: ReviewOrderProps) {
  return (
    <div>
      <h2 className="text-[24px] font-bold text-black mb-6">
        Review Your Order
      </h2>

      {/* Shipping Details */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-black">Shipping Address</h3>
          <button
            onClick={onEditShipping}
            className="text-[#f21f1f] hover:underline font-medium text-[14px]"
          >
            Edit
          </button>
        </div>
        <p className="text-gray-700 text-[14px]">
          {shippingForm.firstName} {shippingForm.lastName}
          <br />
          {shippingForm.address} {shippingForm.apartment}
          <br />
          {shippingForm.city}, {shippingForm.state} {shippingForm.zipCode}
          <br />
          {shippingForm.phone}
          <br />
          {shippingForm.email}
        </p>
      </div>

      {/* Payment Details */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-black">Payment Method</h3>
          <button
            onClick={onEditPayment}
            className="text-[#f21f1f] hover:underline font-medium text-[14px]"
          >
            Edit
          </button>
        </div>
        <p className="text-gray-700 text-[14px]">
          {paymentMethod === "paybyaffirm" ? (
            <>Pay by Affirm</>
          ) : paymentMethod === "paybyacima" ? (
            <>Pay by Acima (Lease to Own)</>
          ) : paymentMethod === true ? (
            <>Pay by B2B Credits</>
          ) : paymentForm.cardNumber ? (
            <>
              Card ending in {paymentForm.cardNumber.slice(-4)}
              <br />
              Expires {paymentForm.expiryDate}
            </>
          ) : (
            <>Payment method not selected</>
          )}
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 h-[56px] border-2 border-gray-300 text-black rounded-[8px] font-bold text-[16px] hover:border-[#f21f1f] transition-colors"
        >
          Back
        </button>
        <button
          onClick={onPlaceOrder}
          className="flex-1 h-[56px] bg-[#f21f1f] text-white rounded-[8px] font-bold text-[16px] hover:bg-[#cc0000] transition-colors"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}

