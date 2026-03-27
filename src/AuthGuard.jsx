import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── Requires employee login ───────────────────────────────────────────────
// Use this on any employee-only page
export function RequireEmployee({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
      navigate('/login');         // not logged in at all
      return;
    }
    if (userType !== 'employee') {
      navigate('/customer_home'); // logged in but wrong type
    }
  }, []);

  const token    = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  if (!token || userType !== 'employee') return null;

  return children;
}

// ── Requires customer login ───────────────────────────────────────────────
// Use this on any customer-only page
export function RequireCustomer({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token    = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

    if (!token) {
      navigate('/login');          // not logged in at all
      return;
    }
    if (userType !== 'customer') {
      navigate('/employee_home');  // logged in but wrong type
    }
  }, []);

  const token    = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  if (!token || userType !== 'customer') return null;

  return children;
}

// ── Requires any login ────────────────────────────────────────────────────
// Use this on pages both employees and customers can access
export function RequireAuth({ children }) {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) navigate('/login');
  }, []);

  const token = localStorage.getItem('token');
  if (!token) return null;

  return children;
}