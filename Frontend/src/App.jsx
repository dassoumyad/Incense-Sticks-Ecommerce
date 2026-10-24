import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import Shop from './pages/Shop.jsx'
import ProductDetails from './pages/ProductDetails.jsx'
import Cart from './pages/Cart.jsx'
import Checkout from './pages/OrderCheckout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'
import AdminLogin from './pages/Admin/Login.jsx'
import AdminSignup from './pages/Admin/Signup.jsx'
import Dashboard from './pages/Admin/Dashboard.jsx'
import AdminProducts from './pages/Admin/Products.jsx'
import AddProduct from './pages/Admin/AddProduct.jsx'
import AdminCategories from './pages/Admin/Categories.jsx'
import AdminCoupons from './pages/Admin/Coupons.jsx'
import AdminOrders from './pages/Admin/Orders.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ChangePassword from './pages/ChangePassword.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { CartProvider } from './context/CartContext.jsx'

function RouteView() {
  const [location, setLocation] = useState(() => window.location.pathname + window.location.search)
  useEffect(() => {
    const update = () => setLocation(window.location.pathname + window.location.search)
    window.addEventListener('popstate', update)
    window.addEventListener('app:navigate', update)
    return () => { window.removeEventListener('popstate', update); window.removeEventListener('app:navigate', update) }
  }, [])
  const [path, query] = location.split('?')
  const customerInAdminArea = path.startsWith('/admin')
    && Boolean(localStorage.getItem('incense_token'))
    && !localStorage.getItem('incense_admin_token')
  useEffect(() => {
    if (customerInAdminArea) {
      window.history.replaceState({}, '', '/orders')
      setLocation('/orders')
    }
  }, [customerInAdminArea])
  const params = new URLSearchParams(query || '')
  if (customerInAdminArea) return <div className="app-shell"><Navbar /><MyOrders /><Footer /></div>
  if (path === '/admin/login') return <AdminLogin />
  if (path === '/admin/signup') return <AdminSignup />
  if (path.startsWith('/admin')) {
    const page = path === '/admin/products' ? <AdminProducts /> : path === '/admin/products/new' ? <AddProduct /> : path === '/admin/categories' ? <AdminCategories /> : path === '/admin/coupons' ? <AdminCoupons /> : path === '/admin/orders' ? <AdminOrders /> : <Dashboard />
    return <ProtectedRoute>{page}</ProtectedRoute>
  }
  let page
  if (path === '/') page = <Home />
  else if (path === '/shop') page = <Shop />
  else if (path === '/product') page = <ProductDetails id={params.get('id')} />
  else if (path === '/cart') page = <Cart />
  else if (path === '/checkout') page = <Checkout />
  else if (path === '/login') page = <Login />
  else if (path === '/forgot-password') page = <ForgotPassword />
  else if (path === '/account/password') page = localStorage.getItem('incense_token') ? <ChangePassword /> : <Login />
  else if (path === '/register') page = <Register />
  else if (path === '/orders') page = <MyOrders />
  else if (path === '/contact') page = <Contact />
  else page = <NotFound />
  return <div className="app-shell"><Navbar />{page}<Footer /><ChatWidget /></div>
}

export default function App() {
  return <AuthProvider><CartProvider><RouteView /></CartProvider></AuthProvider>
}
