import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/solid';

export const Dropdown = ({
  trigger,
  items,
  align = 'right',
  width = '48',
  className = '',
}) => {
  const alignmentClasses = {
    left: 'origin-top-left left-0',
    right: 'origin-top-right right-0',
  };

  const widthClasses = {
    '48': 'w-48',
    '56': 'w-56',
    '64': 'w-64',
    '72': 'w-72',
  };

  return (
    <Menu as="div" className={`relative inline-block text-left ${className}`}>
      {({ open }) => (
        <>
          <Menu.Button as={Fragment}>{trigger}</Menu.Button>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={`absolute z-50 mt-2 ${widthClasses[width]} ${alignmentClasses[align]} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}
            >
              <div className="py-1">
                {items.map((item, index) => (
                  <Fragment key={index}>
                    {item.divider ? (
                      <div className="my-1 border-t border-gray-100" />
                    ) : (
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            type="button"
                            className={`${
                              active
                                ? 'bg-gray-100 text-gray-900'
                                : 'text-gray-700'
                            } group flex w-full items-center px-4 py-2 text-sm ${
                              item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            onClick={item.onClick}
                            disabled={item.disabled}
                          >
                            {item.icon && (
                              <item.icon
                                className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500"
                                aria-hidden="true"
                              />
                            )}
                            {item.label}
                          </button>
                        )}
                      </Menu.Item>
                    )}
                  </Fragment>
                ))}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export const DropdownButton = ({
  label,
  items,
  variant = 'primary',
  size = 'md',
  align = 'right',
  width = '48',
  className = '',
}) => {
  const variants = {
    primary: 'text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-primary-500',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <Dropdown
      trigger={
        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            variants[variant]
          } ${sizes[size]} ${className}`}
        >
          {label}
          <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
        </button>
      }
      items={items}
      align={align}
      width={width}
    />
  );
};

export const DropdownSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  error,
  className = '',
}) => {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <Dropdown
        trigger={
          <button
            type="button"
            className={`relative w-full rounded-md border bg-white pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 sm:text-sm ${
              disabled
                ? 'cursor-not-allowed bg-gray-50'
                : 'cursor-default hover:bg-gray-50'
            } ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }`}
            disabled={disabled}
          >
            <span className="block truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </span>
          </button>
        }
        items={options.map((option) => ({
          label: option.label,
          onClick: () => onChange(option.value),
        }))}
        width="full"
        align="left"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Dropdown;
