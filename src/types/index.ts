export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  avatar?: string | null;
  role: "CUSTOMER" | "ADMIN" | "SUPER_ADMIN";
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  sortOrder: number;
  _count?: { products: number };
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

export interface ProductVariant {
  id: string;
  size: string;
  stock: number;
  sku?: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number | null;
  sku?: string | null;
  categoryId: string;
  category: Category;
  isActive: boolean;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  tags: string[];
  weight: number;
  totalStock: number;
  soldCount: number;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews?: Review[];
  _count?: { reviews: number };
  averageRating?: number;
  createdAt: string;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string;
  quantity: number;
  product: Product;
  variant: ProductVariant;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  street: string;
  isDefault: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  subtotal: number;
  product: Product;
  variant: ProductVariant;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  couponId?: string | null;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  total: number;
  status: OrderStatus;
  notes?: string | null;
  trackingNumber?: string | null;
  shippingMethod?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: User;
  address: Address;
  items: OrderItem[];
  payment?: Payment | null;
}

export type OrderStatus =
  | "PENDING"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface Payment {
  id: string;
  orderId: string;
  transactionId?: string | null;
  method: string;
  status: "PENDING" | "SUCCESS" | "FAILED" | "EXPIRED" | "REFUNDED";
  amount: number;
  snapToken?: string | null;
  snapRedirectUrl?: string | null;
  paidAt?: string | null;
}

export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  isActive: boolean;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment?: string | null;
  isVerified: boolean;
  createdAt: string;
  user: Pick<User, "id" | "name" | "avatar">;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "oldest" | "price_asc" | "price_desc" | "popular";
  page?: number;
  limit?: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
}
