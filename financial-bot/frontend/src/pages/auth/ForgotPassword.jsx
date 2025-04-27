import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Input, Button, Alert } from '../../components/common';

const validationSchema = Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement password reset functionality
      // This should send a reset code to the user's WhatsApp number
      console.log('Password reset requested for:', values);
      
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to process password reset request');
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Alert
        type="success"
        title="Reset Instructions Sent"
        message="If your username and WhatsApp number match our records, you will receive password reset instructions via WhatsApp. Please check your messages."
        action={{
          text: 'Back to Login',
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
          Enter your username and WhatsApp number, and we'll send you instructions
          to reset your password.
        </p>
      </div>

      <Formik
        initialValues={{
          username: '',
          phoneNumber: '',
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
              label="WhatsApp Number"
              name="phoneNumber"
              type="tel"
              autoComplete="tel"
              placeholder="+62812345678"
              required
              helperText="Enter the WhatsApp number associated with your account"
            />

            {error && (
              <Alert
                type="error"
                title="Request Failed"
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
                    Password Reset Information
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Make sure to enter the correct WhatsApp number</li>
                      <li>You will receive a reset code via WhatsApp</li>
                      <li>The reset code is valid for 15 minutes</li>
                      <li>Contact admin if you don't receive the code</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={isLoading}
                disabled={isSubmitting}
              >
                Send Reset Instructions
              </Button>

              <div className="mt-4 text-center">
                <Link
                  to="/auth/login"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPassword;
