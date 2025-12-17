// Backend Category API tipleri
// /api/v1/categories endpoint'leri ile uyumlu

/**
 * Kategori response - Backend CategoryResponse ile uyumlu
 */
export type CategoryResponse = {
    id: number;
    name: string;
    slug: string | null;
    parent_id: number | null;
};

/**
 * Kategori ağacı - Backend CategoryWithChildrenResponse ile uyumlu
 */
export type CategoryWithChildren = CategoryResponse & {
    children: CategoryWithChildren[];
};

/**
 * Basitleştirilmiş ürün bilgisi - Backend ProductSearchResultSimple ile uyumlu
 */
export type CategoryProduct = {
    id: number;
    name: string;
    slug: string | null;
    brand: string | null;
    image_url: string | null;
    lowest_price: number | null;
    original_price: number | null;
    currency_code: string;
    in_stock: boolean;
    discount_percentage: number | null;
};

/**
 * Kategori + ürünler response - Backend CategoryWithProductsResponse ile uyumlu
 */
export type CategoryWithProductsResponse = {
    category: CategoryResponse;
    products: CategoryProduct[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
};

/**
 * Kategori ürünleri için query parametreleri
 */
export type CategoryProductsParams = {
    page?: number;
    page_size?: number;
    min_price?: number;
    max_price?: number;
    brand?: string;
    in_stock_only?: boolean;
};
