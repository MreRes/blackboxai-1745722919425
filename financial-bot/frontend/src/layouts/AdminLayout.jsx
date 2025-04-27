import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import {
  ChartBarIcon,
  UsersIcon,
  KeyIcon,
  CogIcon,
  PhoneIcon,
  MenuIcon,
  XIcon,
  ShieldCheckIcon,
} from '@heroicons/react/outline';

const navigation = [
  { name: 'Dashboard', to: '/admin', icon: ChartBarIcon },
  { name: 'Users', to: '/admin/users', icon: UsersIcon },
  { name: 'Activation Codes', to: '/admin/activation-codes', icon: KeyIcon },
  { name: 'WhatsApp Status', to: '/admin/whatsapp', icon: PhoneIcon },
  { name: 'Settings', to: '/admin/settings', icon: CogIcon },
];

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-secondary-800">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-6 w-6 text-white" />
            </button>
          </div>

          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
                <h1 className="ml-2 text-2xl font-bold text-white">Admin Panel</h1>
              </div>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-secondary-900 text-white'
                        : 'text-secondary-100 hover:bg-secondary-700'
                    }`
                  }
                >
                  <item.icon className="mr-4 h-6 w-6" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-secondary-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <div className="flex items-center">
                <ShieldCheckIcon className="h-8 w-8 text-white" />
                <h1 className="ml-2 text-2xl font-bold text-white">Admin Panel</h1>
              </div>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-secondary-900 text-white'
                        : 'text-secondary-100 hover:bg-secondary-700'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-6 w-6" />
                  {item.name}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex-1 px-4 flex justify-between h-16">
            <div className="flex-1 flex">
              <button
                type="button"
                className="lg:hidden px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-secondary-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <MenuIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Admin badge */}
              <span className="px-3 py-1 text-xs font-medium bg-secondary-100 text-secondary-800 rounded-full">
                Admin
              </span>

              {/* Profile dropdown */}
              <div className="ml-3 relative flex items-center">
                <div className="flex items-center max-w-xs text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-500">
                  <UsersIcon className="h-8 w-8 text-gray-400" />
                  <span className="ml-3 text-gray-700">{user?.username}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className="flex-1 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
