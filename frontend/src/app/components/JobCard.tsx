import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, MapPin, Calendar, Users, Clock } from 'lucide-react';

export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  vacancies: number;
  lastDate: string;
  postedDate: string;
  qualification: string;
  category: string;
  description: string;
  likes: number;
  comments: number;
  shares: number;
  // optional fields for apply link and notification document
  applyLink?: string;
  notificationUrl?: string;
  notificationName?: string;
}

interface JobCardProps {
  job: Job;
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onBookmark: (id: string) => void;
  onTitleClick?: (id: string) => void;
  isLiked: boolean;
  isBookmarked: boolean;
}

export function JobCard({ 
  job, 
  onLike, 
  onComment, 
  onShare, 
  onBookmark,
  onTitleClick,
  isLiked, 
  isBookmarked 
}: JobCardProps) {
  const [showComments, setShowComments] = useState(false);

  const handleCommentClick = () => {
    setShowComments(!showComments);
    if (!showComments) {
      onComment(job.id);
    }
  };


  const daysAgo = Math.floor((new Date().getTime() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Category Badge */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2">
        <span className="text-white text-sm">{job.category}</span>
      </div>

      <div className="p-6">
        {/* Job Title and Department */}
        <div className="mb-4">
          <h2 
            className="text-2xl text-gray-900 mb-2 hover:text-blue-600 cursor-pointer transition-colors" 
            onClick={() => onTitleClick?.(job.id)}
          >
            {job.title}
          </h2>
          <p className="text-gray-600">{job.department}</p>
        </div>

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-gray-700">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-sm">{job.vacancies} Vacancies</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Calendar className="w-4 h-4 text-red-600" />
            <span className="text-sm">Last Date: {new Date(job.lastDate).toLocaleDateString('en-IN')}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-gray-600" />
            <span className="text-sm">Posted {daysAgo} days ago</span>
          </div>
        </div>

        {/* Qualification */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Qualification:</span> {job.qualification}
          </p>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">{job.description}</p>

        {/* Divider */}
        <div className="border-t border-gray-200 my-4"></div>

        {/* Engagement Stats */}
        <div className="flex items-center gap-6 mb-4 text-sm text-gray-600">
          <span>{job.likes} likes</span>
          <span>{job.comments} comments</span>
          <span>{job.shares} shares</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onLike(job.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition-colors ${
              isLiked
                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-600' : ''}`} />
            <span>Like</span>
          </button>
          <button
            onClick={handleCommentClick}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Comment</span>
          </button>
          <button
            onClick={() => onShare(job.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
          <button
            onClick={() => onBookmark(job.id)}
            className={`p-2 rounded-lg transition-colors ${
              isBookmarked
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-blue-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}