import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  fetchTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../store/slices/transactionSlice';
import {
  Card,
  Table,
  Button,
  Modal,
  Input,
  Select,
  DatePicker,
  TransactionBadge,
  CategoryBadge,
  DropdownButton,
} from '../../components/common';
import {
  PlusIcon,
  FilterIcon,
  DocumentDownloadIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/outline';

const transactionSchema = Yup.object().shape({
  type: Yup.string().required('Transaction type is required'),
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive'),
  category: Yup.string().required('Category is required'),
  description: Yup.string().required('Description is required'),
  date: Yup.date().required('Date is required'),
});

const Transactions = () => {
  const dispatch = useDispatch();
  const { transactions, pagination, filters, isLoading } = useSelector(
    (state) => state.transactions
  );
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    dispatch(fetchTransactions(filters));
  }, [dispatch, filters]);

  const handleCreateTransaction = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createTransaction(values)).unwrap();
      resetForm();
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTransaction = async (values, { setSubmitting }) => {
    try {
      await dispatch(
        updateTransaction({
          id: selectedTransaction._id,
          data: values,
        })
      ).unwrap();
      setShowModal(false);
      setSelectedTransaction(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await dispatch(deleteTransaction(id)).unwrap();
    }
  };

  const exportTransactions = () => {
    const csv = [
      ['Date', 'Type', 'Category', 'Description', 'Amount', 'Source'],
      ...transactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        t.description,
        t.amount,
        t.source,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => <TransactionBadge type={row.type} />,
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => <CategoryBadge category={row.category} />,
    },
    {
      key: 'description',
      header: 'Description',
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) =>
        new Intl.NumberFormat('id-ID', {
          style: 'currency',
          currency: 'IDR',
        }).format(row.amount),
    },
    {
      key: 'source',
      header: 'Source',
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            icon={PencilIcon}
            onClick={() => {
              setSelectedTransaction(row);
              setShowModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={TrashIcon}
            onClick={() => handleDeleteTransaction(row._id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const transactionTypes = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
  ];

  const categories = [
    { value: 'salary', label: 'Salary' },
    { value: 'business', label: 'Business' },
    { value: 'investment', label: 'Investment' },
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'bills', label: 'Bills & Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your income and expenses
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:flex sm:space-x-3">
          <Button
            variant="secondary"
            icon={FilterIcon}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="secondary"
            icon={DocumentDownloadIcon}
            onClick={exportTransactions}
          >
            Export
          </Button>
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => {
              setSelectedTransaction(null);
              setShowModal(true);
            }}
          >
            Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <Card.Body>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select
                label="Type"
                options={[
                  { value: '', label: 'All Types' },
                  ...transactionTypes,
                ]}
                value={filters.type}
                onChange={(value) =>
                  dispatch(setFilters({ ...filters, type: value }))
                }
              />
              <Select
                label="Category"
                options={[
                  { value: '', label: 'All Categories' },
                  ...categories,
                ]}
                value={filters.category}
                onChange={(value) =>
                  dispatch(setFilters({ ...filters, category: value }))
                }
              />
              <DatePicker
                label="Start Date"
                value={filters.startDate}
                onChange={(value) =>
                  dispatch(setFilters({ ...filters, startDate: value }))
                }
              />
              <DatePicker
                label="End Date"
                value={filters.endDate}
                onChange={(value) =>
                  dispatch(setFilters({ ...filters, endDate: value }))
                }
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Transactions Table */}
      <Card>
        <Table
          columns={columns}
          data={transactions}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={(page) =>
            dispatch(setFilters({ ...filters, page }))
          }
        />
      </Card>

      {/* Transaction Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTransaction(null);
        }}
        title={selectedTransaction ? 'Edit Transaction' : 'New Transaction'}
      >
        <Formik
          initialValues={
            selectedTransaction || {
              type: 'expense',
              amount: '',
              category: '',
              description: '',
              date: new Date().toISOString().split('T')[0],
            }
          }
          validationSchema={transactionSchema}
          onSubmit={selectedTransaction ? handleUpdateTransaction : handleCreateTransaction}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <Select
                name="type"
                label="Type"
                options={transactionTypes}
                required
              />
              <Input
                name="amount"
                label="Amount"
                type="number"
                required
              />
              <Select
                name="category"
                label="Category"
                options={categories}
                required
              />
              <Input
                name="description"
                label="Description"
                required
              />
              <DatePicker
                name="date"
                label="Date"
                required
              />
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                >
                  {selectedTransaction ? 'Update' : 'Create'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedTransaction(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Transactions;
