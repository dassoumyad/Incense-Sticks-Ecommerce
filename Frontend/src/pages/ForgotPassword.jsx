import { useState } from 'react'
import Link from '../components/Link.jsx'
import { requestPasswordResetOtp, resetPassword } from '../services/authService.js'

export default function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', otp: '', password: '', confirm_password: '' })
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const sendCode = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await requestPasswordResetOtp(form.email.trim())
      setMessage(result.message || 'A reset code has been sent to your email.')
      setForm((current) => ({ ...current, otp: '' }))
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    setMessage('')
    try {
      const result = await resetPassword({ ...form, email: form.email.trim() })
      setMessage(result.message || 'Password reset. You can sign in with your new password.')
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <main className="auth-page"><section className="auth-card">
    <p className="eyebrow">ACCOUNT RECOVERY</p>
    <h1>{step === 1 ? <>Forgot your <em>password?</em></> : step === 2 ? <>A fresh <em>start.</em></> : <>Password <em>updated.</em></>}</h1>
    <p className="auth-subtitle">{step === 1 ? 'Enter the email address connected to your account and we’ll send a reset code.' : step === 2 ? 'Enter the six-digit code from your email, then choose a new password.' : 'Your password is saved. You can now sign in with it.'}</p>
    {step === 1 ? <form onSubmit={sendCode} className="form-stack">
      <label>Email address<input name="email" type="email" autoComplete="email" required value={form.email} onChange={update} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="button button-dark full-button" disabled={busy}>{busy ? 'Sending code…' : 'Send reset code ↗'}</button>
    </form> : step === 2 ? <form onSubmit={savePassword} className="form-stack">
      <label>Email address<input type="email" value={form.email} disabled /></label>
      <label>6-digit reset code<input name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" required value={form.otp} onChange={update} /></label>
      <label>New password<input name="password" type="password" autoComplete="new-password" minLength="8" required value={form.password} onChange={update} /><small>At least 8 characters, including uppercase, lowercase, a number and a symbol.</small></label>
      <label>Confirm new password<input name="confirm_password" type="password" autoComplete="new-password" minLength="8" required value={form.confirm_password} onChange={update} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      {message && <p className="form-success" role="status">{message}</p>}
      <button className="button button-dark full-button" disabled={busy}>{busy ? 'Updating password…' : 'Save new password ↗'}</button>
      <div className="auth-step-actions"><button type="button" className="plain-action" disabled={busy} onClick={sendCode}>Resend code</button><button type="button" className="plain-action" onClick={() => { setStep(1); setError(''); setMessage('') }}>Change email</button></div>
    </form> : <div className="form-stack"><p className="form-success" role="status">{message}</p><Link className="button button-dark full-button" to="/login">Sign in with new password ↗</Link></div>}
    {step === 1 && message && <p className="form-success auth-status" role="status">{message}</p>}
    {step !== 3 && <p className="auth-switch"><Link to="/login">Back to sign in</Link></p>}
  </section></main>
}
