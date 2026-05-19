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
  Cloud,
  RotateCw,
  Crop,
  Check,
  XCircle,
  Pencil,
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
  maxOrderQty: string;
  description: string;
}

interface BulkRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  originalPrice: string;
  description: string;
  image_urls: string;
  min_order_qty: string;
  max_order_qty: string;
  stock: string;
  status: "valid" | "error";
  error?: string;
}

interface ImagePreview {
  file: File;
  preview: string;
  id: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  brand: "",
  category: "",
  price: "",
  originalPrice: "",
  stock: "",
  minOrderQty: "1",
  maxOrderQty: "",
  description: "",
};

// ── Image Editor Modal ────────────────────────────────────────────────────────
function ImageEditorModal({
  image,
  onSave,
  onClose,
}: {
  image: ImagePreview;
  onSave: (editedFile: File, previewUrl: string) => void;
  onClose: () => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [cropMode, setCropMode] = useState(false);
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleCropToggle = () => {
    setCropMode(!cropMode);
    if (!cropMode) {
      setCropArea({ x: 25, y: 25, width: 50, height: 50 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cropMode) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cropMode) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setCropArea((prev) => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x + dx / 5, 100 - prev.width)),
      y: Math.max(0, Math.min(prev.y + dy / 5, 100 - prev.height)),
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply rotation
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // Draw image with zoom
    const zoomFactor = zoom / 100;
    const drawWidth = canvas.width * zoomFactor;
    const drawHeight = canvas.height * zoomFactor;
    const dx = (canvas.width - drawWidth) / 2;
    const dy = (canvas.height - drawHeight) / 2;
    ctx.drawImage(img, dx, dy, drawWidth, drawHeight);
    ctx.restore();

    // Apply crop if in crop mode
    if (cropMode) {
      const cropX = (canvas.width * cropArea.x) / 100;
      const cropY = (canvas.height * cropArea.y) / 100;
      const cropW = (canvas.width * cropArea.width) / 100;
      const cropH = (canvas.height * cropArea.height) / 100;

      const imageData = ctx.getImageData(cropX, cropY, cropW, cropH);
      canvas.width = cropW;
      canvas.height = cropH;
      ctx.putImageData(imageData, 0, 0);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const newFile = new File([blob], image.file.name, {
          type: image.file.type,
        });
        const previewUrl = URL.createObjectURL(blob);
        onSave(newFile, previewUrl);
      }
    }, image.file.type);
  };

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
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{
            background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
          }}
        >
          <p className="text-base font-bold text-white">Edit Image</p>
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

        <div className="p-6">
          {/* Image Preview */}
          <div
            className="relative rounded-2xl overflow-hidden mb-4"
            style={{
              background: Colors.surfaceAlt,
              minHeight: 300,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={image.preview}
              alt="Edit preview"
              style={{
                maxWidth: "100%",
                maxHeight: 400,
                transform: `rotate(${rotation}deg) scale(${zoom / 100})`,
                objectFit: "contain",
              }}
            />

            {/* Crop overlay */}
            {cropMode && (
              <div
                className="absolute border-2 border-white"
                style={{
                  left: `${cropArea.x}%`,
                  top: `${cropArea.y}%`,
                  width: `${cropArea.width}%`,
                  height: `${cropArea.height}%`,
                  boxShadow: "0 0 0 9999px rgba(0,0,0,0.5)",
                  cursor: "move",
                }}
              />
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <button
              onClick={handleRotate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: Colors.surfaceAlt,
                color: Colors.textPrimary,
                border: `1.5px solid ${Colors.border}`,
              }}
            >
              <RotateCw size={16} /> Rotate 90°
            </button>
            <button
              onClick={handleZoomIn}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: Colors.surfaceAlt,
                color: Colors.textPrimary,
                border: `1.5px solid ${Colors.border}`,
              }}
            >
              <Plus size={16} /> Zoom In
            </button>
            <button
              onClick={handleZoomOut}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: Colors.surfaceAlt,
                color: Colors.textPrimary,
                border: `1.5px solid ${Colors.border}`,
              }}
            >
              <span style={{ fontSize: 18, fontWeight: "bold" }}>−</span> Zoom
              Out
            </button>
            <button
              onClick={handleCropToggle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{
                background: cropMode ? Colors.primaryLight : Colors.surfaceAlt,
                color: cropMode ? Colors.primary : Colors.textPrimary,
                border: `1.5px solid ${cropMode ? Colors.accentLight : Colors.border}`,
              }}
            >
              <Crop size={16} /> {cropMode ? "Crop Mode ON" : "Crop"}
            </button>
            <span
              className="text-xs px-3 py-1 rounded-lg"
              style={{
                background: Colors.surfaceAlt,
                color: Colors.textMuted,
              }}
            >
              Zoom: {zoom}%
            </span>
            {cropMode && (
              <span
                className="text-xs px-3 py-1 rounded-lg"
                style={{
                  background: Colors.warning + "18",
                  color: Colors.warning,
                }}
              >
                Drag to position crop area
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
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
              className="flex-1 py-3 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${Colors.gradientStart}, ${Colors.gradientEnd})`,
                color: Colors.white,
              }}
            >
              <Check size={16} /> Apply Changes
            </button>
          </div>
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

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
  const [imagePreviews, setImagePreviews] = useState<ImagePreview[]>([]);
  const [editingImage, setEditingImage] = useState<ImagePreview | null>(null);
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
    if (imagePreviews.length + files.length > 8) {
      showToast("error", "Maximum 8 images allowed");
      return;
    }
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }));
    setImagePreviews((prev) => [...prev, ...newImages]);
  };

  const removeImage = (id: string) => {
    setImagePreviews((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const clearAllImages = () => {
    imagePreviews.forEach((img) => URL.revokeObjectURL(img.preview));
    setImagePreviews([]);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleEditImage = (image: ImagePreview) => {
    setEditingImage(image);
  };

  const handleSaveEditedImage = (editedFile: File, previewUrl: string) => {
    setImagePreviews((prev) =>
      prev.map((img) => {
        if (img.id === editingImage?.id) {
          URL.revokeObjectURL(img.preview);
          return { ...img, file: editedFile, preview: previewUrl };
        }
        return img;
      }),
    );
    setEditingImage(null);
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
      if (form.maxOrderQty) fd.append("maxOrderQuantity", form.maxOrderQty);
      if (form.brand.trim()) fd.append("brand", form.brand.trim());
      if (form.originalPrice) fd.append("originalPrice", form.originalPrice);
      if (form.description.trim())
        fd.append("description", form.description.trim());
      imagePreviews.forEach((img) => fd.append("images", img.file));
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

  // ── Parse uploaded file (CSV or Excel) ──────────────────────────────────────
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
          { defval: "", raw: false },
        );
        buildBulkRows(rawRows);
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = (ev.target?.result as string).replace(/^\uFEFF/, "");
        const lines = text.trim().split(/\r?\n/);
        if (lines.length < 2) return;

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

  // ── Build bulk rows from parsed data ────────────────────────────────────────
  const buildBulkRows = useCallback((rawRows: Record<string, string>[]) => {
    const rows: BulkRow[] = rawRows.map((raw, i) => {
      // Normalize keys
      const obj: Record<string, string> = {};
      Object.keys(raw).forEach((key) => {
        const normalized = key
          .replace(/^\uFEFF/, "")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "_")
          .replace(/[^a-z0-9_]/g, "");
        obj[normalized] = String(raw[key] ?? "")
          .trim()
          .replace(/^[₹$€£¥]+/, "")
          .replace(/^"|"$/g, "");
      });

      // Normalize numeric fields — remove thousand separators
      [
        "price",
        "original_price",
        "stock",
        "min_order_qty",
        "max_order_qty",
      ].forEach((f) => {
        if (obj[f]) obj[f] = obj[f].replace(/,/g, "").replace(/\.0+$/, "");
      });

      // ✅ COLLECT IMAGES FROM image_1 through image_8 columns
      const imageUrls: string[] = [];
      for (let j = 1; j <= 8; j++) {
        const url = obj[`image_${j}`];
        if (url && url.trim()) {
          imageUrls.push(url.trim());
        }
      }

      // Also check old format image_urls column as fallback
      if (imageUrls.length === 0 && obj["image_urls"]) {
        obj["image_urls"].split(",").forEach((url: string) => {
          const trimmed = url.trim();
          if (trimmed) {
            imageUrls.push(trimmed);
          }
        });
      }

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
        image_urls: imageUrls.join(","),
        min_order_qty: obj["min_order_qty"] ?? "1",
        max_order_qty: obj["max_order_qty"] ?? "",
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
      parseFile(file);
    },
    [parseFile],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    bulkFileRef.current = file;
    parseFile(file);
  };

  const removeRow = (id: string) => {
    setBulkRows((prev) => {
      const updatedRows = prev.filter((r) => r.id !== id);

      // ✅ FIX: Update the file reference with only remaining rows
      if (updatedRows.length > 0 && bulkFileRef.current) {
        // Create a new CSV file with only the remaining rows
        const headers = [
          "name",
          "brand",
          "category",
          "price",
          "original_price",
          "stock",
          "min_order_qty",
          "max_order_qty",
          "description",
          "image_1",
          "image_2",
          "image_3",
          "image_4",
          "image_5",
          "image_6",
          "image_7",
          "image_8",
        ];

        const rows = updatedRows.map((row) => [
          row.name,
          row.brand,
          row.category,
          row.price,
          row.originalPrice,
          row.stock,
          row.min_order_qty,
          row.max_order_qty,
          row.description,
          ...Array.from({ length: 8 }, (_, i) => {
            const imageUrls = row.image_urls.split(",").filter(Boolean);
            return imageUrls[i] || "";
          }),
        ]);

        const csvContent = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(","))
          .join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const newFile = new File([blob], bulkFileRef.current.name, {
          type: "text/csv",
          lastModified: Date.now(),
        });
        bulkFileRef.current = newFile;
      }

      return updatedRows;
    });
  };

  // ── Bulk Submit (sends the file directly to backend) ────────────────────────
  const handleBulkSubmit = async () => {
    const validCount = bulkRows.filter((r) => r.status === "valid").length;
    if (!validCount) {
      showToast("error", "No valid rows to upload.");
      return;
    }
    if (!bulkFileRef.current) {
      showToast("error", "File reference lost — please re-upload the file.");
      return;
    }

    setBulkSubmitting(true);
    setBulkUploadResult(null);
    try {
      const fd = new FormData();
      fd.append("file", bulkFileRef.current);

      const res = await ProductAPI.bulkUpload(fd);
      const { successCount, failedCount, failedRows } = res.data;

      setBulkUploadResult({ successCount, failedCount, failedRows });

      if (failedCount === 0) {
        showToast(
          "success",
          `All ${successCount} products uploaded successfully!`,
        );
        setBulkRows([]);
        bulkFileRef.current = null;
      } else if (successCount > 0) {
        showToast(
          "success",
          `${successCount} uploaded, ${failedCount} failed — see details below.`,
        );
      } else {
        showToast("error", `All ${failedCount} rows failed validation.`);
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

  // ── Download Template ───────────────────────────────────────────────────────
  const downloadTemplate = () => {
    const headers = [
      "name",
      "brand",
      "category",
      "price",
      "original_price",
      "stock",
      "min_order_qty",
      "max_order_qty",
      "description",
      "image_1",
      "image_2",
      "image_3",
      "image_4",
      "image_5",
      "image_6",
      "image_7",
      "image_8",
    ];
    const rows = [
      [
        "USB-C Fast Charging Cable",
        "Anker",
        "charging-cables",
        "599",
        "999",
        "100",
        "2",
        "10",
        "Fast charging USB-C cable with 60W PD support",
        "https://drive.google.com/file/d/1EXAMPLE_DRIVE_ID1/view?usp=drive_link",
        "https://res.cloudinary.com/your-cloud/image/upload/v123/product1-back.jpg",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "Wireless Bluetooth Earbuds",
        "boAt",
        "headphones-earphones",
        "1499",
        "2990",
        "50",
        "1",
        "5",
        "True wireless earbuds with ENC",
        "https://drive.google.com/file/d/1EXAMPLE_DRIVE_ID2/view?usp=drive_link",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
      [
        "20W PD Wall Charger",
        "Spigen",
        "chargers-adapters",
        "799",
        "1299",
        "200",
        "1",
        "",
        "Compact 20W PD fast charger",
        "https://drive.google.com/file/d/1EXAMPLE_DRIVE_ID3/view?usp=drive_link",
        "https://res.cloudinary.com/your-cloud/image/upload/v123/product3-back.jpg",
        "",
        "",
        "",
        "",
        "",
        "",
      ],
    ];

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

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
      {editingImage && (
        <ImageEditorModal
          image={editingImage}
          onSave={handleSaveEditedImage}
          onClose={() => setEditingImage(null)}
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

              {/* Form fields - same as before */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Max Order Quantity</FieldLabel>
                  <InputWrapper focused={focused === "maxOrderQty"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "maxOrderQty"
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
                      placeholder="No limit (optional)"
                      value={form.maxOrderQty}
                      onChange={(e) => set("maxOrderQty", e.target.value)}
                      onFocus={() => setFocused("maxOrderQty")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
                <div />
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

              {/* ═══ UPDATED: Single Product Images with Edit Button ═══ */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel>Product Images (Max 8)</FieldLabel>
                  <span className="text-xs" style={{ color: Colors.textMuted }}>
                    {imagePreviews.length}/8
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
                      {imagePreviews.map((image, index) => (
                        <div
                          key={image.id}
                          className="relative rounded-xl overflow-hidden aspect-square group"
                          style={{
                            border: `2px solid ${index === 0 ? Colors.primary : Colors.border}`,
                          }}
                        >
                          <img
                            src={image.preview}
                            alt={`Product ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <span
                              className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold z-10"
                              style={{
                                background: Colors.primary,
                                color: Colors.white,
                              }}
                            >
                              Primary
                            </span>
                          )}
                          {/* Edit button - visible on hover */}
                          <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/40">
                            <button
                              onClick={() => handleEditImage(image)}
                              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                              title="Edit image"
                            >
                              <Pencil size={14} color={Colors.textPrimary} />
                            </button>
                            <button
                              onClick={() => removeImage(image.id)}
                              className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                              title="Remove image"
                            >
                              <X size={14} color={Colors.error} />
                            </button>
                          </div>
                          {/* Edit icon always visible */}
                          <button
                            onClick={() => handleEditImage(image)}
                            className="absolute top-1 right-1 p-1.5 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                            title="Edit image"
                          >
                            <Crop size={12} color="white" />
                          </button>
                        </div>
                      ))}
                      {imagePreviews.length < 8 && (
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

        {/* ═══ TAB: BULK UPLOAD (unchanged except for removeRow fix) ═══ */}
        {tab === "bulk" && (
          <div className="flex flex-col gap-5">
            {/* Same bulk upload UI as before */}
            <div
              className="rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              style={{
                background: Colors.primaryLight,
                border: `1px solid ${Colors.accentLight}`,
              }}
            >
              <div className="flex flex-col gap-2 flex-1">
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
                  Download CSV template → fill products with{" "}
                  <strong>
                    image URLs in separate columns (image_1 to image_8)
                  </strong>{" "}
                  → upload.
                  <br />
                  <strong>✅ Supported image sources:</strong>
                </p>

                <div
                  className="rounded-xl p-3 mt-1"
                  style={{ background: Colors.surface }}
                >
                  <p
                    className="text-xs font-semibold flex items-center gap-1"
                    style={{ color: Colors.primary }}
                  >
                    <Cloud size={14} /> Google Drive Images
                  </p>
                  <p
                    className="text-xs mt-1"
                    style={{ color: Colors.textSecondary }}
                  >
                    Share your image from Google Drive with{" "}
                    <strong style={{ color: Colors.accent }}>
                      "Anyone with the link"
                    </strong>{" "}
                    access, then use the share link:
                  </p>
                  <code
                    className="block mt-1 p-2 rounded-lg text-xs"
                    style={{
                      background: Colors.surfaceAlt,
                      color: Colors.textPrimary,
                      wordBreak: "break-all",
                      fontSize: "11px",
                    }}
                  >
                    https://drive.google.com/file/d/1wun_oCHqlzNhSsZeCPW_aEV47J7t3jW6/view?usp=drive_link
                  </code>
                  <p
                    className="text-xs mt-1"
                    style={{ color: Colors.textMuted }}
                  >
                    The system will automatically convert it to a direct image
                    URL.
                  </p>
                </div>

                <p
                  className="text-xs mt-1"
                  style={{ color: Colors.textSecondary }}
                >
                  Required: <strong>name</strong>, <strong>category</strong>,{" "}
                  <strong>price</strong>, <strong>stock</strong>.
                </p>
                <div className="flex flex-col gap-1 mt-1">
                  <p
                    className="text-xs font-semibold"
                    style={{ color: Colors.textSecondary }}
                  >
                    ✅ Valid Categories:
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: Colors.textMuted }}
                  >
                    {CATEGORIES.map((c) => c.id).join(", ")}
                  </p>
                </div>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap flex-shrink-0 self-start sm:self-center"
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
                        ? JSON.stringify(fr.errors)
                        : fr.errors}
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

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
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
                            {row.image_urls ? (
                              <span
                                className="text-xs px-2 py-0.5 rounded-lg"
                                style={{
                                  background: Colors.primaryLight,
                                  color: Colors.primary,
                                }}
                              >
                                {
                                  row.image_urls.split(",").filter(Boolean)
                                    .length
                                }{" "}
                                images
                              </span>
                            ) : (
                              <span
                                className="text-xs"
                                style={{ color: Colors.textMuted }}
                              >
                                —
                              </span>
                            )}
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

      <style>{`
        @keyframes slideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input::placeholder { color: ${Colors.textMuted}; }
        select option { color: ${Colors.textPrimary}; background: ${Colors.surface}; }
      `}</style>
    </>
  );
}
