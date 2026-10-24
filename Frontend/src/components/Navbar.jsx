import { useState } from 'react'
import Link from './Link.jsx'
import { useCart } from '../context/CartContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { count } = useCart()
  const { isAuthenticated, email, logout } = useAuth()
  const close = () => setOpen(false)
  return <><div className="announcement">A little calm, delivered to your door <span>✦</span> Complimentary shipping over ₹999</div><header className="site-header">
    <button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? '×' : '☰'}</button>
    <Link to="/" className="wordmark"><span className="brand-mark">s</span><span>Serein<small>RITUALS FOR SLOW LIVING</small></span></Link>
    <nav className={`main-nav ${open ? 'nav-open' : ''}`}><Link to="/" onClick={close}>Home</Link><Link to="/shop" onClick={close}>Shop all</Link><Link to="/orders" onClick={close}>Orders</Link>{isAuthenticated&&<Link to="/account/password" onClick={close}>Password</Link>}<a href="/#story" onClick={close}>Our story</a><Link to="/contact" onClick={close}>Contact</Link></nav>
    <div className="header-actions"><Link className="account-link" to={isAuthenticated ? '/orders' : '/login'}>{isAuthenticated ? email?.split('@')[0] : 'Account'}</Link>{isAuthenticated && <button className="icon-button account-link" onClick={logout}>Sign out</button>}<Link to="/cart" className="bag-link"><span>Bag</span><span className="bag-count">{count}</span></Link></div>
  </header></>
}
