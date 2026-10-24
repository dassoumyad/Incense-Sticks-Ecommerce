import Link from './Link.jsx'
import { imageUrl } from '../services/api.js'
import formatPrice from '../utils/formatPrice.js'
import { useCart } from '../context/CartContext.jsx'
export default function ProductCard({ product, index = 0 }) {
  const { addItem } = useCart()
  const img = product.image || imageUrl(product.images?.[0])
  const price = product.actualPrice ?? product.price ?? 249
  const add = () => addItem({ ...product, image: img, actualPrice: price })
  return <article className="product-card"><div className="product-visual"><Link to={`/product?id=${product._id || product.id}`} className={`product-image product-tone-${index % 3}`}><img src={img} alt={product.title} loading="lazy" />{product.tag && <span className="product-tag">{product.tag}</span>}</Link><button className="quick-add" onClick={add} aria-label={`Add ${product.title} to bag`}>+</button></div><div className="product-info"><div><Link to={`/product?id=${product._id || product.id}`}><h3>{product.title}</h3></Link><p>{product.fragranceType || product.category || 'Hand-rolled botanical incense'}</p></div><div className="product-price"><span>{formatPrice(price)}</span>{product.MRP > price && <del>{formatPrice(product.MRP)}</del>}</div></div></article>
}
