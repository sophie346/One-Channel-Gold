export interface ApiCartItem {
  osku: string;
  sku?: string;
  title?: string;
  name?: string;
  brand?: string;
  price: number;
  quantity: number;
  total?: number;
  image?: string;
  images?: Array<string | { url?: string }>;
  slug?: string;
  shipping?: number;
  tax?: number;
  totalShipping?: number;
  discount__applied?: number | boolean;
  original__Price?: number;
  original__Total?: number;
  original__totalShipping?: number;
  discountsFounds?: Array<{
    name?: string;
    code?: string;
    amount?: number;
    [key: string]: unknown;
  }>;
  isDropshippingOnly?: boolean;
  selectedAddOns?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface CartResponse {
  error?: boolean;
  message?: string;
  cart?: ApiCartItem[];
  cartcount?: number;
  ordertotal?: number;
  orderTotal?: number;
  subTotal?: number;
  subtotal?: number;
  totalTax?: number;
  totalOrderShipping?: number;
  original__OrderTotal?: number;
  originalOrderTotal?: number;
  original__totalOrderShipping?: number;
  original__totalShipping?: number;
  discount__applied?: number | boolean;
  guestCartId?: string;
}

export interface ShippingAddress {
  uid?: string;
  fullname: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  region: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
  email?: string;
}

export interface ShippingRate {
  service?: string;
  carrier?: string;
  carrier_account_id?: string;
  rate?: string | number;
  delivery_days?: number;
  [key: string]: unknown;
}

export interface TaxLine {
  tax?: number;
  shipping?: number;
  totalShipping?: number;
  rates?: ShippingRate[];
  [key: string]: unknown;
}

export interface TaxResponse {
  error?: boolean;
  message?: string;
  data?: {
    totalTaxCalculated?: number;
    orderShipping?: number;
    lines?: TaxLine[];
    [key: string]: unknown;
  };
  totalTaxCalculated?: number;
  orderShipping?: number;
  lines?: TaxLine[];
  [key: string]: unknown;
}

export interface CheckoutPayload {
  cart: ApiCartItem[];
  email: string;
  shippingAddress: ShippingAddress;
  billingAddress: ShippingAddress;
  token?: string;
  oneautopaymentType?: string;
  isB2B?: boolean;
  shippingOptionSelected?: string;
  paymentAcknowledgment?: string;
  paymentDetails?: string;
  shipOption?: Record<string, ShippingRate>;
  company?: string;
  extraCharges?: Record<string, number>;
  useGuestCart?: boolean;
  guestCartId?: string;
}

export interface AuthUser {
  email: string;
  emailId: string;
  token: string;
  accessToken: string;
  userId: string;
  userRole?: string;
  displayName?: string;
  /** Gold UI aliases */
  uid?: string;
  name?: string;
}

export interface B2BCompany {
  _id: string;
  company?: string;
  name?: string;
  companyName?: string;
  creditLeft?: number;
  b2bData?: {
    creditLeft?: number | string;
    creditAlloted?: number | string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface AccountProfile {
  _id?: string;
  firebaseUid?: string;
  emailId?: string;
  email?: string;
  firstname?: string;
  lastname?: string;
  middlename?: string;
  displayName?: string;
  contactnumber?: string;
  phone?: string;
  dob?: string;
  companyId?: string;
  companies?: B2BCompany[];
  [key: string]: unknown;
}

export interface UserDetailsResponse {
  error?: boolean;
  message?: string;
  isb2buser?: boolean;
  accounts?: AccountProfile;
}
