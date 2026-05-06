import { Card } from "@/components/atoms";

export const OrderTrack = ({ order }: { order: any }) => {
  if (!order.fulfillments[0]?.labels?.length) return null;

  const labels = order.fulfillments[0]?.labels;

  return (
    <div>
      <h2 className="label-lg uppercase text-primary">物流追踪</h2>
      <ul className="mt-4">
        {labels.map((item: any) => (
          <li key={item.id}>
            <a
              href={item.tracking_number}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Card className="px-4 hover:bg-secondary/30">
                运单号：{item.tracking_number}
              </Card>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
