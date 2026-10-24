import Link from './Link.jsx'
export default function CategoryCard({ name, image, count }) { return <Link to={`/shop?category=${encodeURIComponent(name)}`} className="category-card"><img src={image} alt=""/><span>{name}</span><small>{count || 'Discover the collection'} ↗</small></Link> }
