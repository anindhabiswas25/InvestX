import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWallet } from '../../hooks/useWallet';
import { toast } from 'react-toastify';
import { FiArrowRight, FiCheckCircle, FiShield, FiUser } from 'react-icons/fi';

const registerSchema = yup.object({
  name: yup.string().required('Full name is required').min(2),
  email: yup.string().email('Enter a valid email').required('Email is required'),
  password: yup.string().required('Password is required').min(8, 'Minimum 8 characters')
    .matches(/\d/, 'Must contain a number'),
  phone: yup.string().optional().matches(/^[6-9]\d{9}$/, { message: 'Valid 10‑digit phone', excludeEmptyString: true }),
});

const RaiseFundsPage = () => {
  const { user, register: registerUser } = useAuth();
  const { walletAddress, isConnected } = useWallet();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=info, 2=register, 3=go-to-kyc
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: yupResolver(registerSchema) });

  useEffect(() => {
    // Already a fully registered business_owner (not a wallet-only user)
    if (user?.role === 'business_owner' && !user?.isWalletUser) {
      if (user?.kycStatus === 'verified') {
        navigate('/apply-funding');
      } else {
        setStep(3);
      }
    }
    // Wallet-only investor → always show register form (step 2)
    // They need to provide email/password to become a business_owner
  }, [user, navigate]);

  const onSubmit = async (data) => {
    try {
      // Include walletAddress so backend can upgrade existing wallet-only user
      const payload = { ...data, role: 'business_owner' };
      if (isConnected && walletAddress) {
        payload.walletAddress = walletAddress;
      }
      await registerUser(payload);
      toast.success('Account created! Now complete your KYC.');
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Raise Funds for Your Business</h1>
          <p className="text-gray-500">
            Get your local business funded by community investors — powered by Stellar blockchain.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center mb-10">
          {[
            { n: 1, label: 'Learn' },
            { n: 2, label: 'Register' },
            { n: 3, label: 'KYC' },
            { n: 4, label: 'Apply' },
          ].map((s, i) => (
            <React.Fragment key={s.n}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s.n ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>{s.n}</div>
                <span className="text-xs text-gray-500 mt-1">{s.label}</span>
              </div>
              {i < 3 && <div className={`w-12 h-0.5 mx-1 ${step > s.n ? 'bg-primary-600' : 'bg-gray-200'}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Information */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">How Fund Raising Works</h2>
            <div className="space-y-4 mb-8">
              {[
                { icon: <FiUser className="text-primary-600" />, title: 'Create an Account', desc: 'Register with your email and basic details as a business owner.' },
                { icon: <FiShield className="text-primary-600" />, title: 'Complete KYC Verification', desc: 'Upload your Aadhaar, PAN, and a selfie for identity verification.' },
                { icon: <FiCheckCircle className="text-primary-600" />, title: 'Submit Your Business', desc: 'Fill in business details — our AI scores your application, then an admin reviews.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 text-lg">{item.icon}</div>
                  <div>
                    <h3 className="font-medium text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm text-yellow-800">
              <strong>Note:</strong> Login and KYC verification is mandatory for fund raisers. Investors just need to connect their wallet.
            </div>
            {user?.role === 'business_owner' && !user?.isWalletUser ? (
              <button onClick={() => setStep(3)} className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center">
                Continue to KYC <FiArrowRight className="ml-2" />
              </button>
            ) : (
              <button onClick={() => setStep(2)} className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 flex items-center justify-center">
                Get Started — Create Account <FiArrowRight className="ml-2" />
              </button>
            )}
            <p className="text-center text-sm text-gray-500 mt-4">
              Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* Step 2: Register Form */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Create Business Owner Account</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input {...register('name')} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Your full name" />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input {...register('email')} type="email" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="you@example.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input {...register('password')} type="password" className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Min 8 chars with a number" />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                <input {...register('phone')} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="10-digit mobile" />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting}
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50">
                {isSubmitting ? 'Creating Account...' : 'Create Account & Continue'}
              </button>
            </form>
            <p className="text-center text-sm text-gray-500 mt-4">
              Already registered? <Link to="/login" className="text-primary-600 hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* Step 3: Go to KYC */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiShield className="text-yellow-600 text-2xl" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Complete KYC Verification</h2>
            <p className="text-gray-500 mb-6">
              To list your business and raise funds, you need to verify your identity. 
              This protects investors and ensures trust on the platform.
            </p>
            <Link to="/kyc" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-700">
              Complete KYC Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaiseFundsPage;
