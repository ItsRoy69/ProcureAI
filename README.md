# AI-Powered RFP Management System

A single-user AI-powered web application for procurement managers to streamline the Request for Proposal (RFP) process. The system automates RFP creation from natural language, sends RFPs to vendors via email, automatically parses vendor responses, and provides AI-powered proposal comparison.

## Features

- **Natural Language RFP Creation**: Describe your procurement needs in plain English, and AI generates a structured RFP
- **Automated Vendor Communication**: Send RFPs to multiple vendors via email with one click
- **AI-Powered Response Parsing**: Automatically extract and structure data from vendor email responses
- **Intelligent Proposal Comparison**: AI analyzes and compares proposals, providing scores, pros/cons, and recommendations

## Technology Stack

### Frontend
- React.js
- Material-UI (MUI)
- React Router
- Axios

### Backend
- Node.js
- Express.js
- Sequelize ORM
- SQLite Database

### AI & Services
- Google Gemini API (free tier)
- Nodemailer (email sending)
- IMAP (email receiving)

## Prerequisites

- Node.js v16 or higher
- Google Gemini API key (free at https://makersuite.google.com/app/apikey)
- Gmail account with app password for email integration

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ProcureAI
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file from template
copy .env.example .env

# Edit .env and add your credentials:
# - GEMINI_API_KEY: Your Google Gemini API key
# - EMAIL_USER: Your Gmail address
# - EMAIL_PASSWORD: Your Gmail app password
# - IMAP_USER: Same as EMAIL_USER
# - IMAP_PASSWORD: Same as EMAIL_PASSWORD
```

**Getting Gmail App Password:**
1. Go to Google Account settings
2. Enable 2-Factor Authentication
3. Go to Security → App passwords
4. Generate a new app password for "Mail"
5. Use this password in your .env file

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file from template (optional, uses localhost:5000 by default)
copy .env.example .env
```

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The frontend will start on `http://localhost:3000`

## Usage Guide

### 1. Create an RFP

1. Click "Create New RFP" on the dashboard
2. Describe your procurement needs in natural language
   - Example: "I need 50 laptops with 16GB RAM, Intel i7, for $40,000 total. Delivery by March 31, 2026."
3. Review the AI-generated RFP
4. Edit if needed
5. Proceed to vendor selection

### 2. Send to Vendors

1. Select vendors from the list or add new vendors
2. Click "Send RFP" to email the RFP to selected vendors
3. Vendors will receive a professional email with all RFP details

### 3. Receive and Parse Responses

- The system automatically monitors your inbox every 5 minutes
- When vendors reply (keeping the reference ID in the subject), the system:
  - Extracts the email content
  - Uses AI to parse pricing, terms, and conditions
  - Stores the proposal in the database

### 4. Compare Proposals

1. Navigate to an RFP with received proposals
2. Click "Compare Proposals"
3. Click "Compare with AI" to analyze all proposals
4. Review:
   - Overall scores for each vendor
   - Compliance, price, and delivery scores
   - Pros and cons
   - Deviations from requirements
   - AI recommendation

## API Documentation

### RFP Endpoints

- `POST /api/rfps/create-from-nl` - Create RFP from natural language
- `GET /api/rfps` - Get all RFPs (optional: ?status=draft|sent|closed)
- `GET /api/rfps/:id` - Get single RFP with proposals
- `PUT /api/rfps/:id` - Update RFP
- `DELETE /api/rfps/:id` - Delete RFP
- `POST /api/rfps/:id/send` - Send RFP to vendors
- `GET /api/rfps/:id/proposals` - Get proposals for RFP

### Vendor Endpoints

- `POST /api/vendors` - Create vendor
- `GET /api/vendors` - Get all vendors
- `GET /api/vendors/:id` - Get single vendor
- `PUT /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor

### Proposal Endpoints

- `GET /api/proposals/rfp/:rfpId` - Get proposals for RFP
- `GET /api/proposals/:id` - Get single proposal
- `POST /api/proposals/compare` - Compare proposals with AI
- `PUT /api/proposals/:id/status` - Update proposal status

## AI Prompt Strategy

### Natural Language to RFP Conversion

The system uses a structured prompt that instructs Gemini to extract:
- Project title and description
- Detailed requirements with specifications and quantities
- Budget constraints
- Timeline and deadlines
- Evaluation criteria
- Special requirements

The AI returns a JSON object that is validated and stored in the database.

### Email Response Parsing

When a vendor responds, the AI extracts:
- Itemized pricing breakdown
- Total cost
- Payment terms
- Delivery timeline
- Warranty and support information
- Special conditions

This structured data is stored and used for comparison.

### Proposal Comparison

The AI compares proposals against the original RFP by:
- Calculating compliance scores (0-100)
- Evaluating price competitiveness
- Assessing delivery feasibility
- Identifying deviations from requirements
- Generating pros and cons for each vendor
- Providing a recommendation with reasoning

## Database Schema

### RFPs Table
- id, title, description, requirements (JSON), budget, deadline, evaluation_criteria (JSON), special_requirements, status, timestamps

### Vendors Table
- id, name, email, contact_person, phone, company_info, timestamps

### Proposals Table
- id, rfp_id, vendor_id, pricing (JSON), total_cost, payment_terms, delivery_timeline, warranty, special_conditions, raw_email_content, parsed_data (JSON), ai_score, ai_analysis, status, received_at, timestamps

### RFP_Vendors Table (Junction)
- id, rfp_id, vendor_id, sent_at, email_status, timestamps

## Project Structure

```
ProcureAI/
├── backend/
│   ├── src/
│   │   ├── config/         # Database, AI, Email configuration
│   │   ├── models/         # Sequelize models
│   │   ├── controllers/    # Business logic
│   │   ├── routes/         # API routes
│   │   ├── services/       # AI and Email services
│   │   └── server.js       # Express server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service
│   │   └── App.js          # Main app with routing
│   ├── package.json
│   └── .env.example
└── README.md
```

## Troubleshooting

### Backend won't start
- Check that all environment variables are set in `.env`
- Verify Gemini API key is valid
- Ensure port 5000 is not in use

### Email sending fails
- Verify Gmail app password is correct
- Check that 2FA is enabled on your Google account
- Ensure "Less secure app access" is not blocking the connection

### Email monitoring not working
- Verify IMAP credentials are correct
- Check that IMAP is enabled in Gmail settings
- Look for errors in backend console logs

### Frontend can't connect to backend
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify `.env` file has correct API URL

## Future Enhancements

- Multi-user support with authentication
- Advanced analytics and reporting
- Integration with procurement systems
- Document attachment handling (PDF parsing)
- Real-time notifications
- Vendor performance tracking
- Template library for common RFPs

## License

MIT

## Author

Built with ❤️ using Google Gemini AI
