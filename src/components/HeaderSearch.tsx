'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { globalSearch, type GlobalSearchExtra, type GlobalSearchHit } from '@/services/productService';
import { getProductImages, slugify } from '@/utils/mapProduct';
import type { ApiProduct } from '@/types/apiProduct';

const DEBOUNCE_MS = 300;
const MIN_QUERY = 3;

function productTitle(product: GlobalSearchHit) {
  return String(product.website_title || product.title || product.name || product.sku || product.osku || 'Product');
}

function productSku(product: GlobalSearchHit) {
  return String(product.sku || product.osku || '').trim();
}

function productSlug(product: GlobalSearchHit) {
  const sku = productSku(product);
  const title = productTitle(product);
  return String(product.slug || '').trim() || slugify(sku || title);
}

function productImage(product: GlobalSearchHit) {
  const fromImages = getProductImages(product as ApiProduct);
  if (fromImages[0]) return fromImages[0];
  if (typeof product.image === 'string') return product.image;
  return '';
}

interface HeaderSearchProps {
  onClose: () => void;
  onViewAll: (text: string) => void;
  onSelectCategory?: (name: string) => void;
}

export default function HeaderSearch({ onClose, onViewAll, onSelectCategory }: HeaderSearchProps) {
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<GlobalSearchHit[]>([]);
  const [categories, setCategories] = useState<GlobalSearchExtra[]>([]);
  const [brands, setBrands] = useState<GlobalSearchExtra[]>([]);
  const [searched, setSearched] = useState(false);

  const hasSuggestions = products.length > 0 || categories.length > 0 || brands.length > 0;

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const runSearch = (value: string) => {
    const q = value.trim();
    if (q.length < MIN_QUERY) {
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setLoading(false);
      setSearched(false);
      return;
    }

    const id = ++requestIdRef.current;
    setLoading(true);
    setSearched(true);
    globalSearch(q)
      .then((result) => {
        if (id !== requestIdRef.current) return;
        if (result?.error) {
          setProducts([]);
          setCategories([]);
          setBrands([]);
          setLoading(false);
          return;
        }
        const list = Array.isArray(result?.data) ? result.data : [];
        const extras = Array.isArray(result?.extra) ? result.extra : [];
        setProducts(list);
        setCategories(extras.filter((e) => e.type === 'category'));
        setBrands(extras.filter((e) => e.type === 'brand'));
        setLoading(false);
      })
      .catch(() => {
        if (id !== requestIdRef.current) return;
        setProducts([]);
        setCategories([]);
        setBrands([]);
        setLoading(false);
      });
  };

  const onInputChange = (next: string) => {
    setQuery(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (next.trim().length < MIN_QUERY) {
      requestIdRef.current += 1;
      setProducts([]);
      setCategories([]);
      setBrands([]);
      setLoading(false);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => runSearch(next), DEBOUNCE_MS);
  };

  const openProduct = (product: GlobalSearchHit) => {
    const slug = productSlug(product);
    const sku = productSku(product);
    const path = `/buy/${encodeURIComponent(slug)}${sku ? `?sku=${encodeURIComponent(sku)}` : ''}`;
    onClose();
    router.push(path);
  };

  const openCategory = (name: string) => {
    if (onSelectCategory) onSelectCategory(name);
    else {
      onClose();
      router.push(`/buy?categories=${encodeURIComponent(name)}`);
    }
  };

  return (
    <div className="relative">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const text = query.trim();
          if (!text) return;
          onViewAll(text);
        }}
      >
        <input
          autoFocus
          type="search"
          placeholder="Search gold, jewelry, SKU..."
          value={query}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          onChange={(e) => onInputChange(e.target.value)}
          className="w-full bg-[#111] border border-white/10 rounded-xl text-[16px] text-white px-4 py-3.5 pr-12 focus:outline-none focus:border-[#C5A059]/50 placeholder-[#6B7280]"
        />
        {query ? (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              setProducts([]);
              setCategories([]);
              setBrands([]);
              setSearched(false);
              setLoading(false);
              if (debounceRef.current) clearTimeout(debounceRef.current);
            }}
            className="absolute right-4 top-3.5 text-[#9CA3AF] hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        ) : (
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C5A059] w-5 h-5 pointer-events-none" />
        )}
      </form>

      {(loading || searched) && (
        <div className="mt-3 bg-[#171A21] border border-white/10 rounded-xl max-h-[min(420px,60vh)] overflow-y-auto">
          {loading && (
            <div className="p-8 flex items-center justify-center text-[#AEB4C0]">
              <Loader2 className="w-6 h-6 animate-spin text-[#C8A45D]" />
            </div>
          )}

          {!loading && products.length > 0 && (
            <div className="p-3 border-b border-white/5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#AEB4C0] px-2 mb-2">
                Products
              </p>
              <div className="space-y-1">
                {products.slice(0, 8).map((product, idx) => {
                  const sku = productSku(product);
                  const title = productTitle(product);
                  const img = productImage(product);
                  return (
                    <button
                      key={sku || `${title}-${idx}`}
                      type="button"
                      onClick={() => openProduct(product)}
                      className="w-full flex gap-3 p-2 rounded-lg hover:bg-white/5 text-left cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-lg bg-[#080A0D] overflow-hidden shrink-0 border border-white/5">
                        {img ? (
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[#F7F4EC] line-clamp-2">{title}</p>
                        {sku ? <p className="text-[11px] text-[#AEB4C0] mt-0.5 truncate">{sku}</p> : null}
                      </div>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => onViewAll(query.trim())}
                className="mt-2 w-full text-center text-xs font-bold text-[#C8A45D] hover:text-[#E3C27A] py-2 cursor-pointer"
              >
                View all results for “{query.trim()}”
              </button>
            </div>
          )}

          {!loading && categories.length > 0 && (
            <div className="p-3 border-b border-white/5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#AEB4C0] px-2 mb-2">
                Categories
              </p>
              {categories.map((cat) => (
                <button
                  key={String(cat.id || cat.name)}
                  type="button"
                  onClick={() => openCategory(String(cat.name || ''))}
                  className="block w-full text-left px-2 py-2 rounded-lg text-sm font-semibold text-[#F7F4EC] hover:bg-white/5 cursor-pointer"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {!loading && brands.length > 0 && (
            <div className="p-3">
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#AEB4C0] px-2 mb-2">
                Brands
              </p>
              {brands.map((brand) => (
                <button
                  key={String(brand.name)}
                  type="button"
                  onClick={() => onViewAll(String(brand.name || query.trim()))}
                  className="block w-full text-left px-2 py-2 rounded-lg text-sm font-semibold text-[#F7F4EC] hover:bg-white/5 cursor-pointer"
                >
                  {brand.name}
                </button>
              ))}
            </div>
          )}

          {!loading && !hasSuggestions && searched && (
            <div className="p-6 text-sm text-[#AEB4C0] text-center">No matches found</div>
          )}
        </div>
      )}
    </div>
  );
}
