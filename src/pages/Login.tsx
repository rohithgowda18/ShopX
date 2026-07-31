import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { devLogin } = useAuth();

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      toast.success('OTP sent successfully');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send OTP. Try adding +91');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      await confirmationResult?.confirm(otp);
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = (role: 'customer' | 'shop_owner') => {
    devLogin(role);
    toast.success(`Logged in as Dev ${role === 'customer' ? 'Customer' : 'Shop Owner'}`);
    navigate('/');
  };

  return (
    <div className="h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200 dark:sm:border-gray-800 transition-colors shadow-2xl overflow-hidden">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full mx-4 transition-colors max-h-[95dvh] overflow-y-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-3xl">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kirana AI</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Your smart grocery assistant</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">+91</span>
                <input
                  type="tel"
                  className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none dark:text-white transition-colors"
                  placeholder="Enter mobile number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Get OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enter OTP</label>
              <input
                type="text"
                maxLength={6}
                className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none tracking-widest text-center text-xl dark:text-white transition-colors"
                placeholder="------"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white font-medium py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-sm text-green-600 hover:underline"
            >
              Change Phone Number
            </button>
          </form>
        )}
        <div id="recaptcha-container"></div>
        
        <div className="mt-8 border-t dark:border-gray-700 pt-6">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-4 uppercase tracking-wider font-bold">Developer Mode</p>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => handleDevLogin('customer')}
              className="flex-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium py-2 rounded-xl text-sm border border-blue-200 dark:border-blue-900 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
            >
              Dev Customer
            </button>
            <button
              type="button"
              onClick={() => handleDevLogin('shop_owner')}
              className="flex-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-medium py-2 rounded-xl text-sm border border-orange-200 dark:border-orange-900 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
            >
              Dev Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
