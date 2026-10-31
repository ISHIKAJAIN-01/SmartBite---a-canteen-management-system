import { useState } from 'react'
import { Link } from 'react-router-dom'

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password')
    const confirmPassword = formData.get('confirmPassword')

    setMessage('')
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.')
      return
    }

    setMessage(
      'Form validated successfully! Account creation will be available after backend integration.'
    )

    event.currentTarget.reset()
    setShowPassword(false)
    setShowConfirmPassword(false)
  }

  return (
    <main className="flex min-h-[60vh] flex-1 items-center justify-center px-6 py-16">
      <section className="w-full max-w-md rounded-2xl border border-[#E5D9C9] bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#968575]">
            SmartBite
          </p>

          <h1 className="text-3xl font-semibold text-[#382117]">
            Create an account
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#706052]">
            Join SmartBite to make your college canteen ordering easier.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-[#382117]"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              required
              minLength={2}
              autoComplete="name"
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-[#E5D9C9] px-4 py-3 text-[#382117] outline-none transition focus:border-[#968575] focus:ring-2 focus:ring-[#EADCC3]"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-[#382117]"
            >
              College email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
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
                minLength={8}
                autoComplete="new-password"
                placeholder="At least 8 characters"
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

            <p className="mt-1 text-xs text-[#968575]">
              Use at least 8 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-[#382117]"
            >
              Confirm password
            </label>

            <div className="flex items-center rounded-lg border border-[#E5D9C9] focus-within:border-[#968575] focus-within:ring-2 focus-within:ring-[#EADCC3]">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="Enter your password again"
                className="min-w-0 flex-1 rounded-lg bg-transparent px-4 py-3 text-[#382117] outline-none"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                aria-label={
                  showConfirmPassword
                    ? 'Hide confirmation password'
                    : 'Show confirmation password'
                }
                className="px-3 py-3 text-sm font-medium text-[#706052] hover:text-[#382117]"
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          {message && (
            <p
              role="status"
              className="rounded-lg bg-[#F2E6D1] p-3 text-sm leading-5 text-[#382117]"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#382117] px-4 py-3 font-semibold text-white transition hover:bg-[#503325] focus:outline-none focus:ring-2 focus:ring-[#968575] focus:ring-offset-2"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#706052]">
          Already registered?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#382117] underline underline-offset-4 hover:text-[#503325]"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Register