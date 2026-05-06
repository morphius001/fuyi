import { OrderConfirmedSection } from "@/components/sections/OrderConfirmedSection/OrderConfirmedSection";
import { retrieveOrder } from "@/lib/data/orders";
import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};
export const metadata: Metadata = {
  title: "订单已提交",
  description: "订单已提交，请以订单状态和支付服务端通知结果为准",
};

export default async function OrderConfirmedPage(props: Props) {
  const params = await props.params;
  const order = await retrieveOrder(params.id).catch(() => null);

  if (!order) {
    return notFound();
  }

  return (
    <main className="container">
      <OrderConfirmedSection order={order} />
    </main>
  );
}
