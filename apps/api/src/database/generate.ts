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
  US: [
    ['James', 'Olivia', 'Marcus', 'Emma', 'Noah', 'Ava', 'Ethan', 'Mia', 'Liam', 'Harper', 'Daniel', 'Grace', 'Caleb', 'Zoe', 'Isaiah', 'Lily', 'Owen', 'Nora', 'Wyatt', 'Hazel', 'Jordan', 'Maya', 'Dylan', 'Ruby', 'Gabriel', 'Stella', 'Julian', 'Aria', 'Miles', 'Quinn'],
    ['Bell', 'Carter', 'Nguyen', 'Brooks', 'Reed', 'Hayes', 'Price', 'Foster', 'Ward', 'Murphy', 'Clark', 'Long', 'Bennett', 'Coleman', 'Jenkins', 'Perry', 'Russell', 'Sullivan', 'Powell', 'Ramirez', 'Kim', 'Patel', 'Gonzalez', 'Fisher', 'Hughes', 'Myers', 'Ford', 'Hamilton', 'Graham', 'Wallace'],
  ],
  GB: [
    ['Aoife', 'Oliver', 'Amelia', 'Harry', 'Isla', 'George', 'Freya', 'Jack', 'Daniel', 'Poppy', 'Alfie', 'Evie', 'Theo', 'Imogen', 'Rhys', 'Niamh', 'Callum', 'Esme', 'Kieran', 'Priya'],
    ['Byrne', 'Okafor', 'Taylor', 'Evans', 'Hughes', 'Patel', 'Walsh', 'Turner', 'Knight', 'Shaw', 'Davies', 'Holmes', 'Barker', 'Lloyd', 'Pearson', 'Fletcher', 'Kaur', 'Doyle', 'Marsh', 'Atkinson'],
  ],
  DE: [
    ['Lena', 'Jonas', 'Miriam', 'Felix', 'Hannah', 'Lukas', 'Emilia', 'Paul', 'Lea', 'Maximilian', 'Clara', 'Elias', 'Johanna', 'Niklas', 'Greta', 'Tobias', 'Frieda', 'Moritz', 'Ida', 'Jannik'],
    ['Hoffmann', 'Weber', 'Schulz', 'Braun', 'Koch', 'Fischer', 'Wagner', 'Becker', 'Richter', 'Wolf', 'Schäfer', 'Neumann', 'Krüger', 'Zimmermann', 'Hartmann', 'Lange', 'Werner', 'Krause', 'Meier', 'Vogel'],
  ],
  NL: [
    ['Emma', 'Daan', 'Sophie', 'Sem', 'Julia', 'Lucas', 'Tess', 'Finn', 'Fleur', 'Bram', 'Noor', 'Thijs', 'Lotte', 'Ruben'],
    ['de Vries', 'Jansen', 'Bakker', 'Visser', 'Smit', 'Meijer', 'Mulder', 'Bos', 'de Boer', 'Dekker', 'Vos', 'Peters', 'Hendriks', 'van Dijk'],
  ],
  CA: [
    ['Olivia', 'Liam', 'Chloé', 'Ethan', 'Maya', 'Noah', 'Léa', 'Owen', 'Félix', 'Amélie', 'Logan', 'Sienna', 'Mathis', 'Avery', 'Jaxon', 'Rosalie'],
    ['Chen', 'Tremblay', 'Roy', 'Martin', 'Gagnon', 'Wilson', 'Lee', 'Campbell', 'Bouchard', 'Côté', 'Singh', 'Lavoie', 'Morrison', 'Fortin', 'MacDonald', 'Pelletier'],
  ],
  AU: [
    ['Charlotte', 'Oliver', 'Isla', 'Jack', 'Matilda', 'William', 'Ruby', 'Lachlan', 'Mia', 'Cooper', 'Sienna', 'Harrison', 'Evie', 'Angus'],
    ['Smith', 'Jones', 'Williams', 'Brown', 'Wilson', 'Kelly', 'Ryan', 'Walker', 'Obrien', 'Thompson', 'Nguyen', 'Mitchell', 'Harris', 'Robinson'],
  ],
  SG: [
    ['Wei Jie', 'Hui Min', 'Jun Wei', 'Xin Yi', 'Arun', 'Siti', 'Marcus', 'Rachel', 'Kai Xuan', 'Nurul', 'Darren', 'Mei Ling', 'Ravi', 'Jia Hui'],
    ['Tan', 'Lim', 'Lee', 'Ng', 'Ong', 'Wong', 'Goh', 'Chua', 'Teo', 'Koh', 'Rahman', 'Pillai', 'Yeo', 'Sim'],
  ],
  PL: [
    ['Tomasz', 'Anna', 'Piotr', 'Katarzyna', 'Michał', 'Agnieszka', 'Jakub', 'Zofia', 'Paweł', 'Magdalena', 'Krzysztof', 'Julia', 'Marcin', 'Aleksandra', 'Bartosz', 'Natalia'],
    ['Nowak', 'Kowalski', 'Wiśniewska', 'Wójcik', 'Kamiński', 'Lewandowska', 'Zieliński', 'Szymańska', 'Woźniak', 'Dąbrowski', 'Kozłowska', 'Jankowski', 'Mazur', 'Kwiatkowska', 'Krawczyk', 'Piotrowski'],
  ],
  IN: [
    ['Priya', 'Arjun', 'Ananya', 'Rohan', 'Kavya', 'Vikram', 'Isha', 'Aditya', 'Meera', 'Rahul', 'Sneha', 'Karthik', 'Diya', 'Siddharth', 'Pooja', 'Nikhil', 'Aarav', 'Riya', 'Varun', 'Neha', 'Harsh', 'Tanvi', 'Aman', 'Shruti', 'Kunal', 'Divya', 'Manish', 'Lakshmi', 'Yash', 'Anjali'],
    ['Raman', 'Mehta', 'Iyer', 'Sharma', 'Reddy', 'Nair', 'Gupta', 'Kapoor', 'Rao', 'Menon', 'Joshi', 'Pillai', 'Verma', 'Bhat', 'Kulkarni', 'Agarwal', 'Chatterjee', 'Desai', 'Malhotra', 'Banerjee', 'Krishnan', 'Saxena', 'Mishra', 'Shetty', 'Thakur', 'Ghosh', 'Pandey', 'Hegde', 'Sinha', 'Bose'],
  ],
  BR: [
    ['Ana', 'Rafael', 'Lucas', 'Beatriz', 'Gabriel', 'Mariana', 'Pedro', 'Juliana', 'Thiago', 'Larissa', 'Matheus', 'Camila', 'Felipe', 'Letícia', 'Bruno', 'Fernanda'],
    ['Souza', 'Lima', 'Almeida', 'Silva', 'Costa', 'Pereira', 'Oliveira', 'Santos', 'Rodrigues', 'Ferreira', 'Carvalho', 'Gomes', 'Ribeiro', 'Martins', 'Araújo', 'Barbosa'],
  ],
  MX: [
    ['Sofía', 'Carlos', 'Valentina', 'Diego', 'Isabel', 'Javier', 'Camila', 'Luis', 'Ximena', 'Andrés', 'Regina', 'Emilio', 'Daniela', 'Rodrigo', 'Fernanda', 'Mateo'],
    ['Martínez', 'Ruiz', 'Hernández', 'García', 'López', 'Reyes', 'Flores', 'Torres', 'Ramírez', 'Cruz', 'Morales', 'Vargas', 'Castillo', 'Jiménez', 'Mendoza', 'Ortiz'],
  ],
  PH: [
    ['Maria', 'Jose', 'Angelica', 'Mark', 'Kristine', 'John Paul', 'Rose', 'Miguel', 'Patricia', 'Carlo', 'Joy', 'Rafael'],
    ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Ramos', 'Aquino', 'Villanueva', 'Dela Cruz', 'Navarro', 'Castro'],
  ],
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
    .replace(/ß/g, 'ss')
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
    const factor = Math.min(1.6, Math.max(0.62, Math.exp(normal(rand) * 0.12)));
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
