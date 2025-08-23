# 🌟 Astral Core Mental Health Platform

[![Netlify Status](https://api.netlify.com/api/v1/badges/YOUR-BADGE-ID/deploy-status)](https://app.netlify.com/sites/YOUR-SITE-NAME/deploys)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg)](https://reactjs.org/)

## 🎯 Overview

Astral Core is a comprehensive mental health support platform that provides AI-powered therapy, crisis intervention, peer support, and wellness tools. Built with React, TypeScript, and Vite, it offers a safe, accessible space for mental health support.

### ✨ Key Features

- 🤖 **AI Therapist** - Empathetic AI-powered mental health support
- 🆘 **Crisis Detection & Intervention** - Real-time crisis detection with automatic escalation
- 👥 **Peer Support Network** - Connect with others who understand your journey
- 📋 **Safety Planning** - Interactive personal safety plan builder
- 🧘 **Wellness Tools** - Breathing exercises, grounding techniques, mood tracking
- 📱 **Progressive Web App** - Works offline with critical features cached
- 🔒 **Privacy-First** - Anonymous mode and secure data handling
- 🌍 **Global Crisis Support** - International crisis hotline directory

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/YOUR-USERNAME/astral-core-mental-health.git
cd astral-core-mental-health
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 🏗️ Build & Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Netlify

#### Option 1: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy to Netlify
netlify deploy --prod
```

#### Option 2: GitHub Integration
1. Push code to GitHub
2. Connect repository to Netlify
3. Automatic deployments on push to main branch

### Environment Variables

Create a `.env` file with:

```env
# Auth0 (Optional)
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-client-id
VITE_AUTH0_AUDIENCE=your-audience

# AI Services (Optional)
OPENAI_API_KEY=your-openai-key
CLAUDE_API_KEY=your-claude-key

# Analytics (Optional)
VITE_GA_TRACKING_ID=your-ga-id
```

## 📱 Features

### Crisis Support
- 988 Suicide & Crisis Lifeline integration
- Crisis Text Line (741741)
- Global crisis hotline directory
- Real-time crisis detection
- Automatic escalation workflows

### AI Therapist
- Empathetic conversational AI
- Crisis detection in conversations
- Multiple AI provider support
- Content moderation for safety

### Wellness Tools
- Mood tracking with insights
- Breathing exercises (Box, 4-7-8, Belly)
- Grounding techniques (5-4-3-2-1, Body scan)
- Meditation timer
- Guided journaling
- Safety plan builder

### Peer Support
- Anonymous peer matching
- Support groups
- Helper network
- Community forums

### Offline Support
- Critical features work offline
- Coping strategies cached
- Safety plan accessible
- Automatic sync when online

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript 5
- **Build Tool**: Vite 7
- **Styling**: CSS Modules, Tailwind CSS
- **State Management**: Zustand, React Context
- **Routing**: React Router v6
- **PWA**: Service Workers, Workbox
- **Backend**: Netlify Functions
- **Database**: Local Storage, IndexedDB
- **AI Integration**: OpenAI, Claude APIs
- **Analytics**: Privacy-compliant custom analytics

## 📁 Project Structure

```
astral-core-mental-health/
├── src/
│   ├── components/      # React components
│   ├── views/           # Page components
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   ├── services/        # Business logic
│   ├── utils/           # Utilities
│   ├── styles/          # Global styles
│   └── types/           # TypeScript types
├── netlify/
│   └── functions/       # Serverless functions
├── public/              # Static assets
├── dist/                # Build output
└── tests/               # Test files
```

## 🔒 Security & Privacy

- GDPR compliant design
- Anonymous usage option
- Local data storage
- Encrypted sensitive data
- Content moderation
- XSS/CSRF protection
- Secure authentication

## 🌍 Internationalization

The platform supports multiple languages and cultural contexts:
- English (default)
- Spanish
- French
- German
- Chinese
- Arabic

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📊 Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Bundle Size: < 500KB gzipped

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Crisis Resources

If you're in crisis, please reach out for help:

- **USA**: 988 Suicide & Crisis Lifeline
- **USA**: Crisis Text Line - Text HOME to 741741
- **UK**: Samaritans - 116 123
- **Canada**: Talk Suicide Canada - 1-833-456-4566
- **Australia**: Lifeline - 13 11 14

## 🙏 Acknowledgments

- Mental health professionals who provided guidance
- Open source community
- Crisis intervention organizations
- All contributors and supporters

## 📧 Contact

For questions or support, please open an issue or contact the maintainers.

---

**Remember**: This platform is a support tool and does not replace professional mental health care. If you're in crisis, please contact emergency services or a crisis hotline immediately.

---

Built with ❤️ for mental health support