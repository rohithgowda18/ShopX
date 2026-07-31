import React, { useState, useEffect } from 'react';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Mail, Phone, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Email State (PRIMARY)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Phone State (SECONDARY)
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.recaptchaVerifier && loginMethod === 'phone') {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [loginMethod]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Logged in successfully');
      }
      navigate('/');
    } catch (error: any) {
      console.error(error);
      const msg = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential'
        ? 'Invalid email or password'
        : error.message;
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

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
      toast.error(error.message || 'Failed to send OTP');
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

  return (
    <div className="h-[100dvh] flex items-center justify-center bg-gray-50 dark:bg-gray-900 sm:max-w-md sm:mx-auto sm:border-x sm:border-gray-200 dark:sm:border-gray-800 transition-colors shadow-2xl overflow-hidden">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full mx-4 transition-colors max-h-[95dvh] overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
            <span className="text-white font-bold text-3xl">K</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Kirana AI</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Your smart grocery assistant</p>
        </div>

        {/* Tab Switcher: Primary Email, Secondary Phone */}
        <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setLoginMethod('email')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${
              loginMethod === 'email'
                ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            <Mail className="w-4 h-4" /> Email & Password
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all min-h-touch ${
              loginMethod === 'phone'
                ? 'bg-white dark:bg-gray-800 text-emerald-700 dark:text-emerald-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
            }`}
          >
            <Phone className="w-4 h-4" /> Phone OTP
          </button>
        </div>

        {/* PRIMARY: Email & Password Form */}
        {loginMethod === 'email' ? (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm dark:text-white transition-colors"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm dark:text-white transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none p-1"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 min-h-touch flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
              </button>
            </div>
          </form>
        ) : (
          /* SECONDARY: Phone OTP Form */
          step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium">+91</span>
                  <input
                    type="tel"
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-sm dark:text-white transition-colors"
                    placeholder="Enter mobile number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 min-h-touch flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? 'Sending...' : 'Get OTP'} <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">Enter OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none tracking-widest text-center text-xl dark:text-white transition-colors"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 min-h-touch shadow-sm"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline pt-2"
              >
                Change Phone Number
              </button>
            </form>
          )
        )}

        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
