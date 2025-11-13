# DIGIT Platform Monorepo

This repository contains the complete DIGIT (Digital Infrastructure for Governance) platform, organized as a monorepo with the following components:

## Repository Structure

```
.
├── Digit-Core/                 # Core backend microservices and infrastructure
│   ├── core-services/          # Domain-driven microservices (user, notification, workflow, etc.)
│   ├── accelerators/           # Code generation and Kubernetes discovery tools
│   └── utilities/              # Migration tools for boundary and MDMS data
│
├── Digit-FrontEnd/             # React + TypeScript frontend application
│   ├── src/                    # Application source code
│   └── public/                 # Static assets
│
├── digit-be/                   # Node.js Express backend for API handling
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Authentication and other middleware
│   └── config/                 # Configuration files
```

## Components Overview

### Digit-Core
Java-based microservices using Spring Boot, built with Maven. Contains domain-specific services like:
- User management (`egov-user`)
- Notifications (`egov-notification-*`)
- Workflow (`egov-workflow-v2`)
- File storage (`egov-filestore`)
- Localization (`egov-localization`)
- And many more...

### Digit-FrontEnd
React application with TypeScript for UI interaction, managed via npm.

### digit-be
Standalone Node.js backend with Express for handling various APIs including:
- Cities
- Complaints
- Users
- Subscriptions
- Service Engineers
- Tanks
- Plans

## Getting Started

Each component has its own setup instructions:
- For backend services, see `Digit-Core/README.md`
- For frontend, see `Digit-FrontEnd/README.md`
- For Node.js backend, see `digit-be/README.md`

## Development Guidelines

This monorepo follows a modular approach where each component can be developed and deployed independently while maintaining a single source of truth.