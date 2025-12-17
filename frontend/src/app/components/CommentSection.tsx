import { useState } from 'react';
import { Send, ThumbsUp } from 'lucide-react';

export interface Comment {
  id: string;
  author: string;
  avatar: string;
  content: string;
  timestamp: string;
  likes: number;
}

interface CommentSectionProps {
  jobId: string;
  comments: Comment[];
  onAddComment: (jobId: string, content: string) => void;
  onLikeComment: (commentId: string) => void;
}

export function CommentSection({ jobId, comments, onAddComment, onLikeComment }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(jobId, newComment);
      setNewComment('');
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const commentDate = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - commentDate.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white flex-shrink-0">
                {comment.author.charAt(0).toUpperCase()}
              </div>

              {/* Comment Content */}
              <div className="flex-1">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <p className="text-sm text-gray-900 mb-1">{comment.author}</p>
                  <p className="text-sm text-gray-700">{comment.content}</p>
                </div>
                <div className="flex items-center gap-4 mt-1 px-2">
                  <button
                    onClick={() => onLikeComment(comment.id)}
                    className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>
                  <span className="text-xs text-gray-500">{getTimeAgo(comment.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
