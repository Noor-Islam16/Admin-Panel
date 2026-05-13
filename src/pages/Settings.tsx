import { useState, useEffect, useRef } from "react";
import {
  Settings,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Users,
  Save,
  Bell,
  Send,
  Smartphone,
  ChevronDown,
  Search,
} from "lucide-react";
import Colors from "../constants/colors";
import { AdminAPI } from "../config/api";

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
      className="rounded-3xl"
      style={{
        background: Colors.surface,
        border: `1px solid ${Colors.border}`,
        boxShadow: `0 4px 16px ${Colors.shadow}`,
        // NOTE: No overflow:hidden here — allows dropdown to escape
      }}
    >
      <div
        className="flex items-center gap-3 px-6 py-5 rounded-t-3xl"
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
  const [showEmailPass, setShowEmailPass] = useState(false);

  // ── Admin Credentials ──────────────────────────────────────────────────────
  const [currentEmail, setCurrentEmail] = useState("Loading...");
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    currentPasswordForEmail: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ── Manual Push Notification State ──────────────────────────────────────────
  const [pushForm, setPushForm] = useState({
    title: "",
    body: "",
    targetType: "all" as "all" | "specific" | "pending" | "approved",
    selectedUsers: [] as string[],
    screen: "",
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownTriggerRef = useRef<HTMLButtonElement>(null);
  const dropdownPanelRef = useRef<HTMLDivElement>(null);
  const [customers, setCustomers] = useState<
    Array<{
      _id: string;
      phone: string;
      profile?: { contactName?: string };
      approvalStatus: string;
      isActive: boolean;
    }>
  >([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [pushSending, setPushSending] = useState(false);
  const [pushPreview, setPushPreview] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Fetch admin profile ──────────────────────────────────────────────────
  useEffect(() => {
    AdminAPI.getProfile()
      .then((res) => setCurrentEmail(res.data.email))
      .catch(() => setCurrentEmail("Unknown"));
  }, []);

  // ── Fetch customers for push dropdown ────────────────────────────────────
  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const token =
        localStorage.getItem("token") ?? localStorage.getItem("adminToken");
      const res = await fetch(`${API_BASE}/admin/customers?limit=200`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data?.customers) {
        setCustomers(data.data.customers);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      setCustomers([]);
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!showUserDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownTriggerRef.current?.contains(e.target as Node) ||
        dropdownPanelRef.current?.contains(e.target as Node)
      )
        return;
      setShowUserDropdown(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUserDropdown]);

  // Filter customers based on search
  const filteredCustomers = customers.filter((c) => {
    const search = customerSearch.toLowerCase();
    if (!search) return true;
    return (
      (c.profile?.contactName || "").toLowerCase().includes(search) ||
      c.phone.includes(search)
    );
  });

  // Get target description
  const getTargetDescription = () => {
    switch (pushForm.targetType) {
      case "all":
        return `All active customers (${customers.filter((c) => c.isActive).length} users)`;
      case "pending":
        const pending = customers.filter(
          (c) =>
            c.isActive &&
            (c.approvalStatus === "pending" || c.approvalStatus === "manual"),
        );
        return `Pending approval (${pending.length} users)`;
      case "approved":
        const approved = customers.filter(
          (c) =>
            c.isActive &&
            (c.approvalStatus === "approved" || c.approvalStatus === "auto"),
        );
        return `Approved customers (${approved.length} users)`;
      case "specific":
        return `${pushForm.selectedUsers.length} specific user(s) selected`;
      default:
        return "";
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredIds = filteredCustomers.map((c) => c._id);
    setPushForm((p) => ({
      ...p,
      selectedUsers: [...new Set([...p.selectedUsers, ...filteredIds])],
    }));
  };

  const handleClearFiltered = () => {
    const filteredIds = new Set(filteredCustomers.map((c) => c._id));
    setPushForm((p) => ({
      ...p,
      selectedUsers: p.selectedUsers.filter((id) => !filteredIds.has(id)),
    }));
  };

  const selectedFromFiltered = filteredCustomers.filter((c) =>
    pushForm.selectedUsers.includes(c._id),
  ).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChangeEmail = async () => {
    if (!emailForm.newEmail.trim()) {
      showToast("error", "Please enter a new email address.");
      return;
    }
    if (!emailForm.currentPasswordForEmail) {
      showToast("error", "Current password is required to change email.");
      return;
    }
    setLoading((p) => ({ ...p, email: true }));
    try {
      const res = await AdminAPI.changeEmail(
        emailForm.newEmail.trim(),
        emailForm.currentPasswordForEmail,
      );
      localStorage.setItem("token", res.data.token);
      setCurrentEmail(res.data.admin.email);
      setEmailForm({ newEmail: "", currentPasswordForEmail: "" });
      showToast("success", "Email updated successfully!");
    } catch (err: unknown) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update email.",
      );
    } finally {
      setLoading((p) => ({ ...p, email: false }));
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordForm.oldPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      showToast("error", "All password fields are required.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("error", "New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      showToast("error", "Password must be at least 8 characters.");
      return;
    }
    setLoading((p) => ({ ...p, password: true }));
    try {
      await AdminAPI.changePassword(
        passwordForm.oldPassword,
        passwordForm.newPassword,
        passwordForm.confirmPassword,
      );
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showToast("success", "Password updated successfully!");
    } catch (err: unknown) {
      showToast(
        "error",
        err instanceof Error ? err.message : "Failed to update password.",
      );
    } finally {
      setLoading((p) => ({ ...p, password: false }));
    }
  };

  const handleSendPush = async () => {
    if (!pushForm.title.trim() || !pushForm.body.trim()) {
      showToast("error", "Title and message body are required.");
      return;
    }
    if (
      pushForm.targetType === "specific" &&
      pushForm.selectedUsers.length === 0
    ) {
      showToast("error", "Please select at least one user.");
      return;
    }
    setPushSending(true);
    try {
      const res = await AdminAPI.sendManualPush({
        title: pushForm.title.trim(),
        body: pushForm.body.trim(),
        targetType: pushForm.targetType,
        selectedUsers: pushForm.selectedUsers,
        screen: pushForm.screen || undefined,
      });
      if (res.success) {
        showToast(
          "success",
          `FCM notification sent to ${res.data?.sentCount || 0} user(s)!`,
        );
        setPushForm({
          title: "",
          body: "",
          targetType: "all",
          selectedUsers: [],
          screen: "",
        });
        setPushPreview(false);
      } else {
        showToast("error", res.message || "Failed to send notification.");
      }
    } catch (err: any) {
      showToast("error", err.message || "Failed to send notification.");
    } finally {
      setPushSending(false);
    }
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
              Manage admin credentials, push notifications and preferences
            </p>
          </div>
        </div>

        {/* ══════════════════════════════════════
             PUSH NOTIFICATION BROADCAST
        ══════════════════════════════════════ */}
        <SectionCard
          icon={Bell}
          title="Push Notification Broadcast"
          subtitle="Send manual push notifications to customers"
        >
          <div className="flex flex-col gap-5">
            {/* Title */}
            <FieldRow label="Notification Title *">
              <div
                className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background:
                    focused === "pushTitle"
                      ? Colors.primaryLight
                      : Colors.surfaceAlt,
                  border: `1.5px solid ${focused === "pushTitle" ? Colors.borderFocus : Colors.border}`,
                }}
              >
                <div
                  className="absolute left-3.5 pointer-events-none"
                  style={{
                    color:
                      focused === "pushTitle"
                        ? Colors.primary
                        : Colors.textMuted,
                  }}
                >
                  <Bell size={17} strokeWidth={2} />
                </div>
                <input
                  type="text"
                  value={pushForm.title}
                  onChange={(e) =>
                    setPushForm((p) => ({ ...p, title: e.target.value }))
                  }
                  onFocus={() => setFocused("pushTitle")}
                  onBlur={() => setFocused("")}
                  placeholder="e.g., 🎉 New Arrivals Are Here!"
                  className="w-full pl-10 pr-4 py-3.5 text-sm outline-none bg-transparent"
                  style={{ color: Colors.textPrimary }}
                  maxLength={100}
                />
              </div>
              <span className="text-xs" style={{ color: Colors.textMuted }}>
                {pushForm.title.length}/100 characters
              </span>
            </FieldRow>

            {/* Message Body */}
            <FieldRow label="Message Body *">
              <div
                className="relative rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background:
                    focused === "pushBody"
                      ? Colors.primaryLight
                      : Colors.surfaceAlt,
                  border: `1.5px solid ${focused === "pushBody" ? Colors.borderFocus : Colors.border}`,
                }}
              >
                <textarea
                  rows={3}
                  value={pushForm.body}
                  onChange={(e) =>
                    setPushForm((p) => ({ ...p, body: e.target.value }))
                  }
                  onFocus={() => setFocused("pushBody")}
                  onBlur={() => setFocused("")}
                  placeholder="Write your notification message here..."
                  className="w-full px-4 py-3.5 text-sm outline-none resize-none bg-transparent"
                  style={{ color: Colors.textPrimary }}
                  maxLength={200}
                />
              </div>
              <span className="text-xs" style={{ color: Colors.textMuted }}>
                {pushForm.body.length}/200 characters
              </span>
            </FieldRow>

            {/* Target Audience */}
            <FieldRow label="Target Audience">
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    value: "all",
                    label: "All Customers",
                    icon: Users,
                    color: Colors.primary,
                  },
                  {
                    value: "pending",
                    label: "Pending Approval",
                    icon: AlertTriangle,
                    color: "#D97706",
                  },
                  {
                    value: "approved",
                    label: "Approved Only",
                    icon: CheckCircle2,
                    color: "#059669",
                  },
                  {
                    value: "specific",
                    label: "Specific Users",
                    icon: Smartphone,
                    color: "#6C5CE7",
                  },
                ].map(({ value, label, icon: Icon, color }) => (
                  <button
                    key={value}
                    onClick={() => {
                      setPushForm((p) => ({
                        ...p,
                        targetType: value as any,
                        selectedUsers:
                          value === "specific" ? p.selectedUsers : [],
                      }));
                      if (value === "specific") setShowUserDropdown(true);
                      else setShowUserDropdown(false);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-150"
                    style={{
                      background:
                        pushForm.targetType === value
                          ? color
                          : Colors.surfaceAlt,
                      color:
                        pushForm.targetType === value
                          ? Colors.white
                          : Colors.textSecondary,
                      border: `1.5px solid ${pushForm.targetType === value ? "transparent" : Colors.border}`,
                    }}
                  >
                    <Icon size={14} strokeWidth={2} />
                    {label}
                  </button>
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: Colors.textMuted }}>
                {getTargetDescription()}
              </p>
            </FieldRow>

            {/* ── Specific User Selection ── */}
            {pushForm.targetType === "specific" && (
              <FieldRow label="Select Users">
                {/* Trigger button */}
                <button
                  ref={dropdownTriggerRef}
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all duration-200"
                  style={{
                    background: showUserDropdown
                      ? Colors.primaryLight
                      : Colors.surfaceAlt,
                    border: `1.5px solid ${showUserDropdown ? Colors.borderFocus : Colors.border}`,
                    color: Colors.textPrimary,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Users size={16} style={{ color: Colors.textMuted }} />
                    <span
                      style={{
                        color:
                          pushForm.selectedUsers.length > 0
                            ? Colors.textPrimary
                            : Colors.textMuted,
                      }}
                    >
                      {pushForm.selectedUsers.length > 0
                        ? `${pushForm.selectedUsers.length} user(s) selected`
                        : "Click to select users..."}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {customersLoading && (
                      <svg
                        className="animate-spin"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke={Colors.border}
                          strokeWidth="3"
                        />
                        <path
                          d="M12 2a10 10 0 0 1 10 10"
                          stroke={Colors.primary}
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    <ChevronDown
                      size={16}
                      style={{
                        color: Colors.textMuted,
                        transform: showUserDropdown ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </div>
                </button>

                {/* Selected chips summary */}
                {pushForm.selectedUsers.length > 0 && (
                  <div className="flex items-center justify-between mt-1 px-1">
                    <p
                      className="text-xs font-medium"
                      style={{ color: Colors.primary }}
                    >
                      {pushForm.selectedUsers.length} user(s) selected
                    </p>
                    <button
                      onClick={() =>
                        setPushForm((p) => ({ ...p, selectedUsers: [] }))
                      }
                      className="text-xs font-semibold"
                      style={{ color: Colors.error }}
                    >
                      Clear All
                    </button>
                  </div>
                )}

                {/* Dropdown panel — renders inline (not absolute) to avoid clipping */}
                {showUserDropdown && (
                  <div
                    ref={dropdownPanelRef}
                    className="mt-1 rounded-2xl overflow-hidden"
                    style={{
                      background: Colors.surface,
                      border: `1.5px solid ${Colors.borderFocus}`,
                      boxShadow: `0 8px 32px ${Colors.shadow}`,
                    }}
                  >
                    {/* Search bar */}
                    <div
                      className="p-3"
                      style={{ borderBottom: `1px solid ${Colors.divider}` }}
                    >
                      <div className="relative flex items-center">
                        <Search
                          size={14}
                          className="absolute left-3 pointer-events-none"
                          style={{ color: Colors.textMuted }}
                        />
                        <input
                          type="text"
                          placeholder="Search by name or phone..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm outline-none"
                          style={{
                            background: Colors.surfaceAlt,
                            border: `1px solid ${Colors.border}`,
                            color: Colors.textPrimary,
                          }}
                          autoFocus
                        />
                        {customerSearch && (
                          <button
                            onClick={() => setCustomerSearch("")}
                            className="absolute right-2.5"
                            style={{ color: Colors.textMuted }}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Stats + bulk actions bar */}
                    <div
                      className="flex items-center justify-between px-4 py-2"
                      style={{
                        background: Colors.surfaceAlt,
                        borderBottom: `1px solid ${Colors.divider}`,
                      }}
                    >
                      <p
                        className="text-xs"
                        style={{ color: Colors.textMuted }}
                      >
                        {filteredCustomers.length} found
                        {selectedFromFiltered > 0 &&
                          ` · ${selectedFromFiltered} selected`}
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleSelectAllFiltered}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{
                            color: Colors.primary,
                            background: Colors.primaryLight,
                            border: `1px solid ${Colors.accentLight}`,
                          }}
                        >
                          Select All
                        </button>
                        <button
                          onClick={handleClearFiltered}
                          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{
                            color: Colors.error,
                            background: "#FFF0F3",
                            border: `1px solid #FFD0DA`,
                          }}
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    {/* User list */}
                    <div
                      className="overflow-y-auto"
                      style={{ maxHeight: "220px" }}
                    >
                      {customersLoading ? (
                        <div className="flex items-center justify-center gap-2 py-8">
                          <svg
                            className="animate-spin"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <circle
                              cx="12"
                              cy="12"
                              r="10"
                              stroke={Colors.border}
                              strokeWidth="3"
                            />
                            <path
                              d="M12 2a10 10 0 0 1 10 10"
                              stroke={Colors.primary}
                              strokeWidth="3"
                              strokeLinecap="round"
                            />
                          </svg>
                          <span
                            className="text-sm"
                            style={{ color: Colors.textMuted }}
                          >
                            Loading customers...
                          </span>
                        </div>
                      ) : filteredCustomers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <Users size={24} style={{ color: Colors.border }} />
                          <p
                            className="text-sm"
                            style={{ color: Colors.textMuted }}
                          >
                            {customerSearch
                              ? "No users match your search"
                              : "No customers found"}
                          </p>
                          {customerSearch && (
                            <button
                              onClick={() => setCustomerSearch("")}
                              className="text-xs font-semibold px-3 py-1 rounded-lg"
                              style={{
                                color: Colors.primary,
                                background: Colors.primaryLight,
                              }}
                            >
                              Clear Search
                            </button>
                          )}
                        </div>
                      ) : (
                        filteredCustomers.map((customer) => {
                          const isSelected = pushForm.selectedUsers.includes(
                            customer._id,
                          );
                          const approvalBadge =
                            customer.approvalStatus === "approved" ||
                            customer.approvalStatus === "auto"
                              ? {
                                  color: "#059669",
                                  bg: "#D1FAE5",
                                  label: "Approved",
                                }
                              : customer.approvalStatus === "rejected"
                                ? {
                                    color: "#DC2626",
                                    bg: "#FEE2E2",
                                    label: "Rejected",
                                  }
                                : {
                                    color: "#D97706",
                                    bg: "#FEF3C7",
                                    label: "Pending",
                                  };

                          return (
                            <label
                              key={customer._id}
                              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors"
                              style={{
                                background: isSelected
                                  ? Colors.primaryLight
                                  : "transparent",
                                borderBottom: `1px solid ${Colors.divider}`,
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPushForm((p) => ({
                                      ...p,
                                      selectedUsers: [
                                        ...p.selectedUsers,
                                        customer._id,
                                      ],
                                    }));
                                  } else {
                                    setPushForm((p) => ({
                                      ...p,
                                      selectedUsers: p.selectedUsers.filter(
                                        (id) => id !== customer._id,
                                      ),
                                    }));
                                  }
                                }}
                                className="w-4 h-4 rounded flex-shrink-0"
                                style={{ accentColor: Colors.primary }}
                              />
                              <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{
                                  background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                                }}
                              >
                                {(customer.profile?.contactName || "U")
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className="text-sm font-medium truncate"
                                  style={{ color: Colors.textPrimary }}
                                >
                                  {customer.profile?.contactName ||
                                    `User ${customer.phone.slice(-4)}`}
                                </p>
                                <p
                                  className="text-xs"
                                  style={{ color: Colors.textMuted }}
                                >
                                  +91 {customer.phone}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span
                                  className="text-xs px-2 py-0.5 rounded-lg font-medium"
                                  style={{
                                    background: approvalBadge.bg,
                                    color: approvalBadge.color,
                                  }}
                                >
                                  {approvalBadge.label}
                                </span>
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    background: customer.isActive
                                      ? Colors.success
                                      : Colors.error,
                                  }}
                                  title={
                                    customer.isActive ? "Active" : "Inactive"
                                  }
                                />
                              </div>
                            </label>
                          );
                        })
                      )}
                    </div>

                    {/* Close footer */}
                    <div
                      className="flex items-center justify-end px-4 py-2.5"
                      style={{
                        borderTop: `1px solid ${Colors.divider}`,
                        background: Colors.surfaceAlt,
                      }}
                    >
                      <button
                        onClick={() => setShowUserDropdown(false)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all duration-150"
                        style={{
                          background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                          color: Colors.white,
                        }}
                      >
                        Done
                      </button>
                    </div>
                  </div>
                )}
              </FieldRow>
            )}

            {/* Navigation Screen */}
            <FieldRow label="Navigate To Screen (Optional)">
              <div
                className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background:
                    focused === "pushScreen"
                      ? Colors.primaryLight
                      : Colors.surfaceAlt,
                  border: `1.5px solid ${focused === "pushScreen" ? Colors.borderFocus : Colors.border}`,
                }}
              >
                <div
                  className="absolute left-3.5 pointer-events-none"
                  style={{
                    color:
                      focused === "pushScreen"
                        ? Colors.primary
                        : Colors.textMuted,
                  }}
                >
                  <Smartphone size={17} strokeWidth={2} />
                </div>
                <select
                  value={pushForm.screen}
                  onChange={(e) =>
                    setPushForm((p) => ({ ...p, screen: e.target.value }))
                  }
                  onFocus={() => setFocused("pushScreen")}
                  onBlur={() => setFocused("")}
                  className="w-full pl-10 pr-4 py-3.5 text-sm outline-none bg-transparent appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }}
                >
                  <option value="">No specific screen</option>
                  <option value="/(tabs)/home">Home Screen</option>
                  <option value="/(tabs)/products">Products Screen</option>
                  <option value="/(tabs)/myorders">My Orders</option>
                  <option value="/(tabs)/account">Account Screen</option>
                  <option value="/cart">Cart</option>
                </select>
              </div>
            </FieldRow>

            {/* Preview */}
            {pushPreview && pushForm.title && pushForm.body && (
              <div
                className="rounded-2xl p-4"
                style={{
                  background: Colors.primaryLight,
                  border: `1.5px solid ${Colors.accentLight}`,
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide mb-2"
                  style={{ color: Colors.accent }}
                >
                  📱 Preview
                </p>
                <div
                  className="rounded-xl p-3 mb-2"
                  style={{
                    background: Colors.white,
                    border: `1px solid ${Colors.border}`,
                  }}
                >
                  <p
                    className="text-sm font-bold"
                    style={{ color: Colors.textPrimary }}
                  >
                    {pushForm.title}
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    {pushForm.body}
                  </p>
                </div>
                <p className="text-xs" style={{ color: Colors.textMuted }}>
                  Target: {getTargetDescription()}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setPushPreview(!pushPreview)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
                style={{
                  background: Colors.surfaceAlt,
                  color: Colors.textSecondary,
                  border: `1.5px solid ${Colors.border}`,
                }}
              >
                <Eye size={16} strokeWidth={2} />
                {pushPreview ? "Hide Preview" : "Preview"}
              </button>

              <button
                onClick={handleSendPush}
                disabled={
                  pushSending || !pushForm.title.trim() || !pushForm.body.trim()
                }
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200"
                style={{
                  background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                  color: Colors.white,
                  boxShadow: `0 4px 14px rgba(0,168,132,0.3)`,
                  opacity:
                    pushSending ||
                    !pushForm.title.trim() ||
                    !pushForm.body.trim()
                      ? 0.7
                      : 1,
                  cursor:
                    pushSending ||
                    !pushForm.title.trim() ||
                    !pushForm.body.trim()
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {pushSending ? (
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
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={16} strokeWidth={2} />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </div>
        </SectionCard>

        {/* ══════════════════════════════════════
             ADMIN CREDENTIALS
        ══════════════════════════════════════ */}
        <SectionCard
          icon={ShieldCheck}
          title="Admin Credentials"
          subtitle="Update login email and password"
        >
          <div className="flex flex-col gap-5">
            <FieldRow label="Current Email">
              <InputField
                icon={Mail}
                focused={false}
                value={currentEmail}
                onFocus={() => {}}
                onBlur={() => {}}
                readOnly
              />
            </FieldRow>

            <FieldRow label="New Email">
              <InputField
                icon={Mail}
                focused={focused === "newemail"}
                value={emailForm.newEmail}
                onChange={(v) => setEmailForm((p) => ({ ...p, newEmail: v }))}
                onFocus={() => setFocused("newemail")}
                onBlur={() => setFocused("")}
                placeholder="new@admin.com"
                type="email"
              />
            </FieldRow>

            <FieldRow label="Current Password (to confirm email change)">
              <div
                className="relative flex items-center rounded-2xl overflow-hidden transition-all duration-200"
                style={{
                  background:
                    focused === "emailpass"
                      ? Colors.primaryLight
                      : Colors.surfaceAlt,
                  border: `1.5px solid ${focused === "emailpass" ? Colors.borderFocus : Colors.border}`,
                }}
              >
                <div
                  className="absolute left-3.5 pointer-events-none"
                  style={{
                    color:
                      focused === "emailpass"
                        ? Colors.primary
                        : Colors.textMuted,
                  }}
                >
                  <Lock size={17} strokeWidth={2} />
                </div>
                <input
                  type={showEmailPass ? "text" : "password"}
                  value={emailForm.currentPasswordForEmail}
                  onChange={(e) =>
                    setEmailForm((p) => ({
                      ...p,
                      currentPasswordForEmail: e.target.value,
                    }))
                  }
                  onFocus={() => setFocused("emailpass")}
                  onBlur={() => setFocused("")}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3.5 text-sm outline-none bg-transparent"
                  style={{ color: Colors.textPrimary }}
                />
                <button
                  type="button"
                  onClick={() => setShowEmailPass((v) => !v)}
                  className="absolute right-3.5 transition-colors"
                  style={{
                    color: showEmailPass ? Colors.primary : Colors.textMuted,
                  }}
                  tabIndex={-1}
                >
                  {showEmailPass ? (
                    <EyeOff size={18} strokeWidth={2} />
                  ) : (
                    <Eye size={18} strokeWidth={2} />
                  )}
                </button>
              </div>
            </FieldRow>

            <div className="flex justify-end">
              <SaveBtn
                loading={!!loading["email"]}
                onClick={handleChangeEmail}
                label="Update Email"
              />
            </div>

            <div
              className="my-1"
              style={{ borderTop: `1px solid ${Colors.divider}` }}
            />

            <p
              className="text-xs font-bold uppercase tracking-wide"
              style={{ color: Colors.textMuted }}
            >
              Change Password
            </p>

            {(
              [
                {
                  key: "oldPassword" as const,
                  label: "Current Password",
                  show: showOldPass,
                  setShow: setShowOldPass,
                },
                {
                  key: "newPassword" as const,
                  label: "New Password",
                  show: showNewPass,
                  setShow: setShowNewPass,
                },
                {
                  key: "confirmPassword" as const,
                  label: "Confirm Password",
                  show: showConfirmPass,
                  setShow: setShowConfirmPass,
                },
              ] as const
            ).map(({ key, label, show, setShow }) => (
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
                    value={passwordForm[key]}
                    onChange={(e) =>
                      setPasswordForm((p) => ({ ...p, [key]: e.target.value }))
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

            <div className="flex justify-end">
              <SaveBtn
                loading={!!loading["password"]}
                onClick={handleChangePassword}
                label="Update Password"
              />
            </div>
          </div>
        </SectionCard>
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
