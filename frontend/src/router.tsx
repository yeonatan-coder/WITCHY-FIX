
import * as React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AdminLayout from './layouts/AdminLayout'

import HomePage from './pages/app/HomePage'
import ProductPage from './pages/app/ProductPage'
import CheckoutPage from './pages/app/CheckoutPage'
import SearchPage from './pages/app/SearchPage'

import LoginPage from './pages/LoginPage'
import BusinessesPage from './pages/admin/BusinessesPage'
import BusinessNewPage from './pages/admin/BusinessNewPage'
import BusinessProductsPage from './pages/admin/BusinessProductsPage'
import OrdersPage from './pages/admin/OrdersPage'
import SystemSettingsPage from './pages/admin/SystemSettingsPage'

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/auth/jwt/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/product/:catalogueId" element={<ProductPage />} />
        <Route path="/checkout/:checkoutId" element={<CheckoutPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/businesses/new" element={<BusinessNewPage />} />
        <Route path="/businesses/:businessId/products" element={<BusinessProductsPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/system/settings" element={<SystemSettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/home" replace />} />
    </Routes>
  )
}
