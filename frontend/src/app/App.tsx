import { useState, useEffect, JSX } from 'react';
import { toast } from 'sonner';
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { JobCard, Job } from './components/JobCard';
import { CommentSection, Comment } from './components/CommentSection';
import { Header } from './components/Header';
import { ShareModal } from './components/ShareModal';
import { LoginPage } from './components/LoginPage';
import { Sidebar } from './components/Sidebar';
import { AdminPanel } from './components/AdminPanel';
import { JobDetailModal } from './components/JobDetailModal';



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
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: 'admin' | 'user'; first_name?: string; last_name?: string } | null>(() => {
    try {
      const saved = localStorage.getItem('sarkariDakiyaUser');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('Failed to parse saved user', e);
      return null;
    }
  });

  // Optional auth token returned by some backends (JWT/Token). Persisted to localStorage if present.
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return localStorage.getItem('access_token') || null;
  });

  // Helper to return Authorization header when token present
  const getAuthHeaders = (): Record<string, string> => {
      return { Authorization: `Bearer ${authToken}` };
    }; 
  const [jobs, setJobs] = useState<Job[]>([]);
  const [comments, setComments] = useState<Record<string, Comment[]>>(mockComments);
  const [likedJobs, setLikedJobs] = useState<Set<string>>(new Set());
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [shareModalJob, setShareModalJob] = useState<Job | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('All Jobs');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentView, setCurrentView] = useState<'all' | 'bookmarked' | 'trending'>('all');
  // Trending jobs (server-provided) and fetch status (tracked at app scope)
  const [trendingFromApi, setTrendingFromApi] = useState<Job[] | null>(null);
  const [trendingFetchFailed, setTrendingFetchFailed] = useState(false);
  // Jobs list fetch state: loading, failed and a refresh key to refetch on demand
  const [jobsLoading, setJobsLoading] = useState(false);
  const [jobsFetchFailed, setJobsFetchFailed] = useState(false);
  const [jobsRefreshKey, setJobsRefreshKey] = useState(0);

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  // Start with sidebar collapsed; user can toggle it open via the icon
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Router helpers (available to handlers)
  const navigate = useNavigate();
  const location = useLocation();

  // Base API URL from Vite env (fallback to localhost)
  const API_URL = ((import.meta as any).env?.VITE_API_URL as string) || 'http://127.0.0.1:8000/api/';

  // Load bookmarks and sidebar preference on mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem('sarkariDakiyaBookmarks');
    if (savedBookmarks) {
      setBookmarkedJobs(new Set(JSON.parse(savedBookmarks)));
    }

    const savedSidebar = localStorage.getItem('sarkariDakiyaSidebarCollapsed');
    if (savedSidebar !== null) {
      try {
        setSidebarCollapsed(JSON.parse(savedSidebar));
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  // Persist sidebar collapsed preference
  useEffect(() => {
    localStorage.setItem('sarkariDakiyaSidebarCollapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  // Fetch trending jobs from backend when user switches to the trending view
  useEffect(() => {
    let cancelled = false;
    async function fetchTrending() {
      if (currentView !== 'trending') return;
      setTrendingFetchFailed(false);
      setTrendingFromApi(null);
      try {
        const res = await fetch(`${API_URL}trending/`, {
          method: 'GET',
          credentials: 'include',
          headers: { ...getAuthHeaders() },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        // Normalize response to an array. API might return array or wrapper objects like { results: [] }, { data: [] }, { jobs: [] }, or other shapes.
        let items: any[] = [];
        if (Array.isArray(data)) {
          items = data;
        } else if (data && typeof data === 'object') {
          if (Array.isArray((data as any).results)) items = (data as any).results;
          else if (Array.isArray((data as any).data)) items = (data as any).data;
          else if (Array.isArray((data as any).jobs)) items = (data as any).jobs;
          else {
            // Fallback: first array-valued property
            const found = Object.values(data).find(v => Array.isArray(v));
            if (Array.isArray(found)) items = found as any[];
          }
        } else {
          console.warn('Unexpected trending API response:', data);
        }

        if (!Array.isArray(items)) items = [];

        const mapped: Job[] = items.map((j: any) => {
          const rawCategory = j.category ?? j.type ?? 'Other';
          return {
            id: String(j.id ?? j.pk ?? Date.now()),
            title: j.title ?? j.job_title ?? 'Untitled',
            department: j.department ?? j.organization ?? '',
            location: j.location ?? j.city ?? '',
            vacancies: j.vacancies ?? j.vacancies_count ?? 0,
            lastDate: j.lastDate ?? j.last_date ?? '',
            postedDate: j.postedDate ?? j.posted_date ?? j.posted_at ?? '',
            qualification: j.qualification ?? '',
            category: String(rawCategory),
            description: j.description ?? '',
            likes: j.likes ?? j.likes_count ?? j.likesCount ?? 0,
            comments: j.comments ?? j.comments_count ?? 0,
            shares: j.shares ?? j.shares_count ?? 0,
          } as Job;
        });
        if (!cancelled) {
          setTrendingFromApi(mapped);
          setTrendingFetchFailed(false);
        }
      } catch (e) {
        console.warn('Trending API failed', e);
        if (!cancelled) {
          setTrendingFromApi([]);
          setTrendingFetchFailed(true);
        }
        toast.error('Failed to load trending jobs.');
      }
    }

    fetchTrending();
    return () => { cancelled = true; };
  }, [currentView]);

  // Fetch jobs list from backend on mount and on retry (jobsRefreshKey)
  useEffect(() => {
    let cancelled = false;
    async function fetchJobs() {
      setJobsLoading(true);
      setJobsFetchFailed(false);
      try {
        const res = await fetch(`${API_URL}jobs/`, {
          method: 'GET',
          credentials: 'include',
          headers: { ...getAuthHeaders() },
        });
        console.log(res)
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();

        // normalize to array (support array or { results: [] } etc.)
        let items: any[] = [];
        if (Array.isArray(data)) items = data;
        else if (data && typeof data === 'object') {
          if (Array.isArray((data as any).results)) items = (data as any).results;
          else if (Array.isArray((data as any).data)) items = (data as any).data;
          else if (Array.isArray((data as any).jobs)) items = (data as any).jobs;
          else {
            const found = Object.values(data).find(v => Array.isArray(v));
            if (Array.isArray(found)) items = found as any[];
          }
        }

        const mapped: Job[] = items.map((j: any) => ({
          id: String(j.id ?? j.pk ?? Date.now()),
          title: j.title ?? j.job_title ?? 'Untitled',
          department: j.department ?? j.organization ?? '',
          location: j.location ?? j.city ?? '',
          vacancies: j.vacancies ?? j.vacancies_count ?? 0,
          lastDate: j.lastDate ?? j.last_date ?? '',
          postedDate: j.postedDate ?? j.posted_date ?? j.posted_at ?? '',
          qualification: j.qualification ?? '',
          category: String(j.category ?? j.type ?? 'Other'),
          description: j.description ?? '',
          likes: j.likes ?? j.likes_count ?? j.likesCount ?? 0,
          comments: j.comments ?? j.comments_count ?? 0,
          shares: j.shares ?? j.shares_count ?? 0,
        }));

        const bookmarkedIds = items
          .filter((j: any) => j.is_bookmarked === true)
          .map((j: any) => String(j.id ?? j.pk));

        if (!cancelled) {
          setJobs(mapped);
          if (bookmarkedIds.length > 0) {
            setBookmarkedJobs(prev => new Set([...prev, ...bookmarkedIds]));
          }
          setJobsLoading(false);
        }
      } catch (err) {
        console.warn('Jobs API failed', err);
        if (!cancelled) {
          setJobsFetchFailed(true);
          setJobsLoading(false);
          toast.error('Login Again Please.');
          navigate('/login');
        }
      }
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_URL}profile/`, {
          method: 'GET',
          credentials: 'include',
          headers: { ...getAuthHeaders() },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        
        if (!cancelled) {
          const profileData = data.data ?? data;
          const first_name = profileData.first_name ?? profileData.firstName ?? undefined;
          const last_name = profileData.last_name ?? profileData.lastName ?? undefined;
          const nameFromParts = [first_name, last_name].filter(Boolean).join(' ').trim();
          const displayName = profileData.name || nameFromParts || profileData.email || '';
          const role = profileData.is_staff === true ? 'admin' : 'user';
          
          const userData = {
            name: displayName,
            email: profileData.email ?? '',
            role: role as 'admin' | 'user',
            first_name,
            last_name,
          };
          setCurrentUser(userData);
          localStorage.setItem('sarkariDakiyaUser', JSON.stringify(userData));
        }
      } catch (err) {
        console.warn('Profile API failed', err);
      }
    }

    if (authToken) {
      fetchJobs();
      fetchProfile();
    }
    return () => { cancelled = true; };
  }, [jobsRefreshKey, authToken]);

  const handleLogin = async (email: string, password: string, role: 'admin' | 'user') => {
    // Try logging in via backend API (send `email` field as the user's identifier)
    try {
      const res = await fetch(`${API_URL}login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, role }),
      });

      
      if (res.ok) {
        const data = await res.json();
        
        console.log('Login response status:', data);
        // If backend returned a token (JWT or similar), persist it for Authorization header usage
        const access_token = data?.data?.access ?? null;
        const refresh_token = data?.data?.refresh ?? null;
        console.log('Login response data:', access_token);
        if (access_token && refresh_token) {
          setAuthToken(access_token);
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);
        }

        // Derive first_name/last_name from response if present, otherwise split `name` if available
        let first_name = data.first_name ?? data.firstName ?? undefined;
        let last_name = data.last_name ?? data.lastName ?? undefined;
        if ((!first_name || !last_name) && data.name) {
          const parts = (data.name || '').trim().split(/\s+/);
          if (parts.length > 0) {
            first_name = parts.shift();
            last_name = parts.length ? parts.join(' ') : '';
          }
        }

        // Prefer supplied name from backend, otherwise concatenate first and last name, otherwise fall back to email
        const nameFromParts = [first_name, last_name].filter(Boolean).join(' ').trim();
        const displayName = (data.name && String(data.name).trim()) || nameFromParts || email;
        const userData = {
          name: displayName,
          email: (data.email ?? email),
          role: (data.role ?? role) as 'admin' | 'user',
          first_name,
          last_name,
        };
        setCurrentUser(userData);
        localStorage.setItem('sarkariDakiyaUser', JSON.stringify(userData));
        return true;
      } else {
        const errText = await res.text();
        toast.error('Login failed: ' + (errText || res.statusText));
        return false;
      }
    } catch (e) {
      console.warn('Login API unreachable, falling back to local mock users', e);
      // Fallback to local mock users for demo/offline mode
      const user = mockUsers.find(u => u.email === email && u.password === password && u.role === role);
      if (user) {
        const userData = { name: user.name, email: user.email, role: user.role };
        setCurrentUser(userData);
        localStorage.setItem('sarkariDakiyaUser', JSON.stringify(userData));
        return true;
      }
      toast.error('Invalid credentials! Please try again.');
      return false;
    }
  }; 

  const handleSignup = async (name: string, email: string, password: string) => {
    // Try registering with backend API
    try {
      const parts = (name || '').trim().split(/\s+/);
      const first_name = parts.shift() ?? '';
      const last_name = parts.length ? parts.join(' ') : '';

      const res = await fetch(`${API_URL}register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: email, email, password, first_name, last_name }),
      });

      if (!res.ok) {
        const errText = await res.text();
        toast.error('Signup failed: ' + (errText || res.statusText));
        return false;
      }

      const data = await res.json();

      // Persist token if backend provided it during signup
      const token = data?.token ?? data?.access ?? data?.access_token ?? data?.auth_token ?? null;
      if (token) {
        setAuthToken(token);
        localStorage.setItem('access_token', token);
      }
      const nameFromParts = [first_name, last_name].filter(Boolean).join(' ').trim();
      const displayName = (data.name && String(data.name).trim()) || name || nameFromParts;
      const userData = { name: displayName, email: (data.email ?? email), role: (data.role ?? 'user') as 'admin' | 'user', first_name, last_name };
      setCurrentUser(userData);
      localStorage.setItem('sarkariDakiyaUser', JSON.stringify(userData));
      return true;
    } catch (e) {
      console.error('Signup error', e);
      toast.error('Signup failed. Please try again.');
      return false;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('sarkariDakiyaUser');
    // Clear persisted auth token
    setAuthToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
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
    toast.success('Job posted successfully!');
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

  const handleBookmark = async (id: string) => {
    // Optimistically update local state
    const prev = new Set(bookmarkedJobs);
    const next = new Set(prev);
    const willAdd = !prev.has(id);
    if (willAdd) next.add(id); else next.delete(id);
    setBookmarkedJobs(next);
    localStorage.setItem('sarkariDakiyaBookmarks', JSON.stringify(Array.from(next)));

    // Call backend to persist bookmark; POST to add, DELETE to remove
    try {
      const res = await fetch(`${API_URL}jobs/${id}/bookmark/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        credentials: 'include',
      });

      if (!res.ok) {
        // handle auth errors specially: revert and redirect to login
        setBookmarkedJobs(prev);
        localStorage.setItem('sarkariDakiyaBookmarks', JSON.stringify(Array.from(prev)));
        if (res.status === 401 || res.status === 403) {
          // navigate to login preserving current path as `next`
          const next = encodeURIComponent(location.pathname + location.search);
          navigate(`/login?next=${next}`);
          return;
        }
        const errText = await res.text();
        toast.error('Bookmark failed: ' + (errText || res.statusText));
        return;
      }

      toast.success(willAdd ? 'Job bookmarked' : 'Bookmark removed');
    } catch (e) {
      console.warn('Bookmark API failed', e);
      toast.error('Failed to update bookmark on server.');
      // revert optimistic update
      setBookmarkedJobs(prev);
      localStorage.setItem('sarkariDakiyaBookmarks', JSON.stringify(Array.from(prev)));
    }
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

  // Determine which jobs to show: prefer backend trending results when viewing trending
  const jobsToShow: Job[] = currentView === 'trending' ? (trendingFromApi ?? filteredJobs) : filteredJobs;

  // Routing: replace simple auth-based render with Route handling

  // Only require admin to be logged in for admin routes
  function RequireAdmin({ children }: { children: JSX.Element }) {
    if (!currentUser || currentUser.role !== 'admin') {
      return <Navigate to="/login" replace />;
    }
    return children;
  }

  // Require authentication for dashboard and related routes
  function RequireAuth({ children }: { children: JSX.Element }) {
    const location = useLocation();
    if (!currentUser) {
      const next = encodeURIComponent(location.pathname + location.search);
      return <Navigate to={`/login?next=${next}`} replace />;
    }
    return children;
  }

  // Dashboard content (re-uses state/handlers from App scope)
  function DashboardContent({ initialView }: { initialView?: 'all' | 'bookmarked' | 'trending' }) {
    const params = useParams();

    // Apply initial view when route changes
    useEffect(() => {
      if (initialView) setCurrentView(initialView);
    }, [initialView]);

    // If route has a job id, open the job modal
    useEffect(() => {
      if (params?.id) {
        const job = jobs.find(j => j.id === params.id);
        if (job) setSelectedJob(job);
      }
    }, [params?.id]);

    // Trending fetch handled at app scope

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
            onLogout={handleLogoutWithNav}
            onOpenAdminPanel={currentUser?.role === 'admin' ? () => setShowAdminPanel(true) : undefined}
            onAdminSignIn={handleAdminSignIn}
          />

          <main className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-6 py-6">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 mb-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">📬</span>
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
              {currentView === 'trending' && (
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${trendingFromApi === null ? 'bg-gray-200 text-gray-700' : trendingFetchFailed ? 'bg-yellow-100 text-yellow-800' : trendingFromApi.length === 0 ? 'bg-gray-100 text-gray-700' : 'bg-green-100 text-green-800'}`}
                  >
                    {trendingFromApi === null ? 'Trending (Loading...)' : trendingFetchFailed ? 'Trending (Local fallback)' : trendingFromApi.length === 0 ? 'Trending (Server — no items)' : 'Trending (Server)'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {trendingFromApi === null ? 'Fetching from server…' : trendingFetchFailed ? 'Showing local trending due to an error' : 'Showing server-provided trending'}
                  </span>
                </div>
              )}
              <div className="space-y-6">
                {currentView === 'trending' && trendingFromApi === null ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500">Loading trending jobs…</p>
                  </div>
                ) : (jobsLoading && jobs.length === 0) ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500">Loading jobs…</p>
                  </div>
                ) : jobsToShow.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <p className="text-gray-500">
                      {jobsFetchFailed ? (
                        <>
                          <div>Failed to load jobs from server. Showing local samples.</div>
                          <div className="mt-4">
                            <button
                              onClick={() => setJobsRefreshKey(k => k + 1)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md"
                            >Retry</button>
                          </div>
                        </>
                      ) : (currentView === 'bookmarked' 
                        ? 'No bookmarked jobs yet. Start bookmarking jobs to see them here!'
                        : 'No jobs found matching your criteria.')}
                    </p>
                  </div>
                ) : (
                  jobsToShow.map(job => (
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

        {/* Job Detail Modal */}
        {selectedJob && (
          <JobDetailModal
            job={selectedJob}
            isOpen={!!selectedJob}
            onClose={() => setSelectedJob(null)}
          />
        )}

        {/* Admin Panel */}
        {showAdminPanel && (
          <AdminPanel
            onAddJob={handleAddJob}
            onClose={() => setShowAdminPanel(false)}
          />
        )}
      </div>
    );
  }

  // update handlers to redirect
  const originalHandleLogin = handleLogin;
  const originalHandleLogout = handleLogout;
  const handleLoginWithNav = async (email: string, password: string, role: 'admin' | 'user') => {
    // Return whether login was successful; the LoginPage will handle navigation to `next` if provided.
    const success = await originalHandleLogin(email, password, role);
    return success;
  };

  const handleLogoutWithNav = async () => {
    // Attempt to inform backend about logout; include username (email) if available
    const username = currentUser?.email;
    const refresh = localStorage.getItem('refresh_token');
    try {
      await fetch(`${API_URL}logout/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ refresh:refresh }),
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout API call failed:', e);
    }

    // Clear auth and UI state on logout
    originalHandleLogout();
    setShowAdminPanel(false);
    setShareModalJob(null);
    setSelectedJob(null);
    setLikedJobs(new Set());
    setBookmarkedJobs(new Set());
    setExpandedComments(new Set());
    setSearchQuery('');
    setSelectedFilter('All Jobs');

    // Redirect to login page
    navigate('/login');
  };

  const handleAdminSignIn = async () => {
    await handleLogoutWithNav();
    navigate('/login?as=admin');
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onLogin={handleLoginWithNav} onSignup={handleSignup} />} />
      <Route path="/" element={<RequireAuth><DashboardContent /></RequireAuth>} />

      <Route path="/dashboard" element={<RequireAuth><DashboardContent /></RequireAuth>} />
      <Route path="/bookmarks" element={<RequireAuth><DashboardContent initialView="bookmarked" /></RequireAuth>} />
      <Route path="/trending" element={<DashboardContent initialView="trending" />} />
      <Route path="/jobs/:id" element={<RequireAuth><DashboardContent /></RequireAuth>} />
      <Route path="/admin" element={<RequireAdmin>{currentUser?.role === 'admin' ? <AdminPanel onAddJob={handleAddJob} onClose={() => setShowAdminPanel(false)} /> : <Navigate to="/" replace />}</RequireAdmin>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
