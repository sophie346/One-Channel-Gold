/** Raw product shape returned by POST /prod (oneauto BFF / Nexus). */
export interface ApiProductImage {
  url?: string;
  thumb?: string;
  type?: string;
  label?: string[] | null;
}

export interface ApiProduct {
  sku?: string;
  /** @deprecated Legacy alias; prefer sku */
  osku?: string;
  mpn?: string;
  price?: number;
  compareAtPrice?: number | null;
  website_title?: string;
  title?: string;
  description?: string;
  slug?: string;
  brand?: string;
  quantity?: number;
  stockQty?: number;
  outofstock?: boolean | string;
  category?: string | string[];
  attributes?: Record<string, unknown> | null;
  images?: Array<ApiProductImage | string> | null;
  specifications?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface ProductSearchParams {
  page?: number;
  limit?: number;
  slug?: string;
  sku?: string;
  /** @deprecated Prefer sku */
  osku?: string;
  text?: string;
  category?: string;
  minPrice?: string | number;
  maxPrice?: string | number;
  sortprice?: 'asc' | 'desc' | '';
  showcount?: boolean;
  customFilters?: Array<{
    name: string;
    type: string;
    filtertype: string;
    value: unknown;
  }>;
}

export interface ProductSearchResult {
  productsList: ApiProduct[];
  totalProducts: number;
  error?: boolean;
  message?: string;
}
