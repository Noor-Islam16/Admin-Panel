import { useState, useMemo, useRef } from "react";
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
  ImageOff,
  Pencil,
  Check,
  History,
  PackageX,
  Star,
  Flame,
} from "lucide-react";
import Colors from "../constants/colors";
import { PRODUCTS, CATEGORIES, type Product } from "../constants/products";

// ── Types ─────────────────────────────────────────────────────────────────────
interface StockProduct extends Product {
  minStockAlert: number; // alert threshold
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

// ── Convert PRODUCTS to StockProduct with default alert thresholds ────────────
const INITIAL_PRODUCTS: StockProduct[] = PRODUCTS.map((p) => ({
  ...p,
  minStockAlert: p.fastMoving ? 20 : 10, // Fast moving items have higher alert threshold
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStockStatus(p: StockProduct): {
  label: string;
  color: string;
  bg: string;
  level: "ok" | "low" | "out" | "unlimited";
} {
  if (!p.inStock && p.stock === 0) {
    return {
      label: "Out of Stock",
      color: Colors.error,
      bg: "#FFF0F3",
      level: "out",
    };
  }
  if (p.stock === 0) {
    return {
      label: "Out of Stock",
      color: Colors.error,
      bg: "#FFF0F3",
      level: "out",
    };
  }
  if (p.stock <= p.minStockAlert) {
    return {
      label: "Low Stock",
      color: Colors.warning,
      bg: `${Colors.warning}18`,
      level: "low",
    };
  }
  if (p.fastMoving) {
    return {
      label: "Fast Moving",
      color: Colors.info,
      bg: `${Colors.info}18`,
      level: "ok",
    };
  }
  return {
    label: "In Stock",
    color: Colors.success,
    bg: `${Colors.success}18`,
    level: "ok",
  };
}

function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ── Sub-components ────────────────────────────────────────────────────────────
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

function ProductThumb({
  src,
  name,
}: {
  src?: string | string[];
  name: string;
}) {
  const [err, setErr] = useState(false);
  const imageSrc = Array.isArray(src) ? src[0] : src;

  if (!imageSrc || err)
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: Colors.surfaceAlt,
          border: `1px solid ${Colors.border}`,
        }}
      >
        <ImageOff size={16} color={Colors.border} strokeWidth={1.5} />
      </div>
    );
  return (
    <img
      src={imageSrc}
      alt={name}
      onError={() => setErr(true)}
      className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
      style={{ background: Colors.surfaceAlt }}
    />
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
  const [inputVal, setInputVal] = useState(String(product.stock));
  const [stepVal, setStepVal] = useState(
    product.minOrderQty ? String(product.minOrderQty) : "1",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const commitSet = () => {
    const n = parseInt(inputVal);
    if (!isNaN(n) && n >= 0) onUpdate(product.id, "set", n);
    setEditMode(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Stepper */}
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
            onUpdate(product.id, "reduce", step);
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
              ref={inputRef}
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
              setInputVal(String(product.stock));
              setEditMode(true);
            }}
            className="px-3 py-1.5 text-sm font-bold min-w-[48px] text-center transition-colors"
            style={{
              color:
                product.stock <= product.minStockAlert && product.stock > 0
                  ? Colors.warning
                  : product.stock === 0
                    ? Colors.error
                    : Colors.textPrimary,
            }}
            title="Click to set exact value"
          >
            {product.stock}
          </button>
        )}

        <button
          onClick={() => {
            const step = parseInt(stepVal) || 1;
            onUpdate(product.id, "add", step);
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

      {/* Step size picker */}
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
          title="Step amount"
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

      <span className="text-xs" style={{ color: Colors.textMuted }}>
        {product.unit}
        {product.weight && ` · ${product.weight}`}
      </span>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ManageStocks() {
  const [products, setProducts] = useState<StockProduct[]>(INITIAL_PRODUCTS);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("All");
  const [showLog, setShowLog] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [alertThresholdId, setAlertThresholdId] = useState<string | null>(null);
  const [alertInput, setAlertInput] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Update stock quantity ──────────────────────────────────────────────────
  const handleUpdate = (
    id: string,
    action: "add" | "reduce" | "set",
    val: number,
  ) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const prev_qty = p.stock;
        let newQty =
          action === "add"
            ? prev_qty + val
            : action === "reduce"
              ? Math.max(0, prev_qty - val)
              : Math.max(0, val);
        const log: StockLog = {
          id: Date.now().toString() + Math.random(),
          productId: id,
          productName: p.name,
          action,
          delta: newQty - prev_qty,
          prevQty: prev_qty,
          newQty,
          timestamp: new Date(),
        };
        setLogs((l) => [log, ...l.slice(0, 49)]);
        if (action === "reduce" && newQty === 0)
          showToast("error", `"${p.name}" is now out of stock!`);
        else if (newQty <= p.minStockAlert && newQty > 0)
          showToast("error", `"${p.name}" stock is low (${newQty} ${p.unit}s)`);
        else if (action !== "set" || newQty !== prev_qty)
          showToast(
            "success",
            `"${p.name}" updated: ${prev_qty} → ${newQty} ${p.unit}s`,
          );
        return {
          ...p,
          stock: newQty,
          inStock: newQty > 0,
        };
      }),
    );
  };

  // ── Toggle Fast Moving ─────────────────────────────────────────────────────
  const handleToggleFastMoving = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = !p.fastMoving;
        const log: StockLog = {
          id: Date.now().toString() + Math.random(),
          productId: id,
          productName: p.name,
          action: "toggle_fast",
          delta: 0,
          prevQty: p.stock,
          newQty: p.stock,
          timestamp: new Date(),
        };
        setLogs((l) => [log, ...l.slice(0, 49)]);
        showToast(
          "success",
          `"${p.name}" ${next ? "marked as" : "removed from"} Fast Moving`,
        );
        return { ...p, fastMoving: next };
      }),
    );
  };

  // ── Toggle Featured ────────────────────────────────────────────────────────
  const handleToggleFeatured = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = !p.featured;
        const log: StockLog = {
          id: Date.now().toString() + Math.random(),
          productId: id,
          productName: p.name,
          action: "toggle_featured",
          delta: 0,
          prevQty: p.stock,
          newQty: p.stock,
          timestamp: new Date(),
        };
        setLogs((l) => [log, ...l.slice(0, 49)]);
        showToast(
          "success",
          `"${p.name}" ${next ? "marked as" : "removed from"} Featured`,
        );
        return { ...p, featured: next };
      }),
    );
  };

  // ── Update alert threshold ─────────────────────────────────────────────────
  const handleSetAlert = (id: string) => {
    const n = parseInt(alertInput);
    if (isNaN(n) || n < 0) {
      showToast("error", "Enter a valid threshold.");
      return;
    }
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, minStockAlert: n } : p)),
    );
    showToast("success", "Alert threshold updated!");
    setAlertThresholdId(null);
    setAlertInput("");
  };

  // ── Bulk reset all out-of-stock ────────────────────────────────────────────
  const handleBulkRestock = () => {
    const outIds = products.filter((p) => p.stock === 0).map((p) => p.id);
    if (!outIds.length) {
      showToast("error", "No out-of-stock products.");
      return;
    }
    setProducts((prev) =>
      prev.map((p) =>
        outIds.includes(p.id)
          ? { ...p, stock: p.fastMoving ? 50 : 30, inStock: true }
          : p,
      ),
    );
    showToast(
      "success",
      `${outIds.length} product${outIds.length > 1 ? "s" : ""} restocked.`,
    );
  };

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const rows = [
      [
        "Name",
        "Brand",
        "Category",
        "Sub Category",
        "Unit",
        "Weight",
        "Stock",
        "Alert Threshold",
        "Fast Moving",
        "Featured",
        "Price",
        "In Stock",
      ].join(","),
      ...products.map((p) =>
        [
          `"${p.name}"`,
          p.brand ? `"${p.brand}"` : "",
          CATEGORIES.find((c) => c.id === p.category)?.name || p.category,
          p.subCategory || "",
          p.unit,
          p.weight || "",
          p.stock,
          p.minStockAlert,
          p.fastMoving ? "Yes" : "No",
          p.featured ? "Yes" : "No",
          p.price,
          p.inStock ? "Yes" : "No",
        ].join(","),
      ),
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stock_report.csv";
    a.click();
    URL.revokeObjectURL(url);
    showToast("success", "Stock report exported!");
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        categoryFilter === "all" || p.category === categoryFilter;

      const status = getStockStatus(p).level;
      const matchStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && status === "ok") ||
        (stockFilter === "Low Stock" && status === "low") ||
        (stockFilter === "Out of Stock" && status === "out") ||
        (stockFilter === "Fast Moving" && p.fastMoving);

      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: products.length,
      inStock: products.filter((p) => getStockStatus(p).level === "ok").length,
      low: products.filter((p) => getStockStatus(p).level === "low").length,
      out: products.filter((p) => getStockStatus(p).level === "out").length,
      fastMoving: products.filter((p) => p.fastMoving).length,
      featured: products.filter((p) => p.featured).length,
    }),
    [products],
  );

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
        {/* ── Page Header ── */}
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
                Update quantities, set alerts, manage fast moving items
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowLog((v) => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
              style={{
                background: showLog ? Colors.primaryLight : Colors.surface,
                color: showLog ? Colors.primary : Colors.textSecondary,
                border: `1.5px solid ${showLog ? Colors.borderFocus : Colors.border}`,
              }}
            >
              <History size={16} strokeWidth={2} />
              Activity Log {logs.length > 0 && `(${logs.length})`}
            </button>
            <button
              onClick={handleBulkRestock}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
              style={{
                background: `${Colors.warning}18`,
                color: Colors.warning,
                border: `1.5px solid ${Colors.warning}40`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  Colors.warning;
                (e.currentTarget as HTMLElement).style.color = Colors.white;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  `${Colors.warning}18`;
                (e.currentTarget as HTMLElement).style.color = Colors.warning;
              }}
            >
              <RefreshCw size={16} strokeWidth={2} />
              Restock All OOS
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                color: Colors.white,
                boxShadow: `0 4px 12px rgba(0,168,132,0.3)`,
              }}
            >
              <Download size={16} strokeWidth={2} />
              Export CSV
            </button>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
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
              value: stats.low,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: TrendingDown,
            },
            {
              label: "Out of Stock",
              value: stats.out,
              color: Colors.error,
              bg: "#FFF0F3",
              icon: PackageX,
            },
            {
              label: "Fast Moving",
              value: stats.fastMoving,
              color: Colors.info,
              bg: `${Colors.info}18`,
              icon: Flame,
            },
            {
              label: "Featured",
              value: stats.featured,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: Star,
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

        {/* ── Low stock alert banner ── */}
        {stats.low > 0 || stats.out > 0 ? (
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
              {stats.out > 0 && (
                <span style={{ color: Colors.error }}>
                  {stats.out} product{stats.out > 1 ? "s" : ""} out of stock
                </span>
              )}
              {stats.out > 0 && stats.low > 0 && (
                <span style={{ color: Colors.textMuted }}> · </span>
              )}
              {stats.low > 0 && (
                <span style={{ color: Colors.warning }}>
                  {stats.low} product{stats.low > 1 ? "s" : ""} running low
                </span>
              )}
              <span style={{ color: Colors.textMuted }}>
                . Consider restocking soon.
              </span>
            </p>
          </div>
        ) : null}

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <div
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
              style={{
                color: searchFocused ? Colors.primary : Colors.textMuted,
              }}
            >
              <Search size={16} strokeWidth={2} />
            </div>
            <input
              type="text"
              placeholder="Search products, brand, category…"
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
              {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
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
              {[
                "All",
                "In Stock",
                "Low Stock",
                "Out of Stock",
                "Fast Moving",
              ].map((s) => (
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

        {/* ════════════════════════════════════════
            MAIN TABLE
        ════════════════════════════════════════ */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: Colors.surface,
            border: `1px solid ${Colors.border}`,
            boxShadow: `0 4px 16px ${Colors.shadow}`,
          }}
        >
          {/* Table header bar */}
          <div
            className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderBottom: `1px solid ${Colors.divider}` }}
          >
            <p
              className="text-sm font-bold"
              style={{ color: Colors.textPrimary }}
            >
              {search || categoryFilter !== "all" || stockFilter !== "All"
                ? `${filtered.length} of ${products.length} products`
                : `All ${products.length} Products`}
            </p>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Click qty number to type exact value · Min order qty used as
              default step
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px]">
              <thead>
                <tr style={{ background: Colors.surfaceAlt }}>
                  {[
                    "#",
                    "Product",
                    "Category",
                    "Status",
                    "Qty / Adjust",
                    "Step",
                    "Fast Moving",
                    "Featured",
                    "Alert At",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-xs font-semibold tracking-wide uppercase whitespace-nowrap"
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
                    <td colSpan={10} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Boxes
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
                    return (
                      <tr
                        key={product.id}
                        style={{ borderTop: `1px solid ${Colors.divider}` }}
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

                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <ProductThumb
                              src={product.images}
                              name={product.name}
                            />
                            <div>
                              <p
                                className="text-sm font-semibold"
                                style={{ color: Colors.textPrimary }}
                              >
                                {product.name}
                              </p>
                              <p
                                className="text-xs"
                                style={{ color: Colors.textMuted }}
                              >
                                {product.brand && `${product.brand} · `}
                                {product.unit}
                                {product.weight && ` ${product.weight}`}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <div>
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
                            {product.subCategory && (
                              <p
                                className="text-xs mt-1"
                                style={{ color: Colors.textMuted }}
                              >
                                {product.subCategory}
                              </p>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className="text-xs font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap"
                            style={{ background: stock.bg, color: stock.color }}
                          >
                            {stock.label}
                          </span>
                        </td>

                        {/* Qty Adjust */}
                        <td className="px-5 py-4">
                          <QtyCell product={product} onUpdate={handleUpdate} />
                        </td>

                        {/* Step (empty — rendered inside QtyCell, just column spacer) */}
                        <td className="px-5 py-4" />

                        {/* Fast Moving Toggle */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleFastMoving(product.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                            style={{
                              background: product.fastMoving
                                ? `${Colors.info}18`
                                : Colors.surfaceAlt,
                              color: product.fastMoving
                                ? Colors.info
                                : Colors.textSecondary,
                              border: `1px solid ${product.fastMoving ? Colors.info + "40" : Colors.border}`,
                            }}
                          >
                            <Flame size={14} />
                            {product.fastMoving ? "Fast" : "Normal"}
                          </button>
                        </td>

                        {/* Featured Toggle */}
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleFeatured(product.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                            style={{
                              background: product.featured
                                ? `${Colors.warning}18`
                                : Colors.surfaceAlt,
                              color: product.featured
                                ? Colors.warning
                                : Colors.textSecondary,
                              border: `1px solid ${product.featured ? Colors.warning + "40" : Colors.border}`,
                            }}
                          >
                            <Star size={14} />
                            {product.featured ? "Featured" : "—"}
                          </button>
                        </td>

                        {/* Alert Threshold */}
                        <td className="px-5 py-4">
                          {alertThresholdId === product.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="0"
                                value={alertInput}
                                onChange={(e) => setAlertInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    handleSetAlert(product.id);
                                  if (e.key === "Escape")
                                    setAlertThresholdId(null);
                                }}
                                className="w-16 px-2 py-1.5 rounded-xl text-sm text-center outline-none"
                                style={{
                                  border: `1.5px solid ${Colors.borderFocus}`,
                                  color: Colors.textPrimary,
                                  background: Colors.primaryLight,
                                }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleSetAlert(product.id)}
                                style={{ color: Colors.success }}
                              >
                                <Check size={16} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => setAlertThresholdId(null)}
                                style={{ color: Colors.textMuted }}
                              >
                                <X size={14} strokeWidth={2} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setAlertThresholdId(product.id);
                                setAlertInput(String(product.minStockAlert));
                              }}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                              style={{
                                background: `${Colors.warning}18`,
                                color: Colors.warning,
                                border: `1px solid ${Colors.warning}30`,
                              }}
                            >
                              <AlertTriangle size={13} strokeWidth={2} />≤{" "}
                              {product.minStockAlert}
                              <Pencil size={11} strokeWidth={2} />
                            </button>
                          )}
                        </td>

                        {/* Quick restock */}
                        <td className="px-5 py-4">
                          {product.stock === 0 && (
                            <button
                              onClick={() =>
                                handleUpdate(
                                  product.id,
                                  "set",
                                  product.fastMoving ? 50 : 30,
                                )
                              }
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

          <div
            className="px-6 py-3"
            style={{
              borderTop: `1px solid ${Colors.divider}`,
              background: Colors.surfaceAlt,
            }}
          >
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Showing {filtered.length} of {products.length} products
            </p>
          </div>
        </div>

        {/* ════════════════════════════════════════
            ACTIVITY LOG (collapsible)
        ════════════════════════════════════════ */}
        {showLog && (
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              boxShadow: `0 4px 16px ${Colors.shadow}`,
            }}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
              }}
            >
              <div className="flex items-center gap-2">
                <History size={18} color={Colors.white} strokeWidth={2} />
                <p
                  className="text-sm font-bold"
                  style={{ color: Colors.white }}
                >
                  Stock Activity Log
                </p>
              </div>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="text-xs px-3 py-1.5 rounded-xl font-medium"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      color: Colors.white,
                    }}
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => setShowLog(false)}
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12">
                <History size={32} color={Colors.border} strokeWidth={1.5} />
                <p className="text-sm" style={{ color: Colors.textMuted }}>
                  No activity yet — start adjusting stocks above
                </p>
              </div>
            ) : (
              <div
                className="divide-y"
                style={{
                  borderColor: Colors.divider,
                  maxHeight: 360,
                  overflowY: "auto",
                }}
              >
                {logs.map((log) => {
                  const isAdd =
                    log.action === "add" ||
                    (log.action === "set" && log.delta > 0);
                  const isRemove =
                    log.action === "reduce" ||
                    (log.action === "set" && log.delta < 0);
                  const isToggle =
                    log.action === "toggle_fast" ||
                    log.action === "toggle_featured";

                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-4 px-6 py-3.5 transition-colors"
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          Colors.surfaceAlt)
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "transparent")
                      }
                    >
                      {/* Icon */}
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isAdd
                            ? `${Colors.success}18`
                            : isRemove
                              ? "#FFF0F3"
                              : `${Colors.info}18`,
                          color: isAdd
                            ? Colors.success
                            : isRemove
                              ? Colors.error
                              : Colors.info,
                        }}
                      >
                        {isAdd ? (
                          <TrendingUp size={16} strokeWidth={2} />
                        ) : isRemove ? (
                          <TrendingDown size={16} strokeWidth={2} />
                        ) : log.action === "toggle_fast" ? (
                          <Flame size={16} strokeWidth={2} />
                        ) : (
                          <Star size={16} strokeWidth={2} />
                        )}
                      </div>
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{ color: Colors.textPrimary }}
                        >
                          {log.productName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: Colors.textMuted }}
                        >
                          {isToggle
                            ? `${log.action === "toggle_fast" ? "Fast Moving" : "Featured"} → ${log.action === "toggle_fast" ? "toggled" : "toggled"}`
                            : `${log.action === "set" ? "Set to" : log.action === "add" ? "Added" : "Reduced by"} ${Math.abs(log.delta)} · ${log.prevQty} → ${log.newQty}`}
                        </p>
                      </div>
                      {/* Delta badge */}
                      {!isToggle && (
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-lg flex-shrink-0"
                          style={{
                            background:
                              log.delta > 0
                                ? `${Colors.success}18`
                                : log.delta < 0
                                  ? "#FFF0F3"
                                  : Colors.surfaceAlt,
                            color:
                              log.delta > 0
                                ? Colors.success
                                : log.delta < 0
                                  ? Colors.error
                                  : Colors.textMuted,
                          }}
                        >
                          {log.delta > 0
                            ? `+${log.delta}`
                            : log.delta < 0
                              ? `${log.delta}`
                              : "No change"}
                        </span>
                      )}
                      {/* Time */}
                      <span
                        className="text-xs flex-shrink-0"
                        style={{ color: Colors.textMuted }}
                      >
                        {timeAgo(log.timestamp)}
                      </span>
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
      `}</style>
    </>
  );
}
