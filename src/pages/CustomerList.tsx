import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Trash2,
  Search,
  Phone,
  MapPin,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
  Eye,
  UserCheck,
  UserMinus,
  Ban,
  ShieldCheck,
  Clock,
} from "lucide-react";
import Colors from "../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  _id: string;
  phone: string;
  role: string;
  isProfileComplete: boolean;
  approvalStatus: "auto" | "manual" | "approved" | "rejected" | "pending";
  isActive: boolean;
  profile?: {
    contactName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstNumber?: string;
    latitude?: number | null;
    longitude?: number | null;
  };
  createdAt: string;
}

// ─── API Config ──────────────────────────────────────────────────────────────
// const API_BASE = "https://customer-7bcb.onrender.com";
const API_BASE = "https://customer-xnab.onrender.com";
// const API_BASE = "http://localhost:5000";

const getAuthToken = (): string | null => {
  return localStorage.getItem("token") ?? localStorage.getItem("adminToken");
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data: any;
  const contentType = res.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    const text = await res.text();
    console.error("❌ Non-JSON response:", text.substring(0, 200));
    throw new Error(text.substring(0, 100) || "Server error");
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  return data;
};

// ─── Helper Functions ────────────────────────────────────────────────────────
const getCustomerName = (customer: Customer): string => {
  return (
    customer.profile?.contactName ||
    `User ${customer.phone?.slice(-4) || "Unknown"}`
  );
};

const getCustomerAddress = (customer: Customer): string => {
  const p = customer.profile;
  if (!p) return "No address added";
  const parts = [
    p.addressLine1,
    p.addressLine2,
    p.city,
    p.state,
    p.pincode,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "No address added";
};

const formatPhone = (phone: string): string => {
  if (!phone) return "N/A";
  return `+91 ${phone}`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getApprovalStatusBadge = (status: string) => {
  const configs: Record<
    string,
    { label: string; color: string; bg: string; icon: React.ElementType }
  > = {
    auto: {
      label: "Auto Approved",
      color: "#059669",
      bg: "#d1fae5",
      icon: ShieldCheck,
    },
    approved: {
      label: "Approved",
      color: "#059669",
      bg: "#d1fae5",
      icon: CheckCircle2,
    },
    pending: { label: "Pending", color: "#D97706", bg: "#FEF3C7", icon: Clock },
    manual: {
      label: "Manual Review",
      color: "#D97706",
      bg: "#FEF3C7",
      icon: Clock,
    },
    rejected: { label: "Rejected", color: "#DC2626", bg: "#FEE2E2", icon: Ban },
  };
  return configs[status] || configs.pending;
};

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({
  type = "success",
  message,
  onClose,
}: {
  type?: "success" | "error";
  message: string;
  onClose: () => void;
}) => (
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

// ── View Customer Details Modal ───────────────────────────────────────────────
function ViewCustomerModal({
  customer,
  onClose,
}: {
  customer: Customer;
  onClose: () => void;
}) {
  const approvalCfg = getApprovalStatusBadge(customer.approvalStatus);
  const ApprovalIcon = approvalCfg.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: Colors.overlay }}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: Colors.surface,
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          maxHeight: "85vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{
            background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
          }}
        >
          <div className="flex items-center gap-2">
            <Eye size={18} color={Colors.white} strokeWidth={2} />
            <p className="text-base font-bold text-white">Customer Details</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.18)",
              color: Colors.white,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Customer Info */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
              }}
            >
              {getCustomerName(customer).charAt(0)}
            </div>
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: Colors.textPrimary }}
              >
                {getCustomerName(customer)}
              </h2>
              <div className="flex items-center gap-1.5">
                <Phone size={14} color={Colors.primary} />
                <span
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  {formatPhone(customer.phone)}
                </span>
              </div>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span
              className="text-xs px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1"
              style={{ background: approvalCfg.bg, color: approvalCfg.color }}
            >
              <ApprovalIcon size={12} strokeWidth={2.5} />
              {approvalCfg.label}
            </span>
            <span
              className="text-xs px-2.5 py-1 rounded-xl font-semibold"
              style={{
                background: customer.isActive ? "#E8F5E9" : "#FFF0F3",
                color: customer.isActive ? "#4CAF50" : "#E53935",
              }}
            >
              {customer.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div style={{ height: 1, background: Colors.divider }} />

          {/* Address */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wide mb-2"
              style={{ color: Colors.textMuted }}
            >
              Delivery Address
            </p>
            <div className="flex items-start gap-2">
              <MapPin size={16} color={Colors.primary} className="mt-0.5" />
              <p
                className="text-sm leading-relaxed"
                style={{ color: Colors.textSecondary }}
              >
                {getCustomerAddress(customer)}
              </p>
            </div>
          </div>

          {/* GST */}
          <div>
            <p
              className="text-xs font-bold uppercase tracking-wide mb-1"
              style={{ color: Colors.textMuted }}
            >
              GST Number
            </p>
            <p
              className="text-sm font-mono"
              style={{
                color: customer.profile?.gstNumber
                  ? Colors.info
                  : Colors.textMuted,
              }}
            >
              {customer.profile?.gstNumber || "Not provided"}
            </p>
          </div>

          {/* Location */}
          {customer.profile?.latitude && customer.profile?.longitude && (
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: Colors.textMuted }}
              >
                GPS Location
              </p>
              <p
                className="text-sm font-mono"
                style={{ color: Colors.textSecondary }}
              >
                {customer.profile.latitude.toFixed(6)},{" "}
                {customer.profile.longitude.toFixed(6)}
              </p>
            </div>
          )}

          <div style={{ height: 1, background: Colors.divider }} />

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: Colors.textMuted }}
              >
                Registered On
              </p>
              <p className="text-sm" style={{ color: Colors.textSecondary }}>
                {formatDate(customer.createdAt)}
              </p>
            </div>
            <div>
              <p
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: Colors.textMuted }}
              >
                Profile Status
              </p>
              <p
                className="text-sm"
                style={{
                  color: customer.isProfileComplete
                    ? Colors.success
                    : Colors.warning,
                }}
              >
                {customer.isProfileComplete ? "Complete" : "Incomplete"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Action Modal ──────────────────────────────────────────────────────
function ConfirmModal({
  title,
  message,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
  loading,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: Colors.overlay }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 relative"
        style={{
          background: Colors.surface,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl"
          style={{ color: Colors.textMuted }}
        >
          <X size={18} />
        </button>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: `${confirmColor}18` }}
        >
          <AlertTriangle size={24} color={confirmColor} />
        </div>
        <h3
          className="text-base font-bold mb-1"
          style={{ color: Colors.textPrimary }}
        >
          {title}
        </h3>
        <p className="text-sm mb-5" style={{ color: Colors.textSecondary }}>
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
            style={{
              background: Colors.surfaceAlt,
              color: Colors.textSecondary,
              border: `1.5px solid ${Colors.border}`,
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{
              background: confirmColor,
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject" | "activate" | "deactivate" | "delete";
    customer: Customer;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // ── Fetch Customers ────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch("/api/admin/customers?limit=200");
      if (data.success && data.data?.customers) {
        setCustomers(data.data.customers);
        console.log(`📦 Loaded ${data.data.customers.length} customers`);
      } else {
        setCustomers([]);
      }
    } catch (err: any) {
      console.error("❌ Failed to load customers:", err);
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // ── Handle Actions ─────────────────────────────────────────────────────────
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleApprove = async (customer: Customer) => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/admin/customers/${customer._id}/approve`, {
        method: "PATCH",
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, approvalStatus: "approved" } : c,
        ),
      );
      showToast("success", `${getCustomerName(customer)} approved!`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to approve");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleReject = async (customer: Customer) => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/admin/customers/${customer._id}/reject`, {
        method: "PATCH",
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id
            ? { ...c, approvalStatus: "rejected", isActive: false }
            : c,
        ),
      );
      showToast("success", `${getCustomerName(customer)} rejected!`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to reject");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleToggleActive = async (customer: Customer) => {
    const newActive = !customer.isActive;
    setActionLoading(true);
    try {
      const endpoint = newActive ? "activate" : "deactivate";
      await apiFetch(`/api/admin/customers/${customer._id}/${endpoint}`, {
        method: "PATCH",
      });
      setCustomers((prev) =>
        prev.map((c) =>
          c._id === customer._id ? { ...c, isActive: newActive } : c,
        ),
      );
      showToast(
        "success",
        `${getCustomerName(customer)} ${newActive ? "activated" : "deactivated"}!`,
      );
    } catch (err: any) {
      showToast("error", err.message || "Failed to update status");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  const handleDelete = async (customer: Customer) => {
    setActionLoading(true);
    try {
      await apiFetch(`/api/admin/customers/${customer._id}`, {
        method: "DELETE",
      });
      setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
      showToast("success", `${getCustomerName(customer)} deleted!`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete");
    } finally {
      setActionLoading(false);
      setConfirmAction(null);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = customers
    .filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        getCustomerName(c).toLowerCase().includes(q) ||
        (c.phone || "").includes(q) ||
        getCustomerAddress(c).toLowerCase().includes(q) ||
        (c.profile?.gstNumber || "").toLowerCase().includes(q);
      const matchStatus =
        statusFilter === "All" || c.approvalStatus === statusFilter;
      return matchSearch && matchStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.isActive).length,
    pending: customers.filter(
      (c) => c.approvalStatus === "pending" || c.approvalStatus === "manual",
    ).length,
    approved: customers.filter(
      (c) => c.approvalStatus === "approved" || c.approvalStatus === "auto",
    ).length,
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin" size={32} color={Colors.primary} />
        <span className="ml-3 text-sm" style={{ color: Colors.textMuted }}>
          Loading customers...
        </span>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error && customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle size={48} color={Colors.error} />
        <p className="text-sm" style={{ color: Colors.error }}>
          {error}
        </p>
        <button
          onClick={fetchCustomers}
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

      {viewCustomer && (
        <ViewCustomerModal
          customer={viewCustomer}
          onClose={() => setViewCustomer(null)}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          title={
            confirmAction.type === "approve"
              ? "Approve Customer?"
              : confirmAction.type === "reject"
                ? "Reject Customer?"
                : confirmAction.type === "activate"
                  ? "Activate Customer?"
                  : confirmAction.type === "deactivate"
                    ? "Deactivate Customer?"
                    : "Delete Customer?"
          }
          message={
            confirmAction.type === "approve"
              ? `${getCustomerName(confirmAction.customer)} will be able to place orders.`
              : confirmAction.type === "reject"
                ? `${getCustomerName(confirmAction.customer)} will be rejected and deactivated.`
                : confirmAction.type === "activate"
                  ? `${getCustomerName(confirmAction.customer)} will be able to access the app again.`
                  : confirmAction.type === "deactivate"
                    ? `${getCustomerName(confirmAction.customer)} will no longer be able to place orders.`
                    : `Permanently delete ${getCustomerName(confirmAction.customer)}? This cannot be undone.`
          }
          confirmLabel={
            confirmAction.type === "approve"
              ? "Approve"
              : confirmAction.type === "reject"
                ? "Reject"
                : confirmAction.type === "activate"
                  ? "Activate"
                  : confirmAction.type === "deactivate"
                    ? "Deactivate"
                    : "Delete"
          }
          confirmColor={
            confirmAction.type === "approve" ||
            confirmAction.type === "activate"
              ? "#059669"
              : confirmAction.type === "reject" ||
                  confirmAction.type === "deactivate"
                ? "#D97706"
                : "#DC2626"
          }
          onConfirm={() => {
            if (confirmAction.type === "approve")
              handleApprove(confirmAction.customer);
            else if (confirmAction.type === "reject")
              handleReject(confirmAction.customer);
            else if (
              confirmAction.type === "activate" ||
              confirmAction.type === "deactivate"
            )
              handleToggleActive(confirmAction.customer);
            else handleDelete(confirmAction.customer);
          }}
          onCancel={() => setConfirmAction(null)}
          loading={actionLoading}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Users size={20} color={Colors.primary} />
              <h1
                className="text-xl font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Customer List
              </h1>
            </div>
            <p className="text-sm" style={{ color: Colors.textMuted }}>
              {customers.length} total customers
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: Colors.primaryLight, color: Colors.primary }}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
              Refresh
            </button>
            <div className="relative w-full sm:w-72">
              <Search
                size={17}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                color={searchFocused ? Colors.primary : Colors.textMuted}
              />
              <input
                type="text"
                placeholder="Search customers…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none"
                style={{
                  background: searchFocused
                    ? Colors.primaryLight
                    : Colors.surface,
                  border: `1.5px solid ${searchFocused ? Colors.borderFocus : Colors.border}`,
                  color: Colors.textPrimary,
                }}
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: Users,
              color: Colors.primary,
            },
            {
              label: "Active",
              value: stats.active,
              icon: CheckCircle2,
              color: "#4CAF50",
            },
            {
              label: "Pending Approval",
              value: stats.pending,
              icon: Clock,
              color: "#D97706",
            },
            {
              label: "Approved",
              value: stats.approved,
              icon: ShieldCheck,
              color: "#059669",
            },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="rounded-2xl px-5 py-4 flex items-center gap-3"
              style={{
                background: Colors.surface,
                border: `1px solid ${Colors.border}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} color={color} />
              </div>
              <div>
                <p
                  className="text-xl font-bold"
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
          {[
            { id: "All", label: "All", color: Colors.primary },
            { id: "pending", label: "Pending", color: "#D97706" },
            { id: "manual", label: "Manual Review", color: "#D97706" },
            { id: "approved", label: "Approved", color: "#059669" },
            { id: "auto", label: "Auto Approved", color: "#059669" },
            { id: "rejected", label: "Rejected", color: "#DC2626" },
          ].map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className="px-3.5 py-2 rounded-2xl text-xs font-semibold transition-all"
                style={{
                  background: active ? tab.color : Colors.surface,
                  color: active ? "#fff" : Colors.textSecondary,
                  border: `1.5px solid ${active ? "transparent" : Colors.border}`,
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Table */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: Colors.textPrimary }}
            >
              {search || statusFilter !== "All"
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
                : "All Customers"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr style={{ background: Colors.surfaceAlt }}>
                  {[
                    "#",
                    "Customer",
                    "Phone",
                    "Address",
                    "Approval",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold uppercase"
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
                    <td colSpan={7} className="py-16 text-center">
                      <Users size={36} color={Colors.border} />
                      <p
                        className="text-sm mt-2"
                        style={{ color: Colors.textMuted }}
                      >
                        No customers found
                      </p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer, idx) => {
                    const approvalCfg = getApprovalStatusBadge(
                      customer.approvalStatus,
                    );
                    const ApprovalIcon = approvalCfg.icon;
                    const isPending =
                      customer.approvalStatus === "pending" ||
                      customer.approvalStatus === "manual";

                    return (
                      <tr
                        key={customer._id}
                        className="group"
                        style={{ borderTop: `1px solid ${Colors.divider}` }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            Colors.primaryLight)
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "transparent")
                        }
                      >
                        <td className="px-5 py-4">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{
                              background: Colors.surfaceAlt,
                              color: Colors.textSecondary,
                            }}
                          >
                            {idx + 1}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                              style={{
                                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                              }}
                            >
                              {getCustomerName(customer).charAt(0)}
                            </div>
                            <span
                              className="text-sm font-semibold"
                              style={{ color: Colors.textPrimary }}
                            >
                              {getCustomerName(customer)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <Phone size={14} color={Colors.primary} />
                            <span
                              className="text-sm"
                              style={{ color: Colors.textSecondary }}
                            >
                              {formatPhone(customer.phone)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 max-w-[180px]">
                          <div className="flex items-start gap-1.5">
                            <MapPin
                              size={14}
                              color={Colors.textMuted}
                              className="mt-0.5"
                            />
                            <span
                              className="text-sm leading-snug line-clamp-2"
                              style={{ color: Colors.textSecondary }}
                            >
                              {getCustomerAddress(customer)}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-xs px-2.5 py-1 rounded-xl font-semibold flex items-center gap-1 w-fit"
                            style={{
                              background: approvalCfg.bg,
                              color: approvalCfg.color,
                            }}
                          >
                            <ApprovalIcon size={12} strokeWidth={2.5} />
                            {approvalCfg.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className="text-xs px-2.5 py-1 rounded-xl font-semibold"
                            style={{
                              background: customer.isActive
                                ? "#E8F5E9"
                                : "#FFF0F3",
                              color: customer.isActive ? "#4CAF50" : "#E53935",
                            }}
                          >
                            {customer.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {/* View Button */}
                            <button
                              onClick={() => setViewCustomer(customer)}
                              className="p-2 rounded-xl transition-all"
                              style={{
                                background: Colors.primaryLight,
                                color: Colors.primary,
                              }}
                              title="View Details"
                            >
                              <Eye size={15} strokeWidth={2} />
                            </button>

                            {/* Approve Button (for pending customers) */}
                            {isPending && (
                              <button
                                onClick={() =>
                                  setConfirmAction({
                                    type: "approve",
                                    customer,
                                  })
                                }
                                className="p-2 rounded-xl transition-all"
                                style={{
                                  background: "#d1fae5",
                                  color: "#059669",
                                }}
                                title="Approve"
                              >
                                <CheckCircle2 size={15} strokeWidth={2} />
                              </button>
                            )}

                            {/* Reject Button (for pending customers) */}
                            {isPending && (
                              <button
                                onClick={() =>
                                  setConfirmAction({ type: "reject", customer })
                                }
                                className="p-2 rounded-xl transition-all"
                                style={{
                                  background: "#FEE2E2",
                                  color: "#DC2626",
                                }}
                                title="Reject"
                              >
                                <Ban size={15} strokeWidth={2} />
                              </button>
                            )}

                            {/* Activate/Deactivate Toggle */}
                            <button
                              onClick={() =>
                                setConfirmAction({
                                  type: customer.isActive
                                    ? "deactivate"
                                    : "activate",
                                  customer,
                                })
                              }
                              className="p-2 rounded-xl transition-all"
                              style={{
                                background: customer.isActive
                                  ? "#FFF3E0"
                                  : "#E8F5E9",
                                color: customer.isActive
                                  ? "#D97706"
                                  : "#4CAF50",
                              }}
                              title={
                                customer.isActive ? "Deactivate" : "Activate"
                              }
                            >
                              {customer.isActive ? (
                                <UserMinus size={15} strokeWidth={2} />
                              ) : (
                                <UserCheck size={15} strokeWidth={2} />
                              )}
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() =>
                                setConfirmAction({ type: "delete", customer })
                              }
                              className="p-2 rounded-xl transition-all"
                              style={{
                                background: "#FEE2E2",
                                color: "#DC2626",
                              }}
                              title="Delete"
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div
              className="px-6 py-3"
              style={{
                borderTop: `1px solid ${Colors.divider}`,
                background: Colors.surfaceAlt,
              }}
            >
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Showing {filtered.length} of {customers.length}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        input::placeholder { color: ${Colors.textMuted}; }
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </>
  );
}
