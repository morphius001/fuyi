'use client';

import { Chip } from '@/components/atoms';
import useFilters from '@/hooks/useFilters';
import { CloseIcon } from '@/icons';

const filtersLabels = {
  category: '类目',
  brand: '品牌',
  min_price: '最低价',
  max_price: '最高价',
  color: '颜色',
  size: '尺码',
  query: '搜索',
  condition: '成色',
  rating: '评分'
};

export const ActiveFilterElement = ({ filter }: { filter: string[] }) => {
  const { updateFilters } = useFilters(filter[0]);

  const activeFilters = filter[1].split(',');

  const removeFilterHandler = (filter: string) => {
    updateFilters(filter);
  };

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="label-md hidden md:inline-block">
        {filtersLabels[filter[0] as keyof typeof filtersLabels]}:
      </span>
      {activeFilters.map(element => {
        const Element = () => {
          return (
            <span className="flex cursor-default items-center gap-2 whitespace-nowrap">
              {element}{' '}
              <span onClick={() => removeFilterHandler(element)}>
                <CloseIcon
                  size={16}
                  className="cursor-pointer"
                />
              </span>
            </span>
          );
        };
        return (
          <Chip
            key={element}
            value={<Element />}
          />
        );
      })}
    </div>
  );
};
