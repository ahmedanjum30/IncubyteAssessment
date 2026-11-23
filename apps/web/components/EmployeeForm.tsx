'use client';

import {
  COUNTRIES,
  DEPARTMENTS,
  JOB_TITLES,
  LEVELS,
  bandFor,
  countryByCode,
  employeeInputSchema,
  type CountryCode,
  type Department,
  type EmployeeDetail,
  type EmployeeInput,
  type Level,
} from '@acme/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useId, useMemo, useState } from 'react';
import { ApiError, api, keys } from '@/lib/api';
import { money } from '@/lib/format';
import styles from './EmployeeForm.module.css';

type FormState = Record<keyof EmployeeInput, string> & { salaryChangeReason: string };
type Errors = Partial<Record<keyof FormState | 'form', string>>;

const today = () => new Date().toISOString().slice(0, 10);

function initialState(employee?: EmployeeDetail): FormState {
  return {
    fullName: employee?.fullName ?? '',
    email: employee?.email ?? '',
    department: employee?.department ?? 'Engineering',
    jobTitle: employee?.jobTitle ?? JOB_TITLES.Engineering[0]!.title,
    level: String(employee?.level ?? 2),
    countryCode: employee?.countryCode ?? 'US',
    salary: employee ? String(employee.salary) : '',
    hiredOn: employee?.hiredOn ?? today(),
    salaryChangeReason: '',
  };
}

interface EmployeeFormProps {
  employee?: EmployeeDetail;
  onDone: (employee: EmployeeDetail) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onDone, onCancel }: EmployeeFormProps) {
  const queryClient = useQueryClient();
  const uid = useId();
  const [form, setForm] = useState<FormState>(() => initialState(employee));
  const [errors, setErrors] = useState<Errors>({});

  const department = form.department as Department;
  const country = countryByCode(form.countryCode)!;
  const salaryChanged = employee !== undefined && Number(form.salary) !== employee.salary;
  const band = useMemo(
    () => bandFor(form.countryCode as CountryCode, department, Number(form.level) as Level),
    [form.countryCode, department, form.level],
  );

  const mutation = useMutation({
    mutationFn: (input: EmployeeInput) => {
      if (!employee) return api.createEmployee(input);
      const changed = Object.fromEntries(
        Object.entries(input).filter(([k, v]) => v !== employee[k as keyof EmployeeInput]),
      );
      return api.updateEmployee(employee.id, {
        ...changed,
        ...(salaryChanged && form.salaryChangeReason.trim()
          ? { salaryChangeReason: form.salaryChangeReason.trim() }
          : {}),
      });
    },
    onSuccess: (saved) => {
      queryClient.setQueryData(keys.employee(saved.id), saved);
      void queryClient.invalidateQueries({ queryKey: keys.employees });
      void queryClient.invalidateQueries({ queryKey: keys.insights });
      onDone(saved);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setErrors({ email: error.message });
      } else if (error instanceof ApiError && error.issues.length) {
        setErrors(Object.fromEntries(error.issues.map((i) => [i.path, i.message])));
      } else {
        setErrors({ form: error instanceof Error ? error.message : 'Could not save' });
      }
    },
  });

  const set =
    (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((f) => {
        const next = { ...f, [field]: value };
        if (field === 'department') next.jobTitle = JOB_TITLES[value as Department][0]!.title;
        return next;
      });
      if (errors[field]) setErrors((er) => ({ ...er, [field]: undefined }));
    };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = employeeInputSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    mutation.mutate(parsed.data);
  };

  const fieldProps = (name: keyof FormState) => ({
    id: `${uid}-${name}`,
    name,
    value: form[name],
    onChange: set(name),
    className: 'input',
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `${uid}-${name}-error` : undefined,
  });

  const error = (name: keyof FormState) =>
    errors[name] ? (
      <span id={`${uid}-${name}-error`} className="error-text">
        {errors[name]}
      </span>
    ) : null;

  const label = (name: keyof FormState, text: string) => (
    <label htmlFor={`${uid}-${name}`} className="muted">
      {text}
    </label>
  );

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={`field ${styles.span2}`}>
        {label('fullName', 'Full name')}
        <input {...fieldProps('fullName')} autoComplete="off" />
        {error('fullName')}
      </div>
      <div className={`field ${styles.span2}`}>
        {label('email', 'Work email')}
        <input {...fieldProps('email')} type="email" autoComplete="off" />
        {error('email')}
      </div>
      <div className="field">
        {label('department', 'Department')}
        <select {...fieldProps('department')}>
          {DEPARTMENTS.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>
      <div className="field">
        {label('jobTitle', 'Job title')}
        <select {...fieldProps('jobTitle')}>
          {JOB_TITLES[department].map((j) => (
            <option key={j.title}>{j.title}</option>
          ))}
          {!JOB_TITLES[department].some((j) => j.title === form.jobTitle) ? (
            <option>{form.jobTitle}</option>
          ) : null}
        </select>
        {error('jobTitle')}
      </div>
      <div className="field">
        {label('level', 'Level')}
        <select {...fieldProps('level')}>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              L{l}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        {label('countryCode', 'Country')}
        <select {...fieldProps('countryCode')}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        {error('countryCode')}
      </div>
      <div className="field">
        {label('salary', `Annual base salary (${country.currency})`)}
        <input {...fieldProps('salary')} inputMode="decimal" autoComplete="off" />
        {error('salary') ?? (
          <span className="muted num">
            Band {money(band.min, country.currency)} – {money(band.max, country.currency)}
          </span>
        )}
      </div>
      <div className="field">
        {label('hiredOn', 'Hire date')}
        <input {...fieldProps('hiredOn')} type="date" max={today()} />
        {error('hiredOn')}
      </div>
      {salaryChanged ? (
        <div className={`field ${styles.span2}`}>
          {label('salaryChangeReason', 'Reason for salary change (kept in history)')}
          <input
            {...fieldProps('salaryChangeReason')}
            placeholder="e.g. Annual review, promotion"
          />
        </div>
      ) : null}
      {errors.form ? (
        <p className={`error-text ${styles.span2}`} role="alert">
          {errors.form}
        </p>
      ) : null}
      <div className={`${styles.actions} ${styles.span2}`}>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving…' : employee ? 'Save changes' : 'Add employee'}
        </button>
      </div>
    </form>
  );
}
