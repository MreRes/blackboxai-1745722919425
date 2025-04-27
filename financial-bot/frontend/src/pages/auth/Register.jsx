import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { register } from '../../store/slices/authSlice';
import { Input, Button, Alert } from '../../components/common';

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .matches(
      /^[a-zA-Z0-9_]+$/,
      'Username can only contain letters, numbers, and underscores'
    ),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number'
    ),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password'), null], 'Passwords must match'),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(register(values)).unwrap();
      if (result) {
        setRegistrationSuccess(true);
        setTimeout(() => {
          navigate('/auth/activate', {
            state: { username: values.username, phoneNumber: values.phoneNumber }
          });
        }, 3000);
      }
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {registrationSuccess ? (
        <Alert
          type="success"
          title="Registration Successful!"
          message="Your account has been created. You will be redirected to activate your WhatsApp number."
        />
      ) : (
        <Formik
          initialValues={{
            username: '',
            phoneNumber: '',
            password: '',
            confirmPassword: '',
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

              <Input
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                autoComplete="tel"
                placeholder="+62812345678"
                required
                helperText="Enter your WhatsApp number with country code"
              />

              <div>
                <Input
                  label="Password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                />
                <div className="mt-1">
                  <input
                    id="show-password"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                  />
                  <label
                    htmlFor="show-password"
                    className="ml-2 text-sm text-gray-900"
                  >
                    Show password
                  </label>
                </div>
              </div>

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
              />

              {error && (
                <Alert
                  type="error"
                  title="Registration failed"
                  message={error}
                />
              )}

              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Registration Information
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Use your active WhatsApp number</li>
                        <li>You'll need to activate your number after registration</li>
                        <li>Password must be at least 6 characters</li>
                        <li>Include uppercase, lowercase, and numbers</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isSubmitting}
              >
                Register
              </Button>

              <div className="text-sm text-center">
                <span className="text-gray-500">Already have an account?</span>{' '}
                <Link
                  to="/auth/login"
                  className="font-medium text-primary-600 hover:text-primary-500"
                >
                  Sign in
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default Register;
