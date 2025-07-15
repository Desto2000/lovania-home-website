import { useState, useEffect } from 'react';

interface ContactSubmission {
  id: string;
  timestamp: string;
  contactInfo: {
    name: string;
    email: string;
    company: string;
    phone: string;
  };
  projectDetails: {
    projectType: string;
    description: string;
    timeline: string;
    budget: string;
    requirements: string;
  };
  status: 'new' | 'reviewed' | 'responded';
  notes?: string;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'reviewed' | 'responded'>('all');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/contact');
      
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id: string, status: ContactSubmission['status'], notes?: string) => {
    try {
      // In a real implementation, you'd have an update endpoint
      // For now, we'll update locally
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === id 
            ? { ...sub, status, ...(notes !== undefined && { notes }) }
            : sub
        )
      );
    } catch (err) {
      console.error('Failed to update submission:', err);
    }
  };

  const exportToCSV = () => {
    const filteredSubmissions = submissions.filter(sub => 
      filter === 'all' || sub.status === filter
    );

    const csvContent = [
      // Header
      'ID,Timestamp,Name,Email,Company,Phone,Project Type,Timeline,Budget,Status,Description,Requirements',
      // Data
      ...filteredSubmissions.map(sub => [
        sub.id,
        sub.timestamp,
        sub.contactInfo.name,
        sub.contactInfo.email,
        sub.contactInfo.company,
        sub.contactInfo.phone || '',
        sub.projectDetails.projectType,
        sub.projectDetails.timeline,
        sub.projectDetails.budget || '',
        sub.status,
        `"${sub.projectDetails.description.replace(/"/g, '""')}"`,
        `"${sub.projectDetails.requirements?.replace(/"/g, '""') || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contact-submissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredSubmissions = submissions.filter(sub => 
    filter === 'all' || sub.status === filter
  );

  const statusCounts = {
    new: submissions.filter(s => s.status === 'new').length,
    reviewed: submissions.filter(s => s.status === 'reviewed').length,
    responded: submissions.filter(s => s.status === 'responded').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-complementary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading submissions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 mb-4">Error: {error}</div>
          <button 
            onClick={fetchSubmissions}
            className="btn btn-enterprise btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">Contact Submissions Admin</h1>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <div className="bg-gray-800 px-4 py-2 rounded border border-gray-700">
                <span className="text-gray-400">New: </span>
                <span className="text-complementary font-semibold">{statusCounts.new}</span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded border border-gray-700">
                <span className="text-gray-400">Reviewed: </span>
                <span className="text-blue-400 font-semibold">{statusCounts.reviewed}</span>
              </div>
              <div className="bg-gray-800 px-4 py-2 rounded border border-gray-700">
                <span className="text-gray-400">Responded: </span>
                <span className="text-green-400 font-semibold">{statusCounts.responded}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 bg-gray-800 border border-gray-600 text-white focus:border-complementary focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="reviewed">Reviewed</option>
                <option value="responded">Responded</option>
              </select>
              <button
                onClick={exportToCSV}
                className="btn btn-enterprise btn-secondary"
              >
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-300">
              Submissions ({filteredSubmissions.length})
            </h2>
            {filteredSubmissions.length === 0 ? (
              <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center text-gray-400">
                No submissions found for the selected filter.
              </div>
            ) : (
              filteredSubmissions.map((submission) => (
                <SubmissionCard
                  key={submission.id}
                  submission={submission}
                  isSelected={selectedSubmission?.id === submission.id}
                  onSelect={setSelectedSubmission}
                  onUpdateStatus={updateSubmissionStatus}
                />
              ))
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-8">
            {selectedSubmission ? (
              <SubmissionDetail
                submission={selectedSubmission}
                onUpdateStatus={updateSubmissionStatus}
              />
            ) : (
              <div className="bg-gray-800 p-6 rounded border border-gray-700 text-center text-gray-400">
                Select a submission to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmissionCard({ 
  submission, 
  isSelected, 
  onSelect, 
  onUpdateStatus 
}: {
  submission: ContactSubmission;
  isSelected: boolean;
  onSelect: (submission: ContactSubmission) => void;
  onUpdateStatus: (id: string, status: ContactSubmission['status'], notes?: string) => void;
}) {
  const statusColors = {
    new: 'bg-complementary text-black',
    reviewed: 'bg-blue-600 text-white',
    responded: 'bg-green-600 text-white',
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={`bg-gray-800 p-4 rounded border cursor-pointer transition-colors ${
        isSelected ? 'border-complementary' : 'border-gray-700 hover:border-gray-600'
      }`}
      onClick={() => onSelect(submission)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-white">{submission.contactInfo.name}</h3>
          <p className="text-sm text-gray-400">{submission.contactInfo.company}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[submission.status]}`}>
          {submission.status}
        </span>
      </div>
      <p className="text-sm text-gray-300 mb-2">{submission.projectDetails.projectType}</p>
      <p className="text-xs text-gray-500">{formatDate(submission.timestamp)}</p>
    </div>
  );
}

function SubmissionDetail({ 
  submission, 
  onUpdateStatus 
}: {
  submission: ContactSubmission;
  onUpdateStatus: (id: string, status: ContactSubmission['status'], notes?: string) => void;
}) {
  const [notes, setNotes] = useState(submission.notes || '');

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleStatusUpdate = (status: ContactSubmission['status']) => {
    onUpdateStatus(submission.id, status, notes);
  };

  return (
    <div className="bg-gray-800 p-6 rounded border border-gray-700 space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-white mb-2">Submission Details</h2>
        <p className="text-sm text-gray-400">ID: {submission.id}</p>
        <p className="text-sm text-gray-400">{formatDate(submission.timestamp)}</p>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-semibold text-complementary mb-3">Contact Information</h3>
        <div className="space-y-2">
          <div><span className="text-gray-400">Name:</span> <span className="text-white">{submission.contactInfo.name}</span></div>
          <div><span className="text-gray-400">Email:</span> <span className="text-white">{submission.contactInfo.email}</span></div>
          <div><span className="text-gray-400">Company:</span> <span className="text-white">{submission.contactInfo.company}</span></div>
          {submission.contactInfo.phone && (
            <div><span className="text-gray-400">Phone:</span> <span className="text-white">{submission.contactInfo.phone}</span></div>
          )}
        </div>
      </div>

      {/* Project Details */}
      <div>
        <h3 className="text-lg font-semibold text-complementary mb-3">Project Details</h3>
        <div className="space-y-3">
          <div>
            <span className="text-gray-400">Type:</span>
            <p className="text-white">{submission.projectDetails.projectType}</p>
          </div>
          <div>
            <span className="text-gray-400">Timeline:</span>
            <p className="text-white">{submission.projectDetails.timeline}</p>
          </div>
          {submission.projectDetails.budget && (
            <div>
              <span className="text-gray-400">Budget:</span>
              <p className="text-white">{submission.projectDetails.budget}</p>
            </div>
          )}
          <div>
            <span className="text-gray-400">Description:</span>
            <p className="text-white bg-gray-900 p-3 rounded mt-1">{submission.projectDetails.description}</p>
          </div>
          {submission.projectDetails.requirements && (
            <div>
              <span className="text-gray-400">Requirements:</span>
              <p className="text-white bg-gray-900 p-3 rounded mt-1">{submission.projectDetails.requirements}</p>
            </div>
          )}
        </div>
      </div>

      {/* Status Management */}
      <div>
        <h3 className="text-lg font-semibold text-complementary mb-3">Status Management</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusUpdate('new')}
              className={`px-3 py-1 rounded text-sm ${
                submission.status === 'new' 
                  ? 'bg-complementary text-black' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              New
            </button>
            <button
              onClick={() => handleStatusUpdate('reviewed')}
              className={`px-3 py-1 rounded text-sm ${
                submission.status === 'reviewed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Reviewed
            </button>
            <button
              onClick={() => handleStatusUpdate('responded')}
              className={`px-3 py-1 rounded text-sm ${
                submission.status === 'responded' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Responded
            </button>
          </div>
          
          <div>
            <label className="block text-sm text-gray-400 mb-2">Notes:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 text-white focus:border-complementary focus:outline-none resize-vertical"
              rows={3}
              placeholder="Add notes about this submission..."
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-complementary mb-3">Quick Actions</h3>
        <div className="flex gap-2">
          <a
            href={`mailto:${submission.contactInfo.email}?subject=Re: Your project inquiry (${submission.id})`}
            className="btn btn-enterprise btn-secondary text-sm px-3 py-2"
          >
            Email Reply
          </a>
          <button
            onClick={() => {
              const text = `Contact: ${submission.contactInfo.name} (${submission.contactInfo.email})\nCompany: ${submission.contactInfo.company}\nProject: ${submission.projectDetails.projectType}\nDescription: ${submission.projectDetails.description}`;
              navigator.clipboard.writeText(text);
            }}
            className="btn btn-enterprise btn-secondary text-sm px-3 py-2"
          >
            Copy Details
          </button>
        </div>
      </div>
    </div>
  );
}