'use client';

import { useState } from 'react';

import { HttpTypes } from '@medusajs/types';
import { useUnreads } from '@talkjs/react';

import { Badge, Divider, LogoutButton, NavigationItem } from '@/components/atoms';
import { Dropdown } from '@/components/molecules';
import LocalizedClientLink from '@/components/molecules/LocalizedLink/LocalizedLink';
import { ProfileIcon } from '@/icons';

export const UserDropdown = ({ isLoggedIn }: { isLoggedIn: boolean }) => {
  const [open, setOpen] = useState(false);

  const unreads = useUnreads();

  return (
    <div
      className="relative"
      onMouseOver={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
    >
      <LocalizedClientLink
        href={isLoggedIn ? '/user' : '/login'}
        className="relative"
        aria-label="进入个人中心"
      >
        <ProfileIcon size={20} />
      </LocalizedClientLink>
      <Dropdown show={open}>
        {isLoggedIn ? (
          <div className="p-1">
            <div className="lg:w-[200px]">
              <h3 className="heading-xs border-b p-4 uppercase">我的账户</h3>
            </div>
            <NavigationItem href="/user/orders">订单</NavigationItem>
            <NavigationItem
              href="/user/messages"
              className="relative"
            >
              消息
              {Boolean(unreads?.length) && (
                <Badge className="absolute left-24 top-3 h-4 w-4 p-0">{unreads?.length}</Badge>
              )}
            </NavigationItem>
            <NavigationItem href="/user/returns">售后</NavigationItem>
            <NavigationItem href="/user/addresses">地址</NavigationItem>
            <NavigationItem href="/user/reviews">评价</NavigationItem>
            <NavigationItem href="/user/wishlist">收藏</NavigationItem>
            <Divider />
            <NavigationItem href="/user/settings">设置</NavigationItem>
            <LogoutButton />
          </div>
        ) : (
          <div className="p-1">
            <NavigationItem href="/login">登录</NavigationItem>
            <NavigationItem href="/register">注册</NavigationItem>
          </div>
        )}
      </Dropdown>
    </div>
  );
};
