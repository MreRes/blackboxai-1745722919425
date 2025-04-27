import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTransactionSummary } from '../../store/slices/transactionSlice';
import { fetchCurrentBudget } from '../../store/slices/budgetSlice';
import {
  Card,
  StatsCard,
  Chart,
  LoadingSpinner,
  Alert,
} from '../../components/common';
import {
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ScaleIcon,
} from '@heroicons/react/outline';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { summary: transactionSummary, isLoading: transactionsLoading } = useSelector(
    (state) => state.transactions
  );
  const { currentBudget, isLoading: budgetLoading } = useSelector(
    (state) => state.budgets
  );

  useEffect(() => {
    dispatch(fetchTransactionSummary());
    dispatch(fetchCurrentBudget());
  }, [dispatch]);

  if (transactionsLoading || budgetLoading) {
    return <LoadingSpinner />;
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate financial metrics
  const income = transactionSummary?.totals?.income || 0;
  const expenses = transactionSummary?.totals?.expense || 0;
  const balance = income - expenses;
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;

  // Prepare chart data
  const categoryData = transactionSummary?.categories?.expense || [];
  const chartData = Chart.createDoughnutChartData(
    categoryData.map((cat) => cat.category),
    categoryData.map((cat) => cat.total),
    'default'
  );

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div className="bg-white shadow rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.username}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here's an overview of your financial status for this month.
        </p>
      </div>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Monthly Income"
          value={formatCurrency(income)}
          icon={CurrencyDollarIcon}
          changeType="positive"
        />
        <StatsCard
          title="Monthly Expenses"
          value={formatCurrency(expenses)}
          icon={TrendingDownIcon}
          changeType="negative"
        />
        <StatsCard
          title="Current Balance"
          value={formatCurrency(balance)}
          icon={ScaleIcon}
          changeType={balance >= 0 ? 'positive' : 'negative'}
        />
        <StatsCard
          title="Savings Rate"
          value={`${Math.round(savingsRate)}%`}
          icon={TrendingUpIcon}
          changeType={savingsRate >= 20 ? 'positive' : 'warning'}
        />
      </div>

      {/* Budget Status */}
      {currentBudget ? (
        <Card>
          <Card.Header
            title="Budget Status"
            subtitle={`Budget period: ${new Date(
              currentBudget.startDate
            ).toLocaleDateString()} - ${new Date(
              currentBudget.endDate
            ).toLocaleDateString()}`}
          />
          <Card.Body>
            <div className="space-y-4">
              {currentBudget.categories.map((category) => {
                const spent = category.spent || 0;
                const percentage = (spent / category.amount) * 100;
                const status =
                  percentage >= 90
                    ? 'danger'
                    : percentage >= 75
                    ? 'warning'
                    : 'success';

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
                          className={`w-[${percentage}%] shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                            status === 'danger'
                              ? 'bg-red-500'
                              : status === 'warning'
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
      ) : (
        <Alert
          type="info"
          title="No Active Budget"
          message="You don't have an active budget for this period. Set up a budget to track your spending."
          action={{
            text: 'Create Budget',
            onClick: () => navigate('/dashboard/budget'),
          }}
        />
      )}

      {/* Expense Distribution */}
      {categoryData.length > 0 && (
        <Card>
          <Card.Header
            title="Expense Distribution"
            subtitle="Breakdown of your expenses by category"
          />
          <Card.Body>
            <div className="h-80">
              <Chart.Doughnut
                data={chartData}
                options={{
                  plugins: {
                    legend: {
                      position: 'bottom',
                    },
                  },
                }}
              />
            </div>
          </Card.Body>
        </Card>
      )}

      {/* WhatsApp Bot Status */}
      <Card>
        <Card.Header
          title="WhatsApp Bot Status"
          subtitle="Your financial assistant is ready to help"
        />
        <Card.Body>
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              </span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                WhatsApp Bot Active
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Send messages to your financial assistant to record transactions,
                check balances, and more.
              </p>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Dashboard;
