'use client';

import { Accordion, FilterCheckboxOption } from '@/components/molecules';
import useFilters from '@/hooks/useFilters';

const filters = [
  { label: '全新', amount: 78 },
  { label: '全新带吊牌', amount: 40 },
  { label: '二手 - 极好', amount: 7 },
  { label: '二手 - 良好', amount: 16 },
  { label: '二手 - 一般', amount: 0 }
];

export const ConditionFilter = () => {
  const { updateFilters, isFilterActive } = useFilters('condition');

  const selectHandler = (option: string) => {
    updateFilters(option);
  };

  return (
    <Accordion
      heading="成色"
      data-testid="filter-condition"
    >
      <ul
        className="px-4"
        data-testid="filter-condition-options"
      >
        {filters.map(({ label, amount }) => (
          <li
            key={label}
            className="mb-4"
          >
            <FilterCheckboxOption
              checked={isFilterActive(label)}
              disabled={Boolean(!amount)}
              onCheck={selectHandler}
              label={label}
              amount={amount}
              data-testid={`filter-condition-checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  );
};
