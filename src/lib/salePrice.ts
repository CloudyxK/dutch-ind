export function getEffectivePrice(product: {
  price: number;
  salePrice?: number | null;
  saleStartAt?: Date | string | null;
  saleEndAt?: Date | string | null;
}): { price: number; originalPrice: number | null; isSale: boolean; saleEndsAt: Date | null } {
  const now = new Date();
  const start = product.saleStartAt ? new Date(product.saleStartAt) : null;
  const end   = product.saleEndAt   ? new Date(product.saleEndAt)   : null;
  const hasSale = !!product.salePrice
    && product.salePrice < product.price
    && (!start || start <= now)
    && (!end   || end   >  now);

  return {
    price:         hasSale ? product.salePrice! : product.price,
    originalPrice: hasSale ? product.price : null,
    isSale:        hasSale,
    saleEndsAt:    hasSale ? (end ?? null) : null,
  };
}
