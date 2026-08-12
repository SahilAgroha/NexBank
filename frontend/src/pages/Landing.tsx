import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Building2, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import type { RootState } from '../store/store';

const Landing = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);

  // If already logged in, redirect to their dashboard
  if (token && user) {
    return <Navigate to={`/${user.role.toLowerCase()}/dashboard`} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
          Welcome to NexBank Platform
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Select your portal to securely access your account and services.
        </p>
      </div>

      <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-5xl">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 px-4 sm:px-0">
          
          {/* Customer Portal Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Portal</h3>
              <p className="text-sm text-gray-500 mb-6">
                Manage your wallet, make transfers, and pay your bills seamlessly.
              </p>
              <Link
                to="/user/login"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Enter Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Partner Portal Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mb-6">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Partner Portal</h3>
              <p className="text-sm text-gray-500 mb-6">
                Manage your customers, track commissions, and process recharges.
              </p>
              <Link
                to="/partner/login"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Enter Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Admin Portal Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
            <div className="p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Portal</h3>
              <p className="text-sm text-gray-500 mb-6">
                Full system control, ledger management, and compliance tools.
              </p>
              <Link
                to="/admin/login"
                className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
              >
                Enter Portal <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Landing;
