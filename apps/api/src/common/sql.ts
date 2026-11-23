import type { Sql } from '../database/client.js';

export type Fragment = ReturnType<Sql>;

export function whereAll(sql: Sql, conditions: Fragment[]): Fragment {
  if (!conditions.length) return sql``;
  return sql`where ${conditions.reduce((acc, c) => sql`${acc} and ${c}`)}`;
}

export function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' && error !== null && (error as { code?: string }).code === '23505'
  );
}
