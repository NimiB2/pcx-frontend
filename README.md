# PCX Pilot System - Frontend

React + Redux + SCSS frontend for the Plastic Recycling Credit Measurement System.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit
- **Styling**: SCSS + Material-UI (MUI)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Build Tool**: Create React App

## Features

- ✅ Responsive web application (desktop + mobile browsers)
- ✅ Progressive Web App (PWA) capabilities
- ✅ Offline support with IndexedDB
- ✅ Real-time dashboard with charts
- ✅ Measurement capture workflows
- ✅ Batch management
- ✅ VRCQ calculations
- ✅ Document repository
- ✅ Reconciliation & discrepancy review

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Running Locally

```bash
# Development server
npm start

# Production build
npm run build
```

The app will start on `http://localhost:3000`

## Available Pages

- **Dashboard** - Production overview, statistics, charts
- **Measurements** - View and capture measurements
- **Batches** - Batch management and tracking
- **VRCQ Manager** - Verified recycled content quantities
- **Credit Allocation** - Post-certification allocation (Admin only)
- **Codebook** - Confidential code mappings
- **Documents** - Certification document repository
- **Punch List** - Task management for certification
- **Reconciliation** - Discrepancy review and resolution
- **Reports** - Generate reports and evidence packages

## Project Structure

```
frontend/
├── public/             # Static files
├── src/
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── features/       # Feature modules
│   ├── redux/          # Redux store and slices
│   ├── services/       # API services
│   ├── styles/         # Global SCSS
│   ├── mockData/       # Mock data for demo
│   ├── utils/          # Helper functions
│   └── App.tsx         # Main app component
└── package.json
```

## Mock Data

Currently using mock data for demonstration. Connect to backend API by updating the API service configuration.

## Testing

```bash
npm test
npm run test:e2e  # End-to-end tests with Playwright/Cypress
```

## Deployment

Build for production and deploy to AWS S3 + CloudFront:

```bash
npm run build
# Deploy dist/ folder to S3
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## License

Proprietary - Aterum

## Contact

For questions or support, contact the development team.
