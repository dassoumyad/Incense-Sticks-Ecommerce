import { useEffect, useState } from 'react'
import AdminSidebar from '../../components/AdminSidebar.jsx'
import Loader from '../../components/Loader.jsx'
import { getAdminOrders } from '../../services/adminService.js'
import { imageUrl } from '../../services/api.js'
import formatPrice from '../../utils/formatPrice.js'

const formatDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Date unavailable'

export default function Orders() {
  const [data, setData] = useState({ orders: [], totalOrders: 0, totalRevenue: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getAdminOrders()
      .then((result) => setData({ orders: result.orders || [], totalOrders: result.totalOrders || 0, totalRevenue: result.totalRevenue || 0 }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return <div className="admin-layout">
    <AdminSidebar />
    <main className="admin-main">
      <div className="admin-head"><div><p className="eyebrow">FULFILMENT</p><h1>Orders</h1></div></div>
      {error && <p className="form-error">{error}</p>}
      {!error && <div className="admin-order-summary"><article><small>PAID ORDERS</small><b>{data.totalOrders}</b></article><article><small>TOTAL RECEIVED</small><b>{formatPrice(data.totalRevenue)}</b></article></div>}
      {loading ? <Loader label="Loading customer orders…" /> : error ? null : data.orders.length === 0
        ? <div className="admin-panel"><span className="category-icon">✳</span><h2>No completed orders yet</h2><p>Orders will appear here after a customer completes payment.</p></div>
        : <div className="admin-orders-list">{data.orders.map((order) => {
          const address = order.billingAddress || {}
          return <article className="admin-order-card" key={order._id}>
            <header className="admin-order-head"><div><p className="eyebrow">ORDER PLACED</p><b>{formatDate(order.createdAt)}</b><small>Order #{String(order._id).slice(-8).toUpperCase()}</small></div><div className="admin-order-total"><span className="paid-status">PAID</span><strong>{formatPrice(order.totalAmount)}</strong></div></header>
            <div className="admin-order-items">{(order.orderDetails || []).map((item, index) => <div className="admin-order-item" key={`${item.productId || item.product_title}-${index}`}>
              {item.product_image && <img src={imageUrl(item.product_image)} alt="" loading="lazy" />}
              <span><b>{item.product_title}</b><small>Quantity: {item.product_quantity}</small></span>
              <strong>{formatPrice(Number(item.product_price) * Number(item.product_quantity))}</strong>
            </div>)}</div>
            <details className="payment-details"><summary>Customer, payment &amp; delivery details</summary><div className="payment-detail-grid">
              <span>Customer<b>{address.name || '—'}</b></span>
              <span>Email<b>{address.email || '—'}</b></span>
              <span>Mobile<b>{address.mobileNo || '—'}</b></span>
              <span>Payment method<b>{(order.paymentMethod || 'Online').toUpperCase()}</b></span>
              <span>Payment ID<b>{order.razorpayPaymentId || '—'}</b></span>
              <span>Razorpay order ID<b>{order.razorpayOrderId || '—'}</b></span>
              <span>Address<b>{[address.address, address.city, address.state, address.pincode].filter(Boolean).join(', ') || '—'}</b></span>
              <span>Receipt email<b>{order.receiptEmailSentAt ? `Sent ${formatDate(order.receiptEmailSentAt)}` : 'Not confirmed'}</b></span>
            </div></details>
          </article>
        })}</div>}
    </main>
  </div>
}
