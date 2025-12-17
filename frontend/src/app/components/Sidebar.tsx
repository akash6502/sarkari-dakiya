import { Search, Filter, Bookmark, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface SidebarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: string) => void;
  selectedFilter: string;
  onViewChange: (view: 'all' | 'bookmarked' | 'trending') => void;
  currentView: 'all' | 'bookmarked' | 'trending';
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ onSearch, onFilterChange, selectedFilter, onViewChange, currentView, isCollapsed, onToggleCollapse }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const categories = [
    { id: 'All Jobs', label: 'All Jobs', count: 250 },
    { id: 'Railway', label: 'Railway', count: 45 },
    { id: 'Banking', label: 'Banking', count: 38 },
    { id: 'SSC', label: 'SSC', count: 52 },
    { id: 'UPSC', label: 'UPSC', count: 28 },
    { id: 'State Govt', label: 'State Govt', count: 67 },
    { id: 'Teaching', label: 'Teaching', count: 20 },
  ];

  const views = [
    { id: 'all' as const, label: 'All Jobs', icon: Filter },
    { id: 'bookmarked' as const, label: 'Bookmarked', icon: Bookmark },
    { id: 'trending' as const, label: 'Trending', icon: TrendingUp },
  ];

  return (
    <div className={`bg-white border-r border-gray-200 h-screen sticky top-0 overflow-y-auto transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute right-0 top-6 bg-blue-600 text-white p-1 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {isCollapsed ? (
        // Collapsed view - icons only
        <div className="p-3 flex flex-col items-center gap-4 mt-4">
          {views.map((view) => {
            const Icon = view.icon;
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`p-3 rounded-lg transition-colors ${
                  currentView === view.id
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                title={view.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
      ) : (
        // Expanded view
        <div className="p-6">
          {/* Search Section */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4" />
              Search Jobs
            </h3>
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </form>
          </div>

          {/* View Options */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-700 mb-3">Views</h3>
            <div className="space-y-1">
              {views.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                      currentView === view.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{view.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="text-sm text-gray-700 mb-3 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Categories
            </h3>
            <div className="space-y-1">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => onFilterChange(category.id)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors text-sm ${
                    selectedFilter === category.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{category.label}</span>
                  <span className="text-xs text-gray-500">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-700" />
              <h3 className="text-sm text-blue-900">Latest Updates</h3>
            </div>
            <p className="text-xs text-blue-700">
              15 new jobs posted today
            </p>
            <p className="text-xs text-blue-600 mt-1">
              42 deadlines this week
            </p>
          </div>
        </div>
      )}
    </div>
  );
}