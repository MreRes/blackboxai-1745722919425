const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = 'full',
  dot = false,
  className = '',
}) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-primary-100 text-primary-800',
    secondary: 'bg-secondary-100 text-secondary-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const roundedStyles = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };

  return (
    <span
      className={`
        inline-flex items-center font-medium
        ${variants[variant]}
        ${sizes[size]}
        ${roundedStyles[rounded]}
        ${className}
      `}
    >
      {dot && (
        <span
          className={`
            mr-1.5 h-2 w-2 rounded-full
            ${variant === 'default' ? 'bg-gray-400' : `bg-${variant}-400`}
          `}
        />
      )}
      {children}
    </span>
  );
};

export const StatusBadge = ({ status, ...props }) => {
  const statusMap = {
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'danger', label: 'Inactive' },
    pending: { variant: 'warning', label: 'Pending' },
    completed: { variant: 'success', label: 'Completed' },
    failed: { variant: 'danger', label: 'Failed' },
    processing: { variant: 'info', label: 'Processing' },
    draft: { variant: 'default', label: 'Draft' },
  };

  const { variant, label } = statusMap[status] || statusMap.default;

  return (
    <Badge variant={variant} dot {...props}>
      {label}
    </Badge>
  );
};

export const TransactionBadge = ({ type, ...props }) => {
  const typeMap = {
    income: { variant: 'success', label: 'Income' },
    expense: { variant: 'danger', label: 'Expense' },
  };

  const { variant, label } = typeMap[type] || typeMap.expense;

  return (
    <Badge variant={variant} {...props}>
      {label}
    </Badge>
  );
};

export const BudgetBadge = ({ status, ...props }) => {
  const getVariant = (spent, total) => {
    const percentage = (spent / total) * 100;
    if (percentage >= 90) return 'danger';
    if (percentage >= 75) return 'warning';
    return 'success';
  };

  const getLabel = (spent, total) => {
    const percentage = Math.round((spent / total) * 100);
    return `${percentage}% Used`;
  };

  const variant = getVariant(status.spent, status.total);
  const label = getLabel(status.spent, status.total);

  return (
    <Badge variant={variant} {...props}>
      {label}
    </Badge>
  );
};

export const NotificationBadge = ({ count, max = 99, ...props }) => {
  const displayCount = count > max ? `${max}+` : count;

  return count > 0 ? (
    <Badge variant="danger" size="sm" {...props}>
      {displayCount}
    </Badge>
  ) : null;
};

export const CategoryBadge = ({ category, ...props }) => {
  // You can customize category colors based on your needs
  const categoryColors = {
    food: 'primary',
    transport: 'info',
    shopping: 'secondary',
    bills: 'warning',
    entertainment: 'success',
    health: 'danger',
    default: 'default',
  };

  return (
    <Badge variant={categoryColors[category] || categoryColors.default} {...props}>
      {category}
    </Badge>
  );
};

export default Badge;
