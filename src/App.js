import React, { useState, useEffect } from 'react';

// ============================================
// DATA TYPES SECTION
// ============================================
const RATES = {
  Electricity: { unit: 'kWh', price: 0.15, serviceCharge: 10.00 },
  Water: { unit: 'cu.m', price: 1.25, serviceCharge: 5.00 },
  Internet: { unit: 'GB', price: 2.00, serviceCharge: 20.00 }
};

const ITEMS_PER_PAGE = 5;

// ============================================
// COMPONENTS
// ============================================

const Modal = ({ isOpen, title, children, onClose, actions }) => {
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
// MOCK DATA
// ============================================
const INITIAL_ACCOUNTS = [
  { id: 101, name: 'John Doe', type: 'Electricity', balance: 44.65, lastReading: 231, history: [] },
  { id: 102, name: 'Jane Smith', type: 'Water', balance: 45.50, lastReading: 120, history: [] },
];

// ============================================
// MAIN APP
// ============================================
function App() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const [regForm, setRegForm] = useState({ name: '', type: 'Electricity' });
  const [readingForm, setReadingForm] = useState({ accountId: '', currentReading: '' });
  const [payForm, setPayForm] = useState({ accountId: '', amount: '' });

  const [printData, setPrintData] = useState(null);
  const [modalState, setModalState] = useState({ type: null, data: null });
  const [darkMode, setDarkMode] = useState(false);

  const closeModal = () => setModalState({ type: null, data: null });

  const triggerPrint = (data) => {
    setPrintData(data);
    setTimeout(() => { window.print(); }, 100);
  };

  const registerCustomer = (e) => {
    e.preventDefault();
    const nextId = accounts.length > 0 ? Math.max(...accounts.map(acc => acc.id)) + 1 : 101;
    const newAccount = {
      id: nextId, name: regForm.name, type: regForm.type,
      balance: 0.00, lastReading: 0, history: []
    };
    setAccounts([...accounts, newAccount]);
    setRegForm({ name: '', type: 'Electricity' });
    setModalState({ type: 'REGISTER_SUCCESS', data: { id: newAccount.id, name: newAccount.name } });
  };

  const generateBill = (e) => {
    e.preventDefault();
    const accId = parseInt(readingForm.accountId);
    const reading = parseFloat(readingForm.currentReading);
    const accountIndex = accounts.findIndex(a => a.id === accId);
    
    if (accountIndex === -1) return;
    const account = accounts[accountIndex];
    
    if (reading < account.lastReading) {
      setModalState({ type: 'ERROR', data: { msg: "New reading cannot be lower than previous." }});
      return;
    }

    const usage = reading - account.lastReading;
    const rateInfo = RATES[account.type];
    const usageCost = usage * rateInfo.price;
    const totalBill = usageCost + rateInfo.serviceCharge;

    const newHistoryItem = {
      date: new Date().toLocaleDateString(), type: 'BILL',
      desc: `Usage: ${usage} ${rateInfo.unit}`, amount: totalBill
    };

    const updatedAccounts = [...accounts];
    updatedAccounts[accountIndex] = {
      ...account, lastReading: reading,
      balance: account.balance + totalBill,
      history: [newHistoryItem, ...account.history]
    };

    setAccounts(updatedAccounts);
    setReadingForm({ accountId: '', currentReading: '' });
    setModalState({ type: 'BILL_SUCCESS', data: { amount: totalBill, account: updatedAccounts[accountIndex] } });
  };

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
      date: new Date().toLocaleDateString(), type: 'PAYMENT',
      desc: 'Cash/Online Payment', amount: -amount
    };

    updatedAccounts[accountIndex] = {
      ...account, balance: newBalance,
      history: [newHistoryItem, ...account.history]
    };

    setAccounts(updatedAccounts);
    setPayForm({ accountId: '', amount: '' });

    setModalState({
      type: 'PAYMENT_SUCCESS',
      data: {
        customer: account.name, amountPaid: amount, newBalance: newBalance,
        receiptData: { type: 'RECEIPT', customer: account.name, accountId: account.id, date: new Date().toLocaleString(), amountPaid: amount, newBalance: newBalance }
      }
    });
  };

  const printStatement = (acc) => {
    triggerPrint({
      type: 'STATEMENT', customer: acc.name, accountId: acc.id,
      serviceType: acc.type, date: new Date().toLocaleDateString(),
      balance: acc.balance, lastReading: acc.lastReading, unit: RATES[acc.type].unit
    });
  };

  let processedData = accounts.filter(acc => filterType === 'All' ? true : acc.type === filterType);
  processedData = processedData.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    acc.id.toString().includes(searchTerm)
  );
  
  const totalPages = Math.ceil(processedData.length / ITEMS_PER_PAGE);
  const currentData = processedData.slice((currentPage - 1) * ITEMS_PER_PAGE, (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE);

  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterType]);

  return (
    <div style={{backgroundColor: darkMode ? '#222831' : '#ffffff', transition: 'all 0.3s', minHeight: '100vh', padding: '20px'}}>
      <div className="max-w-[1000px] mx-auto bg-white min-h-[85vh] shadow-2xl rounded-2xl overflow-hidden border border-gray-100" style={{backgroundColor: darkMode ? '#222831' : '#ffffff', borderColor: darkMode ? '#5a3a3a' : '#e5e5e5', transition: 'all 0.3s'}}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(20px); } to { transform: translateY(0); } }
        @media print {
          .screen-only { display: none !important; }
          #print-area { display: block !important; position: absolute; top: 0; left: 0; width: 100%; }
        }
        #print-area { display: none; }

        /* CUSTOM DARK MODE STYLES */
        ${darkMode ? `
          input, select {
            background-color: #393E46 !important;
            color: #ffffff !important;
            border-color: #555 !important;
          }
          input::placeholder {
            color: #b3b3b3 !important;
            opacity: 1;
          }
          /* Darker hover for buttons handled via Tailwind utility classes in render */
        ` : ''}
      `}</style>
      
      {/* HIDDEN PRINT AREA */}
      <div id="print-area">
        {printData && (
          <div className="print-slip" style={{width: '300px', margin: '0 auto', padding: '20px', border: '1px solid #000', fontFamily: 'monospace', textAlign: 'center'}}>
            <div className="print-header">
              <h2>BillEase Utilities</h2>
              <hr />
              <h3>{printData.type === 'RECEIPT' ? 'OFFICIAL RECEIPT' : 'BILLING STATEMENT'}</h3>
            </div>
            <div style={{textAlign: 'left', marginTop: '20px'}}>
              <p><strong>Customer:</strong> {printData.customer}</p>
              <p><strong>ID:</strong> {printData.accountId}</p>
              {printData.type === 'STATEMENT' ? (
                <>
                  <p><strong>Total Due:</strong> ${printData.balance?.toFixed(2)}</p>
                </>
              ) : (
                <>
                  <p><strong>Paid:</strong> ${printData.amountPaid?.toFixed(2)}</p>
                </>
              )}
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

      <Modal isOpen={modalState.type === 'BILL_SUCCESS'} title="Bill Generated" onClose={closeModal} actions={<button className="bg-yellow-400 py-3 px-6 rounded-lg font-bold" onClick={() => { printStatement(modalState.data?.account); closeModal(); }}>Print Bill</button>}>
        <p>Calculated Charges:</p>
        <h2>${modalState.data?.amount?.toFixed(2)}</h2>
      </Modal>

      <Modal isOpen={modalState.type === 'PAYMENT_SUCCESS'} title="Payment Processed" onClose={closeModal} actions={<button className="bg-yellow-400 py-3 px-6 rounded-lg font-bold" onClick={() => { triggerPrint(modalState.data?.receiptData); closeModal(); }}>Print Receipt</button>}>
        <p>Paid: <strong>${modalState.data?.amountPaid?.toFixed(2)}</strong></p>
        <p>New Balance: <strong>${modalState.data?.newBalance?.toFixed(2)}</strong></p>
      </Modal>

      <Modal isOpen={modalState.type === 'ERROR'} title="Action Failed" onClose={closeModal}>
        <p className="text-red-500">{modalState.data?.msg}</p>
      </Modal>

      {/* MAIN UI */}
      <div className="screen-only" style={{backgroundColor: darkMode ? '#222831' : '#ffffff', color: darkMode ? '#ffffff' : '#000000', transition: 'all 0.3s'}}>
        <header className="bg-gradient-to-r from-[#2c3e50] to-[#34495e] text-white p-8 text-center shadow-lg relative" style={{backgroundColor: darkMode ? '#222831' : undefined}}>
          <button onClick={() => setDarkMode(!darkMode)} className="absolute right-8 top-8 bg-white text-[#2c3e50] border-none py-2 px-4 rounded-lg cursor-pointer font-bold shadow-md hover:shadow-lg transition-all" style={{opacity: 0.9}}>{darkMode ? '☀️ Light' : '🌙 Dark'}</button>
          <div className="flex items-center justify-center gap-4">
            <h1 className="m-0 text-3xl font-bold tracking-wide">BillEase</h1>
            <img src="/images/Header.png" alt="logo" style={{height: '60px'}} />
            <h1 className="m-0 text-3xl font-bold tracking-wide"><span className="font-normal text-[#3498db]">Utility System</span></h1>
          </div>
        </header>

        <nav className="flex bg-gradient-to-r from-gray-100 to-gray-200 shadow-inner" style={{backgroundColor: darkMode ? '#393E46' : undefined}}>
          {['dashboard', 'register', 'reading', 'payment'].map(tab => (
            <button key={tab} className={`flex-1 p-5 border-none bg-transparent cursor-pointer text-sm font-bold transition-all duration-300 flex items-center justify-center h-[100px] ${activeTab === tab ? 'bg-white text-primary shadow-lg border-t-4 border-t-[#3498db] -mt-1' : 'text-gray-600 hover:bg-white hover:text-primary'}`} style={{gap: '15px', backgroundColor: darkMode ? '#393E46' : undefined, color: darkMode ? '#f0f0f0' : undefined}} onClick={() => setActiveTab(tab)}>
              <img src={`/images/${tab === 'reading' ? 'meter' : tab}.png`} alt={tab} style={{height: '100px', maxWidth: '60px', objectFit: 'contain'}} />
              <span className="capitalize">{tab === 'reading' ? 'Meter Reading' : tab === 'payment' ? 'Pay Bill' : tab}</span>
            </button>
          ))}
        </nav>

        <div className="p-8" style={{backgroundColor: darkMode ? '#222831' : '#ffffff', color: darkMode ? '#ffffff' : '#000000', transition: 'all 0.3s'}}>
          {activeTab === 'dashboard' && (
            <div>
              <div className="mb-6 pb-3 border-b-2 border-gray-200 flex items-center gap-1" style={{height: '120px'}}>
                <img src="/images/dashboard.png" alt="accounts" style={{height: '200px', objectFit: 'contain'}} />
                <h2 className="text-primary text-2xl font-bold m-0" style={{color: darkMode ? '#ffffff' : undefined}}>Account Masterlist</h2>
              </div>
              <div className="flex gap-3 mb-6 p-4 rounded-xl shadow-sm border" style={{backgroundColor: darkMode ? '#393E46' : undefined, borderColor: darkMode ? '#4a4a4a' : undefined}}>
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
                    {['Acct ID', 'Customer', 'Type', 'Balance', 'Last Reading', 'Action'].map((h, i) => <th key={i} className="p-4 text-left text-white font-bold text-sm">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="bg-white" style={{backgroundColor: darkMode ? '#222831' : undefined}}>
                  {currentData.map(acc => (
                    // UPDATED ROW HOVER LOGIC: uses grey hover in dark mode, light blue in light mode
                    <tr key={acc.id} className={`transition-all duration-200 border-b border-gray-100 ${darkMode ? 'hover:bg-[#333b4d]' : 'hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent'}`} style={{backgroundColor: darkMode ? '#222831' : undefined}}>
                      <td className="p-4 text-left font-semibold text-gray-700" style={{color: darkMode ? '#ffffff' : undefined}}>{acc.id}</td>
                      <td className="p-4 text-left font-medium text-gray-800" style={{color: darkMode ? '#ffffff' : undefined}}>{acc.name}</td>
                      <td className="p-4 text-left"><span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">{acc.type}</span></td>
                      <td className="p-4 text-left font-bold text-lg" style={{ color: acc.balance > 0 ? '#e74c3c' : '#27ae60' }}>${acc.balance?.toFixed(2)}</td>
                      <td className="p-4 text-left"><strong className="text-gray-800" style={{color: darkMode ? '#ffffff' : undefined}}>{acc.lastReading}</strong> <small className="text-gray-500" style={{color: darkMode ? '#ffffff' : undefined}}>{RATES[acc.type].unit}</small></td>
                      <td className="p-4 text-left">
                        <button className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-none py-2 px-4 rounded-lg cursor-pointer text-xs text-gray-800 hover:from-yellow-500 hover:to-yellow-600 transition-all duration-200 font-semibold shadow-md hover:shadow-lg flex items-center gap-2" onClick={() => printStatement(acc)}>Print</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 pt-6 border-t-2 border-gray-200">
                  <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="py-3 px-6 bg-white border-2 border-gray-300 rounded-lg cursor-pointer text-primary font-semibold hover:bg-[#3498db] hover:text-white">Prev</button>
                  <span className="font-bold text-gray-700 text-lg px-4" style={{color: darkMode ? '#ffffff' : undefined}}>Page {currentPage} of {totalPages}</span>
                  <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="py-3 px-6 bg-white border-2 border-gray-300 rounded-lg cursor-pointer text-primary font-semibold hover:bg-[#3498db] hover:text-white">Next</button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'register' && (
             <form className="max-w-[550px] mx-auto p-10 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl" onSubmit={registerCustomer} style={{backgroundColor: darkMode ? 'rgb(34, 40, 49)' : undefined, backgroundImage: darkMode ? 'none' : undefined, borderColor: darkMode ? '#393E46' : undefined, color: darkMode ? '#ffffff' : '#000000'}}>
              <h2 className="mt-0 text-primary text-2xl font-bold border-b-2 border-b-blue-200 pb-4 mb-6 flex items-center gap-3" style={{color: darkMode ? '#ffffff' : undefined, borderColor: darkMode ? '#393E46' : undefined}}><img src="/images/register.png" alt="register" style={{height: '50px', maxWidth: '40px', marginRight: '8px', objectFit: 'contain'}} />Customer Registration</h2>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm" style={{color: darkMode ? '#ffffff' : undefined}}>Customer Name</label><input required value={regForm.name} onChange={e => setRegForm({...regForm, name: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" placeholder="Enter customer name" />
              <label className="block my-4 mb-1.5 font-bold text-[#555]" style={{color: darkMode ? '#ffffff' : undefined}}>Service Type</label>
              <select value={regForm.type} onChange={e => setRegForm({...regForm, type: e.target.value})} className="w-full p-2.5 border border-[#ccc] rounded box-border" >
                <option value="Electricity">Electricity</option><option value="Water">Water</option><option value="Internet">Internet</option>
              </select>
              {/* UPDATED BUTTON: Removed bg override, added brightness for dark mode */}
              <button type="submit" className={`w-full mt-5 p-3 bg-primary text-white border-none rounded cursor-pointer text-base hover:brightness-90 transition-all ${darkMode ? 'brightness-110' : ''}`} style={{color: darkMode ? '#ffffff' : undefined}}>Create Account</button>
            </form>
          )}

          {activeTab === 'reading' && (
             <form className="max-w-[550px] mx-auto p-10 border-2 border-gray-200 rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl" onSubmit={generateBill} style={{backgroundColor: darkMode ? 'rgb(34, 40, 49)' : undefined, backgroundImage: darkMode ? 'none' : undefined, borderColor: darkMode ? '#393E46' : undefined, color: darkMode ? '#ffffff' : '#000000'}}>
              <h2 className="mt-0 text-primary text-2xl font-bold border-b-2 border-b-blue-200 pb-4 mb-6 flex items-center gap-3" style={{color: darkMode ? '#ffffff' : undefined, borderColor: darkMode ? '#393E46' : undefined}}><img src="/images/meter.png" alt="meter" style={{height: '50px', maxWidth: '40px', objectFit: 'contain'}} />Input Usage</h2>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm" style={{color: darkMode ? '#ffffff' : undefined}}>Select Account</label>
              <select required value={readingForm.accountId} onChange={e => setReadingForm({...readingForm, accountId: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium bg-white transition-all cursor-pointer">
                <option value="">-- Select Customer --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>)}
              </select>
              {readingForm.accountId && (
                 <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-200 text-emerald-700 py-4 px-5 rounded-xl my-6 flex justify-between items-center text-sm font-medium shadow-sm">
                   {(() => {
                     const selectedAcc = accounts.find(a => a.id.toString() === readingForm.accountId.toString());
                     return selectedAcc ? <><span>Previous Reading:</span><strong>{selectedAcc.lastReading} {RATES[selectedAcc.type].unit}</strong></> : null;
                   })()}
                 </div>
              )}
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm" style={{color: darkMode ? '#ffffff' : undefined}}>New Meter Reading</label><input required type="number" value={readingForm.currentReading} onChange={e => setReadingForm({...readingForm, currentReading: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" placeholder="Enter meter reading" />
              {/* UPDATED BUTTON: Brighter in dark mode (no bg override), darker on hover */}
              <button type="submit" className={`w-full mt-8 p-4 bg-gradient-to-r from-[#3498db] to-[#2980b9] text-white border-none rounded-lg cursor-pointer text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:brightness-90 ${darkMode ? 'brightness-110' : ''}`} style={{color: darkMode ? '#f0f0f0' : undefined}}><img src="/images/balance.png" alt="bill" style={{height: '24px'}} />Generate Bill</button>
            </form>
          )}

          {activeTab === 'payment' && (
             <form className="max-w-[550px] mx-auto p-10 border-2  rounded-2xl  shadow-xl" onSubmit={processPayment} style={{backgroundColor: darkMode ? 'rgb(34, 40, 49)' : undefined, backgroundImage: darkMode ? 'none' : undefined, borderColor: darkMode ? '#393E46' : undefined, color: darkMode ? '#ffffff' : '#000000'}}>
              <h2 className="mt-0 text-primary text-2xl font-bold border-b-2 border pb-4 mb-6 flex items-center gap-3" style={{color: darkMode ? '#ffffff' : undefined, borderColor: darkMode ? '#393E46' : undefined}}><img src="/images/balance.png" alt="payment" style={{height: '50px', maxWidth: '40px', objectFit: 'fill'}} />Payment Processing</h2>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm" style={{color: darkMode ? '#ffffff' : undefined}}>Select Account</label>
              <select required value={payForm.accountId} onChange={e => setPayForm({...payForm, accountId: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 font-medium bg-white transition-all cursor-pointer">
                <option value="">-- Select Customer --</option>
                {accounts.filter(a => a.balance > 0).map(acc => <option key={acc.id} value={acc.id}>{acc.name} (Due: ${acc.balance?.toFixed(2)})</option>)}
              </select>
              <label className="block mt-6 mb-2 font-bold text-gray-700 text-sm" style={{color: darkMode ? '#ffffff' : undefined}}>Payment Amount ($)</label><input required type="number" step="0.01" value={payForm.amount} onChange={e => setPayForm({...payForm, amount: e.target.value})} className="w-full p-4 border-2 border-gray-300 rounded-lg box-border focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all font-medium" placeholder="Enter payment amount" />
              {/* UPDATED BUTTON: Brighter in dark mode (no bg override), darker on hover */}
              <button type="submit" className={`w-full mt-8 p-4 bg-gradient-to-r from-[#27ae60] to-[#229954] text-white border-none rounded-lg cursor-pointer text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:brightness-90 ${darkMode ? 'brightness-110' : ''}`} style={{color: darkMode ? '#f0f0f0' : undefined}}><img src="/images/balance.png" alt="payment" style={{height: '24px'}} />Process Payment</button>
            </form>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default App;