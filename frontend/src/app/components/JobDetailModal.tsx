import { X, MapPin, Calendar, Users, GraduationCap, Building2, ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { Job } from './JobCard';

interface JobDetailModalProps {
  job: Job | null;
  isOpen: boolean;
  onClose: () => void;
}

export function JobDetailModal({ job, isOpen, onClose }: JobDetailModalProps) {
  if (!isOpen || !job) return null;

  const prevOverflow = useRef<string | null>(null);

  useEffect(() => {
    // lock body scroll while modal is open
    prevOverflow.current = document.body.style.overflow ?? '';
    document.body.style.overflow = 'hidden';

    return () => {
      // restore previous overflow on unmount
      document.body.style.overflow = prevOverflow.current ?? '';
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-700 to-blue-800 text-white px-6 py-5 flex items-start justify-between rounded-t-xl">
          <div className="flex-1 pr-4">
            <div className="inline-block bg-blue-600 px-3 py-1 rounded-full text-xs mb-3">
              {job.category}
            </div>
            <h2 className="text-2xl mb-2">{job.title}</h2>
            <div className="flex items-center gap-2 text-blue-100">
              <Building2 className="w-4 h-4" />
              <p className="text-sm">{job.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-600 rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Key Information Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <Users className="w-4 h-4" />
                <span className="text-xs">Vacancies</span>
              </div>
              <p className="text-2xl text-blue-900">{job.vacancies}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-xs">Location</span>
              </div>
              <p className="text-sm text-green-900">{job.location}</p>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-orange-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Last Date</span>
              </div>
              <p className="text-sm text-orange-900">{formatDate(job.lastDate)}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-xs">Posted On</span>
              </div>
              <p className="text-sm text-purple-900">{formatDate(job.postedDate)}</p>
            </div>
          </div>

          {/* Qualification */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="text-lg text-gray-900">Qualification Required</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{job.qualification}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg text-gray-900 mb-3">Job Description</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>
          </div>

          {/* Important Information Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <h4 className="text-sm text-yellow-900 mb-2">⚠️ Important Information</h4>
            <ul className="text-xs text-yellow-800 space-y-1">
              <li>• Please read the official notification carefully before applying</li>
              <li>• Ensure you meet all eligibility criteria</li>
              <li>• Keep all necessary documents ready before starting the application</li>
              <li>• Apply before the last date: <strong>{formatDate(job.lastDate)}</strong></li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {job.applyLink ? (
              <a
                href={job.applyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                <span>Apply Now</span>
              </a>
            ) : (
              <button className="flex-1 bg-blue-200 text-white py-3 rounded-lg cursor-not-allowed opacity-60 flex items-center justify-center gap-2">
                <ExternalLink className="w-5 h-5" />
                <span>No Apply Link</span>
              </button>
            )}

            {job.notificationUrl ? (
              <a
                href={job.notificationUrl}
                download={job.notificationName}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
              >
                Download Notification
              </a>
            ) : (
              <button className="flex-1 bg-gray-100 text-gray-400 py-3 rounded-lg cursor-not-allowed opacity-60">
                No Notification
              </button>
            )}
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              This information is provided for reference only. Please visit the official website for complete details and updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
