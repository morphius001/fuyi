'use client';

import { Accordion, FilterCheckboxOption } from '@/components/molecules';
import useFilters from '@/hooks/useFilters';
import { cn } from '@/lib/utils';

const colorFilters = [
  {
    label: '黑色',
    amount: 40,
    color: 'bg-[rgba(9,9,9,1)]'
  },
  {
    label: '灰色',
    amount: 78,
    color: 'bg-[rgba(82,82,82,1)]'
  },
  {
    label: '白色',
    amount: 7,
    color: 'bg-[rgba(255,255,255,1)]'
  },
  {
    label: '黄色',
    amount: 7,
    color: 'bg-[rgba(255,191,58,1)]'
  },
  {
    label: '红色',
    amount: 16,
    color: 'bg-[rgba(217,45,32,1)]'
  },
  {
    label: '橙色',
    amount: 0,
    color: 'bg-[rgba(247,144,9,1)]'
  },
  {
    label: '蓝色',
    amount: 46,
    color: 'bg-[rgba(77,160,255,1)]'
  },
  {
    label: '海军蓝',
    amount: 87,
    color: 'bg-[rgba(0,67,143,1)]'
  },
  {
    label: '绿色',
    amount: 32,
    color: 'bg-[rgba(23,163,74,1)]'
  },
  {
    label: '多色',
    amount: 6,
    color: 'multi-gradient'
  }
];

export const ColorFilter = () => {
  const { updateFilters, isFilterActive } = useFilters('color');

  const selectHandler = (option: string) => {
    updateFilters(option);
  };

  return (
    <Accordion
      heading="颜色"
      data-testid="filter-color"
    >
      <ul
        className="px-4"
        data-testid="filter-color-options"
      >
        {colorFilters.map(({ label, amount, color }) => (
          <li
            key={label}
            className="mb-4 flex items-center justify-between"
          >
            <FilterCheckboxOption
              checked={isFilterActive(label)}
              disabled={Boolean(!amount)}
              onCheck={selectHandler}
              label={label}
              amount={amount}
              data-testid={`filter-color-checkbox-${label.toLowerCase()}`}
            />
            <div
              className={cn(
                'h-5 w-5 rounded-xs border border-primary',
                color,
                Boolean(!amount) && 'opacity-30'
              )}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  );
};
