'use client';

import { useState } from 'react';
import { Checkbox } from '@createconomy/ui';

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

interface DataTableProps<T> {
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
  const [selectedItems, setSelectedItems] = useState<Set<unknown>>(new Set());
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSelectAll = () => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
      onSelectionChange?.([]);
    } else {
      const allKeys = new Set(data.map((item) => item[keyField]));
      setSelectedItems(allKeys);
      onSelectionChange?.(data);
    }
  };

  const handleSelectItem = (item: T) => {
    const key = item[keyField];
    const newSelected = new Set(selectedItems);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedItems(newSelected);
    onSelectionChange?.(data.filter((d) => newSelected.has(d[keyField])));
  };

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = (a as Record<string, unknown>)[sortColumn];
    const bValue = (b as Record<string, unknown>)[sortColumn];
    if (aValue === bValue) return 0;
    const comparison = aValue! < bValue! ? -1 : 1;
    return sortDirection === 'asc' ? comparison : -comparison;
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
                  checked={selectedItems.size === data.length && data.length > 0}
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
                    checked={selectedItems.has(item[keyField])}
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
