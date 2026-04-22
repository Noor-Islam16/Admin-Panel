import { useState, useMemo } from "react";
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
  Link,
  PackagePlus,
  CheckCircle2,
  ImageOff,
  Filter,
  Star,
  Award,
  TrendingUp,
  Flame,
} from "lucide-react";
import Colors from "../constants/colors";
import {
  PRODUCTS,
  CATEGORIES,
  type Product,
  type ProductTag,
} from "../constants/products";

// ── Types for local state (matching the imported Product interface) ───────────
// Using the imported Product type directly

// ── Helpers ───────────────────────────────────────────────────────────────────
function stockStatus(p: Product): { label: string; color: string; bg: string } {
  if (!p.inStock) {
    return { label: "Out of Stock", color: Colors.error, bg: "#FFF0F3" };
  }
  if (p.stock <= 10) {
    return {
      label: `Low (${p.stock})`,
      color: Colors.warning,
      bg: `${Colors.warning}18`,
    };
  }
  if (p.fastMoving) {
    return {
      label: `${p.stock} units`,
      color: Colors.info,
      bg: `${Colors.info}18`,
    };
  }
  return {
    label: `${p.stock} units`,
    color: Colors.success,
    bg: `${Colors.success}18`,
  };
}

function getRatingDisplay(rating?: number, reviewCount?: number) {
  if (!rating) return null;
  return { rating, reviewCount: reviewCount || 0 };
}

// ── Shared small components ───────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="text-xs font-semibold tracking-wide uppercase"
      style={{ color: Colors.textSecondary }}
    >
      {children}
    </label>
  );
}

function InputBox({
  focused,
  icon: Icon,
  children,
}: {
  focused: boolean;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex items-center rounded-2xl transition-all duration-200 overflow-hidden"
      style={{
        background: focused ? Colors.primaryLight : Colors.surfaceAlt,
        border: `1.5px solid ${focused ? Colors.borderFocus : Colors.border}`,
      }}
    >
      <div
        className="absolute left-3.5 pointer-events-none"
        style={{ color: focused ? Colors.primary : Colors.textMuted }}
      >
        <Icon size={17} strokeWidth={2} />
      </div>
      {children}
    </div>
  );
}

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

// ── Product Image ─────────────────────────────────────────────────────────────
function ProductImage({
  src,
  name,
  size = 56,
  fill = false,
}: {
  src?: string;
  name: string;
  size?: number;
  fill?: boolean;
}) {
  const [err, setErr] = useState(false);
  const imageSrc = Array.isArray(src) ? src[0] : src;

  if (!imageSrc || err) {
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
        <ImageOff
          size={fill ? 40 : size * 0.4}
          color={Colors.border}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  if (fill) {
    return (
      <img
        src={imageSrc}
        alt={name}
        onError={() => setErr(true)}
        className="w-full h-full object-cover"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
    );
  }

  return (
    <img
      src={imageSrc}
      alt={name}
      onError={() => setErr(true)}
      className="rounded-2xl object-cover flex-shrink-0"
      style={{ width: size, height: size, background: Colors.surfaceAlt }}
    />
  );
}

// ── Tag Badge ─────────────────────────────────────────────────────────────────
function TagBadge({ tag }: { tag: ProductTag }) {
  const tagColors: Record<ProductTag, { bg: string; color: string }> = {
    "Limited Stock": { bg: `${Colors.warning}18`, color: Colors.warning },
    "Out of Stock": { bg: "#FFF0F3", color: Colors.error },
    "Fast Moving": { bg: `${Colors.info}18`, color: Colors.info },
    "New Arrival": { bg: `${Colors.primaryLight}`, color: Colors.primary },
    "Best Seller": { bg: "#FFF8E1", color: "#F9A825" },
    "Special Offer": { bg: "#FCE4EC", color: "#E91E63" },
    Trending: { bg: "#E8EAF6", color: "#5C6BC0" },
    Premium: { bg: "#FFF3E0", color: "#F57C00" },
    Organic: { bg: "#E8F5E9", color: "#43A047" },
    Imported: { bg: "#E3F2FD", color: "#1E88E5" },
  };
  const style = tagColors[tag] || {
    bg: Colors.surfaceAlt,
    color: Colors.textSecondary,
  };

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-lg font-medium whitespace-nowrap"
      style={{ background: style.bg, color: style.color }}
    >
      {tag}
    </span>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: Colors.overlay }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 relative"
        style={{
          background: Colors.surface,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        }}
      >
        <button
          onClick={onCancel}
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
          Delete Product?
        </h3>
        <p className="text-sm mb-5" style={{ color: Colors.textSecondary }}>
          Permanently delete{" "}
          <span className="font-semibold" style={{ color: Colors.textPrimary }}>
            {product.name}
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
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
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold"
            style={{ background: Colors.error, color: Colors.white }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Modal ────────────────────────────────────────────────────────────────
function EditModal({
  product,
  onSave,
  onClose,
}: {
  product: Product;
  onSave: (p: Product) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ ...product });
  const [focused, setFocused] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof Product, val: string | boolean | number | string[]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    onSave({
      ...form,
      inStock: form.stock > 0,
      discount:
        form.originalPrice && form.originalPrice > form.price
          ? Math.round(
              ((form.originalPrice - form.price) / form.originalPrice) * 100,
            )
          : undefined,
    });
    setSaving(false);
  };

  const inputClass =
    "w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none";
  const inputStyle = { color: Colors.textPrimary };

  // Get category name from id
  const categoryOptions = CATEGORIES.filter((c) => c.id !== "all");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: Colors.overlay }}
    >
      <div
        className="w-full max-w-lg rounded-3xl overflow-hidden"
        style={{
          background: Colors.surface,
          boxShadow: "0 24px 64px rgba(0,0,0,0.22)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{
            background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
          }}
        >
          <div className="flex items-center gap-2">
            <Pencil size={18} color={Colors.white} strokeWidth={2} />
            <p className="text-base font-bold" style={{ color: Colors.white }}>
              Edit Product
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.18)",
              color: Colors.white,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Image preview */}
          <div className="flex items-center gap-4">
            <ProductImage
              src={Array.isArray(form.images) ? form.images[0] : form.images}
              name={form.name}
              size={64}
            />
            <div className="flex-1 flex flex-col gap-1.5">
              <FieldLabel>Image URL</FieldLabel>
              <InputBox focused={focused === "img"} icon={Link}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="https://..."
                  value={
                    Array.isArray(form.images)
                      ? form.images[0] || ""
                      : form.images || ""
                  }
                  onChange={(e) => set("images", [e.target.value])}
                  onFocus={() => setFocused("img")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Name + Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Product Name *</FieldLabel>
              <InputBox focused={focused === "name"} icon={Tag}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Brand</FieldLabel>
              <InputBox focused={focused === "brand"} icon={Award}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.brand || ""}
                  onChange={(e) => set("brand", e.target.value)}
                  onFocus={() => setFocused("brand")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Category + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Category</FieldLabel>
              <InputBox focused={focused === "cat"} icon={Boxes}>
                <select
                  className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  onFocus={() => setFocused("cat")}
                  onBlur={() => setFocused("")}
                >
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </select>
                <div
                  className="absolute right-3 pointer-events-none"
                  style={{ color: Colors.textMuted }}
                >
                  <ChevronDown size={15} />
                </div>
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Unit</FieldLabel>
              <InputBox focused={focused === "unit"} icon={PackagePlus}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  onFocus={() => setFocused("unit")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Price + Original Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Selling Price (₹)</FieldLabel>
              <InputBox focused={focused === "price"} icon={IndianRupee}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={form.price}
                  onChange={(e) => set("price", Number(e.target.value))}
                  onFocus={() => setFocused("price")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Original Price (₹)</FieldLabel>
              <InputBox
                focused={focused === "originalPrice"}
                icon={IndianRupee}
              >
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={form.originalPrice || ""}
                  onChange={(e) =>
                    set(
                      "originalPrice",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  onFocus={() => setFocused("originalPrice")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Stock + Min Order Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Stock Quantity</FieldLabel>
              <InputBox focused={focused === "stock"} icon={Boxes}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    set("stock", val);
                    set("inStock", val > 0);
                  }}
                  onFocus={() => setFocused("stock")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Min Order Qty</FieldLabel>
              <InputBox focused={focused === "minOrderQty"} icon={Boxes}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="1"
                  value={form.minOrderQty || 1}
                  onChange={(e) =>
                    set(
                      "minOrderQty",
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  onFocus={() => setFocused("minOrderQty")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Weight / Size</FieldLabel>
            <InputBox focused={focused === "weight"} icon={Boxes}>
              <input
                className={inputClass}
                style={inputStyle}
                placeholder="e.g. 5kg, 500ml"
                value={form.weight || ""}
                onChange={(e) =>
                  set(
                    "weight",
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                onFocus={() => setFocused("weight")}
                onBlur={() => setFocused("")}
              />
            </InputBox>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Description</FieldLabel>
            <div
              className="relative rounded-2xl overflow-hidden transition-all duration-200"
              style={{
                background:
                  focused === "desc" ? Colors.primaryLight : Colors.surfaceAlt,
                border: `1.5px solid ${focused === "desc" ? Colors.borderFocus : Colors.border}`,
              }}
            >
              <div
                className="absolute top-3.5 left-3.5 pointer-events-none"
                style={{
                  color: focused === "desc" ? Colors.primary : Colors.textMuted,
                }}
              >
                <AlignLeft size={17} strokeWidth={2} />
              </div>
              <textarea
                rows={2}
                className="w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none resize-none"
                style={{ color: Colors.textPrimary }}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                onFocus={() => setFocused("desc")}
                onBlur={() => setFocused("")}
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            {/* Fast Moving */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{
                background: Colors.surfaceAlt,
                border: `1.5px solid ${Colors.border}`,
              }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp size={18} color={Colors.primary} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: Colors.textPrimary }}
                  >
                    Fast Moving
                  </p>
                  <p className="text-xs" style={{ color: Colors.textMuted }}>
                    Highlight as frequently purchased
                  </p>
                </div>
              </div>
              <button
                onClick={() => set("fastMoving", !form.fastMoving)}
                style={{
                  color: form.fastMoving ? Colors.primary : Colors.textMuted,
                }}
              >
                {form.fastMoving ? (
                  <ToggleRight size={34} strokeWidth={1.5} />
                ) : (
                  <ToggleLeft size={34} strokeWidth={1.5} />
                )}
              </button>
            </div>

            {/* Featured */}
            <div
              className="flex items-center justify-between px-4 py-3 rounded-2xl"
              style={{
                background: Colors.surfaceAlt,
                border: `1.5px solid ${Colors.border}`,
              }}
            >
              <div className="flex items-center gap-2">
                <Star size={18} color={Colors.warning} />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{ color: Colors.textPrimary }}
                  >
                    Featured
                  </p>
                  <p className="text-xs" style={{ color: Colors.textMuted }}>
                    Show on homepage
                  </p>
                </div>
              </div>
              <button
                onClick={() => set("featured", !form.featured)}
                style={{
                  color: form.featured ? Colors.primary : Colors.textMuted,
                }}
              >
                {form.featured ? (
                  <ToggleRight size={34} strokeWidth={1.5} />
                ) : (
                  <ToggleLeft size={34} strokeWidth={1.5} />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold"
              style={{
                background: Colors.surfaceAlt,
                color: Colors.textSecondary,
                border: `1.5px solid ${Colors.border}`,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                color: Colors.white,
                opacity: saving ? 0.8 : 1,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? (
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
                  Saving…
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} strokeWidth={2.5} /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function ViewProducts() {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("All");
  const [tagFilter, setTagFilter] = useState("All");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.brand?.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase());

      const matchCat =
        categoryFilter === "all" || p.category === categoryFilter;

      const matchStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && p.inStock) ||
        (stockFilter === "Out of Stock" && !p.inStock) ||
        (stockFilter === "Low Stock" && p.inStock && p.stock <= 10) ||
        (stockFilter === "Fast Moving" && p.fastMoving);

      const matchTag =
        tagFilter === "All" || p.tags.includes(tagFilter as ProductTag);

      return matchSearch && matchCat && matchStock && matchTag;
    });
  }, [products, search, categoryFilter, stockFilter, tagFilter]);

  const handleFastMovingToggle = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, fastMoving: !p.fastMoving } : p)),
    );
    const p = products.find((p) => p.id === id)!;
    showToast(
      "success",
      `"${p.name}" ${p.fastMoving ? "removed from" : "marked as"} fast moving`,
    );
  };

  const handleFeaturedToggle = (id: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p)),
    );
    const p = products.find((p) => p.id === id)!;
    showToast(
      "success",
      `"${p.name}" ${p.featured ? "removed from" : "marked as"} featured`,
    );
  };

  const handleSaveEdit = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditProduct(null);
    showToast("success", `"${updated.name}" updated successfully!`);
  };

  const handleDelete = () => {
    if (!deleteProduct) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteProduct.id));
    showToast("success", `"${deleteProduct.name}" deleted.`);
    setDeleteProduct(null);
  };

  // Stats
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => !p.inStock).length;
  const lowStock = products.filter((p) => p.inStock && p.stock <= 10).length;
  const fastMoving = products.filter((p) => p.fastMoving).length;
  const featured = products.filter((p) => p.featured).length;

  // Get unique tags from all products for filter
  const allTags = useMemo(() => {
    const tags = new Set<ProductTag>();
    products.forEach((p) => p.tags.forEach((t) => tags.add(t)));
    return ["All", ...Array.from(tags)];
  }, [products]);

  return (
    <>
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {editProduct && (
        <EditModal
          product={editProduct}
          onSave={handleSaveEdit}
          onClose={() => setEditProduct(null)}
        />
      )}
      {deleteProduct && (
        <DeleteModal
          product={deleteProduct}
          onConfirm={handleDelete}
          onCancel={() => setDeleteProduct(null)}
        />
      )}

      <div className="flex flex-col gap-6 pb-6">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package size={20} color={Colors.primary} strokeWidth={2} />
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: Colors.textPrimary }}
              >
                View Products
              </h1>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                {totalProducts} products in catalogue
              </p>
            </div>
          </div>
          {/* View Toggle */}
          <div
            className="flex items-center gap-1 p-1 rounded-2xl"
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
            }}
          >
            {(
              [
                ["grid", LayoutGrid],
                ["table", LayoutList],
              ] as const
            ).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background:
                    view === v
                      ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
                      : "transparent",
                  color: view === v ? Colors.white : Colors.textMuted,
                }}
              >
                <Icon size={15} strokeWidth={2} />
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Total Products",
              value: totalProducts,
              color: Colors.primary,
              bg: Colors.primaryLight,
              icon: Package,
            },
            {
              label: "Fast Moving",
              value: fastMoving,
              color: Colors.info,
              bg: `${Colors.info}18`,
              icon: TrendingUp,
            },
            {
              label: "Featured",
              value: featured,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: Star,
            },
            {
              label: "Low Stock",
              value: lowStock,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: AlertTriangle,
            },
            {
              label: "Out of Stock",
              value: outOfStock,
              color: Colors.error,
              bg: "#FFF0F3",
              icon: X,
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
                  className="text-lg font-bold leading-tight"
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

        {/* ── Filters Row ── */}
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-52">
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
              placeholder="Search products…"
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

          {/* Category filter */}
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
                minWidth: 160,
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

          {/* Stock filter */}
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
                minWidth: 150,
              }}
            >
              {[
                "All",
                "In Stock",
                "Out of Stock",
                "Low Stock",
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

          {/* Tag filter */}
          <div className="relative">
            <Tag
              size={15}
              color={Colors.textMuted}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              strokeWidth={2}
            />
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 rounded-2xl text-sm outline-none appearance-none cursor-pointer"
              style={{
                background: Colors.surface,
                border: `1.5px solid ${Colors.border}`,
                color: Colors.textSecondary,
                minWidth: 140,
              }}
            >
              {allTags.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color={Colors.textMuted}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>
        </div>

        {/* ── Results count ── */}
        {(search ||
          categoryFilter !== "all" ||
          stockFilter !== "All" ||
          tagFilter !== "All") && (
          <p className="text-xs" style={{ color: Colors.textMuted }}>
            Showing{" "}
            <span
              className="font-semibold"
              style={{ color: Colors.textPrimary }}
            >
              {filtered.length}
            </span>{" "}
            of {totalProducts} products
          </p>
        )}

        {/* ══════════════════════════════
            GRID VIEW
        ══════════════════════════════ */}
        {view === "grid" && (
          <>
            {filtered.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((product) => {
                  const stock = stockStatus(product);
                  const ratingInfo = getRatingDisplay(
                    product.rating,
                    product.reviewCount,
                  );
                  return (
                    <div
                      key={product.id}
                      className="rounded-3xl overflow-hidden flex flex-col transition-all duration-200 group"
                      style={{
                        background: Colors.surface,
                        border: `1px solid ${Colors.border}`,
                        boxShadow: `0 2px 12px ${Colors.shadow}`,
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          `0 8px 28px ${Colors.shadowMedium}`;
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          `0 2px 12px ${Colors.shadow}`;
                        (e.currentTarget as HTMLElement).style.transform =
                          "translateY(0)";
                      }}
                    >
                      {/* Image */}
                      <div
                        className="relative"
                        style={{
                          height: 160,
                          width: "100%",
                          background: Colors.surfaceAlt,
                          overflow: "hidden",
                        }}
                      >
                        <ProductImage
                          src={product.images[0]}
                          name={product.name}
                          fill={true}
                        />
                        {/* Discount badge */}
                        {product.discount && (
                          <div
                            className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-xs font-bold z-10"
                            style={{
                              background: Colors.error,
                              color: Colors.white,
                            }}
                          >
                            -{product.discount}%
                          </div>
                        )}
                        {/* Stock badge */}
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-semibold z-10"
                          style={{ background: "black", color: "white" }}
                        >
                          {stock.label}
                        </div>
                        {/* Fast Moving badge */}
                        {product.fastMoving && (
                          <div
                            className="absolute bottom-3 left-3 z-10"
                            style={{ color: "black" }}
                          >
                            <Flame
                              size={18}
                              fill={Colors.info}
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-lg"
                            style={{
                              background: Colors.primaryLight,
                              color: Colors.primary,
                            }}
                          >
                            {CATEGORIES.find((c) => c.id === product.category)
                              ?.name || product.category}
                          </span>
                          {product.featured && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-0.5"
                              style={{
                                background: `${Colors.warning}18`,
                                color: Colors.warning,
                              }}
                            >
                              <Star size={10} /> Featured
                            </span>
                          )}
                        </div>
                        <div>
                          <p
                            className="text-sm font-bold leading-snug"
                            style={{ color: Colors.textPrimary }}
                          >
                            {product.name}
                          </p>
                          {product.brand && (
                            <p
                              className="text-xs mt-0.5"
                              style={{ color: Colors.textMuted }}
                            >
                              {product.brand}
                            </p>
                          )}
                        </div>
                        {product.description && (
                          <p
                            className="text-xs line-clamp-2 leading-relaxed"
                            style={{ color: Colors.textMuted }}
                          >
                            {product.description}
                          </p>
                        )}
                        {/* Tags */}
                        {product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tag) => (
                              <TagBadge key={tag} tag={tag} />
                            ))}
                            {product.tags.length > 2 && (
                              <span
                                className="text-xs px-2 py-0.5 rounded-lg"
                                style={{
                                  background: Colors.surfaceAlt,
                                  color: Colors.textMuted,
                                }}
                              >
                                +{product.tags.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                        {/* Rating */}
                        {ratingInfo && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star size={12} fill="#F9A825" color="#F9A825" />
                            <span
                              className="text-xs font-semibold"
                              style={{ color: Colors.textPrimary }}
                            >
                              {ratingInfo.rating}
                            </span>
                            <span
                              className="text-xs"
                              style={{ color: Colors.textMuted }}
                            >
                              ({ratingInfo.reviewCount})
                            </span>
                          </div>
                        )}
                        <div className="flex items-baseline gap-2 mt-auto pt-1">
                          <p
                            className="text-base font-bold"
                            style={{ color: Colors.primary }}
                          >
                            ₹{product.price}
                          </p>
                          {product.originalPrice &&
                            product.originalPrice > product.price && (
                              <p
                                className="text-xs line-through"
                                style={{ color: Colors.textMuted }}
                              >
                                ₹{product.originalPrice}
                              </p>
                            )}
                          <p
                            className="text-xs ml-auto"
                            style={{ color: Colors.textMuted }}
                          >
                            / {product.unit}
                          </p>
                        </div>
                        {product.weight && (
                          <p
                            className="text-xs"
                            style={{ color: Colors.textMuted }}
                          >
                            {product.weight}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div
                        className="px-4 pb-4 flex items-center gap-2 flex-wrap"
                        style={{
                          borderTop: `1px solid ${Colors.divider}`,
                          paddingTop: 12,
                        }}
                      >
                        {/* Fast Moving toggle */}
                        <button
                          onClick={() => handleFastMovingToggle(product.id)}
                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
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
                          <Flame size={14} /> FM
                        </button>

                        {/* Featured toggle */}
                        <button
                          onClick={() => handleFeaturedToggle(product.id)}
                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
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
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => setEditProduct(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: `${Colors.info}18`,
                            color: Colors.info,
                            border: `1px solid ${Colors.info}40`,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              Colors.info;
                            (e.currentTarget as HTMLElement).style.color =
                              Colors.white;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              `${Colors.info}18`;
                            (e.currentTarget as HTMLElement).style.color =
                              Colors.info;
                          }}
                        >
                          <Pencil size={14} strokeWidth={2} /> Edit
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteProduct(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: "#FFF0F3",
                            color: Colors.error,
                            border: `1px solid #FFD0DA`,
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              Colors.error;
                            (e.currentTarget as HTMLElement).style.color =
                              Colors.white;
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.background =
                              "#FFF0F3";
                            (e.currentTarget as HTMLElement).style.color =
                              Colors.error;
                          }}
                        >
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
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
              boxShadow: `0 4px 16px ${Colors.shadow}`,
            }}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr style={{ background: Colors.surfaceAlt }}>
                    {[
                      "#",
                      "Product",
                      "Brand",
                      "Category",
                      "Price",
                      "Stock",
                      "Tags",
                      "Rating",
                      "Fast Moving",
                      "Featured",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-semibold tracking-wide uppercase"
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
                      <td colSpan={11} className="py-16 text-center">
                        <EmptyState inline />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product, idx) => {
                      const stock = stockStatus(product);
                      const ratingInfo = getRatingDisplay(
                        product.rating,
                        product.reviewCount,
                      );
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
                          <td className="px-5 py-3.5">
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
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <ProductImage
                                src={product.images[0]}
                                name={product.name}
                                size={40}
                              />
                              <div>
                                <p
                                  className="text-sm font-semibold"
                                  style={{ color: Colors.textPrimary }}
                                >
                                  {product.name}
                                </p>
                                {product.description && (
                                  <p
                                    className="text-xs line-clamp-1 max-w-[200px]"
                                    style={{ color: Colors.textMuted }}
                                  >
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <p
                              className="text-sm"
                              style={{ color: Colors.textSecondary }}
                            >
                              {product.brand || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
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
                          <td className="px-5 py-3.5">
                            <div>
                              <p
                                className="text-sm font-bold"
                                style={{ color: Colors.primary }}
                              >
                                ₹{product.price}
                              </p>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <p
                                    className="text-xs line-through"
                                    style={{ color: Colors.textMuted }}
                                  >
                                    ₹{product.originalPrice}
                                  </p>
                                )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className="text-xs font-semibold px-2.5 py-1 rounded-xl whitespace-nowrap"
                              style={{
                                background: stock.bg,
                                color: stock.color,
                              }}
                            >
                              {stock.label}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {product.tags.slice(0, 2).map((tag) => (
                                <TagBadge key={tag} tag={tag} />
                              ))}
                              {product.tags.length > 2 && (
                                <span
                                  className="text-xs px-2 py-0.5 rounded-lg"
                                  style={{
                                    background: Colors.surfaceAlt,
                                    color: Colors.textMuted,
                                  }}
                                >
                                  +{product.tags.length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {ratingInfo ? (
                              <div className="flex items-center gap-1">
                                <Star
                                  size={12}
                                  fill="#F9A825"
                                  color="#F9A825"
                                />
                                <span
                                  className="text-sm font-semibold"
                                  style={{ color: Colors.textPrimary }}
                                >
                                  {ratingInfo.rating}
                                </span>
                              </div>
                            ) : (
                              <span
                                className="text-xs"
                                style={{ color: Colors.textMuted }}
                              >
                                —
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleFastMovingToggle(product.id)}
                              style={{
                                color: product.fastMoving
                                  ? Colors.info
                                  : Colors.textMuted,
                              }}
                            >
                              {product.fastMoving ? (
                                <ToggleRight size={30} strokeWidth={1.5} />
                              ) : (
                                <ToggleLeft size={30} strokeWidth={1.5} />
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleFeaturedToggle(product.id)}
                              style={{
                                color: product.featured
                                  ? Colors.warning
                                  : Colors.textMuted,
                              }}
                            >
                              {product.featured ? (
                                <ToggleRight size={30} strokeWidth={1.5} />
                              ) : (
                                <ToggleLeft size={30} strokeWidth={1.5} />
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setEditProduct(product)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                                style={{
                                  background: `${Colors.info}18`,
                                  color: Colors.info,
                                }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = Colors.info;
                                  (e.currentTarget as HTMLElement).style.color =
                                    Colors.white;
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = `${Colors.info}18`;
                                  (e.currentTarget as HTMLElement).style.color =
                                    Colors.info;
                                }}
                              >
                                <Pencil size={13} strokeWidth={2} /> Edit
                              </button>
                              <button
                                onClick={() => setDeleteProduct(product)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                                style={{
                                  background: "#FFF0F3",
                                  color: Colors.error,
                                }}
                                onMouseEnter={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = Colors.error;
                                  (e.currentTarget as HTMLElement).style.color =
                                    Colors.white;
                                }}
                                onMouseLeave={(e) => {
                                  (
                                    e.currentTarget as HTMLElement
                                  ).style.background = "#FFF0F3";
                                  (e.currentTarget as HTMLElement).style.color =
                                    Colors.error;
                                }}
                              >
                                <Trash2 size={13} strokeWidth={2} /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div
                className="px-6 py-3 flex items-center justify-between"
                style={{
                  borderTop: `1px solid ${Colors.divider}`,
                  background: Colors.surfaceAlt,
                }}
              >
                <p className="text-xs" style={{ color: Colors.textMuted }}>
                  Showing {filtered.length} of {totalProducts} products
                </p>
              </div>
            )}
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
      `}</style>
    </>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ inline = false }: { inline?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${inline ? "py-8" : "py-20"}`}
    >
      <Package size={40} color={Colors.border} strokeWidth={1.5} />
      <p className="text-sm font-semibold" style={{ color: Colors.textMuted }}>
        No products found
      </p>
      <p className="text-xs" style={{ color: Colors.border }}>
        Try adjusting your search or filters
      </p>
    </div>
  );
}
