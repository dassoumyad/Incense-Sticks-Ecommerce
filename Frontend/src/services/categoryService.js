import { request } from './api.js'
export const getCategories = () => request('/category/get-all-categories').then((r) => r.categories || [])
