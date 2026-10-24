import { request } from './api.js'
export const adminLogin = (values) => request('/admin/admin-login', { method: 'POST', body: JSON.stringify(values) })
export const createAdmin = (values) => request('/admin/create-new-admin', { method: 'POST', body: JSON.stringify(values) })
export const createProduct = (form) => request('/product/create-product', { method: 'POST', body: form })
export const deleteProduct = (_id) => request('/product/delete-specific-product', { method: 'DELETE', body: JSON.stringify({ _id }) })
export const createCategory = (categoryName) => request('/category/create-category', { method: 'POST', body: JSON.stringify({ categoryName }) })
export const deleteCategory = (_id) => request('/category/delete-category', { method: 'DELETE', body: JSON.stringify({ _id }) })
export const createCoupon = (values) => request('/unused-coupon-code/create-new-coupon-code', { method: 'POST', body: JSON.stringify(values) })
export const getAdminOrders = () => request('/admin/orders')
