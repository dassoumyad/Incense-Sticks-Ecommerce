import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Link from '../components/Link.jsx'
import Loader from '../components/Loader.jsx'
import { getUserOrders, resendOrderReceipt } from '../services/orderService.js'
import { imageUrl } from '../services/api.js'
import formatPrice from '../utils/formatPrice.js'

const formatDate = (value) => new Intl.DateTimeFormat('en-IN', {
  dateStyle: 'medium', timeStyle: 'short',
}).format(new Date(value))

export default function MyOrders() {
  const { isAuthenticated, email, logout } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [sendingId, setSendingId] = useState('')
  const [sessionExpired, setSessionExpired] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) { setLoading(false); return }
    getUserOrders()
      .then((result) => setOrders(result.orders || []))
      .catch((err) => {
        if (err.status === 401) {
          setSessionExpired(true)
          logout()
        } else {
          setError(err.message)
        }
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, logout])

  const resendReceipt = async (orderId) => {
    setSendingId(orderId)
    setError('')
    setNotice('')
    try {
      const result = await resendOrderReceipt(orderId)
      setNotice(result.message)
      setOrders((current) => current.map((order) => order._id === orderId
        ? { ...order, receiptEmailSentAt: result.receiptEmailSentAt }
        : order))
    } catch (err) {
      setError(err.message)
    } finally {
      setSendingId('')
    }
  }

  if (!isAuthenticated) return <main className="empty-cart"><p className="eyebrow">YOUR SEREIN ACCOUNT</p><h1>{sessionExpired ? 'Your session has expired.' : 'Sign in to view your orders.'}</h1>{sessionExpired && <p>Please sign in again to securely load your past purchases.</p>}<Link className="button button-dark" to="/login">Sign in ↗</Link></main>

  return <main className="page-wrap orders-page">
    <div className="page-title-row"><div><p className="eyebrow">YOUR ACCOUNT</p><h1>Your orders<span className="wordmark-dot">.</span></h1><p className="auth-subtitle">A little history of the calm you’ve brought home, {email}.</p></div><Link to="/shop" className="text-link">Find another ritual ↗</Link></div>
    {error && <p className="form-error order-alert">{error}</p>}
    {notice && <p className="form-success order-alert">{notice}</p>}
    {loading ? <Loader label="Finding your past purchases…" /> : orders.length === 0
      ? <div className="empty-cart order-empty"><span>✳</span><h2>Your next favourite is waiting.</h2><p>Past purchases will appear here after your first completed order.</p><Link to="/shop" className="button button-dark">Find your first ritual ↗</Link></div>
      : <div className="orders-list">{orders.map((order) => <article className="order-card" key={order._id}>
        <header className="order-card-head"><div><p className="eyebrow">ORDER PLACED</p><b>{formatDate(order.createdAt)}</b><small>Order #{order._id.slice(-8).toUpperCase()}</small></div><div className="order-total"><span className="paid-status">PAID</span><strong>{formatPrice(order.totalAmount)}</strong></div></header>
        <div className="order-items">{order.orderDetails.map((item, index) => <div className="order-item" key={`${item.productId}-${index}`}>
          {item.product_image && <img src={imageUrl(item.product_image)} alt="" loading="lazy"/>}
          <div><b>{item.product_title}</b><small>Quantity: {item.product_quantity}</small></div>
          <strong>{formatPrice(Number(item.product_price) * Number(item.product_quantity))}</strong>
        </div>)}</div>
        <details className="payment-details"><summary>Payment &amp; delivery details</summary><div className="payment-detail-grid">
          <span>Payment method<b>{(order.paymentMethod || 'Online').toUpperCase()}</b></span>
          <span>Payment ID<b>{order.razorpayPaymentId}</b></span>
          <span>Razorpay order ID<b>{order.razorpayOrderId}</b></span>
          <span>Amount paid<b>{formatPrice(order.totalAmount)} {order.currency || 'INR'}</b></span>
          <span>Delivering to<b>{order.billingAddress?.name}</b></span>
          <span>Address<b>{[order.billingAddress?.address, order.billingAddress?.city, order.billingAddress?.state, order.billingAddress?.pincode].filter(Boolean).join(', ')}</b></span>
        </div></details>
        <footer className="order-card-foot"><span>{order.receiptEmailSentAt ? `Receipt emailed ${email}` : `Receipt goes to ${email}`}</span><button disabled={sendingId === order._id} onClick={() => resendReceipt(order._id)}>{sendingId === order._id ? 'Sending…' : order.receiptEmailSentAt ? 'Resend receipt' : 'Email receipt'} ↗</button></footer>
      </article>)}</div>}
  </main>
}
