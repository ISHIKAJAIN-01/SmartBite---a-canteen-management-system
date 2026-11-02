
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UserRound, ShieldCheck } from 'lucide-react'

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [loginType, setLoginType] = useState('customer')
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      setLoading(true)

      const endpoint =
        loginType === 'admin'
          ? 'http://localhost:5001/api/auth/admin-login'
          : 'http://localhost:5001/api/auth/login'

      const body =
        loginType === 'admin'
          ? { email, password, adminCode }
          : { email, password }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      if (!data.token || !data.user) {
        throw new Error('Login response is missing token or user details.')
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      // Notify Navbar and other components about login
      window.dispatchEvent(new Event('authChanged'))

      if (loginType === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (error) {
      setMessage(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function handleLoginType(type) {
    setLoginType(type)
    setMessage('')
    setPassword('')
    setAdminCode('')
  }

  return (
    <main className="flex min-h-[60vh] flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-2xl border border-[#E5D9C9] bg-white p-8 shadow-sm">

        <div className="mb-6 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#968575]">
            SmartBite
          </p>

          <h1 className="text-3xl font-semibold text-[#382117]">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#706052]">
            Sign in to continue to your SmartBite account.
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleLoginType('customer')}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
              loginType === 'customer'
                ? 'border-[#382117] bg-[#382117] text-white'
                : 'border-[#E5D9C9] bg-white text-[#706052] hover:bg-[#F8F1E8]'
            }`}
          >
            <UserRound size={17} />
            Customer
          </button>

          <button
            type="button"
            onClick={() => handleLoginType('admin')}
            className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-3 text-sm font-semibold transition ${
              loginType === 'admin'
                ? 'border-[#382117] bg-[#382117] text-white'
                : 'border-[#E5D9C9] bg-white text-[#706052] hover:bg-[#F8F1E8]'
            }`}
          >
            <ShieldCheck size={17} />
            Admin
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#382117]"
            >
              {loginType === 'admin'
                ? 'Admin email address'
                : 'College email address'}
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#E5D9C9] px-4 py-3 text-[#382117] outline-none transition focus:border-[#968575] focus:ring-2 focus:ring-[#EADCC3]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-[#382117]"
            >
              Password
            </label>

            <div className="flex items-center rounded-lg border border-[#E5D9C9] focus-within:border-[#968575] focus-within:ring-2 focus-within:ring-[#EADCC3]">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-w-0 flex-1 rounded-lg bg-transparent px-4 py-3 text-[#382117] outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="px-3 py-3 text-sm font-medium text-[#706052] hover:text-[#382117]"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {loginType === 'admin' && (
            <div>
              <label
                htmlFor="adminCode"
                className="mb-2 block text-sm font-medium text-[#382117]"
              >
                Admin Access Code
              </label>

              <input
                id="adminCode"
                name="adminCode"
                type="password"
                required
                autoComplete="off"
                placeholder="Enter admin access code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full rounded-lg border border-[#E5D9C9] px-4 py-3 text-[#382117] outline-none transition focus:border-[#968575] focus:ring-2 focus:ring-[#EADCC3]"
              />

              <p className="mt-2 text-xs leading-5 text-[#968575]">
                Restricted to authorised SmartBite administrators.
              </p>
            </div>
          )}

          {message && (
            <p
              role="alert"
              className="rounded-lg bg-[#F2E6D1] p-3 text-sm leading-5 text-[#382117]"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#382117] px-4 py-3 font-semibold text-white transition hover:bg-[#503325] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-[#968575] focus:ring-offset-2"
          >
            {loading
              ? 'Signing in...'
              : loginType === 'admin'
                ? 'Admin Sign In'
                : 'Customer Sign In'}
          </button>
        </form>

        {loginType === 'customer' && (
          <p className="mt-6 text-center text-sm text-[#706052]">
            New to SmartBite?{' '}
            <Link
              to="/register"
              className="font-semibold text-[#382117] underline underline-offset-4 hover:text-[#503325]"
            >
              Create an account
            </Link>
          </p>
        )}

        {loginType === 'admin' && (
          <p className="mt-6 text-center text-sm text-[#706052]">
            Admin accounts are created by authorised administrators.
          </p>
        )}
      </section>
    </main>
  )
}

export default Login
