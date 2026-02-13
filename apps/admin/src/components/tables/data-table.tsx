'use client';

import { Checkbox } from '@createconomy/ui';
import { useTableSort } from './use-table-sort';
import { useTableSelection } from './use-table-selection';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyField: keyof T;
  onRowClick?: (item: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedItems: T[]) => void;
}

export function DataTable<T>({
  data,
  columns,
  keyField,
  onRowClick,
  selectable = false,
  onSelectionChange,
}: DataTableProps<T>) {
  const { sortedData, sortColumn, sortDirection, handleSort } = useTableSort({
    data,
  });

  const { isAllSelected, handleSelectAll, handleSelectItem, isSelected } =
    useTableSelection({
      data,
      keyField,
      onSelectionChange,
    });

  const getValue = (item: T, key: string): unknown => {
    return (item as Record<string, unknown>)[key];
  };

  return (
    <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
      <table className="data-table">
        <thead>
          <tr>
            {selectable && (
              <th className="w-12">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={String(column.key)}
                className={column.sortable ? 'cursor-pointer select-none' : ''}
                onClick={() => column.sortable && handleSort(String(column.key))}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && sortColumn === column.key && (
                    <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={String(item[keyField])}
              className={onRowClick ? 'cursor-pointer' : ''}
              onClick={() => onRowClick?.(item)}
            >
              {selectable && (
                <td onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected(item)}
                    onCheckedChange={() => handleSelectItem(item)}
                  />
                </td>
              )}
              {columns.map((column) => (
                <td key={String(column.key)}>
                  {column.render
                    ? column.render(item)
                    : String(getValue(item, String(column.key)) ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  );
}
