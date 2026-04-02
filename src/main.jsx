import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireEmployee, RequireCustomer, RequireAuth } from './AuthGuard'

// pages
import Home from './pages/home'
import Login from './pages/Login'

import CustomerHome from './pages/customer_home'
import EmployeeHome from './pages/employee_home'

import Profile from './pages/Profile'
import CustomerProfile from './pages/CustomerProfile'

import Register from './pages/Register'
import AdminRegister from './pages/AdminRegister'

import AllPackages from './pages/package_list'
import AllCustomers from './pages/all_customers'

import Inventory from './pages/inventory'
import PackageTracking from './pages/package_tracking'

import SubmitTicket from './pages/SubmitTicket'

//import SupportTicket from './pages/SupportTicket'
//import EmployeeSupport from './pages/EmployeeSupport'
import PriceCalculator from './pages/price_calculator'


// global styles
import './pages/css/index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        {/* <Route path="/new-package" element={<NewPackage />} /> */}

        {/* Customer Routes */}
        <Route path="/customer_home" element={<RequireCustomer><CustomerHome /></RequireCustomer>} />
        <Route path="/customer_profile" element={<RequireCustomer><CustomerProfile /></RequireCustomer>} />
        <Route path="/submit_ticket" element={<SubmitTicket/>} />

        {/* Employee Routes */}
        <Route path="/employee_home" element={<RequireEmployee><EmployeeHome /></RequireEmployee>} />
        {/* <Route path="/employee/support" element={<RequireEmployee><EmployeeSupport /></RequireEmployee>} /> */}
        <Route path="/customers" element={<RequireEmployee><AllCustomers /></RequireEmployee>} />
        <Route path="/admin-register" element={<RequireEmployee><AdminRegister /></RequireEmployee>} />
        <Route path="/profile" element={<RequireEmployee><Profile /></RequireEmployee>} />

        {/* Shared / Authenticated */}
        <Route path="/package_list" element={<RequireAuth><AllPackages /></RequireAuth>} />
        <Route path="/inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
        {/* <Route path="/support" element={<RequireAuth><SupportTicket /></RequireAuth>} /> */}

        {/* Optional/Test */}
        {/*<Route path="/test" element={<TestQuery />} />*/}

        {/* Placeholders */}
        <Route path="/package_tracking" element={<PackageTracking/>} />
        <Route path="/package_history" element={<p>Package History — coming soon</p>} />
        
        <Route path="/support_tickets" element={<p>Support Tickets — coming soon</p>} />
        <Route path="/price_calculator" element={<PriceCalculator/>} />

        {/* 404 */}
        <Route path="*" element={<p>Page not found</p>} />
      </Routes>
    </BrowserRouter>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
