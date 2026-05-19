-- =============================================
-- DUTCH.IND — SQL SCHEMA (PostgreSQL)
-- Dihasilkan dari Prisma Schema untuk referensi
-- =============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS inventory_logs CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS wishlists CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS product_variants CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS accounts CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Enums
CREATE TYPE "Role"             AS ENUM ('CUSTOMER', 'ADMIN', 'SUPER_ADMIN');
CREATE TYPE "OrderStatus"      AS ENUM ('PENDING','AWAITING_PAYMENT','PAID','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED');
CREATE TYPE "PaymentStatus"    AS ENUM ('PENDING','SUCCESS','FAILED','EXPIRED','REFUNDED');
CREATE TYPE "PaymentMethod"    AS ENUM ('MIDTRANS','BANK_TRANSFER','CASH_ON_DELIVERY','STRIPE');
CREATE TYPE "InventoryAction"  AS ENUM ('RESTOCK','SALE','ADJUSTMENT','RETURN');

-- =============================================
-- USERS
-- =============================================
CREATE TABLE users (
  id             TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  email          TEXT        UNIQUE NOT NULL,
  password       TEXT,
  name           TEXT        NOT NULL,
  phone          TEXT,
  avatar         TEXT,
  role           "Role"      NOT NULL DEFAULT 'CUSTOMER',
  email_verified TIMESTAMPTZ,
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_email ON users(email);

-- =============================================
-- ACCOUNTS (NextAuth OAuth)
-- =============================================
CREATE TABLE accounts (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id             TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                TEXT NOT NULL,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  refresh_token       TEXT,
  access_token        TEXT,
  expires_at          INT,
  token_type          TEXT,
  scope               TEXT,
  id_token            TEXT,
  session_state       TEXT,
  UNIQUE(provider, provider_account_id)
);

-- =============================================
-- SESSIONS (NextAuth)
-- =============================================
CREATE TABLE sessions (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  session_token TEXT        UNIQUE NOT NULL,
  user_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL
);

-- =============================================
-- ADDRESSES
-- =============================================
CREATE TABLE addresses (
  id             TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id        TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label          TEXT        NOT NULL DEFAULT 'Rumah',
  recipient_name TEXT        NOT NULL,
  phone          TEXT        NOT NULL,
  province       TEXT        NOT NULL,
  city           TEXT        NOT NULL,
  district       TEXT        NOT NULL,
  postal_code    TEXT        NOT NULL,
  street         TEXT        NOT NULL,
  is_default     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- =============================================
-- CATEGORIES
-- =============================================
CREATE TABLE categories (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name        TEXT        NOT NULL,
  slug        TEXT        UNIQUE NOT NULL,
  description TEXT,
  image       TEXT,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  sort_order  INT         NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_categories_slug ON categories(slug);

-- =============================================
-- PRODUCTS
-- =============================================
CREATE TABLE products (
  id             TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name           TEXT        NOT NULL,
  slug           TEXT        UNIQUE NOT NULL,
  description    TEXT        NOT NULL,
  price          FLOAT       NOT NULL,
  compare_price  FLOAT,
  sku            TEXT        UNIQUE,
  category_id    TEXT        NOT NULL REFERENCES categories(id),
  is_active      BOOLEAN     NOT NULL DEFAULT TRUE,
  is_featured    BOOLEAN     NOT NULL DEFAULT FALSE,
  is_new_arrival BOOLEAN     NOT NULL DEFAULT FALSE,
  is_best_seller BOOLEAN     NOT NULL DEFAULT FALSE,
  tags           TEXT[]      NOT NULL DEFAULT '{}',
  weight         FLOAT       NOT NULL DEFAULT 300,
  total_stock    INT         NOT NULL DEFAULT 0,
  sold_count     INT         NOT NULL DEFAULT 0,
  view_count     INT         NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_products_slug        ON products(slug);
CREATE INDEX idx_products_category    ON products(category_id);
CREATE INDEX idx_products_active_feat ON products(is_active, is_featured);

-- =============================================
-- PRODUCT IMAGES
-- =============================================
CREATE TABLE product_images (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url        TEXT        NOT NULL,
  alt        TEXT,
  is_primary BOOLEAN     NOT NULL DEFAULT FALSE,
  sort_order INT         NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_product_images_product ON product_images(product_id);

-- =============================================
-- PRODUCT VARIANTS
-- =============================================
CREATE TABLE product_variants (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       TEXT        NOT NULL,
  stock      INT         NOT NULL DEFAULT 0,
  sku        TEXT        UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, size)
);
CREATE INDEX idx_variants_product ON product_variants(product_id);

-- =============================================
-- CARTS
-- =============================================
CREATE TABLE carts (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT        UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- CART ITEMS
-- =============================================
CREATE TABLE cart_items (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  cart_id    TEXT        NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id TEXT        NOT NULL REFERENCES products(id),
  variant_id TEXT        NOT NULL REFERENCES product_variants(id),
  quantity   INT         NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cart_id, variant_id)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- =============================================
-- COUPONS
-- =============================================
CREATE TABLE coupons (
  id              TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  code            TEXT        UNIQUE NOT NULL,
  description     TEXT,
  discount_type   TEXT        NOT NULL DEFAULT 'PERCENTAGE',
  discount_value  FLOAT       NOT NULL,
  min_order_amount FLOAT      NOT NULL DEFAULT 0,
  max_discount    FLOAT,
  usage_limit     INT,
  used_count      INT         NOT NULL DEFAULT 0,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  start_date      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_coupons_code ON coupons(code);

-- =============================================
-- ORDERS
-- =============================================
CREATE TABLE orders (
  id              TEXT          PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_number    TEXT          UNIQUE NOT NULL,
  user_id         TEXT          NOT NULL REFERENCES users(id),
  address_id      TEXT          NOT NULL REFERENCES addresses(id),
  coupon_id       TEXT          REFERENCES coupons(id),
  subtotal        FLOAT         NOT NULL,
  discount_amount FLOAT         NOT NULL DEFAULT 0,
  shipping_cost   FLOAT         NOT NULL DEFAULT 0,
  total           FLOAT         NOT NULL,
  status          "OrderStatus" NOT NULL DEFAULT 'PENDING',
  notes           TEXT,
  tracking_number TEXT,
  shipping_method TEXT,
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_orders_user_id      ON orders(user_id);
CREATE INDEX idx_orders_number       ON orders(order_number);
CREATE INDEX idx_orders_status       ON orders(status);

-- =============================================
-- ORDER ITEMS
-- =============================================
CREATE TABLE order_items (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id   TEXT        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT        NOT NULL REFERENCES products(id),
  variant_id TEXT        NOT NULL REFERENCES product_variants(id),
  quantity   INT         NOT NULL,
  price      FLOAT       NOT NULL,
  subtotal   FLOAT       NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- =============================================
-- PAYMENTS
-- =============================================
CREATE TABLE payments (
  id                TEXT            PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  order_id          TEXT            UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  transaction_id    TEXT            UNIQUE,
  method            "PaymentMethod" NOT NULL DEFAULT 'MIDTRANS',
  status            "PaymentStatus" NOT NULL DEFAULT 'PENDING',
  amount            FLOAT           NOT NULL,
  snap_token        TEXT,
  snap_redirect_url TEXT,
  paid_at           TIMESTAMPTZ,
  expired_at        TIMESTAMPTZ,
  metadata          JSONB,
  created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_payments_order         ON payments(order_id);
CREATE INDEX idx_payments_transaction   ON payments(transaction_id);

-- =============================================
-- WISHLISTS
-- =============================================
CREATE TABLE wishlists (
  id         TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id    TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX idx_wishlists_user ON wishlists(user_id);

-- =============================================
-- REVIEWS
-- =============================================
CREATE TABLE reviews (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  TEXT        NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating      INT         NOT NULL CHECK(rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_verified BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- =============================================
-- INVENTORY LOGS
-- =============================================
CREATE TABLE inventory_logs (
  id         TEXT              PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  product_id TEXT              NOT NULL REFERENCES products(id),
  variant_id TEXT              NOT NULL REFERENCES product_variants(id),
  action     "InventoryAction" NOT NULL,
  quantity   INT               NOT NULL,
  prev_stock INT               NOT NULL,
  new_stock  INT               NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_inventory_product ON inventory_logs(product_id);
CREATE INDEX idx_inventory_variant ON inventory_logs(variant_id);
