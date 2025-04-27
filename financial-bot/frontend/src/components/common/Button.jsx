import { ButtonSpinner } from './LoadingSpinner';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon: Icon,
  onClick,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

  const variants = {
    primary: 'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:bg-primary-400',
    secondary: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 disabled:bg-gray-100',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500 disabled:bg-red-400',
    success: 'text-white bg-green-600 hover:bg-green-700 focus:ring-green-500 disabled:bg-green-400',
    warning: 'text-white bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 disabled:bg-yellow-400',
    ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const isLight = variant === 'secondary' || variant === 'ghost';

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <ButtonSpinner light={!isLight} />
      ) : (
        <>
          {Icon && (
            <Icon
              className={`${
                children ? 'mr-2' : ''
              } -ml-1 h-5 w-5`}
            />
          )}
          {children}
        </>
      )}
    </button>
  );
};

export const IconButton = ({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  ...props
}) => {
  const sizes = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3',
    xl: 'p-4',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
    xl: 'h-7 w-7',
  };

  return (
    <Button variant={variant} className={sizes[size]} {...props}>
      <Icon className={iconSizes[size]} />
    </Button>
  );
};

export const ButtonGroup = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex rounded-md shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const ButtonGroupItem = ({ children, position, ...props }) => {
  const positionStyles = {
    first: 'rounded-r-none',
    middle: 'rounded-none -ml-px',
    last: 'rounded-l-none -ml-px',
  };

  return (
    <Button
      className={positionStyles[position]}
      {...props}
    >
      {children}
    </Button>
  );
};

export default Button;
