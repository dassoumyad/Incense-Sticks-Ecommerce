import Link from './Link.jsx'
export default function Footer() { return <footer><Link to="/" className="wordmark footer-mark"><span className="brand-mark">s</span><span>Serein<small>RITUALS FOR SLOW LIVING</small></span></Link><span>© {new Date().getFullYear()} Serein Incense. Made with intention.</span><div><Link to="/shop">Shop</Link><Link to="/contact">Contact</Link></div></footer> }
