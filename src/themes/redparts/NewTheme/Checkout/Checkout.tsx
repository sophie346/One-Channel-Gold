import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, CreditCard, Package } from "lucide-react";
import { Toast } from "primereact/toast";
import CheckoutHeader from "./components/CheckoutHeader";
import CheckoutProgress, { CheckoutStep } from "./components/CheckoutProgress";
import ExpressCheckout from "./components/ExpressCheckout";
import ShippingForm, { ShippingFormData } from "./components/ShippingForm";
import PaymentForm, { PaymentFormData } from "./components/PaymentForm";
import ReviewOrder from "./components/ReviewOrder";
import OrderConfirmation from "./components/OrderConfirmation";
import OrderSummary from "./components/OrderSummary";
import ShippingOptions from "./components/ShippingOptions";

// Imports from CheckOutPage.js
import userProfile from "@SharedLibrary/utils/UserProfile";
import { GetCompaniesData } from "@SharedLibrary/Auth/loginfunctions";
import {
  isB2B,
  APP_LABEL,
  Client_Name,
  PRODUCT_BASE_URL,
  affirmExtraPercentage,
  squareExtraPercentage,
  dyanamicLabel,
  isAcimaEnabled,
  isAffirmEnabled,
} from "@src/utils/Constants";
import {
  taxValidation,
  getAffirmDeatils,
  getAcimaDetails,
  useLoadAffirmScript,
  useLoadAcimaScript,
  ensureAcimaLoaded,
  addExtraPercentAmount,
} from "@src/utils/commonService";
import {
  CurrentPublishablekeySquare,
  CurrentPaymentGateway,
} from "@src/utils/productservices";
import { showToastMessage } from "@SharedLibrary/utils/Utils";
import { updateUserDetails } from "@SharedLibrary/Auth/loginfunctions";
import { useCurrentCart } from "@src/containers/Globalcontext";
import {
  extractOrderTransactionId,
  mapCartLinesToPurchaseItems,
  trackAddPaymentInfo,
  trackAddShippingInfo,
  trackBeginCheckout,
  trackPurchase,
} from "@src/utils/ga4Ecommerce";
import { syncCart } from "@/services/cartService";
import { placeOrder as placeOrderApi } from "@/services/checkoutService";

interface CheckoutProps {
  onClose: () => void;
  authUser?: any;
  router?: any;
  setCurrentCartCount?: (count: number) => void;
  /** Refresh B2B credits (account/userdetails) after a successful order. */
  onOrderPlaced?: () => void | Promise<void>;
}

export type DeliveryType = "shipping" | "storepickup";

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

export default function Checkout({
  onClose,
  authUser,
  router,
  setCurrentCartCount,
  onOrderPlaced,
}: CheckoutProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [customRateLoading, setCustomRateLoading] = useState(false);

  // Cart and order state
  const [cart, setCart] = useState<any[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [orderSubTotal, setOrderSubTotal] = useState(0);
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderShipping, setOrderShipping] = useState(0);
  const [orderTotalTax, setOrderTotalTax] = useState(0);
  const [completeCartData, setCompleteCartData] = useState<any>(null);

  // Address and form state
  const [shippingAddress, setShippingAddress] = useState<any>({});
  const [billingAddress, setBillingAddress] = useState<any>({});
  const [shippingForm, setShippingForm] = useState<ShippingFormData>({
    firstName: "",
    lastName: "",
    email: authUser?.emailId || "",
    phone: "",
    address: "",
    apartment: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    billingAddressSame: true,
    orderComments: "",
  });

  // Payment state
  const [paymentForm, setPaymentForm] = useState<PaymentFormData>({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    billingAddressSame: true,
  });
  const [paymentMethod, setPaymentMethod] = useState<string | boolean>(false); // false = card, true = B2B, "paybyaffirm" = Affirm, "paybyacima" = Acima
  const [squareApiKeys, setSquareApiKeys] = useState<any>(null);
  const [currentPaymentGateway, setCurrentPaymentGateway] =
    useState<string>("");
  const [oneChannelClientId, setOneChannelClientId] = useState<string>("");
  const [acimaConfig, setAcimaConfig] = useState<{
    scriptUrl: string;
    locationGuid: string;
    iframeUrl: string;
  } | null>(null);
  /** Full Acima checkout response — sent as loanDetails in submit order when paying with Acima */
  const [acimaLoanDetails, setAcimaLoanDetails] = useState<Record<string, any> | null>(null);

  // Delivery and shipping state
  const [selectedDeliveryType, setSelectedDeliveryType] =
    useState<DeliveryType>("shipping");
  const [storeAddress] = useState("12954 Beaumont Hwy, Houston, TX 77049");
  const [taxOrderLines, setTaxOrderLines] = useState<TaxOrderLine[]>([]);
  const [shipOption, setShipOption] = useState<ShipOption>({});
  const [hasDropshippingOnlyItem, setHasDropshippingOnlyItem] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("coupouncode") || ""
      : ""
  );
  const [readOnlyCouponUI, setReadOnlyCouponUI] = useState(false);

  // Toast ref for showing messages
  const toastRef = useRef<any>(null);

  // Get current cart count from global context to listen for cart changes
  const { currentCartCount } = useCurrentCart();
  const prevCartCountRef = useRef<number | undefined>(undefined);
  const isInitialMountRef = useRef(true);
  const gaBeginCheckoutSent = useRef(false);
  const gaPaymentStepTracked = useRef(false);

  /** API `ordertotal` is the discounted merchandise base; add shipping + tax for grand total. */
  const checkoutTotalBase = () =>
    parseFloat(String(orderTotal || 0)) +
    parseFloat(String(orderShipping || 0)) +
    parseFloat(String(orderTotalTax || 0));

  /** Matches calculateTotal() — used before render defines calculateTotal for GA purchase/submit. */
  const computeCheckoutGrandTotal = () => {
    const baseTotal = checkoutTotalBase();
    if (paymentMethod === "paybyaffirm" && affirmExtraPercentage > 0) {
      return (
        addExtraPercentAmount(orderTotal, affirmExtraPercentage) +
        parseFloat(String(orderShipping || 0)) +
        parseFloat(String(orderTotalTax || 0))
      );
    }
    if (
      currentPaymentGateway === "square" &&
      squareExtraPercentage > 0 &&
      (!paymentMethod || paymentMethod === "googlepay")
    ) {
      const squareFees = parseFloat(
        ((baseTotal * squareExtraPercentage) / 100).toFixed(2)
      );
      return baseTotal + squareFees;
    }
    return baseTotal;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (gaBeginCheckoutSent.current) return;
    if (loading) return;
    if (!cart?.length) return;
    trackBeginCheckout(cart, checkoutTotalBase(), couponCode || undefined);
    gaBeginCheckoutSent.current = true;
  }, [loading, cart, orderTotal, orderShipping, orderTotalTax, couponCode]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (currentStep !== "payment") return;
    if (gaPaymentStepTracked.current) return;
    if (!cart?.length) return;
    let paymentType = "card";
    if (paymentMethod === true) paymentType = "b2b_credits";
    else if (paymentMethod === "paybyaffirm") paymentType = "affirm";
    else if (paymentMethod === "paybyacima") paymentType = "acima";
    else if (paymentMethod === "googlepay") paymentType = "google_pay";
    trackAddPaymentInfo(
      cart,
      computeCheckoutGrandTotal(),
      paymentType,
      couponCode || undefined
    );
    gaPaymentStepTracked.current = true;
  }, [
    currentStep,
    cart,
    paymentMethod,
    couponCode,
    orderSubTotal,
    orderShipping,
    orderTotalTax,
    currentPaymentGateway,
    affirmExtraPercentage,
    squareExtraPercentage,
  ]);

  // Handle cart changes - reset to shipping step if on payment step
  const handleCartChange = useCallback(() => {
    // If we're on the payment step and cart changed, reset to shipping step
    if (currentStep === "payment") {
      // Reset to shipping step
      setCurrentStep("shipping");
      gaPaymentStepTracked.current = false;

      // Reset shipping-related state
      setShippingAddress({});
      setBillingAddress({});
      setTaxOrderLines([]);
      setShipOption({});
      setOrderShipping(0);
      setOrderTotalTax(0);

      // Reset payment method and Acima loan details
      setPaymentMethod(false);
      setAcimaLoanDetails(null);

      // Show a message to the user
      showToastMessage(
        toastRef,
        "info",
        "",
        "Cart has been updated. Please review your shipping information."
      );
    }

    // Refresh cart data
    getCartProducts();
  }, [currentStep]);

  // Get cart products on mount
  useEffect(() => {
    getCartProducts();
    getPaymentKeys();
    if (isAffirmEnabled) {
      loadAffirmScript();
    }
    loadAcimaConfig();
    // Initialize the refs with the initial values
    prevCartCountRef.current = currentCartCount;
    isInitialMountRef.current = false;
  }, []);

  // Refresh cart when cart count changes (e.g., when cart sidebar updates items)
  useEffect(() => {
    // Skip on initial mount
    if (isInitialMountRef.current) {
      return;
    }

    // Only refresh if cart count has changed from an external source
    if (
      currentCartCount !== undefined &&
      currentCartCount !== prevCartCountRef.current
    ) {
      handleCartChange();
    }
    // Update the ref to track the current cart count
    prevCartCountRef.current = currentCartCount;
  }, [currentCartCount, handleCartChange]);

  // Also listen for storage events (when cart is updated via localStorage)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Check if cart-related data changed
      if (e.key === "cart" || e.key === "cartDetails") {
        // Small delay to ensure userProfile is updated
        setTimeout(() => {
          if (!isInitialMountRef.current) {
            handleCartChange();
          }
        }, 100);
      }
    };

    // Listen for storage events (cart updates from other tabs/components)
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom cart update events
    const handleCartUpdate = () => {
      setTimeout(() => {
        if (!isInitialMountRef.current) {
          handleCartChange();
        }
      }, 100);
    };

    // Listen for custom cart update events (from cart sidebar in same tab)
    window.addEventListener("cartUpdated", handleCartUpdate as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "cartUpdated",
        handleCartUpdate as EventListener
      );
    };
  }, [handleCartChange]);

  // Track previous delivery type to recalculate tax when it changes
  const prevDeliveryTypeRef = useRef<DeliveryType>("shipping");

  // Recalculate tax when delivery type changes (if address is already set)
  useEffect(() => {
    if (
      prevDeliveryTypeRef.current !== selectedDeliveryType &&
      shippingAddress?.postalCode &&
      Object.keys(shippingAddress).length > 0
    ) {
      prevDeliveryTypeRef.current = selectedDeliveryType;
      // Reset shipOption when delivery type changes to force new selection
      if (selectedDeliveryType === "storepickup") {
        setShipOption({});
      }
      calculateTax(shippingAddress);
    }
  }, [selectedDeliveryType]);

  // Load Affirm script
  const loadAffirmScript = async () => {
    try {
      const res = await getAffirmDeatils(authUser);
      if (!res?.error && res?.data?.[0]) {
        const data = res.data[0];
        useLoadAffirmScript(true, data?.value?.publickey, data?.value?.url);
      }
    } catch (err) {
      console.error("Error loading Affirm script:", err);
    }
  };

  // Load Acima config from API — value.publickey = locationGuid, value.url = ecom base URL
  const loadAcimaConfig = async () => {
    if (!isAcimaEnabled) return;
    try {
      const res = await getAcimaDetails(authUser);
      if (res?.error) return;

      const raw = Array.isArray(res?.data) ? res.data[0] : res;
      const v = raw?.value ?? {};
      const locationGuid = v.publickey || v.locationGuid || v.merchantId || v.guid;
      const ecomUrl = (v.url || v.iframeUrl || v.ecomUrl || "").replace(/\/$/, "");
      const iframeUrl = ecomUrl;
      const scriptUrl = ecomUrl ? `${ecomUrl}/js/acima.min.js` : "";

      if (locationGuid && scriptUrl && iframeUrl) {
        setAcimaConfig({ scriptUrl, locationGuid, iframeUrl });
      }
    } catch (err) {
      console.error("Error loading Acima config:", err);
    }
  };

  // Load Acima script when we have config and user is on payment step
  useEffect(() => {
    if (acimaConfig && currentStep === "payment") {
      useLoadAcimaScript(true, acimaConfig.scriptUrl);
    }
  }, [acimaConfig, currentStep]);

  // Load Affirm UI for payment
  const loadAffirmUi = () => {
    setLoading(true);

    const billingData = {
      name: {
        first: billingAddress?.fullname || shippingAddress?.fullname || "",
        last: shippingAddress?.fullname || "",
      },
      address: {
        line1: billingAddress?.line1 || billingAddress?.address1 || "",
        line2: billingAddress?.line2 || billingAddress?.address2 || "",
        city: billingAddress?.city || "",
        state: billingAddress?.region || "",
        zipcode: billingAddress?.postalCode || "",
        country: "USA",
      },
      email: shippingForm.email || authUser?.emailId || "",
    };

    const shippingData = {
      name: {
        first: shippingAddress?.fullname || "",
        last: shippingAddress?.fullname || "",
      },
      address: {
        line1: shippingAddress?.line1 || shippingAddress?.address1 || "",
        line2: shippingAddress?.line2 || shippingAddress?.address2 || "",
        city: shippingAddress?.city || "",
        state: shippingAddress?.region || "",
        zipcode: shippingAddress?.postalCode || "",
        country: "USA",
      },
      email: shippingForm.email || authUser?.emailId || "",
    };

    const finalBilling = shippingForm.billingAddressSame
      ? shippingData
      : billingData;

    const affirmTotal = orderTotal
      ? Math.round(
          (addExtraPercentAmount(orderTotal, affirmExtraPercentage) +
            parseFloat(String(orderShipping || 0)) +
            parseFloat(String(orderTotalTax || 0))) *
            100
        )
      : 0;

    if (typeof window !== "undefined" && (window as any).affirm) {
      (window as any).affirm.checkout({
        merchant: {
          user_confirmation_url: `${window.location.origin}/order-success`,
          user_cancel_url: `${window.location.origin}/checkout`,
          user_confirmation_url_action: "POST",
          name: `${dyanamicLabel}`,
        },
        shipping: shippingData,
        billing: finalBilling,
        items:
          Array.isArray(cart) && cart.length > 0
            ? cart.map((singleItem: any) => ({
                ...singleItem,
                unit_price: addExtraPercentAmount(
                  singleItem?.price || 0,
                  affirmExtraPercentage
                ),
                display_name: singleItem?.title,
                qty: singleItem?.quantity,
                item_image_url: singleItem?.images?.[0]?.url || "",
                categories: singleItem?.category,
              }))
            : [],
        currency: "USD",
        financing_program: "flyus_3z6r12r",
        shipping_amount: orderShipping,
        tax_amount: orderTotalTax,
        total: affirmTotal,
        metadata: {
          mode: "modal",
        },
      });

      (window as any).affirm.checkout.open({
        onFail: () => {
          showToastMessage(toastRef, "error", "", "User cancelled the Affirm");
          setLoading(false);
        },
        onSuccess: (a: any) => {
          if (a.checkout_token) {
            // Validate shipping address before submitting order
            if (validateBeforeSubmit()) {
              handlePlaceOrder(a.checkout_token);
            } else {
              setLoading(false);
            }
          }
        },
        onOpen: (token: any) => {
          console.log(
            "Affirm modal was opened successfully, checkout token is: " + token
          );
        },
        onValidationError: (a: any) => {
          showToastMessage(toastRef, "error", "", a?.message || "Affirm error");
          setLoading(false);
        },
      });
    } else {
      setLoading(false);
      showToastMessage(
        toastRef,
        "error",
        "",
        "Affirm is not available. Please try again later."
      );
    }
  };

  // Acima lease-to-own — config from API (getSettings?apiName=acimaapidetails)
  const loadAcimaUi = async () => {
    if (!acimaConfig) {
      showToastMessage(toastRef, "error", "", "Acima is not configured.");
      return;
    }
    if (!Array.isArray(cart) || cart.length === 0) {
      showToastMessage(toastRef, "error", "", "Cart is empty.");
      return;
    }

    if (!validateBeforeSubmit()) {
      return;
    }

    setLoading(true);

    try {
      await ensureAcimaLoaded(acimaConfig.scriptUrl);
    } catch (err: any) {
      setLoading(false);
      showToastMessage(
        toastRef,
        "error",
        "",
        err?.message || "Acima script failed to load. Please refresh and try again."
      );
      return;
    }

    const Acima = (window as any).Acima;
    if (!Acima || !Acima.Client) {
      setLoading(false);
      showToastMessage(
        toastRef,
        "error",
        "",
        "Acima is not available. Please refresh the page or try again later."
      );
      return;
    }

    // Client: locationGuid (required), iframeUrl (sandbox/production), merchantId for iframe init
    const client = new Acima.Client({
      locationGuid: acimaConfig.locationGuid,
      merchantId: acimaConfig.locationGuid,
      iframeUrl: acimaConfig.iframeUrl,
    });

    // All amounts in cents (docs: "All money amounts are USD and they are represented by integer cents")
    const shippingCents = Math.round(parseFloat(String(orderShipping || 0)) * 100);
    const salesTaxCents = Math.round(parseFloat(String(orderTotalTax || 0)) * 100);
    const discountsCents = 0;

    const transaction = {
      discounts: discountsCents,
      shipping: shippingCents,
      salesTax: salesTaxCents,
      lineItems: cart.map((item: any) => ({
        productId: String(item?.osku || item?.sku || item?.id || ""),
        productName: String(item?.title || "Item"),
        unitPrice: Math.round(parseFloat(String(item?.price || 0)) * 100),
        quantity: parseInt(String(item?.quantity || 1), 10),
      })),
    };

    const customer = {
      firstName: shippingForm?.firstName || "",
      lastName: shippingForm?.lastName || "",
      phone: (shippingForm?.phone || "").replace(/\D/g, "").slice(0, 10) || undefined,
      email: shippingForm?.email || authUser?.emailId || "",
      address: {
        street1: shippingForm?.address || shippingAddress?.line1 || shippingAddress?.address1 || "",
        street2: shippingForm?.apartment || shippingAddress?.line2 || shippingAddress?.address2 || "",
        city: shippingForm?.city || shippingAddress?.city || "",
        state: shippingForm?.state || shippingAddress?.region || "",
        zipCode: shippingForm?.zipCode || shippingAddress?.postalCode || "",
      },
    };

    const shippingAddressAcima = {
      street1: shippingForm?.address || shippingAddress?.line1 || shippingAddress?.address1 || "",
      street2: shippingForm?.apartment || shippingAddress?.line2 || shippingAddress?.address2 || "",
      city: shippingForm?.city || shippingAddress?.city || "",
      state: shippingForm?.state || shippingAddress?.region || "",
      zipCode: shippingForm?.zipCode || shippingAddress?.postalCode || "",
    };

    const billingAddressAcima = shippingForm?.billingAddressSame
      ? shippingAddressAcima
      : {
          street1: billingAddress?.line1 || billingAddress?.address1 || "",
          street2: billingAddress?.line2 || billingAddress?.address2 || "",
          city: billingAddress?.city || "",
          state: billingAddress?.region || "",
          zipCode: billingAddress?.postalCode || "",
        };

    client
      .checkout({
        transaction,
        customer,
        shippingAddress: shippingAddressAcima,
        billingAddress: billingAddressAcima,
      })
      .then((response: any) => {
        const token = response?.checkoutToken;
        const loanDetails =
          response != null && typeof response === "object"
            ? { ...response }
            : null;
        console.log("loanDetails", loanDetails);
        if (loanDetails) setAcimaLoanDetails(loanDetails);
        // Pass loanDetails directly so backend receives it (setState is async and would still be null here)
        if (token) {
          handlePlaceOrder(token, loanDetails);
        } else {
          setLoading(false);
        }
      })
      .catch((err: any) => {
        setLoading(false);
        const code = err?.code;
        const message = err?.message || "Acima checkout error. Please try again.";
        if (code === "CheckoutInterrupted") {
          showToastMessage(toastRef, "error", "", "Checkout was not completed. You can try again.");
        } else {
          showToastMessage(toastRef, "error", "", message);
        }
      });
  };

  // Get payment API keys
  const getPaymentKeys = async () => {
    try {
      const squareKeys = await CurrentPublishablekeySquare();
      if (squareKeys?.data) {
        setSquareApiKeys(squareKeys.data);
        setOneChannelClientId(squareKeys.oneChannelClientId || "");
      }

      const gateway = await CurrentPaymentGateway();
      if (gateway?.data) {
        setCurrentPaymentGateway(gateway.data);
      }
    } catch (err) {
      console.error("Error getting payment keys:", err);
    }
  };

  // Get cart products
  const getCartProducts = async (overrideCouponCode?: string) => {
    setLoading(true);
    try {
      const { selectedB2BCompany } = GetCompaniesData();
      const userCart = userProfile.getCart();

      // Check for dropshipping only items
      const hasDropshipping =
        Array.isArray(userCart) &&
        userCart?.some((item: any) => item?.isDropshippingOnly === true);
      setHasDropshippingOnlyItem(hasDropshipping || false);

      // If store pickup is selected but there's a dropshipping item, switch to shipping
      if (hasDropshipping && selectedDeliveryType === "storepickup") {
        setSelectedDeliveryType("shipping");
      }

      // Use overrideCouponCode if provided, otherwise use state couponCode
      const codeToUse =
        overrideCouponCode !== undefined ? overrideCouponCode : couponCode;

      // Update state if override code is provided
      if (overrideCouponCode !== undefined) {
        setCouponCode(overrideCouponCode);
        if (typeof window !== "undefined") {
          if (overrideCouponCode) {
            localStorage.setItem("coupouncode", overrideCouponCode);
          } else {
            localStorage.setItem("coupouncode", "");
          }
        }
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("coupouncode", codeToUse || "");
      }
      const res = await syncCart(authUser?.token);
      if (!res.error) {
        const shippingCharges =
          res?.totalOrderShipping || res?.original__totalShipping || 0;

        userProfile.setCart(res.cart);
        userProfile.setcartDetails({
          cartcount: res.cartcount,
          orderTotal: res.ordertotal,
        });

        setCart(Array.isArray(res.cart) ? res.cart : []);
        setCartCount(res.cartcount || 0);
        setOrderSubTotal(Number(res?.subTotal || 0));
        setOrderTotal(Number(res?.ordertotal || 0));
        setOrderShipping(shippingCharges);
        setOrderTotalTax(res?.totalTax || 0);
        setCompleteCartData(res || null);

        // Use codeToUse instead of couponCode to check if coupon was applied
        if (
          codeToUse &&
          res.cart?.find((item: any) => item.discount__applied)
        ) {
          setReadOnlyCouponUI(true);
        } else {
          setReadOnlyCouponUI(false);
        }

        if (setCurrentCartCount) {
          setCurrentCartCount(res.cartcount || 0);
        }
      }
    } catch (e) {
      console.error("Error getting cart products:", e);
    } finally {
      setLoading(false);
    }
  };

  // Calculate tax and shipping
  const calculateTax = async (
    address: any,
    shipOptionOverride?: ShipOption
  ) => {
    // If address is empty, try to use the state shippingAddress as fallback
    // This handles the case when ShippingOptions calls calculateTax with an empty prop
    let addressToUse = address;
    if (!address || Object.keys(address).length === 0 || !address.postalCode) {
      if (
        shippingAddress &&
        Object.keys(shippingAddress).length > 0 &&
        shippingAddress.postalCode
      ) {
        addressToUse = shippingAddress;
      } else {
        console.warn("calculateTax called without a valid address");
        return;
      }
    }

    // Update shippingAddress state when a valid address is provided
    // This ensures ShippingOptions component has access to the address
    if (
      addressToUse &&
      Object.keys(addressToUse).length > 0 &&
      addressToUse.postalCode
    ) {
      setShippingAddress(addressToUse);
    }

    setCustomRateLoading(true);
    try {
      // Use cart from state if available, otherwise fallback to userProfile
      const userCart = cart && cart.length > 0 ? cart : userProfile.getCart();
      if (!userCart || !Array.isArray(userCart) || userCart.length === 0)
        return;

      // Use shipOptionOverride if provided, otherwise use current shipOption state
      const currentShipOption = shipOptionOverride || shipOption;

      const res = await taxValidation(
        addressToUse,
        {
          shippingOptionSelected: selectedDeliveryType,
          isB2B: isB2B,
          shipOption: currentShipOption,
        },
        authUser
      );

      if (res && !res.error && res.data) {
        // Build shipOption_temp from response
        // Use the shipOption passed as parameter (which could be shipOptionOverride or current state)
        // This matches the pattern from CheckOutPage.js
        const shipOptionTemp: ShipOption = {};
        res.data?.lines?.forEach((lm: any, lmindex: number) => {
          // Try to find the selected rate that matches the service in currentShipOption
          // currentShipOption is shipOptionOverride if provided, otherwise current state shipOption
          const selectedService = currentShipOption?.[lmindex]?.service;
          if (selectedService) {
            // Find the rate in the response that matches the selected service
            const foundRate = lm?.rates?.find(
              (a: any) => a.service === selectedService
            );
            if (foundRate) {
              // If found, use it (preserves selection with updated rate/carrier_account_id from API)
              shipOptionTemp[lmindex] = foundRate;
            } else {
              // If not found, preserve the original selection from shipOptionOverride if it exists
              // Otherwise fall back to first rate
              shipOptionTemp[lmindex] =
                shipOptionOverride?.[lmindex] || lm?.rates?.[0] || {};
            }
          } else {
            // No selection exists, use first rate
            shipOptionTemp[lmindex] = lm?.rates?.[0] || {};
          }
        });

        setOrderTotalTax(res.data?.totalTaxCalculated || 0);
        setOrderShipping(res.data?.orderShipping || 0);
        setTaxOrderLines(res.data?.lines || []);
        // shipOptionTemp already preserves selections correctly when built above
        // Since shipOptionTemp is built using currentShipOption (which is shipOptionOverride || shipOption),
        // it should already have the correct selections. We can use it directly.
        setShipOption(shipOptionTemp);

        // Update cart with tax and shipping
        const newCart = Array.isArray(userCart)
          ? userCart.map((cartItem: any, indx: number) => ({
              ...cartItem,
              tax: res.data?.lines?.[indx]?.tax || 0,
              shipping: res.data?.lines?.[indx]?.shipping || 0,
              totalShipping: res.data?.lines?.[indx]?.totalShipping || 0,
            }))
          : [];
        userProfile.setCart(newCart);
        setCart(newCart);
      } else {
        if (toastRef?.current) {
          showToastMessage(
            toastRef,
            "error",
            "",
            res?.message || "Error calculating tax"
          );
        } else {
          console.error(
            "Error calculating tax:",
            res?.message || "Error calculating tax"
          );
        }
      }
    } catch (error) {
      console.error("Error calculating tax:", error);
      if (toastRef?.current) {
        showToastMessage(
          toastRef,
          "error",
          "",
          "Error calculating tax and shipping"
        );
      } else {
        console.error("Error calculating tax and shipping");
      }
    } finally {
      setCustomRateLoading(false);
    }
  };

  // Handle shipping form submit
  const handleShippingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number before proceeding
    if (!shippingForm.phone || !shippingForm.phone.trim()) {
      showToastMessage(
        toastRef,
        "error",
        "",
        "Phone number is required."
      );
      return;
    }

    // Remove all non-digit characters and check length
    const phoneDigits = shippingForm.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      showToastMessage(
        toastRef,
        "error",
        "",
        "Phone number must be exactly 10 digits."
      );
      return;
    }

    // Build shipping address object
    const addressData = {
      uid: "",
      fullname: `${shippingForm.firstName} ${shippingForm.lastName}`,
      phone: shippingForm.phone,
      line1: shippingForm.address,
      line2: shippingForm.apartment,
      city: shippingForm.city,
      postalCode: shippingForm.zipCode,
      region: shippingForm.state,
      country: "USA",
      isDefault: false,
    };

    setShippingAddress(addressData);

    // If billing same as shipping, set billing address
    if (shippingForm.billingAddressSame) {
      setBillingAddress(addressData);
    }

    // If delivery type is shipping, ensure shipping options are selected
    if (selectedDeliveryType === "shipping") {
      // Check if tax calculation has been done and shipping options exist
      if (taxOrderLines.length === 0) {
        // Calculate tax first
        await calculateTax(addressData);

        // Wait a bit for state to update and check again
        if (taxOrderLines.length === 0) {
          showToastMessage(
            toastRef,
            "error",
            "",
            "Please wait for shipping options to load before continuing."
          );
          return;
        }
      }

      // Validate that shipping options are selected for all cart items
      const cartItemsCount = cart.length;

      // Check if all items have shipping options selected
      let allOptionsSelected = true;
      for (let i = 0; i < cartItemsCount; i++) {
        if (!shipOption[i] || !shipOption[i].service) {
          allOptionsSelected = false;
          break;
        }
      }

      if (!allOptionsSelected) {
        showToastMessage(
          toastRef,
          "error",
          "",
          "Please select shipping options for all items before continuing."
        );
        return;
      }

      // Recalculate tax with selected shipping options to ensure totals are up to date
      await calculateTax(addressData, shipOption);
    } else {
      // For store pickup, we don't need shipping options
      // Calculate tax without shipping options
      await calculateTax(addressData);
    }

    try {
      const shippingTier =
        selectedDeliveryType === "storepickup"
          ? "pickup"
          : selectedDeliveryType === "shipping"
            ? "shipping"
            : undefined;
      trackAddShippingInfo(
        cart,
        checkoutTotalBase(),
        shippingTier,
        couponCode || undefined
      );
    } catch (_) {}

    setCurrentStep("payment");
  };

  // Handle payment form submit (for non-Square card payments)
  // Note: Square and Affirm handle order creation in their own handlers
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // This will be handled by PaymentForm's Place Order button
  };

  // Handle place order
  const handlePlaceOrder = async (
    paymentToken?: string,
    acimaLoanDetailsPayload?: Record<string, any> | null
  ) => {
    if (!validateBeforeSubmit()) {
      return;
    }

    await submitOrder(paymentToken, acimaLoanDetailsPayload);
  };

  // Validate before submit
  const validateBeforeSubmit = (): boolean => {
    if (!shippingAddress || Object.keys(shippingAddress).length === 0) {
      showToastMessage(
        toastRef,
        "error",
        "",
        "Please complete shipping address before proceeding."
      );
      return false;
    }

    // Check billing address - billing address is only set in shipping step
    if (
      !shippingForm.billingAddressSame &&
      (!billingAddress || Object.keys(billingAddress).length === 0)
    ) {
      showToastMessage(
        toastRef,
        "error",
        "",
        "Please complete billing address before proceeding."
      );
      return false;
    }

    const errors = validateCheckoutFields();
    if (errors.length > 0) {
      showToastMessage(toastRef, "error", "", errors[0]);
      return false;
    }

    return true;
  };

  // Validate checkout fields
  const validateCheckoutFields = (): string[] => {
    const errors: string[] = [];

    if (!shippingAddress?.fullname)
      errors.push("Shipping full name is required.");
    if (!shippingAddress?.line1)
      errors.push("Shipping address line 1 is required.");
    if (!shippingAddress?.city) errors.push("Shipping city is required.");
    if (!shippingAddress?.region)
      errors.push("Shipping state/region is required.");
    if (!shippingAddress?.postalCode)
      errors.push("Shipping postal code is required.");
    if (!shippingForm.email) errors.push("Email is required.");
    
    // Validate phone number - must be exactly 10 digits
    if (!shippingForm.phone) {
      errors.push("Phone number is required.");
    } else {
      // Remove all non-digit characters and check length
      const phoneDigits = shippingForm.phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10) {
        errors.push("Phone number must be exactly 10 digits.");
      }
    }

    // Check billing address - billing address is only set in shipping step
    if (!shippingForm.billingAddressSame) {
      if (!billingAddress?.fullname)
        errors.push("Billing full name is required.");
      if (!billingAddress?.line1)
        errors.push("Billing address line 1 is required.");
      if (!billingAddress?.city) errors.push("Billing city is required.");
      if (!billingAddress?.region)
        errors.push("Billing state/region is required.");
      if (!billingAddress?.postalCode)
        errors.push("Billing postal code is required.");
    }

    return errors;
  };

  // Submit order
  const submitOrder = async (
    paymentToken?: string,
    acimaLoanDetailsPayload?: Record<string, any> | null
  ) => {
    setLoading(true);
    try {
      const { selectedB2BCompany, AllB2bAllowedCompanies } = GetCompaniesData();
      const userCartDetails = userProfile.getcartDetails();
      const userCart = userProfile.getCart();

      const cartToUse =
        userCartDetails &&
        typeof userCartDetails === "object" &&
        "couponcart" in userCartDetails &&
        Array.isArray(userCartDetails.couponcart)
          ? userCartDetails.couponcart
          : Array.isArray(userCart)
          ? userCart
          : [];

      // Merge live tax + EasyPost shipping onto cart lines. Backend totals /
      // charge use cart.shipping + cart.totalShipping — shipOption alone is not enough.
      const isStorePickup = selectedDeliveryType === "storepickup";
      const cartWithTax = cartToUse.map((cartItem: any, index: number) => {
        const line = taxOrderLines[index];
        const selectedRate = shipOption?.[index];
        const qty = parseInt(cartItem?.quantity, 10) || 1;

        let shipping = 0;
        let totalShipping = 0;

        if (!isStorePickup) {
          const rateFromOption = parseFloat(String(selectedRate?.rate ?? ""));
          const lineShipping = parseFloat(String(line?.shipping ?? ""));
          const lineTotalShipping = parseFloat(
            String(line?.totalShipping ?? "")
          );
          const existingShipping = parseFloat(String(cartItem?.shipping ?? ""));
          const existingTotalShipping = parseFloat(
            String(cartItem?.totalShipping ?? "")
          );

          if (line && Number.isFinite(lineShipping)) {
            shipping = lineShipping;
          } else if (Number.isFinite(rateFromOption)) {
            shipping = rateFromOption;
          } else if (Number.isFinite(existingShipping)) {
            shipping = existingShipping;
          }

          if (line && Number.isFinite(lineTotalShipping)) {
            totalShipping = lineTotalShipping;
          } else if (Number.isFinite(rateFromOption)) {
            totalShipping = rateFromOption * qty;
          } else if (Number.isFinite(existingTotalShipping)) {
            totalShipping = existingTotalShipping;
          } else {
            totalShipping = shipping * qty;
          }
        }

        return {
          ...cartItem,
          tax: line?.tax ?? cartItem?.tax ?? 0,
          shipping,
          totalShipping,
          original__totalShipping: totalShipping,
        };
      });

      // Billing address is determined in shipping step
      const orderBody: any = {
        cart: cartWithTax,
        email: shippingForm.email || authUser?.emailId,
        shippingAddress: shippingAddress,
        billingAddress: shippingForm.billingAddressSame
          ? shippingAddress
          : billingAddress,
        oneautopaymentType:
          paymentMethod === "paybyaffirm"
            ? "affirm"
            : paymentMethod === "paybyacima"
              ? "acima"
              : "square",
        isB2B: isB2B,
        shippingOptionSelected: selectedDeliveryType,
        paymentAcknowledgment: "fullPaid",
        paymentDetails: paymentMethod === true ? "b2bcredits" : "paynow",
        shipOption: shipOption,
        company:
          Array.isArray(AllB2bAllowedCompanies) && selectedB2BCompany
            ? AllB2bAllowedCompanies.find(
                (j: any) => j._id === selectedB2BCompany
              )?.company
            : undefined,
      };

      // Handle payment tokens for different payment methods
      if (paymentToken) {
        // Credit card (false) or Google Pay - both use Square
        if (
          (!paymentMethod || paymentMethod === "googlepay") &&
          currentPaymentGateway === "square"
        ) {
          orderBody.token = paymentToken;
          // Add Square fee when payment is via Square and percentage is set
          if (squareExtraPercentage > 0) {
            const baseTotal =
              parseFloat(String(orderTotal || 0)) +
              parseFloat(String(orderShipping || 0)) +
              parseFloat(String(orderTotalTax || 0));
            const squareFees = parseFloat(
              ((baseTotal * squareExtraPercentage) / 100).toFixed(2)
            );
            orderBody.extraCharges = { squarefees: squareFees };
          }
        }
        // Affirm payment
        else if (paymentMethod === "paybyaffirm") {
          orderBody.token = paymentToken;
        }
        // Acima payment — send full Acima response as loanDetails (use payload from callback when present, else state)
        else if (paymentMethod === "paybyacima") {
          orderBody.token = paymentToken;
          const loanDetails =
            acimaLoanDetailsPayload != null
              ? acimaLoanDetailsPayload
              : acimaLoanDetails;
          if (loanDetails && typeof loanDetails === "object") {
            orderBody.acimaLoanDetails = loanDetails;
          }
        }
      }

      const res = await placeOrderApi(orderBody, authUser?.token);
      if (typeof res === "object" && !res.error) {
        try {
          const txnId = extractOrderTransactionId(res);
          const cartLines =
            Array.isArray(cartWithTax) && cartWithTax.length > 0
              ? cartWithTax
              : Array.isArray(userCart)
                ? userCart
                : [];
          const purchaseValue = computeCheckoutGrandTotal();
          const items = mapCartLinesToPurchaseItems(cartLines);
          trackPurchase({
            transaction_id: txnId || `txn_${Date.now()}`,
            value: purchaseValue,
            tax: Number(orderTotalTax || 0),
            shipping: Number(orderShipping || 0),
            coupon: couponCode || undefined,
            items,
          });
        } catch (_) {}

        userProfile.setCart([]);
        userProfile.setcartDetails({});
        if (setCurrentCartCount) {
          setCurrentCartCount(0);
        }
        setLoading(false);
        setAcimaLoanDetails(null);
        try {
          if (onOrderPlaced) {
            await onOrderPlaced();
          } else {
            await updateUserDetails({
              isB2B: isB2B,
              PRODUCT_BASE_URL: PRODUCT_BASE_URL,
            });
          }
        } catch (_) {
          // Order already placed — don't block success redirect on credit refresh
        }
        if (typeof window !== "undefined") {
          localStorage.setItem("coupouncode", "");
        }
        if (router) {
          router.replace("/order-success");
        } else {
          const orderNum =
            res.orderNumber ||
            `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
          setOrderNumber(orderNum);
          setCurrentStep("confirmation");
        }
      } else {
        setLoading(false);
        showToastMessage(
          toastRef,
          "error",
          "",
          res?.message || "Error placing order"
        );
      }
    } catch (error) {
      setLoading(false);
      console.error("Error submitting order:", error);
      showToastMessage(
        toastRef,
        "error",
        "",
        "Something went wrong, please try again"
      );
    }
  };

  const steps = [
    { id: "shipping" as CheckoutStep, label: "Shipping", icon: MapPin },
    {
      id: "payment" as CheckoutStep,
      label: "Payment & Review",
      icon: CreditCard,
    },
  ];

  // Grand total: API `ordertotal` (post-coupon) + shipping + tax, plus gateway surcharges
  const calculateTotal = () => {
    const baseTotal =
      parseFloat(String(orderTotal || 0)) +
      parseFloat(String(orderShipping || 0)) +
      parseFloat(String(orderTotalTax || 0));
    if (paymentMethod === "paybyaffirm" && affirmExtraPercentage > 0) {
      return (
        addExtraPercentAmount(orderTotal, affirmExtraPercentage) +
        parseFloat(String(orderShipping || 0)) +
        parseFloat(String(orderTotalTax || 0))
      );
    }
    // Add Square fee when payment is via Square and percentage is set
    if (
      currentPaymentGateway === "square" &&
      squareExtraPercentage > 0 &&
      (!paymentMethod || paymentMethod === "googlepay")
    ) {
      const squareFees = parseFloat(
        ((baseTotal * squareExtraPercentage) / 100).toFixed(2)
      );
      return baseTotal + squareFees;
    }
    return baseTotal;
  };

  const total = calculateTotal();

  // Square fee amount for display in order summary (when payment is Square)
  const baseTotalForFees =
    parseFloat(String(orderTotal || 0)) +
    parseFloat(String(orderShipping || 0)) +
    parseFloat(String(orderTotalTax || 0));
  const squareFeesAmount =
    currentPaymentGateway === "square" &&
    squareExtraPercentage > 0 &&
    (!paymentMethod || paymentMethod === "googlepay")
      ? parseFloat(
          ((baseTotalForFees * squareExtraPercentage) / 100).toFixed(2)
        )
      : 0;

  if (currentStep === "confirmation") {
    return (
      <OrderConfirmation
        orderNumber={orderNumber}
        total={total}
        email={shippingForm.email}
        onClose={onClose}
      />
    );
  }

  return (
    <div className="bg-gray-50 z-[60] min-h-screen">
      <Toast ref={toastRef} />
      <CheckoutHeader onClose={onClose} />
      <CheckoutProgress currentStep={currentStep} steps={steps} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-10 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[16px] shadow-sm p-6 md:p-8">
              {currentStep === "shipping" && (
                <>
                  {/* <ExpressCheckout /> */}
                  <ShippingForm
                    formData={shippingForm}
                    onFormChange={setShippingForm}
                    onSubmit={handleShippingSubmit}
                    selectedDeliveryType={selectedDeliveryType}
                    onDeliveryTypeChange={setSelectedDeliveryType}
                    hasDropshippingOnlyItem={hasDropshippingOnlyItem}
                    storeAddress={storeAddress}
                    showShippingOptions={
                      selectedDeliveryType === "shipping" &&
                      taxOrderLines.length > 0
                    }
                    taxOrderLines={taxOrderLines}
                    cart={cart}
                    shipOption={shipOption}
                    onShipOptionChange={setShipOption}
                    onCalculateTax={calculateTax}
                    shippingAddress={shippingAddress}
                    customRateLoading={customRateLoading}
                    billingAddress={billingAddress}
                    onBillingAddressChange={setBillingAddress}
                    authUser={authUser}
                    onShipOptionReset={() => {
                      // Reset shipping options when address changes
                      setShipOption({});
                      setTaxOrderLines([]);
                    }}
                  />
                </>
              )}

              {currentStep === "payment" && (
                <PaymentForm
                  formData={paymentForm}
                  onFormChange={setPaymentForm}
                  onSubmit={handlePaymentSubmit}
                  onBack={() => setCurrentStep("shipping")}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={setPaymentMethod}
                  squareApiKeys={squareApiKeys}
                  orderTotal={orderTotal}
                  orderSubTotal={orderSubTotal}
                  orderShipping={orderShipping}
                  orderTotalTax={orderTotalTax}
                  currentPaymentGateway={currentPaymentGateway}
                  onPlaceOrder={handlePlaceOrder}
                  authUser={authUser}
                  shippingAddress={shippingAddress}
                  billingAddress={billingAddress}
                  email={shippingForm.email}
                  cart={cart}
                  completeCartData={completeCartData}
                  toastRef={toastRef}
                  onLoadAffirm={isAffirmEnabled ? loadAffirmUi : undefined}
                  onLoadAcima={isAcimaEnabled && acimaConfig ? loadAcimaUi : undefined}
                  validateCheckoutFields={validateCheckoutFields}
                  shippingForm={shippingForm}
                  selectedDeliveryType={selectedDeliveryType}
                  storeAddress={storeAddress}
                />
              )}
            </div>
          </div>

          {/* Right Column - Order Summary (sticky alongside shipping/payment form) */}
          <div className="lg:col-span-1 lg:sticky lg:top-20 lg:self-start">
            <OrderSummary
              itemsCount={cartCount}
              subtotal={orderSubTotal}
              shipping={orderShipping}
              tax={orderTotalTax}
              total={total}
              cart={cart}
              couponCode={couponCode}
              readOnlyCouponUI={readOnlyCouponUI}
              onCouponChange={setCouponCode}
              onCouponApply={getCartProducts}
              paymentMethod={paymentMethod}
              affirmExtraPercentage={affirmExtraPercentage}
              squareFees={squareFeesAmount}
              squareExtraPercentage={squareExtraPercentage}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f21f1f]"></div>
          </div>
        </div>
      )}
    </div>
  );
}
