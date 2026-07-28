import type { Product } from '@/types';
import type { ApiProduct, ApiProductImage } from '@/types/apiProduct';

const PRODUCT_CATEGORIES: Product['category'][] = [
  'rings',
  'chains',
  'necklaces',
  'bracelets',
  'earrings',
  'pendants',
  'coins',
  'bars',
  'antique',
  'custom',
];

function attr(
  product: ApiProduct,
  ...keys: string[]
): string | number | undefined {
  const attrs = product.attributes;
  if (attrs && typeof attrs === 'object') {
    for (const key of keys) {
      const value = (attrs as Record<string, unknown>)[key];
      if (value != null && value !== '') {
        if (Array.isArray(value)) return String(value[0] ?? '');
        if (typeof value === 'string' || typeof value === 'number') return value;
      }
    }
  }
  for (const key of keys) {
    const value = product[key];
    if (value != null && value !== '' && (typeof value === 'string' || typeof value === 'number')) {
      return value;
    }
  }
  return undefined;
}

function imageUrl(image: ApiProductImage | string | undefined): string {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || image.thumb || '';
}

export function getProductImages(product: ApiProduct): string[] {
  const images = product.images;
  if (!Array.isArray(images)) return [];
  return images
    .filter((img) => {
      if (typeof img === 'string') return Boolean(img);
      return img && (!img.type || img.type !== 'pdf') && Boolean(img.url || img.thumb);
    })
    .map((img) => imageUrl(img as ApiProductImage | string))
    .filter(Boolean);
}

function normalizeCategory(raw: unknown): Product['category'] {
  const value = String(raw || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
  if (PRODUCT_CATEGORIES.includes(value as Product['category'])) {
    return value as Product['category'];
  }
  if (value.includes('ring')) return 'rings';
  if (value.includes('chain')) return 'chains';
  if (value.includes('necklace')) return 'necklaces';
  if (value.includes('bracelet')) return 'bracelets';
  if (value.includes('earring')) return 'earrings';
  if (value.includes('pendant')) return 'pendants';
  if (value.includes('coin')) return 'coins';
  if (value.includes('bar')) return 'bars';
  if (value.includes('antique') || value.includes('estate')) return 'antique';
  return 'custom';
}

function normalizeMetalColor(raw: unknown): Product['metalColor'] {
  const value = String(raw || '').toLowerCase();
  if (value.includes('white')) return 'White Gold';
  if (value.includes('rose') || value.includes('pink')) return 'Rose Gold';
  if (value.includes('multi')) return 'Multi-Tone';
  return 'Yellow Gold';
}

function normalizeCondition(raw: unknown): Product['condition'] {
  const value = String(raw || '').toLowerCase();
  if (value.includes('excellent')) return 'Excellent';
  if (value.includes('vintage')) return 'Vintage';
  if (value.includes('estate')) return 'Estate';
  return 'Brand New';
}

function normalizeAvailability(product: ApiProduct): Product['availability'] {
  const out =
    product.outofstock === true ||
    product.outofstock === 'True' ||
    product.outofstock === 'true' ||
    Number(product.quantity) === 0;
  return out ? 'Sold' : 'In Stock';
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Map oneauto BFF product → Gold storefront `Product`. */
export function mapApiProductToProduct(api: ApiProduct): Product {
  const images = getProductImages(api);
  const title =
    String(api.website_title || api.title || attr(api, 'title') || api.osku || 'Product');
  const slugFromAttrs = attr(api, 'slug');
  const slug =
    String(api.slug || slugFromAttrs || '').trim() ||
    slugify(String(api.osku || api.sku || title));

  const karat = String(attr(api, 'karat', 'Karat', 'purity_karat') || '24K');
  const purityRaw = attr(api, 'purity', 'Purity');
  const weightRaw = attr(api, 'weight', 'Weight', 'net_weight', 'metal_weight');
  const weight = Number(weightRaw);
  const categoryRaw = attr(api, 'category', 'Category') || api.brand;

  return {
    id: String(api.osku || api.sku || slug),
    slug,
    name: title,
    category: normalizeCategory(categoryRaw),
    karat,
    weight: Number.isFinite(weight) ? weight : 0,
    purity: String(purityRaw || ''),
    hallmark: String(attr(api, 'hallmark', 'Hallmark', 'certificate') || ''),
    price: Number(api.price) || 0,
    image: images[0] || '',
    images,
    description: String(
      api.description ||
        attr(api, 'description', 'Description', 'shortdescription') ||
        '',
    ),
    certificateStatus: attr(api, 'certificateStatus', 'certificate_status')
      ? 'Verified'
      : attr(api, 'certificateNumber', 'certificate_number')
        ? 'Pending'
        : 'None',
    certificateNumber: String(
      attr(api, 'certificateNumber', 'certificate_number', 'certificate') || '',
    ) || undefined,
    availability: normalizeAvailability(api),
    metalColor: normalizeMetalColor(attr(api, 'metalColor', 'metal_color', 'color', 'tone')),
    condition: normalizeCondition(attr(api, 'condition', 'Condition')),
    size: String(attr(api, 'size', 'Size') || '') || undefined,
    osku: api.osku,
    sku: api.sku,
    brand: api.brand ? String(api.brand) : undefined,
    compareAtPrice:
      api.compareAtPrice != null ? Number(api.compareAtPrice) : null,
  };
}
