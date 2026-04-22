import { useState } from "react";
import {
  Settings,
  MessageCircle,
  Bell,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Phone,
  Mail,
  Eye,
  EyeOff,
  Plus,
  Lock,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  Users,
  Save,
  RefreshCw,
} from "lucide-react";
import Colors from "../constants/colors";

// ── Types ─────────────────────────────────────────────────────────────────────
interface WhatsAppRecipient {
  id: string;
  label: string; // "Delivery Team", "Accounts", etc.
  number: string;
  isGroup: boolean;
  active: boolean;
}

interface NotificationTemplate {
  id: string;
  event: string;
  message: string;
  active: boolean;
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

// ── Section Card ──────────────────────────────────────────────────────────────
function SectionCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: Colors.surface,
        border: `1px solid ${Colors.border}`,
        boxShadow: `0 4px 16px ${Colors.shadow}`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-5"
        style={{
          background: `linear-gradient(135deg, ${Colors.gradientStart}08, ${Colors.gradientEnd}12)`,
          borderBottom: `1px solid ${Colors.divider}`,
        }}
      >
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
          }}
        >
          <Icon size={20} color={Colors.white} strokeWidth={1.8} />
        </div>
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: Colors.textPrimary }}
          >
            {title}
          </p>
          <p className="text-xs" style={{ color: Colors.textMuted }}>
            {subtitle}
          </p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ── Field Row ─────────────────────────────────────────────────────────────────
function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: Colors.textSecondary }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function InputField({
  icon: Icon,
  focused,
  value,
  onChange,
  onFocus,
  onBlur,
  placeholder,
  type = "text",
  readOnly = false,
}: {
  icon: React.ElementType;
  focused: boolean;
  value: string;
  onChange?: (v: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  placeholder?: string;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div
      className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-200"
      style={{
        background: readOnly
          ? Colors.surfaceAlt
          : focused
            ? Colors.primaryLight
            : Colors.surfaceAlt,
        border: `1.5px solid ${focused ? Colors.borderFocus : Colors.border}`,
      }}
    >
      <div
        className="absolute left-3.5 pointer-events-none"
        style={{ color: focused ? Colors.primary : Colors.textMuted }}
      >
        <Icon size={17} strokeWidth={2} />
      </div>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3.5 text-sm outline-none bg-transparent"
        style={{
          color: readOnly ? Colors.textMuted : Colors.textPrimary,
          cursor: readOnly ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}

// ── Toggle Row ────────────────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
      style={{
        background: Colors.surfaceAlt,
        border: `1.5px solid ${Colors.border}`,
      }}
    >
      <div>
        <p
          className="text-sm font-semibold"
          style={{ color: Colors.textPrimary }}
        >
          {label}
        </p>
        <p className="text-xs mt-0.5" style={{ color: Colors.textMuted }}>
          {description}
        </p>
      </div>
      <button
        onClick={() => onChange(!value)}
        style={{
          color: value ? Colors.primary : Colors.textMuted,
          flexShrink: 0,
          marginLeft: 12,
        }}
      >
        {value ? (
          <ToggleRight size={34} strokeWidth={1.5} />
        ) : (
          <ToggleLeft size={34} strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}

// ── Save Button ───────────────────────────────────────────────────────────────
function SaveBtn({
  loading,
  onClick,
  label = "Save Changes",
}: {
  loading: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200"
      style={{
        background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
        color: Colors.white,
        boxShadow: `0 4px 14px rgba(0,168,132,0.3)`,
        opacity: loading ? 0.8 : 1,
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? (
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
      ) : (
        <Save size={16} strokeWidth={2} />
      )}
      {loading ? "Saving…" : label}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function SettingsPage() {
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [focused, setFocused] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [dangerInput, setDangerInput] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const save = async (key: string, msg: string) => {
    setLoading((prev) => ({ ...prev, [key]: true }));
    await new Promise((r) => setTimeout(r, 900));
    setLoading((prev) => ({ ...prev, [key]: false }));
    showToast("success", msg);
  };

  // ── Store Info ─────────────────────────────────────────────────────────────
  //   const [store, setStore] = useState({
  //     name: "Nilkanth Medical Store",
  //     phone: "+91 98765 43210",
  //     email: "nilkanth@medstore.com",
  //     address: "Shop No. 4, Ramnagar Society, Ahmedabad, Gujarat 380015",
  //     website: "",
  //     logoUrl: "",
  //   });

  // ── WhatsApp Config ────────────────────────────────────────────────────────
  const [waRecipients, setWaRecipients] = useState<WhatsAppRecipient[]>([
    {
      id: "1",
      label: "Delivery Team",
      number: "9876543210",
      isGroup: false,
      active: true,
    },
    {
      id: "2",
      label: "Accounts",
      number: "9876500000",
      isGroup: false,
      active: true,
    },
    {
      id: "3",
      label: "Internal Group",
      number: "120363xxxxxx@g.us",
      isGroup: true,
      active: false,
    },
  ]);
  const [newRecipient, setNewRecipient] = useState({
    label: "",
    number: "",
    isGroup: false,
  });
  const [showAddRecipient, setShowAddRecipient] = useState(false);
  const [waSettings, setWaSettings] = useState({
    sendOnOrderPlaced: true,
    sendOnOrderAltered: true,
    sendOnDispatched: true,
    includeLocation: true,
    includeGstDetails: true,
  });

  // ── Notification Templates ─────────────────────────────────────────────────
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      event: "New Order Placed",
      message:
        "🛍️ New order {{orderNo}} from {{customerName}} for ₹{{total}}. Review now.",
      active: true,
    },
    {
      id: "2",
      event: "Order Dispatched",
      message:
        "🚚 Order {{orderNo}} dispatched to {{customerName}}. Delivery in progress.",
      active: true,
    },
    {
      id: "3",
      event: "Payment Received",
      message: "💰 Payment of ₹{{amount}} received for order {{orderNo}}.",
      active: true,
    },
    {
      id: "4",
      event: "Low Stock Alert",
      message:
        "⚠️ {{productName}} is running low ({{qty}} units left). Restock soon.",
      active: false,
    },
    {
      id: "5",
      event: "Out of Stock",
      message:
        "❌ {{productName}} is now OUT OF STOCK. Orders will be blocked.",
      active: true,
    },
  ]);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);
  const [templateDraft, setTemplateDraft] = useState("");

  // ── Admin Credentials ──────────────────────────────────────────────────────
  const [credentials, setCredentials] = useState({
    currentEmail: import.meta.env.VITE_ADMIN_EMAIL ?? "admin@nilkanth.com",
    newEmail: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  Handlers
  // ─────────────────────────────────────────────────────────────────────────
  const handleAddRecipient = () => {
    if (!newRecipient.label.trim() || !newRecipient.number.trim()) {
      showToast("error", "Label and number are required.");
      return;
    }
    setWaRecipients((prev) => [
      ...prev,
      { id: Date.now().toString(), ...newRecipient, active: true },
    ]);
    setNewRecipient({ label: "", number: "", isGroup: false });
    setShowAddRecipient(false);
    showToast("success", "Recipient added!");
  };

  const handleRemoveRecipient = (id: string) => {
    setWaRecipients((prev) => prev.filter((r) => r.id !== id));
    showToast("success", "Recipient removed.");
  };

  const handleSaveTemplate = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, message: templateDraft } : t)),
    );
    setEditingTemplate(null);
    showToast("success", "Template saved!");
  };

  const handleChangePassword = async () => {
    if (
      !credentials.oldPassword ||
      !credentials.newPassword ||
      !credentials.confirmPassword
    ) {
      showToast("error", "All password fields are required.");
      return;
    }
    if (credentials.newPassword !== credentials.confirmPassword) {
      showToast("error", "New passwords do not match.");
      return;
    }
    if (credentials.newPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters.");
      return;
    }
    await save(
      "password",
      "Password updated! Update your .env file accordingly.",
    );
    setCredentials((prev) => ({
      ...prev,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  const handleDangerReset = () => {
    if (dangerInput !== "RESET") {
      showToast("error", 'Type "RESET" to confirm.');
      return;
    }
    showToast("success", "All data has been reset to defaults.");
    setShowDangerConfirm(false);
    setDangerInput("");
  };

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-6 pb-8">
        {/* ── Page Header ── */}
        <div className="flex items-center gap-2">
          <Settings size={20} color={Colors.primary} strokeWidth={2} />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: Colors.textPrimary }}
            >
              Settings
            </h1>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Manage store, WhatsApp, notifications and admin preferences
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════
            1. STORE INFORMATION
        ══════════════════════════════════════ */}
        {/* <SectionCard
          icon={Store}
          title="Store Information"
          subtitle="Your pharmacy's public details"
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0"
                style={{
                  background: store.logoUrl
                    ? "transparent"
                    : `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                  border: `2px dashed ${Colors.border}`,
                }}
              >
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt="logo"
                    className="w-full h-full object-cover"
                    onError={() => setStore((p) => ({ ...p, logoUrl: "" }))}
                  />
                ) : (
                  <span
                    className="text-xl font-black"
                    style={{ color: Colors.white }}
                  >
                    N
                  </span>
                )}
              </div>
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: Colors.textPrimary }}
                >
                  Store Logo
                </p>
                <p className="text-xs mb-2" style={{ color: Colors.textMuted }}>
                  PNG or JPG, min 200×200px
                </p>
                <button
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                  style={{
                    background: Colors.primaryLight,
                    color: Colors.primary,
                    border: `1px solid ${Colors.accentLight}`,
                  }}
                >
                  <Upload size={13} strokeWidth={2} /> Upload Logo
                </button>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file)
                      setStore((p) => ({
                        ...p,
                        logoUrl: URL.createObjectURL(file),
                      }));
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldRow label="Store Name">
                <InputField
                  icon={Store}
                  focused={focused === "sname"}
                  value={store.name}
                  onChange={(v) => setStore((p) => ({ ...p, name: v }))}
                  onFocus={() => setFocused("sname")}
                  onBlur={() => setFocused("")}
                  placeholder="Nilkanth Medical Store"
                />
              </FieldRow>
              <FieldRow label="Phone Number">
                <InputField
                  icon={Phone}
                  focused={focused === "sphone"}
                  value={store.phone}
                  onChange={(v) => setStore((p) => ({ ...p, phone: v }))}
                  onFocus={() => setFocused("sphone")}
                  onBlur={() => setFocused("")}
                  placeholder="+91 98765 43210"
                />
              </FieldRow>
              <FieldRow label="Email">
                <InputField
                  icon={Mail}
                  focused={focused === "semail"}
                  value={store.email}
                  onChange={(v) => setStore((p) => ({ ...p, email: v }))}
                  onFocus={() => setFocused("semail")}
                  onBlur={() => setFocused("")}
                  placeholder="store@example.com"
                />
              </FieldRow>
              <FieldRow label="Website (optional)">
                <InputField
                  icon={Globe}
                  focused={focused === "sweb"}
                  value={store.website}
                  onChange={(v) => setStore((p) => ({ ...p, website: v }))}
                  onFocus={() => setFocused("sweb")}
                  onBlur={() => setFocused("")}
                  placeholder="https://nilkanthmedical.com"
                />
              </FieldRow>
            </div>
            <FieldRow label="Store Address">
              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background:
                    focused === "saddr"
                      ? Colors.primaryLight
                      : Colors.surfaceAlt,
                  border: `1.5px solid ${focused === "saddr" ? Colors.borderFocus : Colors.border}`,
                }}
              >
                <div
                  className="absolute top-3.5 left-3.5 pointer-events-none"
                  style={{
                    color:
                      focused === "saddr" ? Colors.primary : Colors.textMuted,
                  }}
                >
                  <MapPin size={17} strokeWidth={2} />
                </div>
                <textarea
                  rows={2}
                  value={store.address}
                  onChange={(e) =>
                    setStore((p) => ({ ...p, address: e.target.value }))
                  }
                  onFocus={() => setFocused("saddr")}
                  onBlur={() => setFocused("")}
                  placeholder="Full store address…"
                  className="w-full pl-10 pr-4 py-3.5 text-sm outline-none resize-none bg-transparent"
                  style={{ color: Colors.textPrimary }}
                />
              </div>
            </FieldRow>

            <div className="flex justify-end">
              <SaveBtn
                loading={!!loading["store"]}
                onClick={() => save("store", "Store information saved!")}
              />
            </div>
          </div>
        </SectionCard> */}

        {/* ══════════════════════════════════════
            2. WHATSAPP CONFIGURATION
        ══════════════════════════════════════ */}
        <SectionCard
          icon={MessageCircle}
          title="WhatsApp Configuration"
          subtitle="Recipients and sharing preferences for order notifications"
        >
          <div className="flex flex-col gap-5">
            {/* Recipients list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: Colors.textMuted }}
                >
                  Recipients / Groups
                </p>
                <button
                  onClick={() => setShowAddRecipient((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                  style={{
                    background: Colors.primaryLight,
                    color: Colors.primary,
                    border: `1px solid ${Colors.accentLight}`,
                  }}
                >
                  <Plus size={14} strokeWidth={2.5} /> Add Recipient
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {waRecipients.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{
                      background: r.active ? Colors.surfaceAlt : "#FAFAFA",
                      border: `1.5px solid ${r.active ? Colors.border : Colors.divider}`,
                      opacity: r.active ? 1 : 0.6,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: r.isGroup
                          ? `${Colors.info}18`
                          : Colors.primaryLight,
                      }}
                    >
                      {r.isGroup ? (
                        <Users size={17} color={Colors.info} strokeWidth={2} />
                      ) : (
                        <Phone
                          size={17}
                          color={Colors.primary}
                          strokeWidth={2}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: Colors.textPrimary }}
                      >
                        {r.label}
                      </p>
                      <p
                        className="text-xs truncate"
                        style={{ color: Colors.textMuted }}
                      >
                        {r.isGroup ? "Group" : "+91"} {r.number}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setWaRecipients((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, active: !x.active } : x,
                          ),
                        )
                      }
                      style={{
                        color: r.active ? Colors.primary : Colors.textMuted,
                      }}
                    >
                      {r.active ? (
                        <ToggleRight size={30} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={30} strokeWidth={1.5} />
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveRecipient(r.id)}
                      className="p-1.5 rounded-xl transition-colors"
                      style={{ color: Colors.textMuted }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          Colors.error;
                        (e.currentTarget as HTMLElement).style.background =
                          "#FFF0F3";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color =
                          Colors.textMuted;
                        (e.currentTarget as HTMLElement).style.background =
                          "transparent";
                      }}
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add recipient inline form */}
              {showAddRecipient && (
                <div
                  className="mt-3 p-4 rounded-2xl flex flex-col gap-3"
                  style={{
                    background: Colors.primaryLight,
                    border: `1.5px solid ${Colors.accentLight}`,
                  }}
                >
                  <p
                    className="text-xs font-bold uppercase tracking-wide"
                    style={{ color: Colors.accent }}
                  >
                    New Recipient
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className="relative flex items-center rounded-2xl overflow-hidden"
                      style={{
                        background: Colors.surface,
                        border: `1.5px solid ${Colors.border}`,
                      }}
                    >
                      <div
                        className="absolute left-3.5 pointer-events-none"
                        style={{ color: Colors.textMuted }}
                      >
                        <Users size={16} strokeWidth={2} />
                      </div>
                      <input
                        type="text"
                        placeholder="Label (e.g. Delivery)"
                        value={newRecipient.label}
                        onChange={(e) =>
                          setNewRecipient((p) => ({
                            ...p,
                            label: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 text-sm outline-none bg-transparent"
                        style={{ color: Colors.textPrimary }}
                      />
                    </div>
                    <div
                      className="relative flex items-center rounded-2xl overflow-hidden"
                      style={{
                        background: Colors.surface,
                        border: `1.5px solid ${Colors.border}`,
                      }}
                    >
                      <div
                        className="absolute left-3.5 pointer-events-none"
                        style={{ color: Colors.textMuted }}
                      >
                        <Phone size={16} strokeWidth={2} />
                      </div>
                      <input
                        type="text"
                        placeholder="Phone or Group ID"
                        value={newRecipient.number}
                        onChange={(e) =>
                          setNewRecipient((p) => ({
                            ...p,
                            number: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-3 text-sm outline-none bg-transparent"
                        style={{ color: Colors.textPrimary }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label
                      className="flex items-center gap-2 cursor-pointer text-sm"
                      style={{ color: Colors.textSecondary }}
                    >
                      <input
                        type="checkbox"
                        checked={newRecipient.isGroup}
                        onChange={(e) =>
                          setNewRecipient((p) => ({
                            ...p,
                            isGroup: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 rounded accent-primary"
                      />
                      This is a WhatsApp Group
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowAddRecipient(false)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          background: Colors.surface,
                          color: Colors.textSecondary,
                          border: `1px solid ${Colors.border}`,
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddRecipient}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold"
                        style={{
                          background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                          color: Colors.white,
                        }}
                      >
                        <Plus size={14} strokeWidth={2.5} /> Add
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Share preferences */}
            <div className="flex flex-col gap-2">
              <p
                className="text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: Colors.textMuted }}
              >
                Share Preferences
              </p>
              {[
                {
                  key: "sendOnOrderPlaced",
                  label: "Share on New Order",
                  desc: "Send message when a new order is placed",
                },
                {
                  key: "sendOnOrderAltered",
                  label: "Share on Order Altered",
                  desc: "Notify when admin modifies order quantities",
                },
                {
                  key: "sendOnDispatched",
                  label: "Share on Dispatch",
                  desc: "Send when order is marked dispatched",
                },
                {
                  key: "includeLocation",
                  label: "Include Google Maps Link",
                  desc: "Attach customer's location in every message",
                },
                {
                  key: "includeGstDetails",
                  label: "Include GST Details",
                  desc: "Attach GST number if available",
                },
              ].map(({ key, label, desc }) => (
                <ToggleRow
                  key={key}
                  label={label}
                  description={desc}
                  value={waSettings[key as keyof typeof waSettings]}
                  onChange={(v) => setWaSettings((p) => ({ ...p, [key]: v }))}
                />
              ))}
            </div>

            <div className="flex justify-end">
              <SaveBtn
                loading={!!loading["wa"]}
                onClick={() => save("wa", "WhatsApp settings saved!")}
              />
            </div>
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════
            3. PUSH NOTIFICATION TEMPLATES
        ══════════════════════════════════════ */}
        <SectionCard
          icon={Bell}
          title="Push Notification Templates"
          subtitle="Customize in-app notification messages for each event"
        >
          <div className="flex flex-col gap-3">
            <p
              className="text-xs px-3 py-2 rounded-xl"
              style={{
                background: Colors.primaryLight,
                color: Colors.textSecondary,
              }}
            >
              Available variables:{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: Colors.primary }}
              >
                {"{{orderNo}}"}
              </span>{" "}
              ·{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: Colors.primary }}
              >
                {"{{customerName}}"}
              </span>{" "}
              ·{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: Colors.primary }}
              >
                {"{{total}}"}
              </span>{" "}
              ·{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: Colors.primary }}
              >
                {"{{productName}}"}
              </span>{" "}
              ·{" "}
              <span
                className="font-mono font-semibold"
                style={{ color: Colors.primary }}
              >
                {"{{qty}}"}
              </span>
            </p>

            {templates.map((t) => (
              <div
                key={t.id}
                className="rounded-2xl overflow-hidden"
                style={{
                  border: `1.5px solid ${t.active ? Colors.border : Colors.divider}`,
                  opacity: t.active ? 1 : 0.65,
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    background: Colors.surfaceAlt,
                    borderBottom: `1px solid ${Colors.divider}`,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Bell
                      size={15}
                      color={t.active ? Colors.primary : Colors.textMuted}
                      strokeWidth={2}
                    />
                    <p
                      className="text-sm font-semibold"
                      style={{ color: Colors.textPrimary }}
                    >
                      {t.event}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingTemplate === t.id ? (
                      <>
                        <button
                          onClick={() => handleSaveTemplate(t.id)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{
                            background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                            color: Colors.white,
                          }}
                        >
                          <CheckCircle2 size={13} strokeWidth={2.5} /> Save
                        </button>
                        <button
                          onClick={() => setEditingTemplate(null)}
                          style={{ color: Colors.textMuted }}
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingTemplate(t.id);
                          setTemplateDraft(t.message);
                        }}
                        className="p-1.5 rounded-xl transition-colors"
                        style={{ color: Colors.textMuted }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            Colors.primary;
                          (e.currentTarget as HTMLElement).style.background =
                            Colors.primaryLight;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.color =
                            Colors.textMuted;
                          (e.currentTarget as HTMLElement).style.background =
                            "transparent";
                        }}
                      >
                        <ChevronRight size={16} strokeWidth={2} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setTemplates((prev) =>
                          prev.map((x) =>
                            x.id === t.id ? { ...x, active: !x.active } : x,
                          ),
                        )
                      }
                      style={{
                        color: t.active ? Colors.primary : Colors.textMuted,
                      }}
                    >
                      {t.active ? (
                        <ToggleRight size={28} strokeWidth={1.5} />
                      ) : (
                        <ToggleLeft size={28} strokeWidth={1.5} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="px-4 py-3">
                  {editingTemplate === t.id ? (
                    <textarea
                      rows={2}
                      value={templateDraft}
                      onChange={(e) => setTemplateDraft(e.target.value)}
                      className="w-full text-sm outline-none resize-none rounded-xl px-3 py-2.5"
                      style={{
                        background: Colors.primaryLight,
                        border: `1.5px solid ${Colors.borderFocus}`,
                        color: Colors.textPrimary,
                      }}
                      autoFocus
                    />
                  ) : (
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: Colors.textSecondary }}
                    >
                      {t.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════
            4. ADMIN CREDENTIALS
        ══════════════════════════════════════ */}
        <SectionCard
          icon={ShieldCheck}
          title="Admin Credentials"
          subtitle="Update login email and password (also update your .env file)"
        >
          <div className="flex flex-col gap-5">
            {/* Current email (readonly) */}
            <FieldRow label="Current Email">
              <InputField
                icon={Mail}
                focused={false}
                value={credentials.currentEmail}
                onFocus={() => {}}
                onBlur={() => {}}
                readOnly
              />
            </FieldRow>

            {/* New email */}
            <FieldRow label="New Email (optional)">
              <InputField
                icon={Mail}
                focused={focused === "newemail"}
                value={credentials.newEmail}
                onChange={(v) => setCredentials((p) => ({ ...p, newEmail: v }))}
                onFocus={() => setFocused("newemail")}
                onBlur={() => setFocused("")}
                placeholder="new@admin.com"
                type="email"
              />
            </FieldRow>

            <div
              className="my-1"
              style={{ borderTop: `1px solid ${Colors.divider}` }}
            />

            {/* Password section */}
            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: Colors.textMuted }}
            >
              Change Password
            </p>

            {[
              {
                key: "oldPassword",
                label: "Current Password",
                show: showOldPass,
                setShow: setShowOldPass,
              },
              {
                key: "newPassword",
                label: "New Password",
                show: showNewPass,
                setShow: setShowNewPass,
              },
              {
                key: "confirmPassword",
                label: "Confirm Password",
                show: showConfirmPass,
                setShow: setShowConfirmPass,
              },
            ].map(({ key, label, show, setShow }) => (
              <FieldRow key={key} label={label}>
                <div
                  className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                  style={{
                    background:
                      focused === key ? Colors.primaryLight : Colors.surfaceAlt,
                    border: `1.5px solid ${focused === key ? Colors.borderFocus : Colors.border}`,
                  }}
                >
                  <div
                    className="absolute left-3.5 pointer-events-none"
                    style={{
                      color:
                        focused === key ? Colors.primary : Colors.textMuted,
                    }}
                  >
                    <Lock size={17} strokeWidth={2} />
                  </div>
                  <input
                    type={show ? "text" : "password"}
                    value={credentials[key as keyof typeof credentials]}
                    onChange={(e) =>
                      setCredentials((p) => ({ ...p, [key]: e.target.value }))
                    }
                    onFocus={() => setFocused(key)}
                    onBlur={() => setFocused("")}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3.5 text-sm outline-none bg-transparent"
                    style={{ color: Colors.textPrimary }}
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3.5 transition-colors"
                    style={{ color: show ? Colors.primary : Colors.textMuted }}
                    tabIndex={-1}
                  >
                    {show ? (
                      <EyeOff size={18} strokeWidth={2} />
                    ) : (
                      <Eye size={18} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </FieldRow>
            ))}

            <div
              className="px-4 py-3 rounded-2xl text-xs leading-relaxed"
              style={{
                background: `${Colors.warning}12`,
                border: `1px solid ${Colors.warning}30`,
                color: Colors.textSecondary,
              }}
            >
              ⚠️ After changing credentials, update{" "}
              <span className="font-mono font-semibold">VITE_ADMIN_EMAIL</span>{" "}
              and{" "}
              <span className="font-mono font-semibold">
                VITE_ADMIN_PASSWORD
              </span>{" "}
              in your <span className="font-mono font-semibold">.env</span> file
              and restart the dev server.
            </div>

            <div className="flex justify-end">
              <SaveBtn
                loading={!!loading["password"]}
                onClick={handleChangePassword}
                label="Update Credentials"
              />
            </div>
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════
            5. DANGER ZONE
        ══════════════════════════════════════ */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            border: `2px solid #FFD0DA`,
            boxShadow: `0 4px 16px rgba(234,0,56,0.08)`,
          }}
        >
          <div
            className="flex items-center gap-3 px-6 py-5"
            style={{ background: "#FFF5F7", borderBottom: `1px solid #FFD0DA` }}
          >
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#FFF0F3" }}
            >
              <AlertTriangle size={20} color={Colors.error} strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: Colors.error }}>
                Danger Zone
              </p>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Irreversible actions — proceed with extreme caution
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            {[
              {
                icon: RefreshCw,
                label: "Reset All Products",
                desc: "Deletes all products, stocks and categories. Cannot be undone.",
              },
              {
                icon: Users,
                label: "Reset All Customers",
                desc: "Permanently removes all customer records and order history.",
              },
              {
                icon: Trash2,
                label: "Factory Reset",
                desc: "Wipes all data: products, customers, orders and settings.",
              },
            ].map(({ icon: Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center justify-between p-4 rounded-2xl"
                style={{ background: "#FFF8F9", border: `1px solid #FFD0DA` }}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} color={Colors.error} strokeWidth={2} />
                  <div>
                    <p
                      className="text-sm font-semibold"
                      style={{ color: Colors.textPrimary }}
                    >
                      {label}
                    </p>
                    <p className="text-xs" style={{ color: Colors.textMuted }}>
                      {desc}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDangerConfirm(true)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex-shrink-0 ml-4"
                  style={{
                    background: "#FFF0F3",
                    color: Colors.error,
                    border: `1.5px solid #FFD0DA`,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      Colors.error;
                    (e.currentTarget as HTMLElement).style.color = Colors.white;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "#FFF0F3";
                    (e.currentTarget as HTMLElement).style.color = Colors.error;
                  }}
                >
                  {label.split(" ")[0]}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ── Danger Confirm Modal ── */}
        {showDangerConfirm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: Colors.overlay }}
          >
            <div
              className="w-full max-w-sm rounded-3xl p-6 relative"
              style={{
                background: Colors.surface,
                boxShadow: "0 24px 64px rgba(0,0,0,0.25)",
              }}
            >
              <button
                onClick={() => {
                  setShowDangerConfirm(false);
                  setDangerInput("");
                }}
                className="absolute top-4 right-4 p-1.5 rounded-xl"
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
                Are you absolutely sure?
              </h3>
              <p
                className="text-sm mb-4"
                style={{ color: Colors.textSecondary }}
              >
                This action is{" "}
                <span className="font-bold" style={{ color: Colors.error }}>
                  permanent and irreversible
                </span>
                . Type <span className="font-mono font-bold">RESET</span> to
                confirm.
              </p>
              <input
                type="text"
                value={dangerInput}
                onChange={(e) => setDangerInput(e.target.value)}
                placeholder="Type RESET to confirm"
                className="w-full px-4 py-3 rounded-2xl text-sm outline-none mb-4"
                style={{
                  border: `1.5px solid ${Colors.error}`,
                  background: "#FFF8F9",
                  color: Colors.textPrimary,
                }}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDangerConfirm(false);
                    setDangerInput("");
                  }}
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
                  onClick={handleDangerReset}
                  className="flex-1 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
                  style={{
                    background:
                      dangerInput === "RESET" ? Colors.error : "#FFD0DA",
                    color: dangerInput === "RESET" ? Colors.white : "#FFAAAA",
                    cursor: dangerInput === "RESET" ? "pointer" : "not-allowed",
                  }}
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        input::placeholder, textarea::placeholder { color: ${Colors.textMuted}; }
        select option { color: ${Colors.textPrimary}; background: ${Colors.surface}; }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>
    </>
  );
}
