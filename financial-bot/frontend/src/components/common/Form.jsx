import { useField } from 'formik';
import { ExclamationCircleIcon } from '@heroicons/react/solid';

export const FormGroup = ({ children, className = '' }) => {
  return <div className={`space-y-1 mb-4 ${className}`}>{children}</div>;
};

export const Label = ({ children, htmlFor, required, className = '' }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
    >
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
};

export const Input = ({ label, required, ...props }) => {
  const [field, meta] = useField(props);
  const hasError = meta.touched && meta.error;

  return (
    <FormGroup>
      {label && (
        <Label htmlFor={props.id || props.name} required={required}>
          {label}
        </Label>
      )}
      <div className="relative">
        <input
          {...field}
          {...props}
          className={`
            block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm
            ${
              hasError
                ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
            }
          `}
        />
        {hasError && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
          </div>
        )}
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{meta.error}</p>
      )}
    </FormGroup>
  );
};

export const Select = ({ label, required, options, ...props }) => {
  const [field, meta] = useField(props);
  const hasError = meta.touched && meta.error;

  return (
    <FormGroup>
      {label && (
        <Label htmlFor={props.id || props.name} required={required}>
          {label}
        </Label>
      )}
      <select
        {...field}
        {...props}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm
          ${
            hasError
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          }
        `}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{meta.error}</p>
      )}
    </FormGroup>
  );
};

export const Textarea = ({ label, required, ...props }) => {
  const [field, meta] = useField(props);
  const hasError = meta.touched && meta.error;

  return (
    <FormGroup>
      {label && (
        <Label htmlFor={props.id || props.name} required={required}>
          {label}
        </Label>
      )}
      <textarea
        {...field}
        {...props}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm
          ${
            hasError
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          }
        `}
      />
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{meta.error}</p>
      )}
    </FormGroup>
  );
};

export const Checkbox = ({ label, ...props }) => {
  const [field, meta] = useField({ ...props, type: 'checkbox' });
  const hasError = meta.touched && meta.error;

  return (
    <FormGroup>
      <div className="flex items-center">
        <input
          type="checkbox"
          {...field}
          {...props}
          className={`
            h-4 w-4 rounded
            ${
              hasError
                ? 'border-red-300 text-red-600 focus:ring-red-500'
                : 'border-gray-300 text-primary-600 focus:ring-primary-500'
            }
          `}
        />
        <label
          htmlFor={props.id || props.name}
          className="ml-2 block text-sm text-gray-900"
        >
          {label}
        </label>
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{meta.error}</p>
      )}
    </FormGroup>
  );
};

export const Radio = ({ label, options, ...props }) => {
  const [field, meta] = useField(props);
  const hasError = meta.touched && meta.error;

  return (
    <FormGroup>
      {label && (
        <Label required={props.required}>{label}</Label>
      )}
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              {...field}
              id={`${props.name}-${option.value}`}
              value={option.value}
              checked={field.value === option.value}
              className={`
                h-4 w-4
                ${
                  hasError
                    ? 'border-red-300 text-red-600 focus:ring-red-500'
                    : 'border-gray-300 text-primary-600 focus:ring-primary-500'
                }
              `}
            />
            <label
              htmlFor={`${props.name}-${option.value}`}
              className="ml-2 block text-sm text-gray-900"
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{meta.error}</p>
      )}
    </FormGroup>
  );
};

export const DatePicker = ({ label, required, ...props }) => {
  const [field, meta] = useField(props);
  const hasError = meta.touched && meta.error;

  return (
    <FormGroup>
      {label && (
        <Label htmlFor={props.id || props.name} required={required}>
          {label}
        </Label>
      )}
      <input
        type="date"
        {...field}
        {...props}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm
          ${
            hasError
              ? 'border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500'
              : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
          }
        `}
      />
      {hasError && (
        <p className="mt-1 text-sm text-red-600">{meta.error}</p>
      )}
    </FormGroup>
  );
};

export const HelperText = ({ children, className = '' }) => {
  return (
    <p className={`mt-1 text-sm text-gray-500 ${className}`}>
      {children}
    </p>
  );
};

export const ErrorMessage = ({ children, className = '' }) => {
  return (
    <p className={`mt-1 text-sm text-red-600 ${className}`}>
      {children}
    </p>
  );
};
