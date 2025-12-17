import { Bell, Menu, Bookmark, LogOut, PlusCircle, User } from 'lucide-react';

interface HeaderProps {
  user: { name: string; email: string; role: 'admin' | 'user' } | null;
  onLogout: () => void;
  onOpenAdminPanel?: () => void;
}

export function Header({ user, onLogout, onOpenAdminPanel }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-2xl">📬</span>
            </div>
            <div>
              <h1 className="text-xl">Sarkari Dakiya</h1>
              <p className="text-xs text-blue-100">Your Gateway to Government Jobs</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <button 
                onClick={onOpenAdminPanel}
                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline">Post Job</span>
              </button>
            )}
            <button className="p-2 hover:bg-blue-600 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-lg">
              <User className="w-4 h-4" />
              <span className="text-sm hidden md:inline">{user?.name || 'User'}</span>
            </div>
            <button 
              onClick={onLogout}
              className="p-2 hover:bg-blue-600 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}