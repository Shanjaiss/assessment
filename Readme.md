# 📖 Assessment Management Platform (MERN + AI Assisted Development)

This is a full-stack **Assessment Management Application** built using the MERN stack (MongoDB, Express, React, Node.js) as part of a technical assignment.

The platform allows users to create structured assessments, take them, and view detailed reports.

AI-assisted tools were used during development for debugging, scaffolding, and optimization, while the core business logic and implementation were developed manually.

---

## 🚀 Live Demo

👉 https://employee-assement-platform.netlify.app/login

---

## 📁 Source Code Repository

👉 https://github.com/Shanjaiss/assessment

---

## 🧩 Features

### 🔐 Authentication

- User Registration & Login
- JWT-based authentication
- Protected routes for secure access

---

### 🏗️ Assessment Builder

- Create multiple **Categories**
- Add **Factors** inside categories
- Add **Questions** inside factors
- Fully nested structure:  
  **Category → Factor → Question**
- Edit functionality at all levels
- Accordion-based UI for hierarchy
- Question configuration modal:
  - MCQ
  - Rating
  - Yes / No
  - Short text
  - Long text
  - Checkbox

---

### 📂 Category Management

- Create and manage categories
- Load previously saved categories
- Append existing categories into builder

---

### 💾 Assessment Management

- Save full builder structure as an assessment
- Redirect to assessments listing page after save
- Reset builder state after successful save

---

### ▶️ Launch Pad (Assessment Execution)

- Render complete assessment dynamically
- Supports multiple question types
- Submit responses successfully

---

### 📊 Reports Module

- View submitted assessment responses
- Structured and readable report format per submission

---

## 🏗️ Architecture Overview

Frontend (React)
↓
REST API (Express.js)
↓
Backend Logic (Node.js)
↓
MongoDB Database

### Flow:

1. User logs in (JWT Authentication)
2. Frontend stores token
3. Protected API calls made using token
4. Assessment Builder creates nested structure:
   Category → Factor → Questions
5. Data stored in MongoDB
6. Launch Pad fetches assessment dynamically
7. Responses stored in database
8. Reports module reads submitted responses

---

## 🧠 Key Design Decisions

- Used **nested schema design** (Category → Factor → Question) for flexibility
- JWT authentication for secure API access
- Separated Builder, Launch Pad, and Reports into independent modules
- Used React custom hooks for API abstraction
- Stored assessment structure as a single document for performance
- Designed dynamic rendering system for multiple question types

---

## ⚙️ Tech Stack

### Frontend

- React.js
- React Router
- Custom Hooks (API handling)
- React State Management

### Backend

- Node.js
- Express.js
- REST APIs

### Database

- MongoDB
- Mongoose Schemas:
  - Users
  - Assessments
  - Categories / Factors / Questions
  - Responses

---

## 🤖 AI Usage Summary

### Tools Used

- ChatGPT (code assistance, debugging, documentation)
- Claud AI (Server side code assistance)
- Lovable (Frontend code assistance)

### Sample Prompts Used

- “Design MERN schema for nested assessment builder”
- “Fix React dynamic form rendering issue for multiple question types”
- “Implement JWT authentication in Express backend”
- “Optimize API structure for nested category-factor-question model”

### AI vs Manual Work

**AI Assisted:**

- Boilerplate structure suggestions
- Initial schema design ideas
- Debugging React rendering issues
- README formatting support

**Manually Implemented:**

- Core business logic (Builder → Launch Pad → Reports)
- API design and integration
- Authentication system
- UI/UX and hierarchical builder logic
- Final data modeling and validation rules

---

## 🧪 Setup Instructions

### 1. Clone Repository

```bash
git clone https://github.com/Shanjaiss/assessment.git
cd project-folder

2. Backend Setup
cd Backend
npm install
npm run dev

3. Frontend Setup
cd Frontend
cd assessment_task
npm install
npm run dev

4. Environment Variables

Create .env in backend:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```
