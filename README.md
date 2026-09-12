# 🏨 StayEase — Hotel Reservation Platform

StayEase is a full-stack hotel reservation platform inspired by Booking.com. It allows customers to search for hotels, check room availability, make reservations, complete payments, manage bookings, and submit reviews.

The platform also provides dedicated functionality for **Hotel Managers** to manage hotels and rooms, and for **Administrators** to monitor the overall platform.

---

## 🚀 Features

### 👤 Authentication & Account Management

- Customer registration and login
- JWT-based authentication
- Role-based authorization
- Customer, Hotel Manager, and Administrator roles
- Profile management
- Change password
- Forgot password and reset password
- Secure password hashing using BCrypt

### 🏨 Hotel Management

Hotel Managers can:

- Create hotel listings
- Update hotel information
- Delete hotels
- Manage hotel amenities
- Add hotel images
- Configure hotel policies
- Manage hotel listing status
- View hotels belonging to their account

### 🛏️ Room Management

Hotel Managers can:

- Add rooms to hotels
- Update room details
- Manage room capacity
- Configure price per night
- Manage room availability
- Add room amenities and images

### 🔍 Hotel Search & Discovery

Customers can search hotels using:

- Destination / city
- Hotel name
- Check-in date
- Check-out date
- Number of guests
- Minimum and maximum price
- Minimum rating
- Amenities
- Room availability

The system checks existing reservations to prevent unavailable rooms from appearing for overlapping travel dates.

### 📅 Booking Management

Customers can:

- Select available rooms
- Create hotel reservations
- View booking details
- View booking history
- Cancel eligible bookings

The booking system includes:

- Room capacity validation
- Date validation
- Overlapping booking prevention
- Automatic number-of-nights calculation
- Automatic total-price calculation
- Booking status management

### 💳 Payment Management

StayEase includes a payment workflow with:

- Booking payment records
- Transaction IDs
- Payment methods
- Payment status tracking
- Duplicate payment prevention
- Automatic booking confirmation after successful payment

> Payment processing is currently implemented as a simulated payment workflow for demonstration purposes.

### ⭐ Reviews & Ratings

Customers can:

- Submit hotel reviews
- Provide ratings
- Review hotels after their stay

Reviews help other customers make informed booking decisions.

### 🔔 Notifications

StayEase provides in-app notifications for important events including:

- Booking creation
- Booking cancellation
- Successful payments
- Account and platform activities

Notifications can be marked as read.

### 📧 Email & SMS

The backend supports:

- Email notifications using Spring Mail
- SMS integration using Twilio

Notifications can be triggered for booking and payment activities.

### 📊 Dashboards & Reports

Dedicated dashboards are available for:

**Customers**
- Booking overview
- Booking history
- Payments
- Notifications
- Profile management

**Hotel Managers**
- Hotel management
- Room management
- Property reservations
- Booking insights
- Revenue information

**Administrators**
- Platform overview
- User management
- Hotel monitoring
- Booking monitoring
- Platform statistics

---

## 🛠️ Tech Stack

### Backend

- Java 17
- Spring Boot
- Spring Web / REST APIs
- Spring Security
- JWT Authentication
- Spring Data MongoDB
- Bean Validation
- Maven
- Lombok
- Swagger / OpenAPI

### Database

- MongoDB
- MongoDB Atlas

### Frontend

- React
- TypeScript
- Redux Toolkit
- React Router
- Axios
- Tailwind CSS
- Vite

### Integrations

- Twilio — SMS notifications
- Spring Mail / Gmail SMTP — email notifications

### Testing

- JUnit 5
- Mockito
- Spring Boot Test

### Deployment

- Backend — Render
- Frontend — Vercel / Netlify
- Database — MongoDB Atlas

---

## 🏗️ Project Architecture

```text
StayEase-Hotel-Reservation-Platform/
│
├── backend/
│   ├── src/
│   │   ├── main/java/com/stayease/backend/
│   │   │   ├── config/
│   │   │   ├── controller/
│   │   │   ├── dto/
│   │   │   ├── enums/
│   │   │   ├── exception/
│   │   │   ├── model/
│   │   │   ├── repository/
│   │   │   ├── security/
│   │   │   └── service/
│   │   │
│   │   └── test/java/com/stayease/backend/
│   │
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.ts
│
├── .gitignore
└── README.md
```

---

## 🔐 Security

StayEase uses **Spring Security and JWT** for authentication and authorization.

After successful login, the backend generates a JWT token. Protected API requests include this token in the authorization header.

```text
Authorization: Bearer <JWT_TOKEN>
```

Role-based access is implemented for:

```text
CUSTOMER
HOTEL_MANAGER
ADMIN
```

Passwords are securely hashed using BCrypt before being stored in MongoDB.

---

## 🗄️ Database

StayEase uses **MongoDB Atlas** as the production database.

Major collections include:

```text
users
hotels
rooms
bookings
payments
reviews
notifications
password_reset_tokens
```

Relationships between entities are maintained using document IDs such as:

```text
userId
hotelId
roomId
bookingId
managerId
```

---

## 🔄 Booking Workflow

```text
Search Hotel
     ↓
Select Hotel
     ↓
View Available Rooms
     ↓
Select Room
     ↓
Create Booking
     ↓
Booking Status: PENDING
     ↓
Complete Payment
     ↓
Payment Status: SUCCESS
     ↓
Booking Status: CONFIRMED
     ↓
Email / SMS / In-App Notification
```

---

## 🧪 Testing

StayEase contains unit tests for important business logic.

Current test coverage includes:

### Authentication

- User registration
- User login

### Booking

- Successful booking creation
- Room availability validation
- Guest capacity validation
- Overlapping booking prevention
- Booking cancellation
- Booking ownership validation

### Payment

- Successful payment
- Duplicate payment prevention
- Cancelled-booking payment prevention
- Booking ownership validation
- Payment retrieval
- Payment-not-found handling

### Hotel

- Hotel creation
- Hotel retrieval
- Manager hotel retrieval
- Hotel update
- Hotel deletion
- Manager role validation
- Hotel ownership validation

Run backend tests with:

```bash
./mvnw test
```

On Windows:

```powershell
.\mvnw.cmd test
```

---

## ⚙️ Environment Variables

Sensitive credentials are **not stored in the repository**.

The backend expects the following environment variables:

```text
MONGODB_URI
JWT_SECRET
JWT_EXPIRATION
FRONTEND_URL

MAIL_USERNAME
MAIL_PASSWORD

TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER
```

Example Spring configuration:

```properties
spring.data.mongodb.uri=${MONGODB_URI}

jwt.secret=${JWT_SECRET}
jwt.expiration=${JWT_EXPIRATION:86400000}

app.frontend.url=${FRONTEND_URL:http://localhost:5174}

spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}

twilio.account-sid=${TWILIO_ACCOUNT_SID}
twilio.auth-token=${TWILIO_AUTH_TOKEN}
twilio.phone-number=${TWILIO_PHONE_NUMBER}
```

> Never commit production passwords, JWT secrets, MongoDB credentials, Gmail App Passwords, or Twilio credentials to GitHub.

---

## 💻 Running the Backend Locally

### Prerequisites

Make sure the following are installed:

- Java 17+
- Maven or Maven Wrapper
- MongoDB / MongoDB Atlas access

Navigate to:

```bash
cd backend
```

Run:

### Windows

```powershell
.\mvnw.cmd spring-boot:run
```

### macOS / Linux

```bash
./mvnw spring-boot:run
```

The backend runs by default at:

```text
http://localhost:8080
```

---

## 🎨 Running the Frontend Locally

Navigate to:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The Vite frontend will start on the local development URL displayed in the terminal.

---

## 📖 API Documentation

Swagger / OpenAPI is integrated into the backend.

After starting the backend locally, Swagger UI is available at:

```text
http://localhost:8080/swagger-ui/index.html
```

Swagger can be used to explore and test the StayEase REST APIs.

---

## 🌐 Deployment

### Backend

The Spring Boot backend is deployed using **Render**.

Production configuration is supplied through Render environment variables.

**Backend URL:**

```text
Coming soon
```

### Frontend

The React frontend is deployed using **Vercel / Netlify**.

**Frontend URL:**

```text
Coming soon
```

### Database

Production data is hosted on **MongoDB Atlas**.

---

## 📌 API Modules

The REST API is organized into modules for:

```text
/api/auth
/api/users
/api/hotels
/api/rooms
/api/bookings
/api/payments
/api/reviews
/api/notifications
/api/admin
```

---

## 🔮 Future Improvements

Potential improvements include:

- Integration with a real payment gateway such as Stripe
- Hotel map integration
- Advanced hotel recommendations
- Wishlist / favourite hotels
- Refresh-token authentication
- Enhanced email templates
- Additional reporting and analytics
- CI/CD pipeline
- Containerized deployment
- Cloud image optimization

---

## 👩‍💻 Author

**Shalini Manoharan**

Full-Stack / Java Backend Developer

Technologies: Java, Spring Boot, React, TypeScript, MongoDB, REST APIs, JWT, Docker, AWS and AI-assisted development.

GitHub: Shalini-mano

---

## 📄 Project Purpose

StayEase was developed as a full-stack software development project to demonstrate practical experience in:

- REST API design
- Backend architecture
- Authentication and authorization
- Database design
- Business-rule implementation
- React frontend development
- Third-party service integration
- Unit testing
- Cloud database configuration
- Full-stack deployment

---

⭐ If you find this project useful, feel free to star the repository.
