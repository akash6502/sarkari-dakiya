import { useState, useEffect } from 'react';
import { LogIn, UserPlus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LoginPageProps {
  onLogin: (email: string, password: string, role: 'admin' | 'user') => Promise<boolean>;
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
}

export function LoginPage({ onLogin, onSignup }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');
  const [adminPrompt, setAdminPrompt] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const next = params.get('next');
  const as = params.get('as');

  useEffect(() => {
    if (as === 'admin') {
      setIsLogin(true);
      setRole('admin');
      setAdminPrompt('Sign in as an admin to access admin features.');
    }
  }, [as]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      const success = await onLogin(email, password, role);
      if (success) {
        navigate(next ?? '/dashboard');
      }
    } else {
      const success = await onSignup(name, email, password);
      if (success) {
        // After signup, switch to login form
        setIsLogin(true);
        setName('');
        setPassword('');
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center px-4 py-4 sm:py-8">
      <div className="max-w-md w-full mx-3 sm:mx-0">
        {/* Logo and Header */}
        <div className={`text-center ${isLogin ? 'mb-8' : 'mb-4'}`}>
          <div className={`inline-flex items-center gap-3 justify-center ${isLogin ? 'mb-3' : 'mb-2'}`}>
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-2xl shadow-lg flex items-center justify-center">
              <span className="text-3xl sm:text-4xl">📬</span>
            </div>
            <div className="text-left">
              <h1 className="text-2xl sm:text-3xl text-white -mb-1">Sarkari Dakiya</h1>
              <p className="text-blue-100 text-sm">Your Gateway to Government Jobs</p>
            </div>
          </div>
        </div>

        {/* Login/Signup Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[86vh] overflow-auto">
          {adminPrompt && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded mb-4 text-sm">
              {adminPrompt}
            </div>
          )}

          <div className={`flex gap-2 ${isLogin ? 'mb-6' : 'mb-4'}`}>
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg transition-colors ${
                !isLogin
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className={`space-y-3 sm:space-y-4 ${isLogin ? '' : 'sm:space-y-3'}`}>
            {!isLogin && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className={`w-full px-4 ${isLogin ? 'py-3' : 'py-2.5'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full px-4 ${isLogin ? 'py-3' : 'py-2.5'} border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
            </div>

            {isLogin && (
              <div>
                <label className="block text-sm text-gray-700 mb-2">Login As</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="user"
                      checked={role === 'user'}
                      onChange={(e) => setRole(e.target.value as 'user')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">User</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="admin"
                      checked={role === 'admin'}
                      onChange={(e) => setRole(e.target.value as 'admin')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Admin</span>
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              className={`w-full bg-blue-600 text-white ${isLogin ? 'py-2.5 sm:py-3' : 'py-2 sm:py-2.5'} rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2`}
            >
              {isLogin ? (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Sign Up</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className={`text-center text-blue-100 text-sm ${isLogin ? 'mt-4' : 'mt-2'}`}>
          © 2025 Sarkari Dakiya - All Rights Reserved
        </p>
      </div>
    </div>
  );
}
