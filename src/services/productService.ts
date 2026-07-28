import { PRODUCT_BASE_URL, CLIENT_NAME } from '@/utils/constants';
import { getOneautoApiHeaders } from '@/utils/apiHeaders';
import type {
  ApiProduct,
  ProductSearchParams,
  ProductSearchResult,
} from '@/types/apiProduct';

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
    osku = '',
    text = '',
    category = '',
    minPrice = '',
    maxPrice = '',
    sortprice = '',
    showcount = true,
    customFilters = [],
  } = params;

  const filters: ProductSearchParams['customFilters'] = [];

  if (osku) {
    filters.push({
      name: 'osku',
      type: 'string',
      filtertype: 'Equals',
      value: osku,
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

  if (category && category !== 'all') {
    filters.push({
      name: 'attributes.category',
      type: 'list',
      filtertype: 'Equals',
      value: [category],
    });
  }

  if (minPrice && String(minPrice) !== '0') {
    filters.push({
      name: 'price',
      type: 'number',
      filtertype: 'From',
      value: minPrice,
    });
  }

  if (maxPrice && String(maxPrice) !== '10000') {
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

/** Fetch a single product by URL slug (and optional osku). */
export async function getProductBySlug(
  slug: string,
  options: { sku?: string; token?: string | null } = {},
): Promise<ApiProduct | null> {
  if (!slug) return null;

  const result = await productSearch(
    {
      slug,
      osku: options.sku || '',
      limit: 1,
      page: 0,
      showcount: false,
    },
    options.token,
  );

  if (result.error || !result.productsList.length) return null;
  return result.productsList[0];
}
