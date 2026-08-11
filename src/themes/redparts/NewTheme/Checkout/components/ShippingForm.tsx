import React, { useEffect, useRef, useState } from "react";
import type { DeliveryType } from "../Checkout";
import ShippingOptions from "./ShippingOptions";
import { stateOptions } from "@src/utils/Constants";
import Locations from "@src/themes/default/CheckOut/Locations";

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  billingAddressSame: boolean;
  orderComments: string;
}

interface TaxOrderLine {
  tax: number;
  shipping: number;
  totalShipping: number;
  rates: Array<{
    service: string;
    carrier: string;
    rate: number;
    delivery_days?: number;
    displayName: string;
    carrier_account_id: string;
  }>;
}

interface ShipOption {
  [key: number]: {
    service: string;
    carrier_account_id: string;
    rate: number;
  };
}

interface ShippingFormProps {
  formData: ShippingFormData;
  onFormChange: (data: ShippingFormData) => void;
  onSubmit: (e: React.FormEvent, billingAddressData?: any) => void;
  selectedDeliveryType: DeliveryType;
  onDeliveryTypeChange: (type: DeliveryType) => void;
  hasDropshippingOnlyItem: boolean;
  storeAddress: string;
  showShippingOptions?: boolean;
  taxOrderLines: TaxOrderLine[];
  cart: any[];
  shipOption: ShipOption;
  onShipOptionChange: (option: ShipOption) => void;
  onCalculateTax: (address: any, shipOption?: ShipOption) => Promise<void>;
  shippingAddress: any;
  customRateLoading: boolean;
  billingAddress?: any;
  onBillingAddressChange?: (address: any) => void;
  authUser?: any;
  showSavedAddresses?: boolean;
  onToggleSavedAddresses?: () => void;
  onShipOptionReset?: () => void;
}

interface BillingFormData {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
}

export default function ShippingForm({
  formData,
  onFormChange,
  onSubmit,
  selectedDeliveryType,
  onDeliveryTypeChange,
  hasDropshippingOnlyItem,
  storeAddress,
  showShippingOptions = false,
  taxOrderLines,
  cart,
  shipOption,
  onShipOptionChange,
  onCalculateTax,
  shippingAddress,
  customRateLoading,
  billingAddress,
  onBillingAddressChange,
  authUser,
  showSavedAddresses = true,
  onToggleSavedAddresses,
  onShipOptionReset,
}: ShippingFormProps) {
  // Initialize billing form state - will be synced via useEffect
  const [billingForm, setBillingForm] = useState<BillingFormData>({
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const prevZipCodeRef = useRef<string>("");
  const zipCodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [internalShowSavedAddresses, setInternalShowSavedAddresses] = useState(showSavedAddresses);

  // Track previous selected address to detect changes
  const prevSelectedAddressRef = useRef<string>("");

  // Handle address selection from Locations component
  const handleSelectDeliveryAddress = (address: any) => {
    if (!address) return;

    // Create a unique identifier for this address to detect changes
    const addressKey = `${address.line1}-${address.city}-${address.region}-${address.postalCode}`;
    
    // Check if this is a different address than previously selected
    const isAddressChanged = prevSelectedAddressRef.current !== addressKey;
    
    // Update the ref to track current selection
    prevSelectedAddressRef.current = addressKey;

    // Parse fullname into first and last name
    const fullnameParts = (address.fullname || "").split(" ").filter(Boolean);
    const firstName = fullnameParts[0] || "";
    const lastName = fullnameParts.slice(1).join(" ") || "";

    // Update shipping address for tax calculation
    const addressData = {
      uid: address.uid || "",
      fullname: address.fullname || "",
      phone: address.phone || "",
      line1: address.line1 || "",
      line2: address.line2 || "",
      city: address.city || "",
      postalCode: address.postalCode || "",
      region: address.region || "",
      country: address.country || "USA",
      isDefault: false,
    };

    // Populate form with selected address - ensure all fields are updated
    const updatedForm: ShippingFormData = {
      ...formData,
      firstName: firstName,
      lastName: lastName,
      phone: address.phone || "",
      address: address.line1 || "",
      apartment: address.line2 || "",
      city: address.city || "",
      state: address.region || "",
      zipCode: address.postalCode || "",
    };
    
    // Update form state immediately
    onFormChange(updatedForm);
    
    // Update prevZipCodeRef - but only if zipcode actually changed
    // This allows recalculation when address changes
    const zipCodeChanged = address.postalCode && address.postalCode !== prevZipCodeRef.current;
    if (address.postalCode) {
      prevZipCodeRef.current = address.postalCode;
    }

    // Clear any pending zipcode timeout to prevent conflicts
    if (zipCodeTimeoutRef.current) {
      clearTimeout(zipCodeTimeoutRef.current);
      zipCodeTimeoutRef.current = null;
    }

    // Always trigger tax calculation when address is selected or changed
    // This ensures shipping options are recalculated for the new address
    if (addressData.postalCode && addressData.city && addressData.region && addressData.line1) {
      // If address changed, reset shipping options so they need to be reselected
      if (isAddressChanged && onShipOptionReset) {
        onShipOptionReset();
      }
      
      // Call calculateTax directly - it will update shippingAddress in parent
      // This will recalculate shipping options for the new/changed address
      onCalculateTax(addressData);
    }

    // Don't hide saved addresses section - keep it visible so user can change selection
    // Don't trigger any form submission or navigation
  };

  // Handle unsetshippingAddress (required by Locations component)
  const handleUnsetShippingAddress = () => {
    // This is called by Locations component, but we don't need to do anything
    // as we're managing the address selection ourselves
  };

  const handleChange = (field: keyof ShippingFormData, value: any) => {
    const updatedForm = {
      ...formData,
      [field]: value,
    };
    onFormChange(updatedForm);
    
    // If billing address same checkbox is changed, update billing address accordingly
    if (field === "billingAddressSame") {
      if (value && onBillingAddressChange && shippingAddress) {
        // If checked, set billing address same as shipping
        onBillingAddressChange(shippingAddress);
      } else if (!value && onBillingAddressChange) {
        // If unchecked, initialize with empty or current billing address
        onBillingAddressChange(billingAddress || {});
      }
    }
  };

  const handleBillingFormChange = (field: keyof BillingFormData, value: string) => {
    const updatedBillingForm = {
      ...billingForm,
      [field]: value,
    };
    setBillingForm(updatedBillingForm);
    
    // Update billing address in parent component immediately as user types
    // This ensures billingAddress state is always in sync, even when navigating back
    if (onBillingAddressChange) {
      const firstName = updatedBillingForm.firstName.trim();
      const lastName = updatedBillingForm.lastName.trim();
      const fullname = firstName || lastName ? `${firstName} ${lastName}`.trim() : "";
      
      const billingAddressData = {
        uid: "",
        fullname: fullname,
        phone: formData.phone || "",
        line1: updatedBillingForm.address.trim() || "",
        line2: updatedBillingForm.apartment.trim() || "",
        city: updatedBillingForm.city.trim() || "",
        postalCode: updatedBillingForm.zipCode.trim() || "",
        region: updatedBillingForm.state || "",
        country: "USA",
        isDefault: false,
      };
      onBillingAddressChange(billingAddressData);
    }
  };

  // Initialize billing form when billingAddress prop changes or when checkbox state changes
  // This ensures the form is populated when navigating back from Payment step
  useEffect(() => {
    // If billing address same is checked, clear the form (form is hidden)
    if (formData.billingAddressSame) {
      // Only clear if form has data to avoid unnecessary updates
      setBillingForm(prevForm => {
        if (prevForm.firstName || prevForm.lastName || prevForm.address || 
            prevForm.city || prevForm.state || prevForm.zipCode) {
          return {
            firstName: "",
            lastName: "",
            address: "",
            apartment: "",
            city: "",
            state: "",
            zipCode: "",
          };
        }
        return prevForm;
      });
      return;
    }
    
    // If billing address same is unchecked, populate the form from billingAddress
    // This handles both initial load and navigation back from Payment step
    if (billingAddress && typeof billingAddress === 'object' && Object.keys(billingAddress).length > 0) {
      // Check if billingAddress has meaningful data (not just empty object)
      const hasData = billingAddress.fullname || 
                     billingAddress.line1 || billingAddress.address1 ||
                     billingAddress.city || 
                     billingAddress.region || 
                     billingAddress.postalCode;
      
      if (hasData) {
        const fullnameParts = (billingAddress.fullname || "").split(" ").filter(Boolean);
        const firstName = fullnameParts[0] || "";
        const lastName = fullnameParts.slice(1).join(" ") || "";
        
        const newBillingForm = {
          firstName: firstName,
          lastName: lastName,
          address: (billingAddress?.line1 || billingAddress?.address1 || "").trim(),
          apartment: (billingAddress?.line2 || billingAddress?.address2 || "").trim(),
          city: (billingAddress?.city || "").trim(),
          state: (billingAddress?.region || "").trim(),
          zipCode: (billingAddress?.postalCode || "").trim(),
        };
        
        // Always update the form when billingAddress has data
        // This ensures form is populated when navigating back from Payment step
        // Compare with current form to avoid unnecessary updates
        setBillingForm(prevForm => {
          if (prevForm.firstName !== newBillingForm.firstName || 
              prevForm.lastName !== newBillingForm.lastName ||
              prevForm.address !== newBillingForm.address ||
              prevForm.apartment !== newBillingForm.apartment ||
              prevForm.city !== newBillingForm.city ||
              prevForm.state !== newBillingForm.state ||
              prevForm.zipCode !== newBillingForm.zipCode) {
            return newBillingForm;
          }
          return prevForm;
        });
      }
    }
  }, [billingAddress, formData.billingAddressSame]);

  // Handle zipcode/address change and trigger tax calculation
  useEffect(() => {
    // Only calculate tax if all required fields are present and valid
    // Check if zipcode changed (main trigger) or if delivery type is shipping and we have all fields
    const zipCodeChanged = formData.zipCode && formData.zipCode.length === 5 && formData.zipCode !== prevZipCodeRef.current;
    
    if (
      zipCodeChanged &&
      formData.city &&
      formData.state &&
      formData.address &&
      selectedDeliveryType === "shipping"
    ) {
      prevZipCodeRef.current = formData.zipCode;

      // Clear any existing timeout
      if (zipCodeTimeoutRef.current) {
        clearTimeout(zipCodeTimeoutRef.current);
      }

      // Debounce the API call by 500ms after user stops typing
      zipCodeTimeoutRef.current = setTimeout(() => {
        const addressData = {
          uid: "",
          fullname: `${formData.firstName} ${formData.lastName}`,
          phone: formData.phone,
          line1: formData.address,
          line2: formData.apartment,
          city: formData.city,
          postalCode: formData.zipCode,
          region: formData.state,
          country: "USA",
          isDefault: false,
        };

        onCalculateTax(addressData);
      }, 500);
    }

    // Cleanup timeout on unmount or when dependencies change
    return () => {
      if (zipCodeTimeoutRef.current) {
        clearTimeout(zipCodeTimeoutRef.current);
      }
    };
    // Note: onCalculateTax is stable from parent, so we can safely exclude it from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.zipCode, formData.city, formData.state, formData.address, selectedDeliveryType]);

  // Check if all shipping options are selected (only for shipping delivery type)
  const isShippingOptionsValid = () => {
    if (selectedDeliveryType !== "shipping") {
      return true; // Store pickup doesn't need shipping options
    }

    if (!showShippingOptions || taxOrderLines.length === 0) {
      return false; // Options haven't loaded yet
    }

    // Check if all cart items have shipping options selected
    const cartItemsCount = cart.length;
    if (cartItemsCount === 0) return false;

    for (let i = 0; i < cartItemsCount; i++) {
      const rates = taxOrderLines[i]?.rates;
      if (!rates || rates.length === 0) {
        return false;
      }
      if (!shipOption[i] || !shipOption[i].service) {
        return false;
      }
    }

    return true;
  };

  const canProceed = isShippingOptionsValid();
  const isButtonDisabled = selectedDeliveryType === "shipping" && (!canProceed || customRateLoading);

  // Handle form submit - ensure billing address is saved before submitting
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let billingAddressDataToPass: any = null;
    
    // If billing address is not same as shipping, ensure it's saved from form state
    if (!formData.billingAddressSame) {
      const firstName = billingForm.firstName.trim();
      const lastName = billingForm.lastName.trim();
      const fullname = firstName || lastName ? `${firstName} ${lastName}`.trim() : "";
      
      // Always build billing address from current form state
      // This ensures we capture all entered data, even if some fields are empty
      billingAddressDataToPass = {
        uid: "",
        fullname: fullname,
        phone: formData.phone || "",
        line1: billingForm.address.trim() || "",
        line2: billingForm.apartment.trim() || "",
        city: billingForm.city.trim() || "",
        postalCode: billingForm.zipCode.trim() || "",
        region: billingForm.state || "",
        country: "USA",
        isDefault: false,
      };
      
      // Update billing address in parent immediately
      // This ensures billingAddress state is set before navigation
      if (onBillingAddressChange) {
        onBillingAddressChange(billingAddressDataToPass);
      }
      
      // Use a combination of requestAnimationFrame and setTimeout to ensure
      // React has processed the state update before navigation
      // This is critical to ensure PaymentForm receives the updated billingAddress
      await new Promise<void>(resolve => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            resolve();
          }, 100);
        });
      });
    }
    
    // Call the original onSubmit handler with billing address data
    // This ensures handleShippingSubmit has the billing address data directly
    onSubmit(e, billingAddressDataToPass);
  };

  const fieldClass =
    "w-full h-10 px-3 text-[14px] border border-gray-300 rounded-md outline-none focus:border-[#f21f1f] transition-colors";
  const labelClass = "block text-[12px] font-medium text-gray-700 mb-1";

  return (
    <form onSubmit={handleFormSubmit}>
      <h2 className="text-[20px] font-bold text-black mb-4">
        Shipping Information
      </h2>

      {/* Saved Addresses Section - Only show if user is logged in */}
      {authUser && authUser.accessToken && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <h3 className="text-[13px] font-semibold text-gray-900">
              Saved Addresses
            </h3>
            {!internalShowSavedAddresses && (
              <button
                type="button"
                onClick={() => {
                  setInternalShowSavedAddresses(true);
                  if (onToggleSavedAddresses) {
                    onToggleSavedAddresses();
                  }
                }}
                className="text-[#f21f1f] text-[12px] font-medium hover:underline"
              >
                Show
              </button>
            )}
            {internalShowSavedAddresses && (
              <button
                type="button"
                onClick={() => {
                  setInternalShowSavedAddresses(false);
                  if (onToggleSavedAddresses) {
                    onToggleSavedAddresses();
                  }
                }}
                className="text-gray-500 text-[12px] font-medium hover:underline"
              >
                Hide
              </button>
            )}
          </div>
          {internalShowSavedAddresses && (
            <div className="mb-2">
              <Locations
                authUser={authUser}
                selectDeliveryAddress={handleSelectDeliveryAddress}
                unsetshippingAddress={handleUnsetShippingAddress}
                hideeditbutton={false}
              />
            </div>
          )}
          <div className="my-3 border-t border-gray-200" />
        </div>
      )}

      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>First Name *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
              className={fieldClass}
              placeholder="First name"
            />
          </div>
          <div>
            <label className={labelClass}>Last Name *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => handleChange("lastName", e.target.value)}
              className={fieldClass}
              placeholder="Last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Email Address *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className={fieldClass}
              placeholder="Email address"
            />
          </div>
          <div>
            <label className={labelClass}>Phone Number *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => {
                // Only allow digits, spaces, dashes, parentheses, and plus sign
                // Remove any other characters
                const value = e.target.value.replace(/[^\d\s\-\(\)\+]/g, "");
                handleChange("phone", value);
              }}
              className={fieldClass}
              placeholder="10-digit phone number"
              title="Phone number must be exactly 10 digits"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Street Address *</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => handleChange("address", e.target.value)}
              className={fieldClass}
              placeholder="Street address"
            />
          </div>
          <div>
            <label className={labelClass}>Apt / Suite</label>
            <input
              type="text"
              value={formData.apartment}
              onChange={(e) => handleChange("apartment", e.target.value)}
              className={fieldClass}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="col-span-2 sm:col-span-3">
            <label className={labelClass}>City *</label>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => handleChange("city", e.target.value)}
              className={fieldClass}
              placeholder="City"
            />
          </div>
          <div className="col-span-1 sm:col-span-2">
            <label className={labelClass}>State *</label>
            <select
              required
              value={formData.state}
              onChange={(e) => handleChange("state", e.target.value)}
              className={`${fieldClass} bg-white`}
            >
              <option value="">Select</option>
              {stateOptions.map((state) => (
                <option key={state.value} value={state.value}>
                  {state.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-1 sm:col-span-1">
            <label className={labelClass}>ZIP *</label>
            <input
              type="text"
              required
              value={formData.zipCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                handleChange("zipCode", value);
              }}
              maxLength={5}
              className={fieldClass}
              placeholder="ZIP"
            />
          </div>
        </div>

        {/* Billing Address Checkbox and Form */}
        <div className="pt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.billingAddressSame}
              onChange={(e) => handleChange("billingAddressSame", e.target.checked)}
              className="w-4 h-4 accent-[#4F46E5] flex-shrink-0"
            />
            <span className="text-[13px] text-[#3d3d3d]">
              Billing address same as shipping
            </span>
          </label>

          {/* Billing Address Form - Show when checkbox is unchecked */}
          {!formData.billingAddressSame && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <h3 className="text-[14px] font-bold text-[#3d3d3d] mb-3">
                Billing Address
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input
                      type="text"
                      required={!formData.billingAddressSame}
                      value={billingForm.firstName}
                      onChange={(e) => handleBillingFormChange("firstName", e.target.value)}
                      className={fieldClass}
                      placeholder="First name"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input
                      type="text"
                      required={!formData.billingAddressSame}
                      value={billingForm.lastName}
                      onChange={(e) => handleBillingFormChange("lastName", e.target.value)}
                      className={fieldClass}
                      placeholder="Last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className={labelClass}>Street Address *</label>
                    <input
                      type="text"
                      required={!formData.billingAddressSame}
                      value={billingForm.address}
                      onChange={(e) => handleBillingFormChange("address", e.target.value)}
                      className={fieldClass}
                      placeholder="Street address"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Apt / Suite</label>
                    <input
                      type="text"
                      value={billingForm.apartment}
                      onChange={(e) => handleBillingFormChange("apartment", e.target.value)}
                      className={fieldClass}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div className="col-span-2 sm:col-span-3">
                    <label className={labelClass}>City *</label>
                    <input
                      type="text"
                      required={!formData.billingAddressSame}
                      value={billingForm.city}
                      onChange={(e) => handleBillingFormChange("city", e.target.value)}
                      className={fieldClass}
                      placeholder="City"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2">
                    <label className={labelClass}>State *</label>
                    <select
                      required={!formData.billingAddressSame}
                      value={billingForm.state}
                      onChange={(e) => handleBillingFormChange("state", e.target.value)}
                      className={`${fieldClass} bg-white`}
                    >
                      <option value="">Select</option>
                      {stateOptions.map((state) => (
                        <option key={state.value} value={state.value}>
                          {state.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1 sm:col-span-1">
                    <label className={labelClass}>ZIP *</label>
                    <input
                      type="text"
                      required={!formData.billingAddressSame}
                      value={billingForm.zipCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "").slice(0, 5);
                        handleBillingFormChange("zipCode", value);
                      }}
                      maxLength={5}
                      className={fieldClass}
                      placeholder="ZIP"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Method Selection */}
        <div className="pt-3">
          <h3 className="text-[14px] font-bold text-[#3d3d3d] mb-2">
            Delivery Method
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Shipping Option */}
            <label
              className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-all ${
                selectedDeliveryType === "shipping"
                  ? "border-[#f21f1f] bg-red-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="deliveryType"
                value="shipping"
                checked={selectedDeliveryType === "shipping"}
                onChange={() => onDeliveryTypeChange("shipping")}
                className="w-4 h-4 text-[#f21f1f] cursor-pointer"
              />
              <span className="text-[13px] font-medium">Shipping</span>
            </label>

            {/* Store Pickup Option - Only show if no dropshipping items */}
            {!hasDropshippingOnlyItem && (
              <label
                className={`flex items-center gap-2 px-3 py-2 border rounded-md cursor-pointer transition-all ${
                  selectedDeliveryType === "storepickup"
                    ? "border-[#f21f1f] bg-red-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  type="radio"
                  name="deliveryType"
                  value="storepickup"
                  checked={selectedDeliveryType === "storepickup"}
                  onChange={() => onDeliveryTypeChange("storepickup")}
                  className="w-4 h-4 text-[#f21f1f] cursor-pointer"
                />
                <span className="text-[13px] font-medium">Store Pickup</span>
              </label>
            )}
          </div>

          {/* Store Pickup Address Display */}
          {selectedDeliveryType === "storepickup" && !hasDropshippingOnlyItem && (
            <div className="mt-2 p-2.5 bg-gray-50 rounded-md">
              <p className="text-[13px] text-gray-600">
                <strong>Pickup at:</strong> {storeAddress}
              </p>
            </div>
          )}

          {/* Shipping Options Display - Only show when shipping is selected and address is valid */}
          {selectedDeliveryType === "shipping" && showShippingOptions && (
            <ShippingOptions
              taxOrderLines={taxOrderLines}
              cart={cart}
              shipOption={shipOption}
              onShipOptionChange={onShipOptionChange}
              onCalculateTax={onCalculateTax}
              shippingAddress={
                // Use shippingAddress prop if it has a postalCode, otherwise build from form data
                // This ensures ShippingOptions always has a valid address even if state hasn't updated
                shippingAddress && shippingAddress.postalCode
                  ? shippingAddress
                  : formData.zipCode && formData.zipCode.length === 5
                  ? {
                      uid: "",
                      fullname: `${formData.firstName} ${formData.lastName}`,
                      phone: formData.phone,
                      line1: formData.address,
                      line2: formData.apartment,
                      city: formData.city,
                      postalCode: formData.zipCode,
                      region: formData.state,
                      country: "USA",
                      isDefault: false,
                    }
                  : shippingAddress
              }
              customRateLoading={customRateLoading}
            />
          )}

          {/* Show message if shipping selected but no options yet */}
          {selectedDeliveryType === "shipping" && !showShippingOptions && (
            <div className="mt-3 bg-gray-50 border border-gray-200 rounded-md p-3 text-center">
              <p className="text-[13px] text-gray-600">
                Enter a shipping address above to see shipping quotes
              </p>
            </div>
          )}
        </div>

        {/* Order Comments */}
        <div className="pt-2">
          <h3 className="text-[14px] font-bold text-[#3d3d3d] mb-2">
            Order Comments
          </h3>
          <textarea
            value={formData.orderComments}
            onChange={(e) => handleChange("orderComments", e.target.value)}
            className="w-full h-[72px] px-3 py-2 text-[14px] border border-gray-300 rounded-md outline-none focus:border-[#f21f1f] transition-colors resize-none"
            placeholder="Special instructions or notes (optional)"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isButtonDisabled}
        className={`w-full h-11 rounded-md font-bold text-[15px] transition-colors mt-4 ${
          isButtonDisabled
            ? "bg-gray-400 text-gray-600 cursor-not-allowed"
            : "bg-[#f21f1f] text-white hover:bg-[#cc0000] cursor-pointer"
        }`}
      >
        {customRateLoading
          ? "Loading Shipping Options..."
          : selectedDeliveryType === "shipping" && !canProceed
          ? "Please Select Shipping Options"
          : "Continue to Payment"}
      </button>
    </form>
  );
}

export type { ShippingFormData };
