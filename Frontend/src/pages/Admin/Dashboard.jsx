import { useEffect, useState } from 'react'
import AdminSidebar from '../../components/AdminSidebar.jsx'
import { getProducts } from '../../services/productService.js'
import { getCategories } from '../../services/categoryService.js'
import { getAdminOrders } from '../../services/adminService.js'
import Link from '../../components/Link.jsx'
import formatPrice from '../../utils/formatPrice.js'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: '—', categories: '—', orders: '—', revenue: null })

  useEffect(() => {
    Promise.allSettled([getProducts(), getCategories(), getAdminOrders()]).then(([products, categories, orders]) => {
      setStats({
        products: products.status === 'fulfilled' ? products.value.length : '—',
        categories: categories.status === 'fulfilled' ? categories.value.length : '—',
        orders: orders.status === 'fulfilled' ? orders.value.totalOrders : '—',
        revenue: orders.status === 'fulfilled' ? orders.value.totalRevenue : null,
      })
    })
  }, [])

  return <div className="admin-layout">
    <AdminSidebar />
    <main className="admin-main">
      <p className="eyebrow">YOUR STORE AT A GLANCE</p>
      <h1>Good day, {localStorage.getItem('incense_admin_name') || 'Studio'}.</h1>
      <p className="admin-sub">See your collection and completed customer purchases.</p>
      <div className="admin-stats">
        <article><small>PRODUCTS</small><b>{stats.products}</b><Link to="/admin/products">Manage collection ↗</Link></article>
        <article><small>CATEGORIES</small><b>{stats.categories}</b><Link to="/admin/categories">Manage categories ↗</Link></article>
        <article><small>PAID ORDERS</small><b>{stats.orders}</b>{stats.revenue !== null ? <p>{formatPrice(stats.revenue)} total received</p> : <p>Completed payment orders</p>}<Link to="/admin/orders">View orders ↗</Link></article>
      </div>
      <section className="admin-panel"><h2>Set up your collection</h2><p>Create a category for your scents, then add product details, prices, stock and photos.</p><div><Link className="button button-dark" to="/admin/categories">{stats.categories === 0 ? 'Create your first category ↗' : 'Manage categories ↗'}</Link><Link className="button button-outline" to="/admin/products/new">Add a product ↗</Link></div></section>
    </main>
  </div>
}
