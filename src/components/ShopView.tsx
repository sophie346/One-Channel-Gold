'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ShoppingCart, Heart, ShieldAlert, SlidersHorizontal, Eye, Loader2, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { Product } from '../types';
import { useAppDispatch } from '@/store/hooks';
import { addProductToCart } from '@/store/cartSlice';
import { productSearch, fetchCategories } from '@/services/productService';
import { mapApiProductToProduct } from '@/utils/mapProduct';
import type { CatalogCategory } from '@/types/apiProduct';

interface ShopViewProps {
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  searchQuery: string;
  onShowNotification?: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

const PAGE_SIZE = 9;
/** Same ceiling Seniors uses — API treats 10000 as “no max price”. */
const PRICE_CEILING = 10000;
const PRICE_DEBOUNCE_MS = 300;

type CatalogSort = 'featured' | 'price-asc' | 'price-desc' | 'weight-desc';

function parsePage(raw: string | null) {
  const n = Number(raw);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

function parseMaxPrice(raw: string | null): number {
  if (!raw) return PRICE_CEILING;
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) return PRICE_CEILING;
  return Math.min(Math.floor(n), PRICE_CEILING);
}

function parseSort(raw: string | null): CatalogSort {
  if (raw === 'price-asc' || raw === 'asc' || raw === 'price-low') return 'price-asc';
  if (raw === 'price-desc' || raw === 'desc' || raw === 'price-high') return 'price-desc';
  if (raw === 'weight-desc') return 'weight-desc';
  return 'featured';
}

function sortToApi(sortBy: CatalogSort): '' | 'asc' | 'desc' {
  if (sortBy === 'price-asc') return 'asc';
  if (sortBy === 'price-desc') return 'desc';
  return '';
}

function parseCategoriesParam(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => {
      try {
        return decodeURIComponent(s.trim());
      } catch {
        return s.trim();
      }
    })
    .filter(Boolean);
}

function namesEqual(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function createUrlSlug(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

function matchCategoryName(categories: CatalogCategory[], slugOrName?: string | null) {
  if (!slugOrName || slugOrName === 'all') return '';
  const decoded = (() => {
    try {
      return decodeURIComponent(slugOrName);
    } catch {
      return slugOrName;
    }
  })();
  const found =
    categories.find((c) => c.id === decoded) ||
    categories.find((c) => namesEqual(c.name, decoded)) ||
    categories.find((c) => createUrlSlug(c.name) === createUrlSlug(decoded)) ||
    categories.find((c) =>
      c.subcategories.some((s) => namesEqual(s, decoded) || createUrlSlug(s) === createUrlSlug(decoded))
    );
  if (!found) return decoded;
  const sub = found.subcategories.find(
    (s) => namesEqual(s, decoded) || createUrlSlug(s) === createUrlSlug(decoded)
  );
  return sub || found.name;
}

function buildPageNumbers(current: number, total: number): Array<number | 'ellipsis'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: Array<number | 'ellipsis'> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('ellipsis');
  pages.push(total);
  return pages;
}

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

  const [selectedCategories, setSelectedCategories] = useState<string[]>(() => {
    const fromMulti = parseCategoriesParam(searchParams.get('categories'));
    if (fromMulti.length) return fromMulti;
    const single = searchParams.get('category');
    return single && single !== 'all' ? [single] : [];
  });
  const [selectedKarat, setSelectedKarat] = useState(searchParams.get('karat') || 'all');
  const [selectedColor, setSelectedColor] = useState(searchParams.get('color') || 'all');
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get('condition') || 'all');
  const [priceRange, setPriceRange] = useState(() => parseMaxPrice(searchParams.get('maxPrice')));
  const [priceDraft, setPriceDraft] = useState(() => parseMaxPrice(searchParams.get('maxPrice')));
  const [sortBy, setSortBy] = useState<CatalogSort>(() => parseSort(searchParams.get('sort')));
  const [currentPage, setCurrentPage] = useState(parsePage(searchParams.get('page')));
  const [showFilters, setShowFilters] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const [catalogCategories, setCatalogCategories] = useState<CatalogCategory[]>([]);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  const selectedCategoriesKey = selectedCategories.join('\0');
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const syncUrl = useCallback(
    (next: {
      categories?: string[];
      karat?: string;
      color?: string;
      condition?: string;
      maxPrice?: number;
      sort?: string;
      page?: number;
    }) => {
      const params = new URLSearchParams(searchParams.toString());
      const setOrDelete = (key: string, value: string, emptyValues: string[]) => {
        if (!value || emptyValues.includes(value)) params.delete(key);
        else params.set(key, value);
      };

      const cats = next.categories ?? selectedCategories;
      params.delete('category');
      if (cats.length) params.set('categories', cats.join(','));
      else params.delete('categories');

      setOrDelete('karat', next.karat ?? selectedKarat, ['all']);
      setOrDelete('color', next.color ?? selectedColor, ['all']);
      setOrDelete('condition', next.condition ?? selectedCondition, ['all']);
      setOrDelete('sort', next.sort ?? sortBy, ['featured']);

      const max = next.maxPrice ?? priceRange;
      if (max < PRICE_CEILING) params.set('maxPrice', String(max));
      else params.delete('maxPrice');

      const page = next.page ?? currentPage;
      if (page > 1) params.set('page', String(page));
      else params.delete('page');

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [
      searchParams,
      selectedCategories,
      selectedKarat,
      selectedColor,
      selectedCondition,
      sortBy,
      priceRange,
      currentPage,
      pathname,
      router,
    ],
  );

  const goToPage = useCallback(
    (page: number) => {
      const next = Math.max(1, page);
      setCurrentPage(next);
      syncUrl({ page: next });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    [syncUrl],
  );

  const resetToFirstPage = useCallback(
    (next: Parameters<typeof syncUrl>[0]) => {
      setCurrentPage(1);
      syncUrl({ ...next, page: 1 });
    },
    [syncUrl],
  );

  /** Commit max price to API + URL (Seniors-style), always returning to page 1. */
  const commitPrice = useCallback(
    (max: number) => {
      if (priceDebounceRef.current) {
        clearTimeout(priceDebounceRef.current);
        priceDebounceRef.current = null;
      }
      const next = parseMaxPrice(String(max));
      setPriceDraft(next);
      setPriceRange(next);
      setCurrentPage(1);
      syncUrl({ maxPrice: next, page: 1 });
    },
    [syncUrl],
  );

  const onPriceSliderChange = (value: number) => {
    setPriceDraft(value);
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    priceDebounceRef.current = setTimeout(() => {
      commitPrice(value);
    }, PRICE_DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories().then((list) => {
      if (cancelled) return;
      setCatalogCategories(list);
      setCategoriesLoaded(true);
      setSelectedCategories((prev) => {
        if (!prev.length) return prev;
        const resolved = prev
          .map((value) => matchCategoryName(list, value))
          .filter(Boolean);
        return resolved.length ? Array.from(new Set(resolved)) : prev;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const customFilters: Array<{
          name: string;
          type: string;
          filtertype: string;
          value: unknown;
        }> = [];
        if (selectedKarat !== 'all') {
          customFilters.push({
            name: 'attributes.purity',
            type: 'string',
            filtertype: 'Equals',
            value: selectedKarat,
          });
        }
        if (selectedColor !== 'all') {
          customFilters.push({
            name: 'specifications.color',
            type: 'string',
            filtertype: 'Equals',
            value: selectedColor,
          });
        }

        const result = await productSearch({
          page: Math.max(0, currentPage - 1),
          limit: PAGE_SIZE,
          text: debouncedSearch || '',
          category: selectedCategories.length ? selectedCategories : undefined,
          // Seniors: ceiling → 10000 so BFF skips the price To filter
          maxPrice: priceRange >= PRICE_CEILING ? 10000 : priceRange,
          sortprice: sortToApi(sortBy),
          showcount: true,
          customFilters,
        });

        if (cancelled) return;

        if (result.error) {
          setProducts([]);
          setTotalProducts(0);
          setError(result.message || 'Failed to load products');
          return;
        }

        setProducts(result.productsList.map(mapApiProductToProduct));
        setTotalProducts(result.totalProducts);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, selectedCategoriesKey, selectedKarat, selectedColor, priceRange, sortBy, currentPage]);

  const totalPages = Math.max(1, Math.ceil(totalProducts / PAGE_SIZE));

  useEffect(() => {
    if (!loading && totalProducts > 0 && currentPage > totalPages) {
      goToPage(totalPages);
    }
  }, [loading, totalProducts, currentPage, totalPages, goToPage]);

  // Condition stays client-side. Karat/color go to the API.
  // Price is filtered by API and tightened locally because BFF To-price can overshoot.
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (selectedCondition !== 'all' && product.condition !== selectedCondition) return false;
        if (priceRange < PRICE_CEILING && product.price > priceRange) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'weight-desc') return b.weight - a.weight;
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0;
      });
  }, [products, selectedCondition, priceRange, sortBy]);

  const rangeStart = totalProducts === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(currentPage * PAGE_SIZE, totalProducts);

  const openProduct = (product: Product) => {
    const slug = product.slug || product.sku || product.osku || product.id;
    const sku = product.sku || product.osku || '';
    const path = `/buy/${encodeURIComponent(slug)}${
      sku ? `?sku=${encodeURIComponent(sku)}` : ''
    }`;
    router.push(path);
  };

  const handleAddToCart = async (product: Product) => {
    const result = await dispatch(addProductToCart({ product, quantity: 1 }));
    if (addProductToCart.fulfilled.match(result)) {
      onShowNotification?.(`${product.name} added to cart.`, 'success');
    } else {
      onShowNotification?.(String(result.payload || 'Could not add to cart.'), 'error');
    }
  };

  const clearFilters = () => {
    if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
    setSelectedCategories([]);
    setSelectedKarat('all');
    setSelectedColor('all');
    setSelectedCondition('all');
    setPriceRange(PRICE_CEILING);
    setPriceDraft(PRICE_CEILING);
    setSortBy('featured');
    setCurrentPage(1);
    router.replace(pathname, { scroll: false });
  };

  const isCategorySelected = (name: string) =>
    selectedCategories.some((c) => namesEqual(c, name));

  const toggleCategory = (name: string) => {
    const exists = isCategorySelected(name);
    const next = exists
      ? selectedCategories.filter((c) => !namesEqual(c, name))
      : [...selectedCategories, name];
    setSelectedCategories(next);
    setCurrentPage(1);
    syncUrl({ categories: next, page: 1 });
  };

  const toggleExpanded = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
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
                <div className="space-y-1 max-h-[22rem] overflow-y-auto pr-1">
                  {!categoriesLoaded ? (
                    <p className="text-sm text-[#6B7280] py-1">Loading categories…</p>
                  ) : catalogCategories.length === 0 ? (
                    <p className="text-sm text-[#6B7280] py-1">No categories found</p>
                  ) : (
                    catalogCategories.map((cat) => {
                      const hasSubcats = cat.subcategories.length > 0;
                      const isExpanded = expandedCategories.has(cat.name);
                      const isSelected = isCategorySelected(cat.name);
                      return (
                        <div key={cat.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            {hasSubcats ? (
                              <button
                                type="button"
                                onClick={() => toggleExpanded(cat.name)}
                                className="shrink-0 w-4 h-4 flex items-center justify-center text-[#6B7280] hover:text-[#C8A45D] cursor-pointer"
                                aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3 h-3" />
                                ) : (
                                  <ChevronRight className="w-3 h-3" />
                                )}
                              </button>
                            ) : (
                              <span className="w-4 shrink-0" />
                            )}
                            <label className="flex items-center gap-2 cursor-pointer flex-1 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {
                                  toggleCategory(cat.name);
                                  if (hasSubcats && !isExpanded) {
                                    setExpandedCategories((prev) => new Set(prev).add(cat.name));
                                  }
                                }}
                                className="w-4 h-4 accent-[#C8A45D] rounded border-white/20 bg-[#11141A] shrink-0"
                              />
                              <span className="text-[13px] text-[#F7F4EC] truncate">{cat.name}</span>
                            </label>
                          </div>
                          {hasSubcats && isExpanded && (
                            <div className="ml-6 pl-2 border-l border-white/10 space-y-1">
                              {cat.subcategories.map((sub) => (
                                <label key={sub} className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={isCategorySelected(sub)}
                                    onChange={() => toggleCategory(sub)}
                                    className="w-4 h-4 accent-[#C8A45D] rounded border-white/20 bg-[#11141A] shrink-0"
                                  />
                                  <span className="text-[12px] text-[#AEB4C0]">{sub}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Karat Purity</label>
                <select
                  value={selectedKarat}
                  onChange={(e) => {
                    setSelectedKarat(e.target.value);
                    resetToFirstPage({ karat: e.target.value });
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
                    resetToFirstPage({ color: e.target.value });
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
                    resetToFirstPage({ condition: e.target.value });
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
                  <span className="text-sm font-bold text-[#C8A45D]">
                    {priceDraft >= PRICE_CEILING ? 'Any' : `$${priceDraft.toLocaleString()}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={PRICE_CEILING}
                  step={50}
                  value={priceDraft}
                  onChange={(e) => onPriceSliderChange(Number(e.target.value))}
                  onMouseUp={(e) => commitPrice(Number((e.target as HTMLInputElement).value))}
                  onTouchEnd={(e) => commitPrice(Number((e.target as HTMLInputElement).value))}
                  className="w-full accent-[#C8A45D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6B7280]">
                  <span>$50</span>
                  <span>${PRICE_CEILING.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] uppercase tracking-wider text-[#AEB4C0] font-bold">Sorting Parameter</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    const next = parseSort(e.target.value);
                    setSortBy(next);
                    resetToFirstPage({ sort: next });
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
                {totalProducts > 0
                  ? `Showing ${rangeStart}–${rangeEnd} of ${totalProducts}`
                  : 'Showing 0'}
                {` · ${PAGE_SIZE} per page`}
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
              <>
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

              {totalPages > 1 && (
                <nav
                  className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-6"
                  aria-label="Product pagination"
                >
                  <p className="text-sm text-[#AEB4C0]">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage <= 1 || loading}
                      onClick={() => goToPage(currentPage - 1)}
                      className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-white/10 text-sm text-[#AEB4C0] hover:text-white hover:border-[#C8A45D]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Prev
                    </button>
                    {buildPageNumbers(currentPage, totalPages).map((item, idx) =>
                      item === 'ellipsis' ? (
                        <span key={`e-${idx}`} className="px-2 text-[#6B7280]">
                          …
                        </span>
                      ) : (
                        <button
                          key={item}
                          type="button"
                          disabled={loading}
                          onClick={() => goToPage(item)}
                          className={`min-w-10 h-10 px-2 rounded-lg text-sm font-bold cursor-pointer disabled:opacity-40 ${
                            item === currentPage
                              ? 'bg-[#C8A45D] text-black'
                              : 'border border-white/10 text-[#AEB4C0] hover:text-white hover:border-[#C8A45D]/40'
                          }`}
                        >
                          {item}
                        </button>
                      )
                    )}
                    <button
                      type="button"
                      disabled={currentPage >= totalPages || loading}
                      onClick={() => goToPage(currentPage + 1)}
                      className="inline-flex items-center gap-1 h-10 px-3 rounded-lg border border-white/10 text-sm text-[#AEB4C0] hover:text-white hover:border-[#C8A45D]/40 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </nav>
              )}
              </>
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
