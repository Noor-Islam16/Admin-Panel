import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  PackagePlus,
  Package,
  Boxes,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import Colors from "../constants/colors";
import { adminRoutes } from "../config/routes.config";
import { AdminAPI } from "../config/api";
import icon from "../assets/logo.png";

const NAV_ITEMS = [
  {
    label: "Customer List",
    shortLabel: "Customers",
    icon: Users,
    path: `${adminRoutes.BASE}${adminRoutes.CUSTOMERS}`,
  },
  {
    label: "Add Products",
    shortLabel: "Add",
    icon: PackagePlus,
    path: `${adminRoutes.BASE}${adminRoutes.ADD_PRODUCTS}`,
  },
  {
    label: "View Products",
    shortLabel: "Products",
    icon: Package,
    path: `${adminRoutes.BASE}${adminRoutes.VIEW_PRODUCTS}`,
  },
  {
    label: "Manage Stocks",
    shortLabel: "Stocks",
    icon: Boxes,
    path: `${adminRoutes.BASE}${adminRoutes.STOCKS}`,
  },
  {
    label: "Orders",
    shortLabel: "Orders",
    icon: ClipboardList,
    path: `${adminRoutes.BASE}${adminRoutes.ORDERS}`,
  },
  {
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings,
    path: `${adminRoutes.BASE}${adminRoutes.SETTINGS}`,
  },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [adminEmail, setAdminEmail] = useState("");

  useEffect(() => {
    AdminAPI.getProfile()
      .then((res) => setAdminEmail(res.data.email))
      .catch(() => setAdminEmail("admin"));
  }, []);

  // ── LOGOUT: clears the stored token so auto-login won't fire next visit ──
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: Colors.background,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ══════════════════════════════════════
          DESKTOP SIDEBAR (lg+)
      ══════════════════════════════════════ */}
      <aside
        className="hidden lg:flex flex-col w-64 flex-shrink-0"
        style={{
          background: `linear-gradient(180deg, ${Colors.accent} 0%, ${Colors.gradientEnd} 60%, #0a6b5e 100%)`,
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Brand Header */}
        <div
          className="flex items-center gap-3 px-5 py-5 relative overflow-hidden"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div
            className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-10"
            style={{ background: Colors.white }}
          />
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.18)",
              backdropFilter: "blur(8px)",
            }}
          >
            <img
              src={icon}
              alt="logo"
              style={{ width: 60, height: 40, objectFit: "contain" }}
            />
          </div>
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Admin Panel
            </p>
            <p
              className="text-sm font-bold leading-tight"
              style={{ color: Colors.white }}
            >
              Thump Beyond Limits
            </p>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className="group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer"
              style={({ isActive }) => ({
                background: isActive ? Colors.primaryLight : "transparent",
                color: isActive ? Colors.primaryDark : "rgba(255,255,255,0.82)",
                fontWeight: isActive ? "600" : "500",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                      style={{ background: Colors.primary }}
                    />
                  )}
                  <Icon
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    style={{
                      color: isActive
                        ? Colors.primary
                        : "rgba(255,255,255,0.82)",
                    }}
                  />
                  <span className="flex-1">{label}</span>
                  {isActive && (
                    <ChevronRight size={15} style={{ color: Colors.primary }} />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div
          className="px-3 pb-5"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: "12px",
          }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 cursor-pointer"
            style={{ color: "rgba(255,255,255,0.75)" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(234,0,56,0.18)";
              (e.currentTarget as HTMLElement).style.color = "#ff6b8a";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(255,255,255,0.75)";
            }}
          >
            <LogOut size={19} strokeWidth={1.8} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════
          MAIN AREA
      ══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* ── Top Header ── */}
        <header
          className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4 flex-shrink-0"
          style={{
            background: Colors.surface,
            borderBottom: `1px solid ${Colors.border}`,
            boxShadow: `0 2px 8px ${Colors.shadow}`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="lg:hidden w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${Colors.accent}, ${Colors.gradientEnd})`,
              }}
            >
              <ShieldCheck size={16} color={Colors.white} strokeWidth={1.8} />
            </div>
            <div>
              <h2
                className="text-sm lg:text-base font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Admin Dashboard
              </h2>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Thump Beyond Limits
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: Colors.textSecondary }}
              title="Logout"
            >
              <LogOut size={20} />
            </button>

            <div className="text-right hidden sm:block">
              <p
                className="text-sm font-semibold"
                style={{ color: Colors.textPrimary }}
              >
                JholeSalers
              </p>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                {adminEmail}
              </p>
            </div>
            <div
              className="w-8 h-8 lg:w-9 lg:h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                color: Colors.white,
              }}
            >
              J
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-[80px] lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* ══════════════════════════════════════
          MOBILE / TABLET BOTTOM TAB BAR (below lg)
      ══════════════════════════════════════ */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-stretch"
        style={{
          background: `linear-gradient(135deg, ${Colors.accent} 0%, ${Colors.gradientEnd} 100%)`,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.18)",
          height: "64px",
          borderTop: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {NAV_ITEMS.map(({ shortLabel, icon: Icon, path }) => (
          <NavLink
            key={path}
            to={path}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-all duration-200"
            style={({ isActive }) => ({
              color: isActive ? Colors.white : "rgba(255,255,255,0.55)",
            })}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 rounded-b-full"
                    style={{
                      width: "32px",
                      height: "3px",
                      background: Colors.white,
                    }}
                  />
                )}

                <div
                  className="flex items-center justify-center rounded-xl transition-all duration-200"
                  style={{
                    width: isActive ? "38px" : "32px",
                    height: isActive ? "28px" : "24px",
                    background: isActive
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  }}
                >
                  <Icon
                    size={isActive ? 19 : 17}
                    strokeWidth={isActive ? 2.2 : 1.7}
                  />
                </div>

                <span
                  style={{
                    fontSize: isActive ? "10px" : "9px",
                    fontWeight: isActive ? "700" : "500",
                    letterSpacing: "0.02em",
                    transition: "all 0.2s",
                  }}
                >
                  {shortLabel}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
