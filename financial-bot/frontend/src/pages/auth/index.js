import Login from './Login';
import Register from './Register';
import Activate from './Activate';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

// Auth page routes configuration
export const authRoutes = [
  {
    path: 'login',
    element: <Login />,
    title: 'Sign In',
  },
  {
    path: 'register',
    element: <Register />,
    title: 'Create Account',
  },
  {
    path: 'activate',
    element: <Activate />,
    title: 'Activate WhatsApp',
  },
  {
    path: 'forgot-password',
    element: <ForgotPassword />,
    title: 'Forgot Password',
  },
  {
    path: 'reset-password',
    element: <ResetPassword />,
    title: 'Reset Password',
  },
];

// Helper functions for auth pages
export const getAuthPageTitle = (pathname) => {
  const route = authRoutes.find((r) => pathname.endsWith(r.path));
  return route?.title || 'Authentication';
};

export const isAuthPage = (pathname) => {
  return authRoutes.some((r) => pathname.endsWith(r.path));
};

// Auth state helpers
export const getStoredAuthToken = () => {
  return localStorage.getItem('token');
};

export const setStoredAuthToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('pendingUsername');
  localStorage.removeItem('pendingPhoneNumber');
};

// Export components
export { 
  Login, 
  Register, 
  Activate, 
  ForgotPassword, 
  ResetPassword 
};

export default {
  Login,
  Register,
  Activate,
  ForgotPassword,
  ResetPassword,
  routes: authRoutes,
  getPageTitle: getAuthPageTitle,
  isAuthPage,
  getStoredAuthToken,
  setStoredAuthToken,
  clearStoredAuth,
};
