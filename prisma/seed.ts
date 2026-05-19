import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database...");

  // Bersihkan data lama
  await prisma.inventoryLog.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ---- USERS ----
  const adminPassword = await bcrypt.hash("admin123", 12);
  const userPassword = await bcrypt.hash("user123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@dutch.ind",
      password: adminPassword,
      name: "Admin Streetwear",
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "budi@email.com",
      password: userPassword,
      name: "Budi Santoso",
      phone: "081234567890",
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  });

  // Buat alamat untuk customer
  await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Rumah",
      recipientName: "Budi Santoso",
      phone: "081234567890",
      province: "DKI Jakarta",
      city: "Jakarta Selatan",
      district: "Kebayoran Baru",
      postalCode: "12110",
      street: "Jl. Melawai No. 10, RT 01/RW 02",
      isDefault: true,
    },
  });

  // ---- CATEGORIES ----
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Hoodie",
        slug: "hoodie",
        description: "Hoodie premium streetwear",
        image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400",
        sortOrder: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: "T-Shirt",
        slug: "t-shirt",
        description: "Kaos streetwear eksklusif",
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
        sortOrder: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: "Celana",
        slug: "celana",
        description: "Celana jogger dan cargo",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400",
        sortOrder: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: "Aksesori",
        slug: "aksesori",
        description: "Aksesori pelengkap outfit",
        image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400",
        sortOrder: 4,
      },
    }),
    prisma.category.create({
      data: {
        name: "Outerwear",
        slug: "outerwear",
        description: "Jaket dan outer premium",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
        sortOrder: 5,
      },
    }),
  ]);

  const [catHoodie, catTshirt, catCelana, catAksesori, catOuter] = categories;

  // ---- PRODUCTS ----
  const products = [
    {
      name: "BLCK ARCH HOODIE",
      slug: "blck-arch-hoodie",
      description:
        "Hoodie premium dengan desain arsitektur minimalis. Dibuat dari bahan fleece 380gsm yang tebal dan nyaman. Cocok untuk tampilan streetwear yang bold namun elegan.",
      price: 485000,
      comparePrice: 650000,
      sku: "SW-HD-001",
      categoryId: catHoodie.id,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: true,
      tags: JSON.stringify(["hoodie","premium","bestseller"]),
      images: [
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800",
        "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800",
      ],
      sizes: ["S", "M", "L", "XL"],
      stocks: [10, 15, 12, 8],
    },
    {
      name: "VOID OVERSIZED TEE",
      slug: "void-oversized-tee",
      description:
        "Kaos oversize dengan grafis eksklusif. Bahan cotton combed 30s yang lembut di kulit. Potongan boxy memberikan kesan modern dan kekinian.",
      price: 285000,
      comparePrice: 350000,
      sku: "SW-TS-001",
      categoryId: catTshirt.id,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      tags: JSON.stringify(["tshirt","oversized","graphic"]),
      images: [
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      ],
      sizes: ["S", "M", "L", "XL"],
      stocks: [20, 25, 18, 10],
    },
    {
      name: "URBAN CARGO PANTS",
      slug: "urban-cargo-pants",
      description:
        "Celana cargo dengan desain utilitarian modern. Multi-pocket untuk fungsionalitas maksimal. Bahan ripstop yang kuat dan tahan lama.",
      price: 575000,
      comparePrice: 750000,
      sku: "SW-PNT-001",
      categoryId: catCelana.id,
      isFeatured: true,
      isNewArrival: false,
      isBestSeller: true,
      tags: JSON.stringify(["cargo","pants","urban"]),
      images: [
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
      ],
      sizes: ["S", "M", "L", "XL"],
      stocks: [8, 12, 15, 6],
    },
    {
      name: "MONOCHROME BOMBER",
      slug: "monochrome-bomber",
      description:
        "Bomber jacket monokrom dengan detail premium. Bahan polyester water-resistant. Cocok untuk berbagai kondisi cuaca.",
      price: 785000,
      comparePrice: 950000,
      sku: "SW-OW-001",
      categoryId: catOuter.id,
      isFeatured: true,
      isNewArrival: true,
      isBestSeller: false,
      tags: JSON.stringify(["bomber","jacket","premium"]),
      images: [
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800",
        "https://images.unsplash.com/photo-1604644401890-0bd678c83788?w=800",
      ],
      sizes: ["S", "M", "L", "XL"],
      stocks: [5, 8, 7, 4],
    },
    {
      name: "STREET CAP CLASSIC",
      slug: "street-cap-classic",
      description:
        "Topi snapback dengan bordir logo eksklusif. Bahan twill premium dengan strap adjustable. One size fits all.",
      price: 195000,
      comparePrice: 250000,
      sku: "SW-ACC-001",
      categoryId: catAksesori.id,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: true,
      tags: JSON.stringify(["cap","snapback","accessories"]),
      images: [
        "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
        "https://images.unsplash.com/photo-1534215754734-18e55d13e346?w=800",
      ],
      sizes: ["M"],
      stocks: [30],
    },
    {
      name: "FRAGMENT HOODIE",
      slug: "fragment-hoodie",
      description:
        "Hoodie dengan desain geometrik yang berani. Heavyweight fleece 420gsm untuk kehangatan optimal. Detail drawstring premium.",
      price: 525000,
      comparePrice: null,
      sku: "SW-HD-002",
      categoryId: catHoodie.id,
      isFeatured: false,
      isNewArrival: true,
      isBestSeller: false,
      tags: JSON.stringify(["hoodie","geometric","new"]),
      images: [
        "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=800",
      ],
      sizes: ["S", "M", "L", "XL"],
      stocks: [12, 18, 10, 5],
    },
    {
      name: "GHOST GRAPHIC TEE",
      slug: "ghost-graphic-tee",
      description:
        "Kaos dengan grafis ghost yang ikonik. Cotton 100% ring-spun untuk kelembutan maksimal. Sablon plastisol yang tahan lama.",
      price: 245000,
      comparePrice: 295000,
      sku: "SW-TS-002",
      categoryId: catTshirt.id,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: true,
      tags: JSON.stringify(["tshirt","graphic","bestseller"]),
      images: [
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800",
      ],
      sizes: ["S", "M", "L", "XL"],
      stocks: [25, 30, 22, 15],
    },
    {
      name: "TECH JOGGER PANTS",
      slug: "tech-jogger-pants",
      description:
        "Celana jogger dengan material teknikal. Stretch fabric untuk kebebasan bergerak. Ideal untuk aktivitas urban sehari-hari.",
      price: 450000,
      comparePrice: 550000,
      sku: "SW-PNT-002",
      categoryId: catCelana.id,
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      tags: JSON.stringify(["jogger","technical","pants"]),
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800",
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800",
      ],
      sizes: ["S", "M", "L", "XL"],
      stocks: [10, 14, 12, 8],
    },
  ];

  for (const productData of products) {
    const { images, sizes, stocks, ...data } = productData;

    const product = await prisma.product.create({
      data: {
        ...data,
        totalStock: stocks.reduce((a, b) => a + b, 0),
      },
    });

    // Buat gambar produk
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: images[i],
          alt: product.name,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }

    // Buat varian ukuran
    for (let i = 0; i < sizes.length; i++) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          size: sizes[i],
          stock: stocks[i],
          sku: `${product.sku}-${sizes[i]}`,
        },
      });
    }
  }

  // ---- COUPONS ----
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "Diskon 10% untuk pembelian pertama",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 200000,
        maxDiscount: 100000,
        usageLimit: 100,
        isActive: true,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        code: "STREET50K",
        description: "Potongan Rp50.000 min. belanja Rp500.000",
        discountType: "FIXED",
        discountValue: 50000,
        minOrderAmount: 500000,
        usageLimit: 50,
        isActive: true,
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      },
      {
        code: "FLASHSALE",
        description: "Flash sale diskon 20%",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 300000,
        maxDiscount: 150000,
        usageLimit: 30,
        isActive: true,
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  console.log("✅ Seeding selesai!");
  console.log("👤 Admin: admin@dutch.ind / admin123");
  console.log("👤 Customer: budi@email.com / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
