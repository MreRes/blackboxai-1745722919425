import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardHeader, CardBody } from './Card';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
    },
  },
};

export const LineChart = ({
  data,
  options = {},
  title,
  subtitle,
  height = 300,
  className = '',
}) => {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      <CardBody>
        <div style={{ height }}>
          <Line
            data={data}
            options={{
              ...defaultOptions,
              ...options,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export const BarChart = ({
  data,
  options = {},
  title,
  subtitle,
  height = 300,
  className = '',
}) => {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      <CardBody>
        <div style={{ height }}>
          <Bar
            data={data}
            options={{
              ...defaultOptions,
              ...options,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

export const DoughnutChart = ({
  data,
  options = {},
  title,
  subtitle,
  height = 300,
  className = '',
}) => {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader title={title} subtitle={subtitle} />
      )}
      <CardBody>
        <div style={{ height }}>
          <Doughnut
            data={data}
            options={{
              ...defaultOptions,
              ...options,
            }}
          />
        </div>
      </CardBody>
    </Card>
  );
};

// Predefined chart themes
export const chartThemes = {
  default: {
    backgroundColor: [
      'rgba(59, 130, 246, 0.5)', // blue
      'rgba(239, 68, 68, 0.5)',  // red
      'rgba(16, 185, 129, 0.5)', // green
      'rgba(245, 158, 11, 0.5)', // yellow
      'rgba(139, 92, 246, 0.5)', // purple
      'rgba(236, 72, 153, 0.5)', // pink
    ],
    borderColor: [
      'rgb(59, 130, 246)',
      'rgb(239, 68, 68)',
      'rgb(16, 185, 129)',
      'rgb(245, 158, 11)',
      'rgb(139, 92, 246)',
      'rgb(236, 72, 153)',
    ],
  },
  monochrome: {
    backgroundColor: [
      'rgba(0, 0, 0, 0.8)',
      'rgba(0, 0, 0, 0.6)',
      'rgba(0, 0, 0, 0.4)',
      'rgba(0, 0, 0, 0.2)',
      'rgba(0, 0, 0, 0.1)',
    ],
    borderColor: [
      'rgb(0, 0, 0)',
      'rgb(51, 51, 51)',
      'rgb(102, 102, 102)',
      'rgb(153, 153, 153)',
      'rgb(204, 204, 204)',
    ],
  },
  income: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgb(16, 185, 129)',
  },
  expense: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgb(239, 68, 68)',
  },
};

// Helper functions
export const createLineChartData = (labels, datasets, theme = 'default') => {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      borderColor: Array.isArray(chartThemes[theme].borderColor)
        ? chartThemes[theme].borderColor[index]
        : chartThemes[theme].borderColor,
      backgroundColor: Array.isArray(chartThemes[theme].backgroundColor)
        ? chartThemes[theme].backgroundColor[index]
        : chartThemes[theme].backgroundColor,
      fill: true,
      tension: 0.4,
    })),
  };
};

export const createBarChartData = (labels, datasets, theme = 'default') => {
  return {
    labels,
    datasets: datasets.map((dataset, index) => ({
      label: dataset.label,
      data: dataset.data,
      backgroundColor: Array.isArray(chartThemes[theme].backgroundColor)
        ? chartThemes[theme].backgroundColor[index]
        : chartThemes[theme].backgroundColor,
      borderColor: Array.isArray(chartThemes[theme].borderColor)
        ? chartThemes[theme].borderColor[index]
        : chartThemes[theme].borderColor,
      borderWidth: 1,
    })),
  };
};

export const createDoughnutChartData = (labels, data, theme = 'default') => {
  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor: chartThemes[theme].backgroundColor,
        borderColor: chartThemes[theme].borderColor,
        borderWidth: 1,
      },
    ],
  };
};

export default {
  Line: LineChart,
  Bar: BarChart,
  Doughnut: DoughnutChart,
  themes: chartThemes,
  createLineChartData,
  createBarChartData,
  createDoughnutChartData,
};
