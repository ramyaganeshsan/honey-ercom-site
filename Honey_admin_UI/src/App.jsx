import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UsersPage from './pages/users/UsersPage'
import CategoriesPage from './pages/categories/CategoriesPage'
import ProductsPage from './pages/products/ProductsPage'
import {
  OrderDetailPage,
  OrdersListPage,
} from './pages/orders/OrdersPage'
import TransactionsPage from './pages/transactions/TransactionsPage'
import PromocodesPage from './pages/promocodes/PromocodesPage'
import CmsPage from './pages/cms/CmsPage'
import BannersPage from './pages/banners/BannersPage'
import ReviewsPage from './pages/reviews/ReviewsPage'
import SettingsPage from './pages/settings/SettingsPage'
import ShippingPage from './pages/shipping/ShippingPage'
import ContactPage from './pages/contact/ContactPage'
import ReportsPage from './pages/reports/ReportsPage'
import './styles/admin.css'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="orders" element={<OrdersListPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="promocodes" element={<PromocodesPage />} />
            <Route path="cms" element={<CmsPage />} />
            <Route path="banners" element={<BannersPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="shipping" element={<ShippingPage />} />
            <Route path="contact" element={<ContactPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} theme="light" />
    </BrowserRouter>
  )
}
