import * as XLSX from "xlsx";
import { useState, useRef, useCallback } from "react";
import {
  PackagePlus,
  Upload,
  FileSpreadsheet,
  Tag,
  IndianRupee,
  AlignLeft,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Trash2,
  ChevronDown,
  Image as ImageIcon,
  Smartphone,
  Boxes,
  Plus,
  ImagePlus,
} from "lucide-react";
import Colors from "../constants/colors";
import { CATEGORIES } from "../constants/products";
import { ProductAPI } from "../config/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProductForm {
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  stock: string;
  minOrderQty: string;
  description: string;
}

interface BulkRowImage {
  file: File;
  preview: string;
  isPrimary: boolean;
}

interface BulkRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  description: string;
  min_order_qty: string;
  stock: string;
  status: "valid" | "error";
  error?: string;
  images: BulkRowImage[];
  expanded: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  brand: "",
  category: "",
  price: "",
  originalPrice: "",
  stock: "",
  minOrderQty: "1",
  description: "",
};

// ── Shared UI Components ──────────────────────────────────────────────────────
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

function InputWrapper({
  focused,
  children,
}: {
  focused: boolean;
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
      {children}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
      style={{
        background: active
          ? `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`
          : Colors.surface,
        color: active ? Colors.white : Colors.textSecondary,
        border: `1.5px solid ${active ? "transparent" : Colors.border}`,
        boxShadow: active ? `0 4px 14px rgba(0,168,132,0.3)` : "none",
      }}
    >
      <Icon size={17} strokeWidth={2} />
      {label}
    </button>
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
        <AlertCircle size={18} color={Colors.error} strokeWidth={2.5} />
      )}
      {message}
      <button
        onClick={onClose}
        style={{ color: Colors.textMuted, marginLeft: 4 }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="animate-spin"
      width="18"
      height="18"
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

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════════════
export default function AddProducts() {
  const [tab, setTab] = useState<"single" | "bulk">("single");
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [focused, setFocused] = useState<string>("");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Multiple images for single product
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Bulk
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkUploadResult, setBulkUploadResult] = useState<any>(null);
  const bulkFileRef = useRef<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const set = (key: keyof ProductForm, value: any) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Single Product Image Handlers ──────────────────────────────────────────
  const handleImageFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (imageFiles.length + files.length > 8) {
      showToast("error", "Maximum 8 images allowed");
      return;
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  // ── Single Submit ──────────────────────────────────────────────────────────
  const validateSingle = (): string | null => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.category) return "Please select a category.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      return "Enter a valid selling price.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      return "Enter a valid stock quantity.";
    return null;
  };

  const handleSingleSubmit = async () => {
    const err = validateSingle();
    if (err) {
      showToast("error", err);
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name.trim());
      fd.append("category", form.category);
      fd.append("sellingPrice", form.price);
      fd.append("stockQuantity", form.stock);
      fd.append("minOrderQuantity", form.minOrderQty);
      if (form.brand.trim()) fd.append("brand", form.brand.trim());
      if (form.originalPrice) fd.append("originalPrice", form.originalPrice);
      if (form.description.trim())
        fd.append("description", form.description.trim());
      imageFiles.forEach((file) => fd.append("images", file));

      await ProductAPI.addSingle(fd);
      showToast("success", `"${form.name}" added successfully!`);
      setForm(EMPTY_FORM);
      clearAllImages();
    } catch (e) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Failed to add product.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ── Bulk Handlers ──────────────────────────────────────────────────────────
  const parseFile = useCallback((file: File) => {
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const data = new Uint8Array(ev.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows = XLSX.utils.sheet_to_json<Record<string, string>>(
          sheet,
          {
            defval: "",
            raw: false,
          },
        );
        buildBulkRows(rawRows);
      };
      reader.readAsArrayBuffer(file); // ← correct for binary xlsx
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = (ev.target?.result as string).replace(/^\uFEFF/, ""); // strip BOM
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) return;

        // Auto-detect delimiter
        const firstLine = lines[0];
        const delimiter =
          (firstLine.match(/;/g) || []).length >
          (firstLine.match(/,/g) || []).length
            ? ";"
            : ",";

        const headers = firstLine
          .split(delimiter)
          .map((h) => h.trim().replace(/^"|"$/g, ""));
        const rawRows = lines.slice(1).map((line) => {
          const vals = line
            .split(delimiter)
            .map((v) => v.trim().replace(/^"|"$/g, ""));
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => {
            obj[h] = vals[i] ?? "";
          });
          return obj;
        });
        buildBulkRows(rawRows);
      };
      reader.readAsText(file);
    }
  }, []);

  // ── normalize keys + build BulkRow[] ─────────────────────────────────────────
  const buildBulkRows = useCallback((rawRows: Record<string, string>[]) => {
    const rows: BulkRow[] = rawRows.map((raw, i) => {
      // Normalize keys: "Name" → "name", "Original Price" → "original_price"
      const obj: Record<string, string> = {};
      Object.keys(raw).forEach((key) => {
        const normalized = key
          .replace(/^\uFEFF/, "") // BOM on first key
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        obj[normalized] = String(raw[key] ?? "")
          .trim()
          .replace(/^[₹$€£¥]+/, "") // strip currency symbols
          .replace(/^"|"$/g, ""); // strip stray quotes
      });

      // Normalize numeric fields (remove thousand separators like "1,499")
      ["price", "original_price", "stock", "min_order_qty"].forEach((f) => {
        if (obj[f]) obj[f] = obj[f].replace(/,/g, "").replace(/\.0+$/, "");
      });

      const hasError =
        !obj["name"] || !obj["price"] || !obj["stock"] || !obj["category"];
      return {
        id: String(i),
        name: obj["name"] ?? "",
        brand: obj["brand"] ?? "",
        category: obj["category"] ?? "",
        price: obj["price"] ?? "",
        originalPrice: obj["original_price"] ?? "",
        description: obj["description"] ?? "",
        min_order_qty: obj["min_order_qty"] ?? "1",
        stock: obj["stock"] ?? "",
        status: hasError ? "error" : "valid",
        error: hasError
          ? !obj["name"]
            ? "Name missing"
            : !obj["price"]
              ? "Price missing"
              : !obj["stock"]
                ? "Stock missing"
                : "Category missing"
          : undefined,
        images: [],
        expanded: false,
      };
    });
    setBulkRows(rows);
    setBulkUploadResult(null);
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.match(/\.(csv|xlsx|xls)$/i)) {
        showToast("error", "Please upload a .csv, .xlsx, or .xls file.");
        return;
      }
      bulkFileRef.current = file;
      parseFile(file); // ← was: reader.readAsText → parseCsv
    },
    [parseFile],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    bulkFileRef.current = file;
    parseFile(file); // ← was: reader.readAsText → parseCsv
  };

  // ── Bulk Row Image Management ─────────────────────────────────────────────
  const toggleRowExpand = (rowId: string) => {
    setBulkRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, expanded: !r.expanded } : r)),
    );
  };

  const addImagesToRow = (rowId: string, files: FileList) => {
    const newImages: BulkRowImage[] = Array.from(files).map((file, _index) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: false,
    }));
    setBulkRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const totalImages = r.images.length + newImages.length;
        if (totalImages > 8) {
          showToast("error", "Maximum 8 images per product");
          return r;
        }
        // Make first image primary if no images exist
        if (r.images.length === 0 && newImages.length > 0) {
          newImages[0].isPrimary = true;
        }
        return { ...r, images: [...r.images, ...newImages], expanded: true };
      }),
    );
  };

  const removeBulkImage = (rowId: string, imageIndex: number) => {
    setBulkRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        const image = r.images[imageIndex];
        URL.revokeObjectURL(image.preview);
        const newImages = r.images.filter((_, i) => i !== imageIndex);
        // If removed image was primary, set first remaining as primary
        if (image.isPrimary && newImages.length > 0) {
          newImages[0].isPrimary = true;
        }
        return { ...r, images: newImages };
      }),
    );
  };

  const setBulkImagePrimary = (rowId: string, imageIndex: number) => {
    setBulkRows((prev) =>
      prev.map((r) => {
        if (r.id !== rowId) return r;
        return {
          ...r,
          images: r.images.map((img, i) => ({
            ...img,
            isPrimary: i === imageIndex,
          })),
        };
      }),
    );
  };

  const removeRow = (id: string) => {
    // Clean up image previews
    const row = bulkRows.find((r) => r.id === id);
    if (row) {
      row.images.forEach((img) => URL.revokeObjectURL(img.preview));
    }
    setBulkRows((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Bulk Submit ───────────────────────────────────────────────────────────
  // ── Bulk Submit (with per-product image upload) ──────────────────────────────
  const handleBulkSubmit = async () => {
    const validRows = bulkRows.filter((r) => r.status === "valid");
    if (validRows.length === 0) {
      showToast("error", "No valid rows to upload.");
      return;
    }

    setBulkSubmitting(true);
    setBulkUploadResult(null);

    let successCount = 0;
    let failedCount = 0;
    const failedRows: { row: number; errors: unknown }[] = [];

    try {
      // Upload each valid product individually with its images
      for (let i = 0; i < validRows.length; i++) {
        const row = validRows[i];
        try {
          const fd = new FormData();
          fd.append("name", row.name.trim());
          fd.append("category", row.category);
          fd.append("sellingPrice", row.price);
          fd.append("stockQuantity", row.stock);
          fd.append("minOrderQuantity", row.min_order_qty || "1");
          if (row.brand.trim()) fd.append("brand", row.brand.trim());
          if (row.originalPrice) fd.append("originalPrice", row.originalPrice);
          if (row.description.trim())
            fd.append("description", row.description.trim());

          // Append images for this product
          if (row.images.length > 0) {
            row.images.forEach((img, _imgIndex) => {
              fd.append("images", img.file, img.file.name);
            });

            // Mark primary image
            const primaryIndex = row.images.findIndex((img) => img.isPrimary);
            if (primaryIndex >= 0) {
              // The first image sent will be primary by default in the backend
              // If primary is not the first, we'd need backend support
            }
          }

          console.log(
            `📤 Uploading product ${i + 1}/${validRows.length}: ${row.name}`,
          );
          await ProductAPI.addSingle(fd);
          successCount++;
          console.log(`✅ Product ${i + 1} uploaded: ${row.name}`);
        } catch (err: any) {
          failedCount++;
          failedRows.push({
            row: parseInt(row.id) + 2, // +2 for header and 0-index
            errors: err.message || "Upload failed",
          });
          console.error(`❌ Failed to upload row ${row.id}:`, err);
        }
      }

      setBulkUploadResult({ successCount, failedCount, failedRows });

      if (failedCount === 0) {
        showToast(
          "success",
          `All ${successCount} products uploaded successfully!`,
        );
        // Clean up
        bulkRows.forEach((r) =>
          r.images.forEach((img) => URL.revokeObjectURL(img.preview)),
        );
        setBulkRows([]);
        bulkFileRef.current = null;
      } else if (successCount > 0) {
        showToast(
          "success",
          `${successCount} uploaded, ${failedCount} failed — see details below.`,
        );
      } else {
        showToast("error", `All ${failedCount} rows failed to upload.`);
      }
    } catch (e) {
      showToast(
        "error",
        e instanceof Error ? e.message : "Bulk upload failed.",
      );
    } finally {
      setBulkSubmitting(false);
    }
  };

  // ── Download Template (no image_urls) ──────────────────────────────────────
  const downloadTemplate = () => {
    const csv = `name,brand,category,price,original_price,stock,min_order_qty,description\nUSB-C Fast Charging Cable,Anker,charging-cables,599,999,100,2,"Fast charging USB-C cable with 60W PD support"\nWireless Bluetooth Earbuds,boAt,headphones-earphones,1499,2990,50,1,"True wireless earbuds with ENC"\n20W PD Wall Charger,Spigen,chargers-adapters,799,1299,200,1,"Compact 20W PD fast charger"`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "electronics_products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const inputClass =
    "w-full bg-transparent pl-10 pr-4 py-3.5 text-sm outline-none";
  const inputStyle = { color: Colors.textPrimary };

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
        <div className="flex items-center gap-2">
          <Smartphone size={20} color={Colors.primary} strokeWidth={2} />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: Colors.textPrimary }}
            >
              Add Electronics Accessories
            </h1>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Add mobile & tech accessories via single or bulk upload
            </p>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-3">
          <TabBtn
            active={tab === "single"}
            onClick={() => setTab("single")}
            icon={PackagePlus}
            label="Single Product"
          />
          <TabBtn
            active={tab === "bulk"}
            onClick={() => setTab("bulk")}
            icon={FileSpreadsheet}
            label="Bulk Upload (Excel/CSV)"
          />
        </div>

        {/* ═══ TAB: SINGLE PRODUCT ═══ */}
        {tab === "single" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              className="lg:col-span-2 rounded-3xl p-6 flex flex-col gap-5"
              style={{
                background: Colors.surface,
                border: `1px solid ${Colors.border}`,
                boxShadow: `0 4px 16px ${Colors.shadow}`,
              }}
            >
              <p
                className="text-sm font-bold"
                style={{ color: Colors.textPrimary }}
              >
                Product Details
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Product Name *</FieldLabel>
                  <InputWrapper focused={focused === "name"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "name"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Tag size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. USB-C Fast Charging Cable"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Brand</FieldLabel>
                  <InputWrapper focused={focused === "brand"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "brand"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Tag size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. Anker, boAt, Spigen"
                      value={form.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      onFocus={() => setFocused("brand")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Category *</FieldLabel>
                <InputWrapper focused={focused === "category"}>
                  <div
                    className="absolute left-3.5"
                    style={{
                      color:
                        focused === "category"
                          ? Colors.primary
                          : Colors.textMuted,
                    }}
                  >
                    <Boxes size={17} strokeWidth={2} />
                  </div>
                  <select
                    className={`${inputClass} appearance-none cursor-pointer`}
                    style={{
                      color: form.category
                        ? Colors.textPrimary
                        : Colors.textMuted,
                      background: "transparent",
                    }}
                    value={form.category}
                    onChange={(e) => set("category", e.target.value)}
                    onFocus={() => setFocused("category")}
                    onBlur={() => setFocused("")}
                  >
                    <option value="" disabled>
                      Select category
                    </option>
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </option>
                    ))}
                  </select>
                  <div
                    className="absolute right-3.5 pointer-events-none"
                    style={{ color: Colors.textMuted }}
                  >
                    <ChevronDown size={16} />
                  </div>
                </InputWrapper>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Selling Price (₹) *</FieldLabel>
                  <InputWrapper focused={focused === "price"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "price"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <IndianRupee size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                      onFocus={() => setFocused("price")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Original Price / MRP (₹)</FieldLabel>
                  <InputWrapper focused={focused === "originalPrice"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "originalPrice"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <IndianRupee size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      type="number"
                      min="0"
                      placeholder="0.00"
                      value={form.originalPrice}
                      onChange={(e) => set("originalPrice", e.target.value)}
                      onFocus={() => setFocused("originalPrice")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Stock Quantity *</FieldLabel>
                  <InputWrapper focused={focused === "stock"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "stock"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Boxes size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      type="number"
                      min="0"
                      placeholder="e.g. 50"
                      value={form.stock}
                      onChange={(e) => set("stock", e.target.value)}
                      onFocus={() => setFocused("stock")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Min Order Quantity</FieldLabel>
                  <InputWrapper focused={focused === "minOrderQty"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "minOrderQty"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Boxes size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      type="number"
                      min="1"
                      placeholder="1"
                      value={form.minOrderQty}
                      onChange={(e) => set("minOrderQty", e.target.value)}
                      onFocus={() => setFocused("minOrderQty")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Description</FieldLabel>
                <div
                  className="rounded-2xl transition-all duration-200 overflow-hidden relative"
                  style={{
                    background:
                      focused === "desc"
                        ? Colors.primaryLight
                        : Colors.surfaceAlt,
                    border: `1.5px solid ${focused === "desc" ? Colors.borderFocus : Colors.border}`,
                  }}
                >
                  <div
                    className="flex items-start pt-3.5 pl-3.5 pointer-events-none absolute"
                    style={{
                      color:
                        focused === "desc" ? Colors.primary : Colors.textMuted,
                    }}
                  >
                    <AlignLeft size={17} strokeWidth={2} />
                  </div>
                  <textarea
                    rows={3}
                    className="w-full bg-transparent pl-10 pr-4 py-3.5 text-sm outline-none resize-none"
                    style={{ color: Colors.textPrimary }}
                    placeholder="Brief product description..."
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    onFocus={() => setFocused("desc")}
                    onBlur={() => setFocused("")}
                  />
                </div>
              </div>

              {/* Single Product Images */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel>Product Images (Max 8)</FieldLabel>
                  <span className="text-xs" style={{ color: Colors.textMuted }}>
                    {imageFiles.length}/8
                  </span>
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  multiple
                  onChange={handleImageFilesChange}
                />
                {imagePreviews.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-4 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div
                          key={index}
                          className="relative rounded-xl overflow-hidden aspect-square"
                          style={{
                            border: `2px solid ${index === 0 ? Colors.primary : Colors.border}`,
                          }}
                        >
                          <img
                            src={preview}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <span
                              className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-xs font-bold"
                              style={{
                                background: Colors.primary,
                                color: Colors.white,
                              }}
                            >
                              Primary
                            </span>
                          )}
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 p-1 rounded-full"
                            style={{
                              background: "rgba(0,0,0,0.5)",
                              color: Colors.white,
                            }}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                      {imageFiles.length < 8 && (
                        <button
                          onClick={() => imageInputRef.current?.click()}
                          className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all"
                          style={{
                            background: Colors.surfaceAlt,
                            border: `2px dashed ${Colors.border}`,
                          }}
                        >
                          <Plus size={20} color={Colors.textMuted} />
                          <span
                            className="text-xs"
                            style={{ color: Colors.textMuted }}
                          >
                            Add More
                          </span>
                        </button>
                      )}
                    </div>
                    <button
                      onClick={clearAllImages}
                      className="text-xs font-semibold self-end flex items-center gap-1 px-3 py-1.5 rounded-lg"
                      style={{ color: Colors.error }}
                    >
                      <Trash2 size={12} /> Clear All Images
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 rounded-2xl py-8 transition-all duration-200"
                    style={{
                      background: Colors.surfaceAlt,
                      border: `2px dashed ${Colors.border}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = Colors.borderFocus;
                      e.currentTarget.style.background = Colors.primaryLight;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = Colors.border;
                      e.currentTarget.style.background = Colors.surfaceAlt;
                    }}
                  >
                    <ImageIcon
                      size={28}
                      color={Colors.textMuted}
                      strokeWidth={1.5}
                    />
                    <p className="text-sm" style={{ color: Colors.textMuted }}>
                      Click to upload images{" "}
                      <span style={{ color: Colors.primary, fontWeight: 600 }}>
                        (.jpg, .png, .webp)
                      </span>
                    </p>
                    <p className="text-xs" style={{ color: Colors.textMuted }}>
                      First image will be set as primary
                    </p>
                  </button>
                )}
              </div>

              <button
                onClick={handleSingleSubmit}
                disabled={submitting}
                className="w-full py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 mt-1"
                style={{
                  background: submitting
                    ? Colors.primaryDark
                    : `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                  color: Colors.white,
                  boxShadow: `0 8px 24px rgba(0,168,132,0.3)`,
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.85 : 1,
                }}
              >
                {submitting ? (
                  <>
                    <Spinner /> Saving Product…
                  </>
                ) : (
                  <>
                    <PackagePlus size={18} strokeWidth={2} /> Add Product
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ═══ TAB: BULK UPLOAD ═══ */}
        {tab === "bulk" && (
          <div className="flex flex-col gap-5">
            <div
              className="rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{
                background: Colors.primaryLight,
                border: `1px solid ${Colors.accentLight}`,
              }}
            >
              <div className="flex flex-col gap-1">
                <p
                  className="text-sm font-bold"
                  style={{ color: Colors.accent }}
                >
                  📋 How Bulk Upload Works
                </p>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: Colors.textSecondary }}
                >
                  Download CSV template → fill products → upload →{" "}
                  <strong>add images below each product</strong>. Required:{" "}
                  <strong>name</strong>, <strong>category</strong>,{" "}
                  <strong>price</strong>, <strong>stock</strong>.
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                  color: Colors.white,
                  boxShadow: `0 4px 12px rgba(0,168,132,0.3)`,
                }}
              >
                <Download size={16} strokeWidth={2} /> Download Template
              </button>
            </div>

            <div
              className="rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200"
              style={{
                minHeight: 180,
                background: dragOver ? Colors.primaryLight : Colors.surface,
                border: `2px dashed ${dragOver ? Colors.borderFocus : Colors.border}`,
                boxShadow: `0 4px 16px ${Colors.shadow}`,
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                className="hidden"
                onChange={handleFileInput}
              />
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: dragOver ? Colors.primary : Colors.surfaceAlt,
                }}
              >
                <Upload
                  size={26}
                  color={dragOver ? Colors.white : Colors.textMuted}
                  strokeWidth={1.8}
                />
              </div>
              <div className="text-center">
                <p
                  className="text-sm font-semibold"
                  style={{ color: Colors.textPrimary }}
                >
                  {dragOver
                    ? "Drop it here!"
                    : "Drag & drop your CSV / Excel file"}
                </p>
                <p className="text-xs mt-1" style={{ color: Colors.textMuted }}>
                  or{" "}
                  <span style={{ color: Colors.primary, fontWeight: 600 }}>
                    click to browse
                  </span>{" "}
                  — .csv, .xlsx or .xls
                </p>
                {bulkFileRef.current && (
                  <p
                    className="text-xs mt-2 font-semibold"
                    style={{ color: Colors.primary }}
                  >
                    📄 {bulkFileRef.current.name}
                  </p>
                )}
              </div>
            </div>

            {bulkUploadResult && bulkUploadResult.failedCount > 0 && (
              <div
                className="rounded-2xl p-4 flex flex-col gap-2"
                style={{ background: "#FFF5F6", border: `1px solid #FFD0DA` }}
              >
                <p
                  className="text-sm font-bold"
                  style={{ color: Colors.error }}
                >
                  ⚠️ {bulkUploadResult.failedCount} row
                  {bulkUploadResult.failedCount > 1 ? "s" : ""} failed on server
                </p>
                <div className="flex flex-col gap-1 max-h-40 overflow-y-auto">
                  {bulkUploadResult.failedRows?.map((fr: any, i: number) => (
                    <p
                      key={i}
                      className="text-xs"
                      style={{ color: Colors.textSecondary }}
                    >
                      Row {fr.row}:{" "}
                      {typeof fr.errors === "object"
                        ? Object.entries(fr.errors)
                            .map(
                              ([field, msgs]) =>
                                `${field}: ${(msgs as string[]).join(", ")}`,
                            )
                            .join(" | ")
                        : JSON.stringify(fr.errors)}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {bulkRows.length > 0 && (
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
                  style={{ borderBottom: `1px solid ${Colors.divider}` }}
                >
                  <div className="flex items-center gap-3">
                    <p
                      className="text-sm font-bold"
                      style={{ color: Colors.textPrimary }}
                    >
                      {bulkRows.length} rows parsed
                    </p>
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-semibold"
                      style={{
                        background: Colors.primaryLight,
                        color: Colors.primary,
                      }}
                    >
                      {bulkRows.filter((r) => r.status === "valid").length}{" "}
                      valid
                    </span>
                    {bulkRows.some((r) => r.status === "error") && (
                      <span
                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                        style={{ background: "#FFF0F3", color: Colors.error }}
                      >
                        {bulkRows.filter((r) => r.status === "error").length}{" "}
                        errors
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      bulkRows.forEach((r) =>
                        r.images.forEach((img) =>
                          URL.revokeObjectURL(img.preview),
                        ),
                      );
                      setBulkRows([]);
                      setBulkUploadResult(null);
                      bulkFileRef.current = null;
                    }}
                    className="text-xs font-medium flex items-center gap-1"
                    style={{ color: Colors.textMuted }}
                  >
                    <X size={14} /> Clear
                  </button>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr style={{ background: Colors.surfaceAlt }}>
                        {[
                          "",
                          "Name",
                          "Brand",
                          "Category",
                          "Price",
                          "Stock",
                          "Images",
                          "",
                        ].map((h) => (
                          <th
                            key={h}
                            className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                            style={{ color: Colors.textSecondary }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bulkRows.map((row) => (
                        <>
                          <tr
                            key={row.id}
                            style={{
                              borderTop: `1px solid ${Colors.divider}`,
                              background:
                                row.status === "error"
                                  ? "#FFF5F6"
                                  : "transparent",
                            }}
                          >
                            <td className="px-4 py-3">
                              {row.status === "valid" ? (
                                <CheckCircle2
                                  size={16}
                                  color={Colors.success}
                                  strokeWidth={2.5}
                                />
                              ) : (
                                <div className="flex items-center gap-1">
                                  <AlertCircle
                                    size={16}
                                    color={Colors.error}
                                    strokeWidth={2.5}
                                  />
                                  <span
                                    className="text-xs"
                                    style={{ color: Colors.error }}
                                  >
                                    {row.error}
                                  </span>
                                </div>
                              )}
                            </td>
                            <td
                              className="px-4 py-3 text-sm font-medium max-w-[180px] truncate"
                              style={{ color: Colors.textPrimary }}
                            >
                              {row.name || "—"}
                            </td>
                            <td
                              className="px-4 py-3 text-sm max-w-[120px] truncate"
                              style={{ color: Colors.textSecondary }}
                            >
                              {row.brand || "—"}
                            </td>
                            <td
                              className="px-4 py-3 text-sm"
                              style={{ color: Colors.textSecondary }}
                            >
                              {row.category || "—"}
                            </td>
                            <td
                              className="px-4 py-3 text-sm font-semibold"
                              style={{ color: Colors.primary }}
                            >
                              {row.price ? `₹${row.price}` : "—"}
                            </td>
                            <td
                              className="px-4 py-3 text-sm"
                              style={{ color: Colors.textSecondary }}
                            >
                              {row.stock || "—"}
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleRowExpand(row.id)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
                                style={{
                                  background:
                                    row.images.length > 0
                                      ? Colors.primaryLight
                                      : Colors.surfaceAlt,
                                  color:
                                    row.images.length > 0
                                      ? Colors.primary
                                      : Colors.textSecondary,
                                  border: `1px solid ${Colors.border}`,
                                }}
                              >
                                <ImagePlus size={14} strokeWidth={2} />
                                {row.images.length > 0
                                  ? `${row.images.length} images`
                                  : "Add Images"}
                                <ChevronDown
                                  size={12}
                                  style={{
                                    transform: row.expanded
                                      ? "rotate(180deg)"
                                      : "none",
                                    transition: "transform 0.2s",
                                  }}
                                />
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => removeRow(row.id)}
                                className="p-1.5 rounded-lg"
                                style={{ color: Colors.textMuted }}
                              >
                                <Trash2 size={15} strokeWidth={2} />
                              </button>
                            </td>
                          </tr>

                          {/* Expanded Image Section */}
                          {row.expanded && row.status === "valid" && (
                            <tr
                              key={`${row.id}-images`}
                              style={{
                                background: Colors.surfaceAlt,
                                borderTop: `1px solid ${Colors.divider}`,
                              }}
                            >
                              <td colSpan={8} className="px-4 py-4">
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-center justify-between">
                                    <p
                                      className="text-xs font-semibold"
                                      style={{ color: Colors.textSecondary }}
                                    >
                                      Images for:{" "}
                                      <span
                                        style={{ color: Colors.textPrimary }}
                                      >
                                        {row.name}
                                      </span>{" "}
                                      ({row.images.length}/8)
                                    </p>
                                    {row.images.length < 8 && (
                                      <label
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer"
                                        style={{
                                          background: Colors.primaryLight,
                                          color: Colors.primary,
                                          border: `1px solid ${Colors.accentLight}`,
                                        }}
                                      >
                                        <Plus size={14} strokeWidth={2.5} /> Add
                                        Images
                                        <input
                                          type="file"
                                          accept="image/jpeg,image/png,image/webp"
                                          multiple
                                          className="hidden"
                                          onChange={(e) => {
                                            if (e.target.files) {
                                              addImagesToRow(
                                                row.id,
                                                e.target.files,
                                              );
                                              e.target.value = "";
                                            }
                                          }}
                                        />
                                      </label>
                                    )}
                                  </div>

                                  {row.images.length > 0 ? (
                                    <div className="grid grid-cols-6 gap-3">
                                      {row.images.map((img, imgIndex) => (
                                        <div
                                          key={imgIndex}
                                          className="relative group"
                                        >
                                          <div
                                            className="relative rounded-xl overflow-hidden aspect-square cursor-pointer"
                                            style={{
                                              border: `2px solid ${img.isPrimary ? Colors.primary : Colors.border}`,
                                            }}
                                            onClick={() =>
                                              setBulkImagePrimary(
                                                row.id,
                                                imgIndex,
                                              )
                                            }
                                          >
                                            <img
                                              src={img.preview}
                                              alt={`${row.name} ${imgIndex + 1}`}
                                              className="w-full h-full object-cover"
                                            />
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
                                            <div className="absolute inset-0 bg-black/10 bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                                              <span className="text-white text-[10px] font-semibold opacity-0 group-hover:opacity-100">
                                                Set Primary
                                              </span>
                                            </div>
                                          </div>
                                          <button
                                            onClick={() =>
                                              removeBulkImage(row.id, imgIndex)
                                            }
                                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center z-10"
                                            style={{
                                              background: Colors.error,
                                              color: Colors.white,
                                            }}
                                          >
                                            <X size={10} strokeWidth={3} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="text-center py-4">
                                      <ImageIcon
                                        size={24}
                                        color={Colors.border}
                                        strokeWidth={1.5}
                                      />
                                      <p
                                        className="text-xs mt-1"
                                        style={{ color: Colors.textMuted }}
                                      >
                                        No images added yet
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div
                  className="px-6 py-4"
                  style={{ borderTop: `1px solid ${Colors.divider}` }}
                >
                  <button
                    onClick={handleBulkSubmit}
                    disabled={
                      bulkSubmitting ||
                      !bulkRows.some((r) => r.status === "valid")
                    }
                    className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
                    style={{
                      background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                      color: Colors.white,
                      opacity:
                        bulkSubmitting ||
                        !bulkRows.some((r) => r.status === "valid")
                          ? 0.6
                          : 1,
                      cursor: bulkSubmitting ? "not-allowed" : "pointer",
                      boxShadow: `0 4px 14px rgba(0,168,132,0.3)`,
                    }}
                  >
                    {bulkSubmitting ? (
                      <>
                        <Spinner /> Uploading to server…
                      </>
                    ) : (
                      <>
                        <Upload size={16} strokeWidth={2} /> Upload{" "}
                        {bulkRows.filter((r) => r.status === "valid").length}{" "}
                        Valid Products
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
