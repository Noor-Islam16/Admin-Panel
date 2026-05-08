import { useState, useEffect, useCallback, useRef } from "react";
import {
  Package,
  Search,
  LayoutGrid,
  LayoutList,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  ChevronDown,
  Tag,
  IndianRupee,
  AlignLeft,
  CheckCircle2,
  ImageOff,
  Filter,
  RefreshCw,
  Smartphone,
  Boxes,
  Plus,
} from "lucide-react";
import Colors from "../constants/colors";
import { CATEGORIES } from "../constants/products";
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

// ── Product Image ─────────────────────────────────────────────────────────────
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
      {Array.from({ length: 8 }).map((_, i) => (
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

// ── Edit Modal (FULLY FIXED with Image Management) ────────────────────────────
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
    sellingPrice: String(product.sellingPrice),
    originalPrice:
      product.originalPrice != null ? String(product.originalPrice) : "",
    stockQuantity: String(product.stockQuantity),
    minOrderQuantity: String(product.minOrderQuantity),
    description: product.description ?? "",
  });
  const [focused, setFocused] = useState("");
  const [saving, setSaving] = useState(false);

  // Image management - use a single source of truth
  const [allImages, setAllImages] = useState<
    Array<{
      id: string; // unique identifier
      url: string; // display URL
      publicId?: string; // Cloudinary public ID (only for existing)
      isPrimary: boolean;
      isNew: boolean; // true if newly added file
      file?: File; // the actual File object for new images
    }>
  >(() => {
    // Initialize from existing product images
    return (product.images || []).map((img, index) => ({
      id: img.publicId || `existing-${index}`,
      url: img.url,
      publicId: img.publicId,
      isPrimary: img.isPrimary,
      isNew: false,
    }));
  });

  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);
  const imageRef = useRef<HTMLInputElement>(null);

  const set = (key: keyof typeof form, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // ── Add new images ───────────────────────────────────────────────────────
  const handleAddImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentCount = allImages.length - deletedPublicIds.length;
    if (currentCount + files.length > 8) {
      alert("Maximum 8 images allowed");
      return;
    }

    const newImages = files.map((file, index) => ({
      id: `new-${Date.now()}-${index}`,
      url: URL.createObjectURL(file),
      isPrimary: allImages.length === 0 && deletedPublicIds.length === 0, // First image if no others
      isNew: true,
      file: file,
    }));

    setAllImages((prev) => [...prev, ...newImages]);
    // Reset input
    if (imageRef.current) imageRef.current.value = "";
  };

  // ── Remove an image ─────────────────────────────────────────────────────
  const handleRemoveImage = (imageId: string) => {
    const image = allImages.find((img) => img.id === imageId);
    if (!image) return;

    // Check if we'd have at least 1 image remaining
    const remainingCount = allImages.filter(
      (img) =>
        img.id !== imageId && !deletedPublicIds.includes(img.publicId || ""),
    ).length;

    if (remainingCount < 1) {
      alert("Product must have at least one image");
      return;
    }

    if (image.isNew) {
      // Revoke object URL to prevent memory leak
      if (image.url.startsWith("blob:")) {
        URL.revokeObjectURL(image.url);
      }
      // Remove from allImages
      setAllImages((prev) => prev.filter((img) => img.id !== imageId));
    } else if (image.publicId) {
      // Mark for deletion
      setDeletedPublicIds((prev) => [...prev, image.publicId!]);
    }

    // If removed image was primary, set first remaining as primary
    if (image.isPrimary) {
      setAllImages((prev) => {
        const remaining = prev.filter(
          (img) =>
            img.id !== imageId &&
            (!image.publicId || !deletedPublicIds.includes(image.publicId)),
        );
        if (remaining.length > 0 && !image.isNew) {
          // Find first non-deleted image to make primary
          const newPrimary = prev.find(
            (img) =>
              img.id !== imageId &&
              (!img.publicId || !deletedPublicIds.includes(img.publicId)),
          );
          if (newPrimary) {
            return prev.map((img) => ({
              ...img,
              isPrimary: img.id === newPrimary.id,
            }));
          }
        }
        return remaining;
      });
    }
  };

  // ── Set image as primary ────────────────────────────────────────────────
  const handleSetPrimary = (imageId: string) => {
    setAllImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === imageId,
      })),
    );
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("category", form.category);
      fd.append("sellingPrice", form.sellingPrice);
      fd.append("stockQuantity", form.stockQuantity);
      fd.append("minOrderQuantity", form.minOrderQuantity);
      if (form.brand.trim()) fd.append("brand", form.brand.trim());
      if (form.originalPrice) fd.append("originalPrice", form.originalPrice);
      if (form.description.trim())
        fd.append("description", form.description.trim());

      // Send deleted image IDs
      if (deletedPublicIds.length > 0) {
        fd.append("deletedImages", JSON.stringify(deletedPublicIds));
      }

      // Send updated primary image info for existing images
      const existingPrimary = allImages.find(
        (img) => !img.isNew && img.isPrimary,
      );
      if (existingPrimary?.publicId) {
        fd.append("primaryImageId", existingPrimary.publicId);
      }

      // Send existing images order (for reordering if needed)
      const existingImageIds = allImages
        .filter((img) => !img.isNew && img.publicId)
        .map((img) => img.publicId);
      fd.append("imageOrder", JSON.stringify(existingImageIds));

      // Append new image files
      const newFiles = allImages.filter((img) => img.isNew && img.file);
      newFiles.forEach((img, _index) => {
        fd.append("images", img.file!, img.file!.name);
      });

      // If first new image should be primary
      if (newFiles.length > 0) {
        const hasExistingImages = allImages.some(
          (img) => !img.isNew && !deletedPublicIds.includes(img.publicId || ""),
        );
        if (!hasExistingImages && newFiles[0].isPrimary) {
          fd.append("firstNewIsPrimary", "true");
        }
      }

      const res = await ProductAPI.update(product._id, fd);
      onSave(res.data);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to update product.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-transparent pl-10 pr-4 py-3 text-sm outline-none";
  const inputStyle = { color: Colors.textPrimary };

  // Get visible images
  const visibleImages = allImages.filter(
    (img) => img.isNew || !deletedPublicIds.includes(img.publicId || ""),
  );

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
            <p className="text-base font-bold text-white">Edit Product</p>
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
          {/* ═══ IMAGE MANAGEMENT ═══ */}
          <div
            className="rounded-2xl p-4"
            style={{
              background: Colors.surfaceAlt,
              border: `1.5px solid ${Colors.border}`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <FieldLabel>Product Images ({visibleImages.length}/8)</FieldLabel>
              {visibleImages.length < 8 && (
                <>
                  <button
                    onClick={() => imageRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{
                      background: Colors.primaryLight,
                      color: Colors.primary,
                      border: `1px solid ${Colors.accentLight}`,
                    }}
                  >
                    <Plus size={14} strokeWidth={2.5} /> Add Images
                  </button>
                  <input
                    ref={imageRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleAddImages}
                  />
                </>
              )}
            </div>

            {visibleImages.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {visibleImages.map((img) => (
                  <div key={img.id} className="relative group">
                    {/* Image container */}
                    <div
                      className="relative rounded-xl overflow-hidden aspect-square cursor-pointer transition-all duration-200"
                      style={{
                        border: `2px solid ${img.isPrimary ? Colors.primary : img.isNew ? Colors.warning : Colors.border}`,
                        boxShadow: img.isPrimary
                          ? `0 0 0 2px ${Colors.primaryLight}`
                          : "none",
                      }}
                      onClick={() => handleSetPrimary(img.id)}
                    >
                      <img
                        src={img.url}
                        alt={`Product image`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback for broken images
                          (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='%23999' font-size='12'%3ENo Img%3C/text%3E%3C/svg%3E";
                        }}
                      />

                      {/* Badges */}
                      {img.isPrimary && (
                        <span
                          className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                          style={{
                            background: Colors.primary,
                            color: Colors.white,
                          }}
                        >
                          Primary
                        </span>
                      )}
                      {img.isNew && (
                        <span
                          className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold"
                          style={{
                            background: Colors.warning,
                            color: Colors.white,
                          }}
                        >
                          New
                        </span>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                        <span className="text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center px-1">
                          {img.isPrimary ? "Primary Image" : "Set as Primary"}
                        </span>
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(img.id);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
                      style={{ background: Colors.error, color: Colors.white }}
                      title="Remove image"
                    >
                      <X size={10} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <button
                onClick={() => imageRef.current?.click()}
                className="w-full py-8 rounded-xl flex flex-col items-center justify-center gap-2 transition-all border-2 border-dashed"
                style={{
                  borderColor: Colors.border,
                  background: Colors.surface,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = Colors.primary;
                  e.currentTarget.style.background = Colors.primaryLight;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = Colors.border;
                  e.currentTarget.style.background = Colors.surface;
                }}
              >
                <ImageOff
                  size={28}
                  color={Colors.textMuted}
                  strokeWidth={1.5}
                />
                <span
                  className="text-xs font-semibold"
                  style={{ color: Colors.textMuted }}
                >
                  Click to add images
                </span>
              </button>
            )}

            <p
              className="text-[10px] mt-2 text-center"
              style={{ color: Colors.textMuted }}
            >
              Click image to set as primary · Green border = primary · Yellow
              border = new (unsaved)
            </p>
          </div>

          {/* ═══ PRODUCT DETAILS ═══ */}
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
              <InputBox focused={focused === "brand"} icon={Tag}>
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

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <FieldLabel>Category *</FieldLabel>
            <InputBox focused={focused === "cat"} icon={Boxes}>
              <select
                className="w-full bg-transparent pl-10 pr-8 py-3 text-sm outline-none appearance-none cursor-pointer"
                style={{ color: Colors.textPrimary }}
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
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

          {/* Price + Original Price */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Selling Price (₹) *</FieldLabel>
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

          {/* Stock + Min Order Qty */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <FieldLabel>Stock Quantity *</FieldLabel>
              <InputBox focused={focused === "stock"} icon={Boxes}>
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
              <InputBox focused={focused === "minOrderQty"} icon={Boxes}>
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
  const [pendingOps] = useState<Set<string>>(new Set());
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

  // const markPending = (id: string) => setPendingOps((s) => new Set(s).add(id));
  // const clearPending = (id: string) =>
  //   setPendingOps((s) => {
  //     const n = new Set(s);
  //     n.delete(id);
  //     return n;
  //   });

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
                <LayoutGrid size={15} strokeWidth={2} /> Grid
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
                <LayoutList size={15} strokeWidth={2} /> Table
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
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
                        <span
                          className="text-xs font-medium px-2 py-0.5 rounded-lg w-fit"
                          style={{
                            background: Colors.primaryLight,
                            color: Colors.primary,
                          }}
                        >
                          {CATEGORIES.find((c) => c.id === product.category)
                            ?.name || product.category}
                        </span>
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
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr style={{ background: Colors.surfaceAlt }}>
                    {[
                      "#",
                      "Product",
                      "Brand",
                      "Category",
                      "Price",
                      "Stock",
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
                      <td colSpan={7} className="py-16 text-center">
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
                              <p
                                className="text-sm font-semibold"
                                style={{ color: Colors.textPrimary }}
                              >
                                {product.name}
                              </p>
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
