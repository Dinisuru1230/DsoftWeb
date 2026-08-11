import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Customer Pages
import Home from './pages/Home';
import ShopAll from './pages/ShopAll';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SecurePayment from './pages/SecurePayment';
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
  return (
    <div className="flex h-screen bg-surface overflow-hidden">
      <AdminSidebar />
      <div className="md:hidden flex justify-between items-center w-full px-5 py-4 bg-background border-b border-outline-variant z-40 sticky top-0">
        <h1 className="font-title-sm text-title-sm text-primary" style={{ fontSize: '20px' }}>Malmalee Admin</h1>
      </div>
      <main className="flex-grow overflow-y-auto bg-surface">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
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
            <Route path="/checkout/success" element={<CustomerLayout><OrderConfirmed /></CustomerLayout>} />
            <Route path="/checkout/failed" element={<CustomerLayout><PaymentUnsuccessful /></CustomerLayout>} />
            <Route path="/our-story" element={<CustomerLayout><OurStory /></CustomerLayout>} />
            <Route path="/contact" element={<CustomerLayout><ContactUs /></CustomerLayout>} />

            {/* ── Customer Account Pages ── */}
            <Route path="/account" element={<CustomerLayout><MyAccount /></CustomerLayout>} />
            <Route path="/account/profile" element={<CustomerLayout><MyProfile /></CustomerLayout>} />
            <Route path="/account/track" element={<CustomerLayout><TrackOrder /></CustomerLayout>} />

            {/* ── Admin Panel Pages (Integrated in same Frontend server) ── */}
            <Route path="/admin" element={<AdminLayout><Dashboard /></AdminLayout>} />
            <Route path="/admin/products" element={<AdminLayout><ProductManagement /></AdminLayout>} />
            <Route path="/admin/add-product" element={<AdminLayout><AddProduct /></AdminLayout>} />
            <Route path="/admin/categories" element={<AdminLayout><CategoryManagement /></AdminLayout>} />
            <Route path="/admin/orders" element={<AdminLayout><OrderManagement /></AdminLayout>} />
            <Route path="/admin/orders/:id" element={<AdminLayout><OrderDetails /></AdminLayout>} />
            <Route path="/admin/customers" element={<AdminLayout><CustomerManagement /></AdminLayout>} />

            {/* ── 404 Not Found ── */}
            <Route path="*" element={<CustomerLayout><NotFound /></CustomerLayout>} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
