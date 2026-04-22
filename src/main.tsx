import { createRoot } from "react-dom/client";
import "./index.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import AdminLoginPage from "./pages/AdminLoginPage";
import DashboardLayout from "./components/DashboardLayout";
import CustomerList from "./pages/CustomerList";
import AddProducts from "./pages/AddProducts";
import ViewProducts from "./pages/ViewProducts";
import { adminRoutes } from "./config/routes.config";

// ── Placeholder for sections not built yet ────────────────────────────────
const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-64 gap-3">
    <p className="text-2xl font-bold" style={{ color: "#111B21" }}>
      {title}
    </p>
    <p style={{ color: "#8696A0", fontSize: 14 }}>
      This section is coming soon.
    </p>
  </div>
);

// Auth guard component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("adminAuth") === "true";
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AdminLoginPage />,
  },
  {
    path: adminRoutes.BASE,
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <Navigate
            to={`${adminRoutes.BASE}${adminRoutes.CUSTOMERS}`}
            replace
          />
        ),
      },
      {
        path: adminRoutes.CUSTOMERS.replace("/", ""),
        element: <CustomerList />,
      },
      {
        path: adminRoutes.ADD_PRODUCTS.replace("/", ""),
        element: <AddProducts />,
      },
      {
        path: adminRoutes.VIEW_PRODUCTS.replace("/", ""),
        element: <ViewProducts />,
      },
      {
        path: adminRoutes.STOCKS.replace("/", ""),
        element: <ComingSoon title="Manage Stocks" />,
      },
      {
        path: adminRoutes.ORDERS.replace("/", ""),
        element: <ComingSoon title="Orders" />,
      },
      {
        path: adminRoutes.SETTINGS.replace("/", ""),
        element: <ComingSoon title="Settings" />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
