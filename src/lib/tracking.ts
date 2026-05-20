/** BinderByte tracking integration for Indonesian couriers */

export const CARRIER_OPTIONS = [
  { code: "jne",      label: "JNE" },
  { code: "jnt",      label: "J&T Express" },
  { code: "sicepat",  label: "SiCepat" },
  { code: "pos",      label: "Pos Indonesia" },
  { code: "anteraja", label: "AnterAja" },
  { code: "ninja",    label: "Ninja Express" },
  { code: "tiki",     label: "TIKI" },
  { code: "lion",     label: "Lion Parcel" },
  { code: "wahana",   label: "Wahana" },
  { code: "gosend",   label: "GoSend (Gojek)" },
  { code: "grab",     label: "GrabExpress" },
  { code: "maxim",    label: "Maxim" },
] as const;

export type CarrierCode = (typeof CARRIER_OPTIONS)[number]["code"];

// Carriers that don't have BinderByte tracking (same-day apps)
const NO_API_CARRIERS = new Set(["gosend", "grab", "maxim"]);

// Derive carrier code from the shippingMethod string saved at checkout
// e.g. "reguler - JNE REG" → "jne", "sameday - GoSend (Gojek)" → "gosend"
export function carrierCodeFromMethod(shippingMethod?: string | null): CarrierCode | null {
  if (!shippingMethod) return null;
  const lower = shippingMethod.toLowerCase();
  if (lower.includes("jne")) return "jne";
  if (lower.includes("j&t") || lower.includes("jnt")) return "jnt";
  if (lower.includes("sicepat")) return "sicepat";
  if (lower.includes("pos indonesia")) return "pos";
  if (lower.includes("anteraja")) return "anteraja";
  if (lower.includes("ninja")) return "ninja";
  if (lower.includes("tiki")) return "tiki";
  if (lower.includes("lion")) return "lion";
  if (lower.includes("wahana")) return "wahana";
  if (lower.includes("gosend") || lower.includes("gojek")) return "gosend";
  if (lower.includes("grab")) return "grab";
  if (lower.includes("maxim")) return "maxim";
  return null;
}

export type TrackingHistory = {
  date: string;
  desc: string;
};

export type TrackingResult = {
  success: boolean;
  status: string | null;       // DELIVERED | ON DELIVERY | ON PROCESS | PENDING | UNKNOWN
  summary: string | null;
  origin: string | null;
  destination: string | null;
  history: TrackingHistory[];
  noApi?: boolean;             // true for GoSend/Grab/Maxim
  error?: string;
};

/** Map BinderByte status to our Order status */
export function mapToOrderStatus(
  trackingStatus: string | null
): "SHIPPED" | "DELIVERED" | null {
  if (!trackingStatus) return null;
  const s = trackingStatus.toUpperCase();
  if (s === "DELIVERED") return "DELIVERED";
  if (s.includes("DELIVERY") || s.includes("PROCESS") || s.includes("TRANSIT")) return "SHIPPED";
  return null;
}

export async function fetchTracking(
  carrierCode: CarrierCode,
  awb: string
): Promise<TrackingResult> {
  // Same-day carriers don't have a tracking API
  if (NO_API_CARRIERS.has(carrierCode)) {
    return {
      success: true,
      noApi: true,
      status: null,
      summary: "Layanan same-day tidak memiliki tracking otomatis. Perbarui status secara manual.",
      origin: null,
      destination: null,
      history: [],
    };
  }

  const apiKey = process.env.BINDERBYTE_API_KEY;
  if (!apiKey) {
    return {
      success: false,
      error: "BINDERBYTE_API_KEY belum dikonfigurasi di environment variables",
      status: null, summary: null, origin: null, destination: null, history: [],
    };
  }

  try {
    const url = `https://api.binderbyte.com/v1/track?api_key=${apiKey}&courier=${carrierCode}&awb=${encodeURIComponent(awb)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    const json = await res.json();

    if (json.status !== "true" && json.status !== true) {
      return {
        success: false,
        error: json.message || "Resi tidak ditemukan",
        status: null, summary: null, origin: null, destination: null, history: [],
      };
    }

    const data = json.data ?? {};
    const summary = data.summary ?? {};
    const detail = data.detail ?? {};
    const history: TrackingHistory[] = (data.history ?? []).map((h: any) => ({
      date: h.date ?? "",
      desc: h.desc ?? "",
    }));

    return {
      success: true,
      status: summary.status ?? null,
      summary: summary.desc ?? null,
      origin: detail.origin ?? null,
      destination: detail.destination ?? null,
      history,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message ?? "Gagal menghubungi layanan tracking",
      status: null, summary: null, origin: null, destination: null, history: [],
    };
  }
}
