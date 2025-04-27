import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { login } from '../../store/slices/authSlice';
import { Input, Button } from '../../components/common';

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (values) => {
    try {
      const result = await dispatch(login(values)).unwrap();
      if (result) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      // Error is handled by the auth slice
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      <Formik
        initialValues={{
          username: '',
          password: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <Input
              label="Username"
              name="username"
              type="text"
              autoComplete="username"
              required
            />

            <div>
              <Input
                label="Password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
              />
              <div className="mt-1 flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="show-password"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <label
                    htmlFor="show-password"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Show password
                  </label>
                </div>
                <div className="text-sm">
                  <Link
                    to="/auth/forgot-password"
                    className="font-medium text-primary-600 hover:text-primary-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Login failed
                    </h3>
                    <div className="mt-2 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isSubmitting}
              >
                Sign in
              </Button>
            </div>

            <div className="text-sm text-center">
              <span className="text-gray-500">Don't have an account?</span>{' '}
              <Link
                to="/auth/register"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                Register now
              </Link>
            </div>
          </Form>
        )}
      </Formik>

      {/* WhatsApp Bot Info */}
      <div className="mt-8 rounded-md bg-gray-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-7-4a1 1 0 00-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-gray-800">
              WhatsApp Financial Bot
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>
                After logging in, you can activate your WhatsApp number to start
                using our financial management bot. The bot helps you track
                expenses, manage budgets, and view financial reports directly
                through WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
