
import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="border-t border-[#E5D9C9] bg-[#F2E6D1]">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-8 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Link to="/" className="text-xl font-bold text-[#382117]">
            SmartBite<span className="text-[#968575]">.</span>
          </Link>

          <p className="mt-2 text-sm text-[#706052]">
            Your campus café, made simple.
          </p>
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-[#706052]">
          <Link to="/" className="hover:text-[#382117]">Home</Link>
          <Link to="/menu" className="hover:text-[#382117]">Menu</Link>
          <Link to="/login" className="hover:text-[#382117]">Sign in</Link>
          <Link to="/register" className="hover:text-[#382117]">Register</Link>
        </div>

        <p className="text-sm text-[#706052]">
          © {new Date().getFullYear()} SmartBite
        </p>
      </div>
    </footer>
  )
}

export default Footer
