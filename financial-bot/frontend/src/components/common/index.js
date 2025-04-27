export { default as Alert, Toast, useToast } from './Alert';
export { default as Badge, StatusBadge, TransactionBadge, BudgetBadge, NotificationBadge, CategoryBadge } from './Badge';
export { default as Button, IconButton, ButtonGroup, ButtonGroupItem } from './Button';
export { default as Card, CardHeader, CardBody, CardFooter, CollapsibleCard, StatsCard } from './Card';
export { default as Chart, LineChart, BarChart, DoughnutChart, chartThemes } from './Chart';
export { default as Dropdown, DropdownButton, DropdownSelect } from './Dropdown';
export { 
  FormGroup,
  Label,
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  DatePicker,
  HelperText,
  ErrorMessage 
} from './Form';
export { default as LoadingSpinner, PageSpinner, SectionSpinner, ButtonSpinner } from './LoadingSpinner';
export { default as Modal, ConfirmationModal } from './Modal';
export { default as Table } from './Table';

// Common prop types
export const variants = [
  'primary',
  'secondary',
  'success',
  'danger',
  'warning',
  'info',
  'default',
];

export const sizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];

// Common utility functions
export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const formatCurrency = (amount, currency = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date, format = 'DD MMM YYYY') => {
  return moment(date).format(format);
};

export const formatNumber = (number, options = {}) => {
  return new Intl.NumberFormat('id-ID', options).format(number);
};

export const truncateText = (text, length = 30) => {
  if (text.length <= length) return text;
  return `${text.substring(0, length)}...`;
};

// Common hooks
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useDisclosure = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
};

export const usePrevious = (value) => {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
};

// Common constants
export const TRANSITIONS = {
  enter: 'ease-out duration-300',
  enterFrom: 'opacity-0',
  enterTo: 'opacity-100',
  leave: 'ease-in duration-200',
  leaveFrom: 'opacity-100',
  leaveTo: 'opacity-0',
};

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const Z_INDICES = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  toast: 1600,
  tooltip: 1700,
};
