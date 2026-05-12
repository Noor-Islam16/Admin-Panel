const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// ── Generic fetch wrapper ────────────────────────────────────────────────────
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Request failed");
  return json;
}

// For multipart/form-data (file uploads) — no Content-Type header so browser sets boundary
async function requestForm<T>(
  path: string,
  body: FormData,
  method = "POST",
): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    body,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message ?? "Request failed");
  return json;
}

// ════════════════════════════════════════════════════════════════════════════════
// TYPES  (for Electronics Accessories)
// ════════════════════════════════════════════════════════════════════════════════

export interface ProductImage {
  url: string;
  publicId: string;
  isPrimary: boolean;
  altText?: string;
}

export interface ApiProduct {
  _id: string;
  name: string;
  brand?: string;
  category: string;
  subCategory?: string;
  type?: string;
  compatibility?: string[];
  sellingPrice: number;
  originalPrice?: number;
  color?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  warranty?: string;
  stockQuantity: number;
  minOrderQuantity: number;
  maxOrderQuantity: number;
  description?: string;
  specifications?: Record<string, string>;
  images: ProductImage[];
  tags: string[];
  isFastMoving: boolean;
  isFeatured: boolean;
  isActive: boolean;
  alertAt?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface StockStats {
  total: number;
  inStock: number;
  outOfStock: number;
  lowStock: number;
  fastMoving: number;
  featured: number;
}

export interface ActivityLogEntry {
  _id: string;
  productId:
    | string
    | { _id: string; name: string; images?: ProductImage[]; category: string };
  productName: string;
  action: string;
  previousValue?: number | boolean | null;
  newValue?: number | boolean | null;
  note?: string;
  createdAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface BulkUploadResponse {
  totalRows: number;
  successCount: number;
  failedCount: number;
  insertedProducts: ApiProduct[];
  failedRows: { row: number; errors: unknown }[];
}

// ════════════════════════════════════════════════════════════════════════════════
// PRODUCT API
// ════════════════════════════════════════════════════════════════════════════════

export const ProductAPI = {
  /** POST /api/products/single  — multipart/form-data with multiple images */
  addSingle: (formData: FormData) =>
    requestForm<{ success: boolean; message: string; data: ApiProduct }>(
      "/products/single",
      formData,
      "POST",
    ),

  /** POST /api/products/bulk  — multipart/form-data with csv/xlsx file */
  bulkUpload: (formData: FormData) =>
    requestForm<{
      success: boolean;
      message: string;
      data: BulkUploadResponse;
    }>("/products/bulk", formData, "POST"),

  /** GET /api/products */
  getAll: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{
      success: boolean;
      data: { products: ApiProduct[]; pagination: Pagination };
    }>(`/products${qs}`);
  },

  /** GET /api/products/:id */
  getById: (id: string) =>
    request<{ success: boolean; data: ApiProduct }>(`/products/${id}`),

  /** PATCH /api/products/:id  — multipart/form-data, all fields optional */
  update: (id: string, formData: FormData) =>
    requestForm<{ success: boolean; message: string; data: ApiProduct }>(
      `/products/${id}`,
      formData,
      "PATCH",
    ),

  /** PATCH /api/products/:id/images  — Replace all images */
  replaceImages: (id: string, formData: FormData) =>
    requestForm<{ success: boolean; message: string; data: ApiProduct }>(
      `/products/${id}/images`,
      formData,
      "PATCH",
    ),

  /** DELETE /api/products/:id */
  delete: (id: string) =>
    request<{ success: boolean; message: string }>(`/products/${id}`, {
      method: "DELETE",
    }),

  /** PATCH /api/products/:id/step */
  updateStep: (id: string, step: number) =>
    request<{ success: boolean; message: string }>(`/products/${id}/step`, {
      method: "PATCH",
      body: JSON.stringify({ step }),
    }),

  /** PATCH /api/products/:id/status */
  toggleStatus: (id: string, isActive: boolean) =>
    request<{ success: boolean; message: string }>(`/products/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),
};

// ════════════════════════════════════════════════════════════════════════════════
// STOCK API
// ════════════════════════════════════════════════════════════════════════════════

export const StockAPI = {
  /** GET /api/stocks/stats */
  getStats: () =>
    request<{ success: boolean; data: StockStats }>("/stocks/stats"),

  /** GET /api/stocks  */
  getList: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{
      success: boolean;
      data: { products: ApiProduct[]; pagination: Pagination };
    }>(`/stocks${qs}`);
  },

  /** PATCH /api/stocks/:id/quantity */
  adjustQuantity: (
    id: string,
    mode: "increment" | "decrement" | "set",
    value: number,
  ) =>
    request<{
      success: boolean;
      message: string;
      data: { newQuantity: number };
    }>(`/stocks/${id}/quantity`, {
      method: "PATCH",
      body: JSON.stringify({ mode, value }),
    }),

  /** PATCH /api/stocks/:id/fast-moving */
  toggleFastMoving: (id: string, isFastMoving: boolean) =>
    request<{ success: boolean; message: string }>(
      `/stocks/${id}/fast-moving`,
      {
        method: "PATCH",
        body: JSON.stringify({ isFastMoving }),
      },
    ),

  /** PATCH /api/stocks/:id/featured */
  toggleFeatured: (id: string, isFeatured: boolean) =>
    request<{ success: boolean; message: string }>(`/stocks/${id}/featured`, {
      method: "PATCH",
      body: JSON.stringify({ isFeatured }),
    }),

  /** PATCH /api/stocks/:id/alert */
  setAlert: (id: string, alertAt: number | null) =>
    request<{ success: boolean; message: string }>(`/stocks/${id}/alert`, {
      method: "PATCH",
      body: JSON.stringify({ alertAt }),
    }),

  /** POST /api/stocks/restock-all-oos */
  restockAllOOS: (quantity = 10) =>
    request<{
      success: boolean;
      message: string;
      data: { updatedCount: number };
    }>("/stocks/restock-all-oos", {
      method: "POST",
      body: JSON.stringify({ quantity }),
    }),

  /** GET /api/stocks/export-csv  — triggers browser download */
  exportCSV: () => {
    const token = localStorage.getItem("token");
    window.open(`${BASE_URL}/stocks/export-csv?token=${token}`, "_blank");
  },

  /** GET /api/stocks/activity-log */
  getActivityLog: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{
      success: boolean;
      data: { logs: ActivityLogEntry[]; pagination: Pagination };
    }>(`/stocks/activity-log${qs}`);
  },
};

// ════════════════════════════════════════════════════════════════════════════════
// ADMIN API
// ════════════════════════════════════════════════════════════════════════════════

export interface AdminLoginResponse {
  token: string;
  admin: { email: string };
}

export const AdminAPI = {
  login: (email: string, password: string) =>
    request<{ success: boolean; message: string; data: AdminLoginResponse }>(
      "/admin/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
    ),

  getProfile: () =>
    request<{ success: boolean; data: { email: string } }>("/admin/profile"),

  changeEmail: (newEmail: string, password: string) =>
    request<{ success: boolean; message: string; data: AdminLoginResponse }>(
      "/admin/email",
      {
        method: "PATCH",
        body: JSON.stringify({ newEmail, password }),
      },
    ),

  changePassword: (
    oldPassword: string,
    newPassword: string,
    confirmPassword: string,
  ) =>
    request<{ success: boolean; message: string }>("/admin/password", {
      method: "PATCH",
      body: JSON.stringify({ oldPassword, newPassword, confirmPassword }),
    }),
};
