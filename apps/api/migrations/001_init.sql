create extension if not exists pg_trgm;

create table countries (
  code char(2) primary key,
  name text not null,
  currency char(3) not null
);

create table fx_rates (
  currency char(3) primary key,
  usd_per_unit numeric(18, 8) not null check (usd_per_unit > 0),
  as_of date not null
);

create table pay_bands (
  country_code char(2) not null references countries (code),
  department text not null,
  level smallint not null check (level between 1 and 6),
  min_salary numeric(14, 2) not null,
  max_salary numeric(14, 2) not null,
  primary key (country_code, department, level),
  check (min_salary < max_salary)
);

create table employees (
  id integer generated always as identity primary key,
  employee_code text not null unique,
  full_name text not null,
  email text not null unique,
  job_title text not null,
  department text not null,
  level smallint not null check (level between 1 and 6),
  country_code char(2) not null references countries (code),
  salary numeric(14, 2) not null check (salary > 0),
  hired_on date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index employees_country_department_idx on employees (country_code, department, level);
create index employees_department_idx on employees (department);
create index employees_job_title_idx on employees (job_title);
create index employees_full_name_idx on employees (full_name, id);
create index employees_full_name_trgm_idx on employees using gin (full_name gin_trgm_ops);

create table salary_changes (
  id integer generated always as identity primary key,
  employee_id integer not null references employees (id) on delete cascade,
  previous_salary numeric(14, 2) not null,
  previous_currency char(3) not null,
  new_salary numeric(14, 2) not null,
  currency char(3) not null,
  reason text,
  changed_at timestamptz not null default now()
);

create index salary_changes_employee_idx on salary_changes (employee_id, changed_at desc);

create view employee_pay as
select
  e.id,
  e.employee_code,
  e.full_name,
  e.email,
  e.job_title,
  e.department,
  e.level,
  e.country_code,
  c.name as country_name,
  c.currency,
  e.salary,
  f.usd_per_unit,
  round(e.salary * f.usd_per_unit, 2) as salary_usd,
  e.hired_on,
  b.min_salary as band_min,
  b.max_salary as band_max,
  case
    when b.min_salary is null then null
    when e.salary < b.min_salary then 'below'
    when e.salary > b.max_salary then 'above'
    else 'within'
  end as band_status,
  round(
    case
      when e.salary < b.min_salary then e.salary - b.min_salary
      when e.salary > b.max_salary then e.salary - b.max_salary
      else 0
    end * f.usd_per_unit,
    2
  ) as gap_usd
from employees e
join countries c on c.code = e.country_code
join fx_rates f on f.currency = c.currency
left join pay_bands b
  on b.country_code = e.country_code and b.department = e.department and b.level = e.level;
