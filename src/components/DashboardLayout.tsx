import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  PackagePlus,
  Package,
  Boxes,
  Settings,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  ChevronRight,
  ClipboardList,
} from "lucide-react";
import Colors from "../constants/colors";

const NAV_ITEMS = [
  { label: "Customer List", icon: Users, path: "/dashboard/customers" },
  { label: "Add Products", icon: PackagePlus, path: "/dashboard/add-products" },
  { label: "View Products", icon: Package, path: "/dashboard/view-products" },
  { label: "Manage Stocks", icon: Boxes, path: "/dashboard/stocks" },
  { label: "Orders", icon: ClipboardList, path: "/dashboard/orders" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => navigate("/");

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: Colors.background,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* ── Mobile Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          style={{ background: Colors.overlay }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ══════════════════════════════════════
          SIDEBAR
      ══════════════════════════════════════ */}
      <aside
        className="fixed lg:static inset-y-0 left-0 z-30 flex flex-col w-64 transition-transform duration-300 ease-in-out lg:translate-x-0"
        style={{
          background: `linear-gradient(180deg, ${Colors.accent} 0%, ${Colors.gradientEnd} 60%, #0a6b5e 100%)`,
          transform: sidebarOpen ? "translateX(0)" : undefined,
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* ── Brand Header ── */}
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
            <ShieldCheck size={22} color={Colors.white} strokeWidth={1.8} />
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
              Customer App
            </p>
          </div>
        </div>

        {/* ── Nav Items ── */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV_ITEMS.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
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

        {/* ── Logout ── */}
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
        {/* ── Top Bar ── */}
        <header
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{
            background: Colors.surface,
            borderBottom: `1px solid ${Colors.border}`,
            boxShadow: `0 2px 8px ${Colors.shadow}`,
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl transition-colors"
              style={{ color: Colors.textSecondary }}
              onClick={() => setSidebarOpen((v) => !v)}
            >
              {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            <div>
              <h2
                className="text-base font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Admin Dashboard
              </h2>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Customer App
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p
                className="text-sm font-semibold"
                style={{ color: Colors.textPrimary }}
              >
                Admin
              </p>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                {import.meta.env.VITE_ADMIN_EMAIL ?? "admin@example.com"}
              </p>
            </div>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                color: Colors.white,
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* ── Page Content ── */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  );
}
