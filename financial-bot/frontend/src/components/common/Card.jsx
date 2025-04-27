import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/outline';
import Button from './Button';

export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`px-4 py-5 border-b border-gray-200 sm:px-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {title}
          </h3>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="ml-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};

export const CardBody = ({ children, className = '' }) => {
  return (
    <div className={`px-4 py-5 sm:p-6 ${className}`}>
      {children}
    </div>
  );
};

export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`px-4 py-4 sm:px-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

export const CollapsibleCard = ({
  title,
  subtitle,
  defaultOpen = true,
  children,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className={className}>
      <div
        className="px-4 py-5 border-b border-gray-200 sm:px-6 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            icon={isOpen ? ChevronUpIcon : ChevronDownIcon}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
          />
        </div>
      </div>
      {isOpen && <CardBody>{children}</CardBody>}
    </Card>
  );
};

export const StatsCard = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className = '',
}) => {
  const changeColors = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };

  return (
    <Card className={className}>
      <CardBody>
        <div className="flex items-center">
          {Icon && (
            <div className="flex-shrink-0">
              <Icon className="h-6 w-6 text-gray-400" />
            </div>
          )}
          <div className={`${Icon ? 'ml-4' : ''} flex-1`}>
            <p className="text-sm font-medium text-gray-500 truncate">
              {title}
            </p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">
              {value}
            </p>
            {change && (
              <p className={`mt-2 inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${changeColors[changeType]}`}>
                {change}
              </p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default Card;
