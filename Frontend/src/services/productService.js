import { request } from './api.js'
export const getProducts = (search = '') => request('/product/fetch-products', { method: 'POST', body: JSON.stringify({ search }) }).then((r) => r.data || [])
export const getProduct = async (id) => (await getProducts()).find((p) => p._id === id)
