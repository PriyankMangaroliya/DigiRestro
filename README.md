# 🍽️ DigiRestro

[//]: # ([![Build Status]&#40;https://img.shields.io/badge/build-passing-brightgreen.svg&#41;]&#40;https://github.com/Priyank002/DigiRestro&#41;)

[//]: # ([![License: MIT]&#40;https://img.shields.io/badge/License-MIT-yellow.svg&#41;]&#40;https://opensource.org/licenses/MIT&#41;)

[//]: # ([![Version]&#40;https://img.shields.io/badge/version-1.0.0-blue.svg&#41;]&#40;https://github.com/Priyank002/DigiRestro&#41;)

[//]: # ([![Node.js]&#40;https://img.shields.io/badge/Node.js-v18+-6DA55F?logo=node.js&logoColor=white&#41;]&#40;https://nodejs.org/&#41;)

[//]: # ([![MongoDB]&#40;https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white&#41;]&#40;https://www.mongodb.com/&#41;)

> **DigiRestro** is a modern, full-featured restaurant management system designed to streamline operations, enhance customer service, and provide real-time analytics for restaurant owners and managers.

---

## 📌 Project Overview

**DigiRestro** is a robust SaaS-like platform that simplifies restaurant operations through automation and smart management tools. From menu configuration to real-time order tracking and financial analytics, DigiRestro provides a unified dashboard to manage every aspect of a dining establishment.

Whether you're running a small café or a large multi-branch restaurant empire, DigiRestro scales with your business, reducing manual errors and improving the overall dining experience.

---

## ✨ Features

### 🏢 Multi-Tenancy & Branch Management
- **Company Profile**: Manage restaurant entities with custom branding.
- **Branch Control**: Oversee multiple locations under a single company account.
- **Subscription Model**: Tiered access for different restaurant sizes.

### 📋 Advanced Menu Management
- **Hierarchical Structure**: Organize menus by Category → Sub-Category → Items → Sub-Items.
- **Dynamic Pricing**: Flexibly manage prices across different branches.
- **Bulk Product Import**: Powerful Excel-based bulk import for rapid menu setup.
- **Image Management**: Seamlessly upload and update food item visuals.

### 🪑 Table & Area Management
- **Area Definition**: Define different dining sections (e.g., Indoor, Rooftop, VIP).
- **Interactive Tables**: Assign and manage tables within specific areas for efficient seating.

### 🧾 Smart Order System
- **Real-Time Tracking**: Monitor orders from placement to preparation and service.
- **Kitchen Workflow**: Streamlined interface for kitchen staff to manage active orders.
- **Status Updates**: Instant notifications for order progress.

### 📊 Analytics & Reporting
- **Interactive Dashboards**: Premium ApexCharts integration for revenue and order statistics.
- **Financial Reports**: Daily, weekly, monthly, and yearly revenue tracking with percentage growth.
- **Export Options**: Professional report exports in PDF, CSV, and Excel formats.

### 💳 Payment & Security
- **Payment Gateway**: Integrated with **Razorpay** for seamless online transactions.
- **Secure Auth**: Robust user authentication using Bcrypt and JWT.
- **Role-Based Access**: Granular permissions for Admins, Company Owners, and Store Managers.

---

## 🛠️ Tech Stack

### Backend
- **Framework**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **Templating**: EJS (Embedded JavaScript)
- **Authentication**: JWT, Bcrypt, Express-Session
- **Task Scheduling**: Node-Schedule for automated tasks

### Frontend & UI
- **Styling**: Vanilla CSS, HTML5
- **Interactions**: JavaScript (ES6+), Axios for API calls
- **Components**: SweetAlert2 for polished notifications
- **Data Visualization**: ApexCharts for dynamic analytics
- **Responsive Design**: Mobile-friendly layout for tablets and smartphones

### Utilities
- **File Handling**: Multer for image and file uploads
- **Data Processing**: Lodash for efficient data manipulation
- **Emailing**: Nodemailer for notifications and alerts
- **Payments**: Razorpay Node SDK

---

## 📂 Project Structure

```text
DigiRestro/
├── controller/        # Business logic for all modules
├── modules/           # Mongoose models and schema definitions
├── views/             # EJS templates for the frontend
├── settings/          # Configuration and global settings
├── public/            # Static assets (images, CSS, JS) - *Expected*
├── index.js           # Main application entry point
├── config.js          # Environment & Database configuration
├── package.json       # Project dependencies and scripts
└── .env               # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- NPM or Yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Priyank002/DigiRestro.git
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   ```

4. **Run the application:**
   ```bash
   # For development (with nodemon)
   npm run dev

   # For production
   npm start
   ```

---

## 🎯 Target Use Cases
- **Fine Dining Restaurants**: Complete table and order management.
- **Café & Quick Service (QSR)**: Rapid menu updates and real-time tracking.
- **Food Courts**: Unified multi-tenant support for multiple vendors.
- **Cloud Kitchens**: Efficient order flow and kitchen management.

---


⭐ **Star this repository if you find it useful!**
