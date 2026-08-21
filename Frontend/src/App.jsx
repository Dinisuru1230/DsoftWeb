import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import Home from './pages/Home';
import ShopAll from './pages/ShopAll';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SecurePayment from './pages/SecurePayment';
import BankSlipUpload from './pages/BankSlipUpload';
import OrderConfirmed from './pages/OrderConfirmed';
import PaymentUnsuccessful from './pages/PaymentUnsuccessful';
import OurStory from './pages/OurStory';
import ContactUs from './pages/ContactUs';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NewPassword from './pages/NewPassword';
import MyAccount from './pages/MyAccount';
import MyProfile from './pages/MyProfile';
import TrackOrder from './pages/TrackOrder';
import NotFound from './pages/NotFound';

// Admin Components & Pages
import AdminSidebar from './admin/components/AdminSidebar';
import Dashboard from './admin/pages/Dashboard';
import ProductManagement from './admin/pages/ProductManagement';
import AddProduct from './admin/pages/AddProduct';
import CategoryManagement from './admin/pages/CategoryManagement';
import OrderManagement from './admin/pages/OrderManagement';
import OrderDetails from './admin/pages/OrderDetails';
import CustomerManagement from './admin/pages/CustomerManagement';
import AdminManagement from './admin/pages/AdminManagement';
import AdminProfile from './admin/pages/AdminProfile';
import ContactManagement from './admin/pages/ContactManagement';
import DeliverySettings from './admin/pages/DeliverySettings';
import BankDetailsSettings from './admin/pages/BankDetailsSettings';

// Customer Layout (Navbar + Content + Footer)
function CustomerLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex flex-col">
        {children}
      </div>
      <Footer />
    </div>
  );
}

// Admin Layout (Sidebar + Content)
function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col md:flex-row h-screen bg-surface overflow-hidden">
      <AdminSidebar />
      <div className="md:hidden flex justify-between items-center w-full px-5 py-4 bg-background border-b border-outline-variant z-40 sticky top-0 flex-shrink-0">
        <h1 className="font-title-sm text-title-sm text-primary" style={{ fontSize: '20px' }}>Malmalee Admin</h1>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-xs bg-error-container text-error px-3 py-1.5 rounded-md font-bold flex items-center gap-1 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Log Out
        </button>
      </div>
      <main className="flex-grow overflow-y-auto bg-surface w-full">
        {children}
      </main>
    </div>
  );
}

function PageLoader() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-background gap-3">
      <span className="material-symbols-outlined animate-spin text-primary text-4xl">sync</span>
      <p className="font-label-md text-label-md text-primary font-bold">Malmalee Creations</p>
    </div>
  );
}

// Route Guard for Admin Pages
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }
  return <AdminLayout>{children}</AdminLayout>;
}

// Route Guard for Customer Account Pages (ADMIN should never see Customer profile pages)
function CustomerAccountRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (user.role === 'ADMIN') {
    // Admin accidentally hitting a customer route → send to admin dashboard
    return <Navigate to="/admin" replace />;
  }
  return <CustomerLayout>{children}</CustomerLayout>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#2d1527',
                border: '1px solid rgba(224, 185, 203, 0.5)',
                padding: '14px 18px',
                borderRadius: '14px',
                boxShadow: '0 10px 30px rgba(74, 25, 66, 0.12)',
                fontSize: '14px',
                fontWeight: '500',
              },
              success: {
                iconTheme: {
                  primary: '#852e69',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ba1a1a',
                  secondary: '#ffffff',
                },
              },
            }}
          />
          <Routes>
            {/* ── Customer Auth Pages (No Navbar/Footer) ── */}
            <Route path="/login" element={<div className="flex flex-col min-h-screen"><Login /></div>} />
            <Route path="/register" element={<div className="flex flex-col min-h-screen"><Register /></div>} />
            <Route path="/forgot-password" element={<CustomerLayout><ForgotPassword /></CustomerLayout>} />
            <Route path="/new-password" element={<CustomerLayout><NewPassword /></CustomerLayout>} />

            {/* ── Customer Shop Pages ── */}
            <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
            <Route path="/shop" element={<CustomerLayout><ShopAll /></CustomerLayout>} />
            <Route path="/collections" element={<CustomerLayout><ShopAll /></CustomerLayout>} />
            <Route path="/journal" element={<CustomerLayout><OurStory /></CustomerLayout>} />
            <Route path="/product/:id" element={<CustomerLayout><ProductDetail /></CustomerLayout>} />
            <Route path="/cart" element={<CustomerLayout><Cart /></CustomerLayout>} />
            <Route path="/checkout" element={<CustomerLayout><Checkout /></CustomerLayout>} />
            <Route path="/checkout/payment" element={<CustomerLayout><SecurePayment /></CustomerLayout>} />
            <Route path="/checkout/bank-slip" element={<CustomerLayout><BankSlipUpload /></CustomerLayout>} />
            <Route path="/checkout/success" element={<CustomerLayout><OrderConfirmed /></CustomerLayout>} />
            <Route path="/checkout/failed" element={<CustomerLayout><PaymentUnsuccessful /></CustomerLayout>} />
            <Route path="/our-story" element={<CustomerLayout><OurStory /></CustomerLayout>} />
            <Route path="/contact" element={<CustomerLayout><ContactUs /></CustomerLayout>} />

            {/* ── Protected Customer Account Pages ── */}
            <Route path="/account" element={<CustomerAccountRoute><MyAccount /></CustomerAccountRoute>} />
            <Route path="/account/profile" element={<CustomerAccountRoute><MyProfile /></CustomerAccountRoute>} />
            <Route path="/account/track" element={<CustomerAccountRoute><TrackOrder /></CustomerAccountRoute>} />

            {/* ── Protected Admin Panel Pages ── */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
            <Route path="/admin/add-product" element={<AdminRoute><AddProduct /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><OrderManagement /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><OrderDetails /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><CustomerManagement /></AdminRoute>} />
            <Route path="/admin/admins" element={<AdminRoute><AdminManagement /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><ContactManagement /></AdminRoute>} />
            <Route path="/admin/delivery-settings" element={<AdminRoute><DeliverySettings /></AdminRoute>} />
            <Route path="/admin/bank-details" element={<AdminRoute><BankDetailsSettings /></AdminRoute>} />

            {/* ── 404 Not Found ── */}
            <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
