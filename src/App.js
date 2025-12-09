import React, { useState, useEffect } from 'react';

// ============================================
// DATA TYPES SECTION
// ============================================
// Data Types are fundamental building blocks in programming that define what kind of value a variable can hold.
// 
// Key Data Types Used in This Application:
// 
// 1. NUMBERS (Integer & Float):
//    - Integers: Whole numbers without decimals (e.g., account ID: 101, reading: 231)
//    - Floats: Decimal numbers (e.g., price: 0.15, balance: 44.65)
//    - Used for: calculations, IDs, monetary values, meter readings
//
// 2. STRINGS (Text):
//    - Sequence of characters enclosed in quotes (e.g., 'John Doe', 'Electricity')
//    - Used for: names, service types, messages, dates
//
// 3. BOOLEANS (True/False):
//    - Logical values: true or false
//    - Used for: modal open/close state, form validation, conditional rendering
//
// 4. OBJECTS (Key-Value Pairs):
//    - Collections of related data (e.g., {id: 101, name: 'John', balance: 44.65})
//    - Used for: customer accounts, form data, configuration settings
//
// 5. ARRAYS (Lists):
//    - Ordered collections of values (e.g., [account1, account2, account3])
//    - Used for: storing multiple customer accounts, transaction history
//
// 6. NULL/UNDEFINED:
//    - Represents absence of value
//    - Used for: initializing empty states, indicating no data selected

// Configuration Object (Data Type: OBJECT)
// Contains nested objects with NUMBER (price, serviceCharge) and STRING (unit) values
const RATES = {
  Electricity: { unit: 'kWh', price: 0.15, serviceCharge: 10.00 },  // Numbers: float values for pricing
  Water: { unit: 'cu.m', price: 1.25, serviceCharge: 5.00 },        // Strings: unit of measurement
  Internet: { unit: 'GB', price: 2.00, serviceCharge: 20.00 }
};

// Constant Variable (Data Type: NUMBER - Integer)
const ITEMS_PER_PAGE = 5;

// ============================================
// BASIC CONSTRUCT: React Component Structure
// ============================================
// This application uses React (JavaScript library) with JSX syntax
// 
// Program Structure Hierarchy:
// 1. IMPORTS: External libraries and dependencies
// 2. CONSTANTS: Fixed configuration values
// 3. COMPONENTS: Reusable UI building blocks (Functions that return JSX)
// 4. STATE MANAGEMENT: Dynamic data that changes over time
// 5. FUNCTIONS/HANDLERS: Business logic and event handling
// 6. RENDER/RETURN: JSX markup that displays the UI
//
// React Component = Function + State + JSX
// JSX = JavaScript XML (HTML-like syntax in JavaScript)

// Sub-Component: Generic Modal (Data Type: FUNCTION returning JSX)
// Parameters use OBJECT destructuring: {isOpen, title, children, onClose, actions}
// isOpen is a BOOLEAN, title is a STRING, children is JSX, onClose is a FUNCTION
const Modal = ({ isOpen, title, children, onClose, actions }) => {
  // CONTROL STRUCTURE: Early return (if statement)
  // If modal is not open (boolean false), don't render anything
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-[1000] animate-[fadeIn_0.2s]">
      <div className="bg-white p-10 rounded-2xl w-[90%] max-w-md text-center shadow-2xl border border-gray-100 animate-[slideUp_0.2s]">
        <h3 className="mt-0 text-2xl font-bold text-primary mb-4">{title}</h3>
        <div className="text-gray-600 my-6 text-base">{children}</div>
        <div className="flex justify-center gap-3 mt-6">
          {actions}
          <button className="bg-gray-500 text-white border-none py-3 px-6 rounded-lg cursor-pointer hover:bg-gray-600 transition-all duration-200 font-medium shadow-md hover:shadow-lg" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// INTRODUCTION: Initial Mock Data
// ============================================
// Array of Objects: Each object represents a customer account
// Data Types: NUMBER (id, balance, lastReading), STRING (name, type), ARRAY (history)
const INITIAL_ACCOUNTS = [
  { id: 101, name: 'John Doe', type: 'Electricity', balance: 44.65, lastReading: 231, history: [] },
  { id: 102, name: 'Jane Smith', type: 'Water', balance: 45.50, lastReading: 120, history: [] },
];

// ============================================
// MAIN APPLICATION COMPONENT
// ============================================
function App() {
  // ============================================
  // STATE MANAGEMENT (React Hooks)
  // ============================================
  // useState creates reactive variables that trigger re-renders when changed
  // Syntax: const [value, setValue] = useState(initialValue)
  
  // ARRAY State: Stores all customer accounts
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  
  // STRING State: Tracks which tab is currently active
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard State (Multiple data types)
  const [searchTerm, setSearchTerm] = useState('');           // STRING: User search input
  const [filterType, setFilterType] = useState('All');        // STRING: Service filter selection
  const [currentPage, setCurrentPage] = useState(1);          // NUMBER (Integer): Pagination

  // Forms State (OBJECTS: Store form field values)
  const [regForm, setRegForm] = useState({ name: '', type: 'Electricity' });
  const [readingForm, setReadingForm] = useState({ accountId: '', currentReading: '' });
  const [payForm, setPayForm] = useState({ accountId: '', amount: '' });

  // Print & Modal State
  const [printData, setPrintData] = useState(null);                        // NULL or OBJECT
  const [modalState, setModalState] = useState({ type: null, data: null }); // OBJECT with nullable properties
  const [darkMode, setDarkMode] = useState(false);                         // BOOLEAN: Dark mode toggle

  // ============================================
  // CONTROL STRUCTURES: Helper Functions
  // ============================================
  
  // Helper: Close Modal (Updates state to hide modal)
  const closeModal = () => setModalState({ type: null, data: null });

  // Helper: Trigger Print (Sets print data and calls browser print after delay)
  const triggerPrint = (data) => {
    setPrintData(data);
    setTimeout(() => { window.print(); }, 100);  // Async operation with 100ms delay
  };

  // ============================================
  // CONTROL STRUCTURES: Event Handler Functions
  // ============================================
  
  // Handler: Registration (Auto-Increment ID)
  // Demonstrates: CONDITIONAL (if-else), ARRAY methods, OBJECT creation
  const registerCustomer = (e) => {
    e.preventDefault();  // Prevent form default submission behavior
    
    // CONTROL STRUCTURE: Ternary Operator (shorthand if-else)
    // Syntax: condition ? valueIfTrue : valueIfFalse
    // Logic: Find highest ID and add 1, or use 101 if no accounts exist
    const nextId = accounts.length > 0 ? Math.max(...accounts.map(acc => acc.id)) + 1 : 101;

    // Create new account OBJECT with multiple data types
    const newAccount = {
      id: nextId,              // NUMBER (Integer)
      name: regForm.name,      // STRING
      type: regForm.type,      // STRING
      balance: 0.00,           // NUMBER (Float)
      lastReading: 0,          // NUMBER (Integer)
      history: []              // ARRAY (empty initially)
    };
    
    // Update state: Add new account to ARRAY using spread operator
    setAccounts([...accounts, newAccount]);
    
    // Reset form to initial values (OBJECT)
    setRegForm({ name: '', type: 'Electricity' });
    
    // Show success modal with account data (OBJECT)
    setModalState({ 
      type: 'REGISTER_SUCCESS', 
      data: { id: newAccount.id, name: newAccount.name } 
    });
  };

  // ============================================
  // CONTROL STRUCTURES: Bill Generation Handler
  // ============================================
  // Demonstrates: IF-ELSE decisions, mathematical operations, ARRAY manipulation
  const generateBill = (e) => {
    e.preventDefault();
    
    // Parse form values to appropriate data types
    const accId = parseInt(readingForm.accountId);          // STRING to NUMBER (Integer)
    const reading = parseFloat(readingForm.currentReading); // STRING to NUMBER (Float)
    
    // Find account index in ARRAY (-1 if not found)
    const accountIndex = accounts.findIndex(a => a.id === accId);
    
    // CONTROL STRUCTURE: Early return if account not found
    if (accountIndex === -1) return;
    
    const account = accounts[accountIndex];  // Get account OBJECT from ARRAY
    
    // CONTROL STRUCTURE: IF statement for validation
    // Decision: Check if new reading is valid (not less than previous)
    if (reading < account.lastReading) {
      setModalState({ type: 'ERROR', data: { msg: "New reading cannot be lower than previous." }});
      return;  // Exit function early
    }

    // Calculation Logic (NUMBER arithmetic operations)
    const usage = reading - account.lastReading;        // Subtraction
    const rateInfo = RATES[account.type];               // Access OBJECT property
    const usageCost = usage * rateInfo.price;           // Multiplication
    const totalBill = usageCost + rateInfo.serviceCharge; // Addition

    // Create history entry OBJECT
    const newHistoryItem = {
      date: new Date().toLocaleDateString(),  // STRING (formatted date)
      type: 'BILL',                           // STRING (transaction type)
      desc: `Usage: ${usage} ${rateInfo.unit}`, // STRING (template literal)
      amount: totalBill                       // NUMBER (Float)
    };

    // ARRAY manipulation: Create copy, update specific item
    const updatedAccounts = [...accounts];  // Spread operator creates shallow copy
    updatedAccounts[accountIndex] = {
      ...account,                           // Copy existing properties
      lastReading: reading,                 // Update reading
      balance: account.balance + totalBill, // Calculate new balance
      history: [newHistoryItem, ...account.history] // Add to history ARRAY
    };

    setAccounts(updatedAccounts);
    setReadingForm({ accountId: '', currentReading: '' }); // Reset form

    setModalState({
      type: 'BILL_SUCCESS',
      data: { amount: totalBill, account: updatedAccounts[accountIndex] }
    });
  };

  // Handler: Process Payment 
  const processPayment = (e) => {
    e.preventDefault();
    const accId = parseInt(payForm.accountId);
    const amount = parseFloat(payForm.amount);

    const accountIndex = accounts.findIndex(a => a.id === accId);
    if (accountIndex === -1) return;

    const updatedAccounts = [...accounts];
    const account = updatedAccounts[accountIndex];
    const newBalance = account.balance - amount;

    const newHistoryItem = {
      date: new Date().toLocaleDateString(),
      type: 'PAYMENT',
      desc: 'Cash/Online Payment',
      amount: -amount
    };

    updatedAccounts[accountIndex] = {
      ...account,
      balance: newBalance,
      history: [newHistoryItem, ...account.history]
    };

    setAccounts(updatedAccounts);
    setPayForm({ accountId: '', amount: '' });

    setModalState({
      type: 'PAYMENT_SUCCESS',
      data: {
        customer: account.name,
        amountPaid: amount,
        newBalance: newBalance,
        receiptData: { // Pre-package data for receipt
          type: 'RECEIPT',
          customer: account.name,
          accountId: account.id,
          date: new Date().toLocaleString(),
          amountPaid: amount,
          newBalance: newBalance
        }
      }
    });
  };

  // Handler: Print Statement
  const printStatement = (acc) => {
    triggerPrint({
      type: 'STATEMENT',
      customer: acc.name,
      accountId: acc.id,
      serviceType: acc.type,
      date: new Date().toLocaleDateString(),
      balance: acc.balance,
      lastReading: acc.lastReading,
      unit: RATES[acc.type].unit
    });
  };

  // ============================================
  // CONTROL STRUCTURES: Dashboard Logic
  // ============================================
  // Demonstrates: ARRAY filtering (multiple conditions), mathematical calculations, slicing
  
  // Filter by service type (ARRAY method with ternary operator)
  let processedData = accounts.filter(acc => filterType === 'All' ? true : acc.type === filterType);
  
  // Filter by search term (ARRAY method with OR logic)
  // Searches in both name (STRING) and ID (NUMBER converted to STRING)
  processedData = processedData.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.id.toString().includes(searchTerm)
  );
  
  // Pagination calculations (NUMBER arithmetic)
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);  // Round up division
  
  // ARRAY slicing: Extract subset of data for current page
  const currentData = processedData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,                    // Start index
    (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE    // End index
  );

  // ============================================
  // CONTROL STRUCTURES: Side Effects (useEffect Hook)
  // ============================================
  // Runs code when dependencies change (searchTerm or filterType)
  // Resets pagination to page 1 when user filters or searches
  useEffect(() => { 
    setCurrentPage(1); 
  }, [searchTerm, filterType]);  // Dependency ARRAY

  // ============================================
  // RENDER: JSX Return Statement
  // ============================================
  // JSX combines HTML-like markup with JavaScript expressions
  return (
    <div style={{backgroundColor: darkMode ? '#3a3a3a' : '#f5f5f5', transition: 'all 0.3s', minHeight: '100vh', padding: '20px'}}>
      <div className="max-w-[1000px] mx-auto bg-white min-h-[85vh] shadow-2xl rounded-2xl overflow-hidden border border-gray-100" style={{backgroundColor: darkMode ? '#3a3a3a' : '#ffffff', borderColor: darkMode ? '#4a4a4a' : '#e5e5e5', transition: 'all 0.3s'}}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
        @media print {
          .screen-only { display: none !important; }
          #print-area { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
          body { margin: 10cm; }
          .print-slip { width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #000; font-family: 'Courier New', Courier, monospace; text-align: center; }
          .print-header h2 { margin: 0; font-size: 1.2rem; }
          .print-header p { margin: 5px 0; font-size: 0.8rem; }
          .print-body { text-align: left; margin-top: 20px; }
          .print-body p { margin: 5px 0; font-size: 0.9rem; }
          .dashed { border-top: 1px dashed #000; margin: 10px 0; }
          .total-row { font-weight: bold; font-size: 1.1rem; display: flex; justify-content: space-between; }
          .print-footer { margin-top: 20px; font-size: 0.7rem; color: #555; }
        }
        #print-area { display: none; }
      `}</style>
      
      {/* HIDDEN PRINT AREA */}
      <div id="print-area">
        {printData && (
          <div className="print-slip">
            <div className="print-header">
              <h2>BillEase Utilities</h2>
              <p>123 Main Street, Cityville</p>
              <hr />
              <h3>{printData.type === 'RECEIPT' ? 'OFFICIAL RECEIPT' : 'BILLING STATEMENT'}</h3>
            </div>
            <div className="print-body">
              <p><strong>Date:</strong> {printData.date}</p>
              <p><strong>Customer:</strong> {printData.customer}</p>
              <p><strong>Account ID:</strong> {printData.accountId}</p>
              {printData.type === 'STATEMENT' && (
                <>
                  <p><strong>Service:</strong> {printData.serviceType}</p>
                  <p><strong>Last Reading:</strong> {printData.lastReading} {printData.unit}</p>
                  <hr className="dashed" />
                  <p className="total-row">Total Due: <span>${printData.balance?.toFixed(2)}</span></p>
                </>
              )}
              {printData.type === 'RECEIPT' && (
                <>
                  <hr className="dashed" />
                  <p className="total-row">Amount Paid: <span>${printData.amountPaid?.toFixed(2)}</span></p>
                  <p>Remaining Balance: ${printData.newBalance?.toFixed(2)}</p>
                </>
              )}
            </div>
            <div className="print-footer">
              <hr />
              <p>Thank you for your business!</p>
            </div>
          </div>
        )}
      </div>

      {/* MODALS */}
      <Modal isOpen={modalState.type === 'REGISTER_SUCCESS'} title="Registration Successful" onClose={closeModal}>
        <p>Customer account created.</p>
        <div className="text-xl my-5 text-success">
          <strong>Account ID: {modalState.data?.id}</strong>
        </div>
      </Modal>

      <Modal 
        isOpen={modalState.type === 'BILL_SUCCESS'} 
        title="Bill Generated" 
        onClose={closeModal}
        actions={
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-none py-3 px-6 rounded-lg cursor-pointer text-sm text-gray-800 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-bold shadow-md hover:shadow-lg flex items-center gap-2" onClick={() => { printStatement(modalState.data?.account); closeModal(); }} style={{opacity: 0.7}}>
            <img src="/images/print.png" alt="print" style={{height: '22px', maxWidth: '20px', objectFit: 'contain'}} />
            Print Bill
          </button>
        }
      >
        <p>Calculated Charges:</p>
        {/* FIX: Safe navigation ?. added here */}
        <h2>${modalState.data?.amount?.toFixed(2)}</h2>
      </Modal>

      <Modal 
        isOpen={modalState.type === 'PAYMENT_SUCCESS'} 
        title="Payment Processed" 
        onClose={closeModal}
        actions={
          <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-none py-3 px-6 rounded-lg cursor-pointer text-sm text-gray-800 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-bold shadow-md hover:shadow-lg flex items-center gap-2" onClick={() => { triggerPrint(modalState.data?.receiptData); closeModal(); }} style={{opacity: 0.7}}>
            <img src="/images/print.png" alt="print" style={{height: '22px', maxWidth: '20px', objectFit: 'contain'}} />
            Print Receipt
          </button>
        }
      >
        {/* FIX: Safe navigation ?. added here */}
        <p>Paid: <strong>${modalState.data?.amountPaid?.toFixed(2)}</strong></p>
        <p>New Balance: <strong>${modalState.data?.newBalance?.toFixed(2)}</strong></p>
      </Modal>

      <Modal isOpen={modalState.type === 'ERROR'} title="Action Failed" onClose={closeModal}>
        <p className="text-danger">{modalState.data?.msg}</p>
      </Modal>

      {/* MAIN UI */}
      <div className="screen-only" style={{backgroundColor: darkMode ? '#1B1111' : '#ffffff', color: darkMode ? '#ffffff' : '#000000', transition: 'all 0.3s'}}>
        <header className="bg-gradient-to-r from-[#2c3e50] to-[#34495e] text-white p-8 text-center shadow-lg relative" style={{opacity: darkMode ? 0.8 : 1, backgroundColor: darkMode ? '#1B1111' : undefined}}>
          <button onClick={() => setDarkMode(!darkMode)} className="absolute right-8 top-8 bg-white text-[#2c3e50] border-none py-2 px-4 rounded-lg cursor-pointer font-bold shadow-md hover:shadow-lg transition-all" style={{opacity: 0.9}}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          <div className="flex items-center justify-center gap-4">
            <h1 className="m-0 text-3xl font-bold tracking-wide">BillEase</h1>
            <img src="/images/Header.png" alt="logo" style={{height: '60px'}} />
            <h1 className="m-0 text-3xl font-bold tracking-wide"><span className="font-normal text-[#3498db]">Utility System</span></h1>
          </div>
          <p className="text-sm text-gray-300 mt-2">Modern Billing Management</p>
        </header>

        <nav className="flex bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner">
          <button className={`flex-1 p-5 border-none bg-transparent cursor-pointer text-sm font-bold transition-all duration-300 flex items-center justify-center h-[100px] ${activeTab === 'dashboard' ? 'bg-white text-primary shadow-lg border-t-4 border-t-[#3498db] -mt-1' : 'text-gray-600 hover:bg-white hover:text-primary'}`} style={{gap: '15px'}} onClick={() => setActiveTab('dashboard')}><img src="/images/dashboard.png" alt="dashboard" style={{height: '100px', maxWidth: '60px', objectFit: 'contain'}} /><span>Dashboard</span></button>
          <button className={`flex-1 p-5 border-none bg-transparent cursor-pointer text-sm font-bold transition-all duration-300 flex items-center justify-center h-[100px] ${activeTab === 'register' ? 'bg-white text-primary shadow-lg border-t-4 border-t-[#3498db] -mt-1' : 'text-gray-600 hover:bg-white hover:text-primary'}`} style={{gap: '15px'}} onClick={() => setActiveTab('register')}><img src="/images/register.png" alt="register" style={{height: '100px', maxWidth: '60px', objectFit: 'contain'}} />Register</button>
          <button className={`flex-1 p-5 border-none bg-transparent cursor-pointer text-sm font-bold transition-all duration-300 flex items-center justify-center h-[100px] ${activeTab === 'reading' ? 'bg-white text-primary shadow-lg border-t-4 border-t-[#3498db] -mt-1' : 'text-gray-600 hover:bg-white hover:text-primary'}`} style={{gap: '15px'}} onClick={() => setActiveTab('reading')}><img src="/images/meter.png" alt="meter" style={{height: '100px', maxWidth: '60px', objectFit: 'contain'}} />Meter Reading</button>
          <button className={`flex-1 p-5 border-none bg-transparent cursor-pointer text-sm font-bold transition-all duration-300 flex items-center justify-center h-[100px] ${activeTab === 'payment' ? 'bg-white text-primary shadow-lg border-t-4 border-t-[#3498db] -mt-1' : 'text-gray-600 hover:bg-white hover:text-primary'}`} style={{gap: '15px'}} onClick={() => setActiveTab('payment')}><img src="/images/payment.png" alt="payment" style={{height: '100px', maxWidth: '60px', objectFit: 'contain'}} />Pay Bill</button>
        </nav>

        <div className="p-8" style={{backgroundColor: darkMode ? '#1B1111' : '#ffffff', color: darkMode ? '#ffffff' : '#000000', transition: 'all 0.3s'}}>
          {/* CONTROL STRUCTURE: Conditional Rendering (&&) */}
          {/* Shows dashboard content ONLY when activeTab === 'dashboard' (BOOLEAN comparison) */}
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-1" style={{height: '120px'}}>
                <img src="/images/dashboard.png" alt="accounts" style={{height: '200px', objectFit: 'contain'}} />
                <h2 className="text-primary text-2xl font-bold m-0" style={{color: darkMode ? '#ffffff' : undefined}}>Account Masterlist</h2>
              </div>
              <div className="flex gap-3 mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl shadow-sm border border-blue-100">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-[2] py-2 px-3 border border-[#ddd] rounded" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="flex-1 py-2 px-3 border border-[#ddd] rounded cursor-pointer">
                  <option value="All">All Services</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Internet">Internet</option>
                </select>
              </div>

              <table className="w-full border-collapse mt-4 shadow-md rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-gradient-to-r from-[#2c3e50] to-[#34495e]">
                    <th className="p-4 text-left text-white font-bold text-sm"><img src="/images/id.png" alt="id" style={{height: '60px', maxWidth: '30px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain'}} />Acct ID</th>
                    <th className="p-4 text-left text-white font-bold text-sm"><img src="/images/register.png" alt="customer" style={{height: '60px', maxWidth: '30px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain'}} />Customer</th>
                    <th className="p-4 text-left text-white font-bold text-sm"><img src="/images/type.png" alt="type" style={{height: '60px', maxWidth: '30px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain'}} />Type</th>
                    <th className="p-4 text-left text-white font-bold text-sm"><img src="/images/balance.png" alt="balance" style={{height: '60px', maxWidth: '30px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain'}} />Balance</th>
                    <th className="p-4 text-left text-white font-bold text-sm"><img src="/images/read.png" alt="reading" style={{height: '60px', maxWidth: '30px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain'}} />Last Reading</th>
                    <th className="p-4 text-left text-white font-bold tsext-sm"><img src="/images/action.png" alt="action" style={{height: '60px', maxWidth: '30px', marginRight: '8px', display: 'inline-block', verticalAlign: 'middle', objectFit: 'contain'}} />Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {/* CONTROL STRUCTURE: LOOPING with .map() */}
                  {/* Iterates through ARRAY and creates table row for each account */}
                  {/* Similar to FOR loop: for each account in currentData, render <tr> */}
                  {currentData.map(acc => (
                    <tr key={acc.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 border-b border-gray-100">
                      <td className="p-4 text-left font-semibold text-gray-700">{acc.id}</td>
                      <td className="p-4 text-left font-medium text-gray-800">{acc.name}</td>
                      <td className="p-4 text-left"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{acc.type}</span></td>
                      
                      {/* CONTROL STRUCTURE: Inline conditional (ternary) for dynamic styling */}
                      {/* If balance > 0 (debt), show red; else (credit/paid), show green */}
                      <td className="p-4 text-left font-bold text-lg" style={{ color: acc.balance > 0 ? '#e74c3c' : '#27ae60' }}>
                        ${acc.balance?.toFixed(2)}
                      </td>
                      
                      <td className="p-4 text-left"><strong className="text-gray-800">{acc.lastReading}</strong> <small className="text-gray-500">{RATES[acc.type].unit}</small></td>
                      <td className="p-4 text-left">
                        <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-none py-2 px-4 rounded-lg cursor-pointer text-xs text-gray-800 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2" onClick={() => printStatement(acc)} style={{opacity: 0.7}}><img src="/images/print.png" alt="print" style={{height: '22px', maxWidth: '20px', objectFit: 'contain'}} />Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* CONTROL STRUCTURE: Conditional rendering with && */}
              {/* Shows pagination ONLY when there are multiple pages (BOOLEAN: totalPages > 1) */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t-2 border-gray-200">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="py-3 px-6 bg-white border-2 border-gray-300 rounded-lg cursor-pointer text-primary font-semibold transition-all duration-200 hover:bg-[#3498db] hover:text-white hover:border-[#3498db] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 shadow-md hover:shadow-lg">&laquo; Prev</button>
                  <span className="font-bold text-gray-700 text-lg px-4">Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="py-3 px-6 bg-white border-2 border-gray-300 rounded-lg cursor-pointer text-primary font-semibold transition-all duration-200 hover:bg-[#3498db] hover:text-white hover:border-[#3498db] disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 shadow-md hover:shadow-lg">Next &raquo;</button>
                </div>
              )}
            </div>
          )}

          {/* CONTROL STRUCTURE: Multiple conditional sections (similar to SWITCH statement) */}
          {/* Each tab shows different content based on activeTab STRING value */}
          
          {activeTab === 'register' && (
             <form className="max-w-[550px] mx-auto p-10 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl" onSubmit={registerCustomer} style={{backgroundColor: darkMode ? '#2a2a2a' : undefined, borderColor: darkMode ? '#444444' : undefined, color: darkMode ? '#ffffff' : '#000000'}}>
              <h2 className="mt-0 text-primary text-2xl font-bold border-b-2 border-b-blue-200 pb-4 mb-6 flex items-center gap-3" style={{color: darkMode ? '#ffffff' : undefined, borderColor: darkMode ? '#444444' : undefined}}><img src="/images/register.png" alt="register" style={{height: '50px', maxWidth: '40px', marginRight: '8px', objectFit: 'contain'}} />Customer Registration</h2>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm">Customer Name</label><input required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" placeholder="Enter customer name" />
              <label className="block my-4 mb-1.5 font-bold text-[#555]">Service Type</label>
              <select value={regForm.type} onChange={e => setRegForm({...regForm, type: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border">
                <option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Internet">Internet</option>
              </select>
              <button type="submit" className="w-full mt-5 p-3 bg-primary text-white border-none rounded cursor-pointer text-base">Create Account</button>
            </form>
          )}

          {activeTab === 'reading' && (
             <form className="max-w-[550px] mx-auto p-10 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl" onSubmit={generateBill} style={{backgroundColor: darkMode ? '#2a2a2a' : undefined, borderColor: darkMode ? '#444444' : undefined, color: darkMode ? '#ffffff' : '#000000'}}>
              <h2 className="mt-0 text-primary text-2xl font-bold border-b-2 border-b-blue-200 pb-4 mb-6 flex items-center gap-3" style={{color: darkMode ? '#ffffff' : undefined, borderColor: darkMode ? '#444444' : undefined}}><img src="/images/meter.png" alt="meter" style={{height: '50px', maxWidth: '40px', objectFit: 'contain'}} />Input Usage</h2>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm">Select Account</label>
              <select required value={readingForm.accountId} onChange={e => setReadingForm({...readingForm, accountId: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium bg-white transition-all cursor-pointer">
                <option value="">-- Select Customer --</option>
                
                {/* CONTROL STRUCTURE: LOOPING - Generate dropdown options from ARRAY */}
                {/* .map() iterates through accounts ARRAY and creates <option> for each */}
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
              </select>
              
              {/* CONTROL STRUCTURE: Conditional rendering with && */}
              {/* Shows previous reading ONLY when account is selected (readingForm.accountId is truthy) */}
              {readingForm.accountId && (
                 <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 text-emerald-700 py-4 px-5 rounded-xl my-6 flex justify-between items-center text-sm font-medium shadow-sm">
                   {/* IIFE (Immediately Invoked Function Expression) for complex logic in JSX */}
                   {(() => {
                     // Find selected account from ARRAY
                     const selectedAcc = accounts.find(a => a.id.toString() === readingForm.accountId.toString());
                     
                     // CONTROL STRUCTURE: Ternary operator for conditional rendering
                     // If account found, show reading; else show nothing (null)
                     return selectedAcc ? <><span>Previous Reading:</span><strong>{selectedAcc.lastReading} {RATES[selectedAcc.type].unit}</strong></> : null;
                   })()}
                 </div>
              )}
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm">New Meter Reading</label><input required type="number" value={readingForm.currentReading} onChange={e => setReadingForm({...readingForm, currentReading: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" placeholder="Enter meter reading" />
              <button type="submit" className="w-full mt-8 p-4 bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white border-none rounded-lg cursor-pointer text-base font-bold hover:from-[#2980b9] hover:to-[#3498db] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" style={{opacity: 0.8}}><img src="/images/bill.png" alt="bill" style={{height: '24px'}} />Generate Bill</button>
            </form>
          )}

          {activeTab === 'payment' && (
             <form className="max-w-[550px] mx-auto p-10 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl" onSubmit={processPayment} style={{backgroundColor: darkMode ? '#2a2a2a' : undefined, borderColor: darkMode ? '#444444' : undefined, color: darkMode ? '#ffffff' : '#000000'}}>
              <h2 className="mt-0 text-primary text-2xl font-bold border-b-2 border-b-blue-200 pb-4 mb-6 flex items-center gap-3" style={{color: darkMode ? '#ffffff' : undefined, borderColor: darkMode ? '#444444' : undefined}}><img src="/images/payment.png" alt="payment" style={{height: '50px', maxWidth: '40px', objectFit: 'contain'}} />Payment Processing</h2>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm">Select Account</label>
              <select required value={payForm.accountId} onChange={e => setPayForm({...payForm, accountId: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium bg-white transition-all cursor-pointer">
                <option value="">-- Select Customer --</option>
                
                {/* CONTROL STRUCTURE: Chained ARRAY methods (filter + map) */}
                {/* 1. .filter() - Only show accounts with balance > 0 (have outstanding bills) */}
                {/* 2. .map() - Create dropdown option for each filtered account */}
                {accounts.filter(a => a.balance > 0).map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Due: ${acc.balance?.toFixed(2)})</option>)}
              </select>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm">Payment Amount ($)</label><input required type="number" step="0.01" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" placeholder="Enter payment amount" />
              <button type="submit" className="w-full mt-8 p-4 bg-gradient-to-r from-[#27ae60] to-[#229954] text-white border-none rounded-lg cursor-pointer text-base font-bold hover:from-[#229954] hover:to-[#27ae60] transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2" style={{opacity: 0.7}}><img src="/images/process-payment.png" alt="payment" style={{height: '24px'}} />Process Payment</button>
            </form>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;