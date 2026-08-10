export interface Product {
  id: string;
  slug: string;
  name: string;
  category: 'rings' | 'chains' | 'necklaces' | 'bracelets' | 'earrings' | 'pendants' | 'coins' | 'bars' | 'antique' | 'custom';
  karat: string;
  weight: number; // in grams
  purity: string; // e.g. "99.9%", "91.6%"
  hallmark: string; // e.g. "BIS 916", "Fed Hallmarked"
  price: number;
  image: string;
  images?: string[];
  description: string;
  certificateStatus: 'Verified' | 'Pending' | 'None';
  certificateNumber?: string;
  availability: 'In Stock' | 'Sold' | 'Reserved';
  metalColor: 'Yellow Gold' | 'White Gold' | 'Rose Gold' | 'Multi-Tone';
  condition: 'Brand New' | 'Excellent' | 'Vintage' | 'Estate';
  size?: string;
  /** API fields preserved for cart / deep links (sku; osku legacy fallback) */
  sku?: string;
  /** @deprecated Prefer sku */
  osku?: string;
  brand?: string;
  compareAtPrice?: number | null;
}

export interface AuctionLot {
  id: string;
  lotNumber: string;
  title: string;
  category: 'fine-jewelry' | 'coins' | 'bars' | 'estate' | 'watches' | 'raw-gold';
  currentBid: number;
  startingBid: number;
  reserveStatus: 'Met' | 'Not Met' | 'No Reserve';
  bidsCount: number;
  endsAt: string; // ISO date string or countdown label
  karat: string;
  weight: number; // in grams
  appraisalStatus: 'Certified' | 'Inspected';
  shippingCost: number;
  image: string;
  description: string;
  watchlist: boolean;
  bidsHistory: Array<{ bidder: string; amount: number; time: string }>;
  status: 'active' | 'ended' | 'sold';
}

export interface PawnLoan {
  id: string;
  itemName: string;
  collateralValue: number;
  loanAmount: number;
  principal: number;
  financeCharge: number;
  apr: number;
  maturityDate: string;
  gracePeriodDays: number;
  redemptionAmount: number;
  status: 'Active' | 'Redeemed' | 'Default' | 'In Grace Period';
  dateIssued: string;
}

export interface SellGoldOffer {
  id: string;
  itemType: string;
  estimatedWeight: number;
  statedKarat: string;
  estimatedRangeMin: number;
  estimatedRangeMax: number;
  status: 'Draft' | 'Submitted' | 'Received' | 'Tested' | 'Offer Extended' | 'Accepted' | 'Paid';
  method: 'Store Visit' | 'Secure Pickup' | 'Insured Mail-In';
  dateCreated: string;
  actualPayout?: number;
  trackingNumber?: string;
}

export interface ServiceOrder {
  id: string;
  serviceType: 'Cleaning' | 'Repair' | 'Restoration' | 'Resizing' | 'Custom Design';
  itemName: string;
  status: 'Received' | 'Inspected' | 'Estimate Pending' | 'Approved' | 'In Service' | 'Quality Check' | 'Ready' | 'Completed';
  cost: number;
  dateOrdered: string;
  estimatedCompletion: string;
  notes: string;
  timeline: Array<{ status: string; date: string; description: string; active: boolean }>;
}

export interface DocumentRecord {
  id: string;
  title: string;
  category: 'Appraisal' | 'Pawn Agreement' | 'Bill of Sale' | 'Tax Invoice' | 'Certificate of Authenticity';
  date: string;
  signed: boolean;
  docUrl: string;
}

export interface StorageRecord {
  id: string;
  itemId: string;
  itemName: string;
  vaultLocation: string;
  binNumber: string;
  sealNumber: string;
  insuranceValue: number;
  lastVerifiedDate: string;
  status: 'Secured' | 'Released' | 'Audit Pending';
}

export interface B2BQuote {
  id: string;
  productType: string;
  volumeTonsGrams: string;
  purity: string;
  lockedSpotPrice: number;
  totalValue: number;
  status: 'Pending Verification' | 'Locked' | 'Settled' | 'Expired';
  dateCreated: string;
}

export interface PortalUser {
  name: string;
  email: string;
  accountType: 'Individual' | 'Seller' | 'Bidder' | 'Wholesale Dealer' | 'Supplier';
  isLoggedIn: boolean;
  verifiedStatus: 'Unverified' | 'Pending' | 'Verified';
  balance: number;
}
