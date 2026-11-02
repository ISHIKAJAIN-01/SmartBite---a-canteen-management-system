
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { ShoppingBag, Menu, X, LogOut } from 'lucide-react'

function Navbar() {
    const navigate = useNavigate()

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [user, setUser] = useState(null)

    useEffect(() => {
        function checkLoginStatus() {
            const token = localStorage.getItem('token')
            const storedUser = localStorage.getItem('user')

            try {
                const parsedUser = storedUser ? JSON.parse(storedUser) : null

                setUser(token && parsedUser ? parsedUser : null)
            } catch {
                setUser(null)
            }
        }

        checkLoginStatus()

        window.addEventListener('authChanged', checkLoginStatus)
        window.addEventListener('storage', checkLoginStatus)

        return () => {
            window.removeEventListener('authChanged', checkLoginStatus)
            window.removeEventListener('storage', checkLoginStatus)
        }
    }, [])

    const role = user?.role?.toLowerCase()
    const isStudentLoggedIn = role === 'student'
    const isAdminLoggedIn = role === 'admin'
    const isLoggedIn = Boolean(user)

    const navLinkClass = ({ isActive }) =>
        `text-sm font-semibold transition ${
            isActive
                ? 'text-[#382117] underline decoration-[#968575] decoration-2 underline-offset-8'
                : 'text-[#706052] hover:text-[#382117]'
        }`

    const mobileLinkClass = ({ isActive }) =>
        `rounded-lg px-4 py-3 text-sm font-semibold ${
            isActive
                ? 'bg-[#EADCC3] text-[#382117]'
                : 'text-[#706052] hover:bg-[#F2E6D1] hover:text-[#382117]'
        }`

    function closeMobileMenu() {
        setMobileMenuOpen(false)
    }

    function handleLogout() {
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        setUser(null)
        setMobileMenuOpen(false)

        window.dispatchEvent(new Event('authChanged'))

        navigate('/login')
    }

    return (
        <header className="sticky top-0 z-50 border-b border-[#E5D9C9] bg-[#F8F1E8]/95 backdrop-blur">
            <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
                <Link
                    to="/"
                    onClick={closeMobileMenu}
                    className="text-2xl font-bold tracking-tight text-[#382117]"
                >
                    SmartBite<span className="text-[#968575]">.</span>
                </Link>

                {/* Desktop navigation */}
                <div className="hidden items-center gap-7 md:flex">
                    <NavLink to="/" end className={navLinkClass}>
                        Home
                    </NavLink>

                    <NavLink to="/menu" className={navLinkClass}>
                        Menu
                    </NavLink>

                    <NavLink to="/search" className={navLinkClass}>
                        Search
                    </NavLink>

                    {isStudentLoggedIn && (
                        <>
                            <NavLink to="/cart" className={navLinkClass}>
                                Cart
                            </NavLink>

                            <NavLink to="/my-orders" className={navLinkClass}>
                                My Orders
                            </NavLink>
                        </>
                    )}

                    {isAdminLoggedIn && (
                        <NavLink to="/admin" className={navLinkClass}>
                            Admin Dashboard
                        </NavLink>
                    )}

                    {!isLoggedIn && (
                        <>
                            <NavLink to="/login" className={navLinkClass}>
                                Login
                            </NavLink>

                            <NavLink to="/register" className={navLinkClass}>
                                Register
                            </NavLink>
                        </>
                    )}

                    {isLoggedIn ? (
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="flex items-center gap-2 rounded-lg border border-[#E5D9C9] px-4 py-3 text-sm font-semibold text-[#382117] transition hover:bg-[#EADCC3]"
                        >
                            <LogOut size={17} />
                            Logout
                        </button>
                    ) : (
                        <Link
                            to="/menu"
                            className="flex items-center gap-2 rounded-lg bg-[#382117] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#503325] focus:outline-none focus:ring-2 focus:ring-[#968575] focus:ring-offset-2"
                        >
                            <ShoppingBag size={17} />
                            Explore Menu
                        </Link>
                    )}
                </div>

                {/* Mobile menu button */}
                <button
                    type="button"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label={
                        mobileMenuOpen
                            ? 'Close navigation menu'
                            : 'Open navigation menu'
                    }
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-navigation"
                    className="rounded-lg p-2 text-[#382117] transition hover:bg-[#EADCC3] md:hidden"
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </nav>

            {/* Mobile navigation */}
            {mobileMenuOpen && (
                <div
                    id="mobile-navigation"
                    className="border-t border-[#E5D9C9] bg-[#F8F1E8] px-5 py-4 md:hidden"
                >
                    <div className="mx-auto flex max-w-7xl flex-col gap-1">
                        <NavLink
                            to="/"
                            end
                            onClick={closeMobileMenu}
                            className={mobileLinkClass}
                        >
                            Home
                        </NavLink>

                        <NavLink
                            to="/menu"
                            onClick={closeMobileMenu}
                            className={mobileLinkClass}
                        >
                            Menu
                        </NavLink>

                        <NavLink
                            to="/search"
                            onClick={closeMobileMenu}
                            className={mobileLinkClass}
                        >
                            Search
                        </NavLink>

                        {isStudentLoggedIn && (
                            <>
                                <NavLink
                                    to="/cart"
                                    onClick={closeMobileMenu}
                                    className={mobileLinkClass}
                                >
                                    Cart
                                </NavLink>

                                <NavLink
                                    to="/my-orders"
                                    onClick={closeMobileMenu}
                                    className={mobileLinkClass}
                                >
                                    My Orders
                                </NavLink>
                            </>
                        )}

                        {isAdminLoggedIn && (
                            <NavLink
                                to="/admin"
                                onClick={closeMobileMenu}
                                className={mobileLinkClass}
                            >
                                Admin Dashboard
                            </NavLink>
                        )}

                        {!isLoggedIn && (
                            <>
                                <NavLink
                                    to="/login"
                                    onClick={closeMobileMenu}
                                    className={mobileLinkClass}
                                >
                                    Login
                                </NavLink>

                                <NavLink
                                    to="/register"
                                    onClick={closeMobileMenu}
                                    className={mobileLinkClass}
                                >
                                    Register
                                </NavLink>

                                <Link
                                    to="/menu"
                                    onClick={closeMobileMenu}
                                    className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-[#382117] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#503325]"
                                >
                                    <ShoppingBag size={17} />
                                    Explore Menu
                                </Link>
                            </>
                        )}

                        {isLoggedIn && (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mt-2 flex items-center justify-center gap-2 rounded-lg border border-[#E5D9C9] px-4 py-3 text-sm font-semibold text-[#382117] transition hover:bg-[#EADCC3]"
                            >
                                <LogOut size={17} />
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}
        </header>
    )
}

export default Navbar
