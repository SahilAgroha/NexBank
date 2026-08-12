import React from 'react';
import TransactionTable from '../../../components/admin/TransactionTable';

const AdminFailedTransactions = () => {
  return (
    <TransactionTable 
      title="Failed Transactions" 
      subtitle="View all failed or rejected transactions"
      defaultStatus="FAILED"
      showStatusFilter={false}
      showTypeFilter={true}
    />
  );
};

export default AdminFailedTransactions;
