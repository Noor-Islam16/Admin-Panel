import { useState, useRef, useCallback } from "react";
import {
  PackagePlus,
  Upload,
  FileSpreadsheet,
  Tag,
  IndianRupee,
  AlignLeft,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Trash2,
  ChevronDown,
  Star,
  TrendingUp,
  Image as ImageIcon,
  Smartphone,
  Cpu,
  Palette,
  Ruler,
  Weight,
  Shield,
  Plus,
  Monitor,
  Cable,
} from "lucide-react";
import Colors from "../constants/colors";
import {
  CATEGORIES,
  PRODUCT_TAGS,
  COMPATIBILITY_OPTIONS,
  WARRANTY_OPTIONS,
  COLORS,
  MATERIALS,
} from "../constants/products";
import { ProductAPI } from "../config/api";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Specification {
  key: string;
  value: string;
}

interface ProductForm {
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  type: string;
  compatibility: string[];
  price: string;
  originalPrice: string;
  color: string;
  material: string;
  dimensions: string;
  weight: string;
  warranty: string;
  stock: string;
  minOrderQty: string;
  description: string;
  specifications: Specification[];
  tags: string[];
  fastMoving: boolean;
  featured: boolean;
}

interface BulkRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  type: string;
  compatibility: string;
  price: string;
  originalPrice: string;
  color: string;
  material: string;
  dimensions: string;
  weight: string;
  warranty: string;
  description: string;
  specifications: string;
  image_urls: string;
  min_order_qty: string;
  fast_moving: string;
  featured: string;
  stock: string;
  tags: string;
  status: "valid" | "error";
  error?: string;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  brand: "",
  category: "",
  subCategory: "",
  type: "",
  compatibility: [],
  price: "",
  originalPrice: "",
  color: "",
  material: "",
  dimensions: "",
  weight: "",
  warranty: "No Warranty",
  stock: "",
  minOrderQty: "1",
  description: "",
  specifications: [{ key: "", value: "" }],
  tags: [],
  fastMoving: false,
  featured: false,
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

function TagSelector({
  selectedTags,
  onToggle,
}: {
  selectedTags: string[];
  onToggle: (tagId: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm"
        style={{
          background: Colors.surfaceAlt,
          border: `1.5px solid ${Colors.border}`,
          color: Colors.textPrimary,
        }}
      >
        <span>
          {selectedTags.length
            ? selectedTags
                .map((id) => PRODUCT_TAGS.find((t) => t.id === id)?.name)
                .join(", ")
            : "Select product tags..."}
        </span>
        <ChevronDown
          size={16}
          style={{
            color: Colors.textMuted,
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div
            className="absolute z-20 mt-1 w-full rounded-2xl p-2 max-h-60 overflow-y-auto shadow-xl"
            style={{
              background: Colors.surface,
              border: `1px solid ${Colors.border}`,
            }}
          >
            {PRODUCT_TAGS.map((tag) => (
              <label
                key={tag.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                style={{
                  background: selectedTags.includes(tag.id)
                    ? Colors.primaryLight
                    : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => onToggle(tag.id)}
                  className="w-4 h-4 rounded accent-[#00A884]"
                />
                <span className="text-sm" style={{ color: Colors.textPrimary }}>
                  {tag.name}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
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

  // Multiple images
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

  const toggleTag = (tagId: string) =>
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter((t) => t !== tagId)
        : [...prev.tags, tagId],
    }));

  const toggleCompatibility = (device: string) =>
    setForm((prev) => ({
      ...prev,
      compatibility: prev.compatibility.includes(device)
        ? prev.compatibility.filter((c) => c !== device)
        : [...prev.compatibility, device],
    }));

  // ── Image Handlers ───────────────────────────────────────────────────────
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

  // ── Specifications Handlers ──────────────────────────────────────────────
  const addSpecification = () => {
    setForm((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const updateSpecification = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.map((spec, i) =>
        i === index ? { ...spec, [field]: value } : spec,
      ),
    }));
  };

  const removeSpecification = (index: number) => {
    setForm((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  // ── Validation ───────────────────────────────────────────────────────────
  const validateSingle = (): string | null => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.category) return "Please select a category.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      return "Enter a valid selling price.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      return "Enter a valid stock quantity.";
    return null;
  };

  // ── Single Submit ────────────────────────────────────────────────────────
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
      fd.append("warranty", form.warranty || "No Warranty");

      if (form.brand.trim()) fd.append("brand", form.brand.trim());
      if (form.subCategory) fd.append("subCategory", form.subCategory);
      if (form.type.trim()) fd.append("type", form.type.trim());
      if (form.compatibility.length)
        fd.append("compatibility", form.compatibility.join(","));
      if (form.originalPrice) fd.append("originalPrice", form.originalPrice);
      if (form.color) fd.append("color", form.color);
      if (form.material) fd.append("material", form.material);
      if (form.dimensions.trim())
        fd.append("dimensions", form.dimensions.trim());
      if (form.weight.trim()) fd.append("weight", form.weight.trim());
      if (form.minOrderQty) fd.append("minOrderQuantity", form.minOrderQty);
      if (form.description.trim())
        fd.append("description", form.description.trim());

      // Append specifications as JSON string
      const validSpecs = form.specifications.filter(
        (s) => s.key.trim() && s.value.trim(),
      );
      if (validSpecs.length > 0) {
        const specsObj: Record<string, string> = {};
        validSpecs.forEach((s) => {
          specsObj[s.key.trim()] = s.value.trim();
        });
        fd.append("specifications", JSON.stringify(specsObj));
      }

      if (form.tags.length) fd.append("tags", form.tags.join(","));
      fd.append("isFastMoving", String(form.fastMoving));
      fd.append("isFeatured", String(form.featured));

      // Append all images with field name "images"
      imageFiles.forEach((file) => {
        fd.append("images", file);
      });

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

  // ── Bulk Handlers ────────────────────────────────────────────────────────
  const parseCsv = useCallback((text: string) => {
    const lines = text.trim().split("\n");
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
    const rows: BulkRow[] = lines.slice(1).map((line, i) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = vals[idx] ?? "";
      });
      const hasError =
        !obj["name"] || !obj["price"] || !obj["stock"] || !obj["category"];
      return {
        id: String(i),
        name: obj["name"] ?? "",
        brand: obj["brand"] ?? "",
        category: obj["category"] ?? "",
        subCategory: obj["sub_category"] ?? "",
        type: obj["type"] ?? "",
        compatibility: obj["compatibility"] ?? "",
        price: obj["price"] ?? "",
        originalPrice: obj["original_price"] ?? "",
        color: obj["color"] ?? "",
        material: obj["material"] ?? "",
        dimensions: obj["dimensions"] ?? "",
        weight: obj["weight"] ?? "",
        warranty: obj["warranty"] ?? "No Warranty",
        description: obj["description"] ?? "",
        specifications: obj["specifications"] ?? "",
        image_urls: obj["image_urls"] ?? "",
        min_order_qty: obj["min_order_qty"] ?? "1",
        fast_moving: obj["fast_moving"] ?? "no",
        featured: obj["featured"] ?? "no",
        stock: obj["stock"] ?? "",
        tags: obj["tags"] ?? "",
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
      if (
        !file.name.endsWith(".csv") &&
        !file.name.endsWith(".xlsx") &&
        !file.name.endsWith(".xls")
      ) {
        showToast("error", "Please upload a .csv, .xlsx, or .xls file.");
        return;
      }
      bulkFileRef.current = file;
      const reader = new FileReader();
      reader.onload = (ev) => parseCsv(ev.target?.result as string);
      reader.readAsText(file);
    },
    [parseCsv],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    bulkFileRef.current = file;
    const reader = new FileReader();
    reader.onload = (ev) => parseCsv(ev.target?.result as string);
    reader.readAsText(file);
  };

  const removeRow = (id: string) =>
    setBulkRows((prev) => prev.filter((r) => r.id !== id));

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

  const downloadTemplate = () => {
    const csv = `name,brand,category,sub_category,type,compatibility,price,original_price,color,material,dimensions,weight,warranty,stock,min_order_qty,description,specifications,image_urls,fast_moving,featured,tags
USB-C Fast Charging Cable,Anker,charging-cables,USB-C to USB-C,USB-C,"iPhone 15,MacBook,Android",599,999,Black,Braided Nylon,"1.2m","50g","1 Year",100,2,"Fast charging USB-C cable with 60W PD support","Cable Length:1.2m;Connector:USB-C;Data Transfer:480Mbps","https://example.com/cable1.jpg,https://example.com/cable2.jpg","yes","yes","Fast Charging,Best Seller"
Wireless Bluetooth Earbuds,boAt,headphones-earphones,Wireless Earbuds,Bluetooth 5.3,Universal,1499,2990,Black,Plastic,"6x5x3cm","45g","1 Year",50,1,"True wireless earbuds with ENC and 40hrs battery","Bluetooth:5.3;Battery:40hrs;Driver:10mm;IPX Rating:IPX5","https://example.com/earbuds1.jpg","yes","no","Wireless,Best Seller,Travel Ready"
20W PD Wall Charger,Spigen,chargers-adapters,Wall Charger,GaN USB-C,Universal,799,1299,White,Platinum,"4x3.5x3cm","65g","2 Years",200,1,"Compact 20W PD fast charger compatible with all USB-C devices","Type:GaN;Output:20W PD;Compatibility:Universal","https://example.com/charger1.jpg","yes","yes","Fast Charging,Premium,Travel Ready"`;
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
  const availableSubcategories = form.category
    ? CATEGORIES.find((c) => c.id === form.category)?.subcategories || []
    : [];

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

        {/* ════════════════════════════════════
            TAB: SINGLE PRODUCT
        ════════════════════════════════════ */}
        {tab === "single" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: Form ── */}
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

              {/* Name + Brand */}
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
                      <Cpu size={17} strokeWidth={2} />
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

              {/* Category + SubCategory */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <Monitor size={17} strokeWidth={2} />
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
                      onChange={(e) => {
                        set("category", e.target.value);
                        set("subCategory", "");
                      }}
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
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Sub Category</FieldLabel>
                  <InputWrapper focused={focused === "subCategory"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "subCategory"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Monitor size={17} strokeWidth={2} />
                    </div>
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      style={{
                        color: form.subCategory
                          ? Colors.textPrimary
                          : Colors.textMuted,
                        background: "transparent",
                      }}
                      value={form.subCategory}
                      onChange={(e) => set("subCategory", e.target.value)}
                      onFocus={() => setFocused("subCategory")}
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
                      className="absolute right-3.5 pointer-events-none"
                      style={{ color: Colors.textMuted }}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </InputWrapper>
                </div>
              </div>

              {/* Type + Compatibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Type / Variant</FieldLabel>
                  <InputWrapper focused={focused === "type"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "type"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Cable size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. USB-C, Bluetooth, GaN"
                      value={form.type}
                      onChange={(e) => set("type", e.target.value)}
                      onFocus={() => setFocused("type")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Compatibility</FieldLabel>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setFocused(
                          focused === "compatibility" ? "" : "compatibility",
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm"
                      style={{
                        background: Colors.surfaceAlt,
                        border: `1.5px solid ${focused === "compatibility" ? Colors.borderFocus : Colors.border}`,
                        color: Colors.textPrimary,
                      }}
                    >
                      <span className="truncate">
                        {form.compatibility.length
                          ? form.compatibility.join(", ")
                          : "Select compatible devices..."}
                      </span>
                      <ChevronDown
                        size={16}
                        style={{ color: Colors.textMuted }}
                      />
                    </button>
                    {focused === "compatibility" && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setFocused("")}
                        />
                        <div
                          className="absolute z-20 mt-1 w-full rounded-2xl p-2 max-h-48 overflow-y-auto shadow-xl"
                          style={{
                            background: Colors.surface,
                            border: `1px solid ${Colors.border}`,
                          }}
                        >
                          {COMPATIBILITY_OPTIONS.map((device) => (
                            <label
                              key={device}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer"
                              style={{
                                background: form.compatibility.includes(device)
                                  ? Colors.primaryLight
                                  : "transparent",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={form.compatibility.includes(device)}
                                onChange={() => toggleCompatibility(device)}
                                className="w-4 h-4 rounded accent-[#00A884]"
                              />
                              <span
                                className="text-sm"
                                style={{ color: Colors.textPrimary }}
                              >
                                {device}
                              </span>
                            </label>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Price + Original Price */}
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

              {/* Color + Material */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Color</FieldLabel>
                  <InputWrapper focused={focused === "color"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "color"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Palette size={17} strokeWidth={2} />
                    </div>
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      style={{
                        color: form.color
                          ? Colors.textPrimary
                          : Colors.textMuted,
                        background: "transparent",
                      }}
                      value={form.color}
                      onChange={(e) => set("color", e.target.value)}
                      onFocus={() => setFocused("color")}
                      onBlur={() => setFocused("")}
                    >
                      <option value="">Select color</option>
                      {COLORS.map((c) => (
                        <option key={c} value={c}>
                          {c}
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
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Material</FieldLabel>
                  <InputWrapper focused={focused === "material"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "material"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Shield size={17} strokeWidth={2} />
                    </div>
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      style={{
                        color: form.material
                          ? Colors.textPrimary
                          : Colors.textMuted,
                        background: "transparent",
                      }}
                      value={form.material}
                      onChange={(e) => set("material", e.target.value)}
                      onFocus={() => setFocused("material")}
                      onBlur={() => setFocused("")}
                    >
                      <option value="">Select material</option>
                      {MATERIALS.map((m) => (
                        <option key={m} value={m}>
                          {m}
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
              </div>

              {/* Dimensions + Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Dimensions</FieldLabel>
                  <InputWrapper focused={focused === "dimensions"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "dimensions"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Ruler size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. 10x5x2 cm"
                      value={form.dimensions}
                      onChange={(e) => set("dimensions", e.target.value)}
                      onFocus={() => setFocused("dimensions")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Weight</FieldLabel>
                  <InputWrapper focused={focused === "weight"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "weight"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Weight size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. 150g, 500mg"
                      value={form.weight}
                      onChange={(e) => set("weight", e.target.value)}
                      onFocus={() => setFocused("weight")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
              </div>

              {/* Warranty + Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Warranty</FieldLabel>
                  <InputWrapper focused={focused === "warranty"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "warranty"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <Shield size={17} strokeWidth={2} />
                    </div>
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      style={{
                        color: Colors.textPrimary,
                        background: "transparent",
                      }}
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
                      className="absolute right-3.5 pointer-events-none"
                      style={{ color: Colors.textMuted }}
                    >
                      <ChevronDown size={16} />
                    </div>
                  </InputWrapper>
                </div>
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
                      <PackagePlus size={17} strokeWidth={2} />
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
              </div>

              {/* Min Order Qty */}
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
                    <PackagePlus size={17} strokeWidth={2} />
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

              {/* Description */}
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
                    placeholder="Brief product description, features, usage notes…"
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    onFocus={() => setFocused("desc")}
                    onBlur={() => setFocused("")}
                  />
                </div>
              </div>

              {/* Specifications */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <FieldLabel>Technical Specifications</FieldLabel>
                  <button
                    onClick={addSpecification}
                    className="flex items-center gap-1 text-xs font-semibold"
                    style={{ color: Colors.primary }}
                  >
                    <Plus size={14} strokeWidth={2.5} /> Add Spec
                  </button>
                </div>
                {form.specifications.map((spec, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <InputWrapper focused={focused === `spec-key-${index}`}>
                      <input
                        className={inputClass.replace("pl-10", "pl-4")}
                        style={inputStyle}
                        placeholder="e.g. Cable Length"
                        value={spec.key}
                        onChange={(e) =>
                          updateSpecification(index, "key", e.target.value)
                        }
                        onFocus={() => setFocused(`spec-key-${index}`)}
                        onBlur={() => setFocused("")}
                      />
                    </InputWrapper>
                    <InputWrapper focused={focused === `spec-val-${index}`}>
                      <input
                        className={inputClass.replace("pl-10", "pl-4")}
                        style={inputStyle}
                        placeholder="e.g. 1.2m"
                        value={spec.value}
                        onChange={(e) =>
                          updateSpecification(index, "value", e.target.value)
                        }
                        onFocus={() => setFocused(`spec-val-${index}`)}
                        onBlur={() => setFocused("")}
                      />
                    </InputWrapper>
                    {form.specifications.length > 1 && (
                      <button
                        onClick={() => removeSpecification(index)}
                        className="p-3 rounded-xl"
                        style={{ color: Colors.textMuted }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Multiple Images Upload */}
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

              {/* Product Tags */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Product Tags</FieldLabel>
                <TagSelector selectedTags={form.tags} onToggle={toggleTag} />
              </div>

              {/* ── Toggles ── */}
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
                        Fast Moving Product
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: Colors.textMuted }}
                      >
                        Highlight as a frequently purchased item
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => set("fastMoving", !form.fastMoving)}
                    style={{
                      color: form.fastMoving
                        ? Colors.primary
                        : Colors.textMuted,
                    }}
                  >
                    {form.fastMoving ? (
                      <ToggleRight size={36} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={36} strokeWidth={1.5} />
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
                        Featured Product
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: Colors.textMuted }}
                      >
                        Show on homepage and featured sections
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
                      <ToggleRight size={36} strokeWidth={1.5} />
                    ) : (
                      <ToggleLeft size={36} strokeWidth={1.5} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
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

            {/* ── Right: Preview Card ── */}
            <div className="flex flex-col gap-4">
              <div
                className="rounded-3xl overflow-hidden"
                style={{
                  background: Colors.surface,
                  border: `1px solid ${Colors.border}`,
                  boxShadow: `0 4px 16px ${Colors.shadow}`,
                }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: `1px solid ${Colors.divider}` }}
                >
                  <p
                    className="text-sm font-bold"
                    style={{ color: Colors.textPrimary }}
                  >
                    Product Preview
                  </p>
                </div>
                <div
                  className="mx-5 mt-5 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    height: 200,
                    background: Colors.surfaceAlt,
                    border: `2px dashed ${Colors.border}`,
                  }}
                >
                  {imagePreviews.length > 0 ? (
                    <img
                      src={imagePreviews[0]}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                      onError={() => removeImage(0)}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Smartphone
                        size={32}
                        color={Colors.border}
                        strokeWidth={1.5}
                      />
                      <p
                        className="text-xs text-center px-4"
                        style={{ color: Colors.textMuted }}
                      >
                        Upload images to preview
                      </p>
                    </div>
                  )}
                </div>
                {imagePreviews.length > 1 && (
                  <div className="flex gap-2 mx-5 mt-2 pb-2 overflow-x-auto">
                    {imagePreviews.slice(1, 4).map((preview, i) => (
                      <img
                        key={i}
                        src={preview}
                        alt={`Preview ${i + 2}`}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        style={{ border: `1px solid ${Colors.border}` }}
                      />
                    ))}
                    {imagePreviews.length > 4 && (
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          background: Colors.surfaceAlt,
                          border: `1px solid ${Colors.border}`,
                        }}
                      >
                        <span
                          className="text-xs"
                          style={{ color: Colors.textMuted }}
                        >
                          +{imagePreviews.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-5 flex flex-col gap-2">
                  <div>
                    <p
                      className="text-sm font-bold leading-snug"
                      style={{ color: Colors.textPrimary }}
                    >
                      {form.name || (
                        <span style={{ color: Colors.textMuted }}>
                          Product Name
                        </span>
                      )}
                    </p>
                    {form.brand && (
                      <p
                        className="text-xs mt-0.5 font-medium"
                        style={{ color: Colors.primary }}
                      >
                        {form.brand}
                      </p>
                    )}
                  </div>
                  {form.category && (
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-lg w-fit"
                      style={{
                        background: Colors.primaryLight,
                        color: Colors.primary,
                      }}
                    >
                      {CATEGORIES.find((c) => c.id === form.category)?.name ||
                        form.category}
                      {form.subCategory && ` · ${form.subCategory}`}
                    </span>
                  )}
                  <div className="flex items-baseline gap-2 mt-1">
                    {form.price && (
                      <p
                        className="text-base font-bold"
                        style={{ color: Colors.primary }}
                      >
                        ₹{form.price}
                      </p>
                    )}
                    {form.originalPrice &&
                      Number(form.originalPrice) > Number(form.price) && (
                        <p
                          className="text-xs line-through"
                          style={{ color: Colors.textMuted }}
                        >
                          ₹{form.originalPrice}
                        </p>
                      )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {form.color && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: Colors.surfaceAlt,
                          color: Colors.textSecondary,
                        }}
                      >
                        {form.color}
                      </span>
                    )}
                    {form.material && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: Colors.surfaceAlt,
                          color: Colors.textSecondary,
                        }}
                      >
                        {form.material}
                      </span>
                    )}
                    {form.warranty !== "No Warranty" && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-md"
                        style={{
                          background: Colors.surfaceAlt,
                          color: Colors.textSecondary,
                        }}
                      >
                        {form.warranty}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background:
                          Number(form.stock) > 0
                            ? Colors.success
                            : Colors.error,
                      }}
                    />
                    <p className="text-xs" style={{ color: Colors.textMuted }}>
                      {Number(form.stock) > 0
                        ? `${form.stock} units in stock`
                        : "Out of stock"}
                    </p>
                  </div>
                  {form.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {form.tags.slice(0, 3).map((tagId) => {
                        const tag = PRODUCT_TAGS.find((t) => t.id === tagId);
                        return tag ? (
                          <span
                            key={tag.id}
                            className="text-xs px-1.5 py-0.5 rounded-md"
                            style={{
                              background: tag.color + "20",
                              color: tag.color,
                            }}
                          >
                            {tag.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips */}
              <div
                className="rounded-3xl p-5 flex flex-col gap-2"
                style={{
                  background: Colors.primaryLight,
                  border: `1px solid ${Colors.accentLight}`,
                }}
              >
                <p
                  className="text-xs font-bold uppercase tracking-wide"
                  style={{ color: Colors.accent }}
                >
                  💡 Electronics Tips
                </p>
                {[
                  "Add compatibility info to help customers",
                  "Include technical specs like cable length, wattage",
                  "First uploaded image becomes primary",
                  "Use tags like 'Fast Charging', 'Wireless' for better discovery",
                  "Original price shows discount when higher than selling price",
                ].map((t) => (
                  <p
                    key={t}
                    className="text-xs leading-relaxed"
                    style={{ color: Colors.textSecondary }}
                  >
                    • {t}
                  </p>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ════════════════════════════════════
            TAB: BULK UPLOAD
        ════════════════════════════════════ */}
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
                  Download the electronics CSV template → fill in your products
                  → upload below. Required: <strong>name</strong>,{" "}
                  <strong>category</strong>, <strong>price</strong>,{" "}
                  <strong>stock</strong>.
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
                <Download size={16} strokeWidth={2} />
                Download Template
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
                      Row {fr.row}: {JSON.stringify(fr.errors)}
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
                  <table className="w-full min-w-[1000px]">
                    <thead>
                      <tr style={{ background: Colors.surfaceAlt }}>
                        {[
                          "",
                          "Name",
                          "Brand",
                          "Category",
                          "Type",
                          "Price",
                          "Stock",
                          "Compatibility",
                          "Tags",
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
                            {row.subCategory && (
                              <span
                                className="text-xs block"
                                style={{ color: Colors.textMuted }}
                              >
                                {row.subCategory}
                              </span>
                            )}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: Colors.textSecondary }}
                          >
                            {row.type || "—"}
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
                          <td
                            className="px-4 py-3 text-sm max-w-[150px] truncate"
                            style={{ color: Colors.textSecondary }}
                          >
                            {row.compatibility || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {row.tags
                              ? row.tags
                                  .split(",")
                                  .slice(0, 2)
                                  .map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs px-1.5 py-0.5 rounded-md mr-1"
                                      style={{
                                        background: Colors.surfaceAlt,
                                        color: Colors.textSecondary,
                                      }}
                                    >
                                      {tag.trim()}
                                    </span>
                                  ))
                              : "—"}
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
        input::placeholder, textarea::placeholder { color: ${Colors.textMuted}; }
        select option { color: ${Colors.textPrimary}; background: ${Colors.surface}; }
        * { scrollbar-width: thin; scrollbar-color: ${Colors.border} transparent; }
      `}</style>
    </>
  );
}
