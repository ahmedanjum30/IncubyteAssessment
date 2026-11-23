import postgres from 'postgres';

export type Sql = postgres.Sql<Record<string, unknown>>;

export const SQL = Symbol('SQL');

export function createSql(url: string, max = 10): Sql {
  return postgres(url, {
    max,
    idle_timeout: 30,
    connect_timeout: 10,
    onnotice: () => undefined,
    transform: postgres.camel,
    types: {
      numeric: {
        to: 1700,
        from: [1700],
        serialize: (v: number) => String(v),
        parse: (v: string) => Number(v),
      },
      date: {
        to: 1082,
        from: [1082],
        serialize: (v: string) => v,
        parse: (v: string) => v,
      },
    },
  }) as unknown as Sql;
}
