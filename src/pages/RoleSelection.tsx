import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Store, User } from 'lucide-react';
import { toast } from 'sonner';

export default function RoleSelection() {
  const { setUserRole } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSelectRole = async (role: UserRole) => {
    setLoading(true);
    try {
      await setUserRole(role);
      toast.success('Role selected successfully');
      navigate('/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to set role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 max-w-md mx-auto p-4">
      <div className="w-full">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Welcome to Namma Angadi</h1>
        <p className="text-gray-500 text-center mb-8">How will you use this app?</p>

        <div className="space-y-4">
          <button
            onClick={() => handleSelectRole('customer')}
            disabled={loading}
            className="w-full flex items-center p-6 bg-white border-2 border-transparent hover:border-green-500 rounded-2xl shadow-sm transition-all focus:outline-none"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-6 shrink-0">
              <User className="w-8 h-8 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800">Customer</h3>
              <p className="text-sm text-gray-500 mt-1">Create smart grocery lists and send them to nearby shops.</p>
            </div>
          </button>

          <button
            onClick={() => handleSelectRole('shop_owner')}
            disabled={loading}
            className="w-full flex items-center p-6 bg-white border-2 border-transparent hover:border-green-500 rounded-2xl shadow-sm transition-all focus:outline-none"
          >
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mr-6 shrink-0">
              <Store className="w-8 h-8 text-orange-600" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-bold text-gray-800">Shop Owner</h3>
              <p className="text-sm text-gray-500 mt-1">Receive orders, manage inventory, and grow your business.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
