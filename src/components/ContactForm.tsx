import { useState } from 'react';

interface ContactInfo {
  name: string;
  email: string;
  company: string;
  phone: string;
}

interface ProjectDetails {
  projectType: string;
  description: string;
  timeline: string;
  budget: string;
  requirements: string;
}

interface FormData {
  contactInfo: ContactInfo;
  projectDetails: ProjectDetails;
}

type Step = 'contact' | 'project' | 'review';

export default function ContactForm() {
  const [currentStep, setCurrentStep] = useState<Step>('contact');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    contactInfo: {
      name: '',
      email: '',
      company: '',
      phone: ''
    },
    projectDetails: {
      projectType: '',
      description: '',
      timeline: '',
      budget: '',
      requirements: ''
    }
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateContactInfo = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.contactInfo.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.contactInfo.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactInfo.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.contactInfo.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateProjectDetails = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.projectDetails.projectType) {
      newErrors.projectType = 'Please select a project type';
    }
    
    if (!formData.projectDetails.description.trim()) {
      newErrors.description = 'Project description is required';
    }
    
    if (!formData.projectDetails.timeline) {
      newErrors.timeline = 'Please select a timeline';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value
      }
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleProjectDetailsChange = (field: keyof ProjectDetails, value: string) => {
    setFormData(prev => ({
      ...prev,
      projectDetails: {
        ...prev.projectDetails,
        [field]: value
      }
    }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    if (currentStep === 'contact' && validateContactInfo()) {
      setCurrentStep('project');
    } else if (currentStep === 'project' && validateProjectDetails()) {
      setCurrentStep('review');
    }
  };

  const handleBack = () => {
    if (currentStep === 'project') {
      setCurrentStep('contact');
    } else if (currentStep === 'review') {
      setCurrentStep('project');
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'Failed to submit form. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-complementary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">Thank You!</h2>
        <p className="text-lg text-gray-300 mb-6">
          Your project inquiry has been submitted successfully. Our team will review your requirements and get back to you within 24 hours.
        </p>
        <button 
          onClick={() => {
            setIsSubmitted(false);
            setCurrentStep('contact');
            setFormData({
              contactInfo: { name: '', email: '', company: '', phone: '' },
              projectDetails: { projectType: '', description: '', timeline: '', budget: '', requirements: '' }
            });
          }}
          className="btn btn-enterprise btn-primary"
        >
          Submit Another Request
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-8">
          <div className={`flex items-center ${currentStep === 'contact' ? 'text-complementary' : currentStep === 'project' || currentStep === 'review' ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${currentStep === 'contact' ? 'border-complementary bg-complementary text-black' : 'border-gray-400'}`}>
              1
            </div>
            <span className="font-medium">Contact Information</span>
          </div>
          
          <div className={`w-16 h-0.5 ${currentStep === 'project' || currentStep === 'review' ? 'bg-complementary' : 'bg-gray-600'}`}></div>
          
          <div className={`flex items-center ${currentStep === 'project' ? 'text-complementary' : currentStep === 'review' ? 'text-gray-400' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${currentStep === 'project' ? 'border-complementary bg-complementary text-black' : currentStep === 'review' ? 'border-gray-400' : 'border-gray-600'}`}>
              2
            </div>
            <span className="font-medium">Project Details</span>
          </div>
          
          <div className={`w-16 h-0.5 ${currentStep === 'review' ? 'bg-complementary' : 'bg-gray-600'}`}></div>
          
          <div className={`flex items-center ${currentStep === 'review' ? 'text-complementary' : 'text-gray-600'}`}>
            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center mr-3 ${currentStep === 'review' ? 'border-complementary bg-complementary text-black' : 'border-gray-600'}`}>
              3
            </div>
            <span className="font-medium">Review & Submit</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gray-900/20 border border-gray-700 p-8">
        {currentStep === 'contact' && (
          <ContactInfoStep 
            data={formData.contactInfo} 
            onChange={handleContactInfoChange}
            errors={errors}
          />
        )}
        
        {currentStep === 'project' && (
          <ProjectDetailsStep 
            data={formData.projectDetails} 
            onChange={handleProjectDetailsChange}
            errors={errors}
          />
        )}
        
        {currentStep === 'review' && (
          <ReviewStep 
            contactInfo={formData.contactInfo}
            projectDetails={formData.projectDetails}
          />
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button 
            onClick={handleBack}
            disabled={currentStep === 'contact'}
            className={`btn btn-enterprise btn-secondary ${currentStep === 'contact' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span>Back</span>
          </button>
          
          {currentStep !== 'review' ? (
            <button 
              onClick={handleNext}
              className="btn btn-enterprise btn-primary"
            >
              <span>Continue</span>
              <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M5 12h14M12 5l7 7-7 7"></path>
              </svg>
            </button>
          ) : (
            <button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="btn btn-enterprise btn-primary"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Request</span>
                  <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        {errors.submit && (
          <div className="mt-4 p-4 bg-red-900/20 border border-red-500 text-red-300">
            {errors.submit}
          </div>
        )}
      </div>
    </div>
  );
}

// Contact Information Step Component
function ContactInfoStep({ 
  data, 
  onChange, 
  errors 
}: { 
  data: ContactInfo; 
  onChange: (field: keyof ContactInfo, value: string) => void;
  errors: Record<string, string>;
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Contact Information</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => onChange('name', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border ${errors.name ? 'border-red-500' : 'border-gray-600'} text-white focus:border-complementary focus:outline-none transition-colors`}
            placeholder="Enter your full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => onChange('email', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border ${errors.email ? 'border-red-500' : 'border-gray-600'} text-white focus:border-complementary focus:outline-none transition-colors`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={data.company}
            onChange={(e) => onChange('company', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border ${errors.company ? 'border-red-500' : 'border-gray-600'} text-white focus:border-complementary focus:outline-none transition-colors`}
            placeholder="Enter your company name"
          />
          {errors.company && <p className="mt-1 text-sm text-red-400">{errors.company}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white focus:border-complementary focus:outline-none transition-colors"
            placeholder="Enter your phone number"
          />
        </div>
      </div>
    </div>
  );
}

// Project Details Step Component
function ProjectDetailsStep({ 
  data, 
  onChange, 
  errors 
}: { 
  data: ProjectDetails; 
  onChange: (field: keyof ProjectDetails, value: string) => void;
  errors: Record<string, string>;
}) {
  const projectTypes = [
    'System Architecture',
    'Data Infrastructure',
    'Machine Learning Operations',
    'Performance Analysis',
    'Cloud Migration',
    'Security Assessment',
    'Custom Solution'
  ];

  const timelines = [
    '1-2 months',
    '3-6 months',
    '6-12 months',
    '12+ months',
    'Ongoing engagement'
  ];

  const budgetRanges = [
    'Under $50k',
    '$50k - $100k',
    '$100k - $250k',
    '$250k - $500k',
    '$500k+',
    'Discuss with team'
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Project Details</h2>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Type *
          </label>
          <select
            value={data.projectType}
            onChange={(e) => onChange('projectType', e.target.value)}
            className={`w-full px-4 py-3 bg-gray-800 border ${errors.projectType ? 'border-red-500' : 'border-gray-600'} text-white focus:border-complementary focus:outline-none transition-colors`}
          >
            <option value="">Select project type</option>
            {projectTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          {errors.projectType && <p className="mt-1 text-sm text-red-400">{errors.projectType}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Description *
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange('description', e.target.value)}
            rows={4}
            className={`w-full px-4 py-3 bg-gray-800 border ${errors.description ? 'border-red-500' : 'border-gray-600'} text-white focus:border-complementary focus:outline-none transition-colors resize-vertical`}
            placeholder="Describe your project requirements, challenges, and objectives..."
          />
          {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timeline *
            </label>
            <select
              value={data.timeline}
              onChange={(e) => onChange('timeline', e.target.value)}
              className={`w-full px-4 py-3 bg-gray-800 border ${errors.timeline ? 'border-red-500' : 'border-gray-600'} text-white focus:border-complementary focus:outline-none transition-colors`}
            >
              <option value="">Select timeline</option>
              {timelines.map(timeline => (
                <option key={timeline} value={timeline}>{timeline}</option>
              ))}
            </select>
            {errors.timeline && <p className="mt-1 text-sm text-red-400">{errors.timeline}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Budget Range
            </label>
            <select
              value={data.budget}
              onChange={(e) => onChange('budget', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white focus:border-complementary focus:outline-none transition-colors"
            >
              <option value="">Select budget range</option>
              {budgetRanges.map(budget => (
                <option key={budget} value={budget}>{budget}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Specific Requirements
          </label>
          <textarea
            value={data.requirements}
            onChange={(e) => onChange('requirements', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 text-white focus:border-complementary focus:outline-none transition-colors resize-vertical"
            placeholder="Any specific technologies, compliance requirements, or constraints we should know about..."
          />
        </div>
      </div>
    </div>
  );
}

// Review Step Component
function ReviewStep({ 
  contactInfo, 
  projectDetails 
}: { 
  contactInfo: ContactInfo; 
  projectDetails: ProjectDetails; 
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-6">Review Your Request</h2>
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-semibold text-complementary mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400">Name:</span>
              <p className="text-white">{contactInfo.name}</p>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <p className="text-white">{contactInfo.email}</p>
            </div>
            <div>
              <span className="text-gray-400">Company:</span>
              <p className="text-white">{contactInfo.company}</p>
            </div>
            {contactInfo.phone && (
              <div>
                <span className="text-gray-400">Phone:</span>
                <p className="text-white">{contactInfo.phone}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-complementary mb-4">Project Details</h3>
          <div className="space-y-4">
            <div>
              <span className="text-gray-400">Project Type:</span>
              <p className="text-white">{projectDetails.projectType}</p>
            </div>
            <div>
              <span className="text-gray-400">Description:</span>
              <p className="text-white">{projectDetails.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Timeline:</span>
                <p className="text-white">{projectDetails.timeline}</p>
              </div>
              {projectDetails.budget && (
                <div>
                  <span className="text-gray-400">Budget Range:</span>
                  <p className="text-white">{projectDetails.budget}</p>
                </div>
              )}
            </div>
            {projectDetails.requirements && (
              <div>
                <span className="text-gray-400">Specific Requirements:</span>
                <p className="text-white">{projectDetails.requirements}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}