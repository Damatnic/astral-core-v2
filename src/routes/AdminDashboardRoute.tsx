import React from 'react';
import AdminDashboardView from '../views/AdminDashboardView';

/**
 * Route wrapper for AdminDashboardView that provides required props
 */
const AdminDashboardRoute: React.FC = () => {
  const handleUpdateApplicationStatus = (helperId: string, status: "none" | "pending" | "approved" | "rejected", notes?: string) => {
    // Handle application status update
    console.log('Updating application status:', { helperId, status, notes });
    // In a real implementation, this would call an API to update the status
  };

  return (
    <AdminDashboardView 
      onUpdateApplicationStatus={handleUpdateApplicationStatus}
    />
  );
};

export default AdminDashboardRoute;
