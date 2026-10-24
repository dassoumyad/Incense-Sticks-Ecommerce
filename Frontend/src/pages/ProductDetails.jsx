import { useEffect, useState } from 'react'
import { getProduct } from '../services/productService.js'
import { imageUrl } from '../services/api.js'
import { useCart } from '../context/CartContext.jsx'
import formatPrice from '../utils/formatPrice.js'
import Link from '../components/Link.jsx'
import Loader from '../components/Loader.jsx'
import showcaseProducts from '../data/showcaseProducts.js'
export default function ProductDetails({id}) { const [product,setProduct]=useState(null);const [loading,setLoading]=useState(true);const [quantity,setQuantity]=useState(1);const {addItem}=useCart();
 useEffect(()=>{getProduct(id).then((found)=>setProduct(found||showcaseProducts.find(p=>p._id===id))).catch(()=>setProduct(showcaseProducts.find(p=>p._id===id))).finally(()=>setLoading(false))},[id]);
 if(loading)return <Loader/>;if(!product)return <main className="page-wrap"><div className="empty-state">We couldn't find that scent. <Link to="/shop">Return to the collection</Link></div></main>
 const img=product.image||imageUrl(product.images?.[0]); const price=product.actualPrice||product.price||249
 return <main className="page-wrap"><div className="breadcrumbs"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link> / {product.title}</div><section className="detail-layout"><div className="detail-image"><img src={img} alt={product.title}/></div><div className="detail-copy"><p className="eyebrow">{product.brandName||'SEREIN RITUALS'}</p><h1>{product.title}</h1><p className="detail-fragrance">{product.fragranceType||product.category}</p><div className="detail-price">{formatPrice(price)} {product.MRP>price&&<del>{formatPrice(product.MRP)}</del>}</div><p className="detail-description">{product.description||'An invitation to slow down. Thoughtfully blended botanicals create a gentle fragrance for your daily ritual.'}</p><div className="detail-facts"><span>Burn time <b>{product.burningTime||'45 minutes'}</b></span><span>Weight <b>{product.weight?`${product.weight} g`:'20 sticks'}</b></span><span>Material <b>{product.material||'Botanical blend'}</b></span></div><div className="buy-row"><div className="quantity-control"><button onClick={()=>setQuantity(Math.max(1,quantity-1))}>−</button><span>{quantity}</span><button onClick={()=>setQuantity(Math.min(product.stock||10,quantity+1))}>+</button></div><button className="button button-dark" disabled={product.stock===0} onClick={()=>addItem({...product,image:img,actualPrice:price},quantity)}>{product.stock===0?'Out of stock':`Add to bag · ${formatPrice(price*quantity)}`}</button></div><p className="stock-note">{product.stock===0?'Currently out of stock':'✦ Carefully packed and ready to ship'}</p></div></section></main>
}
