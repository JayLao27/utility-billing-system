import React, { useState, useEffect } from 'react';
import './App.css';

// --- Configuration ---
const RATES = {
  Electricity: { unit: 'kWh', price: 0.15, serviceCharge: 10.00 },
  Water: { unit: 'cu.m', price: 1.25, serviceCharge: 5.00 },
  Internet: { unit: 'GB', price: 2.00, serviceCharge: 20.00 }
};

const ITEMS_PER_PAGE = 5;

// --- Sub-Component: Generic Modal ---
const Modal = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-actions">
          {actions}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// --- Initial Mock Data ---
const INITIAL_ACCOUNTS = [
  { id: 101, name: 'John Doe', type: 'Electricity', balance: 44.65, lastReading: 231, history: [] },
  { id: 102, name: 'Jane Smith', type: 'Water', balance: 45.50, lastReading: 120, history: [] },
];

function App() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // --- Dashboard State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Forms State ---
  const [regForm, setRegForm] = useState({ name: '', type: 'Electricity' });
  const [readingForm, setReadingForm] = useState({ accountId: '', currentReading: '' });
  const [payForm, setPayForm] = useState({ accountId: '', amount: '' });

  // --- Print & Modal State ---
  const [printData, setPrintData] = useState(null);
  const [modalState, setModalState] = useState({ type: null, data: null });

  // --- Helper: Close Modal ---
  const closeModal = () => setModalState({ type: null, data: null });

  // --- Helper: Trigger Print ---
  const triggerPrint = (data) => {
    setPrintData(data);
    setTimeout(() => { window.print(); }, 100);
  };

  // --- Handler: Registration (Auto-Increment ID) ---
  const registerCustomer = (e) => {
    e.preventDefault();
    // Logic: Find highest ID and add 1
    const nextId = accounts.length > 0 ? Math.max(...accounts.map(acc => acc.id)) + 1 : 101;

    const newAccount = {
      id: nextId,
      name: regForm.name,
      type: regForm.type,
      balance: 0.00,
      lastReading: 0,
      history: []
    };
    setAccounts([...accounts, newAccount]);
    setRegForm({ name: '', type: 'Electricity' });
    
    setModalState({ 
      type: 'REGISTER_SUCCESS', 
      data: { id: newAccount.id, name: newAccount.name } 
    });
  };

  // --- Handler: Generate Bill ---
  const generateBill = (e) => {
    e.preventDefault();
    const accId = parseInt(readingForm.accountId);
    const reading = parseFloat(readingForm.currentReading);
    
    const accountIndex = accounts.findIndex(a => a.id === accId);
    if (accountIndex === -1) return;
    const account = accounts[accountIndex];
    
    // Validation
    if (reading < account.lastReading) {
      setModalState({ type: 'ERROR', data: { msg: "New reading cannot be lower than previous." }});
      return;
    }

    // Calculation
    const usage = reading - account.lastReading;
    const rateInfo = RATES[account.type];
    const usageCost = usage * rateInfo.price;
    const totalBill = usageCost + rateInfo.serviceCharge;

    const newHistoryItem = {
      date: new Date().toLocaleDateString(),
      type: 'BILL',
      desc: `Usage: ${usage} ${rateInfo.unit}`,
      amount: totalBill
    };

    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex] = {
      ...account,
      lastReading: reading,
      balance: account.balance + totalBill,
      history: [newHistoryItem, ...account.history]
    };

    setAccounts(updatedAccounts);
    setReadingForm({ accountId: '', currentReading: '' });

    setModalState({
      type: 'BILL_SUCCESS',
      data: { amount: totalBill, account: updatedAccounts[accountIndex] }
    });
  };

  // --- Handler: Process Payment ---
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

  // --- Handler: Print Statement ---
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

  // --- Dashboard Logic (Filter & Search) ---
  let processedData = accounts.filter(acc => filterType === 'All' ? true : acc.type === filterType);
  processedData = processedData.filter(acc => acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.id.toString().includes(searchTerm));
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const currentData = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType]);

  return (
    <div className="app-container">
      {/* --- HIDDEN PRINT AREA --- */}
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

      {/* --- MODALS --- */}
      <Modal isOpen={modalState.type === 'REGISTER_SUCCESS'} title="🎉 Registration Successful" onClose={closeModal}>
        <p>Customer account created.</p>
        <div style={{fontSize: '1.2rem', margin: '20px 0', color: '#27ae60'}}>
          <strong>Account ID: {modalState.data?.id}</strong>
        </div>
      </Modal>

      <Modal 
        isOpen={modalState.type === 'BILL_SUCCESS'} 
        title="Bill Generated" 
        onClose={closeModal}
        actions={
          <button className="btn-print-icon" onClick={() => { printStatement(modalState.data?.account); closeModal(); }}>
            🖨️ Print Bill
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
          <button className="btn-print-icon" onClick={() => { triggerPrint(modalState.data?.receiptData); closeModal(); }}>
            🖨️ Print Receipt
          </button>
        }
      >
        {/* FIX: Safe navigation ?. added here */}
        <p>Paid: <strong>${modalState.data?.amountPaid?.toFixed(2)}</strong></p>
        <p>New Balance: <strong>${modalState.data?.newBalance?.toFixed(2)}</strong></p>
      </Modal>

      <Modal isOpen={modalState.type === 'ERROR'} title="⚠️ Action Failed" onClose={closeModal}>
        <p style={{color: '#c0392b'}}>{modalState.data?.msg}</p>
      </Modal>

      {/* --- MAIN UI --- */}
      <div className="screen-only">
        <header className="header">
          <h1>BillEase <span>Utility System</span></h1>
        </header>

        <nav className="nav-tabs">
          <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={activeTab === 'register' ? 'active' : ''} onClick={() => setActiveTab('register')}>1. Register</button>
          <button className={activeTab === 'reading' ? 'active' : ''} onClick={() => setActiveTab('reading')}>2. Meter Reading</button>
          <button className={activeTab === 'payment' ? 'active' : ''} onClick={() => setActiveTab('payment')}>3. Pay Bill</button>
        </nav>

        <div className="content-area">
          {activeTab === 'dashboard' && (
            <div className="dashboard-view">
              <h2>Account Masterlist</h2>
              <div className="dashboard-controls">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="All">All Services</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Internet">Internet</option>
                </select>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Acct ID</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Balance</th>
                    <th>Last Reading</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map(acc => (
                    <tr key={acc.id}>
                      <td>{acc.id}</td>
                      <td>{acc.name}</td>
                      <td>{acc.type}</td>
                      <td style={{ color: acc.balance > 0 ? 'red' : 'green', fontWeight: 'bold' }}>
                        ${acc.balance?.toFixed(2)}
                      </td>
                      <td><strong>{acc.lastReading}</strong> <small>{RATES[acc.type].unit}</small></td>
                      <td>
                        <button className="btn-print-icon" onClick={() => printStatement(acc)}>🖨️ Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="pagination">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>&laquo; Prev</button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next &raquo;</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'register' && (
             <form className="card-form" onSubmit={registerCustomer}>
              <h2>Customer Registration</h2>
              <label>Customer Name</label><input required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} />
              <label>Service Type</label>
              <select value={regForm.type} onChange={e => setRegForm({...regForm, type: e.target.value})}>
                <option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Internet">Internet</option>
              </select>
              <button type="submit">Create Account</button>
            </form>
          )}

          {activeTab === 'reading' && (
             <form className="card-form" onSubmit={generateBill}>
              <h2>Input Usage</h2>
              <label>Select Account</label>
              <select required value={readingForm.accountId} onChange={e => setReadingForm({...readingForm, accountId: e.target.value})}>
                <option value="">-- Select Customer --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
              </select>
              {readingForm.accountId && (
                 <div className="info-box">
                   {(() => {
                     const selectedAcc = accounts.find(a => a.id.toString() === readingForm.accountId.toString());
                     return selectedAcc ? <><span>Previous Reading:</span><strong>{selectedAcc.lastReading} {RATES[selectedAcc.type].unit}</strong></> : null;
                   })()}
                 </div>
              )}
              <label>New Meter Reading</label><input required type="number" value={readingForm.currentReading} onChange={e => setReadingForm({...readingForm, currentReading: e.target.value})} />
              <button type="submit" className="btn-generate">Generate Bill</button>
            </form>
          )}

          {activeTab === 'payment' && (
             <form className="card-form" onSubmit={processPayment}>
              <h2>Payment Processing</h2>
              <label>Select Account</label>
              <select required value={payForm.accountId} onChange={e => setPayForm({...payForm, accountId: e.target.value})}>
                <option value="">-- Select Customer --</option>
                {accounts.filter(a => a.balance > 0).map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Due: ${acc.balance?.toFixed(2)})</option>)}
              </select>
              <label>Payment Amount ($)</label><input required type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} />
              <button type="submit" className="btn-pay">Process Payment</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;