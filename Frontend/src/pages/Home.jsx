import { useEffect, useState } from 'react'
import Hero from '../components/Hero.jsx'
import ProductCard from '../components/ProductCard.jsx'
import Link from '../components/Link.jsx'
import showcaseProducts from '../data/showcaseProducts.js'
import { getProducts } from '../services/productService.js'
export default function Home() {
  const [products, setProducts] = useState(showcaseProducts)
  useEffect(() => { getProducts().then((data) => { if (data.length) setProducts(data.slice(0, 4)) }).catch(() => {}) }, [])
  return <main><Hero/><div className="benefits"><div>✧ <span>Small-batch, hand-rolled</span></div><i/><div>♧ <span>Clean, mindful ingredients</span></div><i/><div><span className="benefit-spark">✳</span><span>Made for everyday rituals</span></div></div>
    <section className="section-wrap"><div className="section-heading"><div><p className="eyebrow">FIND YOUR MOMENT</p><h2>Quiet favourites<span className="wordmark-dot">.</span></h2></div><Link to="/shop" className="text-link">View all scents <span>↗</span></Link></div><div className="product-grid">{products.map((p, i) => <ProductCard key={p._id || p.id} product={p} index={i}/>)}</div>{products === showcaseProducts && <p className="demo-note">A few favourites to get you started. Connect the shop API to see your full collection.</p>}</section>
    <section className="story-band" id="story"><div className="story-image"/><div className="story-copy"><p className="eyebrow">A SLOWER KIND OF LUXURY</p><h2>Made to bring<br/>you <em>back.</em></h2><p>In a world that asks us to rush, we believe in small pauses. Every Serein stick is made with care, using considered ingredients and traditional craft.</p><Link to="/shop" className="text-link">Discover our rituals <span>↗</span></Link></div></section>
    <section className="newsletter"><p className="eyebrow">A NOTE FROM SEREIN</p><h2>Make space for calm.</h2><p>Thoughtful notes, new rituals and little moments of inspiration.</p><form onSubmit={(e)=>{e.preventDefault();e.currentTarget.reset();window.dispatchEvent(new CustomEvent('app:toast',{detail:'Thank you for joining our circle.'}))}}><label className="sr-only" htmlFor="newsletter-email">Your email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required/><button aria-label="Subscribe">↗</button></form></section>
  </main>
}
