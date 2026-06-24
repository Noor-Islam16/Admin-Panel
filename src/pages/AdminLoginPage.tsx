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
import { AdminAPI } from "../config/api";

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
  // ── NEW: true while we silently verify an existing token ──
  const [checkingSession, setCheckingSession] = useState(true);
  const emailRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);

    // ── AUTO-LOGIN: verify stored token with the backend ──
    const token = localStorage.getItem("token");
    if (!token) {
      setCheckingSession(false);
      setTimeout(() => emailRef.current?.focus(), 600);
      return;
    }

    AdminAPI.getProfile()
      .then(() => {
        // Token still valid → go straight to dashboard
        navigate("/dashboard", { replace: true });
      })
      .catch(() => {
        // Token expired / invalid → clear it and show login form
        localStorage.removeItem("token");
        setCheckingSession(false);
        setTimeout(() => emailRef.current?.focus(), 600);
      });
  }, [navigate]);

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
    try {
      const res = await AdminAPI.login(email.trim(), password);
      localStorage.setItem("token", res.data.token);
      setSuccess(true);
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password.",
      );
      setLoading(false);
    }
  };

  const handleDevBypass = () => {
    setEmail("admin@thump.com");
    setPassword("adminbypass");
  };

  // ── Fullscreen spinner while session check is in-flight ──
  if (checkingSession) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center gap-4"
        style={{
          background: `linear-gradient(135deg, #0f1724 0%, #0d2137 45%, #0a2e1f 100%)`,
          fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        }}
      >
        <Loader2
          size={36}
          className="animate-spin"
          style={{ color: Colors.primary }}
        />
        <p
          className="text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.45)" }}
        >
          Restoring session…
        </p>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #0f1724 0%, #0d2137 45%, #0a2e1f 100%)`,
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

      {/* ── Content ── */}
      <div
        className="relative w-full max-w-md mx-4"
        style={{
          transform: mounted ? "translateY(0)" : "translateY(24px)",
          opacity: mounted ? 1 : 0,
          transition:
            "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
        }}
      >
        <div>
          {/* ── Header Strip ── */}
          <div
            className="px-8 pt-10 pb-8 relative overflow-hidden rounded-3xl mb-2"
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
          <div className="px-2 py-8">
            {/* Success Banner */}
            {success && (
              <div
                className="mb-6 px-4 py-3 rounded-2xl flex items-center gap-3 text-sm font-medium"
                style={{
                  background: "rgba(255,255,255,0.07)",
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
                  background: "rgba(255, 60, 80, 0.12)",
                  color: "#ff6b7a",
                  border: "1px solid rgba(255, 60, 80, 0.25)",
                  animation: "shake 0.35s ease",
                }}
              >
                <AlertCircle size={18} color="#ff6b7a" strokeWidth={2.5} />
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
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                    style={{
                      color: emailFocused
                        ? Colors.primary
                        : "rgba(255,255,255,0.3)",
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
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.05)",
                      border: `1.5px solid ${
                        emailFocused
                          ? Colors.borderFocus
                          : "rgba(255,255,255,0.12)"
                      }`,
                      color: Colors.white,
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
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Password
                  </label>
                </div>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                    style={{
                      color: passwordFocused
                        ? Colors.primary
                        : "rgba(255,255,255,0.3)",
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
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.05)",
                      border: `1.5px solid ${
                        passwordFocused
                          ? Colors.borderFocus
                          : "rgba(255,255,255,0.12)"
                      }`,
                      color: Colors.white,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-150"
                    style={{
                      color: showPassword
                        ? Colors.primary
                        : "rgba(255,255,255,0.3)",
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

            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={handleDevBypass}
                className="w-full mt-3 py-3 rounded-2xl text-xs font-semibold border transition-all duration-200"
                style={{
                  borderColor: "rgba(255, 255, 255, 0.12)",
                  color: Colors.accent || "#00A884",
                  background: "rgba(255, 255, 255, 0.02)",
                  cursor: "pointer",
                }}
              >
                ⚡ Autofill Development Bypass Credentials
              </button>
            )}

            {/* ── Footer Note ── */}
            <p
              className="mt-6 text-center text-xs"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              Secure admin access only. Unauthorized attempts are logged.
            </p>
          </div>
        </div>

        <p
          className="text-center text-xs mt-4"
          style={{ color: "rgba(255,255,255,0.2)" }}
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
        input::placeholder { color: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}
