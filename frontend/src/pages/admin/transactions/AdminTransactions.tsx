import React from 'react';
import TransactionTable from '../../../components/admin/TransactionTable';

const AdminTransactions = () => {
  return (
    <TransactionTable 
      title="Transaction Report" 
      subtitle="Analyze and manage your platform flow"
      showStatusFilter={true}
      showTypeFilter={true}
    />
  );
};

export default AdminTransactions;
