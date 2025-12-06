import tkinter as tk
from tkinter import ttk, messagebox
import os
import datetime

# --- Configuration ---
RATES = {
    'Electricity': {'unit': 'kWh', 'price': 0.15, 'serviceCharge': 10.00},
    'Water': {'unit': 'cu.m', 'price': 1.25, 'serviceCharge': 5.00},
    'Internet': {'unit': 'GB', 'price': 2.00, 'serviceCharge': 20.00}
}

class Account:
    """Class to represent the data structure of an account."""
    def __init__(self, acc_id, name, acc_type, balance=0.0, last_reading=0):
        self.id = acc_id
        self.name = name
        self.type = acc_type
        self.balance = balance
        self.last_reading = last_reading
        self.history = []

class BillEaseApp:
    def __init__(self, root):
        self.root = root
        self.root.title("BillEase Utility System (Python Edition)")
        self.root.geometry("900x650")
        
        # Ensure receipts directory exists
        if not os.path.exists("receipts"):
            os.makedirs("receipts")

        # --- Initial Mock Data ---
        self.accounts = [
            Account(101, 'John Doe', 'Electricity', 44.65, 231),
            Account(102, 'Jane Smith', 'Water', 45.50, 120)
        ]

        # --- State Variables ---
        self.search_var = tk.StringVar()
        self.filter_var = tk.StringVar(value="All")
        
        # --- UI Setup ---
        self.style = ttk.Style()
        self.style.theme_use('clam') 
        self.setup_styles()
        
        self.create_layout()

    def setup_styles(self):
        self.style.configure("TFrame", background="#f4f7f6")
        self.style.configure("TLabel", background="#f4f7f6", font=("Segoe UI", 10))
        self.style.configure("Header.TLabel", font=("Segoe UI", 18, "bold"), foreground="#2c3e50")
        self.style.configure("Card.TFrame", background="white", relief="raised")
        self.style.configure("TButton", padding=6, font=("Segoe UI", 10))
        self.style.map("TButton", background=[("active", "#3498db")])

    def create_layout(self):
        # Header
        header_frame = tk.Frame(self.root, bg="#2c3e50", pady=15)
        header_frame.pack(fill="x")
        tk.Label(header_frame, text="BillEase Utility System", font=("Segoe UI", 20, "bold"), bg="#2c3e50", fg="white").pack()

        # Tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(expand=True, fill="both", padx=10, pady=10)

        # Tab 1: Dashboard
        self.tab_dashboard = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_dashboard, text="Dashboard")
        self.build_dashboard(self.tab_dashboard)

        # Tab 2: Registration
        self.tab_register = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_register, text="1. Register")
        self.build_register(self.tab_register)

        # Tab 3: Reading
        self.tab_reading = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_reading, text="2. Meter Reading")
        self.build_reading(self.tab_reading)

        # Tab 4: Payment
        self.tab_payment = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_payment, text="3. Pay Bill")
        self.build_payment(self.tab_payment)

        # FIX: Only update dropdowns after ALL tabs are built
        self.update_account_dropdowns()

    # ================= DASHBOARD TAB =================
    def build_dashboard(self, parent):
        controls_frame = tk.Frame(parent, bg="#f8f9fa", pady=10)
        controls_frame.pack(fill="x", padx=10, pady=5)

        tk.Label(controls_frame, text="Search:", bg="#f8f9fa").pack(side="left", padx=5)
        tk.Entry(controls_frame, textvariable=self.search_var).pack(side="left", padx=5, fill="x", expand=True)
        
        tk.Label(controls_frame, text="Filter:", bg="#f8f9fa").pack(side="left", padx=5)
        filter_cb = ttk.Combobox(controls_frame, textvariable=self.filter_var, values=["All", "Electricity", "Water", "Internet"], state="readonly")
        filter_cb.pack(side="left", padx=5)
        
        # FIX: Updated from .trace to .trace_add for newer Python versions
        self.search_var.trace_add("write", self.refresh_dashboard)
        filter_cb.bind("<<ComboboxSelected>>", self.refresh_dashboard)

        columns = ("id", "name", "type", "balance", "last_reading")
        self.tree = ttk.Treeview(parent, columns=columns, show="headings")
        self.tree.heading("id", text="Acct ID")
        self.tree.heading("name", text="Customer")
        self.tree.heading("type", text="Type")
        self.tree.heading("balance", text="Balance")
        self.tree.heading("last_reading", text="Last Reading")
        
        self.tree.column("id", width=80, anchor="center")
        self.tree.column("balance", width=100, anchor="e")
        self.tree.pack(fill="both", expand=True, padx=10, pady=10)
        self.tree.bind("<Double-1>", self.on_dashboard_click)

        self.refresh_dashboard()

    def refresh_dashboard(self, *args):
        for item in self.tree.get_children():
            self.tree.delete(item)

        search_term = self.search_var.get().lower()
        filter_type = self.filter_var.get()

        for acc in self.accounts:
            type_match = (filter_type == "All") or (acc.type == filter_type)
            search_match = (search_term in acc.name.lower()) or (search_term in str(acc.id))
            
            if type_match and search_match:
                unit = RATES[acc.type]['unit']
                self.tree.insert("", "end", values=(
                    acc.id, acc.name, acc.type, f"${acc.balance:.2f}", f"{acc.last_reading} {unit}"
                ))

    def on_dashboard_click(self, event):
        selection = self.tree.selection()
        if not selection: return
        item_id = selection[0]
        vals = self.tree.item(item_id)['values']
        acc_id = vals[0]
        account = next((a for a in self.accounts if a.id == acc_id), None)
        if account:
            self.print_slip("STATEMENT", account)

    # ================= REGISTER TAB =================
    def build_register(self, parent):
        frame = ttk.Frame(parent, style="Card.TFrame", padding=20)
        frame.pack(pady=20)

        ttk.Label(frame, text="Customer Registration", style="Header.TLabel", background="white").pack(pady=(0, 20))
        ttk.Label(frame, text="Customer Name:", background="white").pack(anchor="w")
        self.reg_name_entry = ttk.Entry(frame, width=40)
        self.reg_name_entry.pack(pady=5)

        ttk.Label(frame, text="Service Type:", background="white").pack(anchor="w")
        self.reg_type_cb = ttk.Combobox(frame, values=["Electricity", "Water", "Internet"], state="readonly", width=37)
        self.reg_type_cb.current(0)
        self.reg_type_cb.pack(pady=5)

        ttk.Button(frame, text="Create Account", command=self.handle_register).pack(pady=20, fill="x")

    def handle_register(self):
        name = self.reg_name_entry.get()
        acc_type = self.reg_type_cb.get()

        if not name:
            messagebox.showerror("Error", "Name is required")
            return

        next_id = max([a.id for a in self.accounts]) + 1 if self.accounts else 101
        new_acc = Account(next_id, name, acc_type)
        self.accounts.append(new_acc)
        
        messagebox.showinfo("Success", f"Account Created!\nID: {next_id}\nName: {name}")
        self.reg_name_entry.delete(0, 'end')
        self.refresh_dashboard()
        self.update_account_dropdowns()

    # ================= READING TAB =================
    def build_reading(self, parent):
        frame = ttk.Frame(parent, style="Card.TFrame", padding=20)
        frame.pack(pady=20)

        ttk.Label(frame, text="Input Usage", style="Header.TLabel", background="white").pack(pady=(0, 20))
        ttk.Label(frame, text="Select Account:", background="white").pack(anchor="w")
        
        self.read_acc_var = tk.StringVar()
        self.read_acc_cb = ttk.Combobox(frame, textvariable=self.read_acc_var, state="readonly", width=37)
        self.read_acc_cb.pack(pady=5)
        self.read_acc_cb.bind("<<ComboboxSelected>>", self.show_prev_reading)

        self.prev_reading_lbl = ttk.Label(frame, text="", foreground="#16a085", background="white")
        self.prev_reading_lbl.pack(pady=5)

        ttk.Label(frame, text="New Meter Reading:", background="white").pack(anchor="w")
        self.read_val_entry = ttk.Entry(frame, width=40)
        self.read_val_entry.pack(pady=5)

        ttk.Button(frame, text="Generate Bill", command=self.handle_generate_bill).pack(pady=20, fill="x")
        # Removed premature call to update_account_dropdowns()

    def show_prev_reading(self, event):
        acc = self.get_selected_account(self.read_acc_var.get())
        if acc:
            unit = RATES[acc.type]['unit']
            self.prev_reading_lbl.config(text=f"Previous: {acc.last_reading} {unit}")

    def handle_generate_bill(self):
        acc = self.get_selected_account(self.read_acc_var.get())
        try:
            reading = float(self.read_val_entry.get())
        except ValueError:
            messagebox.showerror("Error", "Invalid reading number")
            return

        if not acc:
            messagebox.showerror("Error", "Select an account")
            return

        if reading < acc.last_reading:
            messagebox.showerror("Error", "New reading cannot be lower than previous.")
            return

        usage = reading - acc.last_reading
        rate_info = RATES[acc.type]
        usage_cost = usage * rate_info['price']
        total_bill = usage_cost + rate_info['serviceCharge']

        acc.last_reading = reading
        acc.balance += total_bill
        acc.history.append({'date': datetime.date.today(), 'type': 'BILL', 'amount': total_bill})

        messagebox.showinfo("Bill Generated", f"Usage: {usage} {rate_info['unit']}\nTotal: ${total_bill:.2f}")
        self.print_slip("STATEMENT", acc, extra={"current_usage": usage, "bill_amt": total_bill})
        
        self.read_val_entry.delete(0, 'end')
        self.refresh_dashboard()

    # ================= PAYMENT TAB =================
    def build_payment(self, parent):
        frame = ttk.Frame(parent, style="Card.TFrame", padding=20)
        frame.pack(pady=20)

        ttk.Label(frame, text="Process Payment", style="Header.TLabel", background="white").pack(pady=(0, 20))
        ttk.Label(frame, text="Select Account (Due > 0):", background="white").pack(anchor="w")
        
        self.pay_acc_var = tk.StringVar()
        self.pay_acc_cb = ttk.Combobox(frame, textvariable=self.pay_acc_var, state="readonly", width=37)
        self.pay_acc_cb.pack(pady=5)

        ttk.Label(frame, text="Payment Amount ($):", background="white").pack(anchor="w")
        self.pay_val_entry = ttk.Entry(frame, width=40)
        self.pay_val_entry.pack(pady=5)

        ttk.Button(frame, text="Process Payment", command=self.handle_payment).pack(pady=20, fill="x")

    def handle_payment(self):
        acc = self.get_selected_account(self.pay_acc_var.get())
        try:
            amount = float(self.pay_val_entry.get())
        except ValueError:
            messagebox.showerror("Error", "Invalid amount")
            return
        if not acc: return

        acc.balance -= amount
        acc.history.append({'date': datetime.date.today(), 'type': 'PAYMENT', 'amount': -amount})

        messagebox.showinfo("Success", f"Payment of ${amount:.2f} accepted.")
        self.print_slip("RECEIPT", acc, extra={"paid": amount})
        
        self.pay_val_entry.delete(0, 'end')
        self.refresh_dashboard()
        self.update_account_dropdowns()

    # ================= HELPERS =================
    def update_account_dropdowns(self):
        # Defensive check: ensure widgets exist before updating
        if not hasattr(self, 'read_acc_cb') or not hasattr(self, 'pay_acc_cb'):
            return

        all_acc_options = [f"{a.id} - {a.name} ({a.type})" for a in self.accounts]
        self.read_acc_cb['values'] = all_acc_options
        
        due_acc_options = [f"{a.id} - {a.name} (Due: ${a.balance:.2f})" for a in self.accounts if a.balance > 0]
        self.pay_acc_cb['values'] = due_acc_options

    def get_selected_account(self, str_val):
        if not str_val: return None
        try:
            acc_id = int(str_val.split(' - ')[0])
            return next((a for a in self.accounts if a.id == acc_id), None)
        except:
            return None

    def print_slip(self, doc_type, acc, extra=None):
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        filename = f"receipts/{doc_type}_{acc.id}_{int(datetime.datetime.now().timestamp())}.txt"
        
        lines = [
            "==================================",
            "       BILLEASE UTILITIES",
            "   123 Main Street, Cityville",
            "==================================",
            f"{doc_type} - {timestamp}",
            "----------------------------------",
            f"Acct ID: {acc.id}",
            f"Name:    {acc.name}",
            f"Type:    {acc.type}",
            "----------------------------------"
        ]
        
        if doc_type == "STATEMENT":
            unit = RATES[acc.type]['unit']
            lines.append(f"Last Reading: {acc.last_reading} {unit}")
            if extra:
                lines.append(f"Usage:        {extra['current_usage']} {unit}")
            lines.append(f"TOTAL DUE:    ${acc.balance:.2f}")
        elif doc_type == "RECEIPT" and extra:
            lines.append(f"Amount Paid:  ${extra['paid']:.2f}")
            lines.append(f"New Balance:  ${acc.balance:.2f}")
            
        lines.append("==================================")
        lines.append("    Thank you for your business!")
        
        content = "\n".join(lines)
        
        with open(filename, "w") as f:
            f.write(content)
            
        top = tk.Toplevel(self.root)
        top.title(f"Printing {doc_type}...")
        top.geometry("300x400")
        
        text_widget = tk.Text(top, font=("Courier New", 10), padx=10, pady=10)
        text_widget.insert("1.0", content)
        text_widget.config(state="disabled")
        text_widget.pack(fill="both", expand=True)

if __name__ == "__main__":
    root = tk.Tk()
    app = BillEaseApp(root)
    root.mainloop()