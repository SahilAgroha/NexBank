import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { register as registerAction } from '../../features/auth/authSlice';
import { Lock, Mail, User, Phone, Briefcase } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  partnerType: z.enum(['SUPER_HEAD', 'MASTER_DEALER', 'DISTRIBUTOR', 'RETAILER']),
  parentPartnerId: z.string().optional(),
});

type RegisterForm = z.infer<typeof registerSchema>;

const PartnerRegister = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      partnerType: 'RETAILER'
    }
  });

  const onSubmit = async (data: z.infer<typeof registerSchema>) => {
    try {
      const registerData = {
        ...data,
        role: 'PARTNER'
      };
      const resultAction = await dispatch(registerAction({ formData: registerData, portal: 'partner' }));
      if (registerAction.fulfilled.match(resultAction)) {
        navigate('/verify-otp', { state: { email: data.email, portal: 'partner' } });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-blue-900">
          Partner Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Already a partner?{' '}
          <Link to="/partner/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-blue-600">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            {/* Same fields as UserRegister */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('fullName')}
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email address</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('phone')}
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Partner Type</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  {...register('partnerType')}
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border bg-white"
                >
                  <option value="RETAILER">Retailer</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                  <option value="MASTER_DEALER">Master Dealer</option>
                  <option value="SUPER_HEAD">Super Head</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Partner ID (Optional)</label>
              <div className="mt-1">
                <input
                  {...register('parentPartnerId')}
                  type="text"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md py-3 border px-3"
                  placeholder="e.g. 104"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 border"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Apply as Partner'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PartnerRegister;
