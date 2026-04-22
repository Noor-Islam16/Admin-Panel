import { useState } from "react";
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
} from "lucide-react";
import Colors from "../constants/colors";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  gstNumber?: string;
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "1",
    name: "Rajesh Kumar",
    phone: "+91 98765 43210",
    address: "12, MG Road, Ahmedabad, Gujarat 380001",
    gstNumber: "24ABCDE1234F1Z5",
  },
  {
    id: "2",
    name: "Priya Sharma",
    phone: "+91 87654 32109",
    address: "45, Park Street, Kolkata, WB 700016",
  },
  {
    id: "3",
    name: "Amitabh Patel",
    phone: "+91 76543 21098",
    address: "8, Linking Road, Mumbai, Maharashtra 400050",
    gstNumber: "27FGHIJ5678K2L6",
  },
  {
    id: "4",
    name: "Sunita Mehta",
    phone: "+91 65432 10987",
    address: "33, Civil Lines, Jaipur, Rajasthan 302006",
  },
  {
    id: "5",
    name: "Vikram Singh",
    phone: "+91 54321 09876",
    address: "27, Sector 17, Chandigarh 160017",
    gstNumber: "03KLMNO9012P3Q7",
  },
  {
    id: "6",
    name: "Deepa Nair",
    phone: "+91 43210 98765",
    address: "19, Anna Salai, Chennai, Tamil Nadu 600002",
  },
  {
    id: "7",
    name: "Suresh Reddy",
    phone: "+91 32109 87654",
    address: "55, Banjara Hills, Hyderabad, Telangana 500034",
    gstNumber: "36PQRST3456U4V8",
  },
  {
    id: "8",
    name: "Kavita Joshi",
    phone: "+91 21098 76543",
    address: "7, Hazratganj, Lucknow, UP 226001",
  },
];

// ── Confirm Delete Modal ─────────────────────────────────────────────────────
function DeleteModal({
  customer,
  onConfirm,
  onCancel,
}: {
  customer: Customer;
  onConfirm: () => void;
  onCancel: () => void;
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
          className="absolute top-4 right-4 p-1.5 rounded-xl transition-colors"
          style={{ color: Colors.textMuted }}
        >
          <X size={18} />
        </button>

        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "#FFF0F3" }}
        >
          <AlertTriangle size={24} color={Colors.error} strokeWidth={2} />
        </div>

        <h3
          className="text-base font-bold mb-1"
          style={{ color: Colors.textPrimary }}
        >
          Delete Customer?
        </h3>
        <p className="text-sm mb-5" style={{ color: Colors.textSecondary }}>
          You're about to permanently delete{" "}
          <span className="font-semibold" style={{ color: Colors.textPrimary }}>
            {customer.name}
          </span>
          . This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
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
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
            style={{
              background: Colors.error,
              color: Colors.white,
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CustomerList() {
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.address.toLowerCase().includes(search.toLowerCase()) ||
      (c.gstNumber ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const handleDelete = (customer: Customer) => setDeleteTarget(customer);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <>
      {deleteTarget && (
        <DeleteModal
          customer={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <div className="flex flex-col gap-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Users size={20} color={Colors.primary} strokeWidth={2} />
              <h1
                className="text-xl font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Customer List
              </h1>
            </div>
            <p className="text-sm" style={{ color: Colors.textMuted }}>
              {customers.length} total customers registered
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
              style={{
                color: searchFocused ? Colors.primary : Colors.textMuted,
              }}
            >
              <Search size={17} strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Search customers…"
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
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            {
              label: "Total Customers",
              value: customers.length,
              icon: Users,
              color: Colors.primary,
            },
            {
              label: "With GST",
              value: customers.filter((c) => c.gstNumber).length,
              icon: FileText,
              color: Colors.info,
            },
            {
              label: "Without GST",
              value: customers.filter((c) => !c.gstNumber).length,
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
                boxShadow: `0 2px 8px ${Colors.shadow}`,
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}18` }}
              >
                <Icon size={20} color={color} strokeWidth={2} />
              </div>
              <div>
                <p
                  className="text-xl font-bold leading-tight"
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

        {/* ── Table Card ── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            boxShadow: `0 4px 16px ${Colors.shadow}`,
          }}
        >
          {/* Table Header */}
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

          {/* Scrollable Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr style={{ background: Colors.surfaceAlt }}>
                  {[
                    "#",
                    "Name",
                    "Phone / WhatsApp",
                    "Address",
                    "GST Number",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold tracking-wide uppercase"
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
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Users
                          size={36}
                          color={Colors.border}
                          strokeWidth={1.5}
                        />
                        <p
                          className="text-sm font-medium"
                          style={{ color: Colors.textMuted }}
                        >
                          No customers found
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((customer, idx) => (
                    <tr
                      key={customer.id}
                      className="group transition-colors duration-150"
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
                      {/* # */}
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

                      {/* Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                              color: Colors.white,
                            }}
                          >
                            {customer.name.charAt(0)}
                          </div>
                          <span
                            className="text-sm font-semibold"
                            style={{ color: Colors.textPrimary }}
                          >
                            {customer.name}
                          </span>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5">
                          <Phone
                            size={14}
                            color={Colors.primary}
                            strokeWidth={2}
                          />
                          <span
                            className="text-sm"
                            style={{ color: Colors.textSecondary }}
                          >
                            {customer.phone}
                          </span>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-5 py-4 max-w-[220px]">
                        <div className="flex items-start gap-1.5">
                          <MapPin
                            size={14}
                            color={Colors.textMuted}
                            strokeWidth={2}
                            className="mt-0.5 flex-shrink-0"
                          />
                          <span
                            className="text-sm leading-snug line-clamp-2"
                            style={{ color: Colors.textSecondary }}
                          >
                            {customer.address}
                          </span>
                        </div>
                      </td>

                      {/* GST */}
                      <td className="px-5 py-4">
                        {customer.gstNumber ? (
                          <div className="flex items-center gap-1.5">
                            <FileText
                              size={14}
                              color={Colors.info}
                              strokeWidth={2}
                            />
                            <span
                              className="text-xs font-mono font-semibold px-2 py-1 rounded-lg"
                              style={{
                                background: `${Colors.info}18`,
                                color: Colors.info,
                              }}
                            >
                              {customer.gstNumber}
                            </span>
                          </div>
                        ) : (
                          <span
                            className="text-xs px-2 py-1 rounded-lg font-medium"
                            style={{
                              background: Colors.surfaceAlt,
                              color: Colors.textMuted,
                            }}
                          >
                            N/A
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleDelete(customer)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: "#FFF0F3",
                            color: Colors.error,
                            border: `1px solid #FFD0DA`,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              Colors.error;
                            (e.currentTarget as HTMLElement).style.color =
                              Colors.white;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "#FFF0F3";
                            (e.currentTarget as HTMLElement).style.color =
                              Colors.error;
                          }}
                        >
                          <Trash2 size={14} strokeWidth={2} />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {filtered.length > 0 && (
            <div
              className="px-6 py-3 flex items-center justify-between"
              style={{
                borderTop: `1px solid ${Colors.divider}`,
                background: Colors.surfaceAlt,
              }}
            >
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Showing {filtered.length} of {customers.length} customers
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        input::placeholder { color: ${Colors.textMuted}; }
      `}</style>
    </>
  );
}
