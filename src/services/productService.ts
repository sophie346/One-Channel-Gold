import { PRODUCT_BASE_URL, CLIENT_NAME } from '@/utils/constants';
import { getOneautoApiHeaders } from '@/utils/apiHeaders';
import type {
  ApiCategory,
  ApiProduct,
  CatalogCategory,
  ProductSearchParams,
  ProductSearchResult,
} from '@/types/apiProduct';
import { bffRequest } from '@/services/bffClient';

function toCategoryValues(category?: string | string[]): string[] {
  if (!category) return [];
  const raw = Array.isArray(category) ? category : String(category).split(',');
  return raw
    .map((s) => String(s || '').trim())
    .filter((s) => s && s.toLowerCase() !== 'all');
}

function mapApiCategory(c: ApiCategory, index: number): CatalogCategory {
  const name = String(c.display_name || c.name || '').trim();
  const id = String(c._id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `cat-${index}`);
  const subs = (c.subcategories || [])
    .map((s) => (typeof s === 'string' ? s : s?.name))
    .map((s) => String(s || '').trim())
    .filter(Boolean);
  return { id, name, subcategories: subs };
}

/** GET prod/categories — same source Seniors uses for the catalog sidebar. */
export async function fetchCategories(token?: string | null): Promise<CatalogCategory[]> {
  try {
    const data = await bffRequest<unknown>('prod/categories', {
      method: 'GET',
      extraHeaders: token ? { authorization: `Bearer ${token}` } : {},
    });
    const list = Array.isArray(data)
      ? data
      : Array.isArray((data as { categories?: unknown[] })?.categories)
        ? (data as { categories: unknown[] }).categories
        : Array.isArray((data as { data?: unknown[] })?.data)
          ? (data as { data: unknown[] }).data
          : [];
    return (list as ApiCategory[])
      .map((c, i) => mapApiCategory(c, i))
      .filter((c) => c.name);
  } catch {
    return [];
  }
}

/**
 * Catalog search — same contract as Nexus `ProductSearch`:
 * POST `{PRODUCT_BASE_URL}prod?showcount=...`
 */
export async function productSearch(
  params: ProductSearchParams = {},
  token?: string | null,
): Promise<ProductSearchResult> {
  const {
    page = 0,
    limit = 12,
    slug = '',
    sku = '',
    osku = '',
    text = '',
    category,
    minPrice = '',
    maxPrice = '',
    sortprice = '',
    showcount = true,
    customFilters = [],
  } = params;

  const filters: NonNullable<ProductSearchParams['customFilters']> = [];

  const skuVal = sku || osku;
  if (skuVal) {
    filters.push({
      name: 'sku',
      type: 'string',
      filtertype: 'Equals',
      value: skuVal,
    });
  }

  if (slug && slug !== 'product') {
    filters.push({
      name: 'attributes.slug',
      type: 'string',
      filtertype: 'Equals',
      value: slug,
    });
  }

  const categoryValues = toCategoryValues(category);
  if (categoryValues.length) {
    filters.push({
      name: 'attributes.category',
      type: 'list',
      filtertype: 'Equals',
      value: categoryValues,
    });
  }

  if (minPrice !== '' && minPrice != null && String(minPrice) !== '0') {
    filters.push({
      name: 'price',
      type: 'number',
      filtertype: 'From',
      value: minPrice,
    });
  }

  if (maxPrice !== '' && maxPrice != null && String(maxPrice) !== '10000') {
    filters.push({
      name: 'price',
      type: 'number',
      filtertype: 'To',
      value: maxPrice,
    });
  }

  if (Array.isArray(customFilters)) {
    filters.push(...customFilters);
  }

  const payload: Record<string, unknown> = {
    limit,
    page,
    text,
    filters,
    manualFilters: [],
  };

  if (sortprice && !['undefined', 'null'].includes(String(sortprice))) {
    payload.sortBy = 'price';
    payload.orderBy = sortprice;
  }

  const endpoint = `${PRODUCT_BASE_URL}prod?showcount=${showcount}`;

  try {
    if (!CLIENT_NAME) {
      return {
        productsList: [],
        totalProducts: 0,
        error: true,
        message:
          'Missing NEXT_PUBLIC_CLIENT_NAME. Set it in .env.local (same as Nexus Client_Name).',
      };
    }

    const headers = getOneautoApiHeaders(
      token ? { authorization: `Bearer ${token}` } : {},
    );

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return {
        productsList: [],
        totalProducts: 0,
        error: true,
        message: `Product search failed (${res.status})`,
      };
    }

    const data = await res.json();
    return {
      productsList: Array.isArray(data?.products) ? data.products : [],
      totalProducts: typeof data?.total === 'number' ? data.total : 0,
    };
  } catch (err) {
    return {
      productsList: [],
      totalProducts: 0,
      error: true,
      message: err instanceof Error ? err.message : 'Product search failed',
    };
  }
}

function skuCandidates(slug: string, sku?: string): string[] {
  const values = [sku, slug, slug.toUpperCase(), slug.toLowerCase()]
    .filter(Boolean)
    .map((v) => String(v).trim());
  // gold-01 → GOLD-01
  if (slug.includes('-')) {
    values.push(slug.toUpperCase());
  }
  return [...new Set(values.filter(Boolean))];
}

/**
 * Fetch a single product — mirrors Nexus productdetails/[slug]:
 * try attributes.slug, then sku (legacy osku still accepted by BFF remap).
 */
export async function getProductBySlug(
  slug: string,
  options: { sku?: string; token?: string | null } = {},
): Promise<ApiProduct | null> {
  if (!slug && !options.sku) return null;

  const token = options.token;

  if (slug && slug !== 'product') {
    const bySlug = await productSearch(
      { slug, limit: 1, page: 0, showcount: false },
      token,
    );
    if (!bySlug.error && bySlug.productsList.length) {
      return bySlug.productsList[0];
    }
  }

  for (const candidate of skuCandidates(slug || '', options.sku)) {
    const bySku = await productSearch(
      { sku: candidate, limit: 1, page: 0, showcount: false },
      token,
    );
    if (!bySku.error && bySku.productsList.length) {
      return bySku.productsList[0];
    }
  }

  // Last resort: text search (Nexus-style browse fallback)
  if (slug && slug !== 'product') {
    const byText = await productSearch(
      { text: slug.replace(/-/g, ' '), limit: 5, page: 0, showcount: false },
      token,
    );
    if (!byText.error && byText.productsList.length) {
      const exact = byText.productsList.find(
        (p) =>
          String(p.sku || p.osku || '').toLowerCase() === slug.toLowerCase(),
      );
      return exact || byText.productsList[0];
    }
  }

  return null;
}
