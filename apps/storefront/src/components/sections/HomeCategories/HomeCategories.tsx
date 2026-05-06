import { Carousel } from '@/components/cells';
import { CategoryCard } from '@/components/organisms';

export const categories: { id: number; name: string; handle: string }[] = [
  {
    id: 1,
    name: '运动鞋',
    handle: 'sneakers'
  },
  {
    id: 2,
    name: '凉鞋',
    handle: 'sandals'
  },
  {
    id: 3,
    name: '靴子',
    handle: 'boots'
  },
  {
    id: 4,
    name: '运动',
    handle: 'sport'
  },
  {
    id: 5,
    name: '配饰',
    handle: 'accessories'
  }
];

export const HomeCategories = async ({ heading }: { heading: string }) => {
  return (
    <section className="w-full bg-primary py-8">
      <div className="mb-6">
        <h2 className="heading-lg uppercase text-primary">{heading}</h2>
      </div>
      <Carousel
        items={categories?.map(category => (
          <CategoryCard
            key={category.id}
            category={category}
          />
        ))}
      />
    </section>
  );
};
