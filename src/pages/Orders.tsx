import { useState, useMemo } from "react";
import {
  ClipboardList,
  Search,
  ChevronDown,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Package,
  Clock,
  IndianRupee,
  Phone,
  MapPin,
  MessageCircle,
  Pencil,
  Check,
  X,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  ChevronRight,
  ExternalLink,
  Banknote,
  CreditCard,
  CircleDollarSign,
} from "lucide-react";
import Colors from "../constants/colors";

// ── Types ─────────────────────────────────────────────────────────────────────
type OrderStatus =
  | "pending"
  | "accepted"
  | "altered"
  | "dispatched"
  | "delivered"
  | "cancelled";
type PaymentStatus = "unpaid" | "paid" | "partial";
type PaymentMethod = "cash" | "upi" | "card";

interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  orderedQty: number;
  acceptedQty: number; // admin can alter this
  price: number;
}

interface Order {
  id: string;
  orderNo: string;
  customer: {
    name: string;
    phone: string;
    address: string;
    gstNumber?: string;
    location?: { lat: number; lng: number };
  };
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  totalOrdered: number;
  totalAccepted: number;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderNo: "NMO-1001",
    customer: {
      name: "Rajesh Kumar",
      phone: "9876543210",
      address: "12, MG Road, Ahmedabad, Gujarat 380001",
      gstNumber: "24ABCDE1234F1Z5",
      location: { lat: 23.0225, lng: 72.5714 },
    },
    items: [
      {
        productId: "1",
        productName: "Pan-D 40mg Tablet",
        unit: "Strip",
        orderedQty: 10,
        acceptedQty: 10,
        price: 52,
      },
      {
        productId: "3",
        productName: "Betadine Ointment",
        unit: "Tube",
        orderedQty: 2,
        acceptedQty: 2,
        price: 85,
      },
    ],
    status: "pending",
    paymentStatus: "unpaid",
    totalOrdered: 690,
    totalAccepted: 690,
    createdAt: new Date(Date.now() - 1000 * 60 * 15),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: "2",
    orderNo: "NMO-1002",
    customer: {
      name: "Priya Sharma",
      phone: "8765432109",
      address: "45, Park Street, Kolkata, WB 700016",
      location: { lat: 22.5726, lng: 88.3639 },
    },
    items: [
      {
        productId: "2",
        productName: "Calpol 500mg Syrup",
        unit: "Bottle",
        orderedQty: 3,
        acceptedQty: 3,
        price: 38,
      },
      {
        productId: "8",
        productName: "ORS Electral Sachet",
        unit: "Sachet",
        orderedQty: 20,
        acceptedQty: 15,
        price: 14,
      },
    ],
    status: "altered",
    paymentStatus: "paid",
    paymentMethod: "upi",
    totalOrdered: 394,
    totalAccepted: 324,
    note: "ORS stock limited — accepted 15 instead of 20",
    createdAt: new Date(Date.now() - 1000 * 60 * 90),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: "3",
    orderNo: "NMO-1003",
    customer: {
      name: "Amitabh Patel",
      phone: "7654321098",
      address: "8, Linking Road, Mumbai, Maharashtra 400050",
      gstNumber: "27FGHIJ5678K2L6",
      location: { lat: 19.076, lng: 72.8777 },
    },
    items: [
      {
        productId: "4",
        productName: "Azithromycin 500mg",
        unit: "Strip",
        orderedQty: 5,
        acceptedQty: 5,
        price: 120,
      },
      {
        productId: "5",
        productName: "Vitamin D3 Drops",
        unit: "Bottle",
        orderedQty: 1,
        acceptedQty: 1,
        price: 210,
      },
    ],
    status: "dispatched",
    paymentStatus: "paid",
    paymentMethod: "upi",
    totalOrdered: 810,
    totalAccepted: 810,
    createdAt: new Date(Date.now() - 1000 * 60 * 180),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
  },
  {
    id: "4",
    orderNo: "NMO-1004",
    customer: {
      name: "Sunita Mehta",
      phone: "6543210987",
      address: "33, Civil Lines, Jaipur, Rajasthan 302006",
      location: { lat: 26.9124, lng: 75.7873 },
    },
    items: [
      {
        productId: "7",
        productName: "Liv 52 DS Tablet",
        unit: "Box",
        orderedQty: 2,
        acceptedQty: 2,
        price: 175,
      },
    ],
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "cash",
    totalOrdered: 350,
    totalAccepted: 350,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
  {
    id: "5",
    orderNo: "NMO-1005",
    customer: {
      name: "Vikram Singh",
      phone: "5432109876",
      address: "27, Sector 17, Chandigarh 160017",
      gstNumber: "03KLMNO9012P3Q7",
      location: { lat: 30.7333, lng: 76.7794 },
    },
    items: [
      {
        productId: "6",
        productName: "Insulin Syringe 1ml",
        unit: "Piece",
        orderedQty: 50,
        acceptedQty: 50,
        price: 12,
      },
      {
        productId: "1",
        productName: "Pan-D 40mg Tablet",
        unit: "Strip",
        orderedQty: 5,
        acceptedQty: 5,
        price: 52,
      },
    ],
    status: "accepted",
    paymentStatus: "partial",
    paymentMethod: "cash",
    totalOrdered: 860,
    totalAccepted: 860,
    createdAt: new Date(Date.now() - 1000 * 60 * 30),
    updatedAt: new Date(Date.now() - 1000 * 60 * 20),
  },
  {
    id: "6",
    orderNo: "NMO-1006",
    customer: {
      name: "Deepa Nair",
      phone: "4321098765",
      address: "19, Anna Salai, Chennai, Tamil Nadu 600002",
      location: { lat: 13.0827, lng: 80.2707 },
    },
    items: [
      {
        productId: "3",
        productName: "Betadine Ointment",
        unit: "Tube",
        orderedQty: 4,
        acceptedQty: 0,
        price: 85,
      },
    ],
    status: "cancelled",
    paymentStatus: "unpaid",
    totalOrdered: 340,
    totalAccepted: 0,
    note: "Customer cancelled — product out of stock",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 47),
  },
];

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; color: string; bg: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    color: Colors.warning,
    bg: `${Colors.warning}18`,
    icon: Clock,
  },
  accepted: {
    label: "Accepted",
    color: Colors.info,
    bg: `${Colors.info}18`,
    icon: CheckCircle2,
  },
  altered: { label: "Altered", color: "#9333ea", bg: "#f3e8ff", icon: Pencil },
  dispatched: {
    label: "Dispatched",
    color: Colors.primary,
    bg: Colors.primaryLight,
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: Colors.success,
    bg: `${Colors.success}18`,
    icon: Package,
  },
  cancelled: {
    label: "Cancelled",
    color: Colors.error,
    bg: "#FFF0F3",
    icon: XCircle,
  },
};

const PAYMENT_CONFIG: Record<
  PaymentStatus,
  { label: string; color: string; bg: string }
> = {
  unpaid: { label: "Unpaid", color: Colors.error, bg: "#FFF0F3" },
  paid: { label: "Paid", color: Colors.success, bg: `${Colors.success}18` },
  partial: {
    label: "Partial",
    color: Colors.warning,
    bg: `${Colors.warning}18`,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildWhatsAppMessage(order: Order): string {
  const lines = [
    `🏥 *Nilkanth Medical Store*`,
    `📋 Order No: ${order.orderNo}`,
    `👤 Customer: ${order.customer.name}`,
    `📞 Phone: +91 ${order.customer.phone}`,
    `📍 Address: ${order.customer.address}`,
    ``,
    `*Order Items:*`,
    ...order.items.map(
      (item) =>
        `• ${item.productName} × ${item.acceptedQty} ${item.unit} — ₹${(item.acceptedQty * item.price).toLocaleString()}`,
    ),
    ``,
    `💰 *Total: ₹${order.totalAccepted.toLocaleString()}*`,
    order.customer.location
      ? `\n🗺️ Location: https://maps.google.com/?q=${order.customer.location.lat},${order.customer.location.lng}`
      : "",
    order.note ? `\n📝 Note: ${order.note}` : "",
  ].filter(Boolean);
  return encodeURIComponent(lines.join("\n"));
}

// ── Toast ─────────────────────────────────────────────────────────────────────
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
        <CheckCircle2 size={18} color={Colors.success} strokeWidth={2.5} />
      ) : (
        <AlertTriangle size={18} color={Colors.error} strokeWidth={2.5} />
      )}
      {message}
      <button onClick={onClose} style={{ color: Colors.textMuted }}>
        <X size={16} />
      </button>
    </div>
  );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
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

function PayBadge({ status }: { status: PaymentStatus }) {
  const cfg = PAYMENT_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ── Order Detail Drawer ───────────────────────────────────────────────────────
function OrderDrawer({
  order,
  onClose,
  onUpdate,
}: {
  order: Order;
  onClose: () => void;
  onUpdate: (updated: Order) => void;
}) {
  const [localOrder, setLocalOrder] = useState<Order>(() => {
    const clone = JSON.parse(JSON.stringify(order));
    return {
      ...clone,
      createdAt: new Date(clone.createdAt),
      updatedAt: new Date(clone.updatedAt),
    };
  });
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState("");
  const [saving, setSaving] = useState(false);
  const [editNote, setEditNote] = useState(false);
  const [noteVal, setNoteVal] = useState(localOrder.note ?? "");

  const recalcTotal = (items: OrderItem[]) =>
    items.reduce((sum, i) => sum + i.acceptedQty * i.price, 0);

  const handleQtyEdit = (productId: string, currentQty: number) => {
    setEditingItemId(productId);
    setEditQty(String(currentQty));
  };

  const commitQty = (productId: string, ordered: number) => {
    const n = parseInt(editQty);
    if (isNaN(n) || n < 0) {
      setEditingItemId(null);
      return;
    }
    const capped = Math.min(n, ordered);
    const updatedItems = localOrder.items.map((i) =>
      i.productId === productId ? { ...i, acceptedQty: capped } : i,
    );
    const wasAltered = updatedItems.some((i) => i.acceptedQty !== i.orderedQty);
    setLocalOrder((prev) => ({
      ...prev,
      items: updatedItems,
      totalAccepted: recalcTotal(updatedItems),
      status: wasAltered
        ? "altered"
        : prev.status === "pending"
          ? "pending"
          : prev.status,
    }));
    setEditingItemId(null);
  };

  const handleStatusChange = (status: OrderStatus) => {
    setLocalOrder((prev) => ({ ...prev, status, updatedAt: new Date() }));
  };

  const handlePaymentChange = (
    paymentStatus: PaymentStatus,
    paymentMethod?: PaymentMethod,
  ) => {
    setLocalOrder((prev) => ({
      ...prev,
      paymentStatus,
      paymentMethod: paymentMethod ?? prev.paymentMethod,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    onUpdate({
      ...localOrder,
      note: noteVal || undefined,
      updatedAt: new Date(),
    });
    setSaving(false);
  };

  const waMsg = buildWhatsAppMessage(localOrder);
  const wasAltered = localOrder.items.some(
    (i) => i.acceptedQty !== i.orderedQty,
  );
  const NEXT_STATUSES: Partial<Record<OrderStatus, OrderStatus[]>> = {
    pending: ["accepted", "cancelled"],
    accepted: ["dispatched", "cancelled"],
    altered: ["dispatched", "cancelled"],
    dispatched: ["delivered", "cancelled"],
  };
  const nextActions = NEXT_STATUSES[localOrder.status] ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ background: Colors.overlay }}
    >
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer */}
      <div
        className="w-full max-w-lg flex flex-col h-full overflow-hidden"
        style={{
          background: Colors.surface,
          boxShadow: "-8px 0 40px rgba(0,0,0,0.18)",
          animation: "drawerIn 0.3s ease",
        }}
      >
        {/* ── Drawer Header ── */}
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
            <h2 className="text-lg font-bold" style={{ color: Colors.white }}>
              {localOrder.orderNo}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs px-3 py-1 rounded-xl font-medium"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: Colors.white,
              }}
            >
              {timeAgo(localOrder.createdAt)}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: Colors.white,
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          {/* Customer info */}
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
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                    color: Colors.white,
                  }}
                >
                  {localOrder.customer.name.charAt(0)}
                </div>
                <div>
                  <p
                    className="text-sm font-bold"
                    style={{ color: Colors.textPrimary }}
                  >
                    {localOrder.customer.name}
                  </p>
                  {localOrder.customer.gstNumber && (
                    <p className="text-xs" style={{ color: Colors.textMuted }}>
                      GST: {localOrder.customer.gstNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} color={Colors.primary} strokeWidth={2} />
                <a
                  href={`tel:+91${localOrder.customer.phone}`}
                  className="text-sm font-medium"
                  style={{ color: Colors.primary }}
                >
                  +91 {localOrder.customer.phone}
                </a>
              </div>
              <div className="flex items-start gap-2">
                <MapPin
                  size={14}
                  color={Colors.textMuted}
                  strokeWidth={2}
                  className="mt-0.5 flex-shrink-0"
                />
                <p
                  className="text-sm leading-snug"
                  style={{ color: Colors.textSecondary }}
                >
                  {localOrder.customer.address}
                </p>
              </div>
              {localOrder.customer.location && (
                <a
                  href={`https://maps.google.com/?q=${localOrder.customer.location.lat},${localOrder.customer.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold w-fit px-3 py-1.5 rounded-xl transition-all duration-150"
                  style={{ background: `${Colors.info}18`, color: Colors.info }}
                >
                  <ExternalLink size={13} strokeWidth={2} /> View on Google Maps
                </a>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div
            className="px-6 py-5"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: Colors.textMuted }}
              >
                Items
              </p>
              {wasAltered && (
                <span
                  className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                  style={{ background: "#f3e8ff", color: "#9333ea" }}
                >
                  ⚡ Qty Altered
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {localOrder.items.map((item) => {
                const isEditing = editingItemId === item.productId;
                const altered = item.acceptedQty !== item.orderedQty;
                return (
                  <div
                    key={item.productId}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{
                      background: altered ? "#faf5ff" : Colors.surfaceAlt,
                      border: `1px solid ${altered ? "#e9d5ff" : Colors.border}`,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: Colors.textPrimary }}
                      >
                        {item.productName}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: Colors.textMuted }}
                      >
                        ₹{item.price} / {item.unit}
                      </p>
                    </div>
                    {/* Qty: ordered → accepted */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {altered && (
                        <span
                          className="text-xs line-through"
                          style={{ color: Colors.textMuted }}
                        >
                          {item.orderedQty}
                        </span>
                      )}
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="0"
                            max={item.orderedQty}
                            value={editQty}
                            onChange={(e) => setEditQty(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter")
                                commitQty(item.productId, item.orderedQty);
                              if (e.key === "Escape") setEditingItemId(null);
                            }}
                            className="w-14 text-center text-sm font-bold px-2 py-1 rounded-xl outline-none"
                            style={{
                              border: `1.5px solid ${Colors.borderFocus}`,
                              color: Colors.primary,
                              background: Colors.primaryLight,
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() =>
                              commitQty(item.productId, item.orderedQty)
                            }
                            style={{ color: Colors.success }}
                          >
                            <Check size={16} strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setEditingItemId(null)}
                            style={{ color: Colors.textMuted }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: altered ? "#9333ea" : Colors.textPrimary,
                            }}
                          >
                            {item.acceptedQty} {item.unit}
                          </span>
                          {localOrder.status !== "delivered" &&
                            localOrder.status !== "cancelled" && (
                              <button
                                onClick={() =>
                                  handleQtyEdit(
                                    item.productId,
                                    item.acceptedQty,
                                  )
                                }
                                className="p-1 rounded-lg transition-colors"
                                style={{ color: Colors.textMuted }}
                                onMouseEnter={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.color = Colors.primary)
                                }
                                onMouseLeave={(e) =>
                                  ((
                                    e.currentTarget as HTMLElement
                                  ).style.color = Colors.textMuted)
                                }
                              >
                                <Pencil size={13} strokeWidth={2} />
                              </button>
                            )}
                        </div>
                      )}
                    </div>
                    <p
                      className="text-sm font-bold flex-shrink-0"
                      style={{ color: Colors.primary }}
                    >
                      ₹{(item.acceptedQty * item.price).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between mt-4 pt-3"
              style={{ borderTop: `1px solid ${Colors.divider}` }}
            >
              <div>
                {localOrder.totalOrdered !== localOrder.totalAccepted && (
                  <p
                    className="text-xs line-through"
                    style={{ color: Colors.textMuted }}
                  >
                    Ordered: ₹{localOrder.totalOrdered.toLocaleString()}
                  </p>
                )}
                <p
                  className="text-base font-bold"
                  style={{ color: Colors.textPrimary }}
                >
                  Total: ₹{localOrder.totalAccepted.toLocaleString()}
                </p>
              </div>
              <PayBadge status={localOrder.paymentStatus} />
            </div>
          </div>

          {/* Status Pipeline */}
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
            {/* Visual pipeline */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
              {(
                [
                  "pending",
                  "accepted",
                  "dispatched",
                  "delivered",
                ] as OrderStatus[]
              ).map((s, i, arr) => {
                const cfg = STATUS_CONFIG[s];
                const Icon = cfg.icon;
                const isDone =
                  [
                    "pending",
                    "accepted",
                    "altered",
                    "dispatched",
                    "delivered",
                  ].indexOf(localOrder.status) >=
                  ["pending", "accepted", "dispatched", "delivered"].indexOf(s);
                const isCurrent =
                  localOrder.status === s ||
                  (localOrder.status === "altered" && s === "accepted");
                return (
                  <div
                    key={s}
                    className="flex items-center gap-1 flex-shrink-0"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{
                          background: isCurrent
                            ? cfg.color
                            : isDone
                              ? `${cfg.color}30`
                              : Colors.surfaceAlt,
                          border: `2px solid ${isDone ? cfg.color : Colors.border}`,
                        }}
                      >
                        <Icon
                          size={14}
                          color={
                            isCurrent
                              ? Colors.white
                              : isDone
                                ? cfg.color
                                : Colors.textMuted
                          }
                          strokeWidth={2.5}
                        />
                      </div>
                      <p
                        className="text-xs"
                        style={{
                          color: isCurrent ? cfg.color : Colors.textMuted,
                          fontWeight: isCurrent ? 700 : 400,
                        }}
                      >
                        {cfg.label}
                      </p>
                    </div>
                    {i < arr.length - 1 && (
                      <div
                        className="w-8 h-0.5 flex-shrink-0 mb-4"
                        style={{
                          background: isDone ? Colors.primary : Colors.border,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Current badge */}
            <div className="mb-4">
              <StatusBadge status={localOrder.status} />
            </div>
            {/* Action buttons */}
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
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150"
                      style={{
                        background: isCancel ? "#FFF0F3" : cfg.bg,
                        color: isCancel ? Colors.error : cfg.color,
                        border: `1.5px solid ${isCancel ? "#FFD0DA" : cfg.color + "40"}`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          isCancel ? Colors.error : cfg.color;
                        (e.currentTarget as HTMLElement).style.color =
                          Colors.white;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          isCancel ? "#FFF0F3" : cfg.bg;
                        (e.currentTarget as HTMLElement).style.color = isCancel
                          ? Colors.error
                          : cfg.color;
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

          {/* Payment */}
          <div
            className="px-6 py-5"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wide mb-3"
              style={{ color: Colors.textMuted }}
            >
              Payment
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {(["unpaid", "partial", "paid"] as PaymentStatus[]).map((s) => {
                const cfg = PAYMENT_CONFIG[s];
                const active = localOrder.paymentStatus === s;
                return (
                  <button
                    key={s}
                    onClick={() => handlePaymentChange(s)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                    style={{
                      background: active ? cfg.bg : Colors.surfaceAlt,
                      color: active ? cfg.color : Colors.textMuted,
                      border: `1.5px solid ${active ? cfg.color + "60" : Colors.border}`,
                      fontWeight: active ? 700 : 500,
                    }}
                  >
                    {cfg.label}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  ["cash", Banknote],
                  ["upi", CircleDollarSign],
                  ["card", CreditCard],
                ] as [PaymentMethod, React.ElementType][]
              ).map(([m, Icon]) => {
                const active = localOrder.paymentMethod === m;
                return (
                  <button
                    key={m}
                    onClick={() =>
                      handlePaymentChange(localOrder.paymentStatus, m)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all duration-150"
                    style={{
                      background: active
                        ? Colors.primaryLight
                        : Colors.surfaceAlt,
                      color: active ? Colors.primary : Colors.textMuted,
                      border: `1.5px solid ${active ? Colors.borderFocus : Colors.border}`,
                    }}
                  >
                    <Icon size={14} strokeWidth={2} />
                    {m.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div
            className="px-6 py-5"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-xs font-bold uppercase tracking-wide"
                style={{ color: Colors.textMuted }}
              >
                Note
              </p>
              <button
                onClick={() => setEditNote((v) => !v)}
                style={{ color: Colors.primary }}
              >
                <Pencil size={14} strokeWidth={2} />
              </button>
            </div>
            {editNote ? (
              <textarea
                rows={2}
                value={noteVal}
                onChange={(e) => setNoteVal(e.target.value)}
                className="w-full px-3 py-2.5 rounded-2xl text-sm outline-none resize-none"
                style={{
                  border: `1.5px solid ${Colors.borderFocus}`,
                  background: Colors.primaryLight,
                  color: Colors.textPrimary,
                }}
                placeholder="Add a note about this order…"
              />
            ) : (
              <p
                className="text-sm leading-relaxed"
                style={{
                  color: noteVal ? Colors.textSecondary : Colors.textMuted,
                }}
              >
                {noteVal || "No note added"}
              </p>
            )}
          </div>

          {/* WhatsApp Share */}
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
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-semibold transition-all duration-150"
              style={{
                background: "#25D366",
                color: Colors.white,
                boxShadow: "0 4px 14px rgba(37,211,102,0.3)",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "0.9")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.opacity = "1")
              }
            >
              <MessageCircle size={18} strokeWidth={2} />
              Share Order + Location to WhatsApp
            </a>
            <p
              className="text-xs mt-2 text-center"
              style={{ color: Colors.textMuted }}
            >
              Opens WhatsApp with order details, items & Google Maps link
            </p>
          </div>
        </div>

        {/* ── Footer: Save ── */}
        <div
          className="px-6 py-4 flex-shrink-0"
          style={{
            borderTop: `1px solid ${Colors.divider}`,
            background: Colors.surfaceAlt,
          }}
        >
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
            style={{
              background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
              color: Colors.white,
              opacity: saving ? 0.8 : 1,
              cursor: saving ? "not-allowed" : "pointer",
              boxShadow: `0 4px 14px rgba(0,168,132,0.3)`,
            }}
          >
            {saving ? (
              <>
                <svg
                  className="animate-spin"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="3"
                  />
                  <path
                    d="M12 2a10 10 0 0 1 10 10"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
                Saving…
              </>
            ) : (
              <>
                <CheckCircle2 size={16} strokeWidth={2.5} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function Orders() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<"All" | OrderStatus>("All");
  const [payFilter, setPayFilter] = useState<"All" | PaymentStatus>("All");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdate = (updated: Order) => {
    setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
    setSelectedOrder(updated);
    showToast("success", `${updated.orderNo} updated successfully!`);
  };

  const filtered = useMemo(() => {
    return orders
      .filter((o) => {
        const q = search.toLowerCase();
        const matchSearch =
          o.orderNo.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.phone.includes(q);
        const matchStatus = statusFilter === "All" || o.status === statusFilter;
        const matchPay = payFilter === "All" || o.paymentStatus === payFilter;
        return matchSearch && matchStatus && matchPay;
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [orders, search, statusFilter, payFilter]);

  // Stats
  const stats = useMemo(
    () => ({
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      dispatched: orders.filter((o) => o.status === "dispatched").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      revenue: orders
        .filter((o) => o.paymentStatus === "paid")
        .reduce((s, o) => s + o.totalAccepted, 0),
    }),
    [orders],
  );

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
        {/* ── Page Header ── */}
        <div className="flex items-center gap-2">
          <ClipboardList size={20} color={Colors.primary} strokeWidth={2} />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: Colors.textPrimary }}
            >
              Orders
            </h1>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Accept, alter, dispatch and track all customer orders
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
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
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: Clock,
            },
            {
              label: "Dispatched",
              value: stats.dispatched,
              color: Colors.info,
              bg: `${Colors.info}18`,
              icon: Truck,
            },
            {
              label: "Delivered",
              value: stats.delivered,
              color: Colors.success,
              bg: `${Colors.success}18`,
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
                boxShadow: `0 2px 8px ${Colors.shadow}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-lg font-bold leading-tight truncate"
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

        {/* Pending alert */}
        {stats.pending > 0 && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-150"
            style={{
              background: `${Colors.warning}12`,
              border: `1.5px solid ${Colors.warning}40`,
            }}
            onClick={() => setStatusFilter("pending")}
          >
            <AlertTriangle
              size={20}
              color={Colors.warning}
              strokeWidth={2}
              className="flex-shrink-0"
            />
            <p className="text-sm flex-1" style={{ color: Colors.textPrimary }}>
              <span className="font-bold" style={{ color: Colors.warning }}>
                {stats.pending} order{stats.pending > 1 ? "s" : ""} waiting for
                review.
              </span>
              <span style={{ color: Colors.textMuted }}>
                {" "}
                Click to filter pending orders.
              </span>
            </p>
            <ChevronRight size={16} color={Colors.warning} />
          </div>
        )}

        {/* ── Status Filter Tabs ── */}
        <div className="flex gap-2 flex-wrap">
          {(
            [
              "All",
              "pending",
              "accepted",
              "altered",
              "dispatched",
              "delivered",
              "cancelled",
            ] as const
          ).map((s) => {
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
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all duration-150"
                style={{
                  background: active
                    ? cfg
                      ? cfg.color
                      : `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
                    : Colors.surface,
                  color: active ? Colors.white : Colors.textSecondary,
                  border: `1.5px solid ${active ? "transparent" : Colors.border}`,
                  boxShadow: active
                    ? `0 4px 12px ${cfg ? cfg.color + "40" : "rgba(0,168,132,0.3)"}`
                    : "none",
                }}
              >
                {Icon && <Icon size={13} strokeWidth={2.5} />}
                {s === "All" ? "All Orders" : STATUS_CONFIG[s].label}
                <span className="ml-0.5 opacity-75">({count})</span>
              </button>
            );
          })}
        </div>

        {/* ── Search + Pay Filter ── */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                color: searchFocused ? Colors.primary : Colors.textMuted,
              }}
            >
              <Search size={16} strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Search by order no, name, phone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all duration-200"
              style={{
                background: searchFocused
                  ? Colors.primaryLight
                  : Colors.surface,
                border: `1.5px solid ${searchFocused ? Colors.borderFocus : Colors.border}`,
                color: Colors.textPrimary,
              }}
            />
          </div>
          <div className="relative">
            <IndianRupee
              size={15}
              color={Colors.textMuted}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={2}
            />
            <select
              value={payFilter}
              onChange={(e) => setPayFilter(e.target.value as any)}
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
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
            <ChevronDown
              size={14}
              color={Colors.textMuted}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* ── Orders Table ── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            boxShadow: `0 4px 16px ${Colors.shadow}`,
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
            <table className="w-full min-w-[820px]">
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
                      className="px-5 py-3 text-left text-xs font-semibold tracking-wide uppercase whitespace-nowrap"
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
                      <div className="flex flex-col items-center gap-2">
                        <ClipboardList
                          size={36}
                          color={Colors.border}
                          strokeWidth={1.5}
                        />
                        <p
                          className="text-sm"
                          style={{ color: Colors.textMuted }}
                        >
                          No orders found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="cursor-pointer transition-colors duration-150"
                      style={{ borderTop: `1px solid ${Colors.divider}` }}
                      onClick={() => setSelectedOrder(order)}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          Colors.primaryLight)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "transparent")
                      }
                    >
                      {/* Order No */}
                      <td className="px-5 py-4">
                        <p
                          className="text-sm font-bold"
                          style={{ color: Colors.primary }}
                        >
                          {order.orderNo}
                        </p>
                        {order.items.some(
                          (i) => i.acceptedQty !== i.orderedQty,
                        ) && (
                          <p className="text-xs" style={{ color: "#9333ea" }}>
                            ⚡ Altered
                          </p>
                        )}
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                              color: Colors.white,
                            }}
                          >
                            {order.customer.name.charAt(0)}
                          </div>
                          <div>
                            <p
                              className="text-sm font-semibold"
                              style={{ color: Colors.textPrimary }}
                            >
                              {order.customer.name}
                            </p>
                            <p
                              className="text-xs"
                              style={{ color: Colors.textMuted }}
                            >
                              +91 {order.customer.phone}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="px-5 py-4">
                        <p
                          className="text-sm font-medium"
                          style={{ color: Colors.textSecondary }}
                        >
                          {order.items.length} item
                          {order.items.length > 1 ? "s" : ""}
                        </p>
                        <p
                          className="text-xs truncate max-w-[140px]"
                          style={{ color: Colors.textMuted }}
                        >
                          {order.items.map((i) => i.productName).join(", ")}
                        </p>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <p
                          className="text-sm font-bold"
                          style={{ color: Colors.textPrimary }}
                        >
                          ₹{order.totalAccepted.toLocaleString()}
                        </p>
                        {order.totalOrdered !== order.totalAccepted && (
                          <p
                            className="text-xs line-through"
                            style={{ color: Colors.textMuted }}
                          >
                            ₹{order.totalOrdered.toLocaleString()}
                          </p>
                        )}
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <PayBadge status={order.paymentStatus} />
                          {order.paymentMethod && (
                            <p
                              className="text-xs uppercase font-medium"
                              style={{ color: Colors.textMuted }}
                            >
                              {order.paymentMethod}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* Time */}
                      <td className="px-5 py-4">
                        <p
                          className="text-xs whitespace-nowrap"
                          style={{ color: Colors.textMuted }}
                        >
                          {timeAgo(order.createdAt)}
                        </p>
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4">
                        <button
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: Colors.primaryLight,
                            color: Colors.primary,
                          }}
                        >
                          <Eye size={13} strokeWidth={2} /> View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            className="px-6 py-3"
            style={{
              borderTop: `1px solid ${Colors.divider}`,
              background: Colors.surfaceAlt,
            }}
          >
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Showing {filtered.length} of {orders.length} orders
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp   { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0);    opacity: 1; } }
        @keyframes drawerIn  { from { transform: translateX(100%);  opacity: 0; } to { transform: translateX(0);   opacity: 1; } }
        input::placeholder   { color: ${Colors.textMuted}; }
        select option        { color: ${Colors.textPrimary}; background: ${Colors.surface}; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </>
  );
}
