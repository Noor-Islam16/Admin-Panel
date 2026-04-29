import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Trash2,
  Search,
  Phone,
  MapPin,
  FileText,
  UserX,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import Colors from "../constants/colors";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Customer {
  _id: string;
  phone: string;
  role: string;
  isProfileComplete: boolean;
  approvalStatus: string;
  isActive: boolean;
  profile?: {
    contactName?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstNumber?: string;
  };
  createdAt: string;
}

// ─── API Config ──────────────────────────────────────────────────────────────
// ✅ Using localhost since admin panel runs in browser on same machine
const API_BASE = "https://customer-7bcb.onrender.com";

const getAuthToken = (): string | null => {
  return localStorage.getItem("token") ?? localStorage.getItem("adminToken");
};

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAuthToken();

  console.log(`📡 ${options.method || "GET"} ${API_BASE}${path}`);
  console.log(`🔑 Token: ${token ? "Present" : "Missing"}`);

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
    console.error("❌ API Error:", res.status, data);
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

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) => (
  <div
    className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl"
    style={{
      background: Colors.primaryLight,
      color: Colors.accent,
      border: `1px solid ${Colors.accentLight}`,
      animation: "slideUp 0.3s ease",
    }}
  >
    <CheckCircle2 size={18} />
    {message}
    <button onClick={onClose}>
      <X size={16} />
    </button>
  </div>
);

// ── Confirm Deactivate Modal ──────────────────────────────────────────────────
function DeactivateModal({
  customer,
  onConfirm,
  onCancel,
  loading,
}: {
  customer: Customer;
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
          boxShadow: `0 20px 60px rgba(0,0,0,0.2)`,
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
          style={{ background: "#FFF0F3" }}
        >
          <AlertTriangle size={24} color={Colors.error} />
        </div>
        <h3
          className="text-base font-bold mb-1"
          style={{ color: Colors.textPrimary }}
        >
          Deactivate Customer?
        </h3>
        <p className="text-sm mb-5" style={{ color: Colors.textSecondary }}>
          <span className="font-semibold" style={{ color: Colors.textPrimary }}>
            {getCustomerName(customer)}
          </span>{" "}
          will no longer be able to place orders.
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
              background: Colors.error,
              color: "#fff",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            Deactivate
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
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── Fetch Customers ────────────────────────────────────────────────────────
  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Correct path: /api/admin/customers
      const data = await apiFetch("/api/admin/customers?limit=200");

      if (data.success && data.data?.customers) {
        setCustomers(data.data.customers);
        console.log(`📦 Loaded ${data.data.customers.length} customers`);
      } else {
        console.warn("⚠️ Unexpected response:", data);
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

  // ── Handle Deactivate ──────────────────────────────────────────────────────
  const handleDeactivateClick = (customer: Customer) =>
    setDeleteTarget(customer);

  const confirmDeactivate = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      // ✅ Correct path: /api/admin/customers/:id/deactivate
      await apiFetch(`/api/admin/customers/${deleteTarget._id}/deactivate`, {
        method: "PATCH",
      });

      setCustomers((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setToast(`${getCustomerName(deleteTarget)} deactivated successfully`);
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.message || "Failed to deactivate customer");
    } finally {
      setDeleting(false);
    }
  };

  // ── Filter ─────────────────────────────────────────────────────────────────
  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      getCustomerName(c).toLowerCase().includes(q) ||
      (c.phone || "").includes(q) ||
      getCustomerAddress(c).toLowerCase().includes(q) ||
      (c.profile?.gstNumber || "").toLowerCase().includes(q)
    );
  });

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.isActive).length,
    inactive: customers.filter((c) => !c.isActive).length,
    withGST: customers.filter((c) => c.profile?.gstNumber).length,
    withoutGST: customers.filter((c) => !c.profile?.gstNumber).length,
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
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      {deleteTarget && (
        <DeactivateModal
          customer={deleteTarget}
          onConfirm={confirmDeactivate}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
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
              label: "With GST",
              value: stats.withGST,
              icon: FileText,
              color: Colors.info,
            },
            {
              label: "Without GST",
              value: stats.withoutGST,
              icon: UserX,
              color: Colors.warning,
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
              {search
                ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
                : "All Customers"}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr style={{ background: Colors.surfaceAlt }}>
                  {["#", "Name", "Phone", "Address", "GST", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase"
                        style={{ color: Colors.textSecondary }}
                      >
                        {h}
                      </th>
                    ),
                  )}
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
                  filtered.map((customer, idx) => (
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
                      <td className="px-5 py-4 max-w-[200px]">
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
                        {customer.profile?.gstNumber ? (
                          <span
                            className="text-xs font-mono font-semibold px-2 py-1 rounded-lg"
                            style={{
                              background: `${Colors.info}18`,
                              color: Colors.info,
                            }}
                          >
                            {customer.profile.gstNumber}
                          </span>
                        ) : (
                          <span
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{
                              background: Colors.surfaceAlt,
                              color: Colors.textMuted,
                            }}
                          >
                            N/A
                          </span>
                        )}
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
                        <button
                          onClick={() => handleDeactivateClick(customer)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold"
                          style={{
                            background: "#FFF0F3",
                            color: Colors.error,
                            border: "1px solid #FFD0DA",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = Colors.error;
                            e.currentTarget.style.color = "#fff";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#FFF0F3";
                            e.currentTarget.style.color = Colors.error;
                          }}
                        >
                          <Trash2 size={14} /> Deactivate
                        </button>
                      </td>
                    </tr>
                  ))
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
