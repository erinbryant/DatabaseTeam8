import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { RequireEmployee, RequireCustomer, RequireAuth, RequireAdmin } from './AuthGuard'

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
import AllShipments from './pages/all_shipments'

import PackageTracking from './pages/package_tracking'

import SubmitTicket from './pages/SubmitTicket'

//import SupportTicket from './pages/SupportTicket'

import PriceCalculator from './pages/price_calculator'
import AddPackage from './pages/add_package'
import PackageForPickup from './pages/package_for_pickup'
import CustomerPackages from './pages/customer_packages'

import EmployeeSupport from './pages/Employeesupport.jsx'
import Employee_SubmitTicket from './pages/Employee_SubmitTicket.jsx'

import TicketsReport from './pages/tickets_report.jsx'
import RevenueReport from './pages/Revenue_Report.jsx'
import EmployeesPage from './pages/employees.jsx'

import EmployeePerformanceReport from './pages/EmployeePerformanceReport'

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

        {/* Data report testing*/}


        <Route path="/tickets_employees" element={<TicketsReport />} />
        <Route path="/revenue-report" element={<RevenueReport />} />

        {/* Customer Routes */}
        <Route path="/customer_home" element={<RequireCustomer><CustomerHome /></RequireCustomer>} />
        <Route path="/customer_profile" element={<RequireCustomer><CustomerProfile /></RequireCustomer>} />
        <Route path="/customer_packages" element={<RequireCustomer><CustomerPackages /></RequireCustomer>} />
        <Route path="/submit_ticket" element={<SubmitTicket/>} />

        {/* Employee Routes */}
        <Route path="/employee_home" element={<RequireEmployee><EmployeeHome /></RequireEmployee>} />
        <Route path="/employee/add-package" element={<RequireEmployee><AddPackage /></RequireEmployee>} />
        <Route path="/employee/package-pickup" element={<RequireEmployee><PackageForPickup /></RequireEmployee>} />
        <Route path="/employee-support" element={<RequireEmployee><EmployeeSupport /></RequireEmployee>} />
        <Route path="/employee/submit-ticket" element={<RequireEmployee><Employee_SubmitTicket/></RequireEmployee>} />
        <Route path="/customers" element={<RequireEmployee><AllCustomers /></RequireEmployee>} />
        <Route path="/admin-register" element={<RequireAdmin><AdminRegister /></RequireAdmin>} />
        <Route path="/profile" element={<RequireEmployee><Profile /></RequireEmployee>} />
        <Route path="/employees" element={<RequireEmployee><EmployeesPage /></RequireEmployee>} />
        <Route path="/reports/employee-performance" element={<RequireEmployee><EmployeePerformanceReport /></RequireEmployee>} />
        <Route path ="/employees/all-shipments" element = {<RequireEmployee><AllShipments/></RequireEmployee>}/>

        {/* Shared / Authenticated */}
        <Route path="/package_list" element={<RequireAuth><AllPackages /></RequireAuth>} />
      
        <Route path="/package_tracking" element={<PackageTracking/>} />
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
