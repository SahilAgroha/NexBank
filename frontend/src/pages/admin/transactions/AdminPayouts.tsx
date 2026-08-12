import React from 'react';
import TransactionTable from '../../../components/admin/TransactionTable';

const AdminPayouts = () => {
  return (
    <TransactionTable 
      title="Transaction Intelligence Report - Payouts" 
      subtitle="Analyze and manage your platform flow for outgoing payouts"
      defaultType="WITHDRAWAL"
      showStatusFilter={true}
      showTypeFilter={false}
    />
  );
};

export default AdminPayouts;
