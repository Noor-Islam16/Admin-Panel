import { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  LogIn,
} from "lucide-react";
import Colors from "../constants/colors";
import { useNavigate } from "react-router-dom";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    setTimeout(() => emailRef.current?.focus(), 600);
  }, []);

  // Add this for debugging - remove after fixing
  useEffect(() => {
    console.log("=== ENVIRONMENT VARIABLES DEBUG ===");
    console.log("All env vars:", import.meta.env);
    console.log("VITE_ADMIN_EMAIL:", import.meta.env.VITE_ADMIN_EMAIL);
    console.log("VITE_ADMIN_PASSWORD:", import.meta.env.VITE_ADMIN_PASSWORD);
    console.log("Type of email:", typeof import.meta.env.VITE_ADMIN_EMAIL);
    console.log("===================================");

    // Check if env vars are empty
    if (!import.meta.env.VITE_ADMIN_EMAIL) {
      console.error("❌ VITE_ADMIN_EMAIL is not loaded!");
    }
    if (!import.meta.env.VITE_ADMIN_PASSWORD) {
      console.error("❌ VITE_ADMIN_PASSWORD is not loaded!");
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!password.trim()) {
      setError("Please enter your password.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1400));

    const envEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email.trim() === envEmail && password === envPassword) {
      // THIS IS THE KEY FIX - Store authentication
      localStorage.setItem("adminAuth", "true");

      setSuccess(true);
      // THIS IS THE SECOND FIX - Add small delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } else {
      setError("Invalid email or password. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: Colors.background,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Decorative Background Blobs ── */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${Colors.primary}, ${Colors.accent})`,
          }}
        />
        <div
          className="absolute -bottom-40 -right-24 w-[500px] h-[500px] rounded-full opacity-15 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${Colors.primaryMuted}, ${Colors.primary})`,
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `linear-gradient(${Colors.accent} 1px, transparent 1px), linear-gradient(90deg, ${Colors.accent} 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      {/* ── Card ── */}
      <div
        className="relative w-full max-w-md mx-4"
        style={{
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
        }}
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            boxShadow: `0 20px 60px ${Colors.shadowMedium}, 0 4px 16px ${Colors.shadow}`,
          }}
        >
          {/* ── Header Strip ── */}
          <div
            className="px-8 pt-10 pb-8 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${Colors.gradientStart} 0%, ${Colors.gradientEnd} 100%)`,
            }}
          >
            <div
              className="absolute -top-6 -right-6 w-28 h-28 rounded-full opacity-20"
              style={{ background: Colors.white }}
            />
            <div
              className="absolute top-12 -right-2 w-14 h-14 rounded-full opacity-10"
              style={{ background: Colors.white }}
            />

            <div className="relative flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(8px)",
                }}
              >
                <ShieldCheck size={26} color={Colors.white} strokeWidth={1.8} />
              </div>
              <div>
                <p
                  className="text-xs font-semibold tracking-widest uppercase"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Admin Portal
                </p>
                <h1
                  className="text-2xl font-bold leading-tight"
                  style={{ color: Colors.white }}
                >
                  Welcome Back
                </h1>
              </div>
            </div>

            <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
              Sign in to access the admin dashboard and manage your system.
            </p>
          </div>

          {/* ── Form Body ── */}
          <div className="px-8 py-8">
            {/* Success Banner */}
            {success && (
              <div
                className="mb-6 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium"
                style={{
                  background: Colors.primaryLight,
                  color: Colors.accent,
                  border: `1px solid ${Colors.accentLight}`,
                }}
              >
                <CheckCircle2
                  size={18}
                  color={Colors.success}
                  strokeWidth={2.5}
                />
                Login successful! Redirecting to dashboard…
              </div>
            )}

            {/* Error Banner */}
            {error && (
              <div
                className="mb-6 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium"
                style={{
                  background: "#FFF0F3",
                  color: Colors.error,
                  border: "1px solid #FFD0DA",
                  animation: "shake 0.35s ease",
                }}
              >
                <AlertCircle size={18} color={Colors.error} strokeWidth={2.5} />
                {error}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="flex flex-col gap-5"
              noValidate
            >
              {/* ── Email Field ── */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold tracking-wide uppercase"
                  style={{ color: Colors.textSecondary }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                    style={{
                      color: emailFocused ? Colors.primary : Colors.textMuted,
                    }}
                  >
                    <Mail size={18} strokeWidth={2} />
                  </div>
                  <input
                    id="email"
                    ref={emailRef}
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    placeholder="admin@example.com"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: emailFocused
                        ? Colors.primaryLight
                        : Colors.surfaceAlt,
                      border: `1.5px solid ${emailFocused ? Colors.borderFocus : Colors.border}`,
                      color: Colors.textPrimary,
                    }}
                  />
                </div>
              </div>

              {/* ── Password Field ── */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold tracking-wide uppercase"
                    style={{ color: Colors.textSecondary }}
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-xs font-medium transition-colors duration-150 hover:underline"
                    style={{ color: Colors.primary }}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                    style={{
                      color: passwordFocused
                        ? Colors.primary
                        : Colors.textMuted,
                    }}
                  >
                    <Lock size={18} strokeWidth={2} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-12 py-3.5 rounded-2xl text-sm outline-none transition-all duration-200"
                    style={{
                      background: passwordFocused
                        ? Colors.primaryLight
                        : Colors.surfaceAlt,
                      border: `1.5px solid ${passwordFocused ? Colors.borderFocus : Colors.border}`,
                      color: Colors.textPrimary,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{
                      color: showPassword ? Colors.primary : Colors.textMuted,
                    }}
                    tabIndex={-1}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={20} strokeWidth={2} />
                    ) : (
                      <Eye size={20} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* ── Remember Me ── */}
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input type="checkbox" className="sr-only peer" />
                <div
                  className="w-5 h-5 rounded-md border-2 transition-all duration-150"
                  style={{
                    borderColor: Colors.border,
                    background: Colors.surfaceAlt,
                  }}
                />
                <span
                  className="text-sm"
                  style={{ color: Colors.textSecondary }}
                >
                  Remember me for 30 days
                </span>
              </label>

              {/* ── Submit Button ── */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-4 rounded-2xl text-sm font-semibold tracking-wide flex items-center justify-center gap-2 transition-all duration-200"
                style={{
                  background:
                    loading || success
                      ? Colors.primaryDark
                      : `linear-gradient(135deg, ${Colors.gradientStart} 0%, ${Colors.gradientEnd} 100%)`,
                  color: Colors.textOnPrimary,
                  boxShadow: loading
                    ? "none"
                    : `0 8px 24px rgba(0, 168, 132, 0.35)`,
                  transform: loading ? "scale(0.98)" : "scale(1)",
                  cursor: loading || success ? "not-allowed" : "pointer",
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Signing in…
                  </>
                ) : success ? (
                  <>
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    Signed In
                  </>
                ) : (
                  <>
                    <LogIn size={18} strokeWidth={2} />
                    Sign In to Dashboard
                  </>
                )}
              </button>
            </form>

            {/* ── Footer Note ── */}
            <p
              className="mt-6 text-center text-xs"
              style={{ color: Colors.textMuted }}
            >
              Secure admin access only. Unauthorized attempts are logged.
            </p>
          </div>
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: Colors.textMuted }}
        >
          Protected by end-to-end encryption
        </p>
      </div>

      {/* ── Global Styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%       { transform: translateX(-6px); }
          40%       { transform: translateX(6px); }
          60%       { transform: translateX(-4px); }
          80%       { transform: translateX(4px); }
        }
        input::placeholder { color: ${Colors.textMuted}; }
      `}</style>
    </div>
  );
}
