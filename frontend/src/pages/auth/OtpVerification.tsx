import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { verifySignup } from '../../features/auth/authSlice';

const OtpVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const email = location.state?.email;
  const portal = location.state?.portal;
  
  const [otpCode, setOtpCode] = useState('');

  if (!email || !portal) {
    return <Navigate to="/user/login" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) return;
    
    try {
      const resultAction = await dispatch(verifySignup({ email, otpCode, portal }));
      if (verifySignup.fulfilled.match(resultAction)) {
        navigate(`/${portal}/dashboard`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Verify your Email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We sent a 6-digit verification code to <span className="font-bold">{email}</span>.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 text-center mb-4">Enter OTP Code</label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="focus:ring-blue-500 focus:border-blue-500 block w-full text-center text-3xl tracking-[1em] sm:text-2xl border-gray-300 rounded-md py-4 border font-mono"
                placeholder="000000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;
