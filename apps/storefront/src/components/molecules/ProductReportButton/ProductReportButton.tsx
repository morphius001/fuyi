'use client';

import { useState } from 'react';

import { Button } from '@/components/atoms';

import { Modal } from '../Modal/Modal';
import { ReportListingForm } from '../ReportListingForm/ReportListingForm';

export const ProductReportButton = () => {
  const [openModal, setOpenModal] = useState(false);
  return (
    <>
      <Button
        className="label-md uppercase"
        variant="tonal"
        onClick={() => setOpenModal(true)}
      >
        举报商品
      </Button>
      {openModal && (
        <Modal
          heading="举报商品"
          onClose={() => setOpenModal(false)}
        >
          <ReportListingForm onClose={() => setOpenModal(false)} />
        </Modal>
      )}
    </>
  );
};
