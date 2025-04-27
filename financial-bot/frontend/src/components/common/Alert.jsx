import { Fragment } from 'react';
import { Transition } from '@headlessui/react';
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XCircleIcon,
  XIcon,
} from '@heroicons/react/outline';

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

const styles = {
  success: {
    background: 'bg-green-50',
    icon: 'text-green-400',
    title: 'text-green-800',
    text: 'text-green-700',
    button: 'bg-green-50 text-green-500 hover:bg-green-100',
  },
  error: {
    background: 'bg-red-50',
    icon: 'text-red-400',
    title: 'text-red-800',
    text: 'text-red-700',
    button: 'bg-red-50 text-red-500 hover:bg-red-100',
  },
  warning: {
    background: 'bg-yellow-50',
    icon: 'text-yellow-400',
    title: 'text-yellow-800',
    text: 'text-yellow-700',
    button: 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100',
  },
  info: {
    background: 'bg-blue-50',
    icon: 'text-blue-400',
    title: 'text-blue-800',
    text: 'text-blue-700',
    button: 'bg-blue-50 text-blue-500 hover:bg-blue-100',
  },
};

export const Alert = ({
  type = 'info',
  title,
  message,
  show = true,
  onClose,
  action,
  className = '',
}) => {
  const Icon = icons[type];
  const style = styles[type];

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={`rounded-md p-4 ${style.background} ${className}`}
        role="alert"
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${style.icon}`} aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1">
            {title && (
              <h3 className={`text-sm font-medium ${style.title}`}>{title}</h3>
            )}
            {message && (
              <div className={`text-sm ${style.text} ${title ? 'mt-2' : ''}`}>
                {message}
              </div>
            )}
            {action && (
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    type="button"
                    onClick={action.onClick}
                    className={`rounded-md px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
                  >
                    {action.text}
                  </button>
                </div>
              </div>
            )}
          </div>
          {onClose && (
            <div className="ml-4 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className={`inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${style.button}`}
              >
                <span className="sr-only">Close</span>
                <XIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Transition>
  );
};

export const Toast = ({
  type = 'info',
  message,
  show = true,
  onClose,
  autoClose = true,
  duration = 5000,
}) => {
  if (autoClose && show) {
    setTimeout(() => {
      onClose?.();
    }, duration);
  }

  return (
    <Transition
      show={show}
      as={Fragment}
      enter="transform ease-out duration-300 transition"
      enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enterTo="translate-y-0 opacity-100 sm:translate-x-0"
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div className="fixed top-4 right-4 z-50">
        <Alert type={type} message={message} onClose={onClose} />
      </div>
    </Transition>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState(null);

  const showToast = ({ type, message, duration }) => {
    setToast({ type, message, show: true });
    if (duration) {
      setTimeout(() => {
        setToast(null);
      }, duration);
    }
  };

  const hideToast = () => {
    setToast(null);
  };

  const ToastComponent = () => (
    <Toast
      type={toast?.type}
      message={toast?.message}
      show={toast?.show}
      onClose={hideToast}
    />
  );

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
};

export default Alert;
