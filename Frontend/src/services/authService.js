import { request } from './api.js'
export const sendOtp = (email) => request('/user/generate-otp-user', { method: 'POST', body: JSON.stringify({ email }) })
export const registerUser = (values) => request('/user/create-new-user', { method: 'POST', body: JSON.stringify(values) })
export const loginUser = (values) => request('/user/login-user', { method: 'POST', body: JSON.stringify(values) })
export const requestPasswordResetOtp = (email) => request('/user/request-password-reset-otp', { method: 'POST', body: JSON.stringify({ email }) })
export const resetPassword = (values) => request('/user/reset-password', { method: 'POST', body: JSON.stringify(values) })
export const changePassword = (values) => request('/user/change-password', { method: 'POST', body: JSON.stringify(values) })
