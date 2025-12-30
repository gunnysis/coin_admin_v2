import React from 'react';
import { EmptyState } from '../ui/EmptyState';

export const EmptyChart: React.FC = () => {
  return (
    <EmptyState
      icon="📊"
      title="표시할 데이터가 없습니다"
      description="고정비를 추가하면 차트가 표시됩니다"
    />
  );
};
