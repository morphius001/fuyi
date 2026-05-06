"use client";

import Link from "next/link";

import { Button } from "@/components/atoms";

export const OrderReturn = ({ order }: { order: any }) => {
  return (
    <div className="items-center justify-between md:flex">
      <div className="mb-4 md:mb-0">
        <h2 className="label-lg uppercase text-primary">申请售后</h2>
        <p className="label-md max-w-sm text-secondary">
          签收后可按平台规则发起退换货或退款申请，具体时效以商品和商家规则为准。
          <Link href="/returns" className="underline">
            查看售后说明
          </Link>
          .
        </p>
      </div>
      <Link href={`/user/orders/${order.id}/return`}>
        <Button variant="tonal" className="uppercase" onClick={() => null}>
          申请售后
        </Button>
      </Link>
    </div>
  );
};
