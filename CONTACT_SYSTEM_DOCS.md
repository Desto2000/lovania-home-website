# Lovania Contact System Documentation

## Overview

This is a complete contact/order page system built for the Lovania website, featuring a multi-step form with professional dark styling and a comprehensive backend solution.

## Features

### Frontend
- **Multi-step contact form** with progressive sections:
  1. Contact Information (name, email, company, phone)
  2. Project Details (type, description, timeline, budget, requirements)
  3. Review & Submit
- **Professional styling** matching IBM Cloud design patterns
- **Form validation** with real-time error handling
- **Loading states** and smooth animations
- **Responsive design** for all device sizes
- **Enterprise-grade UX** with clear progress indicators

### Backend
- **Netlify Functions API** endpoint for form handling
- **Netlify Blob Store** for data storage (easy to manage, no external DB required)
- **Email notifications** (configurable with multiple providers)
- **Admin dashboard** for managing submissions
- **CSV export** functionality
- **Status tracking** (new, reviewed, responded)
- **Simple configuration** via environment variables

### Management Features
- **View all submissions** in a clean admin interface
- **Filter by status** and search functionality
- **Export to CSV** for external processing
- **Mark submissions** as processed/responded
- **Quick email actions** with pre-filled templates
- **Internal notes** for tracking follow-ups

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Contact Form  │────│ Netlify Function│────│ Netlify Blobs   │
│   (Astro/HTML)  │    │   (/api/contact)│    │   (Storage)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Email Service   │
                       │ (SendGrid/SES)  │
                       └─────────────────┘
```

## Installation & Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Essential configuration:
```env
# Email notifications
NOTIFICATION_EMAIL=contact@lovania.com

# Admin access
ADMIN_SECRET=your_secure_admin_secret

# Email service (choose one)
SENDGRID_API_KEY=your_sendgrid_key
# OR
RESEND_API_KEY=your_resend_key
# OR AWS SES credentials
```

### 2. Email Service Setup

Choose and configure one email provider:

#### Option A: SendGrid
1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key with email sending permissions
3. Add to `.env`: `SENDGRID_API_KEY=your_key`

#### Option B: Resend
1. Sign up at [Resend](https://resend.com)
2. Create an API key
3. Add to `.env`: `RESEND_API_KEY=your_key`

#### Option C: AWS SES
1. Set up AWS SES in your AWS account
2. Add credentials to `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_REGION=us-east-1
   ```

### 3. Deployment

Deploy to Netlify:
1. Connect your GitHub repository to Netlify
2. Set environment variables in Netlify dashboard
3. Deploy - Netlify Functions and Blobs will be automatically configured

## Usage

### Accessing the Contact Form
- Visit `/contact` on your website
- Progressive 3-step form guides users through submission
- Real-time validation ensures data quality

### Admin Dashboard
- Access admin dashboard at `/admin?secret=your_admin_secret`
- View all submissions with filtering and search
- Export data to CSV for external processing
- Quick actions for emailing and status updates

### API Endpoints

#### POST /api/contact
Submit a new contact form:
```json
{
  "contactInfo": {
    "name": "John Smith",
    "email": "john@example.com",
    "company": "TechCorp",
    "phone": "+1-555-0123"
  },
  "projectDetails": {
    "projectType": "System Architecture",
    "description": "Need help with scalable infrastructure",
    "timeline": "3-6 months",
    "budget": "$100k - $250k",
    "requirements": "AWS, Kubernetes, high availability"
  }
}
```

#### GET /api/contact
Retrieve all submissions (admin only):
```json
[
  {
    "id": "sub_1234567890_abc123",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "contactInfo": {...},
    "projectDetails": {...},
    "status": "new",
    "notes": ""
  }
]
```

## File Structure

```
src/
├── pages/
│   ├── contact.astro          # Main contact form page
│   └── admin.astro            # Admin dashboard
├── components/
│   ├── ContactForm.tsx        # React form component (unused)
│   └── AdminDashboard.tsx     # React admin component (unused)
└── styles/
    └── globals.css            # Styling with IBM-inspired design

netlify/
└── functions/
    └── contact.ts             # API endpoint for form handling

.env.example                   # Environment configuration template
```

## Customization

### Styling
- Update CSS variables in `src/styles/globals.css`
- Modify form layout in `src/pages/contact.astro`
- Customize admin dashboard styling

### Form Fields
- Add new fields to the HTML form in `contact.astro`
- Update validation logic in the JavaScript section
- Modify the API endpoint to handle new fields

### Email Templates
- Edit email content in `netlify/functions/contact.ts`
- Create multiple templates for different scenarios
- Add dynamic content based on submission data

### Admin Features
- Extend admin dashboard with additional filters
- Add bulk actions for submissions
- Implement user roles and permissions

## Security Considerations

1. **Admin Access**: Change the default admin secret in production
2. **Input Validation**: All form inputs are validated on both client and server
3. **Rate Limiting**: Consider implementing rate limiting for the API
4. **Data Privacy**: Submissions are stored securely in Netlify Blobs
5. **Email Security**: Use environment variables for all API keys

## Monitoring & Maintenance

### Logs
- Netlify Functions logs available in Netlify dashboard
- Email delivery status logged to console
- Client-side errors logged to browser console

### Data Management
- Submissions stored in Netlify Blobs (automatically backed up)
- Export CSV regularly for backup
- Monitor submission volume and response times

### Updates
- Form validation rules in `contact.astro`
- Email templates in `contact.ts`
- Admin features in `admin.astro`

## Troubleshooting

### Common Issues

#### Form not submitting
1. Check browser console for JavaScript errors
2. Verify API endpoint is accessible at `/api/contact`
3. Check Netlify Functions logs for server errors

#### Emails not sending
1. Verify email service API key is correct
2. Check email service quotas and limits
3. Review function logs for email sending errors

#### Admin dashboard not loading
1. Confirm admin secret parameter is correct
2. Check if API endpoint returns data
3. Verify JavaScript is enabled in browser

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Integration Notes

### Cloudflare DNS
- System is ready for Cloudflare DNS integration
- All API endpoints use relative URLs
- Static assets are optimized for CDN delivery

### IBM NS1 Backend
- Hooks available for external service integration
- JSON API format compatible with most systems
- Webhook support can be added for real-time notifications

### Scalability
- Netlify Blobs scales automatically
- Functions are serverless and scale on demand
- Admin dashboard supports pagination for large datasets

## Support

For technical support or questions:
1. Check this documentation first
2. Review Netlify Functions logs
3. Test API endpoints directly
4. Verify environment configuration

The system is designed to be maintainable and self-contained, requiring minimal ongoing maintenance once properly configured.