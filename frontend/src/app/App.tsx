import { useState, useEffect } from 'react';
import { JobCard, Job } from './components/JobCard';
import { CommentSection, Comment } from './components/CommentSection';
import { Header } from './components/Header';
import { ShareModal } from './components/ShareModal';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { AdminPanel } from './components/AdminPanel';
import { JobDetailModal } from './components/JobDetailModal';

// Mock data for government jobs
const initialJobs: Job[] = [
  {
    id: '1',
    title: 'Junior Engineer (Civil)',
    department: 'Indian Railways - Railway Recruitment Board',
    location: 'All India',
    vacancies: 2450,
    lastDate: '2025-01-15',
    postedDate: '2024-12-10',
    qualification: '10+2 with ITI or Diploma in Civil Engineering',
    category: 'Railway',
    description: 'Railway Recruitment Board invites applications for Junior Engineer posts in Civil Engineering discipline. Candidates will be responsible for maintenance and construction of railway infrastructure.',
    likes: 1234,
    comments: 45,
    shares: 89,
  },
  {
    id: '2',
    title: 'Probationary Officer',
    department: 'State Bank of India',
    location: 'Pan India',
    vacancies: 1500,
    lastDate: '2025-01-20',
    postedDate: '2024-12-12',
    qualification: 'Graduate in any discipline from a recognized university',
    category: 'Banking',
    description: 'SBI is looking for talented graduates to join as Probationary Officers. Selected candidates will undergo comprehensive training and will be posted across various branches.',
    likes: 2156,
    comments: 78,
    shares: 156,
  },
  {
    id: '3',
    title: 'Combined Graduate Level Examination (Tier-I)',
    department: 'Staff Selection Commission',
    location: 'Multiple Locations',
    vacancies: 3500,
    lastDate: '2025-01-25',
    postedDate: '2024-12-08',
    qualification: 'Bachelor\'s Degree from a recognized University',
    category: 'SSC',
    description: 'SSC CGL exam for recruitment to various Group B and Group C posts in Ministries/Departments/Organizations of the Government of India.',
    likes: 3421,
    comments: 142,
    shares: 234,
  },
  {
    id: '4',
    title: 'Assistant Professor',
    department: 'Delhi University',
    location: 'Delhi',
    vacancies: 250,
    lastDate: '2025-02-01',
    postedDate: '2024-12-14',
    qualification: 'Ph.D. with NET/SET in relevant subject',
    category: 'Teaching',
    description: 'University of Delhi invites applications for Assistant Professor positions across various departments. Candidates must have excellent teaching and research credentials.',
    likes: 876,
    comments: 32,
    shares: 67,
  },
  {
    id: '5',
    title: 'Sub Inspector (Executive)',
    department: 'Central Bureau of Investigation',
    location: 'New Delhi',
    vacancies: 120,
    lastDate: '2025-01-30',
    postedDate: '2024-12-11',
    qualification: 'Graduate with 50% marks and valid driving license',
    category: 'UPSC',
    description: 'CBI invites applications for the post of Sub Inspector (Executive). Candidates will be involved in investigation of various cases and administrative duties.',
    likes: 1567,
    comments: 91,
    shares: 123,
  },
  {
    id: '6',
    title: 'Forest Range Officer',
    department: 'Maharashtra Forest Department',
    location: 'Maharashtra',
    vacancies: 180,
    lastDate: '2025-02-10',
    postedDate: '2024-12-09',
    qualification: 'Bachelor\'s Degree in Forestry or Environmental Science',
    category: 'State Govt',
    description: 'Maharashtra State Government is hiring Forest Range Officers for conservation and management of forest resources across the state.',
    likes: 654,
    comments: 28,
    shares: 45,
  },
];

const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      author: 'Rahul Kumar',
      avatar: 'RK',
      content: 'Great opportunity! Has anyone appeared for RRB JE exam before? Any tips?',
      timestamp: '2024-12-15T10:30:00',
      likes: 12,
    },
    {
      id: 'c2',
      author: 'Priya Singh',
      avatar: 'PS',
      content: 'Thanks for sharing! The syllabus seems comprehensive. Starting preparation now.',
      timestamp: '2024-12-15T14:20:00',
      likes: 8,
    },
  ],
  '2': [
    {
      id: 'c3',
      author: 'Amit Sharma',
      avatar: 'AS',
      content: 'SBI PO is always a great opportunity. All the best to everyone!',
      timestamp: '2024-12-14T09:15:00',
      likes: 15,
    },
  ],
};

// Mock users database
const mockUsers = [
  { email: 'admin@sarkaridakiya.in', password: 'admin123', name: 'Admin User', role: 'admin' as const },
  { email: 'user@example.com', password: 'user123', name: 'Regular User', role: 'user' as const },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: 'admin' | 'user' } | null>(null);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [comments, setComments] = useState<Record<string, Comment[]>>(mockComments);
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [shareModalJob, setShareModalJob] = useState<Job | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'all' | 'bookmarked' | 'trending'>('all');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('sarkariDakiyaUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }

    const savedBookmarks = localStorage.getItem('sarkariDakiyaBookmarks');
    if (savedBookmarks) {
      setBookmarkedJobs(new Set(JSON.parse(savedBookmarks)));
    }
  }, []);

  const handleLogin = (email: string, password: string, role: 'admin' | 'user') => {
    // Check credentials
    const user = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
    
    if (user) {
      const userData = { name: user.name, email: user.email, role: user.role };
      setCurrentUser(userData);
      localStorage.setItem('sarkariDakiyaUser', JSON.stringify(userData));
    } else {
      alert('Invalid credentials! Please try again.');
    }
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // In a real app, this would create a new user in the database
    const userData = { name, email, role: 'user' as const };
    setCurrentUser(userData);
    localStorage.setItem('sarkariDakiyaUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sarkariDakiyaUser');
  };

  const handleAddJob = (jobData: Omit<Job, 'id' | 'likes' | 'comments' | 'shares'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      likes: 0,
      comments: 0,
      shares: 0,
    };
    setJobs([newJob, ...jobs]);
    setShowAdminPanel(false);
    alert('Job posted successfully!');
  };

  const handleLike = (id: string) => {
    const newLikedJobs = new Set(likedJobs);
    if (newLikedJobs.has(id)) {
      newLikedJobs.delete(id);
      setJobs(jobs.map(job => job.id === id ? { ...job, likes: job.likes - 1 } : job));
    } else {
      newLikedJobs.add(id);
      setJobs(jobs.map(job => job.id === id ? { ...job, likes: job.likes + 1 } : job));
    }
    setLikedJobs(newLikedJobs);
  };

  const handleComment = (id: string) => {
    const newExpandedComments = new Set(expandedComments);
    if (newExpandedComments.has(id)) {
      newExpandedComments.delete(id);
    } else {
      newExpandedComments.add(id);
    }
    setExpandedComments(newExpandedComments);
  };

  const handleShare = (id: string) => {
    const job = jobs.find(j => j.id === id);
    if (job) {
      setShareModalJob(job);
      setJobs(jobs.map(j => j.id === id ? { ...j, shares: j.shares + 1 } : j));
    }
  };

  const handleBookmark = (id: string) => {
    const newBookmarkedJobs = new Set(bookmarkedJobs);
    if (newBookmarkedJobs.has(id)) {
      newBookmarkedJobs.delete(id);
    } else {
      newBookmarkedJobs.add(id);
    }
    setBookmarkedJobs(newBookmarkedJobs);
    localStorage.setItem('sarkariDakiyaBookmarks', JSON.stringify(Array.from(newBookmarkedJobs)));
  };

  const handleAddComment = (jobId: string, content: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      author: currentUser?.name || 'Anonymous',
      avatar: currentUser?.name?.charAt(0) || 'A',
      content,
      timestamp: new Date().toISOString(),
      likes: 0,
    };

    setComments({
      ...comments,
      [jobId]: [...(comments[jobId] || []), newComment],
    });

    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, comments: job.comments + 1 } : job
    ));
  };

  const handleLikeComment = (commentId: string) => {
    const updatedComments = { ...comments };
    Object.keys(updatedComments).forEach(jobId => {
      updatedComments[jobId] = updatedComments[jobId].map(comment =>
        comment.id === commentId ? { ...comment, likes: comment.likes + 1 } : comment
      );
    });
    setComments(updatedComments);
  };

  // Filter jobs based on search and category
  let filteredJobs = jobs.filter(job => {
    const matchesFilter = selectedFilter === 'All Jobs' || job.category === selectedFilter;
    const matchesSearch = searchQuery === '' || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Apply view filter
  if (currentView === 'bookmarked') {
    filteredJobs = filteredJobs.filter(job => bookmarkedJobs.has(job.id));
  } else if (currentView === 'trending') {
    filteredJobs = [...filteredJobs].sort((a, b) => (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares));
  }

  // Show login page if not authenticated
  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar
        onSearch={setSearchQuery}
        onFilterChange={setSelectedFilter}
        selectedFilter={selectedFilter}
        onViewChange={setCurrentView}
        currentView={currentView}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Header 
          user={currentUser}
          onLogout={handleLogout}
          onOpenAdminPanel={currentUser.role === 'admin' ? () => setShowAdminPanel(true) : undefined}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 mb-6 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🇮🇳</span>
                </div>
                <div>
                  <h2 className="text-lg mb-1">Latest Government Jobs in India</h2>
                  <p className="text-sm text-orange-100">
                    Stay updated with the latest Sarkari Naukri notifications. Apply before the deadline!
                  </p>
                </div>
              </div>
            </div>

            {/* Jobs List */}
            <div className="space-y-6">
              {filteredJobs.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-gray-500">
                    {currentView === 'bookmarked' 
                      ? 'No bookmarked jobs yet. Start bookmarking jobs to see them here!'
                      : 'No jobs found matching your criteria.'}
                  </p>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <div key={job.id}>
                    <JobCard
                      job={job}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onBookmark={handleBookmark}
                      isLiked={likedJobs.has(job.id)}
                      isBookmarked={bookmarkedJobs.has(job.id)}
                      onTitleClick={() => setSelectedJob(job)}
                    />
                    {expandedComments.has(job.id) && (
                      <div className="bg-white border-l-4 border-blue-600 shadow-md px-6 pb-6 -mt-2 rounded-b-lg">
                        <CommentSection
                          jobId={job.id}
                          comments={comments[job.id] || []}
                          onAddComment={handleAddComment}
                          onLikeComment={handleLikeComment}
                        />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer Info */}
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                💡 <strong>Pro Tip:</strong> Bookmark important jobs and turn on notifications to never miss a deadline!
              </p>
            </div>
          </div>
        </main>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareModalJob !== null}
        onClose={() => setShareModalJob(null)}
        jobTitle={shareModalJob?.title || ''}
      />

      {/* Admin Panel */}
      {showAdminPanel && (
        <AdminPanel
          onAddJob={handleAddJob}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </div>
  );
}