import {
  JOB_TITLES,
  bandMidpoint,
  roundSalary,
  type CountryCode,
  type Department,
  type Level,
} from '@acme/shared';

export interface SeedEmployee {
  employeeCode: string;
  fullName: string;
  email: string;
  jobTitle: string;
  department: Department;
  level: Level;
  countryCode: CountryCode;
  salary: number;
  hiredOn: string;
}

const COUNTRY_WEIGHTS: Record<CountryCode, number> = {
  US: 2140, IN: 1850, GB: 1060, DE: 980, CA: 720, BR: 710,
  PL: 640, MX: 560, AU: 470, SG: 430, NL: 290, PH: 150,
};

const DEPARTMENT_WEIGHTS: Record<Department, number> = {
  Engineering: 34, Sales: 19, Support: 15, Operations: 11,
  Product: 6, Finance: 5.5, People: 5, Design: 4.5,
};

const NAMES: Record<CountryCode, [string[], string[]]> = {
  US: [['James', 'Olivia', 'Marcus', 'Emma', 'Noah', 'Ava', 'Ethan', 'Mia', 'Liam', 'Harper', 'Daniel', 'Grace'], ['Bell', 'Carter', 'Nguyen', 'Brooks', 'Reed', 'Hayes', 'Price', 'Foster', 'Ward', 'Murphy', 'Clark', 'Long']],
  GB: [['Aoife', 'Oliver', 'Amelia', 'Harry', 'Isla', 'George', 'Freya', 'Jack', 'Daniel', 'Poppy'], ['Byrne', 'Okafor', 'Taylor', 'Evans', 'Hughes', 'Patel', 'Walsh', 'Turner', 'Knight', 'Shaw']],
  DE: [['Lena', 'Jonas', 'Miriam', 'Felix', 'Hannah', 'Lukas', 'Emilia', 'Paul', 'Lea', 'Maximilian'], ['Hoffmann', 'Weber', 'Schulz', 'Braun', 'Koch', 'Fischer', 'Wagner', 'Becker', 'Richter', 'Wolf']],
  NL: [['Emma', 'Daan', 'Sophie', 'Sem', 'Julia', 'Lucas', 'Tess', 'Finn'], ['de Vries', 'Jansen', 'Bakker', 'Visser', 'Smit', 'Meijer', 'Mulder', 'Bos']],
  CA: [['Olivia', 'Liam', 'Chloé', 'Ethan', 'Maya', 'Noah', 'Léa', 'Owen'], ['Chen', 'Tremblay', 'Roy', 'Martin', 'Gagnon', 'Wilson', 'Lee', 'Campbell']],
  AU: [['Charlotte', 'Oliver', 'Isla', 'Jack', 'Matilda', 'William', 'Ruby', 'Lachlan'], ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Kelly', 'Ryan', 'Walker']],
  SG: [['Wei Jie', 'Hui Min', 'Jun Wei', 'Xin Yi', 'Arun', 'Siti', 'Marcus', 'Rachel'], ['Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', 'Chua']],
  PL: [['Tomasz', 'Anna', 'Piotr', 'Katarzyna', 'Michał', 'Agnieszka', 'Jakub', 'Zofia'], ['Nowak', 'Kowalski', 'Wiśniewska', 'Wójcik', 'Kamiński', 'Lewandowska', 'Zieliński', 'Szymańska']],
  IN: [['Priya', 'Arjun', 'Ananya', 'Rohan', 'Kavya', 'Vikram', 'Isha', 'Aditya', 'Meera', 'Rahul', 'Sneha', 'Karthik'], ['Raman', 'Mehta', 'Iyer', 'Sharma', 'Reddy', 'Nair', 'Gupta', 'Kapoor', 'Rao', 'Menon', 'Joshi', 'Pillai']],
  BR: [['Ana', 'Rafael', 'Lucas', 'Beatriz', 'Gabriel', 'Mariana', 'Pedro', 'Juliana'], ['Souza', 'Lima', 'Almeida', 'Silva', 'Costa', 'Pereira', 'Oliveira', 'Santos']],
  MX: [['Sofía', 'Carlos', 'Valentina', 'Diego', 'Isabel', 'Javier', 'Camila', 'Luis'], ['Martínez', 'Ruiz', 'Hernández', 'García', 'López', 'Reyes', 'Flores', 'Torres']],
  PH: [['Maria', 'Jose', 'Angelica', 'Mark', 'Kristine', 'John Paul', 'Rose', 'Miguel'], ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Ramos', 'Aquino']],
};

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function weighted<K extends string>(weights: Record<K, number>, r: number): K {
  const entries = Object.entries(weights) as [K, number][];
  const total = entries.reduce((s, [, w]) => s + w, 0);
  let x = r * total;
  for (const [k, w] of entries) {
    x -= w;
    if (x < 0) return k;
  }
  return entries[entries.length - 1]![0];
}

const pick = <T>(list: readonly T[], r: number): T => list[Math.floor(r * list.length)]!;

function normal(rand: () => number): number {
  return Math.sqrt(-2 * Math.log(1 - rand())) * Math.cos(2 * Math.PI * rand());
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .toLowerCase()
    .replace(/[^a-z]+/g, '');

export function generateEmployees(count: number, seed = 20261123): SeedEmployee[] {
  const rand = mulberry32(seed);
  const today = Date.UTC(2026, 10, 1);
  const employees: SeedEmployee[] = [];

  for (let i = 0; i < count; i++) {
    const countryCode = weighted(COUNTRY_WEIGHTS, rand());
    const department = weighted(DEPARTMENT_WEIGHTS, rand());
    const role = pick(JOB_TITLES[department], rand());
    const level = pick(role.levels, rand());
    const [firsts, lasts] = NAMES[countryCode];
    const first = pick(firsts, rand());
    const last = pick(lasts, rand());
    const factor = Math.min(1.45, Math.max(0.7, 1 + normal(rand) * 0.13));
    const tenureDays = Math.floor(rand() * 365 * 12) + 14;
    const code = `EMP-${String(i + 1).padStart(5, '0')}`;

    employees.push({
      employeeCode: code,
      fullName: `${first} ${last}`,
      email: `${slug(first)}.${slug(last)}.${String(i + 1).padStart(5, '0')}@acme.example`,
      jobTitle: role.title,
      department,
      level,
      countryCode,
      salary: roundSalary(bandMidpoint(countryCode, department, level) * factor),
      hiredOn: new Date(today - tenureDays * 86_400_000).toISOString().slice(0, 10),
    });
  }

  return employees;
}
