import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Boxes, Search, Plus, Minus, CheckCircle2, AlertTriangle, AlertCircle,
  X, Filter, ChevronDown, TrendingDown, TrendingUp, RefreshCw, Download,
  ImageOff, Pencil, Check, History, PackageX, Star, Flame,
} from "lucide-react";
import Colors from "../constants/colors";
import { CATEGORIES } from "../constants/products";
import { StockAPI, type ApiProduct } from "../config/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StockProduct extends ApiProduct {
  minStockAlert: number;
}

interface StockLog {
  id: string;
  productId: string;
  productName: string;
  action: "add" | "reduce" | "set" | "toggle_fast" | "toggle_featured";
  delta: number;
  prevQty: number;
  newQty: number;
  timestamp: Date;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStockStatus(p: StockProduct): { label: string; color: string; bg: string; level: "ok" | "low" | "out" } {
  if (p.stockQuantity === 0)
    return { label: "Out of Stock", color: Colors.error, bg: "#FFF0F3", level: "out" };
  if (p.stockQuantity <= p.minStockAlert)
    return { label: "Low Stock", color: Colors.warning, bg: `${Colors.warning}18`, level: "low" };
  if (p.isFastMoving)
    return { label: "Fast Moving", color: Colors.info, bg: `${Colors.info}18`, level: "ok" };
  return { label: "In Stock", color: Colors.success, bg: `${Colors.success}18`, level: "ok" };
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
function Toast({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold shadow-xl"
      style={{
        background: type === "success" ? Colors.primaryLight : "#FFF0F3",
        color: type === "success" ? Colors.accent : Colors.error,
        border: `1px solid ${type === "success" ? Colors.accentLight : "#FFD0DA"}`,
        animation: "slideUp 0.3s ease",
      }}>
      {type === "success"
        ? <CheckCircle2 size={18} color={Colors.success} strokeWidth={2.5} />
        : <AlertTriangle size={18} color={Colors.error} strokeWidth={2.5} />}
      {message}
      <button onClick={onClose} style={{ color: Colors.textMuted }}><X size={16} /></button>
    </div>
  );
}

function ProductThumb({ src, name }: { src?: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: Colors.surfaceAlt, border: `1px solid ${Colors.border}` }}>
      <ImageOff size={16} color={Colors.border} strokeWidth={1.5} />
    </div>
  );
  return (
    <img src={src} alt={name} onError={() => setErr(true)}
      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
      style={{ background: Colors.surfaceAlt }} />
  );
}

// ── Qty Adjust Cell ───────────────────────────────────────────────────────────
function QtyCell({ product, onUpdate }: {
  product: StockProduct;
  onUpdate: (id: string, action: "add" | "reduce" | "set", val: number) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [inputVal, setInputVal] = useState(String(product.stockQuantity));
  const [stepVal, setStepVal] = useState(String(product.minOrderQuantity ?? 1));

  const commitSet = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n) && n >= 0) onUpdate(product._id, "set", n);
    setEditMode(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center rounded-xl overflow-hidden"
        style={{ border: `1.5px solid ${Colors.border}`, background: Colors.surface }}>
        <button
          onClick={() => { const step = parseInt(stepVal) || 1; onUpdate(product._id, "reduce", step); }}
          className="px-2.5 py-1.5 transition-colors duration-150 flex items-center"
          style={{ color: Colors.error }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#FFF0F3")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>

        {editMode ? (
          <div className="flex items-center gap-1 px-1">
            <input type="number" min="0" value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") commitSet(); if (e.key === "Escape") setEditMode(false); }}
              className="w-16 text-center text-sm font-bold outline-none bg-transparent"
              style={{ color: Colors.primary }} autoFocus />
            <button onClick={commitSet} style={{ color: Colors.success }}>
              <Check size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setInputVal(String(product.stockQuantity)); setEditMode(true); }}
            className="px-3 py-1.5 text-sm font-bold min-w-[48px] text-center"
            style={{
              color: product.stockQuantity <= product.minStockAlert && product.stockQuantity > 0
                ? Colors.warning
                : product.stockQuantity === 0 ? Colors.error : Colors.textPrimary,
            }}
            title="Click to set exact value"
          >
            {product.stockQuantity}
          </button>
        )}

        <button
          onClick={() => { const step = parseInt(stepVal) || 1; onUpdate(product._id, "add", step); }}
          className="px-2.5 py-1.5 transition-colors duration-150 flex items-center"
          style={{ color: Colors.success }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = `${Colors.success}18`)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>

      <div className="relative">
        <select value={stepVal} onChange={(e) => setStepVal(e.target.value)}
          className="pl-2 pr-6 py-1.5 rounded-xl text-xs outline-none appearance-none cursor-pointer"
          style={{ background: Colors.surfaceAlt, border: `1.5px solid ${Colors.border}`, color: Colors.textSecondary }}>
          {[1, 2, 5, 10, 25, 50, 100].map((v) => <option key={v} value={v}>±{v}</option>)}
        </select>
        <ChevronDown size={11} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: Colors.textMuted }} />
      </div>

      <span className="text-xs" style={{ color: Colors.textMuted }}>
        {product.unit}{product.weightOrSize && ` · ${product.weightOrSize}`}
      </span>
    </div>
  );
}

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr style={{ borderTop: `1px solid ${Colors.divider}` }}>
      {Array.from({ length: 10 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 rounded-lg animate-pulse" style={{ background: Colors.surfaceAlt, width: i === 1 ? 160 : 60 }} />
        </td>
      ))}
    </tr>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ManageStocks() {
  const [products, setProducts] = useState<StockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 20;

  const [logs, setLogs] = useState<StockLog[]>([]);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("All");
  const [showLog, setShowLog] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [alertThresholdId, setAlertThresholdId] = useState<string | null>(null);
  const [alertInput, setAlertInput] = useState("");
  const [pendingOps, setPendingOps] = useState<Set<string>>(new Set());

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };

  const markPending = (id: string) => setPendingOps((s) => new Set(s).add(id));
  const clearPending = (id: string) => setPendingOps((s) => { const n = new Set(s); n.delete(id); return n; });

  // ── Fetch stock list ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    setFetchError(null);
    try {
      const params: Record<string, string> = { page: String(pg), limit: String(LIMIT) };
      if (categoryFilter !== "all") params.category = categoryFilter;
      if (debouncedSearch)          params.search    = debouncedSearch;
      if (stockFilter === "Fast Moving") params.fastMoving = "true";

      const res = await StockAPI.getList(params);
      const { products: raw, pagination } = res.data;

      // Merge server products with any local alert thresholds we've set
      setProducts((prev) => {
        const alertMap: Record<string, number> = {};
        prev.forEach((p) => { alertMap[p._id] = p.minStockAlert; });
        return raw.map((p) => ({
          ...p,
          minStockAlert: alertMap[p._id] ?? (p.isFastMoving ? 20 : 10),
        }));
      });

      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.total);
      setPage(pg);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, debouncedSearch, stockFilter]);

  // Initial load + filter changes
  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  // Debounce search input
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 420);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0, lowStock: 0, fastMoving: 0, featured: 0 });

  useEffect(() => {
    StockAPI.getStats().then((r) => setStats(r.data)).catch(() => null);
  }, [products]); // re-fetch after mutations so stats stay live

  // ── Push log entry ────────────────────────────────────────────────────────
  const pushLog = (
    productId: string, productName: string,
    action: StockLog["action"], prevQty: number, newQty: number
  ) => {
    const entry: StockLog = {
      id: Date.now().toString() + Math.random(),
      productId, productName, action,
      delta: newQty - prevQty, prevQty, newQty,
      timestamp: new Date(),
    };
    setLogs((l) => [entry, ...l.slice(0, 49)]);
  };

  // ── Update stock quantity ─────────────────────────────────────────────────
  const handleUpdate = async (id: string, action: "add" | "reduce" | "set", val: number) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;

    const prevQty = product.stockQuantity;
    const newQty = action === "add" ? prevQty + val
      : action === "reduce" ? Math.max(0, prevQty - val)
      : Math.max(0, val);

    // Optimistic update
    setProducts((prev) => prev.map((p) =>
      p._id === id ? { ...p, stockQuantity: newQty } : p
    ));
    pushLog(id, product.name, action, prevQty, newQty);

    markPending(id);
    try {
      const mode = action === "set" ? "set" : action === "add" ? "increment" : "decrement";
      await StockAPI.adjustQuantity(id, mode, val);

      if (action === "reduce" && newQty === 0)
        showToast("error", `"${product.name}" is now out of stock!`);
      else if (newQty <= product.minStockAlert && newQty > 0)
        showToast("error", `"${product.name}" stock is low (${newQty} ${product.unit}s)`);
      else if (newQty !== prevQty)
        showToast("success", `"${product.name}" updated: ${prevQty} → ${newQty}`);
    } catch (e) {
      // Revert on failure
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, stockQuantity: prevQty } : p));
      showToast("error", e instanceof Error ? e.message : "Update failed.");
    } finally {
      clearPending(id);
    }
  };

  // ── Toggle Fast Moving ────────────────────────────────────────────────────
  const handleToggleFastMoving = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;
    const next = !product.isFastMoving;

    setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFastMoving: next } : p));
    pushLog(id, product.name, "toggle_fast", product.stockQuantity, product.stockQuantity);

    markPending(id);
    try {
      await StockAPI.toggleFastMoving(id, next);
      showToast("success", `"${product.name}" ${next ? "marked as" : "removed from"} Fast Moving`);
    } catch (e) {
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFastMoving: !next } : p));
      showToast("error", e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      clearPending(id);
    }
  };

  // ── Toggle Featured ───────────────────────────────────────────────────────
  const handleToggleFeatured = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;
    const next = !product.isFeatured;

    setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFeatured: next } : p));
    pushLog(id, product.name, "toggle_featured", product.stockQuantity, product.stockQuantity);

    markPending(id);
    try {
      await StockAPI.toggleFeatured(id, next);
      showToast("success", `"${product.name}" ${next ? "marked as" : "removed from"} Featured`);
    } catch (e) {
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFeatured: !next } : p));
      showToast("error", e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      clearPending(id);
    }
  };

  // ── Set alert threshold (local only — persisted via alertAt API) ──────────
  const handleSetAlert = async (id: string) => {
    const n = parseInt(alertInput);
    if (isNaN(n) || n < 0) { showToast("error", "Enter a valid threshold."); return; }
    setProducts((prev) => prev.map((p) => p._id === id ? { ...p, minStockAlert: n } : p));
    // Also persist to backend
    try { await StockAPI.setAlert(id, n); } catch { /* non-critical */ }
    showToast("success", "Alert threshold updated!");
    setAlertThresholdId(null);
    setAlertInput("");
  };

  // ── Bulk restock OOS ──────────────────────────────────────────────────────
  const handleBulkRestock = async () => {
    try {
      const res = await StockAPI.restockAllOOS(10);
      showToast("success", res.message);
      fetchProducts(page);
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Restock failed.");
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = () => {
    StockAPI.exportCSV();
    showToast("success", "Stock report download started!");
  };

  // ── Client-side "Out of Stock" filter (server doesn't support it directly) ─
  const filtered = useMemo(() => {
    if (stockFilter === "Out of Stock") return products.filter((p) => p.stockQuantity === 0);
    if (stockFilter === "Low Stock")    return products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert);
    if (stockFilter === "In Stock")     return products.filter((p) => p.stockQuantity > p.minStockAlert);
    return products;
  }, [products, stockFilter]);

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="flex flex-col gap-6 pb-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Boxes size={20} color={Colors.primary} strokeWidth={2} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: Colors.textPrimary }}>Manage Stocks</h1>
              <p className="text-xs" style={{ color: Colors.textMuted }}>Update quantities, set alerts, manage fast moving items</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowLog((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
              style={{ background: showLog ? Colors.primaryLight : Colors.surface, color: showLog ? Colors.primary : Colors.textSecondary, border: `1.5px solid ${showLog ? Colors.borderFocus : Colors.border}` }}>
              <History size={16} strokeWidth={2} />
              Activity Log {logs.length > 0 && `(${logs.length})`}
            </button>
            <button onClick={handleBulkRestock}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ background: `${Colors.warning}18`, color: Colors.warning, border: `1.5px solid ${Colors.warning}40` }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = Colors.warning; (e.currentTarget as HTMLElement).style.color = Colors.white; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${Colors.warning}18`; (e.currentTarget as HTMLElement).style.color = Colors.warning; }}>
              <RefreshCw size={16} strokeWidth={2} />
              Restock All OOS
            </button>
            <button onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{ background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`, color: Colors.white, boxShadow: `0 4px 12px rgba(0,168,132,0.3)` }}>
              <Download size={16} strokeWidth={2} />
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { label: "Total",        value: stats.total,       color: Colors.primary,  bg: Colors.primaryLight,    icon: Boxes },
            { label: "In Stock",     value: stats.inStock,     color: Colors.success,  bg: `${Colors.success}18`,  icon: TrendingUp },
            { label: "Low Stock",    value: stats.lowStock,    color: Colors.warning,  bg: `${Colors.warning}18`,  icon: TrendingDown },
            { label: "Out of Stock", value: stats.outOfStock,  color: Colors.error,    bg: "#FFF0F3",              icon: PackageX },
            { label: "Fast Moving",  value: stats.fastMoving,  color: Colors.info,     bg: `${Colors.info}18`,     icon: Flame },
            { label: "Featured",     value: stats.featured,    color: Colors.warning,  bg: `${Colors.warning}18`,  icon: Star },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
              style={{ background: Colors.surface, border: `1px solid ${Colors.border}`, boxShadow: `0 2px 8px ${Colors.shadow}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <div>
                <p className="text-xl font-bold leading-tight" style={{ color: Colors.textPrimary }}>{value}</p>
                <p className="text-xs" style={{ color: Colors.textMuted }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Alert Banner ── */}
        {(stats.lowStock > 0 || stats.outOfStock > 0) && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: `${Colors.warning}12`, border: `1.5px solid ${Colors.warning}40` }}>
            <AlertCircle size={20} color={Colors.warning} strokeWidth={2} className="flex-shrink-0" />
            <p className="text-sm" style={{ color: Colors.textPrimary }}>
              <span className="font-bold">Attention: </span>
              {stats.outOfStock > 0 && <span style={{ color: Colors.error }}>{stats.outOfStock} product{stats.outOfStock > 1 ? "s" : ""} out of stock</span>}
              {stats.outOfStock > 0 && stats.lowStock > 0 && <span style={{ color: Colors.textMuted }}> · </span>}
              {stats.lowStock > 0 && <span style={{ color: Colors.warning }}>{stats.lowStock} product{stats.lowStock > 1 ? "s" : ""} running low</span>}
              <span style={{ color: Colors.textMuted }}>. Consider restocking soon.</span>
            </p>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: searchFocused ? Colors.primary : Colors.textMuted }}>
              <Search size={16} strokeWidth={2} />
            </div>
            <input type="text" placeholder="Search products, brand, category…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all duration-200"
              style={{ background: searchFocused ? Colors.primaryLight : Colors.surface, border: `1.5px solid ${searchFocused ? Colors.borderFocus : Colors.border}`, color: Colors.textPrimary }} />
          </div>
          <div className="relative">
            <Filter size={15} color={Colors.textMuted} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
              style={{ background: Colors.surface, border: `1.5px solid ${Colors.border}`, color: Colors.textSecondary, minWidth: 180 }}>
              <option value="all">All Categories</option>
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
            <ChevronDown size={14} color={Colors.textMuted} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="relative">
            <Boxes size={15} color={Colors.textMuted} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
              style={{ background: Colors.surface, border: `1.5px solid ${Colors.border}`, color: Colors.textSecondary, minWidth: 160 }}>
              {["All", "In Stock", "Low Stock", "Out of Stock", "Fast Moving"].map((s) => <option key={s}>{s}</option>)}
            </select>
            <ChevronDown size={14} color={Colors.textMuted} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* ── Error State ── */}
        {fetchError && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: "#FFF0F3", border: `1.5px solid #FFD0DA` }}>
            <AlertCircle size={18} color={Colors.error} strokeWidth={2} />
            <p className="text-sm flex-1" style={{ color: Colors.error }}>{fetchError}</p>
            <button onClick={() => fetchProducts(page)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: Colors.error, color: Colors.white }}>Retry</button>
          </div>
        )}

        {/* ════════════════════════════════════════
            MAIN TABLE
        ════════════════════════════════════════ */}
        <div className="rounded-3xl overflow-hidden"
          style={{ background: Colors.surface, border: `1px solid ${Colors.border}`, boxShadow: `0 4px 16px ${Colors.shadow}` }}>
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}>
            <p className="text-sm font-bold" style={{ color: Colors.textPrimary }}>
              {loading ? "Loading…" : `${filtered.length} of ${totalCount} products`}
            </p>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Click qty number to type exact value · Min order qty used as default step
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr style={{ background: Colors.surfaceAlt }}>
                  {["#", "Product", "Category", "Status", "Qty / Adjust", "Step", "Fast Moving", "Featured", "Alert At", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-wide uppercase whitespace-nowrap"
                      style={{ color: Colors.textSecondary }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.length === 0
                    ? (
                      <tr>
                        <td colSpan={10} className="py-16 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <Boxes size={36} color={Colors.border} strokeWidth={1.5} />
                            <p className="text-sm" style={{ color: Colors.textMuted }}>No products match your filters</p>
                          </div>
                        </td>
                      </tr>
                    )
                    : filtered.map((product, idx) => {
                      const stock = getStockStatus(product);
                      const isPending = pendingOps.has(product._id);
                      return (
                        <tr key={product._id}
                          style={{ borderTop: `1px solid ${Colors.divider}`, opacity: isPending ? 0.7 : 1, transition: "opacity 0.2s" }}
                          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = Colors.primaryLight)}
                          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                          className="transition-colors duration-150">
                          {/* # */}
                          <td className="px-5 py-4">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                              style={{ background: Colors.surfaceAlt, color: Colors.textSecondary }}>
                              {(page - 1) * LIMIT + idx + 1}
                            </span>
                          </td>

                          {/* Product */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <ProductThumb src={product.imageUrl} name={product.name} />
                              <div>
                                <p className="text-sm font-semibold" style={{ color: Colors.textPrimary }}>{product.name}</p>
                                <p className="text-xs" style={{ color: Colors.textMuted }}>
                                  {product.brand && `${product.brand} · `}{product.unit}{product.weightOrSize && ` ${product.weightOrSize}`}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-lg whitespace-nowrap"
                              style={{ background: Colors.primaryLight, color: Colors.primary }}>
                              {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
                            </span>
                            {product.subCategory && (
                              <p className="text-xs mt-1" style={{ color: Colors.textMuted }}>{product.subCategory}</p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-5 py-4">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap"
                              style={{ background: stock.bg, color: stock.color }}>{stock.label}</span>
                          </td>

                          {/* Qty Adjust */}
                          <td className="px-5 py-4">
                            <QtyCell product={product} onUpdate={handleUpdate} />
                          </td>

                          {/* Step column spacer (rendered inside QtyCell) */}
                          <td className="px-5 py-4" />

                          {/* Fast Moving */}
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleToggleFastMoving(product._id)}
                              disabled={isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                              style={{
                                background: product.isFastMoving ? `${Colors.info}18` : Colors.surfaceAlt,
                                color: product.isFastMoving ? Colors.info : Colors.textSecondary,
                                border: `1px solid ${product.isFastMoving ? Colors.info + "40" : Colors.border}`,
                                cursor: isPending ? "not-allowed" : "pointer",
                              }}>
                              <Flame size={14} />
                              {product.isFastMoving ? "Fast" : "Normal"}
                            </button>
                          </td>

                          {/* Featured */}
                          <td className="px-5 py-4">
                            <button
                              onClick={() => handleToggleFeatured(product._id)}
                              disabled={isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                              style={{
                                background: product.isFeatured ? `${Colors.warning}18` : Colors.surfaceAlt,
                                color: product.isFeatured ? Colors.warning : Colors.textSecondary,
                                border: `1px solid ${product.isFeatured ? Colors.warning + "40" : Colors.border}`,
                                cursor: isPending ? "not-allowed" : "pointer",
                              }}>
                              <Star size={14} />
                              {product.isFeatured ? "Featured" : "—"}
                            </button>
                          </td>

                          {/* Alert Threshold */}
                          <td className="px-5 py-4">
                            {alertThresholdId === product._id ? (
                              <div className="flex items-center gap-1.5">
                                <input type="number" min="0" value={alertInput}
                                  onChange={(e) => setAlertInput(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === "Enter") handleSetAlert(product._id); if (e.key === "Escape") setAlertThresholdId(null); }}
                                  className="w-16 px-2 py-1.5 rounded-xl text-sm text-center outline-none"
                                  style={{ border: `1.5px solid ${Colors.borderFocus}`, color: Colors.textPrimary, background: Colors.primaryLight }}
                                  autoFocus />
                                <button onClick={() => handleSetAlert(product._id)} style={{ color: Colors.success }}>
                                  <Check size={16} strokeWidth={2.5} />
                                </button>
                                <button onClick={() => setAlertThresholdId(null)} style={{ color: Colors.textMuted }}>
                                  <X size={14} strokeWidth={2} />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => { setAlertThresholdId(product._id); setAlertInput(String(product.minStockAlert)); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold"
                                style={{ background: `${Colors.warning}18`, color: Colors.warning, border: `1px solid ${Colors.warning}30` }}>
                                <AlertTriangle size={13} strokeWidth={2} />≤ {product.minStockAlert}
                                <Pencil size={11} strokeWidth={2} />
                              </button>
                            )}
                          </td>

                          {/* Quick Restock */}
                          <td className="px-5 py-4">
                            {product.stockQuantity === 0 && (
                              <button
                                onClick={() => handleUpdate(product._id, "set", product.isFastMoving ? 50 : 30)}
                                disabled={isPending}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150"
                                style={{ background: `${Colors.success}18`, color: Colors.success, border: `1px solid ${Colors.success}40` }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = Colors.success; (e.currentTarget as HTMLElement).style.color = Colors.white; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${Colors.success}18`; (e.currentTarget as HTMLElement).style.color = Colors.success; }}>
                                <RefreshCw size={13} strokeWidth={2} /> Restock
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ── */}
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: `1px solid ${Colors.divider}`, background: Colors.surfaceAlt }}>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Page {page} of {totalPages} · {totalCount} total products
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchProducts(page - 1)}
                disabled={page <= 1 || loading}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: page <= 1 ? Colors.surfaceAlt : Colors.surface,
                  color: page <= 1 ? Colors.textMuted : Colors.textPrimary,
                  border: `1.5px solid ${Colors.border}`,
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  opacity: page <= 1 ? 0.5 : 1,
                }}>
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button key={pg} onClick={() => fetchProducts(pg)}
                    className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: pg === page
                        ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
                        : Colors.surface,
                      color: pg === page ? Colors.white : Colors.textSecondary,
                      border: `1.5px solid ${pg === page ? "transparent" : Colors.border}`,
                    }}>
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => fetchProducts(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: page >= totalPages ? Colors.surfaceAlt : Colors.surface,
                  color: page >= totalPages ? Colors.textMuted : Colors.textPrimary,
                  border: `1.5px solid ${Colors.border}`,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.5 : 1,
                }}>
                Next →
              </button>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════
            ACTIVITY LOG
        ════════════════════════════════════════ */}
        {showLog && (
          <div className="rounded-3xl overflow-hidden"
            style={{ background: Colors.surface, border: `1px solid ${Colors.border}`, boxShadow: `0 4px 16px ${Colors.shadow}` }}>
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})` }}>
              <div className="flex items-center gap-2">
                <History size={18} color={Colors.white} strokeWidth={2} />
                <p className="text-sm font-bold" style={{ color: Colors.white }}>Stock Activity Log</p>
                <span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: "rgba(255,255,255,0.2)", color: Colors.white }}>
                  Session only
                </span>
              </div>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <button onClick={() => setLogs([])} className="text-xs px-3 py-1.5 rounded-xl font-medium"
                    style={{ background: "rgba(255,255,255,0.18)", color: Colors.white }}>Clear</button>
                )}
                <button onClick={() => setShowLog(false)} style={{ color: "rgba(255,255,255,0.7)" }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <History size={32} color={Colors.border} strokeWidth={1.5} />
                <p className="text-sm" style={{ color: Colors.textMuted }}>No activity yet — start adjusting stocks above</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: Colors.divider, maxHeight: 360, overflowY: "auto" }}>
                {logs.map((log) => {
                  const isAdd = log.action === "add" || (log.action === "set" && log.delta > 0);
                  const isRemove = log.action === "reduce" || (log.action === "set" && log.delta < 0);
                  const isToggle = log.action === "toggle_fast" || log.action === "toggle_featured";
                  return (
                    <div key={log.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors"
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = Colors.surfaceAlt)}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isAdd ? `${Colors.success}18` : isRemove ? "#FFF0F3" : `${Colors.info}18`,
                          color: isAdd ? Colors.success : isRemove ? Colors.error : Colors.info,
                        }}>
                        {isAdd ? <TrendingUp size={16} strokeWidth={2} />
                          : isRemove ? <TrendingDown size={16} strokeWidth={2} />
                          : log.action === "toggle_fast" ? <Flame size={16} strokeWidth={2} />
                          : <Star size={16} strokeWidth={2} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: Colors.textPrimary }}>{log.productName}</p>
                        <p className="text-xs" style={{ color: Colors.textMuted }}>
                          {isToggle
                            ? `${log.action === "toggle_fast" ? "Fast Moving" : "Featured"} toggled`
                            : `${log.action === "set" ? "Set to" : log.action === "add" ? "Added" : "Reduced by"} ${Math.abs(log.delta)} · ${log.prevQty} → ${log.newQty}`}
                        </p>
                      </div>
                      {!isToggle && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                          style={{
                            background: log.delta > 0 ? `${Colors.success}18` : log.delta < 0 ? "#FFF0F3" : Colors.surfaceAlt,
                            color: log.delta > 0 ? Colors.success : log.delta < 0 ? Colors.error : Colors.textMuted,
                          }}>
                          {log.delta > 0 ? `+${log.delta}` : log.delta < 0 ? `${log.delta}` : "No change"}
                        </span>
                      )}
                      <span className="text-xs flex-shrink-0" style={{ color: Colors.textMuted }}>{timeAgo(log.timestamp)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input::placeholder { color: ${Colors.textMuted}; }
        select option { color: ${Colors.textPrimary}; background: ${Colors.surface}; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </>
  );
}