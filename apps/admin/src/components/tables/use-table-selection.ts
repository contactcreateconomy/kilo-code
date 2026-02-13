import { useState, useCallback } from 'react';

export interface UseTableSelectionOptions<T> {
  data: T[];
  keyField: keyof T;
  onSelectionChange?: (selectedItems: T[]) => void;
}

export interface UseTableSelectionResult<T> {
  selectedItems: Set<unknown>;
  isAllSelected: boolean;
  handleSelectAll: () => void;
  handleSelectItem: (item: T) => void;
  isSelected: (item: T) => boolean;
}

export function useTableSelection<T>({
  data,
  keyField,
  onSelectionChange,
}: UseTableSelectionOptions<T>): UseTableSelectionResult<T> {
  const [selectedItems, setSelectedItems] = useState<Set<unknown>>(new Set());

  const isAllSelected = selectedItems.size === data.length && data.length > 0;

  const handleSelectAll = useCallback(() => {
    if (selectedItems.size === data.length) {
      setSelectedItems(new Set());
      onSelectionChange?.([]);
    } else {
      const allKeys = new Set(data.map((item) => item[keyField]));
      setSelectedItems(allKeys);
      onSelectionChange?.(data);
    }
  }, [data, keyField, onSelectionChange, selectedItems.size]);

  const handleSelectItem = useCallback(
    (item: T) => {
      const key = item[keyField];
      const newSelected = new Set(selectedItems);
      if (newSelected.has(key)) {
        newSelected.delete(key);
      } else {
        newSelected.add(key);
      }
      setSelectedItems(newSelected);
      onSelectionChange?.(data.filter((d) => newSelected.has(d[keyField])));
    },
    [data, keyField, onSelectionChange, selectedItems]
  );

  const isSelected = useCallback(
    (item: T) => selectedItems.has(item[keyField]),
    [selectedItems, keyField]
  );

  return {
    selectedItems,
    isAllSelected,
    handleSelectAll,
    handleSelectItem,
    isSelected,
  };
}
