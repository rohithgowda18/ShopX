import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Package, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function ShopOwnerDashboard() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="p-4 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Shop Dashboard</h2>
        <p className="text-gray-500">Welcome back, {userProfile?.name || 'Owner'}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-blue-600 mb-2">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Pending</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">5</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-orange-500 mb-2">
            <Package className="w-5 h-5" />
            <span className="font-medium">Packing</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">2</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-green-600 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Completed</span>
          </div>
          <span className="text-3xl font-bold text-gray-800">12</span>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center space-x-2 text-purple-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="font-medium">Revenue</span>
          </div>
          <span className="text-xl font-bold text-gray-800">₹4,250</span>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 text-lg">Today's Orders</h3>
          <button onClick={() => navigate('/shop/orders')} className="text-green-600 text-sm font-medium">View All</button>
        </div>
        
        {/* Placeholder for orders */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-3">
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="font-bold text-gray-800">#ORD-9281</p>
              <p className="text-sm text-gray-500">Ramesh K • 15 items</p>
            </div>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md">NEW</span>
          </div>
          <button className="w-full bg-green-50 text-green-700 font-medium py-2 rounded-xl text-sm border border-green-200">
            Accept & Start Packing
          </button>
        </div>
      </div>
      
      <div className="mt-4">
        <button 
          onClick={() => navigate('/shop/products')}
          className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-bold py-4 rounded-2xl hover:bg-blue-100 transition-colors flex justify-center items-center space-x-2"
        >
          <Package className="w-5 h-5" />
          <span>Manage Inventory (Add Products)</span>
        </button>
      </div>
    </div>
  );
}
