import React from 'react';
import TransactionTable from '../../../components/admin/TransactionTable';

const AdminPendingApprovals = () => {
  return (
    <TransactionTable 
      title="Queue Management" 
      subtitle="Manual verification and operational override"
      defaultStatus="PENDING"
      showStatusFilter={false}
      showTypeFilter={true}
    />
  );
};

export default AdminPendingApprovals;
