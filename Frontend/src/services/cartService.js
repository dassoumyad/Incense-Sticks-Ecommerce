import { request } from './api.js'

export const syncCart = (items) => request('/cart/sync-cart', {
  method: 'POST',
  body: JSON.stringify({
    items: items.map((item) => ({
      productId: item._id || item.id,
      quantity: item.quantity || 1,
    })),
  }),
})
