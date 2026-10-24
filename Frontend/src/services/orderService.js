import { request } from './api.js'
export const createOrder = (couponCode = '') => request('/order/create-user-order', { method: 'POST', body: JSON.stringify(couponCode ? { couponCode } : {}) })
export const verifyOrder = (values) => request('/order/verify-user-order', { method: 'POST', body: JSON.stringify(values) })
export const getUserOrders = () => request('/order/get-user-orders')
export const resendOrderReceipt = (orderId) => request('/order/resend-order-receipt', { method: 'POST', body: JSON.stringify({ orderId }) })
