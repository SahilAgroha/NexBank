import React from 'react';
import TransactionTable from '../../../components/admin/TransactionTable';

const AdminGatewayTransactions = () => {
  return (
    <TransactionTable 
      title="Transaction Intelligence Report - Gateway" 
      subtitle="Analyze and manage incoming recharge transactions"
      defaultType="RECHARGE"
      showStatusFilter={true}
      showTypeFilter={false}
    />
  );
};

export default AdminGatewayTransactions;
