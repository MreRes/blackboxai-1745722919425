import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, FieldArray } from 'formik';
import * as Yup from 'yup';
import {
  fetchBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../../store/slices/budgetSlice';
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Alert,
  StatsCard,
  Chart,
} from '../../components/common';
import {
  PlusIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  TrendingUpIcon,
  ExclamationIcon,
} from '@heroicons/react/outline';

const budgetSchema = Yup.object().shape({
  period: Yup.string().required('Period is required'),
  totalBudget: Yup.number()
    .required('Total budget is required')
    .positive('Total budget must be positive'),
  categories: Yup.array().of(
    Yup.object().shape({
      category: Yup.string().required('Category is required'),
      amount: Yup.number()
        .required('Amount is required')
        .positive('Amount must be positive'),
    })
  ),
  startDate: Yup.date().required('Start date is required'),
  endDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('startDate'), 'End date must be after start date'),
});

const Budget = () => {
  const dispatch = useDispatch();
  const { budgets, currentBudget, isLoading } = useSelector(
    (state) => state.budgets
  );
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);

  useEffect(() => {
    dispatch(fetchBudgets({ active: true }));
  }, [dispatch]);

  const handleCreateBudget = async (values, { setSubmitting, resetForm }) => {
    try {
      await dispatch(createBudget(values)).unwrap();
      resetForm();
      setShowModal(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateBudget = async (values, { setSubmitting }) => {
    try {
      await dispatch(
        updateBudget({
          id: selectedBudget._id,
          data: values,
        })
      ).unwrap();
      setShowModal(false);
      setSelectedBudget(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      await dispatch(deleteBudget(id)).unwrap();
    }
  };

  const categories = [
    { value: 'food', label: 'Food & Dining' },
    { value: 'transport', label: 'Transportation' },
    { value: 'shopping', label: 'Shopping' },
    { value: 'bills', label: 'Bills & Utilities' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'education', label: 'Education' },
    { value: 'other', label: 'Other' },
  ];

  const periods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
  ];

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Plan and track your spending across different categories
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => {
              setSelectedBudget(null);
              setShowModal(true);
            }}
          >
            Create Budget
          </Button>
        </div>
      </div>

      {/* Current Budget Overview */}
      {currentBudget ? (
        <div className="space-y-6">
          {/* Budget Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total Budget"
              value={formatCurrency(currentBudget.totalBudget)}
              icon={CurrencyDollarIcon}
            />
            <StatsCard
              title="Total Spent"
              value={formatCurrency(currentBudget.status.totalSpent)}
              icon={ChartPieIcon}
              changeType={
                currentBudget.status.spentPercentage > 90
                  ? 'danger'
                  : currentBudget.status.spentPercentage > 75
                  ? 'warning'
                  : 'success'
              }
            />
            <StatsCard
              title="Remaining"
              value={formatCurrency(currentBudget.status.remainingBudget)}
              icon={TrendingUpIcon}
              changeType={
                currentBudget.status.remainingBudget > 0 ? 'positive' : 'negative'
              }
            />
            <StatsCard
              title="Budget Period"
              value={`${new Date(
                currentBudget.startDate
              ).toLocaleDateString()} - ${new Date(
                currentBudget.endDate
              ).toLocaleDateString()}`}
              icon={ExclamationIcon}
            />
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Bars */}
            <Card>
              <Card.Header title="Category Spending" />
              <Card.Body>
                <div className="space-y-4">
                  {currentBudget.categories.map((category) => {
                    const spent = category.spent || 0;
                    const percentage = (spent / category.amount) * 100;
                    return (
                      <div key={category.category}>
                        <div className="flex justify-between text-sm font-medium text-gray-900">
                          <span>{category.category}</span>
                          <span>
                            {formatCurrency(spent)} / {formatCurrency(category.amount)}
                          </span>
                        </div>
                        <div className="mt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-100">
                            <div
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                percentage >= 90
                                  ? 'bg-red-500'
                                  : percentage >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>

            {/* Pie Chart */}
            <Card>
              <Card.Header title="Budget Distribution" />
              <Card.Body>
                <div className="h-80">
                  <Chart.Doughnut
                    data={{
                      labels: currentBudget.categories.map((c) => c.category),
                      datasets: [
                        {
                          data: currentBudget.categories.map((c) => c.amount),
                          backgroundColor: Chart.themes.default.backgroundColor,
                          borderColor: Chart.themes.default.borderColor,
                        },
                      ],
                    }}
                  />
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>
      ) : (
        <Alert
          type="info"
          title="No Active Budget"
          message="You don't have an active budget. Create one to start tracking your spending."
        />
      )}

      {/* Budget Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedBudget(null);
        }}
        title={selectedBudget ? 'Edit Budget' : 'Create Budget'}
        size="lg"
      >
        <Formik
          initialValues={
            selectedBudget || {
              period: 'monthly',
              totalBudget: '',
              categories: [{ category: '', amount: '' }],
              startDate: new Date().toISOString().split('T')[0],
              endDate: '',
            }
          }
          validationSchema={budgetSchema}
          onSubmit={selectedBudget ? handleUpdateBudget : handleCreateBudget}
        >
          {({ values, isSubmitting }) => (
            <Form className="space-y-4">
              <Select
                name="period"
                label="Budget Period"
                options={periods}
                required
              />
              <Input
                name="totalBudget"
                label="Total Budget"
                type="number"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="startDate"
                  label="Start Date"
                  type="date"
                  required
                />
                <Input
                  name="endDate"
                  label="End Date"
                  type="date"
                  required
                />
              </div>

              <FieldArray name="categories">
                {({ push, remove }) => (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">
                        Budget Categories
                      </h3>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        icon={PlusIcon}
                        onClick={() => push({ category: '', amount: '' })}
                      >
                        Add Category
                      </Button>
                    </div>
                    {values.categories.map((_, index) => (
                      <div key={index} className="flex gap-4">
                        <Select
                          name={`categories.${index}.category`}
                          options={categories}
                          placeholder="Select category"
                          className="flex-1"
                        />
                        <Input
                          name={`categories.${index}.amount`}
                          type="number"
                          placeholder="Amount"
                          className="flex-1"
                        />
                        {values.categories.length > 1 && (
                          <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            icon={TrashIcon}
                            onClick={() => remove(index)}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </FieldArray>

              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                >
                  {selectedBudget ? 'Update Budget' : 'Create Budget'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedBudget(null);
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

export default Budget;
