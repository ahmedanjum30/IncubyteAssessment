import { describe, expect, it } from 'vitest';
import { parseListParams, toListParams } from './listParams';

describe('employee list URL state', () => {
  it('round-trips filters through the query string, omitting defaults', () => {
    const query = parseListParams(new URLSearchParams('country=DE&band=below&sort=gap&page=3'));
    expect(query).toMatchObject({
      country: 'DE',
      band: 'below',
      sort: 'gap',
      page: 3,
      pageSize: 25,
    });
    expect(toListParams(query)).toBe('country=DE&band=below&sort=gap&page=3');
  });

  it('drops invalid values instead of breaking the page', () => {
    const query = parseListParams(new URLSearchParams('country=XX&page=-1&department=Sales'));
    expect(query.country).toBeUndefined();
    expect(query.page).toBe(1);
    expect(query.department).toBe('Sales');
  });
});
