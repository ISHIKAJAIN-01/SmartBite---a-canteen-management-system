import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import OrderTracking from './pages/OrderTracking';
import QueueStatus from './pages/QueueStatus';
import MyOrders from './pages/MyOrders';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/orders/:orderId/tracking" element={<OrderTracking />} />
          <Route path="/orders/:orderId/queue" element={<QueueStatus />} />
          <Route path="/menu" element={<Home />} />
          <Route path="*" element={<Navigate to="/my-orders" replace />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  );
}
