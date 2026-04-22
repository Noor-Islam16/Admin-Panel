import { useState, useRef, useCallback } from "react";
import {
  PackagePlus,
  Upload,
  FileSpreadsheet,
  ImagePlus,
  Tag,
  IndianRupee,
  Boxes,
  AlignLeft,
  ToggleLeft,
  ToggleRight,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Trash2,
  ChevronDown,
  Link,
  Star,
  Award,
  TrendingUp,
} from "lucide-react";
import Colors from "../constants/colors";
import {
  CATEGORIES,
  type Product,
  type ProductTag,
} from "../constants/products";

// ── Types ─────────────────────────────────────────────────────────────────────
interface ProductForm {
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  price: string;
  originalPrice: string;
  unit: string;
  weight: string;
  description: string;
  imageUrl: string;
  minOrderQty: string;
  fastMoving: boolean;
  featured: boolean;
  stock: string;
  tags: ProductTag[];
}

interface BulkRow {
  id: string;
  name: string;
  brand: string;
  category: string;
  subCategory: string;
  price: string;
  originalPrice: string;
  unit: string;
  weight: string;
  description: string;
  image_url: string;
  min_order_qty: string;
  fast_moving: string;
  featured: string;
  stock: string;
  tags: string;
  status: "valid" | "error";
  error?: string;
}

// Get unique subcategories from existing products (you can also define this separately)
const SUBCATEGORIES: Record<string, string[]> = {
  groceries: [
    "Rice & Grains",
    "Pulses",
    "Oils",
    "Flour",
    "Spices",
    "Dry Fruits",
  ],
  snacks: ["Chips", "Namkeen", "Chocolate", "Biscuits", "Sweets"],
  beverages: ["Soft Drinks", "Tea", "Coffee", "Juices", "Water"],
  household: ["Detergent", "Cleaners", "Utensils", "Tissues", "Air Fresheners"],
  personal: [
    "Hair Care",
    "Bath & Body",
    "Oral Care",
    "Skin Care",
    "Deodorants",
  ],
};

const UNITS = [
  "kg",
  "ltr",
  "pack",
  "can",
  "jar",
  "tetra pack",
  "bottle",
  "piece",
  "box",
];

const PRODUCT_TAGS: ProductTag[] = [
  "Limited Stock",
  "Out of Stock",
  "Fast Moving",
  "New Arrival",
  "Best Seller",
  "Special Offer",
  "Trending",
  "Premium",
  "Organic",
  "Imported",
];

const EMPTY_FORM: ProductForm = {
  name: "",
  brand: "",
  category: "",
  subCategory: "",
  price: "",
  originalPrice: "",
  unit: "pack",
  weight: "",
  description: "",
  imageUrl: "",
  minOrderQty: "1",
  fastMoving: false,
  featured: false,
  stock: "",
  tags: [],
};

// ── Shared Input Style ────────────────────────────────────────────────────────
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

// ── Tab Button ────────────────────────────────────────────────────────────────
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

// ── Tag Selector Component ────────────────────────────────────────────────────
function TagSelector({
  selectedTags,
  onToggle,
}: {
  selectedTags: ProductTag[];
  onToggle: (tag: ProductTag) => void;
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
            ? selectedTags.join(", ")
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
                key={tag}
                className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-colors"
                style={{
                  background: selectedTags.includes(tag)
                    ? Colors.primaryLight
                    : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!selectedTags.includes(tag)) {
                    (e.currentTarget as HTMLElement).style.background =
                      Colors.surfaceAlt;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedTags.includes(tag)) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag)}
                  onChange={() => onToggle(tag)}
                  className="w-4 h-4 rounded accent-[#00A884]"
                />
                <span className="text-sm" style={{ color: Colors.textPrimary }}>
                  {tag}
                </span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
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
  const [imagePreview, setImagePreview] = useState("");

  // Bulk
  const [bulkRows, setBulkRows] = useState<BulkRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Single Form Handlers ──────────────────────────────────────────────────
  const set = (
    key: keyof ProductForm,
    value: string | boolean | ProductTag[],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageUrlBlur = () => {
    setFocused("");
    if (form.imageUrl.startsWith("http")) setImagePreview(form.imageUrl);
    else setImagePreview("");
  };

  const toggleTag = (tag: ProductTag) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const validateSingle = (): string | null => {
    if (!form.name.trim()) return "Product name is required.";
    if (!form.category) return "Please select a category.";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      return "Enter a valid selling price.";
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0)
      return "Enter a valid stock quantity.";
    return null;
  };

  const buildProductPayload = (): Omit<
    Product,
    "id" | "rating" | "reviewCount"
  > => {
    const price = Number(form.price);
    const originalPrice = form.originalPrice
      ? Number(form.originalPrice)
      : undefined;
    const discount =
      originalPrice && originalPrice > price
        ? Math.round(((originalPrice - price) / originalPrice) * 100)
        : undefined;

    return {
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      category: form.category,
      subCategory: form.subCategory || undefined,
      price,
      originalPrice,
      discount,
      stock: Number(form.stock),
      minOrderQty: form.minOrderQty ? Number(form.minOrderQty) : undefined,
      images: form.imageUrl ? [form.imageUrl] : [],
      tags: form.tags,
      description: form.description.trim(),
      unit: form.unit,
      weight: form.weight || undefined,
      fastMoving: form.fastMoving,
      inStock: Number(form.stock) > 0,
      featured: form.featured,
    };
  };

  const handleSingleSubmit = async () => {
    const err = validateSingle();
    if (err) {
      showToast("error", err);
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    const payload = buildProductPayload();
    // TODO: POST /api/products with payload
    console.log("Product payload:", payload);
    showToast("success", `"${form.name}" added successfully!`);
    setForm(EMPTY_FORM);
    setImagePreview("");
    setSubmitting(false);
  };

  // ── Bulk Upload Handlers ──────────────────────────────────────────────────
  const parseCsv = useCallback((text: string) => {
    const lines = text.trim().split("\n");
    const headers = lines[0]
      .split(",")
      .map((h) => h.trim().toLowerCase().replace(/ /g, "_"));
    const rows: BulkRow[] = lines.slice(1).map((line, i) => {
      const vals = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      const obj: Record<string, string> = {};
      headers.forEach((h, idx) => {
        obj[h] = vals[idx] ?? "";
      });

      const hasError = !obj["name"] || !obj["price"] || !obj["stock"];
      return {
        id: String(i),
        name: obj["name"] ?? "",
        brand: obj["brand"] ?? "",
        category: obj["category"] ?? "",
        subCategory: obj["sub_category"] ?? "",
        price: obj["price"] ?? "",
        originalPrice: obj["original_price"] ?? "",
        unit: obj["unit"] ?? "pack",
        weight: obj["weight"] ?? "",
        description: obj["description"] ?? "",
        image_url: obj["image_url"] ?? "",
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
              : "Stock missing"
          : undefined,
      };
    });
    setBulkRows(rows);
  }, []);

  const handleFileDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (!file) return;
      if (!file.name.endsWith(".csv") && !file.name.endsWith(".xlsx")) {
        showToast("error", "Please upload a .csv or .xlsx file.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => parseCsv(ev.target?.result as string);
      reader.readAsText(file);
    },
    [parseCsv],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => parseCsv(ev.target?.result as string);
    reader.readAsText(file);
  };

  const removeRow = (id: string) =>
    setBulkRows((prev) => prev.filter((r) => r.id !== id));

  const handleBulkSubmit = async () => {
    const valid = bulkRows.filter((r) => r.status === "valid");
    if (!valid.length) {
      showToast("error", "No valid rows to upload.");
      return;
    }
    setBulkSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    // TODO: POST /api/products/bulk with valid rows
    console.log("Bulk payload:", valid);
    showToast(
      "success",
      `${valid.length} product${valid.length > 1 ? "s" : ""} uploaded successfully!`,
    );
    setBulkRows([]);
    setBulkSubmitting(false);
  };

  const downloadTemplate = () => {
    const csv = `name,brand,category,sub_category,price,original_price,unit,weight,description,image_url,min_order_qty,fast_moving,featured,stock,tags\nPremium Basmati Rice,India Gate,groceries,Rice & Grains,185,220,kg,5kg,Premium aged basmati rice,https://example.com/rice.jpg,2,yes,yes,50,"Best Seller,Fast Moving"\nOrganic Toor Dal,Tata Sampann,groceries,Pulses,145,165,kg,1kg,Unpolished toor dal,https://example.com/dal.jpg,1,yes,no,35,"Organic,Best Seller"`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Input field helper ────────────────────────────────────────────────────
  const inputClass =
    "w-full bg-transparent pl-10 pr-4 py-3.5 text-sm outline-none";
  const inputStyle = { color: Colors.textPrimary };

  // Get available subcategories based on selected category
  const availableSubcategories = form.category
    ? SUBCATEGORIES[form.category] || []
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
          <PackagePlus size={20} color={Colors.primary} strokeWidth={2} />
          <div>
            <h1
              className="text-xl font-bold"
              style={{ color: Colors.textPrimary }}
            >
              Add Products
            </h1>
            <p className="text-xs" style={{ color: Colors.textMuted }}>
              Add single or bulk upload via Excel/CSV
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
            label="Bulk Upload (Excel)"
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

              {/* Name + Brand row */}
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
                      placeholder="e.g. Premium Basmati Rice"
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
                      <Award size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. India Gate"
                      value={form.brand}
                      onChange={(e) => set("brand", e.target.value)}
                      onFocus={() => setFocused("brand")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
              </div>

              {/* Category + SubCategory row */}
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
                      onChange={(e) => {
                        set("category", e.target.value);
                        set("subCategory", ""); // Reset subcategory when category changes
                      }}
                      onFocus={() => setFocused("category")}
                      onBlur={() => setFocused("")}
                    >
                      <option value="" disabled>
                        Select category
                      </option>
                      {CATEGORIES.filter((c) => c.id !== "all").map((c) => (
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
                      <Boxes size={17} strokeWidth={2} />
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

              {/* Price + Original Price row */}
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

              {/* Unit + Weight row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <FieldLabel>Unit *</FieldLabel>
                  <InputWrapper focused={focused === "unit"}>
                    <div
                      className="absolute left-3.5"
                      style={{
                        color:
                          focused === "unit"
                            ? Colors.primary
                            : Colors.textMuted,
                      }}
                    >
                      <PackagePlus size={17} strokeWidth={2} />
                    </div>
                    <select
                      className={`${inputClass} appearance-none cursor-pointer`}
                      style={{
                        color: Colors.textPrimary,
                        background: "transparent",
                      }}
                      value={form.unit}
                      onChange={(e) => set("unit", e.target.value)}
                      onFocus={() => setFocused("unit")}
                      onBlur={() => setFocused("")}
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
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
                  <FieldLabel>Weight / Size</FieldLabel>
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
                      <Boxes size={17} strokeWidth={2} />
                    </div>
                    <input
                      className={inputClass}
                      style={inputStyle}
                      placeholder="e.g. 5kg, 500ml, 200g"
                      value={form.weight}
                      onChange={(e) => set("weight", e.target.value)}
                      onFocus={() => setFocused("weight")}
                      onBlur={() => setFocused("")}
                    />
                  </InputWrapper>
                </div>
              </div>

              {/* Stock + Min Order Qty row */}
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

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Description</FieldLabel>
                <div
                  className="rounded-2xl transition-all duration-200 overflow-hidden"
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

              {/* Image URL */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Image URL</FieldLabel>
                <InputWrapper focused={focused === "img"}>
                  <div
                    className="absolute left-3.5"
                    style={{
                      color:
                        focused === "img" ? Colors.primary : Colors.textMuted,
                    }}
                  >
                    <Link size={17} strokeWidth={2} />
                  </div>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    placeholder="https://... (Unsplash or CDN link)"
                    value={form.imageUrl}
                    onChange={(e) => {
                      set("imageUrl", e.target.value);
                      setImagePreview("");
                    }}
                    onFocus={() => setFocused("img")}
                    onBlur={handleImageUrlBlur}
                  />
                </InputWrapper>
                <p className="text-xs" style={{ color: Colors.textMuted }}>
                  Paste a direct image link (e.g., from Unsplash or your CDN)
                </p>
              </div>

              {/* Product Tags */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Product Tags</FieldLabel>
                <TagSelector selectedTags={form.tags} onToggle={toggleTag} />
              </div>

              {/* ── Toggles Row ── */}
              <div className="flex flex-col gap-3">
                {/* Fast Moving Toggle */}
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

                {/* Featured Toggle */}
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
                    Saving Product…
                  </>
                ) : (
                  <>
                    <PackagePlus size={18} strokeWidth={2} />
                    Add Product
                  </>
                )}
              </button>
            </div>

            {/* ── Right: Image Preview Card ── */}
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
                    Preview
                  </p>
                </div>

                {/* Image Preview */}
                <div
                  className="mx-5 mt-5 rounded-2xl overflow-hidden flex items-center justify-center"
                  style={{
                    height: 180,
                    background: Colors.surfaceAlt,
                    border: `2px dashed ${Colors.border}`,
                  }}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="w-full h-full object-contain"
                      onError={() => setImagePreview("")}
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <ImagePlus
                        size={32}
                        color={Colors.border}
                        strokeWidth={1.5}
                      />
                      <p
                        className="text-xs text-center px-4"
                        style={{ color: Colors.textMuted }}
                      >
                        Paste an image URL above to preview
                      </p>
                    </div>
                  )}
                </div>

                {/* Mini product card */}
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
                        className="text-xs mt-0.5"
                        style={{ color: Colors.textMuted }}
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
                    {form.unit && (
                      <p
                        className="text-xs"
                        style={{ color: Colors.textMuted }}
                      >
                        / {form.unit}
                      </p>
                    )}
                  </div>
                  {form.weight && (
                    <p className="text-xs" style={{ color: Colors.textMuted }}>
                      {form.weight}
                    </p>
                  )}
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
                      {form.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            background: Colors.surfaceAlt,
                            color: Colors.textSecondary,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                      {form.tags.length > 3 && (
                        <span
                          className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{
                            background: Colors.surfaceAlt,
                            color: Colors.textMuted,
                          }}
                        >
                          +{form.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Tips Card */}
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
                  💡 Quick Tips
                </p>
                {[
                  "Use Unsplash for free product images",
                  "Original price creates automatic discount display",
                  "Fast Moving products get priority placement",
                  "Add tags to help customers filter products",
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
            {/* Instructions + Template download */}
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
                  Download the CSV template → fill in your products → upload
                  below. Required columns: <strong>name</strong>,{" "}
                  <strong>price</strong>, <strong>stock</strong>.
                </p>
              </div>
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-150"
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

            {/* Drop Zone */}
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
                accept=".csv,.xlsx"
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
                  — .csv or .xlsx accepted
                </p>
              </div>
            </div>

            {/* Parsed Rows Table */}
            {bulkRows.length > 0 && (
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
                    onClick={() => setBulkRows([])}
                    className="text-xs font-medium flex items-center gap-1 transition-colors"
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
                          "Status",
                          "Name",
                          "Brand",
                          "Category",
                          "Price",
                          "Stock",
                          "Unit",
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
                            title={row.name}
                          >
                            {row.name || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm max-w-[120px] truncate"
                            style={{ color: Colors.textSecondary }}
                            title={row.brand}
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
                            className="px-4 py-3 text-sm font-semibold"
                            style={{ color: Colors.primary }}
                          >
                            {row.price ? `₹${row.price}` : "—"}
                            {row.originalPrice &&
                              Number(row.originalPrice) > Number(row.price) && (
                                <span
                                  className="text-xs line-through block"
                                  style={{ color: Colors.textMuted }}
                                >
                                  ₹{row.originalPrice}
                                </span>
                              )}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: Colors.textSecondary }}
                          >
                            {row.stock || "—"}
                          </td>
                          <td
                            className="px-4 py-3 text-sm"
                            style={{ color: Colors.textSecondary }}
                          >
                            {row.unit} {row.weight && `· ${row.weight}`}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1 max-w-[150px]">
                              {row.tags ? (
                                row.tags
                                  .split(",")
                                  .slice(0, 2)
                                  .map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-xs px-1.5 py-0.5 rounded-md"
                                      style={{
                                        background: Colors.surfaceAlt,
                                        color: Colors.textSecondary,
                                      }}
                                    >
                                      {tag.trim()}
                                    </span>
                                  ))
                              ) : (
                                <span
                                  className="text-xs"
                                  style={{ color: Colors.textMuted }}
                                >
                                  —
                                </span>
                              )}
                              {row.tags && row.tags.split(",").length > 2 && (
                                <span
                                  className="text-xs px-1.5 py-0.5 rounded-md"
                                  style={{
                                    background: Colors.surfaceAlt,
                                    color: Colors.textMuted,
                                  }}
                                >
                                  +{row.tags.split(",").length - 2}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => removeRow(row.id)}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: Colors.textMuted }}
                              onMouseEnter={(e) =>
                                ((e.currentTarget as HTMLElement).style.color =
                                  Colors.error)
                              }
                              onMouseLeave={(e) =>
                                ((e.currentTarget as HTMLElement).style.color =
                                  Colors.textMuted)
                              }
                            >
                              <Trash2 size={15} strokeWidth={2} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Upload button */}
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
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Upload size={16} strokeWidth={2} />
                        Upload{" "}
                        {
                          bulkRows.filter((r) => r.status === "valid").length
                        }{" "}
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
        @keyframes slideUp {
          from { transform: translateY(16px); opacity: 0; }
          to   { transform: translateY(0);   opacity: 1; }
        }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input::placeholder, textarea::placeholder { color: ${Colors.textMuted}; }
        select option { color: ${Colors.textPrimary}; background: ${Colors.surface}; }
      `}</style>
    </>
  );
}
