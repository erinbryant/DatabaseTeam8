import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// pages
import Home from './pages/home'
import CustomerHome from './pages/customer_home'
import EmployeeHome from './pages/employee_home'
import PackageList from './pages/package_list'
import Inventory from './pages/inventory'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SupportTicket from './pages/SupportTicket'
import EmployeeSupport from './pages/EmployeeSupport';
// global styles
import './pages/css/index.css'
import AllPackages from './pages/package_list'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/customer_home" element={<CustomerHome />} />
        <Route path="/employee_home" element={<EmployeeHome />} />
        <Route path="/package_list" element={<PackageList />} />
        <Route path="/employee/support" element={<EmployeeSupport />} />

        {/* ── PLACEHOLDER ROUTES ── build these pages and add imports above */}
        <Route path="/login" element={<Login/>} />
        <Route path="/packages" element={<AllPackages/>} />
        <Route path="/package_tracking" element={<p>Package Tracking — coming soon</p>} />
        <Route path="/package_history" element={<p>Package History — coming soon</p>} />
        <Route path="/inventory" element={<Inventory/>} />
        <Route path="/submit_ticket" element={<p>Submit Ticket — coming soon</p>} />
        <Route path="/support_tickets" element={<p>Support Tickets — coming soon</p>} />
        <Route path="/customer_profile" element={<p>Customer Profile — coming soon</p>} />
        <Route path="/profile" element={<Profile/>} />
        <Route path="/ship_package" element={<p>Ship Package — coming soon</p>} />
        <Route path="/customers" element={<p>Customers — coming soon</p>} />
        <Route path="/register" element={<Register/>} />
        {/* ── 404 ── */}
        <Route path="*" element={<p>Page not found</p>} />
        <Route path="/support" element={<SupportTicket />} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
