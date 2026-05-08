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
  AlignLeft,
  PackagePlus,
  CheckCircle2,
  ImageOff,
  Filter,
  Star,
  TrendingUp,
  Flame,
  RefreshCw,
  Smartphone,
  Cpu,
  Shield,
  Cable,
  Monitor,
  Palette,
} from "lucide-react";
import Colors from "../constants/colors";
import {
  CATEGORIES,
  PRODUCT_TAGS,
  WARRANTY_OPTIONS,
} from "../constants/products";
import { ProductAPI, StockAPI, type ApiProduct } from "../config/api";

// ── Helpers ───────────────────────────────────────────────────────────────────
function stockStatus(p: ApiProduct): {
  label: string;
  color: string;
  bg: string;
} {
  if (p.stockQuantity === 0)
    return { label: "Out of Stock", color: Colors.error, bg: "#FFF0F3" };
  if (p.stockQuantity <= 10)
    return {
      label: `Low (${p.stockQuantity})`,
      color: Colors.warning,
      bg: `${Colors.warning}18`,
    };
  if (p.isFastMoving)
    return {
      label: `${p.stockQuantity} units`,
      color: Colors.info,
      bg: `${Colors.info}18`,
    };
  return {
    label: `${p.stockQuantity} units`,
    color: Colors.success,
    bg: `${Colors.success}18`,
  };
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

// ── Product Image (Supports multiple images) ──────────────────────────────────
function ProductImage({
  images,
  name,
  size = 56,
  fill = false,
}: {
  images?: ApiProduct["images"];
  name: string;
  size?: number;
  fill?: boolean;
}) {
  const [err, setErr] = useState(false);
  const primaryImage =
    images?.find((img) => img.isPrimary)?.url || images?.[0]?.url;

  if (!primaryImage || err) {
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
        src={primaryImage}
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
      src={primaryImage}
      alt={name}
      onError={() => setErr(true)}
      className="rounded-2xl object-cover flex-shrink-0"
      style={{ width: size, height: size, background: Colors.surfaceAlt }}
    />
  );
}

// ── Tag Badge ─────────────────────────────────────────────────────────────────
function TagBadge({ tagId }: { tagId: string }) {
  const tag = PRODUCT_TAGS.find((t) => t.id === tagId);
  if (!tag) return null;

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-lg font-medium whitespace-nowrap"
      style={{
        background: tag.color + "18",
        color: tag.color,
        border: `1px solid ${tag.color}30`,
      }}
    >
      {tag.name}
    </span>
  );
}

// ── Delete Modal ──────────────────────────────────────────────────────────────
function DeleteModal({
  product,
  onConfirm,
  onCancel,
  deleting,
}: {
  product: ApiProduct;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
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
            disabled={deleting}
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
            disabled={deleting}
            className="flex-1 py-2.5 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
            style={{
              background: Colors.error,
              color: Colors.white,
              opacity: deleting ? 0.7 : 1,
            }}
          >
            {deleting ? (
              <>
                <Spinner /> Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner() {
  return (
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
  );
}

// ── Skeleton rows / cards ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{
        background: Colors.surface,
        border: `1px solid ${Colors.border}`,
      }}
    >
      <div
        className="animate-pulse"
        style={{ height: 200, background: Colors.surfaceAlt }}
      />
      <div className="p-4 flex flex-col gap-3">
        <div
          className="h-3 rounded-lg animate-pulse"
          style={{ background: Colors.surfaceAlt, width: "60%" }}
        />
        <div
          className="h-4 rounded-lg animate-pulse"
          style={{ background: Colors.surfaceAlt, width: "80%" }}
        />
        <div
          className="h-3 rounded-lg animate-pulse"
          style={{ background: Colors.surfaceAlt, width: "40%" }}
        />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <tr style={{ borderTop: `1px solid ${Colors.divider}` }}>
      {Array.from({ length: 11 }).map((_, i) => (
        <td key={i} className="px-5 py-4">
          <div
            className="h-4 rounded-lg animate-pulse"
            style={{ background: Colors.surfaceAlt, width: i === 1 ? 160 : 60 }}
          />
        </td>
      ))}
    </tr>
  );
}

// ── Edit Modal (Updated for Electronics) ──────────────────────────────────────
function EditModal({
  product,
  onSave,
  onClose,
}: {
  product: ApiProduct;
  onSave: (p: ApiProduct) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: product.name,
    brand: product.brand ?? "",
    category: product.category,
    subCategory: product.subCategory ?? "",
    type: product.type ?? "",
    compatibility: product.compatibility ?? [],
    sellingPrice: String(product.sellingPrice),
    originalPrice:
      product.originalPrice != null ? String(product.originalPrice) : "",
    color: product.color ?? "",
    material: product.material ?? "",
    dimensions: product.dimensions ?? "",
    weight: product.weight ?? "",
    warranty: product.warranty ?? "No Warranty",
    stockQuantity: String(product.stockQuantity),
    minOrderQuantity: String(product.minOrderQuantity),
    description: product.description ?? "",
    isFastMoving: product.isFastMoving,
    isFeatured: product.isFeatured,
  });
  const [focused, setFocused] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form, val: string | boolean | string[]) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("category", form.category);
      fd.append("sellingPrice", form.sellingPrice);
      fd.append("stockQuantity", form.stockQuantity);
      fd.append("warranty", form.warranty);
      fd.append("isFastMoving", String(form.isFastMoving));
      fd.append("isFeatured", String(form.isFeatured));

      if (form.brand) fd.append("brand", form.brand);
      if (form.subCategory) fd.append("subCategory", form.subCategory);
      if (form.type) fd.append("type", form.type);
      if (form.compatibility.length)
        fd.append("compatibility", form.compatibility.join(","));
      if (form.originalPrice) fd.append("originalPrice", form.originalPrice);
      if (form.color) fd.append("color", form.color);
      if (form.material) fd.append("material", form.material);
      if (form.dimensions) fd.append("dimensions", form.dimensions);
      if (form.weight) fd.append("weight", form.weight);
      if (form.description) fd.append("description", form.description);
      if (form.minOrderQuantity)
        fd.append("minOrderQuantity", form.minOrderQuantity);

      // Append new images if any
      imageFiles.forEach((file) => fd.append("images", file));

      const res = await ProductAPI.update(product._id, fd);
      onSave(res.data);
    } catch (e) {
      throw e;
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none";
  const inputStyle = { color: Colors.textPrimary };
  const availableSubcategories =
    CATEGORIES.find((c) => c.id === form.category)?.subcategories || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: Colors.overlay }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl overflow-hidden"
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
              Edit Electronics Accessory
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
          {/* Current Images Preview */}
          {product.images && product.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product.images.map((img, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img
                    src={img.url}
                    alt={img.altText || `${product.name} ${i + 1}`}
                    className="w-16 h-16 rounded-xl object-cover"
                    style={{
                      border: img.isPrimary
                        ? `2px solid ${Colors.primary}`
                        : `1px solid ${Colors.border}`,
                    }}
                  />
                  {img.isPrimary && (
                    <span
                      className="absolute -top-1 -right-1 px-1 py-0.5 rounded text-[9px] font-bold"
                      style={{
                        background: Colors.primary,
                        color: Colors.white,
                      }}
                    >
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add New Images */}
          <div className="flex items-center gap-4">
            <input
              ref={imageRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setImageFiles((prev) => [...prev, ...files]);
              }}
            />
            <button
              onClick={() => imageRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
              style={{
                background: Colors.primaryLight,
                color: Colors.primary,
                border: `1px solid ${Colors.accentLight}`,
              }}
            >
              <PackagePlus size={14} strokeWidth={2} />
              {imageFiles.length > 0
                ? `${imageFiles.length} images selected`
                : "Add New Images"}
            </button>
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
              <InputBox focused={focused === "brand"} icon={Cpu}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  onFocus={() => setFocused("brand")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Category + SubCategory */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Category</FieldLabel>
              <InputBox focused={focused === "cat"} icon={Monitor}>
                <select
                  className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }}
                  value={form.category}
                  onChange={(e) => {
                    set("category", e.target.value);
                    set("subCategory", "");
                  }}
                  onFocus={() => setFocused("cat")}
                  onBlur={() => setFocused("")}
                >
                  {CATEGORIES.map((c) => (
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
              <FieldLabel>Sub Category</FieldLabel>
              <InputBox focused={focused === "subCat"} icon={Cable}>
                <select
                  className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }}
                  value={form.subCategory}
                  onChange={(e) => set("subCategory", e.target.value)}
                  onFocus={() => setFocused("subCat")}
                  onBlur={() => setFocused("")}
                  disabled={!form.category}
                >
                  <option value="">Select sub category</option>
                  {availableSubcategories.map((sc) => (
                    <option key={sc} value={sc}>
                      {sc}
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
          </div>

          {/* Type + Warranty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Type / Variant</FieldLabel>
              <InputBox focused={focused === "type"} icon={Smartphone}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  onFocus={() => setFocused("type")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Warranty</FieldLabel>
              <InputBox focused={focused === "warranty"} icon={Shield}>
                <select
                  className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                  style={{ color: Colors.textPrimary }}
                  value={form.warranty}
                  onChange={(e) => set("warranty", e.target.value)}
                  onFocus={() => setFocused("warranty")}
                  onBlur={() => setFocused("")}
                >
                  {WARRANTY_OPTIONS.map((w) => (
                    <option key={w} value={w}>
                      {w}
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
                  value={form.sellingPrice}
                  onChange={(e) => set("sellingPrice", e.target.value)}
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
                  value={form.originalPrice}
                  onChange={(e) => set("originalPrice", e.target.value)}
                  onFocus={() => setFocused("originalPrice")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Color + Material */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Color</FieldLabel>
              <InputBox focused={focused === "color"} icon={Palette}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.color}
                  onChange={(e) => set("color", e.target.value)}
                  onFocus={() => setFocused("color")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Material</FieldLabel>
              <InputBox focused={focused === "material"} icon={Shield}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.material}
                  onChange={(e) => set("material", e.target.value)}
                  onFocus={() => setFocused("material")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Dimensions + Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Dimensions</FieldLabel>
              <InputBox focused={focused === "dimensions"} icon={Package}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.dimensions}
                  onChange={(e) => set("dimensions", e.target.value)}
                  onFocus={() => setFocused("dimensions")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Weight</FieldLabel>
              <InputBox focused={focused === "weight"} icon={Package}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  value={form.weight}
                  onChange={(e) => set("weight", e.target.value)}
                  onFocus={() => setFocused("weight")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
          </div>

          {/* Stock + Min Order Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Stock Quantity</FieldLabel>
              <InputBox focused={focused === "stock"} icon={Package}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => set("stockQuantity", e.target.value)}
                  onFocus={() => setFocused("stock")}
                  onBlur={() => setFocused("")}
                />
              </InputBox>
            </div>
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Min Order Qty</FieldLabel>
              <InputBox focused={focused === "minOrderQty"} icon={Package}>
                <input
                  className={inputClass}
                  style={inputStyle}
                  type="number"
                  min="1"
                  value={form.minOrderQuantity}
                  onChange={(e) => set("minOrderQuantity", e.target.value)}
                  onFocus={() => setFocused("minOrderQty")}
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

          {/* Toggles */}
          <div className="flex flex-col gap-3">
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
                onClick={() => set("isFastMoving", !form.isFastMoving)}
                style={{
                  color: form.isFastMoving ? Colors.primary : Colors.textMuted,
                }}
              >
                {form.isFastMoving ? (
                  <ToggleRight size={34} strokeWidth={1.5} />
                ) : (
                  <ToggleLeft size={34} strokeWidth={1.5} />
                )}
              </button>
            </div>
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
                onClick={() => set("isFeatured", !form.isFeatured)}
                style={{
                  color: form.isFeatured ? Colors.primary : Colors.textMuted,
                }}
              >
                {form.isFeatured ? (
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
              disabled={saving}
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
                  <Spinner /> Saving…
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

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ inline = false }: { inline?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${inline ? "py-8" : "py-20"}`}
    >
      <Smartphone size={40} color={Colors.border} strokeWidth={1.5} />
      <p className="text-sm font-semibold" style={{ color: Colors.textMuted }}>
        No products found
      </p>
      <p className="text-xs" style={{ color: Colors.border }}>
        Try adjusting your search or filters
      </p>
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

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 20;

  const [view, setView] = useState<"grid" | "table">("grid");
  const [search, setSearch] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("All");
  const [brandFilter] = useState("");

  const [editProduct, setEditProduct] = useState<ApiProduct | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ApiProduct | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [pendingOps, setPendingOps] = useState<Set<string>>(new Set());

  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    lowStock: 0,
    fastMoving: 0,
    featured: 0,
  });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const markPending = (id: string) => setPendingOps((s) => new Set(s).add(id));
  const clearPending = (id: string) =>
    setPendingOps((s) => {
      const n = new Set(s);
      n.delete(id);
      return n;
    });

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 420);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

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
        if (stockFilter === "Fast Moving") params.fastMoving = "true";
        if (stockFilter === "Featured") params.featured = "true";
        if (brandFilter) params.brand = brandFilter;

        const res = await ProductAPI.getAll(params);
        const { products: raw, pagination } = res.data;

        let filtered = raw;
        if (stockFilter === "Out of Stock")
          filtered = raw.filter((p) => p.stockQuantity === 0);
        else if (stockFilter === "In Stock")
          filtered = raw.filter((p) => p.stockQuantity > 0);
        else if (stockFilter === "Low Stock")
          filtered = raw.filter(
            (p) => p.stockQuantity > 0 && p.stockQuantity <= 10,
          );

        setProducts(filtered);
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
    [categoryFilter, debouncedSearch, stockFilter, brandFilter],
  );

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  useEffect(() => {
    StockAPI.getStats()
      .then((r) => setStats(r.data))
      .catch(() => null);
  }, [products]);

  const handleFastMovingToggle = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;
    const next = !product.isFastMoving;

    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isFastMoving: next } : p)),
    );
    markPending(id);
    try {
      await StockAPI.toggleFastMoving(id, next);
      showToast(
        "success",
        `"${product.name}" ${next ? "marked as" : "removed from"} fast moving`,
      );
    } catch (e) {
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFastMoving: !next } : p)),
      );
      showToast("error", e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      clearPending(id);
    }
  };

  const handleFeaturedToggle = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product || pendingOps.has(id)) return;
    const next = !product.isFeatured;

    setProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, isFeatured: next } : p)),
    );
    markPending(id);
    try {
      await StockAPI.toggleFeatured(id, next);
      showToast(
        "success",
        `"${product.name}" ${next ? "marked as" : "removed from"} featured`,
      );
    } catch (e) {
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isFeatured: !next } : p)),
      );
      showToast("error", e instanceof Error ? e.message : "Toggle failed.");
    } finally {
      clearPending(id);
    }
  };

  const handleSaveEdit = async (updated: ApiProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p)),
    );
    setEditProduct(null);
    showToast("success", `"${updated.name}" updated successfully!`);
  };

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

  const getDiscount = (p: ApiProduct) => {
    if (!p.originalPrice || p.originalPrice <= p.sellingPrice) return null;
    return Math.round(
      ((p.originalPrice - p.sellingPrice) / p.originalPrice) * 100,
    );
  };

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
      {deleteTarget && (
        <DeleteModal
          product={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      <div className="flex flex-col gap-6 pb-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <Smartphone size={20} color={Colors.primary} strokeWidth={2} />
            <div>
              <h1
                className="text-xl font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Electronics Accessories
              </h1>
              <p className="text-xs" style={{ color: Colors.textMuted }}>
                {totalCount} products in catalogue
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchProducts(page)}
              className="p-2.5 rounded-2xl transition-all duration-150"
              style={{
                background: Colors.surface,
                border: `1.5px solid ${Colors.border}`,
                color: Colors.textMuted,
              }}
            >
              <RefreshCw size={16} strokeWidth={2} />
            </button>
            <div
              className="flex items-center gap-1 p-1 rounded-2xl"
              style={{
                background: Colors.surface,
                border: `1px solid ${Colors.border}`,
              }}
            >
              <button
                onClick={() => setView("grid")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background:
                    view === "grid"
                      ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
                      : "transparent",
                  color: view === "grid" ? Colors.white : Colors.textMuted,
                }}
              >
                <LayoutGrid size={15} strokeWidth={2} />
                Grid
              </button>
              <button
                onClick={() => setView("table")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200"
                style={{
                  background:
                    view === "table"
                      ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
                      : "transparent",
                  color: view === "table" ? Colors.white : Colors.textMuted,
                }}
              >
                <LayoutList size={15} strokeWidth={2} />
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              label: "Total Products",
              value: stats.total,
              color: Colors.primary,
              bg: Colors.primaryLight,
              icon: Package,
            },
            {
              label: "Fast Moving",
              value: stats.fastMoving,
              color: Colors.info,
              bg: `${Colors.info}18`,
              icon: TrendingUp,
            },
            {
              label: "Featured",
              value: stats.featured,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: Star,
            },
            {
              label: "Low Stock",
              value: stats.lowStock,
              color: Colors.warning,
              bg: `${Colors.warning}18`,
              icon: AlertTriangle,
            },
            {
              label: "Out of Stock",
              value: stats.outOfStock,
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

        {/* Filters Row */}
        <div className="flex flex-wrap gap-3 items-center">
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
              placeholder="Search electronics accessories…"
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
            <Package
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
        </div>

        {/* Results count */}
        {(search || categoryFilter !== "all" || stockFilter !== "All") && (
          <p className="text-xs" style={{ color: Colors.textMuted }}>
            Showing{" "}
            <span
              className="font-semibold"
              style={{ color: Colors.textPrimary }}
            >
              {products.length}
            </span>{" "}
            of {totalCount} products
          </p>
        )}

        {/* Error State */}
        {fetchError && (
          <div
            className="flex items-center gap-3 px-5 py-4 rounded-2xl"
            style={{ background: "#FFF0F3", border: `1.5px solid #FFD0DA` }}
          >
            <AlertTriangle size={18} color={Colors.error} strokeWidth={2} />
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

        {/* Grid View */}
        {view === "grid" && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
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
                    <div
                      key={product._id}
                      className="rounded-3xl overflow-hidden flex flex-col transition-all duration-200 group"
                      style={{
                        background: Colors.surface,
                        border: `1px solid ${Colors.border}`,
                        boxShadow: `0 2px 12px ${Colors.shadow}`,
                        opacity: isPending ? 0.75 : 1,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = `0 8px 28px ${Colors.shadowMedium}`;
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = `0 2px 12px ${Colors.shadow}`;
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      {/* Image */}
                      <div
                        className="relative"
                        style={{
                          height: 200,
                          background: Colors.surfaceAlt,
                          overflow: "hidden",
                        }}
                      >
                        <ProductImage
                          images={product.images}
                          name={product.name}
                          fill={true}
                        />
                        {discount && (
                          <div
                            className="absolute top-3 left-3 px-2 py-0.5 rounded-lg text-xs font-bold z-10"
                            style={{
                              background: Colors.error,
                              color: Colors.white,
                            }}
                          >
                            -{discount}%
                          </div>
                        )}
                        <div
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-xl text-xs font-semibold z-10"
                          style={{
                            background: "rgba(0,0,0,0.75)",
                            color: "white",
                          }}
                        >
                          {stock.label}
                        </div>
                        {product.isFastMoving && (
                          <div className="absolute bottom-3 left-3 z-10">
                            <Flame
                              size={18}
                              fill={Colors.info}
                              strokeWidth={1.5}
                            />
                          </div>
                        )}
                        {/* Image count indicator */}
                        {product.images && product.images.length > 1 && (
                          <div
                            className="absolute bottom-3 right-3 z-10 px-2 py-0.5 rounded-lg text-xs font-semibold"
                            style={{
                              background: "rgba(0,0,0,0.75)",
                              color: "white",
                            }}
                          >
                            {product.images.length} images
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
                          {product.type && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-lg"
                              style={{
                                background: Colors.surfaceAlt,
                                color: Colors.textSecondary,
                              }}
                            >
                              {product.type}
                            </span>
                          )}
                          {product.isFeatured && (
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
                              style={{ color: Colors.primary }}
                            >
                              {product.brand}
                            </p>
                          )}
                        </div>
                        {/* Specifications preview */}
                        {product.specifications &&
                          Object.keys(product.specifications).length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {Object.entries(product.specifications)
                                .slice(0, 2)
                                .map(([key, val]) => (
                                  <span
                                    key={key}
                                    className="text-xs px-1.5 py-0.5 rounded-md"
                                    style={{
                                      background: Colors.surfaceAlt,
                                      color: Colors.textSecondary,
                                    }}
                                  >
                                    {key}: {val}
                                  </span>
                                ))}
                              {Object.keys(product.specifications).length >
                                2 && (
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded-md"
                                  style={{
                                    background: Colors.surfaceAlt,
                                    color: Colors.textMuted,
                                  }}
                                >
                                  +
                                  {Object.keys(product.specifications).length -
                                    2}
                                </span>
                              )}
                            </div>
                          )}
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {product.tags.slice(0, 2).map((tagId) => (
                              <TagBadge key={tagId} tagId={tagId} />
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
                        <div className="flex items-baseline gap-2 mt-auto pt-1">
                          <p
                            className="text-base font-bold"
                            style={{ color: Colors.primary }}
                          >
                            ₹{product.sellingPrice}
                          </p>
                          {product.originalPrice &&
                            product.originalPrice > product.sellingPrice && (
                              <p
                                className="text-xs line-through"
                                style={{ color: Colors.textMuted }}
                              >
                                ₹{product.originalPrice}
                              </p>
                            )}
                          {product.warranty &&
                            product.warranty !== "No Warranty" && (
                              <p
                                className="text-xs ml-auto"
                                style={{ color: Colors.textMuted }}
                              >
                                {product.warranty}
                              </p>
                            )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div
                        className="px-4 pb-4 flex items-center gap-2 flex-wrap"
                        style={{
                          borderTop: `1px solid ${Colors.divider}`,
                          paddingTop: 12,
                        }}
                      >
                        <button
                          onClick={() => handleFastMovingToggle(product._id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: product.isFastMoving
                              ? `${Colors.info}18`
                              : Colors.surfaceAlt,
                            color: product.isFastMoving
                              ? Colors.info
                              : Colors.textSecondary,
                            border: `1px solid ${product.isFastMoving ? Colors.info + "40" : Colors.border}`,
                            cursor: isPending ? "not-allowed" : "pointer",
                          }}
                        >
                          <Flame size={14} /> FM
                        </button>
                        <button
                          onClick={() => handleFeaturedToggle(product._id)}
                          disabled={isPending}
                          className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: product.isFeatured
                              ? `${Colors.warning}18`
                              : Colors.surfaceAlt,
                            color: product.isFeatured
                              ? Colors.warning
                              : Colors.textSecondary,
                            border: `1px solid ${product.isFeatured ? Colors.warning + "40" : Colors.border}`,
                            cursor: isPending ? "not-allowed" : "pointer",
                          }}
                        >
                          <Star size={14} />
                        </button>
                        <button
                          onClick={() => setEditProduct(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: `${Colors.info}18`,
                            color: Colors.info,
                            border: `1px solid ${Colors.info}40`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = Colors.info;
                            e.currentTarget.style.color = Colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `${Colors.info}18`;
                            e.currentTarget.style.color = Colors.info;
                          }}
                        >
                          <Pencil size={14} strokeWidth={2} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(product)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150"
                          style={{
                            background: "#FFF0F3",
                            color: Colors.error,
                            border: "1px solid #FFD0DA",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = Colors.error;
                            e.currentTarget.style.color = Colors.white;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "#FFF0F3";
                            e.currentTarget.style.color = Colors.error;
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

        {/* Table View */}
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
              <table className="w-full min-w-[1200px]">
                <thead>
                  <tr style={{ background: Colors.surfaceAlt }}>
                    {[
                      "#",
                      "Product",
                      "Brand",
                      "Category",
                      "Type",
                      "Specs",
                      "Price",
                      "Stock",
                      "Tags",
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
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <SkeletonRow key={i} />
                    ))
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-16 text-center">
                        <EmptyState inline />
                      </td>
                    </tr>
                  ) : (
                    products.map((product, idx) => {
                      const stock = stockStatus(product);
                      const isPending = pendingOps.has(product._id);
                      return (
                        <tr
                          key={product._id}
                          style={{
                            borderTop: `1px solid ${Colors.divider}`,
                            opacity: isPending ? 0.7 : 1,
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              Colors.primaryLight)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
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
                              {(page - 1) * LIMIT + idx + 1}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <ProductImage
                                images={product.images}
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
                                {product.color && (
                                  <p
                                    className="text-xs"
                                    style={{ color: Colors.textMuted }}
                                  >
                                    {product.color}
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
                            <p
                              className="text-sm"
                              style={{ color: Colors.textSecondary }}
                            >
                              {product.type || "—"}
                            </p>
                          </td>
                          <td className="px-5 py-3.5">
                            {product.specifications &&
                            Object.keys(product.specifications).length > 0 ? (
                              <div className="flex flex-col gap-0.5">
                                {Object.entries(product.specifications)
                                  .slice(0, 2)
                                  .map(([key, val]) => (
                                    <span
                                      key={key}
                                      className="text-xs"
                                      style={{ color: Colors.textSecondary }}
                                    >
                                      {key}: {val}
                                    </span>
                                  ))}
                              </div>
                            ) : (
                              "—"
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            <p
                              className="text-sm font-bold"
                              style={{ color: Colors.primary }}
                            >
                              ₹{product.sellingPrice}
                            </p>
                            {product.originalPrice &&
                              product.originalPrice > product.sellingPrice && (
                                <p
                                  className="text-xs line-through"
                                  style={{ color: Colors.textMuted }}
                                >
                                  ₹{product.originalPrice}
                                </p>
                              )}
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
                              {product.tags?.slice(0, 2).map((tagId) => (
                                <TagBadge key={tagId} tagId={tagId} />
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() =>
                                handleFastMovingToggle(product._id)
                              }
                              disabled={isPending}
                              style={{
                                color: product.isFastMoving
                                  ? Colors.info
                                  : Colors.textMuted,
                                cursor: isPending ? "not-allowed" : "pointer",
                              }}
                            >
                              {product.isFastMoving ? (
                                <ToggleRight size={30} strokeWidth={1.5} />
                              ) : (
                                <ToggleLeft size={30} strokeWidth={1.5} />
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <button
                              onClick={() => handleFeaturedToggle(product._id)}
                              disabled={isPending}
                              style={{
                                color: product.isFeatured
                                  ? Colors.warning
                                  : Colors.textMuted,
                                cursor: isPending ? "not-allowed" : "pointer",
                              }}
                            >
                              {product.isFeatured ? (
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
                                  e.currentTarget.style.background =
                                    Colors.info;
                                  e.currentTarget.style.color = Colors.white;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = `${Colors.info}18`;
                                  e.currentTarget.style.color = Colors.info;
                                }}
                              >
                                <Pencil size={13} strokeWidth={2} /> Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(product)}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150"
                                style={{
                                  background: "#FFF0F3",
                                  color: Colors.error,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    Colors.error;
                                  e.currentTarget.style.color = Colors.white;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "#FFF0F3";
                                  e.currentTarget.style.color = Colors.error;
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

            {/* Pagination */}
            {!loading && products.length > 0 && (
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
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      background:
                        page <= 1 ? Colors.surfaceAlt : Colors.surface,
                      color: page <= 1 ? Colors.textMuted : Colors.textPrimary,
                      border: `1.5px solid ${Colors.border}`,
                      opacity: page <= 1 ? 0.5 : 1,
                      cursor: page <= 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pg =
                      Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
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
                          color:
                            pg === page ? Colors.white : Colors.textSecondary,
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
                    className="px-4 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      background:
                        page >= totalPages ? Colors.surfaceAlt : Colors.surface,
                      color:
                        page >= totalPages
                          ? Colors.textMuted
                          : Colors.textPrimary,
                      border: `1.5px solid ${Colors.border}`,
                      opacity: page >= totalPages ? 0.5 : 1,
                      cursor: page >= totalPages ? "not-allowed" : "pointer",
                    }}
                  >
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
            <button
              onClick={() => fetchProducts(page - 1)}
              disabled={page <= 1}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: Colors.surface,
                color: page <= 1 ? Colors.textMuted : Colors.textPrimary,
                border: `1.5px solid ${Colors.border}`,
                opacity: page <= 1 ? 0.5 : 1,
                cursor: page <= 1 ? "not-allowed" : "pointer",
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
                  className="w-8 h-8 rounded-xl text-xs font-bold"
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
              disabled={page >= totalPages}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold"
              style={{
                background: Colors.surface,
                color:
                  page >= totalPages ? Colors.textMuted : Colors.textPrimary,
                border: `1.5px solid ${Colors.border}`,
                opacity: page >= totalPages ? 0.5 : 1,
                cursor: page >= totalPages ? "not-allowed" : "pointer",
              }}
            >
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
        * { scrollbar-width: thin; scrollbar-color: ${Colors.border} transparent; }
      `}</style>
    </>
  );
}
