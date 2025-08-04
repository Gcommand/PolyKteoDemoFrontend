# PolyKteo Demo Frontend

A modern web application for semantic search of patents and technologies from The Hong Kong Polytechnic University. Built with Next.js 15, this application provides intelligent search capabilities with advanced filtering and AI-powered assistance.

## 🚀 Features

- **Semantic Search**: Advanced search functionality for patents and technologies using AI-powered semantic matching
- **Intelligent Filtering**: Filter results by departments, technology sectors, and assignees
- **AI Chatbot**: Integrated Dify chatbot for interactive assistance and queries
- **Real-time Results**: Dynamic search with sorting by relevance, date, and department
- **Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **Browse & Discovery**: Browse all available content with pagination and sorting options

## 🛠️ Tech Stack

- **Frontend Framework**: Next.js 15.2.5 with TypeScript
- **State Management**: Jotai for atomic state management
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Custom components with Lucide React icons
- **AI Integration**: Dify chatbot for intelligent assistance
- **Deployment**: Docker containerization support

## 📋 Prerequisites

- Node.js 18 or higher
- npm, yarn, or pnpm package manager
- Docker (for deployment)

## 🔧 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd PolyKteoDemoFrontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## 🔍 Application Features

### Search Functionality
- **Keyword Search**: Search patents and technologies by title, description, or keywords
- **Semantic Matching**: AI-powered search that understands context and meaning
- **Confidence Levels**: Adjustable confidence thresholds for search results
- **Advanced Sorting**: Sort by relevance, date, or department (A-Z or Z-A)

### Filtering Options
- **Departments**: Filter by university faculties, schools, and departments
- **Technology Sectors**: Filter by specific technology categories
- **Assignees**: Filter by patent assignees and inventors

### AI Assistant
- **Dify Chatbot**: Integrated AI chatbot for questions and assistance
- **Custom Styling**: PolyU-branded chatbot interface
- **Real-time Help**: Interactive support for using the application

## 🏗️ Project Structure

```
PolyKteoDemoFrontend/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── search/        # Search endpoint
│   │   ├── tech_sectors/  # Technology sectors API
│   │   └── poly_assignees/# Assignees API
│   ├── add/               # Additional pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── providers.tsx      # State providers
├── atoms/                 # Jotai atoms for state management
├── components/            # Reusable React components
│   ├── DifyChatbot.tsx   # AI chatbot integration
│   ├── movies.tsx        # Search results display
│   ├── search-bar.tsx    # Search interface
│   └── multi-select-dropdown.tsx
├── config/               # Configuration files
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
├── utils/                # Helper functions
└── sql/                  # Database scripts
```

## 🐳 Docker Deployment

### Building the Docker Image

```bash
docker build -t polykteo-frontend .
```

### Running the Container

```bash
docker run -p 3000:3000 polykteo-frontend
```

### Using Docker Compose

The project includes a `docker-compose.yml` file for easy deployment:

```bash
docker-compose up -d
```

### Production Deployment (UAT & PROD)

For UAT and Production environments, deployment is handled through PolyU's on-premise infrastructure:

#### 1. Build and Save Docker Image

```bash
# Build the Docker image
docker build -t polykteo-frontend:latest .

# Save the Docker image as a tar file
docker save polykteo-frontend:latest -o polykteo-frontend.tar
```

#### 2. Upload to PolyU On-Premise Server

```bash
# Connect via GlobalConnect VPN to PolyU network
# Upload the tar file to PolyU's Ubuntu server using hostname
scp polykteo-frontend.tar hostname:/path/to/deployment/
```

#### 3. Load and Run on PolyU Server

```bash
# SSH into PolyU Ubuntu server via GlobalConnect VPN using hostname
ssh hostname

# Load the Docker image from tar file
docker load -i /path/to/deployment/polykteo-frontend.tar

# Run the container
docker run -d -p 3000:3000 --name polykteo-frontend polykteo-frontend:latest
```

#### Deployment Process Summary
- **Local Development**: Standard Docker development workflow
- **UAT/PROD**: Docker tar file creation → Upload to PolyU on-premise Ubuntu server → Load and run

This approach ensures secure deployment to PolyU's controlled on-premise infrastructure while maintaining consistency across environments.

## 🔌 API Integration

The application connects to a backend API for search functionality. The API endpoints are configured in:

- **Development**: `http://localhost:5000`
- **Staging**: Azure Container Apps deployment
- **Production**: Configurable backend URLs

### Backend Configuration

Backend URLs are managed in the API route files (`app/api/*/route.ts`) with environment-specific configurations.

## 🎨 Customization

### Styling
- The application uses Tailwind CSS with a custom design system
- PolyU brand colors and styling are implemented throughout
- Custom CSS for the Dify chatbot integration

### Components
- Modular component architecture for easy customization
- Atomic state management with Jotai for predictable updates
- TypeScript interfaces for type safety

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is part of The Hong Kong Polytechnic University's research and development initiatives.

## 🔗 Related Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/)
- [Jotai State Management](https://jotai.org/)
- [Dify AI Platform](https://dify.ai/)

## 📞 Support

For technical support or questions about this application, please contact the development team or open an issue in this repository.

---

**Built with ❤️ for The Hong Kong Polytechnic University**