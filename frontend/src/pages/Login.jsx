import { useState } from 'react'
import { Link } from 'react-router-dom'

function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    setMessage(
      'Login form submitted. Account verification will be available after backend integration.'
    )
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
            Sign in to order your favourite college canteen meals.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
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
                autoComplete="current-password"
                placeholder="Enter your password"
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
            Sign in
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#706052]">
          New to SmartBite?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#382117] underline underline-offset-4 hover:text-[#503325]"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  )
}

export default Login