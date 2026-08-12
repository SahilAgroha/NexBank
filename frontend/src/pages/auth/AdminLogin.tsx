import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import type { AppDispatch, RootState } from '../../store/store';
import { login } from '../../features/auth/authSlice';
import { Lock, Mail } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const AdminLogin = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const { register, handleSubmit } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      const resultAction = await dispatch(login({ credentials: data, portal: 'admin' }));
      if (login.fulfilled.match(resultAction)) {
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Admin Portal
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border-t-4 border-red-600">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-900 border-l-4 border-red-500 p-4">
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-300">Admin Email</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  className="bg-gray-700 text-white focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-600 rounded-md py-3 border"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  className="bg-gray-700 text-white focus:ring-red-500 focus:border-red-500 block w-full pl-10 sm:text-sm border-gray-600 rounded-md py-3 border"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
