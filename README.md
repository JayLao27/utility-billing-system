# BillEase: Utility Billing System

**BillEase** is a web-based transaction processing system built with **React.js**. It simulates a real-world utility company workflow, allowing administrators to register customers, input meter readings, generate bills, and process payments with printable receipts.

## 🚀 Features

### 1. Dashboard (Account Masterlist)
* **Real-time Overview:** View all customer accounts, balances, and service types at a glance.
* **Search & Filter:** Instantly find customers by Name/ID or filter by Service Type (Electricity, Water, Internet).
* **Pagination:** Handles large lists by breaking them into pages (5 items per page).
* **Status Indicators:** Visual cues for balances (Green = Paid/Zero, Red = Due).

### 2. Transaction Modules
* **Customer Registration:** Creates new accounts with **auto-incrementing IDs** (e.g., 101, 102).
* **Meter Reading:** * Input current meter reading.
    * System automatically looks up the previous reading.
    * **Auto-Calculation:** Computes `(Current - Previous) * Rate + Service Charge`.
    * Validates that new reading > previous reading.
* **Payment Processing:**
    * Accepts partial or full payments.
    * Updates customer balance immediately.

### 3. Printing System
* **Billing Statement:** Generate a professional invoice from the Dashboard.
* **Official Receipt:** Automatically offers to print a receipt after a successful payment.
* **CSS Print Media Queries:** Hides the web interface and formats a clean, paper-sized slip when printing.

### 4. User Experience
* **Custom Modals:** Replaces default browser alerts with professional popup windows for success/error messages.
* **Safe Data Handling:** Prevents application crashes using optional chaining for data formatting.

---

## 🛠️ Technologies Used
* **Frontend Library:** React.js (Hooks: `useState`, `useEffect`)
* **Styling:** CSS3 (Flexbox, Grid, Print Media Queries, Keyframe Animations)
* **Environment:** Node.js

---

## ⚙️ Installation & Setup

1.  **Prerequisites:** Ensure you have [Node.js](https://nodejs.org/) installed.

2.  **Create the Project:**
    Open your terminal and run:
    ```bash
    npx create-react-app utility-billing
    cd utility-billing
    ```

3.  **Install Dependencies:**
    (This project uses standard React dependencies, so just run standard install)
    ```bash
    npm install
    ```

4.  **Run the Application:**
    ```bash
    npm start
    ```
    The app will open automatically at `http://localhost:3000`.

---

## 📖 Usage Guide

### A. Registering a Customer
1. Go to the **"1. Register"** tab.
2. Enter a Name and select a Service Type.
3. Click **Create Account**.
4. A modal will appear showing the new **Account ID**.

### B. Generating a Bill
1. Go to the **"2. Meter Reading"** tab.
2. Select a customer from the dropdown. *Note: The system will display their Previous Reading.*
3. Enter a **Current Reading** higher than the previous one.
4. Click **Generate Bill**.
5. You can choose to print the Bill immediately or view it later on the Dashboard.

### C. Paying a Bill
1. Go to the **"3. Pay Bill"** tab.
2. Select a customer (only those with a balance > 0 will appear).
3. Enter the payment amount.
4. Click **Process Payment**.
5. A modal will confirm success and offer a **"Print Receipt"** button.

---

## 📂 Project Structure

```text
utility-billing/
├── public/
├── src/
│   ├── App.css       # All styles (Dashboard, Modals, Print Layouts)
│   ├── App.js        # Main Application Logic (State, Transactions)
│   ├── index.js      # Entry point
│   └── ...
├── package.json
└── README.md

Created by yours truly: Mr. Jan Vincent R. Oclarit
Date: December 6, 2025