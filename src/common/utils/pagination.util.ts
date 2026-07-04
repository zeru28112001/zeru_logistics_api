export interface PaginatedResult<T> {
  items: T[];
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

export function getPaginationParams(page = 0, size = 20) {
  return {
    page,
    size,
    skip: page * size,
    take: size,
  };
}

export function buildPaginatedResult<T>(
  items: T[],
  total: number,
  page: number,
  size: number,
): PaginatedResult<T> {
  return {
    items,
    page,
    size,
    total,
    totalPages: size > 0 ? Math.ceil(total / size) : 0,
  };
}
