# OneDrop – Smart NGO Donation Platform

OneDrop is a full-stack web application that connects verified NGOs with donors through a secure and transparent donation
platform. The application simplifies the donation process while ensuring that only verified NGOs can create fundraising campaigns 
using an OCR-based verification system.

---
## Features
- NGO and Donor Registration & Login
- Secure Role-Based Authentication
- OCR-Based NGO Verification using Tesseract.js
- Campaign Creation and Management
- Monetary and Item Donation Support
- Automated Donation Confirmation Emails
- Session-Based Authentication
- Responsive User Interface
- MVC Architecture

---
## Tech Stack

### Frontend
- HTML5
- CSS3
- Bootstrap 5
- JavaScript
- EJS

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Libraries & Tools
- Express Session
- bcrypt
- Multer
- Tesseract.js
- Nodemailer
- Method Override
- Connect Flash
- Dotenv
---
## Project Architecture

The project follows the **MVC (Model-View-Controller)** architecture.

```
Client
   │
   ▼
Routes
   │
   ▼
Controllers
   │
   ▼
Models (Mongoose)
   │
   ▼
MongoDB Atlas
```
## Workflow

### NGO Registration

1. NGO registers on the platform.
2. Uploads NGO registration certificate.
3. Tesseract.js extracts the registration number from the certificate.
4. Registration number is verified against the Valid NGO database.
5. Verified NGOs can create donation campaigns.

### Donor Workflow

1. User registers or logs in.
2. Browses active campaigns.
3. Donates money or essential items.
4. Donation is stored in MongoDB.
5. Confirmation email is automatically sent using Nodemailer.

---

## Installation

### Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/OneDrop.git
```

```bash
cd OneDrop
```

### Install Dependencies

```bash
npm install
```

### Create Environment File

Create a `.env` file in the project root and add the following:

```env
MONGO_URI=your_mongodb_connection_string

SESSION_SECRET=your_session_secret

EMAIL_USER=your_email

EMAIL_PASS=your_app_password
```

### Run Application

```bash
node app.js
```

or

```bash
nodemon app.js
```
## Folder Structure

```
OneDrop/
│
├── controllers/
├── middleware/
├── models/
├── public/
├── routes/
├── uploads/
├── utils/
├── views/
│
├── app.js
├── package.json
├── .env.example
└── README.md
```

---

## Future Enhancements

- Online Payment Gateway Integration
- Campaign Analytics
- NGO Performance Reports
- Donation History Dashboard
- OTP-Based Authentication
- AI-Based Donation Recommendations

---
## Key Learning Outcomes

- Full-Stack Web Development
- MVC Architecture
- RESTful API Development
- MongoDB Schema Design
- Authentication & Authorization
- OCR Integration using Tesseract.js
- Email Automation using Nodemailer
- Session Management
- File Upload Handling using Multer

---

## Author 
Pavan Lamani

GitHub: https://github.com/Pavanlamani860
