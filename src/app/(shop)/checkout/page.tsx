"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Tag, Loader2, MapPin, ChevronDown, Check, X, Banknote, HandCoins, Truck, QrCode, Wallet } from "lucide-react";

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

  const [codMeetingPoint, setCodMeetingPoint] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [codPayment, setCodPayment] = useState<"COD" | "MANUAL">("COD");
  const [manualMethod, setManualMethod] = useState<"TRANSFER" | "QRIS" | "EWALLET">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dutch_ind_payment_method") as "TRANSFER" | "QRIS" | "EWALLET" | null;
      if (saved && ["TRANSFER", "QRIS", "EWALLET"].includes(saved)) return saved;
    }
    return "TRANSFER";
  });
  const [couponCode, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState<{ discountAmount: number; description: string } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [loading, setLoading] = useState(false);
  const orderPlaced = useRef(false);

  const currentStep = useMemo(() => {
    if (loading) return 4;
    const addressFilled = form.recipientName && form.city && form.street;
    const shippingFilled = addressFilled && form.shippingMethod;
    if (shippingFilled) return 3;
    if (addressFilled) return 2;
    return 1;
  }, [form.recipientName, form.city, form.street, form.shippingMethod, loading]);

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
    reguler:   regulerCost,
    ekspres:   ekspresCost,
    sameday:   samedayCost,
    "cod-antar": 0,
  };
  const shippingCost = shippingCosts[form.shippingMethod] ?? 0;

  // Derived state
  const isCodAntar    = form.shippingMethod === "cod-antar";
  const paymentMethod = isCodAntar ? codPayment : manualMethod;

  // Same Day & COD Antar hanya tersedia di Samarinda
  const cityFilled     = form.city.trim().length > 0;
  const isSamarinda    = form.city.trim().toLowerCase().includes("samarinda");
  const samedayBlocked = cityFilled && !isSamarinda;
  const codBlocked     = cityFilled && !isSamarinda;
  const discountAmount = couponData?.discountAmount || 0;
  const effectiveShippingCost = isCodAntar ? 0 : shippingCost;
  const total = subtotal + effectiveShippingCost - discountAmount;

  // Persist chosen payment method
  useEffect(() => {
    localStorage.setItem("dutch_ind_payment_method", manualMethod);
  }, [manualMethod]);

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

  // Auto-switch away from sameday / cod-antar if city is not Samarinda
  useEffect(() => {
    if (samedayBlocked && (form.shippingMethod === "sameday" || form.shippingMethod === "cod-antar")) {
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

  function handleFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300); // wait for iOS keyboard to appear
  }

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

    if (isCodAntar && !codMeetingPoint.trim()) {
      toast.error("Masukkan titik pertemuan untuk COD Antar");
      setLoading(false);
      return;
    }
    if (isCodAntar && codBlocked) {
      toast.error("COD Antar hanya tersedia di Kota Samarinda");
      setLoading(false);
      return;
    }

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
          shippingMethod: isCodAntar
            ? `COD - Antar Jemput (${codMeetingPoint || "Samarinda"})`
            : `${form.shippingMethod} - ${form.shippingCarrier}`,
          shippingCost: isCodAntar ? 0 : shippingCost,
          notes: [
            isCodAntar ? `[COD] Titik pertemuan: ${codMeetingPoint}` : "",
            form.notes,
            isGift && giftNote ? `[HADIAH] ${giftNote}` : "",
          ].filter(Boolean).join("\n"),
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal membuat pesanan");

      orderPlaced.current = true;
      clearCart();
      // Both MANUAL and COD redirect to order detail
      router.push(`/profile/orders/${data.data.orderId}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!session || items.length === 0) return null;

  return (
    <>
      <div className="min-h-screen py-10">
        <div className="container-main">
          <h1 className="section-title mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            {/* Checkout progress */}
            <div className="flex items-center mb-8 gap-0">
              {[
                { n: 1, label: "Alamat" },
                { n: 2, label: "Pengiriman" },
                { n: 3, label: "Pembayaran" },
                { n: 4, label: "Konfirmasi" },
              ].map((step, i, arr) => (
                <div key={step.n} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      step.n < currentStep ? "bg-white text-black border-white" :
                      step.n === currentStep ? "bg-white text-black border-white" :
                      "border-brand-gray-700 text-brand-gray-600"
                    }`}>
                      {step.n < currentStep ? <Check className="w-3.5 h-3.5" /> : step.n}
                    </div>
                    <span className={`text-[9px] uppercase tracking-wider mt-1 hidden sm:block transition-colors ${step.n <= currentStep ? "text-brand-gray-300" : "text-brand-gray-500"}`}>{step.label}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className={`flex-1 h-px mx-1 transition-colors ${step.n < currentStep ? "bg-white" : "bg-brand-gray-800"}`} />
                  )}
                </div>
              ))}
            </div>

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
                        onFocus={handleFocus}
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
                        onFocus={handleFocus}
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
                        onFocus={handleFocus}
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
                        onFocus={handleFocus}
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
                        onFocus={handleFocus}
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
                        onFocus={handleFocus}
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
                        onFocus={handleFocus}
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
                          { id: "J&T Express",   name: "J&T Express"   },
                          { id: "SiCepat HALU",  name: "SiCepat HALU"  },
                          { id: "JNE REG",       name: "JNE REG"       },
                          { id: "Pos Indonesia", name: "Pos Indonesia"  },
                        ],
                      },
                      {
                        value: "ekspres",
                        label: "Ekspres",
                        desc: "1–2 hari kerja",
                        price: shippingCosts.ekspres,
                        carriers: [
                          { id: "J&T EZ",       name: "J&T EZ"       },
                          { id: "SiCepat BEST", name: "SiCepat BEST" },
                          { id: "JNE YES",      name: "JNE YES"      },
                        ],
                      },
                      {
                        value: "sameday",
                        label: "Same Day",
                        desc: "Hari ini — khusus Kota Samarinda",
                        price: shippingCosts.sameday,
                        carriers: [
                          { id: "GoSend (Gojek)",      name: "GoSend",      logo: "🟢" },
                          { id: "GrabExpress (Grab)",  name: "GrabExpress", logo: "🟡" },
                          { id: "Maxim",               name: "Maxim",       logo: "🔵" },
                        ],
                      },
                    ] as const).map((method) => {
                      const isSelected = form.shippingMethod === method.value;
                      const isOutOfRange =
                        (method.value === "sameday") &&
                        (samedayBlocked || !!shippingEst?.outOfRange);
                      return (
                        <div key={method.value} className={`border transition-colors ${isOutOfRange ? "border-brand-gray-800 opacity-50" : isSelected ? "border-white" : "border-brand-gray-700"}`}>
                          <button
                            type="button"
                            disabled={!!isOutOfRange}
                            onClick={() => {
                              if (isOutOfRange) return;
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
                                  {isOutOfRange
                                    ? (samedayBlocked ? "Hanya tersedia di Kota Samarinda" : "Di luar jangkauan pengiriman hari ini")
                                    : method.desc}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold flex-shrink-0">
                              {isOutOfRange ? (
                                <span className="text-red-400 text-xs">Tidak tersedia</span>
                              ) : method.price === 0 ? (
                                <span className="text-green-400">Gratis</span>
                              ) : (
                                estimating && method.value === "sameday"
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : formatPrice(method.price)
                              )}
                            </span>
                          </button>

                          {/* Carrier sub-options */}
                          {isSelected && (
                            <div className="px-4 pb-4 border-t border-brand-gray-800 pt-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-500 mb-2">Pilih Ekspedisi</p>
                              <div className="flex flex-wrap gap-2">
                                {method.carriers.map((carrier) => {
                                  const active = form.shippingCarrier === carrier.id;
                                  return (
                                    <button
                                      key={carrier.id}
                                      type="button"
                                      onClick={() => setForm((prev) => ({ ...prev, shippingCarrier: carrier.id }))}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border transition-all ${
                                        active ? "border-white bg-white text-black" : "border-brand-gray-600 hover:border-white text-brand-gray-300"
                                      }`}
                                    >
                                      {"logo" in carrier && <span>{(carrier as any).logo}</span>}
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

                    {/* COD Antar — tier khusus Samarinda */}
                    {(() => {
                      const isSelected = form.shippingMethod === "cod-antar";
                      const isBlocked  = codBlocked;
                      return (
                        <div className={`border transition-colors ${isBlocked ? "border-brand-gray-800 opacity-50" : isSelected ? "border-amber-500" : "border-brand-gray-700"}`}>
                          <button
                            type="button"
                            disabled={isBlocked}
                            onClick={() => {
                              if (isBlocked) return;
                              setForm((prev) => ({ ...prev, shippingMethod: "cod-antar", shippingCarrier: "" }));
                            }}
                            className="w-full flex items-center justify-between p-4 text-left hover:bg-brand-gray-800/40 transition-colors disabled:cursor-not-allowed"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${isSelected ? "border-amber-400" : "border-brand-gray-600"}`}>
                                {isSelected && <div className="w-2 h-2 bg-amber-400 rounded-full" />}
                              </div>
                              <div>
                                <p className="text-sm font-semibold flex items-center gap-2">
                                  COD — Antar Langsung
                                  <span className="text-[9px] font-bold bg-amber-900/50 text-amber-400 border border-amber-800/50 px-1.5 py-0.5 uppercase tracking-wider">Samarinda</span>
                                </p>
                                <p className="text-xs text-brand-gray-400">
                                  {isBlocked ? "Hanya tersedia di Kota Samarinda" : "Penjual antar langsung — bayar tunai saat bertemu"}
                                </p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-green-400 flex-shrink-0">
                              {isBlocked ? <span className="text-red-400 text-xs">Tidak tersedia</span> : "Gratis"}
                            </span>
                          </button>

                          {/* Titik pertemuan — muncul saat COD Antar dipilih */}
                          {isSelected && (
                            <div className="px-4 pb-4 border-t border-amber-800/30 pt-3 space-y-3">
                              <div>
                                <label className="input-label">Titik Pertemuan <span className="text-red-400">*</span></label>
                                <input
                                  value={codMeetingPoint}
                                  onChange={(e) => setCodMeetingPoint(e.target.value)}
                                  className="input-field border-amber-800/50 focus:border-amber-500"
                                  placeholder="Contoh: Depan Hypermart Lembuswana, Samarinda"
                                  required
                                />
                                <p className="text-[11px] text-brand-gray-500 mt-1">
                                  Admin akan menghubungi kamu via <span className="text-amber-400">WhatsApp</span> untuk konfirmasi waktu pertemuan.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Notes + Gift */}
                <div className="bg-brand-gray-900 border border-brand-gray-700 p-6 space-y-4">
                  <h2 className="text-sm font-bold uppercase tracking-widest">
                    Catatan Pesanan (Opsional)
                  </h2>
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    onFocus={handleFocus}
                    className="input-field resize-none h-20"
                    placeholder="Tambahkan catatan untuk penjual..."
                  />
                  {/* Gift option */}
                  <label className="flex items-center gap-3 cursor-pointer select-none group">
                    <div
                      onClick={() => setIsGift((v) => !v)}
                      className={`w-5 h-5 border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isGift ? "bg-white border-white" : "border-brand-gray-600 group-hover:border-white"}`}
                    >
                      {isGift && <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                    <span className="text-sm">🎁 Ini pesanan hadiah — tambahkan pesan</span>
                  </label>
                  {isGift && (
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value)}
                      className="input-field resize-none h-16 border-white/20 focus:border-white"
                      placeholder="Pesan hadiah yang akan disertakan dalam paket..."
                      maxLength={200}
                    />
                  )}
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
                      <span className={effectiveShippingCost === 0 ? "text-green-400" : ""}>
                        {effectiveShippingCost === 0 ? (isCodAntar ? "Gratis (COD Antar)" : "Gratis") : formatPrice(effectiveShippingCost)}
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

                  {/* Payment method */}
                  <div className="border-t border-brand-gray-700 pt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-gray-400">Metode Pembayaran</p>

                    {isCodAntar ? (
                      /* COD Antar — bisa pilih tunai atau transfer */
                      <>
                        {[
                          { value: "COD",    label: "Bayar Tunai",             desc: "Bayar cash saat penjual tiba",                   Icon: HandCoins },
                          { value: "MANUAL", label: "Transfer / QRIS / E-Wallet", desc: "Transfer Bank, QRIS, DANA, GoPay — upload bukti", Icon: Banknote  },
                        ].map(({ value, label, desc, Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setCodPayment(value as "COD" | "MANUAL")}
                            className={`w-full flex items-center gap-3 p-3 border text-left transition-colors ${codPayment === value ? (value === "COD" ? "border-amber-500" : "border-white") : "border-brand-gray-700 hover:border-brand-gray-500"}`}
                          >
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${codPayment === value ? (value === "COD" ? "border-amber-400" : "border-white") : "border-brand-gray-600"}`}>
                              {codPayment === value && <div className={`w-2 h-2 rounded-full ${value === "COD" ? "bg-amber-400" : "bg-white"}`} />}
                            </div>
                            <Icon className="w-4 h-4 text-brand-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold">{label}</p>
                              <p className="text-[10px] text-brand-gray-500">{desc}</p>
                            </div>
                          </button>
                        ))}
                        <div className="p-3 bg-amber-900/20 border border-amber-800/50 text-xs text-amber-300 space-y-1">
                          <p className="font-bold">📍 COD Antar Langsung</p>
                          {codPayment === "COD" && (
                            <p className="text-amber-300/70">Siapkan tunai <span className="text-white font-bold">{formatPrice(total)}</span> saat penjual tiba.</p>
                          )}
                          <p className="text-amber-300/70">Admin akan menghubungi via <span className="font-semibold text-amber-300">WhatsApp</span> untuk konfirmasi waktu &amp; lokasi.</p>
                        </div>
                      </>
                    ) : (
                      /* Ekspedisi — pilih salah satu */
                      <>
                        {([
                          { value: "TRANSFER", label: "Transfer Bank",  desc: "Via virtual account BCA, Mandiri, BNI, BRI",  Icon: Banknote },
                          { value: "QRIS",     label: "QRIS",           desc: "Scan QR dengan e-wallet / m-banking apapun", Icon: QrCode  },
                          { value: "EWALLET",  label: "E-Wallet",       desc: "Transfer via GoPay, DANA, OVO, ShopeePay ke nomor tujuan", Icon: Wallet  },
                        ] as const).map(({ value, label, desc, Icon }) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setManualMethod(value)}
                            className={`w-full flex items-center gap-3 p-3 border text-left transition-colors ${manualMethod === value ? "border-white bg-brand-gray-800/30" : "border-brand-gray-700 hover:border-brand-gray-500"}`}
                          >
                            <div className={`w-4 h-4 border-2 rounded-full flex items-center justify-center flex-shrink-0 ${manualMethod === value ? "border-white" : "border-brand-gray-600"}`}>
                              {manualMethod === value && <div className="w-2 h-2 bg-white rounded-full" />}
                            </div>
                            <Icon className="w-4 h-4 text-brand-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold">{label}</p>
                              <p className="text-[10px] text-brand-gray-500">{desc}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Notice: Transfer Bank hanya via Virtual Account */}
                  {!isCodAntar && manualMethod === "TRANSFER" && (
                    <div className="flex gap-3 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Banknote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] leading-relaxed">
                        <span className="font-bold block mb-0.5">Perhatian: Transfer Bank hanya via Virtual Account</span>
                        Pembayaran transfer bank dilakukan melalui nomor virtual account yang akan diberikan setelah pesanan dibuat. Tidak bisa transfer langsung ke rekening biasa.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Memproses...</>
                    ) : isCodAntar ? (
                      <><Truck className="w-4 h-4" /> Pesan Sekarang (COD Antar)</>
                    ) : (
                      "Buat Pesanan"
                    )}
                  </button>

                  <p className="text-center text-[10px] text-brand-gray-500">
                    {isCodAntar
                      ? "Pesanan langsung diproses — admin akan menghubungi via WhatsApp"
                      : "Kamu akan diarahkan ke halaman instruksi pembayaran"}
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
