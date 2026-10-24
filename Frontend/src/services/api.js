const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:8500/api')

export async function request(path, options = {}) {
  const isAdminRequest = path.startsWith('/admin/') || ['/product/create-product', '/product/update-product', '/product/delete-specific-product', '/category/create-category', '/category/update-category', '/category/delete-category', '/unused-coupon-code/create-new-coupon-code', '/unused-coupon-code/delete-exist-coupon-code', '/contact/get-all-contacts', '/contact/delete-contact'].includes(path)
  const token = isAdminRequest ? localStorage.getItem('incense_admin_token') : localStorage.getItem('incense_token')
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { token } : {}), ...options.headers }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || data.success === false) {
    const error = new Error(data.message || data.errors?.[0]?.msg || 'Something went wrong. Please try again.')
    error.status = response.status
    throw error
  }
  return data
}

export const imageUrl = (image) => {
  if (!image) return ''
  if (/^(https?:|data:|blob:)/i.test(image)) return image
  const origin = API_BASE.replace(/\/api\/?$/, '')
  return `${origin}/assets/product_images/${image}`
}
