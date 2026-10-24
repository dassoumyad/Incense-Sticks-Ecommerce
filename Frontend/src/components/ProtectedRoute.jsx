import Link from './Link.jsx'
export default function ProtectedRoute({ children }) { return localStorage.getItem('incense_admin_token') ? children : <main className="empty-cart"><p className="eyebrow">SEREIN · ADMIN</p><h1>Sign in to manage your shop.</h1><Link to="/admin/login" className="button button-dark">Admin sign in ↗</Link></main> }
