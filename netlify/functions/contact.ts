import type { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';

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

// Email notification function
async function sendEmailNotification(submission: ContactSubmission) {
  try {
    // In a production environment, you would integrate with a service like:
    // - Netlify Forms
    // - SendGrid
    // - AWS SES
    // - Resend
    // For now, we'll log the email that would be sent
    
    const emailData = {
      to: process.env.NOTIFICATION_EMAIL || 'contact@lovania.com',
      subject: `New Project Inquiry from ${submission.contactInfo.company}`,
      html: `
        <h2>New Project Inquiry</h2>
        <h3>Contact Information</h3>
        <ul>
          <li><strong>Name:</strong> ${submission.contactInfo.name}</li>
          <li><strong>Email:</strong> ${submission.contactInfo.email}</li>
          <li><strong>Company:</strong> ${submission.contactInfo.company}</li>
          <li><strong>Phone:</strong> ${submission.contactInfo.phone}</li>
        </ul>
        
        <h3>Project Details</h3>
        <ul>
          <li><strong>Project Type:</strong> ${submission.projectDetails.projectType}</li>
          <li><strong>Timeline:</strong> ${submission.projectDetails.timeline}</li>
          <li><strong>Budget:</strong> ${submission.projectDetails.budget}</li>
        </ul>
        
        <h3>Description</h3>
        <p>${submission.projectDetails.description}</p>
        
        ${submission.projectDetails.requirements ? `
          <h3>Specific Requirements</h3>
          <p>${submission.projectDetails.requirements}</p>
        ` : ''}
        
        <p><strong>Submission ID:</strong> ${submission.id}</p>
        <p><strong>Timestamp:</strong> ${submission.timestamp}</p>
      `
    };

    console.log('Email notification would be sent:', emailData);
    
    // TODO: Replace with actual email service integration
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send(emailData);
    
    return true;
  } catch (error) {
    console.error('Failed to send email notification:', error);
    return false;
  }
}

export const handler: Handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod === 'GET') {
    // Admin endpoint to list submissions
    try {
      const store = getStore('contact-submissions');
      const { blobs } = await store.list();
      
      const submissions = await Promise.all(
        blobs.map(async (blob) => {
          const data = await store.get(blob.key, { type: 'json' });
          return data;
        })
      );

      // Sort by timestamp, newest first
      submissions.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissions),
      };
    } catch (error) {
      console.error('Error fetching submissions:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to fetch submissions' }),
      };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body || '{}');
      
      // Validate required fields
      const { contactInfo, projectDetails } = body;
      
      if (!contactInfo?.name || !contactInfo?.email || !contactInfo?.company) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required contact information' }),
        };
      }

      if (!projectDetails?.projectType || !projectDetails?.description || !projectDetails?.timeline) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing required project details' }),
        };
      }

      // Create submission object
      const submission: ContactSubmission = {
        id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        contactInfo,
        projectDetails,
        status: 'new',
      };

      // Store in Netlify Blobs
      const store = getStore('contact-submissions');
      await store.set(submission.id, JSON.stringify(submission));

      // Send email notification
      await sendEmailNotification(submission);

      return {
        statusCode: 200,
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: true,
          id: submission.id,
          message: 'Submission received successfully',
        }),
      };
    } catch (error) {
      console.error('Error processing submission:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to process submission' }),
      };
    }
  }

  // Method not allowed
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' }),
  };
};