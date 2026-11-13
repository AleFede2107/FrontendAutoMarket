import { BrowserRouter, Route, Routes } from 'react-router'
import AdminLayout from './layouts/AdminLayout.jsx'
import PublicLayout from './layouts/PublicLayout.jsx'
import CartPage from './pages/Cart/CartPage.jsx'
import CatalogPage from './pages/Catalog/CatalogPage.jsx'
import HomePage from './pages/Home/HomePage.jsx'
import DashboardPage from './pages/admin/DashboardPage.jsx'
import LoginPage from './pages/admin/LoginPage.jsx'
import OrdersPage from './pages/admin/OrdersPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="autos" element={<CatalogPage />} />
          <Route path="carrito" element={<CartPage />} />
        </Route>
        <Route path="login" element={<LoginPage />} />
        <Route path="admin/login" element={<LoginPage />} />
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="ordenes" element={<OrdersPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
