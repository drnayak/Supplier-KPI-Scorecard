# Supplier KPI Evaluation System

## Overview

A comprehensive supplier performance evaluation system built to track and score supplier performance across multiple dimensions. The application implements SAP S4HANA-style scoring algorithms to evaluate suppliers based on price variance, quantity variance, delivery timeliness, quality metrics, and PPM (parts per million defects). It provides a centralized dashboard for monitoring supplier KPIs, detailed evaluation forms for each metric category, and comprehensive reporting capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Framework**: Shadcn/UI components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful endpoints following standard HTTP conventions
- **Data Validation**: Shared Zod schemas between frontend and backend
- **Storage Layer**: Abstract storage interface with in-memory implementation for flexibility

### Data Model Design
The system uses a normalized database schema with the following core entities:
- **Suppliers**: Basic supplier information and contact details
- **Evaluation Tables**: Separate tables for each evaluation type (price, quantity, delivery, quality, PPM)
- **Supplier KPIs**: Aggregated performance metrics and overall scores
- Each evaluation links to suppliers via foreign keys and includes calculated scores based on SAP S4HANA algorithms

### Scoring Algorithm Implementation
- **Price Evaluation**: Calculates variance between PO and invoice prices with configurable scoring bands
- **Quantity Evaluation**: Measures variance between ordered and received quantities
- **Delivery Evaluation**: Tracks delivery performance against scheduled dates with overdue day calculations
- **Quality Evaluation**: Combines quality notifications and inspection results
- **PPM Evaluation**: Calculates parts per million defect rates with industry-standard thresholds

### Development Tooling
- **Build System**: Vite for fast development and optimized production builds
- **Type Checking**: TypeScript compiler with strict mode enabled
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Development Server**: Hot module replacement with error overlay for enhanced developer experience

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL dialect
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI and Component Libraries
- **Radix UI**: Headless component primitives for accessibility and behavior
- **Shadcn/UI**: Pre-built component library with consistent design system
- **Lucide React**: Icon library for consistent iconography
- **Embla Carousel**: Carousel component for data presentation

### Development and Build Tools
- **Vite**: Build tool with React plugin and development server
- **TypeScript**: Static type checking and enhanced IDE support
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **PostCSS**: CSS processing with Autoprefixer for browser compatibility

### Form and Validation
- **React Hook Form**: Performance-focused form library with minimal re-renders
- **Zod**: Schema validation library for runtime type checking
- **Hookform Resolvers**: Integration between React Hook Form and Zod validation

### Data Fetching and State
- **TanStack Query**: Server state management with caching, background updates, and error handling
- **Date-fns**: Date manipulation and formatting utilities