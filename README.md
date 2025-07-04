Task Manager - Node.js & EJS
A modern, full-stack task management application built with Node.js, Express, and MongoDB. It features a clean, responsive user interface styled with Tailwind CSS and includes secure user authentication, task management, and email notifications.

Features
Secure User Authentication: Local (email/password) signup with OTP email verification and secure login.

Google OAuth 2.0: Allow users to sign up and log in with their Google account.

Password Management: Full password reset functionality via secure email links.

Task Management (CRUD): Create, read, update, and delete tasks for authenticated users.

Smart Task Status: Tasks are automatically flagged as overdue, and users receive reminders for tasks due the next day.

Search Functionality: Quickly find tasks by keyword.

Email Notifications:

One-Time Password (OTP) for account verification.

Password reset links.

Daily reminders for tasks due the next day.

Modern UI: A clean, responsive, and themeable user interface built with EJS and Tailwind CSS.

Tech Stack
Backend: Node.js, Express.js

Database: MongoDB with Mongoose

Templating Engine: EJS (Embedded JavaScript)

Authentication: Passport.js (Local, Google OAuth20)

Styling: Tailwind CSS

Emailing: Nodemailer

Security: helmet, bcrypt, express-rate-limit

Scheduled Jobs: node-cron

Setup and Installation
Follow these steps to get the application running on your local machine.

1. Prerequisites
Node.js (v18.x or later recommended)

npm

MongoDB (running locally or a cloud instance like MongoDB Atlas)

2. Clone the Repository
Bash

git clone <your-repository-url>
cd <repository-folder>
3. Install Dependencies
Bash

npm install
4. Set Up Environment Variables
Create a .env file in the root of your project and add the following variables. Replace the values with your own keys and credentials.

Code snippet

# Server Configuration
PORT=3000
APP_URL=http://localhost:3000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/todo_app

# Session
SESSION_SECRET=a_very_long_and_secret_string_for_sessions

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Nodemailer (Email Service) Credentials
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
