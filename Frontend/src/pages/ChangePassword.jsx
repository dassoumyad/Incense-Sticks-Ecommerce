import { useState } from 'react'
import Link from '../components/Link.jsx'
import { changePassword } from '../services/authService.js'

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await changePassword(form)
      setMessage(result.message || 'Password changed successfully.')
      setForm({ currentPassword: '', password: '', confirm_password: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-page"><section className="auth-card">
    <p className="eyebrow">ACCOUNT SECURITY</p>
    <h1>Change your <em>password.</em></h1>
    <p className="auth-subtitle">Confirm your current password, then choose a new one for your account.</p>
    <form onSubmit={submit} className="form-stack">
      <label>Current password<input name="currentPassword" type="password" autoComplete="current-password" required value={form.currentPassword} onChange={update} /></label>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={update} /><small>At least 8 characters, including uppercase, lowercase, a number and a symbol.</small></label>
      <label>Confirm new password<input name="confirm_password" type="password" autoComplete="new-password" minLength="8" required value={form.confirm_password} onChange={update} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <button className="button button-dark full-button" disabled={busy}>{busy ? 'Updating password…' : 'Update password ↗'}</button>
    </form>
    <p className="auth-switch"><Link to="/orders">Back to your orders</Link></p>
  </section></main>
}
