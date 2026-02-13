import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface UseTableSortOptions<T> {
  data: T[];
  defaultColumn?: string | null;
  defaultDirection?: SortDirection;
}

export interface UseTableSortResult<T> {
  sortedData: T[];
  sortColumn: string | null;
  sortDirection: SortDirection;
  handleSort: (column: string) => void;
}

export function useTableSort<T>({
  data,
  defaultColumn = null,
  defaultDirection = 'asc',
}: UseTableSortOptions<T>): UseTableSortResult<T> {
  const [sortColumn, setSortColumn] = useState<string | null>(defaultColumn);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(defaultDirection);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      if (!sortColumn) return 0;
      const aValue = (a as Record<string, unknown>)[sortColumn];
      const bValue = (b as Record<string, unknown>)[sortColumn];
      if (aValue === bValue) return 0;
      const comparison = aValue! < bValue! ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortColumn, sortDirection]);

  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
  };
}
