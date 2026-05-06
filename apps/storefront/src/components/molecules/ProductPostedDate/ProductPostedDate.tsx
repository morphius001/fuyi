import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';

export const ProductPostedDate = async ({ posted }: { posted: string | null }) => {
  const postedDate = formatDistanceToNow(new Date(posted || ''), { addSuffix: true, locale: zhCN });

  return <p className="label-md text-secondary">上架时间：{postedDate}</p>;
};
