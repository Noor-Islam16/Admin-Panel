import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  Boxes,
  Search,
  Plus,
  Minus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  X,
  Filter,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Download,
  Check,
  PackageX,
  Smartphone,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import Colors from "../constants/colors";
import { CATEGORIES } from "../constants/products";
import { StockAPI, type ApiProduct } from "../config/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StockProduct extends ApiProduct {
  minStockAlert: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStockStatus(p: StockProduct): {
  label: string;
  color: string;
  bg: string;
  level: "ok" | "low" | "out";
} {
  if (p.stockQuantity === 0)
    return {
      label: "Out of Stock",
      color: Colors.error,
      bg: "#FFF0F3",
      level: "out",
    };
  if (p.stockQuantity <= p.minStockAlert)
    return {
      label: "Low Stock",
      color: Colors.warning,
      bg: `${Colors.warning}18`,
      level: "low",
    };
  return {
    label: "In Stock",
    color: Colors.success,
    bg: `${Colors.success}18`,
    level: "ok",
  };
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

// ── Product Thumb ─────────────────────────────────────────────────────────────
function ProductThumb({
  images,
  name,
}: {
  images?: ApiProduct["images"];
  name: string;
}) {
  const [err, setErr] = useState(false);
  const primaryImage =
    images?.find((img) => img.isPrimary)?.url || images?.[0]?.url;
  if (!primaryImage || err)
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: Colors.surfaceAlt,
          border: `1px solid ${Colors.border}`,
        }}
      >
        <Smartphone size={16} color={Colors.border} strokeWidth={1.5} />
      </div>
    );
  return (
    <img
      src={primaryImage}
      alt={name}
      onError={() => setErr(true)}
      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
      style={{ background: Colors.surfaceAlt }}
    />
  );
}

// ── Order Limits Toggle Cell ──────────────────────────────────────────────────
function ToggleLimitsCell({
  product,
  onToggle,
}: {
  product: StockProduct;
  onToggle: (id: string, value: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const isOn = product.enforceOrderLimits !== false;

  const handleToggle = async () => {
    const newValue = !isOn;
    setLoading(true);
    try {
      await onToggle(product._id, newValue);
    } catch {
      // Error handled in parent
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className="flex items-center gap-2 transition-all duration-200"
      title={
        isOn
          ? "Order limits enforced (min/max apply)"
          : "No order limits (unlimited orders)"
      }
    >
      {isOn ? (
        <ToggleRight size={20} color={Colors.success} />
      ) : (
        <ToggleLeft size={20} color={Colors.textMuted} />
      )}
      <span
        className="text-xs font-medium whitespace-nowrap"
        style={{ color: isOn ? Colors.success : Colors.textMuted }}
      >
        {isOn ? "ON" : "OFF"}
      </span>
    </button>
  );
}

// ── Qty Adjust Cell ───────────────────────────────────────────────────────────
function QtyCell({
  product,
  onUpdate,
}: {
  product: StockProduct;
  onUpdate: (id: string, action: "add" | "reduce" | "set", val: number) => void;
}) {
  const [editMode, setEditMode] = useState(false);
  const [inputVal, setInputVal] = useState(String(product.stockQuantity));
  const [stepVal, setStepVal] = useState(String(product.minOrderQuantity ?? 1));
  const limitsEnabled = product.enforceOrderLimits !== false;

  const commitSet = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n) && n >= 0) onUpdate(product._id, "set", n);
    setEditMode(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div
        className="flex items-center rounded-xl overflow-hidden"
        style={{
          border: `1.5px solid ${Colors.border}`,
          background: Colors.surface,
        }}
      >
        <button
          onClick={() => {
            const step = parseInt(stepVal) || 1;
            onUpdate(product._id, "reduce", step);
          }}
          className="px-2.5 py-1.5 transition-colors duration-150 flex items-center"
          style={{ color: Colors.error }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#FFF0F3")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          <Minus size={14} strokeWidth={2.5} />
        </button>
        {editMode ? (
          <div className="flex items-center gap-1 px-1">
            <input
              type="number"
              min="0"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitSet();
                if (e.key === "Escape") setEditMode(false);
              }}
              className="w-16 text-center text-sm font-bold outline-none bg-transparent"
              style={{ color: Colors.primary }}
              autoFocus
            />
            <button onClick={commitSet} style={{ color: Colors.success }}>
              <Check size={14} strokeWidth={2.5} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setInputVal(String(product.stockQuantity));
              setEditMode(true);
            }}
            className="px-3 py-1.5 text-sm font-bold min-w-[48px] text-center"
            style={{
              color:
                product.stockQuantity <= product.minStockAlert &&
                product.stockQuantity > 0
                  ? Colors.warning
                  : product.stockQuantity === 0
                    ? Colors.error
                    : Colors.textPrimary,
            }}
            title="Click to set exact value"
          >
            {product.stockQuantity}
          </button>
        )}
        <button
          onClick={() => {
            const step = parseInt(stepVal) || 1;
            onUpdate(product._id, "add", step);
          }}
          className="px-2.5 py-1.5 transition-colors duration-150 flex items-center"
          style={{ color: Colors.success }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background =
              `${Colors.success}18`)
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          <Plus size={14} strokeWidth={2.5} />
        </button>
      </div>
      <div className="relative">
        <select
          value={stepVal}
          onChange={(e) => setStepVal(e.target.value)}
          className="pl-2 pr-6 py-1.5 rounded-xl text-xs outline-none appearance-none cursor-pointer"
          style={{
            background: Colors.surfaceAlt,
            border: `1.5px solid ${Colors.border}`,
            color: Colors.textSecondary,
          }}
        >
          {[1, 2, 5, 10, 25, 50, 100].map((v) => (
            <option key={v} value={v}>
              ±{v}
            </option>
          ))}
        </select>
        <ChevronDown
          size={11}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: Colors.textMuted }}
        />
      </div>
      {/* Only show min/max info when limits are enforced */}
      {limitsEnabled && (
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: Colors.textMuted }}>
            min {product.minOrderQuantity}
          </span>
          {product.maxOrderQuantity && (
            <>
              <span
                className="text-xs opacity-40"
                style={{ color: Colors.textMuted }}
              >
                ·
              </span>
              <span className="text-xs" style={{ color: Colors.textMuted }}>
                max {product.maxOrderQuantity}
              </span>
            </>
          )}
        </div>
      )}
      {!limitsEnabled && (
        <span className="text-xs italic" style={{ color: Colors.warning }}>
          No order limits
        </span>
      )}
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderTop: `1px solid ${Colors.divider}` }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div
            className="h-4 rounded-lg animate-pulse"
            style={{ background: Colors.surfaceAlt, width: i === 1 ? 160 : 60 }}
          />
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
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 20;

  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("All");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [pendingOps, setPendingOps] = useState<Set<string>>(new Set());

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3200);
  };
  const markPending = (id: string) => setPendingOps((s) => new Set(s).add(id));
  const clearPending = (id: string) =>
    setPendingOps((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  // ── Fetch stock list ──────────────────────────────────────────────────────
  const fetchProducts = useCallback(
    async (pg = 1) => {
      setLoading(true);
      setFetchError(null);
      try {
        const params: Record<string, string> = {
          page: String(pg),
          limit: String(LIMIT),
        };
        if (categoryFilter !== "all") params.category = categoryFilter;
        if (debouncedSearch) params.search = debouncedSearch;

        const res = await StockAPI.getList(params);
        const { products: raw, pagination } = res.data;

        setProducts((prev) => {
          const alertMap: Record<string, number> = {};
          const limitsMap: Record<string, boolean> = {};
          prev.forEach((p) => {
            alertMap[p._id] = p.minStockAlert;
            limitsMap[p._id] = p.enforceOrderLimits ?? true;
          });
          return raw.map((p) => ({
            ...p,
            minStockAlert: alertMap[p._id] ?? 10,
            enforceOrderLimits:
              limitsMap[p._id] ?? p.enforceOrderLimits !== false,
          }));
        });
        setTotalPages(pagination.totalPages);
        setTotalCount(pagination.total);
        setPage(pg);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "Failed to load products.",
        );
      } finally {
        setLoading(false);
      }
    },
    [categoryFilter, debouncedSearch],
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 420);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
  });

  useEffect(() => {
    StockAPI.getStats()
      .then((r) => setStats(r.data))
      .catch(() => null);
  }, [products]);

  // ── Update stock ──────────────────────────────────────────────────────────
  const handleUpdate = async (
    id: string,
    action: "add" | "reduce" | "set",
    val: number,
  ) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;

    const prevQty = product.stockQuantity;
    const newQty =
      action === "add"
        ? prevQty + val
        : action === "reduce"
          ? Math.max(0, prevQty - val)
          : Math.max(0, val);

    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, stockQuantity: newQty } : p)),
    );
    markPending(id);
    try {
      const mode =
        action === "set" ? "set" : action === "add" ? "increment" : "decrement";
      await StockAPI.adjustQuantity(id, mode, val);
      if (action === "reduce" && newQty === 0)
        showToast("error", `"${product.name}" is now out of stock!`);
      else if (newQty !== prevQty)
        showToast(
          "success",
          `"${product.name}" updated: ${prevQty} → ${newQty}`,
        );
    } catch (e) {
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stockQuantity: prevQty } : p)),
      );
      showToast("error", e instanceof Error ? e.message : "Update failed.");
    } finally {
      clearPending(id);
    }
  };

  // ── Toggle order limits ───────────────────────────────────────────────────
  const handleToggleLimits = async (id: string, value: boolean) => {
    try {
      await StockAPI.toggleOrderLimits(id, value);

      // Update local state
      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, enforceOrderLimits: value } : p,
        ),
      );

      showToast(
        "success",
        `Order limits ${value ? "enabled" : "disabled"} for this product`,
      );
    } catch (e) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to toggle order limits",
      );
      throw e; // Re-throw so ToggleLimitsCell can handle loading state
    }
  };

  // ── Bulk restock ──────────────────────────────────────────────────────────
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

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (stockFilter === "Out of Stock")
      return products.filter((p) => p.stockQuantity === 0);
    if (stockFilter === "Low Stock")
      return products.filter(
        (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert,
      );
    if (stockFilter === "In Stock")
      return products.filter((p) => p.stockQuantity > p.minStockAlert);
    return products;
  }, [products, stockFilter]);

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}

      <div className="flex flex-col gap-6 pb-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Boxes size={20} color={Colors.primary} strokeWidth={2} />
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Manage Stocks
              </h1>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Inventory management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleBulkRestock}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{
                background: `${Colors.warning}18`,
                color: Colors.warning,
                border: `1.5px solid ${Colors.warning}40`,
              }}
            >
              <RefreshCw size={16} strokeWidth={2} /> Restock All OOS
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                color: Colors.white,
                boxShadow: `0 4px 12px rgba(0,168,132,0.3)`,
              }}
            >
              <Download size={16} strokeWidth={2} /> Export CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total",
              value: stats.total,
              color: Colors.primary,
              bg: Colors.primaryLight,
              icon: Boxes,
            },
            {
              label: "In Stock",
              value: stats.inStock,
              color: Colors.success,
              bg: `${Colors.success}18`,
              icon: TrendingUp,
            },
            {
              label: "Low Stock",
              value: stats.lowStock,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: TrendingDown,
            },
            {
              label: "Out of Stock",
              value: stats.outOfStock,
              color: Colors.error,
              bg: "#FFF0F3",
              icon: PackageX,
            },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div
              key={label}
              className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
              style={{
                background: Colors.surface,
                border: `1px solid ${Colors.border}`,
                boxShadow: `0 2px 8px ${Colors.shadow}`,
              }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}
              >
                <Icon size={18} color={color} strokeWidth={2} />
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

        {/* Alert Banner */}
        {(stats.lowStock > 0 || stats.outOfStock > 0) && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{
              background: `${Colors.warning}12`,
              border: `1.5px solid ${Colors.warning}40`,
            }}
          >
            <AlertCircle
              size={20}
              color={Colors.warning}
              strokeWidth={2}
              className="flex-shrink-0"
            />
            <p className="text-sm" style={{ color: Colors.textPrimary }}>
              <span className="font-bold">Attention: </span>
              {stats.outOfStock > 0 && (
                <span style={{ color: Colors.error }}>
                  {stats.outOfStock} product{stats.outOfStock > 1 ? "s" : ""}{" "}
                  out of stock
                </span>
              )}
              {stats.outOfStock > 0 && stats.lowStock > 0 && (
                <span style={{ color: Colors.textMuted }}> · </span>
              )}
              {stats.lowStock > 0 && (
                <span style={{ color: Colors.warning }}>
                  {stats.lowStock} product{stats.lowStock > 1 ? "s" : ""}{" "}
                  running low
                </span>
              )}
              <span style={{ color: Colors.textMuted }}>
                . Consider restocking soon.
              </span>
            </p>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{
                color: searchFocused ? Colors.primary : Colors.textMuted,
              }}
            >
              <Search size={16} strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Search accessories…"
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
          <div className="relative">
            <Filter
              size={15}
              color={Colors.textMuted}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={2}
            />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
              style={{
                background: Colors.surface,
                border: `1.5px solid ${Colors.border}`,
                color: Colors.textSecondary,
                minWidth: 180,
              }}
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color={Colors.textMuted}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
          <div className="relative">
            <Boxes
              size={15}
              color={Colors.textMuted}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={2}
            />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
              style={{
                background: Colors.surface,
                border: `1.5px solid ${Colors.border}`,
                color: Colors.textSecondary,
                minWidth: 160,
              }}
            >
              {["All", "In Stock", "Low Stock", "Out of Stock"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color={Colors.textMuted}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* Error */}
        {fetchError && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: "#FFF0F3", border: `1.5px solid #FFD0DA` }}
          >
            <AlertCircle size={18} color={Colors.error} strokeWidth={2} />
            <p className="text-sm flex-1" style={{ color: Colors.error }}>
              {fetchError}
            </p>
            <button
              onClick={() => fetchProducts(page)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: Colors.error, color: Colors.white }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            boxShadow: `0 4px 16px ${Colors.shadow}`,
          }}
        >
          <div
            className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-sm font-bold"
              style={{ color: Colors.textPrimary }}
            >
              {loading
                ? "Loading…"
                : `${filtered.length} of ${totalCount} products`}
            </p>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Click qty number to type exact value · Toggle limits per product
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr style={{ background: Colors.surfaceAlt }}>
                  {[
                    "#",
                    "Product",
                    "Category",
                    "Status",
                    "Qty / Adjust",
                    "Limits",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase whitespace-nowrap"
                      style={{ color: Colors.textSecondary }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Smartphone
                          size={36}
                          color={Colors.border}
                          strokeWidth={1.5}
                        />
                        <p
                          className="text-sm"
                          style={{ color: Colors.textMuted }}
                        >
                          No products match your filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((product, idx) => {
                    const stock = getStockStatus(product);
                    const isPending = pendingOps.has(product._id);
                    return (
                      <tr
                        key={product._id}
                        style={{
                          borderTop: `1px solid ${Colors.divider}`,
                          opacity: isPending ? 0.7 : 1,
                          transition: "opacity 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            Colors.primaryLight)
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "transparent")
                        }
                        className="transition-colors duration-150"
                      >
                        <td className="px-4 py-4">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                            style={{
                              background: Colors.surfaceAlt,
                              color: Colors.textSecondary,
                            }}
                          >
                            {(page - 1) * LIMIT + idx + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <ProductThumb
                              images={product.images}
                              name={product.name}
                            />
                            <div className="min-w-0">
                              <p
                                className="text-sm font-semibold truncate"
                                style={{ color: Colors.textPrimary }}
                              >
                                {product.name}
                              </p>
                              {product.brand && (
                                <p
                                  className="text-xs font-medium"
                                  style={{ color: Colors.primary }}
                                >
                                  {product.brand}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-lg whitespace-nowrap"
                            style={{
                              background: Colors.primaryLight,
                              color: Colors.primary,
                            }}
                          >
                            {CATEGORIES.find((c) => c.id === product.category)
                              ?.name || product.category}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap"
                            style={{ background: stock.bg, color: stock.color }}
                          >
                            {stock.label}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <QtyCell product={product} onUpdate={handleUpdate} />
                        </td>
                        <td className="px-4 py-4">
                          <ToggleLimitsCell
                            product={product}
                            onToggle={handleToggleLimits}
                          />
                        </td>
                        <td className="px-4 py-4">
                          {product.stockQuantity === 0 && (
                            <button
                              onClick={() =>
                                handleUpdate(product._id, "set", 30)
                              }
                              disabled={isPending}
                              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150"
                              style={{
                                background: `${Colors.success}18`,
                                color: Colors.success,
                                border: `1px solid ${Colors.success}40`,
                              }}
                              onMouseEnter={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = Colors.success;
                                (e.currentTarget as HTMLElement).style.color =
                                  Colors.white;
                              }}
                              onMouseLeave={(e) => {
                                (
                                  e.currentTarget as HTMLElement
                                ).style.background = `${Colors.success}18`;
                                (e.currentTarget as HTMLElement).style.color =
                                  Colors.success;
                              }}
                            >
                              <RefreshCw size={13} strokeWidth={2} /> Restock
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div
            className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{
              borderTop: `1px solid ${Colors.divider}`,
              background: Colors.surfaceAlt,
            }}
          >
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
                }}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => fetchProducts(pg)}
                    className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background:
                        pg === page
                          ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
                          : Colors.surface,
                      color: pg === page ? Colors.white : Colors.textSecondary,
                      border: `1.5px solid ${pg === page ? "transparent" : Colors.border}`,
                    }}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => fetchProducts(page + 1)}
                disabled={page >= totalPages || loading}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background:
                    page >= totalPages ? Colors.surfaceAlt : Colors.surface,
                  color:
                    page >= totalPages ? Colors.textMuted : Colors.textPrimary,
                  border: `1.5px solid ${Colors.border}`,
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  opacity: page >= totalPages ? 0.5 : 1,
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
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
