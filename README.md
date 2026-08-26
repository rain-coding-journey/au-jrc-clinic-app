Here is the complete, clean Markdown file formatted specifically for GitHub rendering (including standard GitHub Markdown badges, syntax highlighting, task lists, and collapsible sections).

You can copy and paste the code directly into your repository's `README.md` file.

```markdown
# 🏥 AU JRC Clinic Management System

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?logo=node.js)
![License](https://img.shields.io/badge/license-MIT-green)

A centralized, real-time clinical intake, pharmacy inventory tracking, and student health records platform built for **Arellano University - Jose Rizal Campus**.

---

## 📋 Table of Contents
- [1. Project Overview](#1-project-overview)
- [2. Tech Stack & Rationale](#2-tech-stack--rationale)
- [3. Core Functions & Technical Rationale](#3-core-functions--technical-rationale)
- [4. Architecture & Data Flow](#4-architecture--data-flow)
- [5. Setup and Installation](#5-setup-and-installation)
- [6. Testing Strategy](#6-testing-strategy)
- [7. Maintenance & Contributing](#7-maintenance--contributing)
- [8. Frequently Asked Questions (FAQ)](#8-frequently-asked-questions-faq)

---

## 1. Project Overview

### Purpose
The **AU JRC Clinic Management System** digitizes campus healthcare management. It replaces manual paper-based logging with an integrated web platform to track student health histories, record vitals, dispense medications with auto-deducting stock management, and alert medical staff to critical health metrics.

### Key Features
* 🔍 **Patient Lookup & Quick Registration:** Instant lookup by Student ID, plus integrated modal registration for unrecorded patients.
* 🩺 **Vital Signs & Clinical Intake Logging:** Rapid entry for body temperature, blood pressure, pulse, respiratory rate, and chief complaint.
* 📦 **Real-Time Pharmacy Inventory:** Automatic stock deduction upon medicine dispensing with visual low-stock warnings.
* ⚠️ **Automated Critical Health Alerts:** Real-time visual banners for high fevers ($\ge 38.5^\circ\text{C}$) and known student drug allergies.
* 📋 **Clinic Activity Queue:** Real-time timeline feed showing today's patient visits, treatments provided, and disposition statuses.

---

## 2. Tech Stack & Rationale

| Layer | Technology | Role & Selection Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=black) **React 18** | High-performance component-based state management that seamlessly syncs patient lookups, intake forms, and real-time inventory counters. |
| **Build Tool** | ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) **Vite** | Delivers lightning-fast Hot Module Replacement (HMR) and optimized frontend bundle builds. |
| **Styling** | ![Tailwind](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) **Tailwind CSS** | Utility-first styling framework enabling a responsive, clean, and accessible UI tailored for medical workflows. |
| **Icons** | **Lucide React** | Lightweight, modern icon library with graceful fallback rendering for uninterrupted UI operation. |
| **Backend Runtime** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) **Node.js / Express** | Asynchronous, event-driven REST API capable of serving multiple concurrent campus clinic workstations. |
| **Database** | ![MySQL](https://img.shields.io/badge/-MySQL-4479A1?logo=mysql&logoColor=white) **MySQL / PostgreSQL** | Relational ACID-compliant persistent storage ensuring foreign key data integrity across patient visits and stock usage. |

---

## 3. Core Functions & Technical Rationale

### 🔹 `handleStudentLookup(e)`
* **Purpose:** Searches database for student records matching the inputted Student ID.
* **Inputs:** `e` (Form Event), `studentNum` (String)
* **Outputs:** Populates active `student` state object or sets `lookupError`.
* **Rationale:** Automatically loads existing student medical profiles and flags critical allergies before medication is selected.

### 🔹 `handleRegisterStudent(e)`
* **Purpose:** Saves a new student profile directly into the clinic directory when an unrecorded student arrives.
* **Inputs:** `e` (Form Event), `newStudentData` (Object)
* **Outputs:** Registers new student and immediately sets them as the active patient.
* **Rationale:** Prevents administrative bottlenecks during emergency clinic visits.

### 🔹 `handleVisitSubmit(e)`
* **Purpose:** Process health intake form, deducts stock from selected medication, triggers high-fever warnings, and prepends record to recent visit timeline.
* **Inputs:** `e` (Form Event), `visitData` (Object), `selected_medication_id` (String)
* **Outputs:** Updated `medications` array, appended `recentVisits` list, optional high-fever `alertBanner`.
* **Rationale:** Enforces an atomic transaction-like workflow where medical logging and pharmacy inventory updates occur simultaneously.

---

## 4. Architecture & Data Flow

```gantt
+-----------------------------------------------------------------------+
|                          CLIENT SIDE (SPA)                            |
|                                                                       |
|   +-----------------------+              +------------------------+   |
|   | Patient Lookup Modal  |              | Vitals & Intake Form   |   |
|   +-----------+-----------+              +-----------+------------+   |
|               |                                      |                |
|               v                                      v                |
|   +---------------------------------------------------------------+   |
|   |                  React Application State                      |   |
|   |   (student, visitData, medications, recentVisits, token)      |   |
|   +-------------------------------+-------------------------------+   |
|                                   |                                   |
+-----------------------------------|-----------------------------------+
                                    | HTTP / REST API (Axios)
                                    v
+-----------------------------------------------------------------------+
|                          BACKEND API SERVER                           |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |                      Express Router                           |   |
|   +-------+-----------------------+-----------------------+-------+   |
|           |                       |                       |           |
|           v                       v                       v           |
|    /api/v1/students        /api/v1/visits          /api/v1/inventory  |
|   (Lookup / Register)     (Intake & Vitals)       (Deduct / Restock)  |
|           |                       |                       |           |
+-----------|-----------------------|-----------------------|-----------+
            |                       |                       |
            +-------------------+   |   +-------------------+
                                |   |   |
                                v   v   v
+-----------------------------------------------------------------------+
|                          DATABASE LAYER                               |
|                                                                       |
|      +-----------------+  1:N  +-----------------+                    |
|      |  Students Table |------<|   Visits Table  |                    |
|      +-----------------+       +--------+--------+                    |
|                                         | N:1                         |
|                                         v                             |
|                                +-----------------+                    |
|                                | Inventory Table |                    |
|                                +-----------------+                    |
+-----------------------------------------------------------------------+

```

---

## 5. Setup and Installation

### Prerequisites

* **Node.js** `v18.0.0` or higher
* **npm** `v9.0.0` or higher
* **MySQL** database (optional for demo fallback mode)

### Quick Start Guide

1. **Clone the repository:**
```bash
git clone [https://github.com/your-username/au-clinic-system.git](https://github.com/your-username/au-clinic-system.git)
cd au-clinic-system

```


2. **Install dependencies:**
```bash
npm install

```


3. **Set up Environment Variables:**
Create a `.env` file in the root directory:
```env
PORT=5000
VITE_API_BASE_URL=http://localhost:5000/api
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=au_clinic_db

```


4. **Launch Development Server:**
```bash
npm run dev

```


Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 6. Testing Strategy

This repository employs a multi-tiered testing strategy:

* **Unit Tests:** Tests individual utility functions and health metric logic (e.g., temperature threshold flags).
* **Component Tests:** Validates isolated UI interactions using React Testing Library.
* **Integration Tests:** Tests full REST API endpoints with an active database connection.

### Commands

```bash
# Run all unit and integration tests
npm run test

# Run tests with coverage reporting
npm run test:coverage

```

---

## 7. Maintenance & Contributing

### Commit Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) format:

* `feat:` A new feature for the user or system.
* `fix:` A bug fix.
* `docs:` Documentation updates.
* `style:` Formatting changes with no production code changes.

### Development Workflow

1. Fork the Repository & Create your Branch (`git checkout -b feature/amazing-feature`)
2. Commit your Changes (`git commit -m 'feat: add allergy warning banner'`)
3. Push to the Branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

---

## 8. Frequently Asked Questions (FAQ)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more details.

```

```