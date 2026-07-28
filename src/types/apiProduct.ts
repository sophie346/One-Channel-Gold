/** Raw product shape returned by POST /prod (oneauto BFF). */
export interface ApiProductImage {
  url?: string;
  thumb?: string;
  type?: string;
  label?: string[] | null;
}

export interface ApiProduct {
  osku?: string;
  sku?: string;
  mpn?: string;
  price?: number;
  compareAtPrice?: number | null;
  website_title?: string;
  title?: string;
  description?: string;
  slug?: string;
  brand?: string;
  quantity?: number;
  outofstock?: boolean | string;
  attributes?: Record<string, unknown> | null;
  images?: Array<ApiProductImage | string> | null;
  specifications?: Record<string, unknown> | null;
  [key: string]: unknown;
}

export interface ProductSearchParams {
  page?: number;
  limit?: number;
  slug?: string;
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
