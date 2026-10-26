
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import Navbar from './components/Navbar'
import Footer from './components/Footer'

import Home from './pages/Home'
import Menu from './pages/Menu'
import Search from './pages/Search'
import Login from './pages/Login'
import Register from './pages/Register'
import Cart from './pages/Cart'

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-[#F8F1E8]">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/search" element={<Search />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>

        <Footer />
      </div>
    </BrowserRouter>
  )
}

export default App
