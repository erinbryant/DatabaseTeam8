import { Navigate } from 'react-router-dom'

function getAuthSnapshot() {
  const token = localStorage.getItem('token')
  const userType = localStorage.getItem('userType')
  let user = null

  try {
    user = JSON.parse(localStorage.getItem('user') || 'null')
  } catch {
    user = null
  }

  return { token, userType, user }
}

// ── Requires employee login ───────────────────────────────────────────────
// Use this on any employee-only page
export function RequireEmployee({ children }) {
  const { token, userType } = getAuthSnapshot()

  if (!token) return <Navigate to="/login" replace />
  if (userType !== 'employee') return <Navigate to="/customer_home" replace />
  return children
}

// ── Requires customer login ───────────────────────────────────────────────
// Use this on any customer-only page
export function RequireCustomer({ children }) {
  const { token, userType } = getAuthSnapshot()

  if (!token) return <Navigate to="/login" replace />
  if (userType !== 'customer') return <Navigate to="/employee_home" replace />
  return children
}

// ── Requires any login ────────────────────────────────────────────────────
// Use this on pages both employees and customers can access
export function RequireAuth({ children }) {
  const { token } = getAuthSnapshot()
  if (!token) return <Navigate to="/login" replace />
  return children
}

//Requires for Admin login

export function RequireAdmin({ children }) {
  const { token, userType, user } = getAuthSnapshot()
  const roleId = Number(user?.Role_ID ?? user?.role_id)

  if (!token) return <Navigate to="/login" replace />
  if (userType !== 'employee') return <Navigate to="/customer_home" replace />
  if (roleId !== 5) return <Navigate to="/employee_home" replace />
  return children
}