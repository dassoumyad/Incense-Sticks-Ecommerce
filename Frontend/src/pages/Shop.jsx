import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../services/productService.js'
import ProductCard from '../components/ProductCard.jsx'
import Loader from '../components/Loader.jsx'
import showcaseProducts from '../data/showcaseProducts.js'
export default function Shop() {
 const [products,setProducts]=useState([]); const [loading,setLoading]=useState(true); const [query,setQuery]=useState(''); const [category,setCategory]=useState(new URLSearchParams(window.location.search).get('category')||'All scents');
 useEffect(()=>{getProducts().then(setProducts).catch(()=>setProducts(showcaseProducts)).finally(()=>setLoading(false))},[])
 const cats=['All scents',...new Set(products.map(p=>p.category).filter(Boolean))]
 const filtered=useMemo(()=>products.filter(p=>(category==='All scents'||p.category===category)&&`${p.title} ${p.fragranceType||''}`.toLowerCase().includes(query.toLowerCase())),[products,category,query])
 return <main className="page-wrap"><section className="page-intro"><p className="eyebrow">THE SEREIN COLLECTION</p><h1>Find your <em>stillness.</em></h1><p>Small-batch incense, thoughtfully made for the moments that matter.</p></section><div className="shop-tools"><div className="category-tabs">{cats.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><input aria-label="Search scents" placeholder="Search the collection…" value={query} onChange={e=>setQuery(e.target.value)}/></div>{loading?<Loader/>:<><p className="results-copy">Showing {filtered.length} {filtered.length===1?'scent':'scents'}{category!=='All scents'&&` in ${category}`}</p><div className="product-grid">{filtered.length?filtered.map((p,i)=><ProductCard key={p._id||p.id} product={p} index={i}/>):<div className="empty-state">No scents found. Try another search.</div>}</div></>}</main>
}
