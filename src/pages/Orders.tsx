import { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Clock,
  Phone,
  MapPin,
  MessageCircle,
  Pencil,
  X,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Loader2,
  RefreshCw,
  Smartphone,
  Shield,
  Cable,
  Palette,
} from "lucide-react";
import Colors from "../constants/colors";

// ─── API Base URL ────────────────────────────────────────────────────────────
const API_BASE = "https://customer-7bcb.onrender.com";
// const API_BASE = "http://localhost:5000";

// ─── Types matching backend ──────────────────────────────────────────────────
interface OrderItemImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
  altText?: string;
}

interface OrderItem {
  _id?: string;
  product: string;
  name: string;
  brand?: string;
  category?: string;
  type?: string;
  color?: string;
  warranty?: string;
  imageUrl?: string;
  images?: OrderItemImage[];
  specifications?: Record<string, string>;
  compatibility?: string[];
  dimensions?: string;
  weight?: string;
  material?: string;
  sellingPrice: number;
  originalPrice?: number;
  quantity: number;
  lineTotal: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    _id: string;
    phone: string;
    profile?: {
      contactName?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      pincode?: string;
      gstNumber?: string;
    };
  };
  items: OrderItem[];
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  couponDiscount: number;
  deliveryCharge: number;
  platformFee: number;
  gst: number;
  deliveryTip: number;
  note?: string;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Status Config ───────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: { label: "Pending", color: "#FF9800", bg: "#FFF8E1", icon: Clock },
  confirmed: {
    label: "Confirmed",
    color: "#2196F3",
    bg: "#E3F7FD",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    color: "#8B5CF6",
    bg: "#F5F3FF",
    icon: Pencil,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "#00A884",
    bg: "#E8F5E9",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "#4CAF50",
    bg: "#E8F5E9",
    icon: Package,
  },
  cancelled: {
    label: "Cancelled",
    color: "#E53935",
    bg: "#FFF0F3",
    icon: XCircle,
  },
};

const PAYMENT_CONFIG: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  unpaid: { label: "Unpaid", color: "#E53935", bg: "#FFF0F3" },
  pending: { label: "Pending", color: "#FF9800", bg: "#FFF8E1" },
  paid: { label: "Paid", color: "#4CAF50", bg: "#E8F5E9" },
};

// ─── API Functions ───────────────────────────────────────────────────────────
const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
};

const fetchAllOrders = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit || "100"));

  const data = await apiFetch(`/api/orders?${query.toString()}`);
  return data.data;
};

const updateOrderStatus = async (
  orderId: string,
  status: string,
  note?: string,
) => {
  const data = await apiFetch(`/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
  return data.data;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Updated Helpers ─────────────────────────────────────────────────────────

function getCustomerName(order: Order): string {
  if (order.customer?.profile?.contactName) {
    return order.customer.profile.contactName;
  }
  if (order.customer?.phone) {
    return `+91 ${order.customer.phone}`;
  }
  // Check if customer is populated as object or just an ID
  if (typeof order.customer === "object" && order.customer.phone) {
    return `+91 ${order.customer.phone}`;
  }
  return "Unknown";
}

function getCustomerPhone(order: Order): string {
  if (order.customer?.phone) {
    return order.customer.phone;
  }
  return "";
}

function getCustomerAddress(order: Order): string {
  const p = order.customer?.profile;
  if (!p) return "No address provided";

  const parts = [
    p.addressLine1,
    p.addressLine2,
    p.city,
    p.state,
    p.pincode,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "No address provided";
}

function buildWhatsAppMessage(order: Order): string {
  const customerName = getCustomerName(order);
  const customerPhone = getCustomerPhone(order);
  const customerAddress = getCustomerAddress(order);

  const lines = [
    `📱 *JholeSalers Store - Order Details*`,
    ``,
    `📋 *Order:* ${order.orderNumber}`,
    `📅 *Date:* ${new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}`,
    `📊 *Status:* ${order.status?.replace(/_/g, " ").toUpperCase()}`,
    `💳 *Payment:* ${order.paymentMethod?.toUpperCase() || "UPI"} | ${order.paymentStatus?.toUpperCase() || "PENDING"}`,
    ``,
    `👤 *Customer Details*`,
    `Name: ${customerName}`,
    `Phone: +91 ${customerPhone}`,
    `Address: ${customerAddress}`,
    ``,
    `🛒 *Order Items (${order.items?.length || 0})*`,
    ...order.items.map((item, idx) => {
      const details = [
        item.brand,
        item.type,
        item.color,
        item.warranty && item.warranty !== "No Warranty" ? item.warranty : null,
      ]
        .filter(Boolean)
        .join(" · ");

      const itemName = details ? `${item.name} (${details})` : item.name;
      const originalPrice =
        item.originalPrice && item.originalPrice > item.sellingPrice
          ? ` (MRP: ₹${item.originalPrice})`
          : "";

      return `${idx + 1}. ${itemName}\n   ₹${item.sellingPrice} × ${item.quantity} = ₹${item.lineTotal}${originalPrice}`;
    }),
    ``,
    `💰 *Bill Summary*`,
    `Subtotal: ₹${order.subtotal?.toLocaleString("en-IN") || 0}`,
    order.couponDiscount > 0 ? `Discount: -₹${order.couponDiscount}` : null,
    `Delivery: ${order.deliveryCharge === 0 ? "FREE" : `₹${order.deliveryCharge}`}`,
    `Platform Fee: ₹${order.platformFee || 0}`,
    `GST: ₹${order.gst || 0}`,
    order.deliveryTip > 0 ? `Delivery Tip: ₹${order.deliveryTip}` : null,
    ``,
    `💵 *Total Amount: ₹${order.totalAmount?.toLocaleString("en-IN") || 0}*`,
    ``,
    `📝 *Note:* ${order.note || "N/A"}`,
    ``,
    `_Thank you for shopping with us! 🙏_`,
  ].filter(Boolean);

  // Encode the full message for WhatsApp URL
  return encodeURIComponent(lines.join("\n"));
}

// ─── Toast ───────────────────────────────────────────────────────────────────
function Toast({
  type,
  message,
  onClose,
}: {
  type: "success" | "error";
  message: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl"
      style={{
        background: type === "success" ? Colors.primaryLight : "#FFF0F3",
        color: type === "success" ? Colors.accent : Colors.error,
        border: `1px solid ${type === "success" ? Colors.accentLight : "#FFD0DA"}`,
        animation: "slideUp 0.3s ease",
      }}
    >
      {type === "success" ? (
        <CheckCircle2 size={18} />
      ) : (
        <AlertTriangle size={18} />
      )}
      {message}
      <button onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}

// ─── Badges ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
}

function PayBadge({ status }: { status: string }) {
  const cfg = PAYMENT_CONFIG[status] || PAYMENT_CONFIG.pending;
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Order Drawer ────────────────────────────────────────────────────────────
function OrderDrawer({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (updated: Order) => void;
}) {
  const [localStatus, setLocalStatus] = useState(order.status);
  const [saving, setSaving] = useState(false);
  const [noteVal] = useState(order.note || "");

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true);
    try {
      const updated = await updateOrderStatus(
        order._id,
        newStatus,
        noteVal || undefined,
      );
      setLocalStatus(newStatus);
      onUpdate({ ...order, ...updated, status: newStatus });
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const nextStatuses: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["out_for_delivery", "cancelled"],
    out_for_delivery: ["delivered", "cancelled"],
  };

  const nextActions = nextStatuses[localStatus] || [];
  const waMsg = buildWhatsAppMessage(order);

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: Colors.overlay }}
    >
      <div className="flex-1" onClick={onClose} />
      <div
        className="w-full max-w-lg flex flex-col h-full overflow-hidden"
        style={{
          background: Colors.surface,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          animation: "drawerIn 0.3s ease",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
          }}
        >
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.65)" }}
            >
              Order Details
            </p>
            <h2 className="text-lg font-bold text-white">
              {order.orderNumber}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-3 py-1 rounded-xl font-medium"
              style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
            >
              {timeAgo(order.createdAt)}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl"
              style={{ background: "rgba(255,255,255,0.18)", color: "#fff" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Customer */}
          <div
            className="px-6 py-5"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: Colors.textMuted }}
            >
              Customer
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                  }}
                >
                  {getCustomerName(order).charAt(0)}
                </div>
                <p
                  className="text-sm font-bold"
                  style={{ color: Colors.textPrimary }}
                >
                  {getCustomerName(order)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} color={Colors.primary} />
                <a
                  href={`tel:+91${getCustomerPhone(order)}`}
                  className="text-sm font-medium"
                  style={{ color: Colors.primary }}
                >
                  +91 {getCustomerPhone(order)}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin size={14} color={Colors.textMuted} className="mt-0.5" />
                <p className="text-sm" style={{ color: Colors.textSecondary }}>
                  {getCustomerAddress(order)}
                </p>
              </div>
            </div>
          </div>

          {/* Items */}
          <div
            className="px-6 py-5"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: Colors.textMuted }}
            >
              Items ({order.items.length})
            </p>
            <div className="flex flex-col gap-2">
              {order.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{
                    background: Colors.surfaceAlt,
                    border: `1px solid ${Colors.border}`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: Colors.textPrimary }}
                    >
                      {item.name}
                    </p>
                    {/* Product Details */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {item.brand && (
                        <span
                          className="text-xs font-medium"
                          style={{ color: Colors.primary }}
                        >
                          {item.brand}
                        </span>
                      )}
                      {item.type && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            background: Colors.surface,
                            color: Colors.textSecondary,
                          }}
                        >
                          <Cable size={10} strokeWidth={2} />
                          {item.type}
                        </span>
                      )}
                      {item.color && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            background: Colors.surface,
                            color: Colors.textSecondary,
                          }}
                        >
                          <Palette size={10} strokeWidth={2} />
                          {item.color}
                        </span>
                      )}
                      {item.warranty && item.warranty !== "No Warranty" && (
                        <span
                          className="inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            background: Colors.surface,
                            color: Colors.success,
                          }}
                        >
                          <Shield size={10} strokeWidth={2} />
                          {item.warranty}
                        </span>
                      )}
                    </div>
                    {/* Price info */}
                    <p
                      className="text-xs mt-1"
                      style={{ color: Colors.textMuted }}
                    >
                      ₹{item.sellingPrice} × {item.quantity}
                      {item.originalPrice &&
                        item.originalPrice > item.sellingPrice && (
                          <span className="line-through ml-1">
                            ₹{item.originalPrice}
                          </span>
                        )}
                    </p>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: Colors.primary }}
                  >
                    ₹{item.lineTotal}
                  </span>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-between mt-4 pt-3"
              style={{ borderTop: `1px solid ${Colors.divider}` }}
            >
              <p
                className="text-base font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Total: ₹{order.totalAmount}
              </p>
              <PayBadge status={order.paymentStatus} />
            </div>
          </div>

          {/* Status Actions */}
          <div
            className="px-6 py-5"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: Colors.textMuted }}
            >
              Order Status
            </p>
            <div className="mb-4">
              <StatusBadge status={localStatus} />
            </div>
            {nextActions.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {nextActions.map((s) => {
                  const cfg = STATUS_CONFIG[s];
                  const Icon = cfg.icon;
                  const isCancel = s === "cancelled";
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                      style={{
                        background: isCancel ? "#FFF0F3" : cfg.bg,
                        color: isCancel ? Colors.error : cfg.color,
                        border: `1.5px solid ${isCancel ? "#FFD0DA" : cfg.color + "40"}`,
                        opacity: saving ? 0.7 : 1,
                      }}
                    >
                      <Icon size={15} strokeWidth={2} />
                      Mark {cfg.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* WhatsApp */}
          {/* WhatsApp */}
          <div className="px-6 py-5">
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: Colors.textMuted }}
            >
              Share via WhatsApp
            </p>
            <a
              href={`https://wa.me/?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold text-white transition-all duration-150"
              style={{
                background: "#25D366",
                boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#1ebe57";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = "#25D366";
              }}
              onClick={(e) => {
                // Prevent default if message is empty
                if (!waMsg || waMsg === "") {
                  e.preventDefault();
                  alert("No order data available to share.");
                }
              }}
            >
              <MessageCircle size={18} /> Share Order via WhatsApp
            </a>
            <p
              className="text-xs mt-2 text-center"
              style={{ color: Colors.textMuted }}
            >
              Opens WhatsApp with order details pre-filled
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [payFilter, setPayFilter] = useState<string>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Fetch orders from API ─────────────────────────────────────────────────
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllOrders({ limit: 100 });
      setOrders(data.orders || []);
      console.log(`📦 Loaded ${data.orders?.length || 0} electronics orders`);
    } catch (err: any) {
      console.error("Failed to load orders:", err);
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o)),
    );
    setSelectedOrder(updatedOrder);
    showToast("success", `${updatedOrder.orderNumber} updated!`);
  };

  // ── Filter orders ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        const q = search.toLowerCase();
        const matchSearch =
          o.orderNumber.toLowerCase().includes(q) ||
          getCustomerName(o).toLowerCase().includes(q) ||
          getCustomerPhone(o).includes(q) ||
          o.items.some(
            (item) =>
              item.name.toLowerCase().includes(q) ||
              (item.brand && item.brand.toLowerCase().includes(q)) ||
              (item.type && item.type.toLowerCase().includes(q)),
          );
        const matchStatus = statusFilter === "All" || o.status === statusFilter;
        const matchPay = payFilter === "All" || o.paymentStatus === payFilter;
        return matchSearch && matchStatus && matchPay;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
  }, [orders, search, statusFilter, payFilter]);

  // Stats
  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      outForDelivery: orders.filter((o) => o.status === "out_for_delivery")
        .length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      revenue: orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((s, o) => s + o.totalAmount, 0),
    }),
    [orders],
  );

  const allStatuses = [
    "All",
    "pending",
    "confirmed",
    "processing",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  // ── Loading State ─────────────────────────────────────────────────────────
  if (loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} color={Colors.primary} />
        <span className="ml-3 text-sm" style={{ color: Colors.textMuted }}>
          Loading orders...
        </span>
      </div>
    );
  }

  // ── Error State ───────────────────────────────────────────────────────────
  if (error && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle size={48} color={Colors.error} />
        <p className="text-sm" style={{ color: Colors.error }}>
          {error}
        </p>
        <button
          onClick={loadOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
          style={{ background: Colors.primary }}
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {selectedOrder && (
        <OrderDrawer
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdate={handleUpdate}
        />
      )}

      <div className="flex flex-col gap-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={20} color={Colors.primary} />
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Orders
              </h1>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Manage electronics accessories orders
              </p>
            </div>
          </div>
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: Colors.primaryLight, color: Colors.primary }}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Total Orders",
              value: stats.total,
              color: Colors.primary,
              bg: Colors.primaryLight,
              icon: ShoppingBag,
            },
            {
              label: "Pending",
              value: stats.pending,
              color: "#FF9800",
              bg: "#FFF8E1",
              icon: Clock,
            },
            {
              label: "Out for Delivery",
              value: stats.outForDelivery,
              color: "#00A884",
              bg: "#E8F5E9",
              icon: Truck,
            },
            {
              label: "Delivered",
              value: stats.delivered,
              color: "#4CAF50",
              bg: "#E8F5E9",
              icon: Package,
            },
            {
              label: "Revenue (Paid)",
              value: `₹${stats.revenue.toLocaleString()}`,
              color: "#059669",
              bg: "#d1fae5",
              icon: TrendingUp,
            },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
              style={{
                background: Colors.surface,
                border: `1px solid ${Colors.border}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon size={18} color={color} />
              </div>
              <div>
                <p
                  className="text-lg font-bold"
                  style={{ color: Colors.textPrimary }}
                >
                  {value}
                </p>
                <p className="text-xs" style={{ color: Colors.textMuted }}>
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {allStatuses.map((s) => {
            const cfg = s !== "All" ? STATUS_CONFIG[s] : null;
            const Icon = cfg?.icon;
            const active = statusFilter === s;
            const count =
              s === "All"
                ? orders.length
                : orders.filter((o) => o.status === s).length;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all"
                style={{
                  background: active
                    ? cfg
                      ? cfg.color
                      : Colors.primary
                    : Colors.surface,
                  color: active ? "#fff" : Colors.textSecondary,
                  border: `1.5px solid ${active ? "transparent" : Colors.border}`,
                }}
              >
                {Icon && <Icon size={13} />}
                {s === "All" ? "All" : cfg?.label || s}
                <span className="opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search + Pay Filter */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2"
              color={searchFocused ? Colors.primary : Colors.textMuted}
            />
            <input
              type="text"
              placeholder="Search by order, product, brand, type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all"
              style={{
                background: searchFocused
                  ? Colors.primaryLight
                  : Colors.surface,
                border: `1.5px solid ${searchFocused ? Colors.borderFocus : Colors.border}`,
                color: Colors.textPrimary,
              }}
            />
          </div>
          <select
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value)}
            className="pl-9 pr-8 py-2.5 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
            style={{
              background: Colors.surface,
              border: `1.5px solid ${Colors.border}`,
              color: Colors.textSecondary,
              minWidth: 140,
            }}
          >
            <option value="All">All Payments</option>
            <option value="unpaid">Unpaid</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
          </select>
        </div>

        {/* Orders Table */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
          }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-sm font-bold"
              style={{ color: Colors.textPrimary }}
            >
              {filtered.length} Order{filtered.length !== 1 ? "s" : ""}
            </p>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Click any row to view & manage
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr style={{ background: Colors.surfaceAlt }}>
                  {[
                    "Order No",
                    "Customer",
                    "Items",
                    "Total",
                    "Payment",
                    "Status",
                    "Time",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase whitespace-nowrap"
                      style={{ color: Colors.textSecondary }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center">
                      <Smartphone size={36} color={Colors.border} />
                      <p
                        className="text-sm mt-2"
                        style={{ color: Colors.textMuted }}
                      >
                        No orders found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr
                      key={order._id}
                      className="cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                      style={{ borderTop: `1px solid ${Colors.divider}` }}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-4">
                        <p
                          className="text-sm font-bold"
                          style={{ color: Colors.primary }}
                        >
                          {order.orderNumber}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                            }}
                          >
                            {getCustomerName(order).charAt(0)}
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: Colors.textPrimary }}
                            >
                              {getCustomerName(order)}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: Colors.textMuted }}
                            >
                              +91 {getCustomerPhone(order)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p
                          className="text-sm"
                          style={{ color: Colors.textSecondary }}
                        >
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                        {/* Show first item type */}
                        {order.items[0]?.type && (
                          <p
                            className="text-xs"
                            style={{ color: Colors.textMuted }}
                          >
                            {order.items[0].type}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <p
                          className="text-sm font-bold"
                          style={{ color: Colors.textPrimary }}
                        >
                          ₹{order.totalAmount}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <PayBadge status={order.paymentStatus} />
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="px-5 py-4">
                        <p
                          className="text-xs"
                          style={{ color: Colors.textMuted }}
                        >
                          {timeAgo(order.createdAt)}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: Colors.primaryLight,
                            color: Colors.primary,
                          }}
                        >
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes drawerIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>
    </>
  );
}
