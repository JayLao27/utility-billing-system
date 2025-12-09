import React, { useState, useEffect } from 'react';

// Configuration
const RATES = {
  Electricity: { unit: 'kWh', price: 0.15, serviceCharge: 10.00 },
  Water: { unit: 'cu.m', price: 1.25, serviceCharge: 5.00 },
  Internet: { unit: 'GB', price: 2.00, serviceCharge: 20.00 }
};

const ITEMS_PER_PAGE = 5;

// Sub-Component: Generic Modal
const Modal = ({ isOpen, title, children, onClose, actions }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1000] animate-[fadeIn_0.2s]">
      <div className="bg-white p-8 rounded-lg w-[90%] max-w-md text-center shadow-[0_4px_15px_rgba(0,0,0,0.2)] animate-[slideUp_0.2s]">
        <h3 className="mt-0 text-primary">{title}</h3>
        <div className="text-[#555] my-4">{children}</div>
        <div className="flex justify-center gap-2.5 mt-5">
          {actions}
          <button className="bg-[#95a5a6] text-white border-none py-2.5 px-5 rounded cursor-pointer hover:bg-[#7f8c8d]" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Initial Mock Data
const INITIAL_ACCOUNTS = [
  { id: 101, name: 'John Doe', type: 'Electricity', balance: 44.65, lastReading: 231, history: [] },
  { id: 102, name: 'Jane Smith', type: 'Water', balance: 45.50, lastReading: 120, history: [] },
];

function App() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Dashboard State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Forms State
  const [regForm, setRegForm] = useState({ name: '', type: 'Electricity' });
  const [readingForm, setReadingForm] = useState({ accountId: '', currentReading: '' });
  const [payForm, setPayForm] = useState({ accountId: '', amount: '' });

  // Print & Modal State
  const [printData, setPrintData] = useState(null);
  const [modalState, setModalState] = useState({ type: null, data: null });

  // Helper: Close Modal
  const closeModal = () => setModalState({ type: null, data: null });

  // Helper: Trigger Print
  const triggerPrint = (data) => {
    setPrintData(data);
    setTimeout(() => { window.print(); }, 100);
  };

  // Handler: Registration (Auto-Increment ID)
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

  // Handler: Generate Bill
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

  // Dashboard Logic (Filter & Search)
  let processedData = accounts.filter(acc => filterType === 'All' ? true : acc.type === filterType);
  processedData = processedData.filter(acc => acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || acc.id.toString().includes(searchTerm));
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const currentData = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType]);

  return (
    <div className="max-w-[900px] my-5 mx-auto bg-white min-h-[80vh] shadow-[0_0_20px_rgba(0,0,0,0.05)] rounded-lg overflow-hidden">
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
      <Modal isOpen={modalState.type === 'REGISTER_SUCCESS'} title="🎉 Registration Successful" onClose={closeModal}>
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
          <button className="bg-[#f1c40f] border-none py-1.5 px-2.5 rounded cursor-pointer text-xs text-[#333] hover:bg-[#f39c12]" onClick={() => { printStatement(modalState.data?.account); closeModal(); }}>
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
          <button className="bg-[#f1c40f] border-none py-1.5 px-2.5 rounded cursor-pointer text-xs text-[#333] hover:bg-[#f39c12]" onClick={() => { triggerPrint(modalState.data?.receiptData); closeModal(); }}>
            🖨️ Print Receipt
          </button>
        }
      >
        {/* FIX: Safe navigation ?. added here */}
        <p>Paid: <strong>${modalState.data?.amountPaid?.toFixed(2)}</strong></p>
        <p>New Balance: <strong>${modalState.data?.newBalance?.toFixed(2)}</strong></p>
      </Modal>

      <Modal isOpen={modalState.type === 'ERROR'} title="⚠️ Action Failed" onClose={closeModal}>
        <p className="text-danger">{modalState.data?.msg}</p>
      </Modal>

      {/* MAIN UI */}
      <div className="screen-only">
        <header className="bg-primary text-white p-5 text-center">
          <h1 className="m-0">BillEase <span className="font-light text-accent">Utility System</span></h1>
        </header>

        <nav className="flex bg-[#dfe6e9]">
          <button className={`flex-1 p-4 border-none bg-transparent cursor-pointer text-base font-semibold transition-all duration-300 ${activeTab === 'dashboard' ? 'bg-white text-primary border-t-[3px] border-t-accent' : 'text-[#7f8c8d] hover:bg-[#dcdde1]'}`} onClick={() => setActiveTab('dashboard')}>Dashboard</button>
          <button className={`flex-1 p-4 border-none bg-transparent cursor-pointer text-base font-semibold transition-all duration-300 ${activeTab === 'register' ? 'bg-white text-primary border-t-[3px] border-t-accent' : 'text-[#7f8c8d] hover:bg-[#dcdde1]'}`} onClick={() => setActiveTab('register')}>1. Register</button>
          <button className={`flex-1 p-4 border-none bg-transparent cursor-pointer text-base font-semibold transition-all duration-300 ${activeTab === 'reading' ? 'bg-white text-primary border-t-[3px] border-t-accent' : 'text-[#7f8c8d] hover:bg-[#dcdde1]'}`} onClick={() => setActiveTab('reading')}>2. Meter Reading</button>
          <button className={`flex-1 p-4 border-none bg-transparent cursor-pointer text-base font-semibold transition-all duration-300 ${activeTab === 'payment' ? 'bg-white text-primary border-t-[3px] border-t-accent' : 'text-[#7f8c8d] hover:bg-[#dcdde1]'}`} onClick={() => setActiveTab('payment')}>3. Pay Bill</button>
        </nav>

        <div className="p-8">
          {activeTab === 'dashboard' && (
            <div>
              <h2 className="text-primary">Account Masterlist</h2>
              <div className="flex gap-2.5 mb-4 bg-[#f8f9fa] p-2.5 rounded">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-[2] py-2 px-3 border border-[#ddd] rounded" />
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="flex-1 py-2 px-3 border border-[#ddd] rounded cursor-pointer">
                  <option value="All">All Services</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Water">Water</option>
                  <option value="Internet">Internet</option>
                </select>
              </div>

              <table className="w-full border-collapse mt-2.5">
                <thead>
                  <tr>
                    <th className="p-3 text-left border-b border-[#eee] bg-light text-primary">Acct ID</th>
                    <th className="p-3 text-left border-b border-[#eee] bg-light text-primary">Customer</th>
                    <th className="p-3 text-left border-b border-[#eee] bg-light text-primary">Type</th>
                    <th className="p-3 text-left border-b border-[#eee] bg-light text-primary">Balance</th>
                    <th className="p-3 text-left border-b border-[#eee] bg-light text-primary">Last Reading</th>
                    <th className="p-3 text-left border-b border-[#eee] bg-light text-primary">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map(acc => (
                    <tr key={acc.id} className="hover:bg-[#f9f9f9]">
                      <td className="p-3 text-left border-b border-[#eee]">{acc.id}</td>
                      <td className="p-3 text-left border-b border-[#eee]">{acc.name}</td>
                      <td className="p-3 text-left border-b border-[#eee]">{acc.type}</td>
                      <td className="p-3 text-left border-b border-[#eee] font-bold" style={{ color: acc.balance > 0 ? 'red' : 'green' }}>
                        ${acc.balance?.toFixed(2)}
                      </td>
                      <td className="p-3 text-left border-b border-[#eee]"><strong>{acc.lastReading}</strong> <small>{RATES[acc.type].unit}</small></td>
                      <td className="p-3 text-left border-b border-[#eee]">
                        <button className="bg-[#f1c40f] border-none py-1.5 px-2.5 rounded cursor-pointer text-xs text-[#333] hover:bg-[#f39c12]" onClick={() => printStatement(acc)}>🖨️ Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-5 pt-4 border-t border-[#eee]">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="py-2 px-4 bg-white border border-[#ddd] rounded cursor-pointer text-primary transition-all duration-200 hover:bg-accent hover:text-white hover:border-accent disabled:bg-[#f5f5f5] disabled:text-[#ccc] disabled:cursor-not-allowed">&laquo; Prev</button>
                  <span className="font-bold text-[#7f8c8d]">Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="py-2 px-4 bg-white border border-[#ddd] rounded cursor-pointer text-primary transition-all duration-200 hover:bg-accent hover:text-white hover:border-accent disabled:bg-[#f5f5f5] disabled:text-[#ccc] disabled:cursor-not-allowed">Next &raquo;</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'register' && (
             <form className="max-w-[500px] mx-auto p-8 border border-[#ddd] rounded-lg bg-white" onSubmit={registerCustomer}>
              <h2 className="mt-0 text-primary border-b-2 border-b-light pb-2.5">Customer Registration</h2>
              <label className="block my-4 mb-1.5 font-bold text-[#555]">Customer Name</label><input required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border" />
              <label className="block my-4 mb-1.5 font-bold text-[#555]">Service Type</label>
              <select value={regForm.type} onChange={e => setRegForm({...regForm, type: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border">
                <option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Internet">Internet</option>
              </select>
              <button type="submit" className="w-full mt-5 p-3 bg-primary text-white border-none rounded cursor-pointer text-base">Create Account</button>
            </form>
          )}

          {activeTab === 'reading' && (
             <form className="max-w-[500px] mx-auto p-8 border border-[#ddd] rounded-lg bg-white" onSubmit={generateBill}>
              <h2 className="mt-0 text-primary border-b-2 border-b-light pb-2.5">Input Usage</h2>
              <label className="block my-4 mb-1.5 font-bold text-[#555]">Select Account</label>
              <select required value={readingForm.accountId} onChange={e => setReadingForm({...readingForm, accountId: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border">
                <option value="">-- Select Customer --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
              </select>
              {readingForm.accountId && (
                 <div className="bg-[#e8f6f3] border border-[#d0ece7] text-[#16a085] py-2.5 px-4 rounded my-4 flex justify-between items-center text-sm">
                   {(() => {
                     const selectedAcc = accounts.find(a => a.id.toString() === readingForm.accountId.toString());
                     return selectedAcc ? <><span>Previous Reading:</span><strong>{selectedAcc.lastReading} {RATES[selectedAcc.type].unit}</strong></> : null;
                   })()}
                 </div>
              )}
              <label className="block my-4 mb-1.5 font-bold text-[#555]">New Meter Reading</label><input required type="number" value={readingForm.currentReading} onChange={e => setReadingForm({...readingForm, currentReading: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border" />
              <button type="submit" className="w-full mt-5 p-3 bg-accent text-white border-none rounded cursor-pointer text-base">Generate Bill</button>
            </form>
          )}

          {activeTab === 'payment' && (
             <form className="max-w-[500px] mx-auto p-8 border border-[#ddd] rounded-lg bg-white" onSubmit={processPayment}>
              <h2 className="mt-0 text-primary border-b-2 border-b-light pb-2.5">Payment Processing</h2>
              <label className="block my-4 mb-1.5 font-bold text-[#555]">Select Account</label>
              <select required value={payForm.accountId} onChange={e => setPayForm({...payForm, accountId: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border">
                <option value="">-- Select Customer --</option>
                {accounts.filter(a => a.balance > 0).map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Due: ${acc.balance?.toFixed(2)})</option>)}
              </select>
              <label className="block my-4 mb-1.5 font-bold text-[#555]">Payment Amount ($)</label><input required type="number" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border" />
              <button type="submit" className="w-full mt-5 p-3 bg-success text-white border-none rounded cursor-pointer text-base">Process Payment</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;