import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Alert } from '../../components/common';

const validationSchema = Yup.object().shape({
  resetCode: Yup.string()
    .required('Reset code is required')
    .matches(/^[A-Z0-9]{6,}$/, 'Invalid reset code format'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Get username and phone number from location state
  const { username, phoneNumber } = location.state || {};

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement password reset functionality
      // This should verify the reset code and update the password
      console.log('Password reset requested:', {
        username,
        phoneNumber,
        ...values,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (!username || !phoneNumber) {
    return (
      <Alert
        type="error"
        title="Invalid Reset Request"
        message="Please initiate the password reset from the forgot password page."
        action={{
          text: 'Go to Forgot Password',
          onClick: () => navigate('/auth/forgot-password'),
        }}
      />
    );
  }

  if (success) {
    return (
      <Alert
        type="success"
        title="Password Reset Successful!"
        message="Your password has been successfully reset. You can now log in with your new password."
        action={{
          text: 'Go to Login',
          onClick: () => navigate('/auth/login'),
        }}
      />
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h2 className="text-xl font-semibold text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter the reset code sent to your WhatsApp number and choose a new password
        </p>
      </div>

      <Formik
        initialValues={{
          resetCode: '',
          newPassword: '',
          confirmPassword: '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form className="space-y-6">
            <div className="rounded-md bg-gray-50 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-800">
                    Reset Information
                  </h3>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Username: {username}</p>
                    <p>WhatsApp: {phoneNumber}</p>
                  </div>
                </div>
              </div>
            </div>

            <Input
              label="Reset Code"
              name="resetCode"
              type="text"
              autoComplete="off"
              required
              autoFocus
            />

            <div>
              <Input
                label="New Password"
                name="newPassword"
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
              label="Confirm New Password"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
            />

            {error && (
              <Alert
                type="error"
                title="Reset Failed"
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
                    Password Requirements
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>At least 6 characters long</li>
                      <li>Include uppercase and lowercase letters</li>
                      <li>Include at least one number</li>
                      <li>Reset code is case-sensitive</li>
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
              Reset Password
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ResetPassword;
