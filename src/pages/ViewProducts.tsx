import { useState, useEffect, useCallback, useRef } from "react";
import {
  Package,
  Search,
  LayoutGrid,
  LayoutList,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  ChevronDown,
  Tag,
  IndianRupee,
  Boxes,
  AlignLeft,
  PackagePlus,
  CheckCircle2,
  ImageOff,
  Filter,
  Star,
  Award,
  TrendingUp,
  Flame,
  RefreshCw,
} from "lucide-react";
import Colors from "../constants/colors";
import { CATEGORIES, type ProductTag } from "../constants/products";
import { ProductAPI, StockAPI, type ApiProduct } from "../config/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function stockStatus(p: ApiProduct): { label: string; color: string; bg: string } {
  if (p.stockQuantity === 0)
    return { label: "Out of Stock", color: Colors.error, bg: "#FFF0F3" };
  if (p.stockQuantity <= 10)
    return { label: `Low (${p.stockQuantity})`, color: Colors.warning, bg: `${Colors.warning}18` };
  if (p.isFastMoving)
    return { label: `${p.stockQuantity} units`, color: Colors.info, bg: `${Colors.info}18` };
  return { label: `${p.stockQuantity} units`, color: Colors.success, bg: `${Colors.success}18` };
}

// ── Shared small components ───────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: Colors.textSecondary }}>
      {children}
    </label>
  );
}

function InputBox({ focused, icon: Icon, children }: { focused: boolean; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div
      className="relative flex items-center rounded-2xl transition-all duration-200 overflow-hidden"
      style={{
        background: focused ? Colors.primaryLight : Colors.surfaceAlt,
        border: `1.5px solid ${focused ? Colors.borderFocus : Colors.border}`,
      }}
    >
      <div className="absolute left-3.5 pointer-events-none" style={{ color: focused ? Colors.primary : Colors.textMuted }}>
        <Icon size={17} strokeWidth={2} />
      </div>
      {children}
    </div>
  );
}

function Toast({ type, message, onClose }: { type: "success" | "error"; message: string; onClose: () => void }) {
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
      {type === "success"
        ? <CheckCircle2 size={18} color={Colors.success} strokeWidth={2.5} />
        : <AlertTriangle size={18} color={Colors.error} strokeWidth={2.5} />}
      {message}
      <button onClick={onClose} style={{ color: Colors.textMuted }}><X size={16} /></button>
    </div>
  );
}

// ── Product Image ─────────────────────────────────────────────────────────────
function ProductImage({ src, name, size = 56, fill = false }: { src?: string; name: string; size?: number; fill?: boolean }) {
  const [err, setErr] = useState(false);

  if (!src || err) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl flex-shrink-0"
        style={{
          width: fill ? "100%" : size,
          height: fill ? "100%" : size,
          background: Colors.surfaceAlt,
          border: `1px solid ${Colors.border}`,
        }}
      >
        <ImageOff size={fill ? 40 : size * 0.4} color={Colors.border} strokeWidth={1.5} />
      </div>
    );
  }

  if (fill) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)}
        className="w-full h-full object-cover"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    );
  }

  return (
    <img src={src} alt={name} onError={() => setErr(true)}
      className="rounded-2xl object-cover flex-shrink-0"
      style={{ width: size, height: size, background: Colors.surfaceAlt }} />
  );
}

// ── Tag Badge ─────────────────────────────────────────────────────────────────
function TagBadge({ tag }: { tag: string }) {
  const tagColors: Record<string, { bg: string; color: string }> = {
    "Limited Stock":  { bg: `${Colors.warning}18`,   color: Colors.warning },
    "Out of Stock":   { bg: "#FFF0F3",                color: Colors.error },
    "Fast Moving":    { bg: `${Colors.info}18`,       color: Colors.info },
    "New Arrival":    { bg: Colors.primaryLight,      color: Colors.primary },
    "Best Seller":    { bg: "#FFF8E1",                color: "#F9A825" },
    "Special Offer":  { bg: "#FCE4EC",                color: "#E91E63" },
    Trending:         { bg: "#E8EAF6",                color: "#5C6BC0" },
    Premium:          { bg: "#FFF3E0",                color: "#F57C00" },
    Organic:          { bg: "#E8F5E9",                color: "#43A047" },
    Imported:         { bg: "#E3F2FD",                color: "#1E88E5" },
  };
  const style = tagColors[tag] || { bg: Colors.surfaceAlt, color: Colors.textSecondary };
  return (
    <span className="text-xs px-2 py-0.5 rounded-lg font-medium whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}>
      {tag}
    </span>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({ product, onConfirm, onCancel, deleting }: {
  product: ApiProduct; onConfirm: () => void; onCancel: () => void; deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: Colors.overlay }}>
      <div className="w-full max-w-sm rounded-3xl p-6 relative"
        style={{ background: Colors.surface, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
        <button onClick={onCancel} className="absolute top-4 right-4 p-1.5 rounded-xl" style={{ color: Colors.textMuted }}>
          <X size={18} />
        </button>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#FFF0F3" }}>
          <AlertTriangle size={24} color={Colors.error} strokeWidth={2} />
        </div>
        <h3 className="text-base font-bold mb-1" style={{ color: Colors.textPrimary }}>Delete Product?</h3>
        <p className="text-sm mb-5" style={{ color: Colors.textSecondary }}>
          Permanently delete{" "}
          <span className="font-semibold" style={{ color: Colors.textPrimary }}>{product.name}</span>
          ? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={deleting}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: Colors.surfaceAlt, color: Colors.textSecondary, border: `1.5px solid ${Colors.border}` }}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{ background: Colors.error, color: Colors.white, opacity: deleting ? 0.7 : 1 }}>
            {deleting ? <><Spinner /> Deleting…</> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ── Skeleton rows / cards ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ background: Colors.surface, border: `1px solid ${Colors.border}` }}>
      <div className="animate-pulse" style={{ height: 160, background: Colors.surfaceAlt }} />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 rounded-lg animate-pulse" style={{ background: Colors.surfaceAlt, width: "60%" }} />
        <div className="h-4 rounded-lg animate-pulse" style={{ background: Colors.surfaceAlt, width: "80%" }} />
        <div className="h-3 rounded-lg animate-pulse" style={{ background: Colors.surfaceAlt, width: "40%" }} />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderTop: `1px solid ${Colors.divider}` }}>
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 rounded-lg animate-pulse" style={{ background: Colors.surfaceAlt, width: i === 1 ? 160 : 60 }} />
        </td>
      ))}
    </tr>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({ product, onSave, onClose }: {
  product: ApiProduct; onSave: (p: ApiProduct) => void; onClose: () => void;
}) {
  const [form, setForm] = useState({
    name:          product.name,
    brand:         product.brand ?? "",
    category:      product.category,
    subCategory:   product.subCategory ?? "",
    sellingPrice:  String(product.sellingPrice),
    originalPrice: product.originalPrice != null ? String(product.originalPrice) : "",
    unit:          product.unit,
    weightOrSize:  product.weightOrSize ?? "",
    stockQuantity: String(product.stockQuantity),
    minOrderQuantity: String(product.minOrderQuantity),
    description:   product.description ?? "",
    isFastMoving:  product.isFastMoving,
    isFeatured:    product.isFeatured,
  });
  const [focused, setFocused] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState(product.imageUrl ?? "");
  const imageRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form, val: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name",             form.name.trim());
      fd.append("category",         form.category);
      fd.append("sellingPrice",     form.sellingPrice);
      fd.append("stockQuantity",    form.stockQuantity);
      fd.append("unit",             form.unit);
      fd.append("isFastMoving",     String(form.isFastMoving));
      fd.append("isFeatured",       String(form.isFeatured));
      if (form.brand)           fd.append("brand",            form.brand);
      if (form.subCategory)     fd.append("subCategory",      form.subCategory);
      if (form.originalPrice)   fd.append("originalPrice",    form.originalPrice);
      if (form.weightOrSize)    fd.append("weightOrSize",     form.weightOrSize);
      if (form.description)     fd.append("description",      form.description);
      if (form.minOrderQuantity) fd.append("minOrderQuantity", form.minOrderQuantity);
      if (imageFile)            fd.append("image",            imageFile);

      const res = await ProductAPI.update(product._id, fd);
      onSave(res.data);
    } catch (e) {
      // bubble error up via onSave returning nothing — caller handles toast
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none";
  const inputStyle = { color: Colors.textPrimary };
  const categoryOptions = CATEGORIES.filter((c) => c.id !== "all");
  const UNITS = ["kg", "g", "litre", "ml", "pack", "piece", "dozen", "box"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: Colors.overlay }}>
      <div className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{ background: Colors.surface, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
          style={{ background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})` }}>
          <div className="flex items-center gap-2">
            <Pencil size={18} color={Colors.white} strokeWidth={2} />
            <p className="text-base font-bold" style={{ color: Colors.white }}>Edit Product</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl"
            style={{ background: "rgba(255,255,255,0.18)", color: Colors.white }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Image preview + picker */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
              style={{ background: Colors.surfaceAlt, border: `1px solid ${Colors.border}` }}>
              {imagePreview
                ? <img src={imagePreview} alt={form.name} className="w-full h-full object-cover" onError={() => setImagePreview("")} />
                : <div className="w-full h-full flex items-center justify-center"><ImageOff size={24} color={Colors.border} strokeWidth={1.5} /></div>}
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <FieldLabel>Product Image</FieldLabel>
              <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  setImageFile(f);
                  setImagePreview(URL.createObjectURL(f));
                }} />
              <button onClick={() => imageRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
                style={{ background: Colors.primaryLight, color: Colors.primary, border: `1px solid ${Colors.accentLight}` }}>
                <PackagePlus size={14} strokeWidth={2} />
                {imageFile ? imageFile.name : "Change Image"}
              </button>
            </div>
          </div>

          {/* Name + Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Product Name *</FieldLabel>
              <InputBox focused={focused === "name"} icon={Tag}>
                <input className={inputClass} style={inputStyle}
                  value={form.name} onChange={(e) => set("name", e.target.value)}
                  onFocus={() => setFocused("name")} onBlur={() => setFocused("")} />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Brand</FieldLabel>
              <InputBox focused={focused === "brand"} icon={Award}>
                <input className={inputClass} style={inputStyle}
                  value={form.brand} onChange={(e) => set("brand", e.target.value)}
                  onFocus={() => setFocused("brand")} onBlur={() => setFocused("")} />
              </InputBox>
            </div>
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Category</FieldLabel>
              <InputBox focused={focused === "cat"} icon={Boxes}>
                <select className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }} value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  onFocus={() => setFocused("cat")} onBlur={() => setFocused("")}>
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                <div className="absolute right-3 pointer-events-none" style={{ color: Colors.textMuted }}>
                  <ChevronDown size={15} />
                </div>
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Unit</FieldLabel>
              <InputBox focused={focused === "unit"} icon={PackagePlus}>
                <select className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }} value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  onFocus={() => setFocused("unit")} onBlur={() => setFocused("")}>
                  {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
                <div className="absolute right-3 pointer-events-none" style={{ color: Colors.textMuted }}>
                  <ChevronDown size={15} />
                </div>
              </InputBox>
            </div>
          </div>

          {/* Price + Original Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Selling Price (₹)</FieldLabel>
              <InputBox focused={focused === "price"} icon={IndianRupee}>
                <input className={inputClass} style={inputStyle} type="number" min="0"
                  value={form.sellingPrice} onChange={(e) => set("sellingPrice", e.target.value)}
                  onFocus={() => setFocused("price")} onBlur={() => setFocused("")} />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Original Price (₹)</FieldLabel>
              <InputBox focused={focused === "originalPrice"} icon={IndianRupee}>
                <input className={inputClass} style={inputStyle} type="number" min="0"
                  value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)}
                  onFocus={() => setFocused("originalPrice")} onBlur={() => setFocused("")} />
              </InputBox>
            </div>
          </div>

          {/* Stock + Min Order Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Stock Quantity</FieldLabel>
              <InputBox focused={focused === "stock"} icon={Boxes}>
                <input className={inputClass} style={inputStyle} type="number" min="0"
                  value={form.stockQuantity} onChange={(e) => set("stockQuantity", e.target.value)}
                  onFocus={() => setFocused("stock")} onBlur={() => setFocused("")} />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Min Order Qty</FieldLabel>
              <InputBox focused={focused === "minOrderQty"} icon={Boxes}>
                <input className={inputClass} style={inputStyle} type="number" min="1"
                  value={form.minOrderQuantity} onChange={(e) => set("minOrderQuantity", e.target.value)}
                  onFocus={() => setFocused("minOrderQty")} onBlur={() => setFocused("")} />
              </InputBox>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Weight / Size</FieldLabel>
            <InputBox focused={focused === "weight"} icon={Boxes}>
              <input className={inputClass} style={inputStyle} placeholder="e.g. 5kg, 500ml"
                value={form.weightOrSize} onChange={(e) => set("weightOrSize", e.target.value)}
                onFocus={() => setFocused("weight")} onBlur={() => setFocused("")} />
            </InputBox>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Description</FieldLabel>
            <div className="relative rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background: focused === "desc" ? Colors.primaryLight : Colors.surfaceAlt,
                border: `1.5px solid ${focused === "desc" ? Colors.borderFocus : Colors.border}`,
              }}>
              <div className="absolute top-3.5 left-3.5 pointer-events-none"
                style={{ color: focused === "desc" ? Colors.primary : Colors.textMuted }}>
                <AlignLeft size={17} strokeWidth={2} />
              </div>
              <textarea rows={2}
                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none resize-none"
                style={{ color: Colors.textPrimary }}
                value={form.description} onChange={(e) => set("description", e.target.value)}
                onFocus={() => setFocused("desc")} onBlur={() => setFocused("")} />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: Colors.surfaceAlt, border: `1.5px solid ${Colors.border}` }}>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} color={Colors.primary} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: Colors.textPrimary }}>Fast Moving</p>
                  <p className="text-xs" style={{ color: Colors.textMuted }}>Highlight as frequently purchased</p>
                </div>
              </div>
              <button onClick={() => set("isFastMoving", !form.isFastMoving)}
                style={{ color: form.isFastMoving ? Colors.primary : Colors.textMuted }}>
                {form.isFastMoving ? <ToggleRight size={34} strokeWidth={1.5} /> : <ToggleLeft size={34} strokeWidth={1.5} />}
              </button>
            </div>
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{ background: Colors.surfaceAlt, border: `1.5px solid ${Colors.border}` }}>
              <div className="flex items-center gap-2">
                <Star size={18} color={Colors.warning} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: Colors.textPrimary }}>Featured</p>
                  <p className="text-xs" style={{ color: Colors.textMuted }}>Show on homepage</p>
                </div>
              </div>
              <button onClick={() => set("isFeatured", !form.isFeatured)}
                style={{ color: form.isFeatured ? Colors.primary : Colors.textMuted }}>
                {form.isFeatured ? <ToggleRight size={34} strokeWidth={1.5} /> : <ToggleLeft size={34} strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} disabled={saving}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{ background: Colors.surfaceAlt, color: Colors.textSecondary, border: `1.5px solid ${Colors.border}` }}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                color: Colors.white,
                opacity: saving ? 0.8 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}>
              {saving ? <><Spinner /> Saving…</> : <><CheckCircle2 size={16} strokeWidth={2.5} /> Save Changes</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ inline = false }: { inline?: boolean }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${inline ? "py-8" : "py-20"}`}>
      <Package size={40} color={Colors.border} strokeWidth={1.5} />
      <p className="text-sm font-semibold" style={{ color: Colors.textMuted }}>No products found</p>
      <p className="text-xs" style={{ color: Colors.border }}>Try adjusting your search or filters</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ViewProducts() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 20;

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("All");

  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingOps, setPendingOps] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, inStock: 0, outOfStock: 0, lowStock: 0, fastMoving: 0, featured: 0 });

  // Debounce search
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const markPending = (id: string) => setPendingOps((s) => new Set(s).add(id));
  const clearPending = (id: string) => setPendingOps((s) => { const n = new Set(s); n.delete(id); return n; });

  // ── Debounce search ───────────────────────────────────────────────────────
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 420);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  // ── Fetch products ────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async (pg = 1) => {
    setLoading(true);
    setFetchError(null);
    try {
      const params: Record<string, string> = { page: String(pg), limit: String(LIMIT) };
      if (categoryFilter !== "all")         params.category   = categoryFilter;
      if (debouncedSearch)                  params.search     = debouncedSearch;
      if (stockFilter === "Fast Moving")    params.fastMoving = "true";
      if (stockFilter === "Featured")       params.featured   = "true";

      const res = await ProductAPI.getAll(params);
      const { products: raw, pagination } = res.data;

      // Client-side stock filter for In Stock / Out of Stock / Low Stock
      let filtered = raw;
      if (stockFilter === "Out of Stock") filtered = raw.filter((p) => p.stockQuantity === 0);
      else if (stockFilter === "In Stock") filtered = raw.filter((p) => p.stockQuantity > 0);
      else if (stockFilter === "Low Stock") filtered = raw.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10);

      setProducts(filtered);
      setTotalPages(pagination.totalPages);
      setTotalCount(pagination.total);
      setPage(pg);
    } catch (e) {
      setFetchError(e instanceof Error ? e.message : "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, debouncedSearch, stockFilter]);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  // ── Fetch stats ───────────────────────────────────────────────────────────
  useEffect(() => {
    StockAPI.getStats().then((r) => setStats(r.data)).catch(() => null);
  }, [products]);

  // ── Toggle Fast Moving ────────────────────────────────────────────────────
  const handleFastMovingToggle = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;
    const next = !product.isFastMoving;

    setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFastMoving: next } : p));
    markPending(id);
    try {
      await StockAPI.toggleFastMoving(id, next);
      showToast("success", `"${product.name}" ${next ? "marked as" : "removed from"} fast moving`);
    } catch (e) {
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFastMoving: !next } : p));
      showToast("error", e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      clearPending(id);
    }
  };

  // ── Toggle Featured ───────────────────────────────────────────────────────
  const handleFeaturedToggle = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;
    const next = !product.isFeatured;

    setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFeatured: next } : p));
    markPending(id);
    try {
      await StockAPI.toggleFeatured(id, next);
      showToast("success", `"${product.name}" ${next ? "marked as" : "removed from"} featured`);
    } catch (e) {
      setProducts((prev) => prev.map((p) => p._id === id ? { ...p, isFeatured: !next } : p));
      showToast("error", e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      clearPending(id);
    }
  };

  // ── Save edit ─────────────────────────────────────────────────────────────
  const handleSaveEdit = async (updated: ApiProduct) => {
    setProducts((prev) => prev.map((p) => p._id === updated._id ? updated : p));
    setEditProduct(null);
    showToast("success", `"${updated.name}" updated successfully!`);
  };

  const handleEditError = (e: unknown) => {
    showToast("error", e instanceof Error ? e.message : "Update failed.");
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await ProductAPI.delete(deleteTarget._id);
      setProducts((prev) => prev.filter((p) => p._id !== deleteTarget._id));
      setTotalCount((c) => c - 1);
      showToast("success", `"${deleteTarget.name}" deleted.`);
      setDeleteTarget(null);
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  // ── Compute discount for display ──────────────────────────────────────────
  const getDiscount = (p: ApiProduct) => {
    if (!p.originalPrice || p.originalPrice <= p.sellingPrice) return null;
    return Math.round(((p.originalPrice - p.sellingPrice) / p.originalPrice) * 100);
  };

  return (
    <>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {editProduct && (
        <EditModal
          product={editProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditProduct(null)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <div className="flex flex-col gap-6 pb-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package size={20} color={Colors.primary} strokeWidth={2} />
            <div>
              <h1 className="text-xl font-bold" style={{ color: Colors.textPrimary }}>View Products</h1>
              <p className="text-xs" style={{ color: Colors.textMuted }}>{totalCount} products in catalogue</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Refresh */}
            <button onClick={() => fetchProducts(page)}
              className="p-2.5 rounded-2xl transition-all duration-150"
              style={{ background: Colors.surface, border: `1.5px solid ${Colors.border}`, color: Colors.textMuted }}>
              <RefreshCw size={16} strokeWidth={2} />
            </button>
            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-2xl"
              style={{ background: Colors.surface, border: `1px solid ${Colors.border}` }}>
              {([["grid", LayoutGrid], ["table", LayoutList]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => setView(v)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                  style={{
                    background: view === v
                      ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
                      : "transparent",
                    color: view === v ? Colors.white : Colors.textMuted,
                  }}>
                  <Icon size={15} strokeWidth={2} />
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total Products", value: stats.total,      color: Colors.primary, bg: Colors.primaryLight,   icon: Package },
            { label: "Fast Moving",    value: stats.fastMoving, color: Colors.info,    bg: `${Colors.info}18`,    icon: TrendingUp },
            { label: "Featured",       value: stats.featured,   color: Colors.warning, bg: `${Colors.warning}18`, icon: Star },
            { label: "Low Stock",      value: stats.lowStock,   color: Colors.warning, bg: `${Colors.warning}18`, icon: AlertTriangle },
            { label: "Out of Stock",   value: stats.outOfStock, color: Colors.error,   bg: "#FFF0F3",             icon: X },
          ].map(({ label, value, color, bg, icon: Icon }) => (
            <div key={label} className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
              style={{ background: Colors.surface, border: `1px solid ${Colors.border}`, boxShadow: `0 2px 8px ${Colors.shadow}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: bg }}>
                <Icon size={18} color={color} strokeWidth={2} />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight" style={{ color: Colors.textPrimary }}>{value}</p>
                <p className="text-xs" style={{ color: Colors.textMuted }}>{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters Row ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-52">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
              style={{ color: searchFocused ? Colors.primary : Colors.textMuted }}>
              <Search size={16} strokeWidth={2} />
            </div>
            <input type="text" placeholder="Search products…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-sm outline-none transition-all duration-200"
              style={{
                background: searchFocused ? Colors.primaryLight : Colors.surface,
                border: `1.5px solid ${searchFocused ? Colors.borderFocus : Colors.border}`,
                color: Colors.textPrimary,
              }} />
          </div>

          <div className="relative">
            <Filter size={15} color={Colors.textMuted} className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" strokeWidth={2} />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
              style={{ background: Colors.surface, border: `1.5px solid ${Colors.border}`, color: Colors.textSecondary, minWidth: 160 }}>
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
              style={{ background: Colors.surface, border: `1.5px solid ${Colors.border}`, color: Colors.textSecondary, minWidth: 150 }}>
              {["All", "In Stock", "Out of Stock", "Low Stock", "Fast Moving"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <ChevronDown size={14} color={Colors.textMuted} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* ── Results count ── */}
        {(search || categoryFilter !== "all" || stockFilter !== "All") && (
          <p className="text-xs" style={{ color: Colors.textMuted }}>
            Showing <span className="font-semibold" style={{ color: Colors.textPrimary }}>{products.length}</span> of {totalCount} products
          </p>
        )}

        {/* ── Error State ── */}
        {fetchError && (
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: "#FFF0F3", border: `1.5px solid #FFD0DA` }}>
            <AlertTriangle size={18} color={Colors.error} strokeWidth={2} />
            <p className="text-sm flex-1" style={{ color: Colors.error }}>{fetchError}</p>
            <button onClick={() => fetchProducts(page)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl"
              style={{ background: Colors.error, color: Colors.white }}>Retry</button>
          </div>
        )}

        {/* ══════════════════════════════
            GRID VIEW
        ══════════════════════════════ */}
        {view === "grid" && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : products.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {products.map((product) => {
                  const stock = stockStatus(product);
                  const discount = getDiscount(product);
                  const isPending = pendingOps.has(product._id);
                  return (
                    <div key={product._id}
                      className="rounded-3xl overflow-hidden flex flex-col transition-all duration-200 group"
                      style={{
                        background: Colors.surface,
                        border: `1px solid ${Colors.border}`,
                        boxShadow: `0 2px 12px ${Colors.shadow}`,
                        opacity: isPending ? 0.75 : 1,
                        transition: "opacity 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 8px 28px ${Colors.shadowMedium}`;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow = `0 2px 12px ${Colors.shadow}`;
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      }}>
                      {/* Image */}
                      <div className="relative" style={{ height: 160, width: "100%", background: Colors.surfaceAlt, overflow: "hidden" }}>
                        <ProductImage src={product.imageUrl} name={product.name} fill={true} />
                        {discount && (
                          <div className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-xs font-bold z-10"
                            style={{ background: Colors.error, color: Colors.white }}>
                            -{discount}%
                          </div>
                        )}
                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-semibold z-10"
                          style={{ background: "black", color: "white" }}>
                          {stock.label}
                        </div>
                        {product.isFastMoving && (
                          <div className="absolute bottom-3 left-3 z-10" style={{ color: "black" }}>
                            <Flame size={18} fill={Colors.info} strokeWidth={1.5} />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded-lg"
                            style={{ background: Colors.primaryLight, color: Colors.primary }}>
                            {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
                          </span>
                          {product.isFeatured && (
                            <span className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-0.5"
                              style={{ background: `${Colors.warning}18`, color: Colors.warning }}>
                              <Star size={10} /> Featured
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold leading-snug" style={{ color: Colors.textPrimary }}>{product.name}</p>
                          {product.brand && (
                            <p className="text-xs mt-0.5" style={{ color: Colors.textMuted }}>{product.brand}</p>
                          )}
                        </div>
                        {product.description && (
                          <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: Colors.textMuted }}>
                            {product.description}
                          </p>
                        )}
                        {product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag) => <TagBadge key={tag} tag={tag} />)}
                            {product.tags.length > 2 && (
                              <span className="text-xs px-2 py-0.5 rounded-lg"
                                style={{ background: Colors.surfaceAlt, color: Colors.textMuted }}>
                                +{product.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-baseline gap-2 mt-auto pt-1">
                          <p className="text-base font-bold" style={{ color: Colors.primary }}>₹{product.sellingPrice}</p>
                          {product.originalPrice && product.originalPrice > product.sellingPrice && (
                            <p className="text-xs line-through" style={{ color: Colors.textMuted }}>₹{product.originalPrice}</p>
                          )}
                          <p className="text-xs ml-auto" style={{ color: Colors.textMuted }}>/ {product.unit}</p>
                        </div>
                        {product.weightOrSize && (
                          <p className="text-xs" style={{ color: Colors.textMuted }}>{product.weightOrSize}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="px-4 pb-4 flex items-center gap-2 flex-wrap"
                        style={{ borderTop: `1px solid ${Colors.divider}`, paddingTop: 12 }}>
                        <button onClick={() => handleFastMovingToggle(product._id)} disabled={isPending}
                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: product.isFastMoving ? `${Colors.info}18` : Colors.surfaceAlt,
                            color: product.isFastMoving ? Colors.info : Colors.textSecondary,
                            border: `1px solid ${product.isFastMoving ? Colors.info + "40" : Colors.border}`,
                            cursor: isPending ? "not-allowed" : "pointer",
                          }}>
                          <Flame size={14} /> FM
                        </button>
                        <button onClick={() => handleFeaturedToggle(product._id)} disabled={isPending}
                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: product.isFeatured ? `${Colors.warning}18` : Colors.surfaceAlt,
                            color: product.isFeatured ? Colors.warning : Colors.textSecondary,
                            border: `1px solid ${product.isFeatured ? Colors.warning + "40" : Colors.border}`,
                            cursor: isPending ? "not-allowed" : "pointer",
                          }}>
                          <Star size={14} />
                        </button>
                        <button onClick={() => setEditProduct(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{ background: `${Colors.info}18`, color: Colors.info, border: `1px solid ${Colors.info}40` }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = Colors.info; (e.currentTarget as HTMLElement).style.color = Colors.white; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${Colors.info}18`; (e.currentTarget as HTMLElement).style.color = Colors.info; }}>
                          <Pencil size={14} strokeWidth={2} /> Edit
                        </button>
                        <button onClick={() => setDeleteTarget(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{ background: "#FFF0F3", color: Colors.error, border: `1px solid #FFD0DA` }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = Colors.error; (e.currentTarget as HTMLElement).style.color = Colors.white; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF0F3"; (e.currentTarget as HTMLElement).style.color = Colors.error; }}>
                          <Trash2 size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ══════════════════════════════
            TABLE VIEW
        ══════════════════════════════ */}
        {view === "table" && (
          <div className="rounded-3xl overflow-hidden"
            style={{ background: Colors.surface, border: `1px solid ${Colors.border}`, boxShadow: `0 4px 16px ${Colors.shadow}` }}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr style={{ background: Colors.surfaceAlt }}>
                    {["#", "Product", "Brand", "Category", "Price", "Stock", "Tags", "Fast Moving", "Featured", "Actions"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                        style={{ color: Colors.textSecondary }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                    : products.length === 0
                      ? <tr><td colSpan={10} className="py-16 text-center"><EmptyState inline /></td></tr>
                      : products.map((product, idx) => {
                          const stock = stockStatus(product);
                          const isPending = pendingOps.has(product._id);
                          return (
                            <tr key={product._id}
                              style={{ borderTop: `1px solid ${Colors.divider}`, opacity: isPending ? 0.7 : 1, transition: "opacity 0.2s" }}
                              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = Colors.primaryLight)}
                              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                              className="transition-colors duration-150">
                              <td className="px-5 py-3.5">
                                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                  style={{ background: Colors.surfaceAlt, color: Colors.textSecondary }}>
                                  {(page - 1) * LIMIT + idx + 1}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <ProductImage src={product.imageUrl} name={product.name} size={40} />
                                  <div>
                                    <p className="text-sm font-semibold" style={{ color: Colors.textPrimary }}>{product.name}</p>
                                    {product.description && (
                                      <p className="text-xs line-clamp-1 max-w-[200px]" style={{ color: Colors.textMuted }}>
                                        {product.description}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="text-sm" style={{ color: Colors.textSecondary }}>{product.brand || "—"}</p>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-lg whitespace-nowrap"
                                  style={{ background: Colors.primaryLight, color: Colors.primary }}>
                                  {CATEGORIES.find((c) => c.id === product.category)?.name || product.category}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <p className="text-sm font-bold" style={{ color: Colors.primary }}>₹{product.sellingPrice}</p>
                                {product.originalPrice && product.originalPrice > product.sellingPrice && (
                                  <p className="text-xs line-through" style={{ color: Colors.textMuted }}>₹{product.originalPrice}</p>
                                )}
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap"
                                  style={{ background: stock.bg, color: stock.color }}>{stock.label}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex flex-wrap gap-1 max-w-[150px]">
                                  {product.tags.slice(0, 2).map((tag) => <TagBadge key={tag} tag={tag} />)}
                                  {product.tags.length > 2 && (
                                    <span className="text-xs px-2 py-0.5 rounded-lg"
                                      style={{ background: Colors.surfaceAlt, color: Colors.textMuted }}>
                                      +{product.tags.length - 2}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <button onClick={() => handleFastMovingToggle(product._id)} disabled={isPending}
                                  style={{ color: product.isFastMoving ? Colors.info : Colors.textMuted, cursor: isPending ? "not-allowed" : "pointer" }}>
                                  {product.isFastMoving
                                    ? <ToggleRight size={30} strokeWidth={1.5} />
                                    : <ToggleLeft size={30} strokeWidth={1.5} />}
                                </button>
                              </td>
                              <td className="px-5 py-3.5">
                                <button onClick={() => handleFeaturedToggle(product._id)} disabled={isPending}
                                  style={{ color: product.isFeatured ? Colors.warning : Colors.textMuted, cursor: isPending ? "not-allowed" : "pointer" }}>
                                  {product.isFeatured
                                    ? <ToggleRight size={30} strokeWidth={1.5} />
                                    : <ToggleLeft size={30} strokeWidth={1.5} />}
                                </button>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setEditProduct(product)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                                    style={{ background: `${Colors.info}18`, color: Colors.info }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = Colors.info; (e.currentTarget as HTMLElement).style.color = Colors.white; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${Colors.info}18`; (e.currentTarget as HTMLElement).style.color = Colors.info; }}>
                                    <Pencil size={13} strokeWidth={2} /> Edit
                                  </button>
                                  <button onClick={() => setDeleteTarget(product)}
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                                    style={{ background: "#FFF0F3", color: Colors.error }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = Colors.error; (e.currentTarget as HTMLElement).style.color = Colors.white; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#FFF0F3"; (e.currentTarget as HTMLElement).style.color = Colors.error; }}>
                                    <Trash2 size={13} strokeWidth={2} /> Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
                style={{ borderTop: `1px solid ${Colors.divider}`, background: Colors.surfaceAlt }}>
                <p className="text-xs" style={{ color: Colors.textMuted }}>
                  Page {page} of {totalPages} · {totalCount} total products
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => fetchProducts(page - 1)} disabled={page <= 1 || loading}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: page <= 1 ? Colors.surfaceAlt : Colors.surface, color: page <= 1 ? Colors.textMuted : Colors.textPrimary, border: `1.5px solid ${Colors.border}`, opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}>
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    return (
                      <button key={pg} onClick={() => fetchProducts(pg)}
                        className="w-8 h-8 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: pg === page ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})` : Colors.surface,
                          color: pg === page ? Colors.white : Colors.textSecondary,
                          border: `1.5px solid ${pg === page ? "transparent" : Colors.border}`,
                        }}>
                        {pg}
                      </button>
                    );
                  })}
                  <button onClick={() => fetchProducts(page + 1)} disabled={page >= totalPages || loading}
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: page >= totalPages ? Colors.surfaceAlt : Colors.surface, color: page >= totalPages ? Colors.textMuted : Colors.textPrimary, border: `1.5px solid ${Colors.border}`, opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}>
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grid pagination */}
        {view === "grid" && !loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button onClick={() => fetchProducts(page - 1)} disabled={page <= 1}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: Colors.surface, color: page <= 1 ? Colors.textMuted : Colors.textPrimary, border: `1.5px solid ${Colors.border}`, opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}>
              ← Prev
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const pg = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
              return (
                <button key={pg} onClick={() => fetchProducts(pg)}
                  className="w-8 h-8 rounded-xl text-xs font-bold"
                  style={{
                    background: pg === page ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})` : Colors.surface,
                    color: pg === page ? Colors.white : Colors.textSecondary,
                    border: `1.5px solid ${pg === page ? "transparent" : Colors.border}`,
                  }}>
                  {pg}
                </button>
              );
            })}
            <button onClick={() => fetchProducts(page + 1)} disabled={page >= totalPages}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: Colors.surface, color: page >= totalPages ? Colors.textMuted : Colors.textPrimary, border: `1.5px solid ${Colors.border}`, opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}>
              Next →
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .line-clamp-1 { display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden; }
        .line-clamp-2 { display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance:none; margin:0; }
        input::placeholder { color: ${Colors.textMuted}; }
        select option { color: ${Colors.textPrimary}; background: ${Colors.surface}; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .animate-pulse { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </>
  );
}