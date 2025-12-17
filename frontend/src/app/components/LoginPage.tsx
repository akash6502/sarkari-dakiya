import { useState } from 'react';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string, password: string, role: 'admin' | 'user') => void;
  onSignup: (name: string, email: string, password: string) => void;
}

export function LoginPage({ onLogin, onSignup }: LoginPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user'>('user');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      onLogin(email, password, role);
    } else {
      onSignup(name, email, password);
    }
  };

  // Quick login buttons for demo
  const quickLogin = (demoRole: 'admin' | 'user') => {
    if (demoRole === 'admin') {
      onLogin('admin@sarkaridakiya.in', 'admin123', 'admin');
    } else {
      onLogin('user@example.com', 'user123', 'user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-5xl">📬</span>
          </div>
          <h1 className="text-4xl text-white mb-2">Sarkari Dakiya</h1>
          <p className="text-blue-100">Your Gateway to Government Jobs</p>
        </div>

        {/* Login/Signup Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6">
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
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

          {/* Demo Login Buttons */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">Quick Demo Login:</p>
            <div className="flex gap-2">
              <button
                onClick={() => quickLogin('user')}
                className="flex-1 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                Login as User
              </button>
              <button
                onClick={() => quickLogin('admin')}
                className="flex-1 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm"
              >
                Login as Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-blue-100 text-sm mt-6">
          © 2025 Sarkari Dakiya - All Rights Reserved
        </p>
      </div>
    </div>
  );
}
