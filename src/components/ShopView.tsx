'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingCart, Heart, ShieldAlert, SlidersHorizontal, Eye, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { useAppDispatch } from '@/store/hooks';
import { addToCart } from '@/store/cartSlice';
import { productSearch } from '@/services/productService';
import { mapApiProductToProduct } from '@/utils/mapProduct';

interface ShopViewProps {
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  searchQuery: string;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const CATEGORIES = [
  { label: 'All Catalog', value: 'all' },
  { label: 'Rings', value: 'rings' },
  { label: 'Chains', value: 'chains' },
  { label: 'Necklaces', value: 'necklaces' },
  { label: 'Bracelets', value: 'bracelets' },
  { label: 'Earrings', value: 'earrings' },
  { label: 'Pendants', value: 'pendants' },
  { label: 'Coins', value: 'coins' },
  { label: 'Bars', value: 'bars' },
  { label: 'Estate / Antique', value: 'antique' },
];

export default function ShopView({
  wishlist,
  toggleWishlist,
  searchQuery,
  onShowNotification,
}: ShopViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [selectedKarat, setSelectedKarat] = useState(searchParams.get('karat') || 'all');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || 'all');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || 'all');
  const [priceRange, setPriceRange] = useState(Number(searchParams.get('maxPrice')) || 10000);
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [showFilters, setShowFilters] = useState(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const syncUrl = useCallback(
    (next: {
      category?: string;
      karat?: string;
      color?: string;
      condition?: string;
      maxPrice?: number;
      sort?: string;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      const setOrDelete = (key: string, value: string, emptyValues: string[]) => {
        if (!value || emptyValues.includes(value)) params.delete(key);
        else params.set(key, value);
      };

      setOrDelete('category', next.category ?? activeCategory, ['all']);
      setOrDelete('karat', next.karat ?? selectedKarat, ['all']);
      setOrDelete('color', next.color ?? selectedColor, ['all']);
      setOrDelete('condition', next.condition ?? selectedCondition, ['all']);
      setOrDelete('sort', next.sort ?? sortBy, ['featured']);

      const max = next.maxPrice ?? priceRange;
      if (max < 10000) params.set('maxPrice', String(max));
      else params.delete('maxPrice');

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      searchParams,
      activeCategory,
      selectedKarat,
      selectedColor,
      selectedCondition,
      sortBy,
      priceRange,
      pathname,
      router,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      const sortprice =
        sortBy === 'price-asc' ? 'asc' : sortBy === 'price-desc' ? 'desc' : '';

      const result = await productSearch({
        page: 0,
        limit: 48,
        text: searchQuery || '',
        category: activeCategory !== 'all' ? activeCategory : '',
        maxPrice: priceRange < 10000 ? priceRange : '',
        sortprice: sortprice as 'asc' | 'desc' | '',
        showcount: true,
      });

      if (cancelled) return;

      if (result.error) {
        setProducts([]);
        setTotalProducts(0);
        setError(result.message || 'Failed to load products');
        setLoading(false);
        return;
      }

      setProducts(result.productsList.map(mapApiProductToProduct));
      setTotalProducts(result.totalProducts);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [searchQuery, activeCategory, priceRange, sortBy]);

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (selectedKarat !== 'all') {
          const want = selectedKarat.toUpperCase();
          if (product.karat.toUpperCase() !== want) return false;
        }
        if (selectedColor !== 'all' && product.metalColor !== selectedColor) return false;
        if (selectedCondition !== 'all' && product.condition !== selectedCondition) return false;
        if (product.price > priceRange) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'weight-desc') return b.weight - a.weight;
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedKarat, selectedColor, selectedCondition, priceRange, sortBy]);

  const openProduct = (product: Product) => {
    const slug = product.slug || product.sku || product.osku || product.id;
    const sku = product.sku || product.osku || '';
    const path = `/buy/${encodeURIComponent(slug)}${
      sku ? `?sku=${encodeURIComponent(sku)}` : ''
    }`;
    router.push(path);
  };

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart(product));
    onShowNotification?.(`${product.name} added to cart.`, 'success');
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setSelectedKarat('all');
    setSelectedColor('all');
    setSelectedCondition('all');
    setPriceRange(10000);
    setSortBy('featured');
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="mb-6">
          <p className="text-[12px] uppercase tracking-[0.18em] text-[#C8A45D] font-semibold mb-2">Market</p>
          <h1 className="font-serif text-3xl md:text-4xl text-white font-medium">Buy Verified Gold</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-3 space-y-5 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-[#F7F4EC] uppercase tracking-widest">Assay Filtering</h3>
                <SlidersHorizontal className="w-4 h-4 text-[#C8A45D]" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Category</label>
                <select
                  value={activeCategory}
                  onChange={(e) => {
                    setActiveCategory(e.target.value);
                    syncUrl({ category: e.target.value });
                  }}
                  className="w-full bg-[#11141A] border border-white/10 rounded p-2.5 text-sm text-[#F7F4EC] focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Karat Purity</label>
                <select
                  value={selectedKarat}
                  onChange={(e) => {
                    setSelectedKarat(e.target.value);
                    syncUrl({ karat: e.target.value });
                  }}
                  className="w-full bg-[#11141A] border border-white/10 rounded p-2.5 text-sm text-[#F7F4EC] focus:outline-none"
                >
                  <option value="all">All Purities</option>
                  <option value="24K">24K</option>
                  <option value="22K">22K</option>
                  <option value="18K">18K</option>
                  <option value="14K">14K</option>
                  <option value="925">Sterling (925)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Metal Color Tone</label>
                <select
                  value={selectedColor}
                  onChange={(e) => {
                    setSelectedColor(e.target.value);
                    syncUrl({ color: e.target.value });
                  }}
                  className="w-full bg-[#11141A] border border-white/10 rounded p-2.5 text-sm text-[#F7F4EC] focus:outline-none"
                >
                  <option value="all">All Tones</option>
                  <option value="Yellow Gold">Yellow Gold</option>
                  <option value="White Gold">White Gold</option>
                  <option value="Rose Gold">Rose Gold</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Item Condition</label>
                <select
                  value={selectedCondition}
                  onChange={(e) => {
                    setSelectedCondition(e.target.value);
                    syncUrl({ condition: e.target.value });
                  }}
                  className="w-full bg-[#11141A] border border-white/10 rounded p-2.5 text-sm text-[#F7F4EC] focus:outline-none"
                >
                  <option value="all">All Conditions</option>
                  <option value="Brand New">Brand New</option>
                  <option value="Excellent">Excellent</option>
                  <option value="Vintage">Vintage</option>
                  <option value="Estate">Estate</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Max Price</label>
                  <span className="text-sm font-bold text-[#C8A45D]">${priceRange.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={10000}
                  step={50}
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  onMouseUp={(e) => syncUrl({ maxPrice: Number((e.target as HTMLInputElement).value) })}
                  onTouchEnd={(e) => syncUrl({ maxPrice: Number((e.target as HTMLInputElement).value) })}
                  className="w-full accent-[#C8A45D] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Sorting Parameter</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    syncUrl({ sort: e.target.value });
                  }}
                  className="w-full bg-[#11141A] border border-white/10 rounded p-2.5 text-sm text-[#F7F4EC] focus:outline-none"
                >
                  <option value="featured">1CA Recommended</option>
                  <option value="price-asc">Price: Low-High</option>
                  <option value="price-desc">Price: High-Low</option>
                  <option value="weight-desc">Weight: High-Low</option>
                </select>
              </div>

              <button
                onClick={clearFilters}
                className="w-full py-2.5 bg-[#11141A] border border-white/10 rounded text-sm text-[#AEB4C0] hover:text-white cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          </div>

          <div className="lg:hidden w-full flex justify-between gap-4 mb-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded text-sm text-[#AEB4C0]"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#C8A45D]" />
              {showFilters ? 'Hide Filters' : 'Assay Filters'}
            </button>
          </div>

          <div className="lg:col-span-9">
            {!loading && !error && (
              <p className="text-sm text-[#AEB4C0] mb-4 uppercase tracking-wider">
                Showing {filteredProducts.length}
                {totalProducts > 0 ? ` · ${totalProducts} in catalog` : ''}
              </p>
            )}

            {loading ? (
              <div className="p-16 flex flex-col items-center gap-3 text-[#AEB4C0]">
                <Loader2 className="w-8 h-8 animate-spin text-[#C8A45D]" />
                <p className="text-sm">Loading catalog…</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-xl space-y-3">
                <ShieldAlert className="w-8 h-8 text-[#D29B3C] mx-auto" />
                <h3 className="text-sm font-bold text-[#F7F4EC] uppercase">Catalog unavailable</h3>
                <p className="text-sm text-[#AEB4C0] max-w-sm mx-auto">{error}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => {
                  const isWishlisted = wishlist.includes(product.id);
                  return (
                    <div
                      key={product.id}
                      className="bg-[#171A21] border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden flex flex-col justify-between group hover:border-[#C8A45D]/50 transition-all duration-300"
                    >
                      <div className="aspect-square bg-[#080A0D] overflow-hidden relative">
                        <button type="button" onClick={() => openProduct(product)} className="w-full h-full cursor-pointer">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-[#AEB4C0]">
                              No image
                            </div>
                          )}
                        </button>
                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 pointer-events-none">
                          {product.karat && (
                            <span className="text-[13px] uppercase bg-[#C8A45D] text-[#080A0D] font-extrabold px-2 py-0.5 rounded tracking-wider">
                              {product.karat} Pure
                            </span>
                          )}
                          {product.weight > 0 && (
                            <span className="text-[13px] uppercase bg-[#11141A]/90 text-[#AEB4C0] font-semibold px-2 py-0.5 rounded tracking-wide border border-white/5">
                              {product.weight}g
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleWishlist(product.id)}
                          className="absolute top-2.5 right-2.5 p-2 bg-[#080A0D]/75 backdrop-blur-sm rounded-full border border-[rgba(255,255,255,0.08)] hover:bg-[#C8A45D]/10 hover:border-[#C8A45D] cursor-pointer"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#C85A5A] stroke-[#C85A5A]' : 'text-[#AEB4C0]'}`} />
                        </button>
                      </div>

                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[13px] font-bold text-[#C8A45D] uppercase tracking-wider">{product.category}</span>
                            <span className="text-[13px] font-semibold text-[#AEB4C0] uppercase">{product.metalColor}</span>
                          </div>
                          <h3
                            onClick={() => openProduct(product)}
                            className="text-base font-bold text-[#F7F4EC] tracking-tight hover:text-[#E3C27A] transition-colors cursor-pointer line-clamp-1"
                          >
                            {product.name}
                          </h3>
                          <p className="text-[15px] text-[#AEB4C0]/75 line-clamp-2 leading-relaxed">{product.description}</p>
                        </div>

                        <div className="pt-3 border-t border-[rgba(255,255,255,0.06)] flex justify-between items-center">
                          <div>
                            <span className="text-sm text-[#AEB4C0] uppercase">Melt price index</span>
                            <p className="text-lg font-black text-[#E3C27A]">
                              ${product.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => openProduct(product)}
                              className="p-2 bg-white/5 hover:bg-[#C8A45D]/10 hover:text-[#C8A45D] rounded text-[#AEB4C0] transition-all cursor-pointer border border-transparent hover:border-[#C8A45D]/30"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              disabled={product.availability === 'Sold'}
                              className="p-2 bg-[#C8A45D] hover:bg-[#E3C27A] disabled:opacity-40 rounded text-[#080A0D] transition-all cursor-pointer"
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
                <p className="text-sm text-[#AEB4C0] max-w-sm mx-auto">
                  Try clearing filters or widening the max price.
                </p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[12px] font-semibold text-[#C8A45D] cursor-pointer"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
