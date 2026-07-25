import { Product, AuctionLot, PawnLoan, SellGoldOffer, ServiceOrder, DocumentRecord, StorageRecord } from '../types';

// Curated high-fidelity visual assets for gold and luxury jewelry
export const IMAGES = {
  heroRing: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=800',
  heroBar: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&q=80&w=800',
  heroCoin: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&q=80&w=800',
  heroNecklace: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800',
  rawGold: 'https://images.unsplash.com/photo-1618042164219-62c820f10723?auto=format&fit=crop&q=80&w=800',
  appraisalLab: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&q=80&w=800',
  secureVault: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800',
  craftsman: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=800',
  antiqueRing: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800',
  goldBracelet: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&q=80&w=800',
  goldEarrings: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&q=80&w=800',
  luxuryWatch: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800',
};

// Base Spot Price constants
export const DEMO_SPOT_PRICE_OUNCE = 2442.85;
export const DEMO_SPOT_PRICE_GRAM = 78.54;

export const KARAT_FACTORS: Record<string, number> = {
  '24K': 1.0,
  '22K': 0.916,
  '18K': 0.750,
  '14K': 0.585,
  '10K': 0.417,
};

// Historical prices for chart (simulating 7-day or 30-day volatility)
export const GOLD_PRICE_HISTORY_7D = [
  { day: 'Thu', price: 2420.50, change: -0.2 },
  { day: 'Fri', price: 2432.10, change: 0.48 },
  { day: 'Sat', price: 2432.10, change: 0.0 },
  { day: 'Sun', price: 2435.00, change: 0.12 },
  { day: 'Mon', price: 2445.80, change: 0.44 },
  { day: 'Tue', price: 2438.40, change: -0.3 },
  { day: 'Wed', price: 2442.85, change: 0.18 },
];

export const GOLD_PRICE_HISTORY_30D = [
  { day: 'Day 1', price: 2380.00 },
  { day: 'Day 5', price: 2392.50 },
  { day: 'Day 10', price: 2415.00 },
  { day: 'Day 15', price: 2402.10 },
  { day: 'Day 20', price: 2428.30 },
  { day: 'Day 25', price: 2435.00 },
  { day: 'Day 30', price: 2442.85 },
];

// Product listings for Buy Gold / Shop
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    slug: 'imperial-gold-signet-ring',
    name: 'Imperial Roman Signet Ring',
    category: 'rings',
    karat: '22K',
    weight: 14.8,
    purity: '91.6%',
    hallmark: 'BIS 916 certified',
    price: 1650.00,
    image: IMAGES.heroRing,
    description: 'A hand-forged 22-karat yellow gold historical signet ring, detailed with a polished high-dome surface. Ideal as a signature heirloom or luxury investment ring.',
    certificateStatus: 'Verified',
    certificateNumber: 'OG-88219-R',
    availability: 'In Stock',
    metalColor: 'Yellow Gold',
    condition: 'Brand New',
    size: '10'
  },
  {
    id: 'p2',
    slug: 'swiss-valcambi-gold-bar-50g',
    name: 'Valcambi 50 Gram Gold Bar',
    category: 'bars',
    karat: '24K',
    weight: 50.0,
    purity: '99.99%',
    hallmark: 'Essayeur Fondeur certified',
    price: 4120.00,
    image: IMAGES.heroBar,
    description: 'Certified 50g investment-grade 24K pure gold bullion bar, minted by Valcambi Suisse. Comes sealed in tamper-proof security assay card.',
    certificateStatus: 'Verified',
    certificateNumber: 'VAL-992011-B',
    availability: 'In Stock',
    metalColor: 'Yellow Gold',
    condition: 'Brand New'
  },
  {
    id: 'p3',
    slug: 'american-eagle-one-ounce-coin',
    name: '2026 American Eagle 1oz Gold Coin',
    category: 'coins',
    karat: '22K',
    weight: 33.93, // contains 31.1g pure gold
    purity: '91.67%',
    hallmark: 'US Mint certified',
    price: 2680.00,
    image: IMAGES.heroCoin,
    description: 'The world-renowned American Gold Eagle bullion coin. Backed by the United States government for weight, purity, and authenticity.',
    certificateStatus: 'Verified',
    certificateNumber: 'USM-2026-C8',
    availability: 'In Stock',
    metalColor: 'Yellow Gold',
    condition: 'Brand New'
  },
  {
    id: 'p4',
    slug: 'solid-cuban-link-collar-chain',
    name: 'Classic Cuban Link Collar Chain',
    category: 'chains',
    karat: '18K',
    weight: 42.5,
    purity: '75.0%',
    hallmark: 'Fineness Mark 750',
    price: 3950.00,
    image: IMAGES.heroNecklace,
    description: 'Premium heavyweight hand-polished 18K solid yellow gold Cuban link chain with custom secure double-lock safety clasp.',
    certificateStatus: 'Verified',
    certificateNumber: 'OG-33104-N',
    availability: 'In Stock',
    metalColor: 'Yellow Gold',
    condition: 'Brand New',
    size: '22 inches'
  },
  {
    id: 'p5',
    slug: 'vintage-victorian-gold-locket',
    name: 'Victorian Filigree Amethyst Locket',
    category: 'antique',
    karat: '14K',
    weight: 11.2,
    purity: '58.5%',
    hallmark: 'Victorian Antique Stamp',
    price: 1180.00,
    image: IMAGES.antiqueRing,
    description: 'Authentic Victorian-era 14K rose gold locket featuring intricate hand-engraved scrollwork and a high-grade oval amethyst center stone.',
    certificateStatus: 'Verified',
    certificateNumber: 'EST-Victorian-81',
    availability: 'In Stock',
    metalColor: 'Rose Gold',
    condition: 'Vintage',
    size: 'One Size'
  },
  {
    id: 'p6',
    slug: 'gold-mesh-eternity-bracelet',
    name: 'Venezia Mesh Eternity Cuff',
    category: 'bracelets',
    karat: '18K',
    weight: 19.5,
    purity: '75.0%',
    hallmark: '750 Star Trademark',
    price: 1980.00,
    image: IMAGES.goldBracelet,
    description: 'Woven mesh multi-dimensional bracelet, Italian-crafted in 18K gold. Flexible comfortable fit with dynamic light reflection.',
    certificateStatus: 'Verified',
    certificateNumber: 'OG-44910-B',
    availability: 'In Stock',
    metalColor: 'Yellow Gold',
    condition: 'Brand New'
  },
  {
    id: 'p7',
    slug: 'tassel-gold-drop-earrings',
    name: 'Cascading Tassel Drop Earrings',
    category: 'earrings',
    karat: '18K',
    weight: 8.4,
    purity: '75.0%',
    hallmark: '750 Fineness Stamp',
    price: 990.00,
    image: IMAGES.goldEarrings,
    description: 'Sophisticated 18K tri-tone (yellow, white, and rose gold) cascading tassel earrings, creating a mesmerizing shimmering motion.',
    certificateStatus: 'Verified',
    certificateNumber: 'OG-10291-E',
    availability: 'In Stock',
    metalColor: 'Multi-Tone',
    condition: 'Brand New'
  },
  {
    id: 'p8',
    slug: 'raw-yukon-gold-nugget-pendant',
    name: 'Yukon Wilderness 12g Nugget Pendant',
    category: 'pendants',
    karat: '23K',
    weight: 12.3,
    purity: '96.2%',
    hallmark: 'Certified Yukon Origin',
    price: 1450.00,
    image: IMAGES.rawGold,
    description: 'A genuine high-purity raw gold nugget discovered in the Yukon Territory, fitted with custom-crafted 18K bale for neckwear.',
    certificateStatus: 'Verified',
    certificateNumber: 'YUK-NU-0042',
    availability: 'In Stock',
    metalColor: 'Yellow Gold',
    condition: 'Estate'
  }
];

// Active Auction lots
export const INITIAL_LOTS: AuctionLot[] = [
  {
    id: 'lot1',
    lotNumber: 'LOT #4092',
    title: 'Flawless 18K Yellow Gold Diamond Solitaire Ring',
    category: 'fine-jewelry',
    currentBid: 3400.00,
    startingBid: 1500.00,
    reserveStatus: 'Met',
    bidsCount: 14,
    endsAt: '2026-07-23T23:59:00Z', // Live countdown active
    karat: '18K',
    weight: 9.8,
    appraisalStatus: 'Certified',
    shippingCost: 35.00,
    image: IMAGES.heroRing,
    description: 'Masterfully polished 18K yellow gold band centering a brilliant-cut round diamond (1.04ct, VVS2 clarity, G color). Fully appraised by GIA.',
    watchlist: false,
    status: 'active',
    bidsHistory: [
      { bidder: 'Bidder_779', amount: 3400.00, time: '2026-07-22T20:12:00-07:00' },
      { bidder: 'Bidder_102', amount: 3250.00, time: '2026-07-22T19:40:00-07:00' },
      { bidder: 'Bidder_779', amount: 3100.00, time: '2026-07-22T18:25:00-07:00' },
    ]
  },
  {
    id: 'lot2',
    lotNumber: 'LOT #4093',
    title: 'Vintage Solid Gold Rolex President Day-Date 36',
    category: 'watches',
    currentBid: 16800.00,
    startingBid: 10000.00,
    reserveStatus: 'Met',
    bidsCount: 22,
    endsAt: '2026-07-24T18:30:00Z',
    karat: '18K',
    weight: 138.5,
    appraisalStatus: 'Certified',
    shippingCost: 150.00,
    image: IMAGES.luxuryWatch,
    description: 'The iconic Rolex Presidential dress watch in solid 18K yellow gold, ref 18038. Features champagne dial, original president link bracelet, fluted bezel, and superb timing compliance.',
    watchlist: true,
    status: 'active',
    bidsHistory: [
      { bidder: 'Collector_X', amount: 16800.00, time: '2026-07-22T20:30:00-07:00' },
      { bidder: 'Bidder_510', amount: 16500.00, time: '2026-07-22T20:01:00-07:00' },
    ]
  },
  {
    id: 'lot3',
    lotNumber: 'LOT #4094',
    title: 'Swiss Pamp Suisse 10 Ounce Gold Bullion Bar',
    category: 'bars',
    currentBid: 24650.00,
    startingBid: 22000.00,
    reserveStatus: 'Not Met',
    bidsCount: 8,
    endsAt: '2026-07-23T15:00:00Z',
    karat: '24K',
    weight: 311.03,
    appraisalStatus: 'Inspected',
    shippingCost: 80.00,
    image: IMAGES.heroBar,
    description: 'Original stamped PAMP Suisse Fortuna 10oz cast bar in pure 24K gold. Includes original assay sheet. Verified weight and conductivity.',
    watchlist: false,
    status: 'active',
    bidsHistory: [
      { bidder: 'Bullion_Hedge', amount: 24650.00, time: '2026-07-22T17:40:00-07:00' },
      { bidder: 'Dealer_One', amount: 24400.00, time: '2026-07-22T16:11:00-07:00' },
    ]
  },
  {
    id: 'lot4',
    lotNumber: 'LOT #4095',
    title: 'Authentic 45-Gram Raw Alaskan Gold Nugget Lot',
    category: 'raw-gold',
    currentBid: 3100.00,
    startingBid: 2000.00,
    reserveStatus: 'Met',
    bidsCount: 11,
    endsAt: '2026-07-25T12:00:00Z',
    karat: '23K',
    weight: 45.2,
    appraisalStatus: 'Certified',
    shippingCost: 25.00,
    image: IMAGES.rawGold,
    description: 'A beautiful collective lot of four extremely high-purity (approximately 94-96% pure) raw river gold nuggets dredged near Fairbanks, Alaska.',
    watchlist: false,
    status: 'active',
    bidsHistory: [
      { bidder: 'Prospector_Rick', amount: 3100.00, time: '2026-07-22T19:00:00-07:00' },
    ]
  }
];

// Initial active pawn loans for customer portal
export const INITIAL_PAWN_LOANS: PawnLoan[] = [
  {
    id: 'LN-004921',
    itemName: 'Solid 18K Gold Curb Link Necklace (58g)',
    collateralValue: 4600.00,
    loanAmount: 3200.00,
    principal: 3200.00,
    financeCharge: 192.00, // Monthly fee
    apr: 24.0,
    maturityDate: '2026-09-15',
    gracePeriodDays: 30,
    redemptionAmount: 3392.00,
    status: 'Active',
    dateIssued: '2026-06-15'
  },
  {
    id: 'LN-003841',
    itemName: 'Heavy 22K Wedding Cuff Bracelet (34.2g)',
    collateralValue: 2700.00,
    loanAmount: 1800.00,
    principal: 1800.00,
    financeCharge: 108.00,
    apr: 24.0,
    maturityDate: '2026-08-01',
    gracePeriodDays: 30,
    redemptionAmount: 1908.00,
    status: 'In Grace Period',
    dateIssued: '2026-05-01'
  }
];

// Initial online gold sales quotes for client portal
export const INITIAL_SELL_OFFERS: SellGoldOffer[] = [
  {
    id: 'SL-8841',
    itemType: 'Scrap Dental Gold and Chains',
    estimatedWeight: 22.4,
    statedKarat: '18K',
    estimatedRangeMin: 1250.00,
    estimatedRangeMax: 1350.00,
    status: 'Offer Extended',
    method: 'Insured Mail-In',
    dateCreated: '2026-07-20',
    actualPayout: 1320.00,
    trackingNumber: 'USPS-SECURE-9921104'
  },
  {
    id: 'SL-8920',
    itemType: 'Broken 14K Gold Watches & Earring parts',
    estimatedWeight: 15.1,
    statedKarat: '14K',
    estimatedRangeMin: 650.00,
    estimatedRangeMax: 720.00,
    status: 'Submitted',
    method: 'Secure Pickup',
    dateCreated: '2026-07-21'
  }
];

// Initial service orders for repairs and customs
export const INITIAL_SERVICE_ORDERS: ServiceOrder[] = [
  {
    id: 'SRV-9081',
    serviceType: 'Repair',
    itemName: 'Vintage Filigree Platinum & 18K Clasp Ring',
    status: 'In Service',
    cost: 185.00,
    dateOrdered: '2026-07-18',
    estimatedCompletion: '2026-07-25',
    notes: 'Secure unstable center stone prong. Polish shank and repair hairline fracture in yellow gold band joint.',
    timeline: [
      { status: 'Received', date: '2026-07-18', description: 'Item physically checked and logged into OneChannelAdmin vault.', active: false },
      { status: 'Inspected', date: '2026-07-19', description: 'Master jeweler analyzed structure under 20x microscope.', active: false },
      { status: 'Approved', date: '2026-07-19', description: 'Customer approved repair estimate of $185.00.', active: false },
      { status: 'In Service', date: '2026-07-21', description: 'Micro-laser welding active. Precision reshaping in progress.', active: true },
      { status: 'Quality Check', date: 'Pending', description: 'Ultrasonic testing and structural stress assay.', active: false }
    ]
  },
  {
    id: 'SRV-9122',
    serviceType: 'Custom Design',
    itemName: 'Bespoke Art Deco Wedding Band (18K & Baguettes)',
    status: 'Estimate Pending',
    cost: 2400.00,
    dateOrdered: '2026-07-22',
    estimatedCompletion: '2026-08-15',
    notes: 'Custom CAD design phase. Customer provided heirloom diamonds to mount in geometric pattern.',
    timeline: [
      { status: 'Received', date: '2026-07-22', description: 'Heirloom gems weighed and inspected under digital XRF.', active: false },
      { status: 'Estimate Pending', date: '2026-07-22', description: 'Detailed CAD rendering with gold mass simulation.', active: true }
    ]
  }
];

// Document records
export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'DOC-1120',
    title: 'XRF Metallurgical Assay Certificate #YUK-8820',
    category: 'Appraisal',
    date: '2026-07-15',
    signed: true,
    docUrl: '#'
  },
  {
    id: 'DOC-1092',
    title: 'Pawn Secured Collateral Agreement LN-004921',
    category: 'Pawn Agreement',
    date: '2026-06-15',
    signed: true,
    docUrl: '#'
  },
  {
    id: 'DOC-1150',
    title: 'Pre-appraisal Intake Receipt SL-8920',
    category: 'Bill of Sale',
    date: '2026-07-21',
    signed: false,
    docUrl: '#'
  }
];

// Storage records
export const INITIAL_STORAGE: StorageRecord[] = [
  {
    id: 'STR-0029',
    itemId: 'STR-ITEM-402',
    itemName: 'Fine gold bullion bars collection (3 x 100g)',
    vaultLocation: 'OneGold Zurich Central Vault - Swiss',
    binNumber: 'ZUR-B-492',
    sealNumber: 'SEAL-CH-9921004',
    insuranceValue: 24500.00,
    lastVerifiedDate: '2026-07-10',
    status: 'Secured'
  },
  {
    id: 'STR-0030',
    itemId: 'STR-ITEM-881',
    itemName: 'Rare Antique Gold Coins (Sovereigns - 12pcs)',
    vaultLocation: 'OneGold NYC Manhattan Safe Vault',
    binNumber: 'NYC-A-108',
    sealNumber: 'SEAL-US-2011492',
    insuranceValue: 12800.00,
    lastVerifiedDate: '2026-07-19',
    status: 'Secured'
  }
];

// Frequently Asked Questions
export const FAQS = [
  {
    question: 'How do you accurately test and value my gold?',
    answer: 'We employ state-of-the-art laboratory testing techniques, including X-Ray Fluorescence (XRF) spectroscopy, hydrostatic density testing, and traditional fire assay. This ensures we identify precise metallurgical purity down to 0.01% without causing structural damage to jewelry.'
  },
  {
    question: 'How do gold-backed pawn loans work, and will I lose my jewelry?',
    answer: 'A gold-backed pawn loan is a non-recourse secured loan. You receive funds instantly based on the tested melt value of your gold collateral. We safely seal your items in a high-security vault (insured and tracked). If you repay the principal and finance fees by the maturity date, we return your items. Your credit score is never affected, even if you default.'
  },
  {
    question: 'Is my gold fully insured during shipping and vault storage?',
    answer: 'Yes, absolutely. All physical shipments are dispatched with specialty high-value transit insurance (up to $150,000 per package) and require signature delivery. Once in our custody, items are secured within Class-3 UL certified vaults insured fully against theft, damage, or loss by Lloyd’s of London syndicates.'
  },
  {
    question: 'How does the Auction marketplace connect to OneChannelAdmin (1CA)?',
    answer: '1CA is our underlying enterprise resource planning engine. It verifies bidder identities, holds funds securely, processes bid timestamps, creates legally binding purchase agreements, and updates live inventory logs instantly, protecting both retail bidders and institutional trade partners.'
  }
];
