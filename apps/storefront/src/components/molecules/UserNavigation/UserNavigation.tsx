'use client';

import { useUnreads } from '@talkjs/react';
import { usePathname } from 'next/navigation';

import { Badge, Card, Divider, LogoutButton, NavigationItem } from '@/components/atoms';

const navigationItems = [
  {
    label: '订单',
    href: '/user/orders'
  },
  {
    label: '消息',
    href: '/user/messages'
  },
  {
    label: '售后',
    href: '/user/returns'
  },
  {
    label: '地址',
    href: '/user/addresses'
  },
  {
    label: '评价',
    href: '/user/reviews'
  },
  {
    label: '收藏',
    href: '/user/wishlist'
  }
];

export const UserNavigation = () => {
  const unreads = useUnreads();
  const path = usePathname();

  return (
    <Card className="h-min">
      {navigationItems.map(item => (
        <NavigationItem
          key={item.label}
          href={item.href}
          active={path === item.href}
          className="relative"
        >
          {item.label}
          {item.label === '消息' && Boolean(unreads?.length) && (
            <Badge className="absolute left-24 top-3 h-4 w-4 p-0">{unreads?.length}</Badge>
          )}
        </NavigationItem>
      ))}
      <Divider className="my-2" />
      <NavigationItem
        href={'/user/settings'}
        active={path === '/user/settings'}
      >
        设置
      </NavigationItem>
      <LogoutButton className="w-full text-left" />
    </Card>
  );
};
