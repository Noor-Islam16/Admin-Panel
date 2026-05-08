import { useState, useEffect } from "react";
import {
  Settings,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Mail,
  Eye,
  EyeOff,
  Lock,
  Users,
  Save,
  RefreshCw,
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
      className="rounded-3xl overflow-hidden"
      style={{
        background: Colors.surface,
        border: `1px solid ${Colors.border}`,
        boxShadow: `0 4px 16px ${Colors.shadow}`,
      }}
    >
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

  // ── Admin Credentials ──────────────────────────────────────────────────────
  // FIX: Separate email section fields from password section fields.
  // Previously both shared `oldPassword`, causing the email change to fail
  // when the password fields were empty (and vice versa).

  const [currentEmail, setCurrentEmail] = useState("Loading...");

  // Email change form
  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    currentPasswordForEmail: "", // dedicated field — not shared with password section
  });
  const [showEmailPass, setShowEmailPass] = useState(false);

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    AdminAPI.getProfile()
      .then((res) => setCurrentEmail(res.data.email))
      .catch(() => setCurrentEmail("Unknown"));
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  //  Handlers
  // ─────────────────────────────────────────────────────────────────────────

  // ── Change Email (real API) ────────────────────────────────────────────────
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
      // FIX: persist the new token so future protected requests still work
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

  // ── Change Password (real API) ─────────────────────────────────────────────
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
            2. WHATSAPP CONFIGURATION
        ══════════════════════════════════════ */}
        {/* <SectionCard
          icon={MessageCircle}
          title="WhatsApp Configuration"
          subtitle="Recipients and sharing preferences for order notifications"
        >
          <div className="flex flex-col gap-5">
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
                        background: r.isGroup ? `${Colors.info}18` : Colors.primaryLight,
                      }}
                    >
                      {r.isGroup ? (
                        <Users size={17} color={Colors.info} strokeWidth={2} />
                      ) : (
                        <Phone size={17} color={Colors.primary} strokeWidth={2} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: Colors.textPrimary }}
                      >
                        {r.label}
                      </p>
                      <p className="text-xs truncate" style={{ color: Colors.textMuted }}>
                        {r.isGroup ? "Group" : "+91"} {r.number}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setWaRecipients((prev) =>
                          prev.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)),
                        )
                      }
                      style={{ color: r.active ? Colors.primary : Colors.textMuted }}
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
                        (e.currentTarget as HTMLElement).style.color = Colors.error;
                        (e.currentTarget as HTMLElement).style.background = "#FFF0F3";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.color = Colors.textMuted;
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }}
                    >
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>

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
                      style={{ background: Colors.surface, border: `1.5px solid ${Colors.border}` }}
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
                          setNewRecipient((p) => ({ ...p, label: e.target.value }))
                        }
                        className="w-full pl-10 pr-4 py-3 text-sm outline-none bg-transparent"
                        style={{ color: Colors.textPrimary }}
                      />
                    </div>
                    <div
                      className="relative flex items-center rounded-2xl overflow-hidden"
                      style={{ background: Colors.surface, border: `1.5px solid ${Colors.border}` }}
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
                          setNewRecipient((p) => ({ ...p, number: e.target.value }))
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
                          setNewRecipient((p) => ({ ...p, isGroup: e.target.checked }))
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
        </SectionCard> */}

        {/* ══════════════════════════════════════
            3. PUSH NOTIFICATION TEMPLATES
        ══════════════════════════════════════ */}
        {/* <SectionCard
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
        </SectionCard> */}

        {/* ══════════════════════════════════════
            4. ADMIN CREDENTIALS
        ══════════════════════════════════════ */}
        <SectionCard
          icon={ShieldCheck}
          title="Admin Credentials"
          subtitle="Update login email and password"
        >
          <div className="flex flex-col gap-5">
            {/* ── EMAIL SECTION ── */}
            {/* Current email (readonly) */}
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

            {/* New email */}
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

            {/* Password confirmation for email change — its own dedicated field */}
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

            {/* ── PASSWORD SECTION ── */}
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
