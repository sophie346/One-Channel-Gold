import { useState, useMemo } from 'react';
import { ShoppingCart, Heart, ShieldAlert, BadgeCheck, Check, SlidersHorizontal, Eye, X, ArrowLeft, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types';
import { INITIAL_PRODUCTS } from '../data/mockData';

interface ShopViewProps {
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  selectedProductId: string | null;
  setSelectedProductId: (id: string | null) => void;
  searchQuery: string;
}

export default function ShopView({
  onAddToCart,
  onBuyNow,
  wishlist,
  toggleWishlist,
  selectedProductId,
  setSelectedProductId,
  searchQuery
}: ShopViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedKarat, setSelectedKarat] = useState<string>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(5000);
  const [sortBy, setSortBy] = useState<string>('featured');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Find selected product
  const selectedProduct = useMemo(() => {
    if (!selectedProductId) return null;
    return INITIAL_PRODUCTS.find(p => p.id === selectedProductId || p.slug === selectedProductId) || null;
  }, [selectedProductId]);

  // Categories list
  const categories = [
    { label: 'All Catalog', value: 'all' },
    { label: 'Rings', value: 'rings' },
    { label: 'Chains', value: 'chains' },
    { label: 'Necklaces', value: 'necklaces' },
    { label: 'Bracelets', value: 'bracelets' },
    { label: 'Coins', value: 'coins' },
    { label: 'Bars', value: 'bars' },
    { label: 'Estate / Antique', value: 'antique' },
  ];

  // Filters logic
  const filteredProducts = useMemo(() => {
    return INITIAL_PRODUCTS.filter((product) => {
      // Search matches
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(query);
        const matchesDesc = product.description.toLowerCase().includes(query);
        const matchesKarat = product.karat.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesKarat) return false;
      }

      // Category matches
      if (activeCategory !== 'all' && product.category !== activeCategory) return false;

      // Karat matches
      if (selectedKarat !== 'all' && product.karat !== selectedKarat) return false;

      // Color matches
      if (selectedColor !== 'all' && product.metalColor !== selectedColor) return false;

      // Condition matches
      if (selectedCondition !== 'all' && product.condition !== selectedCondition) return false;

      // Price matches
      if (product.price > priceRange) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'weight-desc') return b.weight - a.weight;
      return 0; // featured
    });
  }, [activeCategory, selectedKarat, selectedColor, selectedCondition, priceRange, sortBy, searchQuery]);

  return (
    <div className="py-8">
      {selectedProduct ? (
        /* Product Details Screen */
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <button
            onClick={() => setSelectedProductId(null)}
            className="flex items-center gap-2 text-xs font-bold text-[#AEB4C0] hover:text-[#C8A45D] uppercase tracking-widest mb-8 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Store
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-[#11141A] border border-white/10 rounded-xl p-6 md:p-10">
            {/* Image Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square bg-[#080A0D] rounded-sm overflow-hidden border border-white/10 relative group">
                <img
                  src={selectedProduct.image}
                  alt={selectedProduct.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 text-[9px] uppercase bg-[#C8A45D] text-black font-black px-2.5 py-1 rounded-sm tracking-widest">
                  {selectedProduct.karat} Pure
                </span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div className="aspect-square bg-[#080A0D] border-2 border-[#C8A45D] rounded cursor-pointer overflow-hidden opacity-100">
                  <img src={selectedProduct.image} alt="alt" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </div>
                {/* Secondary details placeholders */}
                <div className="aspect-square bg-[#080A0D]/60 border border-[rgba(255,255,255,0.06)] rounded flex items-center justify-center text-[10px] text-[#AEB4C0]">20x Macro</div>
                <div className="aspect-square bg-[#080A0D]/60 border border-[rgba(255,255,255,0.06)] rounded flex items-center justify-center text-[10px] text-[#AEB4C0]">Purity Label</div>
                <div className="aspect-square bg-[#080A0D]/60 border border-[rgba(255,255,255,0.06)] rounded flex items-center justify-center text-[10px] text-[#AEB4C0]">Assay Assay</div>
              </div>
            </div>

            {/* Product Specifications */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] tracking-widest text-[#C8A45D] uppercase font-bold">{selectedProduct.category}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] uppercase tracking-wider text-[#AEB4C0]">{selectedProduct.metalColor}</span>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] uppercase bg-white/5 text-[#AEB4C0] px-2 py-0.5 rounded font-semibold">{selectedProduct.condition}</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-[#F7F4EC] tracking-tight">{selectedProduct.name}</h1>

                <p className="text-sm text-[#AEB4C0] leading-relaxed">{selectedProduct.description}</p>

                {/* Technical Assay Spec Grid */}
                <div className="bg-[#11141A] border border-[rgba(255,255,255,0.04)] rounded-lg p-5">
                  <h4 className="text-[10px] text-[#C8A45D] uppercase tracking-widest font-black mb-3">Metallurgical Breakdown</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Stated Purity</span>
                      <p className="text-sm font-bold text-[#F7F4EC]">{selectedProduct.karat} / {selectedProduct.purity}</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Net Metal Weight</span>
                      <p className="text-sm font-bold text-[#F7F4EC]">{selectedProduct.weight} grams</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Hallmark Stamp</span>
                      <p className="text-sm font-bold text-[#F7F4EC]">{selectedProduct.hallmark}</p>
                    </div>
                    {selectedProduct.size && (
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Sizing</span>
                        <p className="text-sm font-bold text-[#F7F4EC]">{selectedProduct.size}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">1CA Vault Record</span>
                      <p className="text-sm font-bold text-[#2F9D70] flex items-center gap-1">
                        <BadgeCheck className="w-3.5 h-3.5" /> SECURE-LOCKED
                      </p>
                    </div>
                    {selectedProduct.certificateNumber && (
                      <div>
                        <span className="text-[9px] uppercase tracking-wider text-[#AEB4C0]">Assay Cert ID</span>
                        <p className="text-sm font-mono text-[#E3C27A] font-bold">{selectedProduct.certificateNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Purchase Details & CTAs */}
              <div className="pt-6 border-t border-[rgba(255,255,255,0.06)] space-y-5">
                <div className="flex justify-between items-baseline">
                  <div>
                    <span className="text-[10px] uppercase text-[#AEB4C0] font-medium tracking-wider">Dynamic Valuation price</span>
                    <p className="text-4xl font-black text-[#E3C27A] mt-1">${selectedProduct.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#2F9D70] font-bold uppercase tracking-wider bg-[#2F9D70]/10 px-2 py-1 rounded">
                      Availability: {selectedProduct.availability}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => onBuyNow(selectedProduct)}
                    className="w-full bg-[#C8A45D] hover:bg-[#E3C27A] text-[#080A0D] py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-150 active:scale-98 cursor-pointer"
                  >
                    Instant Checkout
                  </button>
                  <button
                    onClick={() => onAddToCart(selectedProduct)}
                    className="w-full bg-[#11141A] border border-[rgba(255,255,255,0.08)] text-[#F7F4EC] hover:bg-white/5 hover:border-[#C8A45D] py-3 text-xs font-bold uppercase tracking-widest rounded-md transition-all duration-150 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="w-4 h-4 text-[#C8A45D]" /> Add to Cart
                  </button>
                </div>

                {/* Bullet trust factors */}
                <div className="grid grid-cols-3 gap-2.5 text-[10px] text-[#AEB4C0] pt-2">
                  <div className="flex items-center gap-1.5 bg-[#11141A] p-2 rounded border border-[rgba(255,255,255,0.02)]">
                    <ShieldCheck className="w-4 h-4 text-[#C8A45D]" />
                    <span>Insured Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#11141A] p-2 rounded border border-[rgba(255,255,255,0.02)]">
                    <Truck className="w-4 h-4 text-[#C8A45D]" />
                    <span>Next-Day Dispatch</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#11141A] p-2 rounded border border-[rgba(255,255,255,0.02)]">
                    <BadgeCheck className="w-4 h-4 text-[#C8A45D]" />
                    <span>Lobby-Pick Available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Store Catalog Screen */
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-[#C8A45D] font-extrabold block mb-1">Authenticated Bullion &amp; Jewelry</span>
              <h2 className="text-3xl font-black text-[#F7F4EC] tracking-tight">Certified Gold, Designed to Last</h2>
            </div>

            {/* Category horizontal bar */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setActiveCategory(cat.value)}
                  className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
                    activeCategory === cat.value
                      ? 'bg-[#C8A45D]/10 border-[#C8A45D] text-[#E3C27A] font-bold'
                      : 'bg-[#171A21] border-[rgba(255,255,255,0.06)] text-[#AEB4C0] hover:border-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Filter Panel (Desktop sidebar / mobile modal toggled) */}
            <div className={`lg:col-span-3 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
              <div className="flex justify-between items-center pb-4 border-b border-[rgba(255,255,255,0.06)]">
                <span className="text-xs font-bold text-[#F7F4EC] uppercase tracking-wider">Assay Filtering</span>
                <SlidersHorizontal className="w-4 h-4 text-[#C8A45D]" />
              </div>

              {/* Karat filter */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#AEB4C0] uppercase tracking-widest font-bold">Karat Purity</label>
                <select
                  value={selectedKarat}
                  onChange={(e) => setSelectedKarat(e.target.value)}
                  className="w-full bg-[#080A0D] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                >
                  <option value="all">All Purities</option>
                  <option value="24K">24K (99.9%)</option>
                  <option value="22K">22K (91.6%)</option>
                  <option value="18K">18K (75.0%)</option>
                  <option value="14K">14K (58.5%)</option>
                </select>
              </div>

              {/* Color filter */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#AEB4C0] uppercase tracking-widest font-bold">Metal Color Tone</label>
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full bg-[#080A0D] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                >
                  <option value="all">All Tones</option>
                  <option value="Yellow Gold">Yellow Gold</option>
                  <option value="White Gold">White Gold</option>
                  <option value="Rose Gold">Rose Gold</option>
                  <option value="Multi-Tone">Multi-Tone</option>
                </select>
              </div>

              {/* Condition filter */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#AEB4C0] uppercase tracking-widest font-bold">Item Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full bg-[#080A0D] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                >
                  <option value="all">All Conditions</option>
                  <option value="Brand New">Brand New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Vintage">Vintage</option>
                  <option value="Estate">Estate</option>
                </select>
              </div>

              {/* Price Cap */}
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] uppercase text-[#AEB4C0] font-bold">
                  <span>Max price</span>
                  <span className="text-[#E3C27A]">${priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="500"
                  max="5000"
                  step="250"
                  value={priceRange}
                  onChange={(e) => setPriceRange(parseInt(e.target.value))}
                  className="w-full accent-[#C8A45D] cursor-pointer"
                />
              </div>

              {/* Sort selection */}
              <div className="space-y-2">
                <label className="text-[10px] text-[#AEB4C0] uppercase tracking-widest font-bold">Sorting Parameter</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-[#080A0D] border border-[rgba(255,255,255,0.08)] rounded p-2 text-xs text-[#F7F4EC] focus:border-[#C8A45D] focus:outline-none"
                >
                  <option value="featured">1CA Recommended</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="weight-desc">Mass: Heaviest First</option>
                </select>
              </div>

              {/* Reset trigger */}
              <button
                onClick={() => {
                  setSelectedKarat('all');
                  setSelectedColor('all');
                  setSelectedCondition('all');
                  setPriceRange(5000);
                  setSortBy('featured');
                }}
                className="w-full py-2 bg-white/5 hover:bg-white/10 rounded text-[11px] text-[#AEB4C0] uppercase font-bold tracking-wider transition-all cursor-pointer"
              >
                Clear Filters
              </button>
            </div>

            {/* Mobile Filters Trigger */}
            <div className="lg:hidden w-full flex justify-between gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded text-xs text-[#AEB4C0]"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#C8A45D]" />
                {showFilters ? 'Hide Filters' : 'Assay Filters'}
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded p-2 text-xs text-[#AEB4C0] focus:outline-none"
              >
                <option value="featured">Recommended</option>
                <option value="price-asc">Price: Low-High</option>
                <option value="price-desc">Price: High-Low</option>
              </select>
            </div>

            {/* Product Grid Area */}
            <div className="lg:col-span-9">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => {
                    const isWishlisted = wishlist.includes(product.id);
                    return (
                      <div
                        key={product.id}
                        className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden flex flex-col justify-between group hover:border-[#C8A45D]/50 transition-all duration-300"
                      >
                        {/* Image top */}
                        <div className="aspect-square bg-[#080A0D] overflow-hidden relative">
                          <img
                            src={product.image}
                            alt={product.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* absolute badges */}
                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                            <span className="text-[9px] uppercase bg-[#C8A45D] text-[#080A0D] font-extrabold px-2 py-0.5 rounded tracking-wider">
                              {product.karat} Pure
                            </span>
                            <span className="text-[9px] uppercase bg-[#11141A]/90 text-[#AEB4C0] font-semibold px-2 py-0.5 rounded tracking-wide border border-white/5">
                              {product.weight}g
                            </span>
                          </div>

                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute top-2.5 right-2.5 p-2 bg-[#080A0D]/75 backdrop-blur-sm rounded-full border border-[rgba(255,255,255,0.08)] hover:bg-[#C8A45D]/10 hover:border-[#C8A45D] group-2"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#C85A5A] stroke-[#C85A5A]' : 'text-[#AEB4C0]'}`} />
                          </button>
                        </div>

                        {/* Text body */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="text-[9px] font-bold text-[#C8A45D] uppercase tracking-wider">{product.category}</span>
                              <span className="text-[9px] font-semibold text-[#AEB4C0] uppercase">{product.metalColor}</span>
                            </div>
                            <h3
                              onClick={() => setSelectedProductId(product.id)}
                              className="text-sm font-bold text-[#F7F4EC] tracking-tight hover:text-[#E3C27A] transition-colors cursor-pointer line-clamp-1"
                            >
                              {product.name}
                            </h3>
                            <p className="text-[11px] text-[#AEB4C0]/75 line-clamp-2 leading-relaxed">{product.description}</p>
                          </div>

                          <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                            <div>
                              <span className="text-[9px] text-[#AEB4C0] uppercase">Melt price index</span>
                              <p className="text-base font-black text-[#E3C27A]">${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>

                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setSelectedProductId(product.id)}
                                className="p-2 bg-white/5 hover:bg-[#C8A45D]/10 hover:text-[#C8A45D] rounded text-[#AEB4C0] transition-all cursor-pointer border border-transparent hover:border-[#C8A45D]/30"
                                title="Quick View"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onAddToCart(product)}
                                className="p-2 bg-[#C8A45D] hover:bg-[#E3C27A] rounded text-[#080A0D] transition-all cursor-pointer"
                                title="Add to Cart"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl space-y-3">
                  <ShieldAlert className="w-8 h-8 text-[#D29B3C] mx-auto" />
                  <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">No physical assets match</h3>
                  <p className="text-xs text-[#AEB4C0] max-w-sm mx-auto">Try widening your price margins or select another karat purity factor to view matching certified gold inventory.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
