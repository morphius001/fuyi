import { BlogCard } from '@/components/organisms';
import { BlogPost } from '@/types/blog';

export const blogPosts: BlogPost[] = [
  {
    id: 1,
    title: '夏季精致配饰指南',
    excerpt: '挑选适合通勤、约会和旅行的配饰，让日常造型更完整。',
    image: '/images/blog/post-1.jpg',
    category: '配饰',
    href: '#'
  },
  {
    id: 2,
    title: '本季热门趋势',
    excerpt: '从亮色单品到复古廓形，快速了解当季值得关注的穿搭方向。',
    image: '/images/blog/post-2.jpg',
    category: '风格指南',
    href: '#'
  },
  {
    id: 3,
    title: '极简外套趋势',
    excerpt: '关注兼顾实穿和利落线条的外套单品，应对多场景穿搭。',
    image: '/images/blog/post-3.jpg',
    category: '趋势',
    href: '#'
  }
];

export function BlogSection() {
  return (
    <section className="container bg-tertiary">
      <div className="mb-12 flex items-center justify-between">
        <h2 className="heading-lg text-tertiary">购物灵感</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <BlogCard
            key={post.id}
            index={index}
            post={post}
          />
        ))}
      </div>
    </section>
  );
}
