const LoadingSpinner = ({ size = 'md', light = false }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <div className="flex justify-center items-center">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-2 ${
          light
            ? 'border-white border-t-transparent'
            : 'border-primary-600 border-t-transparent'
        }`}
      />
    </div>
  );
};

export const PageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

export const SectionSpinner = () => (
  <div className="py-12">
    <LoadingSpinner size="md" />
  </div>
);

export const ButtonSpinner = ({ light }) => (
  <LoadingSpinner size="sm" light={light} />
);

export default LoadingSpinner;
