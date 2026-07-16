import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { db } from '@/api/rehbarClient';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';

function DynamicSeoManager() {
  const location = useLocation();

  useEffect(() => {
    async function updateSeo() {
      try {
        const seoData = await db.entities.SiteSetting.get('seo_settings');
        if (!seoData || !seoData.value) return;
        const seo = typeof seoData.value === 'string' ? JSON.parse(seoData.value) : seoData.value;
        
        if (!location.pathname.startsWith('/product/') && !location.pathname.startsWith('/journal/') && !location.pathname.startsWith('/article/')) {
          const title = seo.default_meta_title || "REHBAR — رهبر — Lead With Purpose";
          const desc = seo.default_meta_description || "Rehbar is a quarterly act of community expressed through apparel. Every design is a story. 100 each.";
          
          document.title = title;
          
          let metaDesc = document.querySelector('meta[name="description"]');
          if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
          }
          metaDesc.setAttribute('content', desc);

          let ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', title);

          let ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) ogDesc.setAttribute('content', desc);
        }
      } catch (err) {}
    }
    updateSeo();
  }, [location.pathname]);

  return null;
}
import Home from '@/pages/Home';
import ProductDetail from '@/pages/ProductDetail';
import Article from '@/pages/Article';
import Journal from '@/pages/Journal';
import JournalArticle from '@/pages/JournalArticle';
import Collection from '@/pages/Collection';
import About from '@/pages/About';
import Contact from '@/pages/Contact';
import FAQ from '@/pages/FAQ';
import Checkout from '@/pages/Checkout';
import OrderConfirmation from '@/pages/OrderConfirmation';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import { CartProvider } from '@/lib/CartContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminCustomers from '@/pages/admin/AdminCustomers';
import AdminJournal from '@/pages/admin/AdminJournal';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminInventory from '@/pages/admin/AdminInventory';
import AdminPages from '@/pages/admin/AdminPages';
import AdminMedia from '@/pages/admin/AdminMedia';
import AdminCoupons from '@/pages/admin/AdminCoupons';
import AdminAnalytics from '@/pages/admin/AdminAnalytics';
import AdminReports from '@/pages/admin/AdminReports';
import AdminShipping from '@/pages/admin/AdminShipping';
import AdminPayments from '@/pages/admin/AdminPayments';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminRoles from '@/pages/admin/AdminRoles';
import Login from '@/pages/Login';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0F0F0F]">
        <div className="w-8 h-8 border-4 border-[#333] border-t-[#C4311E] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Home />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/article/:slug" element={<Article />} />
      <Route path="/collection" element={<Collection />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/journal/:slug" element={<JournalArticle />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmation />} />
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/products" element={<AdminProducts />} />
          <Route path="/admin/categories" element={<AdminCategories />} />
          <Route path="/admin/inventory" element={<AdminInventory />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/customers" element={<AdminCustomers />} />
          <Route path="/admin/journal" element={<AdminJournal />} />
          <Route path="/admin/pages" element={<AdminPages />} />
          <Route path="/admin/media" element={<AdminMedia />} />
          <Route path="/admin/coupons" element={<AdminCoupons />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/reports" element={<AdminReports />} />
          <Route path="/admin/shipping" element={<AdminShipping />} />
          <Route path="/admin/payments" element={<AdminPayments />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/roles" element={<AdminRoles />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <DynamicSeoManager />
          <CartProvider>
            <AuthenticatedApp />
          </CartProvider>
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App