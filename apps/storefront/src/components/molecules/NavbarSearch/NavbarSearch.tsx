"use client";

import { useState } from "react";

import clsx from "clsx";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/atoms";
import { SearchIcon } from "@/icons";

interface Props {
  className?: string;
}

export const NavbarSearch = ({ className }: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [search, setSearch] = useState(searchParams.get("query") || "");

  const handleSearch = () => {
    const keyword = search.trim();

    if (keyword) {
      router.push(`/categories?query=${encodeURIComponent(keyword)}`);
    } else {
      router.push(`/categories`);
    }
  };

  const submitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <form
      className={clsx("w-full", className)}
      method="POST"
      onSubmit={submitHandler}
    >
      <Input
        icon={<SearchIcon />}
        onIconClick={handleSearch}
        iconAriaLabel="搜索"
        placeholder="搜索商品、品牌、商家"
        value={search}
        changeValue={setSearch}
        type="search"
      />
      <input type="submit" className="hidden" />
    </form>
  );
};
