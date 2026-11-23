import type { EmployeeDetail } from '@acme/shared';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from '@/lib/api';
import { EmployeeForm } from './EmployeeForm';

const lena: EmployeeDetail = {
  id: 7,
  employeeCode: 'EMP-00007',
  fullName: 'Lena Hoffmann',
  email: 'lena@acme.example',
  jobTitle: 'Data Engineer',
  department: 'Engineering',
  level: 3,
  countryCode: 'DE',
  countryName: 'Germany',
  currency: 'EUR',
  salary: 61_000,
  salaryUsd: 66_185,
  hiredOn: '2022-04-01',
  bandMin: 58_000,
  bandMax: 82_000,
  bandStatus: 'within',
  gapUsd: 0,
  history: [],
};

function renderForm(employee?: EmployeeDetail) {
  const onDone = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient()}>
      <EmployeeForm employee={employee} onDone={onDone} onCancel={() => undefined} />
    </QueryClientProvider>,
  );
  return { onDone };
}

describe('EmployeeForm', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('blocks submission and explains invalid fields without calling the API', async () => {
    const create = vi.spyOn(api, 'createEmployee');
    renderForm();
    fireEvent.click(screen.getByRole('button', { name: 'Add employee' }));
    expect(await screen.findByText('Full name must be at least 2 characters')).toBeTruthy();
    expect(screen.getByText('Enter a valid email address')).toBeTruthy();
    expect(create).not.toHaveBeenCalled();
  });

  it('asks for a reason only when the salary changes, and sends just the changed fields', async () => {
    const update = vi.spyOn(api, 'updateEmployee').mockResolvedValue({ ...lena, salary: 66_000 });
    const { onDone } = renderForm(lena);

    expect(screen.queryByLabelText(/reason for salary change/i)).toBeNull();
    fireEvent.change(screen.getByLabelText(/annual base salary/i), { target: { value: '66000' } });
    fireEvent.change(screen.getByLabelText(/reason for salary change/i), {
      target: { value: 'Annual review' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => expect(onDone).toHaveBeenCalled());
    expect(update).toHaveBeenCalledWith(7, { salary: 66_000, salaryChangeReason: 'Annual review' });
  });

  it('shows the pay band in local currency for the chosen country and level', () => {
    renderForm(lena);
    expect(screen.getByText(/^Band €/)).toBeTruthy();
  });
});
