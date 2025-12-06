# BillEase Utility System (Python Edition)

A desktop GUI application for managing utility billing, meter readings, and payments. This project is a port of a React web application into Python using `tkinter`.

## 📋 Features

- **Dashboard:** View a master list of all customer accounts with search and filtering capabilities (Electricity, Water, Internet).
- **Customer Registration:** Create new accounts with auto-incrementing IDs.
- **Meter Reading:** Input current meter readings to automatically calculate bills based on usage and service type rates.
- **Payment Processing:** Process payments and update account balances in real-time.
- **Receipt System:** Simulates printing by generating text files in a `receipts/` directory and displaying a digital slip popup.

## ⚙️ Configuration & Rates

The system uses the following hardcoded rates (defined in `main.py`):

| Service     | Unit | Price per Unit | Service Charge |
| :---------- | :--- | :------------- | :------------- |
| Electricity | kWh  | $0.15          | $10.00         |
| Water       | cu.m | $1.25          | $5.00          |
| Internet    | GB   | $2.00          | $20.00         |

## 🛠️ Prerequisites

- **Python 3.x** (This application uses `tkinter`, which is included with standard Python installations).

## 🚀 How to Run

1.  **Clone or Download** this project directory.
2.  Open your terminal or command prompt.
3.  Navigate to the project folder:
    ```bash
    cd billease_python
    ```
4.  Run the application:
    ```bash
    python main.py
    ```

## 📂 Project Structure

```text
billease_python/
│
├── main.py            # The primary application logic and UI code
├── README.md          # Project documentation
└── receipts/          # Directory automatically created to store text receipts
    ├── STATEMENT_...  # Generated billing statements
    └── RECEIPT_...    # Generated payment receipts
```
