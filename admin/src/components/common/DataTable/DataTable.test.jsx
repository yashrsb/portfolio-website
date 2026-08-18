import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DataTable from './DataTable';

const COLUMNS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

const ROWS = [
  { id: '1', name: 'Alice', email: 'alice@example.com', status: 'new' },
  { id: '2', name: 'Bob', email: 'bob@example.com', status: 'read' },
];

describe('DataTable', () => {
  it('renders rows correctly', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} />);
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('renders empty message for an empty rows array', () => {
    render(<DataTable columns={COLUMNS} rows={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders empty message for a custom emptyMessage', () => {
    render(
      <DataTable columns={COLUMNS} rows={[]} emptyMessage="Nothing here" />,
    );
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('does not crash when rows is undefined', () => {
    render(<DataTable columns={COLUMNS} rows={undefined} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('does not crash when rows is null', () => {
    render(<DataTable columns={COLUMNS} rows={null} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('does not crash when rows is a non-array value', () => {
    render(<DataTable columns={COLUMNS} rows={{ foo: 'bar' }} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('does not crash when columns is undefined', () => {
    render(<DataTable columns={undefined} rows={[]} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders empty message when both rows and columns are undefined', () => {
    render(<DataTable rows={undefined} columns={undefined} />);
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });

  it('renders custom cell content via render function', () => {
    const cols = [
      { key: 'name', label: 'Name' },
      {
        key: 'status',
        label: 'Status',
        render: (row) => `Status: ${row.status}`,
      },
    ];
    render(
      <DataTable
        columns={cols}
        rows={[{ id: '1', name: 'Test', status: 'ok' }]}
      />,
    );
    expect(screen.getByText('Status: ok')).toBeInTheDocument();
  });

  it('renders the caption when provided', () => {
    render(<DataTable columns={COLUMNS} rows={ROWS} caption="Users" />);
    expect(screen.getByText('Users')).toBeInTheDocument();
  });
});
