import { request } from './api.js'

// Keep client-facing preview copy polished while the catalogue record is still
// being finalized. The product remains unchanged in the database.
const storefrontProduct = (product) => {
  if (product?._id !== '6afdc60e87add707947ff8c7') return product

  return {
    ...product,
    title: 'Temple Bloom',
    description: 'A soft jasmine floral blend, created to bring a gentle moment of calm to your daily ritual.',
    clientPreview: true,
  }
}

export const getProducts = (search = '') => request('/product/fetch-products', { method: 'POST', body: JSON.stringify({ search }) }).then((r) => (r.data || []).map(storefrontProduct))
export const getProduct = async (id) => (await getProducts()).find((p) => p._id === id)
