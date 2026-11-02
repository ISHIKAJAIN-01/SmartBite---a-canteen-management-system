
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "./context/CartContext.jsx";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Menu from "./pages/Menu";
import Search from "./pages/Search";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import OrderConfirmation from "./pages/OrderConfirmation";

import Admin from "./pages/Admin";

// Protect routes based on login status and user role
function ProtectedRoute({ allowedRole, children }) {
  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch {
    user = null;
  }

  // No valid stored login information
  if (!token || !user || !user.role) {
    return <Navigate to="/login" replace />;
  }

  const userRole = String(user.role).toLowerCase();

  // User has logged in but does not have the required role
  if (userRole !== allowedRole.toLowerCase()) {
    if (userRole === "admin") {
      return <Navigate to="/admin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRole="admin">
                <Admin />
              </ProtectedRoute>
            }
          />

          {/* Customer-facing application */}
          <Route
            path="/*"
            element={
              <div className="flex min-h-screen flex-col bg-[#F8F1E8]">
                <Navbar />

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<Menu />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/cart" element={<Cart />} />

                  {/* Student-only routes */}
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/my-orders"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <MyOrders />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/order-confirmation"
                    element={
                      <ProtectedRoute allowedRole="student">
                        <OrderConfirmation />
                      </ProtectedRoute>
                    }
                  />

                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Unknown customer route */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>

                <Footer />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
