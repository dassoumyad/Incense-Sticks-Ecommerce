import { useState } from 'react'
import Link from '../../components/Link.jsx'
import { createAdmin } from '../../services/adminService.js'

const initialForm = {
  name: '', storeName: '', email: '', mobileNumber: '',
  payoutMethod: 'upi', upiId: '', accountHolderName: '', accountNumber: '', ifscCode: '',
  adminSignupSecret: '', password: '', confirm_password: '',
}

export default function AdminSignup() {
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    try {
      const result = await createAdmin(form)
      localStorage.removeItem('incense_token')
      localStorage.removeItem('incense_email')
      localStorage.setItem('incense_admin_token', result.token)
      localStorage.setItem('incense_admin_name', result.admin?.name || form.name)
      window.history.pushState({}, '', '/admin')
      window.dispatchEvent(new Event('app:navigate'))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-page admin-signup-page"><section className="auth-card admin-signup-card">
    <p className="eyebrow">SEREIN STUDIO · GET STARTED</p>
    <h1>Open your <em>studio.</em></h1>
    <p className="auth-subtitle">Use the deployment setup code to create the first admin. After that, an existing admin must be signed in to authorize additional admin registrations. Approved admins share this store, including its products and order history.</p>
    <form className="form-stack" onSubmit={submit}>
      <h2 className="admin-signup-section">Admin details</h2>
      <div className="form-two">
        <label>Your name<input name="name" autoComplete="name" required value={form.name} onChange={update} /></label>
        <label>Store name<input name="storeName" required value={form.storeName} onChange={update} /></label>
      </div>
      <div className="form-two">
        <label>Email address<input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></label>
        <label>Mobile number<input name="mobileNumber" type="tel" autoComplete="tel" required value={form.mobileNumber} onChange={update} /></label>
      </div>

      <h2 className="admin-signup-section">Payout details</h2>
      <label>Payout method<select name="payoutMethod" value={form.payoutMethod} onChange={update}><option value="upi">UPI</option><option value="bank">Bank transfer</option></select></label>
      {form.payoutMethod === 'upi' ? <label>UPI ID<input name="upiId" placeholder="name@bank" autoComplete="off" required value={form.upiId} onChange={update} /></label> : <>
        <label>Account holder name<input name="accountHolderName" autoComplete="name" required value={form.accountHolderName} onChange={update} /></label>
        <div className="form-two">
          <label>Bank account number<input name="accountNumber" inputMode="numeric" autoComplete="off" pattern="[0-9]{8,18}" required value={form.accountNumber} onChange={update} /></label>
          <label>IFSC code<input name="ifscCode" autoComplete="off" minLength="11" maxLength="11" required value={form.ifscCode} onChange={(event) => setForm((current) => ({ ...current, ifscCode: event.target.value.toUpperCase() }))} /></label>
        </div>
      </>}
      <p className="admin-payment-note">Your UPI ID is saved as payout information only. Razorpay test-mode payments are simulated and do not transfer money to UPI. All approved admins can view the same store orders and customer details.</p>

      <h2 className="admin-signup-section">Secure your account</h2>
      <label>First admin setup code<input name="adminSignupSecret" type="password" autoComplete="off" value={form.adminSignupSecret} onChange={update} /><small>Only needed when creating the first admin. Find this code in your deployment environment settings.</small></label>
      <div className="form-two">
        <label>Password<input name="password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={update} /><small>Use uppercase, lowercase, a number and a symbol.</small></label>
        <label>Confirm password<input name="confirm_password" type="password" autoComplete="new-password" minLength="8" required value={form.confirm_password} onChange={update} /></label>
      </div>
      {error && <p className="form-error" role="alert">{error}{error.toLowerCase().includes('existing admin') && <> <Link to="/admin/login">Admin sign in ↗</Link></>}</p>}
      <button className="button button-dark full-button" disabled={busy}>{busy ? 'Creating studio…' : 'Create admin account ↗'}</button>
    </form>
    <p className="auth-switch">Already have an admin account? <Link to="/admin/login">Sign in</Link></p>
  </section></main>
}
