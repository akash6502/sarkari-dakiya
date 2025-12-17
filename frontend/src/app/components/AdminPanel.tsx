import { useState } from 'react';
import { PlusCircle, X, Save } from 'lucide-react';
import { Job } from './JobCard';

interface AdminPanelProps {
  onAddJob: (job: Omit<Job, 'id' | 'likes' | 'comments' | 'shares'>) => void;
  onClose: () => void;
}

export function AdminPanel({ onAddJob, onClose }: AdminPanelProps) {
  interface FormData {
    title: string;
    department: string;
    location: string;
    vacancies: string;
    lastDate: string;
    qualification: string;
    category: string;
    description: string;
    applyLink: string;
    notificationFile: File | null;
  }

  const [formData, setFormData] = useState<FormData>({
    title: '',
    department: '',
    location: '',
    vacancies: '',
    lastDate: '',
    qualification: '',
    category: 'Railway',
    description: '',
    applyLink: '',
    notificationFile: null,
  });

  const categories = ['Railway', 'Banking', 'SSC', 'UPSC', 'State Govt', 'Teaching'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // if a notification file is provided, create an object URL for it (note: object URLs are session-scoped)
    let notificationUrl: string | undefined;
    let notificationName: string | undefined;
    if (formData.notificationFile) {
      notificationUrl = URL.createObjectURL(formData.notificationFile);
      notificationName = formData.notificationFile.name;
    }

    const newJob = {
      ...formData,
      vacancies: parseInt(formData.vacancies),
      postedDate: new Date().toISOString().split('T')[0],
      applyLink: formData.applyLink || undefined,
      notificationUrl,
      notificationName,
    };

    onAddJob(newJob);
    
    // Reset form
    setFormData({
      title: '',
      department: '',
      location: '',
      vacancies: '',
      lastDate: '',
      qualification: '',
      category: 'Railway',
      description: '',
      applyLink: '',
      notificationFile: null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData({
      ...formData,
      [name]: value,
    } as unknown as FormData);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData({ ...formData, notificationFile: file });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl text-gray-900">Post New Job</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Junior Engineer (Civil)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Department/Organization *</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Indian Railways - Railway Recruitment Board"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Number of Vacancies *</label>
              <input
                type="number"
                name="vacancies"
                value={formData.vacancies}
                onChange={handleChange}
                placeholder="e.g., 150"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., All India, Delhi, Maharashtra"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">Last Date to Apply *</label>
              <input
                type="date"
                name="lastDate"
                value={formData.lastDate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Qualification Required *</label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g., Graduate in any discipline from a recognized university"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed job description, eligibility criteria, selection process, etc."
              rows={5}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Apply Link (optional)</label>
            <input
              type="url"
              name="applyLink"
              value={formData.applyLink}
              onChange={handleChange}
              placeholder="https://example.com/apply"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-2">Notification Document (PDF/DOC) (optional)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              name="notificationFile"
              onChange={handleFileChange}
              className="w-full"
            />
            {formData.notificationFile && (
              <p className="text-xs text-gray-500 mt-2">Selected file: {formData.notificationFile.name}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>Post Job</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
