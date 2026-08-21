import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LineChart from './LineChart';

vi.mock('./LineChart.module.css', () => ({
  default: {},
}));

describe('LineChart', () => {
  it('renders nothing for empty data', () => {
    render(<LineChart data={[]} dateKey="date" valueKey="visitors" />);
    expect(screen.getByText(/No data available/i)).toBeInTheDocument();
  });

  it('renders chart with single data point', () => {
    render(
      <LineChart
        data={[{ date: '2025-08-18', visitors: 5 }]}
        dateKey="date"
        valueKey="visitors"
      />,
    );
    expect(screen.getByText('2025-08-18')).toBeInTheDocument();
  });

  it('renders chart with zero values', () => {
    render(
      <LineChart
        data={[
          { date: '2025-08-01', visitors: 0 },
          { date: '2025-08-02', visitors: 0 },
          { date: '2025-08-03', visitors: 3 },
        ]}
        dateKey="date"
        valueKey="visitors"
      />,
    );
    expect(screen.getByText('2025-08-01')).toBeInTheDocument();
    expect(screen.getByText('2025-08-03')).toBeInTheDocument();
  });

  it('limits the number of date labels for large datasets', () => {
    const data = Array.from({ length: 30 }, (_, i) => ({
      date: `2025-08-${String(i + 1).padStart(2, '0')}`,
      visitors: i % 3,
    }));

    render(
      <LineChart
        data={data}
        dateKey="date"
        valueKey="visitors"
        maxLabels={6}
      />,
    );

    const labels = screen.getAllByText(/2025-08-/);
    expect(labels.length).toBeLessThanOrEqual(6);
  });

  it('renders aria-label on svg', () => {
    render(
      <LineChart
        data={[{ date: '2025-08-01', visitors: 1 }]}
        dateKey="date"
        valueKey="visitors"
      />,
    );
    expect(
      screen.getByRole('img', { name: /Time series chart/i }),
    ).toBeInTheDocument();
  });
});
