import React, { useState, useEffect } from "react";
import {
  CreditCard as CreditCardIcon,
  Edit2,
  Lock,
  HelpCircle,
} from "lucide-react";
import {
  CreditCard,
  GooglePay,
  PaymentForm as SquarePaymentForm,
} from "react-square-web-payments-sdk";
import {
  dyanamicLabel,
  affirmExtraPercentage,
  isAffirmEnabled,
} from "@src/utils/Constants";
import { addExtraPercentAmount } from "@src/utils/commonService";
import { GetCompaniesData, userHasB2BAccess } from "@SharedLibrary/Auth/loginfunctions";
import { useAppSelector } from "@/store/hooks";
import { showToastMessage } from "@SharedLibrary/utils/Utils";
import type { ShippingFormData } from "./ShippingForm";

interface PaymentFormData {
  cardNumber: string;
  cardName: string;
  expiryDate: string;
  cvv: string;
  billingAddressSame: boolean;
}

interface PaymentFormProps {
  formData: PaymentFormData;
  onFormChange: (data: PaymentFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  paymentMethod?: string | boolean;
  onPaymentMethodChange?: (method: string | boolean) => void;
  squareApiKeys?: any;
  orderTotal?: number;
  orderShipping?: number;
  orderTotalTax?: number;
  currentPaymentGateway?: string;
  onPlaceOrder?: (token?: string) => void;
  authUser?: any;
  shippingAddress?: any;
  billingAddress?: any;
  email?: string;
  orderSubTotal?: number;
  cart?: any[];
  completeCartData?: any;
  toastRef?: any;
  onLoadAffirm?: () => void;
  onLoadAcima?: () => void;
  validateCheckoutFields?: () => string[];
  shippingForm?: ShippingFormData & {
    selectedDeliveryType?: string;
    storeAddress?: string;
  };
  selectedDeliveryType?: string;
  storeAddress?: string;
}

export default function PaymentForm({
  formData,
  onFormChange,
  onSubmit,
  onBack,
  paymentMethod = false,
  onPaymentMethodChange,
  squareApiKeys,
  orderTotal = 0,
  orderShipping = 0,
  orderTotalTax = 0,
  currentPaymentGateway,
  onPlaceOrder,
  authUser,
  shippingAddress,
  billingAddress,
  email,
  orderSubTotal = 0,
  cart = [],
  completeCartData,
  toastRef,
  onLoadAffirm,
  onLoadAcima,
  validateCheckoutFields,
  shippingForm,
  selectedDeliveryType,
  storeAddress,
}: PaymentFormProps) {
  const [b2bCreditLeft, setB2bCreditLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const isLoggedIn = useAppSelector((s) => s.auth.isLoggedIn);
  const authIsB2b = useAppSelector((s) => s.auth.isB2b);
  const authCompanies = useAppSelector((s) => s.auth.companies);
  const hasB2BAccess =
    isLoggedIn &&
    ((authIsB2b && Array.isArray(authCompanies) && authCompanies.length > 0) ||
      userHasB2BAccess());

  useEffect(() => {
    if (!hasB2BAccess && paymentMethod === true && onPaymentMethodChange) {
      onPaymentMethodChange(false);
    }
  }, [hasB2BAccess, paymentMethod, onPaymentMethodChange]);

  useEffect(() => {
    const fetchB2BCredits = () => {
      try {
        if (!hasB2BAccess) {
          setB2bCreditLeft(0);
          return;
        }

        const { b2buserdata } = GetCompaniesData();
        if (b2buserdata) {
          let creditData;
          if (Array.isArray(b2buserdata) && b2buserdata.length > 0) {
            const { selectedB2BCompany } = GetCompaniesData();
            if (selectedB2BCompany) {
              const selectedCompany = b2buserdata.find(
                (j: any) => j._id === selectedB2BCompany
              );
              creditData = selectedCompany?.b2bData;
            } else {
              creditData = b2buserdata[0]?.b2bData;
            }
          } else if (
            b2buserdata &&
            typeof b2buserdata === "object" &&
            !Array.isArray(b2buserdata)
          ) {
            creditData = b2buserdata.b2bData;
          }

          if (
            creditData?.creditLeft !== undefined &&
            creditData?.creditLeft !== null
          ) {
            const credit = parseFloat(String(creditData.creditLeft)) || 0;
            setB2bCreditLeft(credit);
          }
        }
      } catch (error) {
        console.error("Error fetching B2B credits:", error);
      }
    };

    fetchB2BCredits();
    const timeout = setTimeout(fetchB2BCredits, 500);
    return () => clearTimeout(timeout);
  }, [hasB2BAccess, authUser]);

  const handleChange = (field: keyof PaymentFormData, value: any) => {
    onFormChange({
      ...formData,
      [field]: value,
    });
  };

  const handlePaymentMethodChange = (value: string | boolean) => {
    if (onPaymentMethodChange) {
      onPaymentMethodChange(value);
    }
  };

  // Payment method options - Only show available/configured methods
  const paymentOptions = [
    // Credit card - Always available (either Square or manual entry)
    {
      label: "Credit card",
      value: false,
      description: "",
      icon: "card",
      showCardLogos: true,
      available: true,
    },
    // Google Pay - Only if Square is configured
    ...(squareApiKeys?.applicationId &&
      squareApiKeys?.locationId &&
      currentPaymentGateway === "square"
      ? [
        {
          label: "Google Pay",
          value: "googlepay",
          description: "",
          icon: "googlepay",
          available: true,
        },
      ]
      : []),
    ...(hasB2BAccess
      ? [
        {
          label: "Pay by B2B Credits",
          value: true,
          description: "",
          icon: "b2b",
          available: true,
        },
      ]
      : []),
    // Affirm - only when enabled via Constants.isAffirmEnabled and handler provided
    ...(isAffirmEnabled && onLoadAffirm
      ? [
        {
          label: "Affirm - Pay Over Time",
          value: "paybyaffirm",
          description: "",
          icon: "affirm",
          available: true,
        },
      ]
      : []),
    // Acima - Lease to Own (only if onLoadAcima handler is provided)
    ...(onLoadAcima
      ? [
        {
          label: "Acima - Lease to Own",
          value: "paybyacima",
          description: "",
          icon: "acima",
          available: true,
        },
      ]
      : []),
  ].filter((option) => option.available);

  // Handle Affirm payment
  const handleAffirmPayment = () => {
    if (!validateCheckoutFields || validateCheckoutFields().length > 0) {
      if (validateCheckoutFields && validateCheckoutFields().length > 0) {
        showToastMessage(
          toastRef,
          "error",
          "Incomplete address",
          validateCheckoutFields()[0]
        );
      }
      return;
    }

    if (onLoadAffirm) {
      onLoadAffirm();
    }
  };

  // Handle Acima payment
  const handleAcimaPayment = () => {
    if (!validateCheckoutFields || validateCheckoutFields().length > 0) {
      if (validateCheckoutFields && validateCheckoutFields().length > 0) {
        showToastMessage(
          toastRef,
          "error",
          "Incomplete address",
          validateCheckoutFields()[0]
        );
      }
      return;
    }

    if (onLoadAcima) {
      onLoadAcima();
    }
  };

  // Calculate total for Square payment (API ordertotal + shipping + tax)
  const squarePaymentTotal = () => {
    return (
      parseFloat(String(orderTotal || 0)) +
      parseFloat(String(orderShipping || 0)) +
      parseFloat(String(orderTotalTax || 0))
    ).toFixed(2);
  };

  // Handle Square payment token
  const handleSquarePayment = async (token: any, verifiedBuyer: any) => {
    if (validateCheckoutFields && validateCheckoutFields().length > 0) {
      showToastMessage(
        toastRef,
        "error",
        "",
        "Please complete all required fields before proceeding."
      );
      return;
    }

    if (onPlaceOrder) {
      await onPlaceOrder(token.token);
    }
  };

  // Handle B2B Credits payment
  const handleB2BCreditsPayment = () => {
    if (b2bCreditLeft === 0) {
      showToastMessage(toastRef, "error", "", "No credit left for purchase!");
      return;
    }

    if (validateCheckoutFields && validateCheckoutFields().length > 0) {
      showToastMessage(toastRef, "error", "", validateCheckoutFields()[0]);
      return;
    }

    if (onPlaceOrder) {
      onPlaceOrder();
    }
  };

  // Calculate total for display from API `ordertotal` (post-coupon) + shipping + tax
  const calculateTotal = () => {
    if (paymentMethod === "paybyaffirm" && affirmExtraPercentage > 0) {
      return (
        addExtraPercentAmount(orderTotal, affirmExtraPercentage) +
        parseFloat(String(orderShipping || 0)) +
        parseFloat(String(orderTotalTax || 0))
      );
    }
    return (
      parseFloat(String(orderTotal || 0)) +
      parseFloat(String(orderShipping || 0)) +
      parseFloat(String(orderTotalTax || 0))
    );
  };

  const total = calculateTotal();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[24px] font-bold text-black">
          Payment & Review
        </h2>
        <button
          type="button"
          onClick={onBack}
          className="text-[#f21f1f] hover:underline font-medium text-[14px] flex items-center gap-2"
        >
          <Edit2 className="size-4" />
          Edit Shipping
        </button>
      </div>

      {/* Order Review Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-[8px] p-4 mb-6">
        <h3 className="text-[18px] font-bold text-black mb-4">
          Order Summary
        </h3>

        {/* Shipping Address Review */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[14px] font-semibold text-gray-700">
              Shipping Address
            </h4>
            <button
              type="button"
              onClick={onBack}
              className="text-[#f21f1f] hover:underline text-[12px] font-medium"
            >
              Edit
            </button>
          </div>
          {(shippingAddress && Object.keys(shippingAddress).length > 0) ||
            (shippingForm && (shippingForm.firstName || shippingForm.address)) ? (
            <div className="text-[13px] text-gray-600">
              {(shippingAddress?.fullname ||
                (shippingForm?.firstName && shippingForm?.lastName
                  ? `${shippingForm.firstName} ${shippingForm.lastName}`
                  : "")) && (
                  <p className="mb-1">
                    {shippingAddress?.fullname ||
                      (shippingForm?.firstName && shippingForm?.lastName
                        ? `${shippingForm.firstName} ${shippingForm.lastName}`
                        : "")}
                  </p>
                )}
              {(shippingAddress?.line1 ||
                shippingAddress?.address1 ||
                shippingForm?.address) && (
                  <p className="mb-1">
                    {shippingAddress?.line1 ||
                      shippingAddress?.address1 ||
                      shippingForm?.address ||
                      ""}
                    {shippingAddress?.line2 ||
                      shippingAddress?.address2 ||
                      shippingForm?.apartment
                      ? `, ${shippingAddress?.line2 ||
                      shippingAddress?.address2 ||
                      shippingForm?.apartment ||
                      ""
                      }`
                      : ""}
                  </p>
                )}
              {(shippingAddress?.city ||
                shippingForm?.city ||
                shippingAddress?.region ||
                shippingForm?.state ||
                shippingAddress?.postalCode ||
                shippingForm?.zipCode) && (
                  <p className="mb-1">
                    {shippingAddress?.city || shippingForm?.city || ""}
                    {(shippingAddress?.city || shippingForm?.city) &&
                      (shippingAddress?.region || shippingForm?.state)
                      ? ", "
                      : ""}
                    {shippingAddress?.region || shippingForm?.state || ""}{" "}
                    {shippingAddress?.postalCode || shippingForm?.zipCode || ""}
                  </p>
                )}
              {(shippingAddress?.phone || shippingForm?.phone) && (
                <p className="mb-1">
                  {shippingAddress?.phone || shippingForm?.phone || ""}
                </p>
              )}
              {(email || shippingForm?.email || shippingAddress?.email) && (
                <p className="mb-0">
                  {email || shippingForm?.email || shippingAddress?.email || ""}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[13px] text-gray-500 italic">
              No shipping address provided
            </p>
          )}
        </div>

        {/* Delivery Method - Always show */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <h4 className="text-[14px] font-semibold text-gray-700 mb-2">
            Delivery Method
          </h4>
          <p className="text-[13px] text-gray-600">
            {(() => {
              // Use selectedDeliveryType prop first (from checkout.tsx state)
              // This is the source of truth for the delivery type
              const deliveryType =
                selectedDeliveryType ||
                shippingForm?.selectedDeliveryType ||
                "shipping";
              if (deliveryType === "storepickup") {
                return `Store Pickup - ${storeAddress ||
                  shippingForm?.storeAddress ||
                  "12954 Beaumont Hwy, Houston, TX 77049"
                  }`;
              }
              return "Standard Shipping";
            })()}
          </p>
        </div>

        {/* Billing Address Review */}
        <div className="mb-4 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[14px] font-semibold text-gray-700">
              Billing Address
            </h4>
            <button
              type="button"
              onClick={onBack}
              className="text-[#f21f1f] hover:underline text-[12px] font-medium"
            >
              Edit
            </button>
          </div>
          {(() => {
            // Check if billing address same as shipping
            if (shippingForm?.billingAddressSame) {
              return (
                <p className="text-[13px] text-gray-600 italic">
                  Same as shipping address
                </p>
              );
            }

            // Check if billing address exists and has meaningful data
            const hasBillingAddress =
              billingAddress &&
              (billingAddress.fullname ||
                billingAddress.line1 ||
                billingAddress.address1 ||
                billingAddress.city ||
                billingAddress.region ||
                billingAddress.postalCode);

            if (hasBillingAddress) {
              return (
                <div className="text-[13px] text-gray-600">
                  {billingAddress?.fullname && (
                    <p className="mb-1">{billingAddress.fullname}</p>
                  )}
                  {(billingAddress?.line1 || billingAddress?.address1) && (
                    <p className="mb-1">
                      {billingAddress?.line1 || billingAddress?.address1 || ""}
                      {billingAddress?.line2 || billingAddress?.address2
                        ? `, ${billingAddress?.line2 ||
                        billingAddress?.address2 ||
                        ""
                        }`
                        : ""}
                    </p>
                  )}
                  {(billingAddress?.city ||
                    billingAddress?.region ||
                    billingAddress?.postalCode) && (
                      <p className="mb-1">
                        {billingAddress?.city || ""}
                        {billingAddress?.city && billingAddress?.region
                          ? ", "
                          : ""}
                        {billingAddress?.region || ""}{" "}
                        {billingAddress?.postalCode || ""}
                      </p>
                    )}
                  {billingAddress?.phone && (
                    <p className="mb-1">{billingAddress.phone}</p>
                  )}
                </div>
              );
            }

            return (
              <p className="text-[13px] text-gray-500 italic">
                No billing address provided
              </p>
            );
          })()}
        </div>

        {/* Order Totals */}
        <div className="space-y-2">
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">
              ${orderSubTotal?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-600">Shipping:</span>
            <span className="font-medium">
              ${orderShipping?.toFixed(2) || "0.00"}
            </span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-gray-600">Tax:</span>
            <span className="font-medium">
              ${orderTotalTax?.toFixed(2) || "0.00"}
            </span>
          </div>
          {paymentMethod === "paybyaffirm" && affirmExtraPercentage > 0 && (
            <div className="flex justify-between text-[13px]">
              <span className="text-gray-600">
                Affirm Charges ({affirmExtraPercentage * 100}% extra):
              </span>
              <span className="font-medium">
                ${((orderSubTotal || 0) * affirmExtraPercentage).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-[16px] font-bold pt-2 border-t border-gray-300">
            <span>Total:</span>
            <span className="text-[#f21f1f]">${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="space-y-4">
        <div>
          <h3 className="text-[24px] font-bold text-black mb-2">
            Payment
          </h3>
          <p className="text-[14px] text-gray-600 mb-6">
            All transactions are secure and encrypted.
          </p>

          {/* Payment Options List */}
          <div className="space-y-3">
            {paymentOptions.map((option) => {
              const isSelected =
                (paymentMethod === true && option.value === true) ||
                (paymentMethod === "paybyaffirm" &&
                  option.value === "paybyaffirm") ||
                (paymentMethod === "paybyacima" &&
                  option.value === "paybyacima") ||
                (paymentMethod === "googlepay" &&
                  option.value === "googlepay") ||
                paymentMethod === option.value ||
                ((paymentMethod === false || !paymentMethod) &&
                  option.value === false);

              return (
                <div
                  key={String(option.value)}
                  className={`border-2 rounded-[8px] transition-all duration-200 ${isSelected
                      ? "border-blue-500 bg-blue-50/30"
                      : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                >
                  <label className="flex items-center cursor-pointer p-4">
                    {/* Radio Button */}
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={isSelected}
                      onChange={() => {
                        if (option.value === true) {
                          handlePaymentMethodChange(true);
                        } else if (option.value === "paybyaffirm") {
                          handlePaymentMethodChange("paybyaffirm");
                        } else if (option.value === "paybyacima") {
                          handlePaymentMethodChange("paybyacima");
                        } else if (option.value === "googlepay") {
                          handlePaymentMethodChange("googlepay");
                        } else {
                          handlePaymentMethodChange(false);
                        }
                      }}
                      className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                    />

                    <div className="flex-1 ml-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[16px] font-medium text-black">
                            {option.label}
                          </span>
                          {option.description && (
                            <span className="text-[14px] text-gray-600 ml-2">
                              • {option.description}
                            </span>
                          )}
                        </div>

                        {/* Payment Method Logos/Icons */}
                        <div className="flex items-center gap-2">
                          {option.showCardLogos && isSelected && (
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                VISA
                              </span>
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded">
                                MC
                              </span>
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                                AMEX
                              </span>
                              <span className="text-[10px] text-gray-600">
                                +4
                              </span>
                            </div>
                          )}
                          {option.icon === "affirm" && (
                            <span className="text-[12px] font-semibold text-purple-600">
                              affirm
                            </span>
                          )}
                          {option.icon === "acima" && (
                            <span className="text-[12px] font-semibold text-teal-600">
                              Acima
                            </span>
                          )}
                          {option.icon === "googlepay" && (
                            <img
                              alt="svgImg"
                              style={{ height: "25px", width: "25px" }}
                              src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciICB2aWV3Qm94PSIwIDAgNDggNDgiIHdpZHRoPSI1MHB4IiBoZWlnaHQ9IjUwcHgiIGJhc2VQcm9maWxlPSJiYXNpYyI+PHBhdGggZmlsbD0iI2U2NGExOSIgZD0iTTQyLjg1OCwxMS45NzVjLTQuNTQ2LTIuNjI0LTEwLjM1OS0xLjA2NS0xMi45ODUsMy40ODFMMjMuMjUsMjYuOTI3CWMtMS45MTYsMy4zMTIsMC41NTEsNC40NywzLjMwMSw2LjExOWw2LjM3MiwzLjY3OGMyLjE1OCwxLjI0NSw0LjkxNCwwLjUwNiw2LjE1OC0xLjY0OWw2LjgwNy0xMS43ODkJQzQ4LjE3NiwxOS4zMjUsNDYuODE5LDE0LjI2Miw0Mi44NTgsMTEuOTc1eiIvPjxwYXRoIGZpbGw9IiNmYmMwMmQiIGQ9Ik0zNS4zNjUsMTYuNzIzbC02LjM3Mi0zLjY3OGMtMy41MTctMS45NTMtNS41MDktMi4wODItNi45NTQsMC4yMTRsLTkuMzk4LDE2LjI3NQljLTIuNjI0LDQuNTQzLTEuMDYyLDEwLjM1MywzLjQ4MSwxMi45NzFjMy45NjEsMi4yODcsOS4wMjQsMC45MywxMS4zMTEtMy4wMzFsOS41NzgtMTYuNTkJQzM4LjI2MSwyMC43MjcsMzcuNTIzLDE3Ljk2OCwzNS4zNjUsMTYuNzIzeiIvPjxwYXRoIGZpbGw9IiM0M2EwNDciIGQ9Ik0zNi41OTEsOC4zNTZsLTQuNDc2LTIuNTg1Yy00Ljk1LTIuODU3LTExLjI4LTEuMTYzLTE0LjEzNywzLjc4N0w5LjQ1NywyNC4zMTcJYy0xLjI1OSwyLjE3Ny0wLjUxMSw0Ljk2NCwxLjY2Niw2LjIybDUuMDEyLDIuODk0YzIuNDc1LDEuNDMsNS42MzksMC41ODIsNy4wNjktMS44OTRsOS43MzUtMTYuODYJYzIuMDE3LTMuNDkyLDYuNDgxLTQuNjg5LDkuOTc0LTIuNjcyTDM2LjU5MSw4LjM1NnoiLz48cGF0aCBmaWxsPSIjMWU4OGU1IiBkPSJNMTkuMTg5LDEzLjc4MWwtNC44MzgtMi43ODdjLTIuMTU4LTEuMjQyLTQuOTE0LTAuNTA2LTYuMTU4LDEuNjQ2bC01LjgwNCwxMC4wMwljLTIuODU3LDQuOTM2LTEuMTYzLDExLjI1MiwzLjc4NywxNC4xMDFsMy42ODMsMi4xMjFsNC40NjcsMi41NzNsMS45MzksMS4xMTVjLTMuNDQyLTIuMzA0LTQuNTM1LTYuOTItMi40My0xMC41NTVsMS41MDMtMi41OTYJbDUuNTA0LTkuNTFDMjIuMDgzLDE3Ljc3NCwyMS4zNDQsMTUuMDIzLDE5LjE4OSwxMy43ODF6Ii8+PC9zdmc+"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </label>

                  {/* Google Pay Payment - Show when Google Pay is selected */}
                  {isSelected &&
                    option.value === "googlepay" &&
                    squareApiKeys?.applicationId &&
                    squareApiKeys?.locationId &&
                    currentPaymentGateway === "square" && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="space-y-4">
                          <div className="onechanneladmin-square-form">
                            <SquarePaymentForm
                              applicationId={squareApiKeys.applicationId}
                              cardTokenizeResponseReceived={handleSquarePayment}
                              createPaymentRequest={() => ({
                                countryCode: "US",
                                currencyCode: "USD",
                                total: {
                                  amount: String(
                                    Math.round(
                                      parseFloat(squarePaymentTotal()) * 100
                                    )
                                  ),
                                  label: "Total",
                                },
                              })}
                              createVerificationDetails={() => {
                                const address =
                                  shippingAddress?.line1 ||
                                  shippingForm?.address ||
                                  "";
                                const city =
                                  shippingAddress?.city ||
                                  shippingForm?.city ||
                                  "";
                                const region =
                                  shippingAddress?.region ||
                                  shippingForm?.state ||
                                  "";
                                const postalCode =
                                  shippingAddress?.postalCode ||
                                  shippingForm?.zipCode ||
                                  "";
                                const fullname =
                                  shippingAddress?.fullname ||
                                  (shippingForm?.firstName &&
                                    shippingForm?.lastName
                                    ? `${shippingForm.firstName} ${shippingForm.lastName}`
                                    : "");

                                return {
                                  amount: String(
                                    Math.round(
                                      parseFloat(squarePaymentTotal()) * 100
                                    )
                                  ),
                                  billingContact: {
                                    addressLines: address ? [address] : [],
                                    familyName: fullname
                                      ? fullname.split(" ").slice(-1)[0]
                                      : "",
                                    givenName: fullname
                                      ? fullname
                                        .split(" ")
                                        .slice(0, -1)
                                        .join(" ") || fullname
                                      : "",
                                    countryCode: "US",
                                    city: city || "",
                                    region: region || "",
                                    postalCode: postalCode || "",
                                  },
                                  currencyCode: "USD",
                                  intent: "CHARGE",
                                };
                              }}
                              locationId={squareApiKeys.locationId}
                            >
                              <GooglePay />
                            </SquarePaymentForm>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Card Input Fields - Show when Credit Card is selected */}
                  {isSelected && option.value === false && (
                    <div className="px-4 pb-4 pt-0 space-y-4">
                      {/* Square Payment Form - Show if Square is configured */}
                      {squareApiKeys?.applicationId &&
                        squareApiKeys?.locationId &&
                        currentPaymentGateway === "square" ? (
                        <div className="space-y-4">
                          <div className="onechanneladmin-square-form">
                            <SquarePaymentForm
                              applicationId={squareApiKeys.applicationId}
                              cardTokenizeResponseReceived={handleSquarePayment}
                              createPaymentRequest={() => ({
                                countryCode: "US",
                                currencyCode: "USD",
                                total: {
                                  amount: String(
                                    Math.round(
                                      parseFloat(squarePaymentTotal()) * 100
                                    )
                                  ),
                                  label: "Total",
                                },
                              })}
                              createVerificationDetails={() => {
                                const address =
                                  shippingAddress?.line1 ||
                                  shippingForm?.address ||
                                  "";
                                const city =
                                  shippingAddress?.city ||
                                  shippingForm?.city ||
                                  "";
                                const region =
                                  shippingAddress?.region ||
                                  shippingForm?.state ||
                                  "";
                                const postalCode =
                                  shippingAddress?.postalCode ||
                                  shippingForm?.zipCode ||
                                  "";
                                const fullname =
                                  shippingAddress?.fullname ||
                                  (shippingForm?.firstName &&
                                    shippingForm?.lastName
                                    ? `${shippingForm.firstName} ${shippingForm.lastName}`
                                    : "");

                                return {
                                  amount: String(
                                    Math.round(
                                      parseFloat(squarePaymentTotal()) * 100
                                    )
                                  ),
                                  billingContact: {
                                    addressLines: address ? [address] : [],
                                    familyName: fullname
                                      ? fullname.split(" ").slice(-1)[0]
                                      : "",
                                    givenName: fullname
                                      ? fullname
                                        .split(" ")
                                        .slice(0, -1)
                                        .join(" ") || fullname
                                      : "",
                                    countryCode: "US",
                                    city: city || "",
                                    region: region || "",
                                    postalCode: postalCode || "",
                                  },
                                  currencyCode: "USD",
                                  intent: "CHARGE",
                                };
                              }}
                              locationId={squareApiKeys.locationId}
                            >
                              <CreditCard
                                buttonProps={{
                                  css: {
                                    backgroundColor: "#f21f1f",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#fff",
                                    padding: "14px 24px",
                                    borderRadius: "8px",
                                    border: "none",
                                    width: "100%",
                                    cursor: "pointer",
                                    "&:hover": {
                                      backgroundColor: "#cc0000",
                                    },
                                  },
                                }}
                              />
                            </SquarePaymentForm>
                          </div>
                        </div>
                      ) : (
                        /* Manual Card Input Fields - Fallback when Square is not available */
                        <>
                          {/* Card Number */}
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                              Card number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Card number"
                                value={formData.cardNumber}
                                onChange={(e) =>
                                  handleChange("cardNumber", e.target.value)
                                }
                                className="w-full h-[44px] px-3 pr-10 border-2 border-gray-300 rounded-[8px] outline-none focus:border-[#f21f1f] transition-colors bg-gray-50"
                              />
                              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            </div>
                          </div>

                          {/* Expiration and Security Code */}
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                                Expiration date (MM / YY)
                              </label>
                              <input
                                type="text"
                                placeholder="MM / YY"
                                value={formData.expiryDate}
                                onChange={(e) =>
                                  handleChange("expiryDate", e.target.value)
                                }
                                className="w-full h-[44px] px-3 border-2 border-gray-300 rounded-[8px] outline-none focus:border-[#f21f1f] transition-colors bg-gray-50"
                              />
                            </div>
                            <div>
                              <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                                Security code
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Security code"
                                  value={formData.cvv}
                                  onChange={(e) =>
                                    handleChange("cvv", e.target.value)
                                  }
                                  className="w-full h-[44px] px-3 pr-10 border-2 border-gray-300 rounded-[8px] outline-none focus:border-[#f21f1f] transition-colors bg-gray-50"
                                />
                                <HelpCircle className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                              </div>
                            </div>
                          </div>

                          {/* Name on Card */}
                          <div>
                            <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                              Name on card
                            </label>
                            <input
                              type="text"
                              placeholder="Name on card"
                              value={formData.cardName}
                              onChange={(e) =>
                                handleChange("cardName", e.target.value)
                              }
                              className="w-full h-[44px] px-3 border-2 border-gray-300 rounded-[8px] outline-none focus:border-[#f21f1f] transition-colors bg-gray-50"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* B2B Credits Info */}
        {paymentMethod === true && hasB2BAccess && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-[14px] text-blue-800">
              Payment should be settled as per the terms agreed by company and
              you! You have got <b>${b2bCreditLeft?.toFixed(2) || 0} credit</b>{" "}
              left to purchase.
            </p>
            {b2bCreditLeft === 0 && (
              <p className="text-[14px] font-bold text-red-600 mt-2">
                No credit left for purchase!
              </p>
            )}
          </div>
        )}

        {/* Affirm Payment */}
        {paymentMethod === "paybyaffirm" && (
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-[8px] p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[18px] font-bold text-purple-600">
                  Affirm
                </span>
                <h3 className="text-[16px] font-bold text-black">
                  Pay with Affirm
                </h3>
              </div>
              {affirmExtraPercentage > 0 && (
                <p className="text-[13px] text-gray-600 mb-4">
                  An extra {affirmExtraPercentage * 100}% charge will be added
                  to your order total when using Affirm.
                </p>
              )}
              <button
                type="button"
                onClick={handleAffirmPayment}
                className="w-full h-[56px] bg-purple-600 text-white rounded-[8px] font-bold text-[16px] hover:bg-purple-700 transition-colors"
              >
                Confirm & Pay by Affirm
              </button>
            </div>
          </div>
        )}

        {/* Acima Payment */}
        {paymentMethod === "paybyacima" && (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-[8px] p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[18px] font-bold text-teal-600">
                  Acima
                </span>
                <h3 className="text-[16px] font-bold text-black">
                  Lease to Own with Acima
                </h3>
              </div>
              <p className="text-[13px] text-gray-600 mb-4">
                Pay over time with Acima. Get approved in seconds and complete
                your purchase with flexible lease-to-own options.
              </p>
              <button
                type="button"
                onClick={handleAcimaPayment}
                className="w-full h-[56px] bg-teal-600 text-white rounded-[8px] font-bold text-[16px] hover:bg-teal-700 transition-colors"
              >
                Confirm & Pay with Acima
              </button>
            </div>
          </div>
        )}

        {/* B2B Credits Payment */}
        {paymentMethod === true && hasB2BAccess && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCardIcon className="size-5 text-blue-600" />
                <h3 className="text-[16px] font-bold text-black">
                  Pay with B2B Credits
                </h3>
              </div>
              <button
                type="button"
                onClick={handleB2BCreditsPayment}
                disabled={b2bCreditLeft === 0}
                className={`w-full h-[56px] rounded-[8px] font-bold text-[16px] transition-colors ${b2bCreditLeft === 0
                    ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {b2bCreditLeft === 0
                  ? "No Credit Available"
                  : "Place your Order"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 h-[56px] border-2 border-gray-300 text-black rounded-[8px] font-bold text-[16px] hover:border-[#f21f1f] transition-colors"
        >
          Back
        </button>
        {/* Show Place Order button for non-Square card payments (Square handles its own button) */}
        {(paymentMethod === false || !paymentMethod) &&
          (!squareApiKeys?.applicationId ||
            currentPaymentGateway !== "square") && (
            <button
              type="submit"
              onClick={async (e) => {
                e.preventDefault();
                if (
                  validateCheckoutFields &&
                  validateCheckoutFields().length > 0
                ) {
                  showToastMessage(
                    toastRef,
                    "error",
                    "",
                    validateCheckoutFields()[0]
                  );
                  return;
                }
                if (onPlaceOrder) {
                  await onPlaceOrder();
                }
              }}
              className="flex-1 h-[56px] bg-[#f21f1f] text-white rounded-[8px] font-bold text-[16px] hover:bg-[#cc0000] transition-colors"
            >
              Place Order
            </button>
          )}
      </div>
    </div>
  );
}

export type { PaymentFormData };
