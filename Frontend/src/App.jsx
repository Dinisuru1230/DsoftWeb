import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
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
import AboutUs from './pages/AboutUs';
import OurStory from './pages/OurStory';
import ContactUs from './pages/ContactUs';
import DeliveryInfo from './pages/DeliveryInfo';
import GetCid from './pages/GetCid';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import MyAccount from './pages/MyAccount';
import MyProfile from './pages/MyProfile';
import Terms from './pages/Terms';
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
import BankDetailsSettings from './admin/pages/BankDetailsSettings';
import InvoiceSettings from './admin/pages/InvoiceSettings';
import EmailSettings from './admin/pages/EmailSettings';
import ContactDetailsSettings from './admin/pages/ContactDetailsSettings';
import OurStoryManagement from './admin/pages/OurStoryManagement';
import ReviewManagement from './admin/pages/ReviewManagement';

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

// Admin Layout (Sidebar + Responsive Mobile Drawer + Content)
function AdminLayout({ children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-surface overflow-hidden">
      {/* Desktop Persistent Sidebar */}
      <div className="hidden md:flex flex-shrink-0 h-full">
        <AdminSidebar />
      </div>

      {/* Mobile Sticky Topbar */}
      <div className="md:hidden flex justify-between items-center w-full px-4 py-3.5 bg-surface-container-lowest border-b border-outline-variant z-40 sticky top-0 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Open Admin Menu"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <h1 className="font-title-sm text-lg text-primary font-bold">DSoft Pack Admin</h1>
        </div>
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="text-xs bg-error-container/40 text-error hover:bg-error-container px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span className="material-symbols-outlined text-[15px]">logout</span>
          Sign Out
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-slide-in">
            <AdminSidebar onClose={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Admin Content Canvas */}
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
      <p className="font-label-md text-label-md text-primary font-bold">DSoft Pack</p>
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
                padding: '10px 14px',
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
          >
            {(t) => (
              <ToastBar toast={t}>
                {({ icon, message }) => (
                  <div className="flex items-center gap-2">
                    {icon}
                    <div className="flex-1">{message}</div>
                    {t.type !== 'loading' && (
                      <button
                        type="button"
                        onClick={() => toast.dismiss(t.id)}
                        className="ml-2 p-1 rounded-full text-on-surface-variant/60 hover:text-primary hover:bg-primary-container/40 transition-colors flex items-center justify-center cursor-pointer"
                        title="Close notification"
                        aria-label="Close notification"
                      >
                        <span className="material-symbols-outlined text-[16px]">close</span>
                      </button>
                    )}
                  </div>
                )}
              </ToastBar>
            )}
          </Toaster>
          <Routes>
            {/* ── Customer Auth Pages (No Navbar/Footer) ── */}
            <Route path="/login" element={<div className="flex flex-col min-h-screen"><Login /></div>} />
            <Route path="/register" element={<div className="flex flex-col min-h-screen"><Register /></div>} />
            <Route path="/forgot-password" element={<CustomerLayout><ForgotPassword /></CustomerLayout>} />
            <Route path="/reset-password" element={<CustomerLayout><ResetPassword /></CustomerLayout>} />
            <Route path="/new-password" element={<CustomerLayout><ResetPassword /></CustomerLayout>} />

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
            <Route path="/about-us" element={<CustomerLayout><AboutUs /></CustomerLayout>} />
            <Route path="/our-story" element={<CustomerLayout><AboutUs /></CustomerLayout>} />
            <Route path="/contact" element={<CustomerLayout><ContactUs /></CustomerLayout>} />
            <Route path="/delivery-info" element={<CustomerLayout><DeliveryInfo /></CustomerLayout>} />
            <Route path="/delivery" element={<CustomerLayout><DeliveryInfo /></CustomerLayout>} />
            <Route path="/get-cid" element={<CustomerLayout><GetCid /></CustomerLayout>} />
            <Route path="/terms" element={<CustomerLayout><Terms /></CustomerLayout>} />

            {/* ── Customer Account Pages ── */}
            <Route path="/account" element={<CustomerLayout><MyAccount /></CustomerLayout>} />
            <Route path="/my-account" element={<CustomerLayout><MyAccount /></CustomerLayout>} />
            <Route path="/account/profile" element={<CustomerAccountRoute><MyProfile /></CustomerAccountRoute>} />

            {/* ── Protected Admin Panel Pages ── */}
            <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/admin/products" element={<AdminRoute><ProductManagement /></AdminRoute>} />
            <Route path="/admin/add-product" element={<AdminRoute><AddProduct /></AdminRoute>} />
            <Route path="/admin/edit-product/:id" element={<AdminRoute><AddProduct /></AdminRoute>} />
            <Route path="/admin/categories" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
            <Route path="/admin/orders" element={<AdminRoute><OrderManagement /></AdminRoute>} />
            <Route path="/admin/orders/:id" element={<AdminRoute><OrderDetails /></AdminRoute>} />
            <Route path="/admin/reviews" element={<AdminRoute><ReviewManagement /></AdminRoute>} />
            <Route path="/admin/customers" element={<AdminRoute><CustomerManagement /></AdminRoute>} />
            <Route path="/admin/admins" element={<AdminRoute><AdminManagement /></AdminRoute>} />
            <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />
            <Route path="/admin/messages" element={<AdminRoute><ContactManagement /></AdminRoute>} />
            <Route path="/admin/our-story" element={<AdminRoute><OurStoryManagement /></AdminRoute>} />
            <Route path="/admin/bank-details" element={<AdminRoute><BankDetailsSettings /></AdminRoute>} />
            <Route path="/admin/contact-details" element={<AdminRoute><ContactDetailsSettings /></AdminRoute>} />
            <Route path="/admin/invoice-settings" element={<AdminRoute><InvoiceSettings /></AdminRoute>} />
            <Route path="/admin/email-settings" element={<AdminRoute><EmailSettings /></AdminRoute>} />

            {/* ── 404 Not Found ── */}
            <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
