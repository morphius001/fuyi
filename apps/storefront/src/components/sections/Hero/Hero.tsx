import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@/icons";

import tailwindConfig from "../../../../tailwind.config";
import { NavbarSearch } from "../../molecules/NavbarSearch/NavbarSearch";

type HeroProps = {
  image: string;
  heading: string;
  paragraph: string;
  buttons: { label: string; path: string }[];
};

export const Hero = ({ image, heading, paragraph, buttons }: HeroProps) => {
  return (
    <section className="container mt-5 flex w-full flex-col text-primary lg:flex-row">
      <Image
        src={decodeURIComponent(image)}
        width={700}
        height={600}
        alt={`首页主视觉 - ${heading}`}
        className="order-2 w-full lg:order-1"
        priority
        fetchPriority="high"
        quality={50}
        sizes="(min-width: 1024px) 50vw, 100vw"
      />
      <div className="w-full lg:order-2">
        <div className="flex h-[calc(100%-144px)] w-full items-end rounded-sm border px-6 py-8">
          <div className="w-full">
            <h2 className="display-md mb-6 max-w-[652px] text-4xl font-bold uppercase leading-tight md:text-5xl">
              {heading}
            </h2>
            <p className="mb-8 text-lg">{paragraph}</p>
            <div className="mb-4 max-w-[520px]">
              <NavbarSearch />
            </div>
            <div className="flex flex-wrap gap-2 text-sm text-secondary">
              <span>热门搜索：</span>
              <Link
                href="/categories?query=%E8%BF%90%E5%8A%A8%E9%9E%8B"
                className="hover:text-primary"
              >
                运动鞋
              </Link>
              <Link
                href="/categories?query=%E9%80%9A%E5%8B%A4"
                className="hover:text-primary"
              >
                通勤
              </Link>
              <Link
                href="/categories?query=%E9%85%8D%E9%A5%B0"
                className="hover:text-primary"
              >
                配饰
              </Link>
            </div>
          </div>
        </div>
        {buttons.length && (
          <div className="flex h-[72px] font-bold uppercase lg:h-[144px]">
            {buttons.map(({ label, path }) => (
              <Link
                key={path}
                href={path}
                className="bg-content group flex h-full w-1/2 items-end justify-between rounded-sm border p-6 transition-all duration-300 hover:bg-action hover:text-tertiary"
                aria-label={label}
                title={label}
              >
                <span>
                  <span className="hidden group-hover:inline-flex">#</span>
                  {label}
                </span>

                <ArrowRightIcon
                  color={tailwindConfig.theme.extend.backgroundColor.primary}
                  aria-hidden
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
