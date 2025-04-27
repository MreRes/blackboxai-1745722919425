import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { activate } from '../../store/slices/authSlice';
import { Input, Button, Alert, Card } from '../../components/common';

const validationSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  phoneNumber: Yup.string()
    .required('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'),
  activationCode: Yup.string()
    .required('Activation code is required')
    .matches(/^[A-Z0-9]{6,}$/, 'Invalid activation code format'),
});

const Activate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [activationSuccess, setActivationSuccess] = useState(false);

  // Get username and phone number from location state or local storage
  const initialValues = {
    username: location.state?.username || localStorage.getItem('pendingUsername') || '',
    phoneNumber: location.state?.phoneNumber || localStorage.getItem('pendingPhoneNumber') || '',
    activationCode: '',
  };

  // Save pending activation details to local storage
  useEffect(() => {
    if (location.state?.username) {
      localStorage.setItem('pendingUsername', location.state.username);
    }
    if (location.state?.phoneNumber) {
      localStorage.setItem('pendingPhoneNumber', location.state.phoneNumber);
    }
  }, [location.state]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      const result = await dispatch(activate(values)).unwrap();
      if (result) {
        setActivationSuccess(true);
        // Clear pending activation details
        localStorage.removeItem('pendingUsername');
        localStorage.removeItem('pendingPhoneNumber');
        // Redirect to login after showing success message
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      }
    } catch (error) {
      console.error('Activation failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (activationSuccess) {
    return (
      <Alert
        type="success"
        title="WhatsApp Number Activated!"
        message={`Your WhatsApp number has been successfully activated. You can now use the WhatsApp bot for financial management. You will be redirected to login.`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <Card.Body>
          <div className="flex items-center space-x-4 mb-6">
            <div className="flex-shrink-0">
              <span className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Activate WhatsApp Number
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Enter your activation code to start using the WhatsApp Financial Bot
              </p>
            </div>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <Input
                  label="Username"
                  name="username"
                  type="text"
                  disabled={!!location.state?.username}
                  required
                />

                <Input
                  label="WhatsApp Number"
                  name="phoneNumber"
                  type="tel"
                  disabled={!!location.state?.phoneNumber}
                  required
                />

                <Input
                  label="Activation Code"
                  name="activationCode"
                  type="text"
                  placeholder="Enter your activation code"
                  required
                  autoComplete="off"
                  autoFocus
                />

                {error && (
                  <Alert
                    type="error"
                    title="Activation failed"
                    message={error}
                  />
                )}

                <div className="rounded-md bg-yellow-50 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        Activation Information
                      </h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Make sure you have received the activation code</li>
                          <li>The code is case-sensitive</li>
                          <li>Contact admin if you haven't received the code</li>
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
                  Activate WhatsApp Number
                </Button>
              </Form>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Activate;
