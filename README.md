# Yojantha-AI powered access to government Schemes
## Overview:
Yojantha is a full-stack web application that simplifies access to government welfare schemes by intelligently matching citizens with schemes they are eligible for. The platform analyzes user profiles against official scheme criteria and delivers personalized, accurate recommendations through a secure and intuitive interface.
The system aims to bridge the gap between government welfare programs and citizens by reducing awareness barriers, simplifying complex eligibility rules, and preventing missed application deadlines.

## Problem Statement:
The Government of India offers numerous welfare schemes aimed at supporting various sections of society such as students, farmers, women, senior citizens, and economically weaker groups. However, many eligible citizens fail to benefit from these schemes due to lack of awareness, complex eligibility criteria, scattered information sources, and missed deadlines.
Existing platforms largely provide static information without personalized guidance, proactive alerts, or intelligent assistance. This results in underutilization of government resources and missed opportunities for citizens.
There is a need for an intelligent, centralized, and user-friendly platform that can automatically identify eligible schemes, explain them in simple terms, and assist users throughout the application lifecycle.

## Objectives:
- To build a centralized platform for government welfare schemes
- To provide personalized scheme recommendations based on user profiles
- To simplify eligibility criteria and scheme explanations
- To automate data ingestion from official government sources
- To enable tracking of applications, deadlines, and renewals
- To design a scalable system capable of AI and agent integration
- To ensure secure handling of user data and documents

## Features:
### 1.User Features
- Secure user registration and login
- Personal profile creation
- Dashboard showing eligible schemes
- Scheme search and filtering
- Application status tracking
- Notifications and reminders

### 2.System Features
- Centralized government scheme database
- Automated data synchronization from data.gov.in
- Rule-based eligibility checking
- Responsive and mobile-friendly UI

### 3.Admin Features
- Scheme management (add/update/remove)
- Data sync monitoring
- User and document verification

## Stakeholders:
### 1. Citizens (Users)
- Register and create personal profiles
- Upload required documents
- View eligible government schemes
- Track application status and deadlines
- Receive notifications and alerts

### 2. Government Authorities
- Publish scheme-related data
- Update eligibility criteria and benefits
- Provide official datasets via data.gov.in

### 3. System Administrator
- Manage scheme data
- Monitor data synchronization
- Verify documents
- Handle user issues

### 4. Platform (GovAssist AI System)
- Stores and processes user data securely
- Automatically syncs government datasets
- Evaluates scheme eligibility
- Sends alerts and reminders

## Roles and interactions:
### 1.User ↔ Platform
- User provides profile information
- Platform analyzes eligibility
- Platform recommends schemes

### 2.Platform ↔ Government Data Source
- Platform fetches official datasets
- Platform updates scheme records automatically

### 3.Admin ↔ Platform
- Admin manages scheme visibility
- Admin monitors system health

## TechStack:
- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- API Integration: data.gov.in
- Authentication: JWT
- Automation: Cron jobs

## Packages:
### Frontend(React)
- react-Build UI using components (Login, Home, Schemes pages)
- react-dom-Render React components in the browser
- react-scripts-Start, build, and run the React application
- react-router-dom-Navigation between pages (Login → Home → Schemes)
- axios-Send HTTP requests from frontend to backend APIs
### Backend Packages (Node.js + Express)
- express-Create REST APIs for users, schemes, and recommendation
- mongoose-Connect backend to MongoDB and define schemas
- cors-Allow frontend (React) to communicate with backend
- dotenv-Store sensitive data like DB URL and JWT secret securely
- axios-Fetch government scheme data from data.gov.in API
### Authentication Packages (JWT)
- jsonwebtoken-Generate and verify JWT tokens for user authentication
- bcryptjs-Encrypt user passwords before storing in database
### Automation / Scheduling
- node-cron-Schedule automatic tasks like scheme data updates and deadline checks
### API Integration (data.gov.in)
- axios
###  Development Utility
nodemon-Automatically restart backend server during development

## Tools:
### Development & Coding Tools
- VS Code-Writing frontend & backend code
- Command Prompt-Running React & Node servers
- Node.js-JavaScript runtime environment
- npm-Package management
### Frontend Development Tools
- React (via npm)-Building UI components
- Web Browser (Chrome)-Testing frontend UI
###  Backend Development Tools
- Node.js-Backend runtime
- Express.js-API development
- Postman-Testing backend APIs
### Database Tools
- MongoDB-NoSQL database
- MongoDB Compass-Database visualization & testing
- Excel-Initial database design (tables & relations)
### Version Control & Collaboration
- Git-Version control
- GitHub-Code hosting & collaboration

## DataSchemas:
- User(user_id,user_name,emailid,password,dob,name)
- Schemes(scheme_id,scheme_name,category,dept,min_income,max_income,min_age,max_age,deadline,documents,gender)
- OptedScheme(user_id,scheme_id,applied_date,status(opted/not))









