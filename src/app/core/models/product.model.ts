export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  imageUrl?: string;
  additionalImages?: string[];
  categoryId?: number;
  categoryName?: string;
  active: boolean;
  featured: boolean;
  rating?: number;
  reviewCount?: number;
  discountPrice?: number;
  effectivePrice: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
  parentName?: string;
  active: boolean;
  subcategories?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductSearchCriteria {
  keyword?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
}
