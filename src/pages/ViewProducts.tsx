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
} from "lucide-react";
import Colors from "../constants/colors";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  unit: string;
  description: string;
  imageUrl: string;
  stockLimited: boolean;
  stockQty: number;
  createdAt: string;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Pan-D 40mg Tablet",
    category: "Tablets & Capsules",
    price: 52,
    mrp: 65,
    unit: "Strip",
    description: "For acidity and gastric reflux",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=Pan-D",
    stockLimited: true,
    stockQty: 150,
    createdAt: "2025-04-01",
  },
  {
    id: "2",
    name: "Calpol 500mg Syrup",
    category: "Syrups & Liquids",
    price: 38,
    mrp: 45,
    unit: "Bottle",
    description: "Paracetamol syrup for fever and pain",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=Calpol",
    stockLimited: false,
    stockQty: 0,
    createdAt: "2025-04-02",
  },
  {
    id: "3",
    name: "Betadine Ointment",
    category: "Ointments & Creams",
    price: 85,
    mrp: 100,
    unit: "Tube",
    description: "Antiseptic ointment for wound care",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=Betadine",
    stockLimited: true,
    stockQty: 60,
    createdAt: "2025-04-03",
  },
  {
    id: "4",
    name: "Azithromycin 500mg",
    category: "Tablets & Capsules",
    price: 120,
    mrp: 145,
    unit: "Strip",
    description: "Antibiotic for bacterial infections",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=Azithro",
    stockLimited: true,
    stockQty: 8,
    createdAt: "2025-04-04",
  },
  {
    id: "5",
    name: "Vitamin D3 Drops",
    category: "Drops",
    price: 210,
    mrp: 250,
    unit: "Bottle",
    description: "Vitamin D3 supplement for all ages",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=VitD3",
    stockLimited: false,
    stockQty: 0,
    createdAt: "2025-04-05",
  },
  {
    id: "6",
    name: "Insulin Syringe 1ml",
    category: "Medical Devices",
    price: 12,
    mrp: 15,
    unit: "Piece",
    description: "Disposable insulin syringe",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=Syringe",
    stockLimited: true,
    stockQty: 0,
    createdAt: "2025-04-06",
  },
  {
    id: "7",
    name: "Liv 52 DS Tablet",
    category: "Ayurvedic",
    price: 175,
    mrp: 200,
    unit: "Box",
    description: "Liver care supplement",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=Liv52",
    stockLimited: false,
    stockQty: 0,
    createdAt: "2025-04-07",
  },
  {
    id: "8",
    name: "ORS Electral Sachet",
    category: "Vitamins & Supplements",
    price: 14,
    mrp: 18,
    unit: "Sachet",
    description: "Oral rehydration salts for dehydration",
    imageUrl: "https://placehold.co/300x300/E7F7F4/00A884?text=ORS",
    stockLimited: true,
    stockQty: 300,
    createdAt: "2025-04-08",
  },
];

const CATEGORIES = [
  "All",
  "Tablets & Capsules",
  "Syrups & Liquids",
  "Injections",
  "Ointments & Creams",
  "Drops",
  "Medical Devices",
  "Vitamins & Supplements",
  "Ayurvedic",
  "Other",
];
const UNITS = [
  "Strip",
  "Bottle",
  "Tube",
  "Vial",
  "Sachet",
  "Piece",
  "Box",
  "Pack",
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function stockStatus(p: Product): { label: string; color: string; bg: string } {
  if (!p.stockLimited)
    return {
      label: "Unlimited",
      color: Colors.success,
      bg: `${Colors.success}18`,
    };
  if (p.stockQty === 0)
    return { label: "Out of Stock", color: Colors.error, bg: "#FFF0F3" };
  if (p.stockQty <= 10)
    return {
      label: `Low (${p.stockQty})`,
      color: Colors.warning,
      bg: `${Colors.warning}18`,
    };
  return {
    label: `${p.stockQty} units`,
    color: Colors.info,
    bg: `${Colors.info}18`,
  };
}

function discount(price: number, mrp: number) {
  if (!mrp || mrp <= price) return null;
  return Math.round(((mrp - price) / mrp) * 100);
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
}: {
  src: string;
  name: string;
  size?: number;
}) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl flex-shrink-0"
        style={{
          width: size,
          height: size,
          background: Colors.surfaceAlt,
          border: `1px solid ${Colors.border}`,
        }}
      >
        <ImageOff size={size * 0.4} color={Colors.border} strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={name}
      onError={() => setErr(true)}
      className="rounded-2xl object-cover flex-shrink-0"
      style={{ width: size, height: size, background: Colors.surfaceAlt }}
    />
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

  const set = (key: keyof Product, val: string | boolean | number) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    onSave(form);
    setSaving(false);
  };

  const inputClass =
    "w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none";
  const inputStyle = { color: Colors.textPrimary };

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
            <ProductImage src={form.imageUrl} name={form.name} size={64} />
            <div className="flex-1 flex flex-col gap-1.5">
              <FieldLabel>Image URL</FieldLabel>
              <InputBox focused={focused === "img"} icon={Link}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  placeholder="https://..."
                  value={form.imageUrl}
                  onChange={(e) => set("imageUrl", e.target.value)}
                  onFocus={() => setFocused("img")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Name */}
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
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c}>{c}</option>
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
                <select
                  className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }}
                  value={form.unit}
                  onChange={(e) => set("unit", e.target.value)}
                  onFocus={() => setFocused("unit")}
                  onBlur={() => setFocused("")}
                >
                  {UNITS.map((u) => (
                    <option key={u}>{u}</option>
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
          </div>

          {/* Price + MRP */}
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
              <FieldLabel>MRP (₹)</FieldLabel>
              <InputBox focused={focused === "mrp"} icon={IndianRupee}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={form.mrp}
                  onChange={(e) => set("mrp", Number(e.target.value))}
                  onFocus={() => setFocused("mrp")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
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

          {/* Stock Toggle */}
          <div
            className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
            style={{
              background: Colors.surfaceAlt,
              border: `1.5px solid ${Colors.border}`,
            }}
          >
            <div>
              <p
                className="text-sm font-semibold"
                style={{ color: Colors.textPrimary }}
              >
                Limit Stock Orders
              </p>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                Orders stop when stock reaches zero
              </p>
            </div>
            <button
              onClick={() => set("stockLimited", !form.stockLimited)}
              style={{
                color: form.stockLimited ? Colors.primary : Colors.textMuted,
              }}
            >
              {form.stockLimited ? (
                <ToggleRight size={34} strokeWidth={1.5} />
              ) : (
                <ToggleLeft size={34} strokeWidth={1.5} />
              )}
            </button>
          </div>

          {/* Stock Qty */}
          {form.stockLimited && (
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Stock Quantity</FieldLabel>
              <InputBox focused={focused === "qty"} icon={Boxes}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={form.stockQty}
                  onChange={(e) => set("stockQty", Number(e.target.value))}
                  onFocus={() => setFocused("qty")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          )}

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
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");
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
        p.category.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        categoryFilter === "All" || p.category === categoryFilter;
      const matchStock =
        stockFilter === "All" ||
        (stockFilter === "In Stock" && (!p.stockLimited || p.stockQty > 0)) ||
        (stockFilter === "Out of Stock" &&
          p.stockLimited &&
          p.stockQty === 0) ||
        (stockFilter === "Low Stock" &&
          p.stockLimited &&
          p.stockQty > 0 &&
          p.stockQty <= 10);
      return matchSearch && matchCat && matchStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const handleStockToggle = (id: string) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stockLimited: !p.stockLimited } : p,
      ),
    );
    const p = products.find((p) => p.id === id)!;
    showToast(
      "success",
      `"${p.name}" stock ${p.stockLimited ? "set to unlimited" : "set to limited"}`,
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
  const outOfStock = products.filter(
    (p) => p.stockLimited && p.stockQty === 0,
  ).length;
  const lowStock = products.filter(
    (p) => p.stockLimited && p.stockQty > 0 && p.stockQty <= 10,
  ).length;
  const unlimited = products.filter((p) => !p.stockLimited).length;

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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total Products",
              value: totalProducts,
              color: Colors.primary,
              bg: Colors.primaryLight,
            },
            {
              label: "Unlimited Stock",
              value: unlimited,
              color: Colors.success,
              bg: `${Colors.success}18`,
            },
            {
              label: "Low Stock",
              value: lowStock,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
            },
            {
              label: "Out of Stock",
              value: outOfStock,
              color: Colors.error,
              bg: "#FFF0F3",
            },
          ].map(({ label, value, color, bg }) => (
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
                <Package size={18} color={color} strokeWidth={2} />
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
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
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
              {["All", "In Stock", "Out of Stock", "Low Stock"].map((s) => (
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

        {/* ── Results count ── */}
        {(search || categoryFilter !== "All" || stockFilter !== "All") && (
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
                  const disc = discount(product.price, product.mrp);
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
                        style={{ height: 160, background: Colors.surfaceAlt }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (
                                e.currentTarget as HTMLImageElement
                              ).style.display = "none";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageOff
                              size={36}
                              color={Colors.border}
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                        {/* Discount badge */}
                        {disc && (
                          <div
                            className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-xs font-bold"
                            style={{
                              background: Colors.error,
                              color: Colors.white,
                            }}
                          >
                            -{disc}%
                          </div>
                        )}
                        {/* Stock badge */}
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-semibold"
                          style={{ background: stock.bg, color: stock.color }}
                        >
                          {stock.label}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div>
                          <span
                            className="text-xs font-medium px-2 py-0.5 rounded-lg"
                            style={{
                              background: Colors.primaryLight,
                              color: Colors.primary,
                            }}
                          >
                            {product.category}
                          </span>
                        </div>
                        <p
                          className="text-sm font-bold leading-snug"
                          style={{ color: Colors.textPrimary }}
                        >
                          {product.name}
                        </p>
                        {product.description && (
                          <p
                            className="text-xs line-clamp-2 leading-relaxed"
                            style={{ color: Colors.textMuted }}
                          >
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-baseline gap-2 mt-auto pt-1">
                          <p
                            className="text-base font-bold"
                            style={{ color: Colors.primary }}
                          >
                            ₹{product.price}
                          </p>
                          {product.mrp > product.price && (
                            <p
                              className="text-xs line-through"
                              style={{ color: Colors.textMuted }}
                            >
                              ₹{product.mrp}
                            </p>
                          )}
                          <p
                            className="text-xs ml-auto"
                            style={{ color: Colors.textMuted }}
                          >
                            / {product.unit}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className="px-4 pb-4 flex items-center gap-2"
                        style={{
                          borderTop: `1px solid ${Colors.divider}`,
                          paddingTop: 12,
                        }}
                      >
                        {/* Stock toggle */}
                        <button
                          onClick={() => handleStockToggle(product.id)}
                          className="flex items-center gap-1.5 flex-1 justify-center py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: product.stockLimited
                              ? `${Colors.primary}18`
                              : Colors.surfaceAlt,
                            color: product.stockLimited
                              ? Colors.primary
                              : Colors.textSecondary,
                            border: `1px solid ${product.stockLimited ? Colors.primary + "40" : Colors.border}`,
                          }}
                        >
                          {product.stockLimited ? (
                            <ToggleRight size={16} strokeWidth={2} />
                          ) : (
                            <ToggleLeft size={16} strokeWidth={2} />
                          )}
                          {product.stockLimited ? "Limited" : "Unlimited"}
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
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr style={{ background: Colors.surfaceAlt }}>
                    {[
                      "#",
                      "Product",
                      "Category",
                      "Price",
                      "MRP",
                      "Unit",
                      "Stock Status",
                      "Limit Orders",
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
                      <td colSpan={9} className="py-16 text-center">
                        <EmptyState inline />
                      </td>
                    </tr>
                  ) : (
                    filtered.map((product, idx) => {
                      const stock = stockStatus(product);
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
                                src={product.imageUrl}
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
                                    className="text-xs line-clamp-1 max-w-[160px]"
                                    style={{ color: Colors.textMuted }}
                                  >
                                    {product.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className="text-xs font-medium px-2 py-0.5 rounded-lg whitespace-nowrap"
                              style={{
                                background: Colors.primaryLight,
                                color: Colors.primary,
                              }}
                            >
                              {product.category}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <p
                              className="text-sm font-bold"
                              style={{ color: Colors.primary }}
                            >
                              ₹{product.price}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p
                              className="text-sm line-through"
                              style={{ color: Colors.textMuted }}
                            >
                              ₹{product.mrp}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            <p
                              className="text-sm"
                              style={{ color: Colors.textSecondary }}
                            >
                              {product.unit}
                            </p>
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
                            <button
                              onClick={() => handleStockToggle(product.id)}
                              style={{
                                color: product.stockLimited
                                  ? Colors.primary
                                  : Colors.textMuted,
                              }}
                            >
                              {product.stockLimited ? (
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
