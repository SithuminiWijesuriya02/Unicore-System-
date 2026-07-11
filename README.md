# UniCore-System

Professional Smart Campus Operations Hub for university facilities, bookings, maintenance tickets, notifications, and role-based access control.


## Stack

- Frontend: React, Vite, React Router
- Backend: Spring Boot 3, Spring Security, Spring Data JPA
- Database: MySQL 8
- Auth: JWT with role-based authorization
- Testing: Maven test, Postman collection
- CI: GitHub Actions

## Modules and Member Ownership

- Member 1: Facilities & Assets Catalogue
- Member 2: Booking Management
- Member 3: Maintenance Tickets, Notifications, Authentication & RBAC

## Features

- Facilities and assets CRUD with filtering and status control
- Booking requests with overlap prevention and admin approval workflow
- Ticket lifecycle with comments and secure image uploads
- Notifications for booking and ticket updates
- JWT authentication with `USER`, `ADMIN`, and `TECHNICIAN` roles
- Responsive dashboard UI with sidebar and top navigation


## CI

GitHub Actions builds:

- `Unicore-System/backend` with Maven
- `Unicore-System/frontend` with Vite

