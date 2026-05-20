"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Tag, Loader2, MapPin, ChevronDown, Check, X } from "lucide-react";

type SavedAddress = {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  street: string;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();

  const [form, setForm] = useState({
    recipientName: session?.user?.name || "",
    phone: "",
    province: "",
    city: "",
    district: "",
    postalCode: "",
    street: "",
    notes: "",
    shippingMethod: "reguler",
    shippingCarrier: "JNE REG",
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressPicker, setShowAddressPicker] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<{ discountAmount: number; description: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const orderPlaced = useRef(false);

  // Distance-based shipping estimate
  const [shippingEst, setShippingEst] = useState<{
    distanceKm: number | null;
    samedayFare: number | null;
    outOfRange: boolean;
    regulerFare: number;
    ekspresFare: number;
    freeRegulerAbove: number;
    fallback?: boolean;
  } | null>(null);
  const [estimating, setEstimating] = useState(false);
  const estimateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subtotal = getTotalPrice();

  // Dynamic costs from estimate, fallback to defaults
  const regulerCost = shippingEst
    ? (subtotal >= shippingEst.freeRegulerAbove ? 0 : shippingEst.regulerFare)
    : (subtotal >= 500000 ? 0 : 15000);
  const ekspresCost = shippingEst?.ekspresFare ?? 25000;
  const samedayCost = shippingEst?.samedayFare ?? 50000;

  const shippingCosts: Record<string, number> = {
    reguler: regulerCost,
    ekspres: ekspresCost,
    sameday: samedayCost,
  };
  const shippingCost = shippingCosts[form.shippingMethod] ?? 0;

  // Same Day hanya tersedia di Samarinda
  const cityFilled     = form.city.trim().length > 0;
  const isSamarinda    = form.city.trim().toLowerCase().includes("samarinda");
  const samedayBlocked = cityFilled && !isSamarinda;
  const discountAmount = couponData?.discountAmount || 0;
  const total = subtotal + shippingCost - discountAmount;

  useEffect(() => {
    if (!session) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    fetch("/api/addresses")
      .then((r) => r.json())
      .then(({ data }) => {
        if (!data?.length) return;
        setSavedAddresses(data);
        const def = data.find((a: SavedAddress) => a.isDefault) ?? data[0];
        applyAddress(def);
        setSelectedAddressId(def.id);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (items.length === 0 && !orderPlaced.current) {
      router.push("/cart");
    }
  }, [items, router]);

  // Auto-switch away from sameday if city is not Samarinda
  useEffect(() => {
    if (samedayBlocked && form.shippingMethod === "sameday") {
      setForm((prev) => ({ ...prev, shippingMethod: "reguler", shippingCarrier: "JNE REG" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [samedayBlocked]);

  // Auto-estimate shipping when address fields change
  useEffect(() => {
    if (!form.city && !form.province) return;
    if (estimateTimer.current) clearTimeout(estimateTimer.current);
    estimateTimer.current = setTimeout(async () => {
      setEstimating(true);
      try {
        const res = await fetch("/api/shipping/estimate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city: form.city, district: form.district, province: form.province }),
        });
        if (!res.ok) return;
        const json = await res.json();
        setShippingEst(json.data);
        // If sameday is unavailable and currently selected, switch back to reguler
        const outOfRange  = json.data?.outOfRange;
        const notSamarinda = form.city.trim().length > 0 &&
                             !form.city.trim().toLowerCase().includes("samarinda");
        if ((outOfRange || notSamarinda) && form.shippingMethod === "sameday") {
          setForm((prev) => ({ ...prev, shippingMethod: "reguler", shippingCarrier: "JNE REG" }));
        }
      } finally {
        setEstimating(false);
      }
    }, 800);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.city, form.district, form.province]);

  function applyAddress(addr: SavedAddress) {
    setForm((prev) => ({
      ...prev,
      recipientName: addr.recipientName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      postalCode: addr.postalCode,
      street: addr.street,
    }));
  }

  function selectSavedAddress(addr: SavedAddress) {
    setSelectedAddressId(addr.id);
    applyAddress(addr);
    setShowAddressPicker(false);
  }

  function clearSavedAddress() {
    setSelectedAddressId(null);
    setForm((prev) => ({
      ...prev,
      recipientName: "",
      phone: "",
      province: "",
      city: "",
      district: "",
      postalCode: "",
      street: "",
    }));
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    if (selectedAddressId) setSelectedAddressId(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCheckingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderAmount: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCouponData(data.data);
      toast.success(`Kupon berhasil! Hemat ${formatPrice(data.data.discountAmount)}`);
    } catch (err: any) {
      toast.error(err.message || "Kupon tidak valid");
      setCouponData(null);
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.product.price,
          })),
          addressId: selectedAddressId ?? undefined,
          address: form,
          couponCode: couponData ? couponCode : undefined,
          shippingMethod: `${form.shippingMethod} - ${form.shippingCarrier}`,
          shippingCost,
          notes: form.notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan");

      // Load Midtrans Snap
      orderPlaced.current = true;
      if (data.data.snapToken) {
        const snapWindow = window as any;
        snapWindow.snap?.pay(data.data.snapToken, {
          onSuccess: () => {
            clearCart();
            router.push(`/order-success?orderId=${data.data.orderId}`);
          },
          onPending: () => {
            clearCart();
            router.push(`/order-success?orderId=${data.data.orderId}`);
          },
          onError: () => toast.error("Pembayaran gagal"),
          onClose: () => toast("Pembayaran ditutup"),
        });
      } else {
        clearCart();
        router.push(`/order-success?orderId=${data.data.orderId}`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session || items.length === 0) return null;

  return (
    <>
      {/* Midtrans Snap script */}
      <Script
        src={
          process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js"
        }
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || ""}
        strategy="afterInteractive"
      />

      <div className="min-h-screen py-10">
        <div className="container-main">
          <h1 className="section-title mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left — form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping address */}
                <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-5">
                    Alamat Pengiriman
                  </h2>

                  {/* Saved address picker */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-5">
                      <div className="relative">
                        <div className="flex items-stretch border border-brand-gray-600 hover:border-white transition-colors">
                          <button
                            type="button"
                            onClick={() => setShowAddressPicker((v) => !v)}
                            className="flex-1 flex items-center gap-3 px-4 py-3 text-left"
                          >
                            <MapPin className="w-4 h-4 flex-shrink-0 text-brand-gray-400" />
                            {selectedAddressId ? (
                              <span className="text-sm truncate">
                                {savedAddresses.find((a) => a.id === selectedAddressId)?.recipientName}
                                {" — "}
                                {savedAddresses.find((a) => a.id === selectedAddressId)?.city}
                                <span className="ml-2 text-xs text-brand-gray-400">
                                  [{savedAddresses.find((a) => a.id === selectedAddressId)?.label}]
                                </span>
                              </span>
                            ) : (
                              <span className="text-sm text-brand-gray-400">Pilih dari alamat tersimpan</span>
                            )}
                          </button>
                          {selectedAddressId ? (
                            <button
                              type="button"
                              onClick={clearSavedAddress}
                              title="Hapus pilihan"
                              className="px-3 text-brand-gray-500 hover:text-white transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setShowAddressPicker((v) => !v)}
                              className="px-3 text-brand-gray-500"
                            >
                              <ChevronDown className={`w-4 h-4 transition-transform ${showAddressPicker ? "rotate-180" : ""}`} />
                            </button>
                          )}
                        </div>

                        {showAddressPicker && (
                          <div className="absolute z-20 top-full left-0 right-0 bg-brand-gray-900 border border-brand-gray-600 border-t-0 max-h-64 overflow-y-auto">
                            {savedAddresses.map((addr) => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => selectSavedAddress(addr)}
                                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-brand-gray-800 transition-colors text-left border-b border-brand-gray-800 last:border-b-0"
                              >
                                <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${selectedAddressId === addr.id ? "text-white" : "text-transparent"}`} />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className="text-xs font-bold uppercase tracking-wider text-brand-gray-400">{addr.label}</span>
                                    {addr.isDefault && <span className="text-xs text-white font-bold">• Utama</span>}
                                  </div>
                                  <p className="text-sm font-semibold">{addr.recipientName} — {addr.phone}</p>
                                  <p className="text-xs text-brand-gray-400 truncate">{addr.street}, {addr.district}, {addr.city}</p>
                                </div>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={clearSavedAddress}
                              className="w-full px-4 py-3 text-xs text-brand-gray-400 hover:text-white hover:bg-brand-gray-800 transition-colors text-left"
                            >
                              + Isi alamat baru secara manual
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Nama Penerima</label>
                      <input
                        name="recipientName"
                        value={form.recipientName}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Nama lengkap penerima"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Nomor HP</label>
                      <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="08xxxxxxxxxx"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Provinsi</label>
                      <input
                        name="province"
                        value={form.province}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Contoh: DKI Jakarta"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Kota / Kabupaten</label>
                      <input
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Contoh: Jakarta Selatan"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Kecamatan</label>
                      <input
                        name="district"
                        value={form.district}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Contoh: Kebayoran Baru"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Kode Pos</label>
                      <input
                        name="postalCode"
                        value={form.postalCode}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="12345"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="input-label">Alamat Lengkap</label>
                      <textarea
                        name="street"
                        value={form.street}
                        onChange={handleChange}
                        className="input-field resize-none h-20"
                        placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping method */}
                <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Metode &amp; Ekspedisi Pengiriman
                    </h2>
                    {estimating && (
                      <span className="text-xs text-brand-gray-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Menghitung ongkir...
                      </span>
                    )}
                    {!estimating && shippingEst?.distanceKm != null && (
                      <span className="text-xs text-brand-gray-400">
                        Jarak ~<strong className="text-white">{shippingEst.distanceKm} km</strong> dari toko
                      </span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {([
                      {
                        value: "reguler",
                        label: "Reguler",
                        desc: "3–5 hari kerja",
                        price: shippingCosts.reguler,
                        carriers: [
                          { id: "JNE REG", name: "JNE REG" },
                          { id: "J&T Express", name: "J&T Express" },
                          { id: "SiCepat HALU", name: "SiCepat HALU" },
                          { id: "Pos Indonesia", name: "Pos Indonesia" },
                        ],
                      },
                      {
                        value: "ekspres",
                        label: "Ekspres",
                        desc: "1–2 hari kerja",
                        price: shippingCosts.ekspres,
                        carriers: [
                          { id: "JNE YES", name: "JNE YES" },
                          { id: "J&T EZ", name: "J&T EZ" },
                          { id: "SiCepat BEST", name: "SiCepat BEST" },
                        ],
                      },
                      {
                        value: "sameday",
                        label: "Same Day",
                        desc: "Hari ini — khusus Kota Samarinda",
                        price: shippingCosts.sameday,
                        carriers: [
                          { id: "GoSend (Gojek)", name: "GoSend", logo: "🟢" },
                          { id: "GrabExpress (Grab)", name: "GrabExpress", logo: "🟡" },
                          { id: "Maxim", name: "Maxim", logo: "🔵" },
                        ],
                      },
                    ] as const).map((method) => {
                      const isSelected = form.shippingMethod === method.value;
                      const isSamedayOutOfRange =
                        method.value === "sameday" &&
                        (samedayBlocked || !!shippingEst?.outOfRange);
                      return (
                        <div key={method.value} className={`border transition-colors ${isSamedayOutOfRange ? "border-brand-gray-800 opacity-50" : isSelected ? "border-white" : "border-brand-gray-700"}`}>
                          {/* Tier row */}
                          <button
                            type="button"
                            disabled={!!isSamedayOutOfRange}
                            onClick={() => {
                              if (isSamedayOutOfRange) return;
                              const firstCarrier = method.carriers[0].id;
                              setForm((prev) => ({ ...prev, shippingMethod: method.value, shippingCarrier: firstCarrier }));
                            }}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray-800/40 transition-colors disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "border-white" : "border-brand-gray-600"}`}>
                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold">{method.label}</p>
                                <p className="text-xs text-brand-gray-400">
                                  {isSamedayOutOfRange
                                  ? (samedayBlocked ? "Hanya tersedia di Kota Samarinda" : "Di luar jangkauan pengiriman hari ini")
                                  : method.desc}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold flex-shrink-0">
                              {isSamedayOutOfRange ? (
                                <span className="text-red-400 text-xs">Tidak tersedia</span>
                              ) : method.price === 0 ? (
                                <span className="text-green-400">Gratis</span>
                              ) : (
                                <>
                                  {estimating && method.value === "sameday" ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    formatPrice(method.price)
                                  )}
                                </>
                              )}
                            </span>
                          </button>

                          {/* Carrier sub-options — only shown when this tier is selected */}
                          {isSelected && (
                            <div className="px-4 pb-4 border-t border-brand-gray-800 pt-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 mb-2">
                                Pilih Ekspedisi
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {method.carriers.map((carrier) => {
                                  const active = form.shippingCarrier === carrier.id;
                                  return (
                                    <button
                                      key={carrier.id}
                                      type="button"
                                      onClick={() => setForm((prev) => ({ ...prev, shippingCarrier: carrier.id }))}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-all ${
                                        active
                                          ? "border-white bg-white text-black"
                                          : "border-brand-gray-600 hover:border-white text-brand-gray-300"
                                      }`}
                                    >
                                      {"logo" in carrier && <span>{carrier.logo}</span>}
                                      {carrier.name}
                                    </button>
                                  );
                                })}
                              </div>
                              {form.shippingCarrier && (
                                <p className="text-xs text-brand-gray-500 mt-2">
                                  Ekspedisi dipilih: <span className="text-white font-semibold">{form.shippingCarrier}</span>
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Notes */}
                <div className="bg-brand-gray-900 border border-brand-gray-700 p-6">
                  <h2 className="text-sm font-bold uppercase tracking-widest mb-4">
                    Catatan Pesanan (Opsional)
                  </h2>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    className="input-field resize-none h-20"
                    placeholder="Tambahkan catatan untuk penjual..."
                  />
                </div>
              </div>

              {/* Right — summary */}
              <div className="lg:col-span-1">
                <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 sticky top-24 space-y-5">
                  <h2 className="text-sm font-bold uppercase tracking-widest">
                    Ringkasan Pesanan
                  </h2>

                  {/* Items */}
                  <ul className="space-y-3 max-h-48 overflow-y-auto">
                    {items.map((item) => (
                      <li key={item.variantId} className="flex gap-3 text-xs">
                        <div className="relative w-12 h-14 bg-brand-gray-800 flex-shrink-0">
                          <Image
                            src={item.product.images[0]?.url || ""}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-gray-600 text-white text-[9px] flex items-center justify-center">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{item.product.name}</p>
                          <p className="text-brand-gray-500">Ukuran: {item.variant.size}</p>
                          <p className="font-bold mt-0.5">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Coupon */}
                  <div className="border-t border-brand-gray-700 pt-4">
                    <label className="input-label">Kode Kupon</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-gray-500" />
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="input-field pl-8 py-2 text-xs"
                          placeholder="Masukkan kode"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={applyCoupon}
                        disabled={checkingCoupon}
                        className="btn-secondary px-4 py-2 text-xs"
                      >
                        {checkingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Pakai"}
                      </button>
                    </div>
                    {couponData && (
                      <p className="text-xs text-green-400 mt-1">{couponData.description}</p>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-brand-gray-700 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-brand-gray-400">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-brand-gray-400">Ongkir</span>
                      <span className={shippingCost === 0 ? "text-green-400" : ""}>
                        {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                      </span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-green-400">
                        <span>Diskon Kupon</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="border-t border-brand-gray-700 pt-2 flex justify-between font-bold text-base">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Bayar Sekarang"
                    )}
                  </button>

                  <p className="text-center text-[10px] text-brand-gray-500">
                    Pembayaran aman menggunakan Midtrans
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
