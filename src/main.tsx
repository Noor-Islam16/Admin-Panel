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
import ManageStocks from "./pages/ManageStocks";
import Orders from "./pages/Orders";
import SettingsPage from "./pages/Settings";
// Protected Routes below
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = !!localStorage.getItem("token");
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
        element: <ManageStocks />,
      },
      {
        path: adminRoutes.ORDERS.replace("/", ""),
        element: <Orders />,
      },
      {
        path: adminRoutes.SETTINGS.replace("/", ""),
        element: <SettingsPage />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
