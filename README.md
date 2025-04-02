# Applicant Tracking System (ATS)

## Overview

The **Applicant Tracking System (ATS)** is a RESTful API built with **Node.js, TypeScript, and MySQL**. It facilitates **candidate CV uploads, recruiter access to CVs, and AI-powered CV analysis** using Google Gemini. The system supports three user roles:

- **Candidates** (upload CVs)
- **Recruiters** (view & analyze CVs)
- **Organizations** (manage recruiters)

---

## Prerequisites

- **Node.js** v18+
- **MySQL** v8+
- **Postman** (for API testing)
- **Google Gemini API Key** (for AI analysis)

---

## Setup Guide

### 1. Clone Repository

```bash
git clone https://github.com/your-repo/ats.git
cd ats
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Database Setup

Run the following in MySQL:

```sql
CREATE DATABASE ats;
USE ats;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('organization', 'recruiter', 'candidate') NOT NULL,
  org_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cvs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  org_id INT NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. Environment Variables

Create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=ats
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_key
PORT=3000
```

### 5. Start Server

```bash
npm run dev
```

---

## API Endpoints

### Authentication

#### Register User

- **URL:** `/auth/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secure123",
    "role": "candidate"
  }
  ```
- **Response:**
  ```json
  {
    "userId": 1,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```

#### Login

- **URL:** `/auth/login`
- **Method:** `POST`
- **Response:** Same as registration.

### Candidate Endpoints

#### Upload CV

- **URL:** `/cv`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Body:** `multipart/form-data`
  - `cv`: PDF file
  - `orgId`: Organization ID
- **Response:**
  ```json
  {
    "cvId": 1,
    "filePath": "uploads/cvs/12345-cv.pdf"
  }
  ```

### Recruiter Endpoints

#### List CVs

- **URL:** `/recruiter/cvs`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Response:**
  ```json
  {
    "cvs": [
      {
        "id": 1,
        "candidateId": 1,
        "filePath": "uploads/cvs/12345-cv.pdf",
        "uploadedAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
  ```

#### Analyze CV

- **URL:** `/recruiter/cv/:cvId/analyze`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **WebSocket URL:** `ws://localhost:3000/ws/analysis/:cvId`
- **Response (Stream):**
  ```json
  {"chunk": "Strong technical skills in..."}
  {"status": "completed"}
  ```

---

## WebSocket Integration

### Real-Time CV Analysis

```bash
wscat -c "ws://localhost:3000/ws/analysis/1" -H "Authorization: Bearer <TOKEN>"
```

---

## Error Handling

| Code | Error               | Example Response                          |
| ---- | ------------------- | ----------------------------------------- |
| 400  | Validation Failed   | `{ "errors": ["Invalid email format"] }`  |
| 401  | Unauthorized        | `{ "error": "Invalid token" }`            |
| 403  | Forbidden           | `{ "error": "Insufficient permissions" }` |
| 429  | Rate Limit Exceeded | `{ "error": "Too many requests" }`        |

---

## Security

- **JWT Authentication:** All protected routes require a Bearer token.
- **Rate Limiting:**
  - `100 requests/15 minutes (Global)`
  - `5 CV uploads/day (Per user)`
- **Validation:**
  - Zod schema validation for all inputs.
  - File type restriction (PDF only).

---

## Testing

### cURL Examples

#### Register Organization

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Tech Corp","email":"hr@techcorp.com","password":"org123","role":"organization"}'
```

#### Get CV Analysis

```bash
curl -X GET http://localhost:3000/recruiter/cv/1/analyze \
  -H "Authorization: Bearer <TOKEN>"
```

---

## Project Structure

```
src/
├── config/     # Database config
├── controllers # Business logic
├── middleware  # Auth/validation
├── models      # Database models
├── routes      # API endpoints
├── schemas     # Zod validation
└── utils       # AI/WebSocket logic
```

---

## Tech Stack

- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL
- **AI:** Google Gemini
- **Auth:** JWT
- **Validation:** Zod

**Documentation Version:** 1.0.0
