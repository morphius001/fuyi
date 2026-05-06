import { toast as medusaToast } from '@medusajs/ui';

export const toast = {
  info: ({ description, title }: { description?: string; title: string }) => {
    medusaToast.info(title, {
      description
    });
  },
  success: ({ description, title }: { description?: string; title: string }) => {
    medusaToast.success(title, {
      description,
      duration: 10000
    });
  },
  error: ({ description, title }: { description?: string; title: string }) => {
    medusaToast.error(title, {
      description
    });
  }
};
