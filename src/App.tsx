import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Droplet, Coins, Info, Waves, HelpCircle, HardDriveDownload, Sparkles, LogOut, Printer } from 'lucide-react';
import { BillingRecord } from './types';
import { formatId } from './utils';
import StatsDashboard from './components/StatsDashboard';
import BillingForm from './components/BillingForm';
import BillingTable from './components/BillingTable';
import ReceiptModal from './components/ReceiptModal';
import BulkPrintModal from './components/BulkPrintModal';

// Initial Mock Seed for realistic load state with correct pricing (* 30 + 10)
const MOCK_RECORDS: BillingRecord[] = [
  {
    id: '000',
    customerName: 'Juan Dela Cruz',
    billingNumber: 'MTR-00101',
    address: 'Poblacion East, Zone 1',
    lateral: 'West Section A',
    customerType: 'Member',
    previousReading: 12.0,
    presentReading: 14.2,
    consumed: 2.2, // < 3 m3
    others: [0],
    basePayable: 110,
    totalPayable: 110,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '001',
    customerName: 'Maria Clara Santos',
    billingNumber: 'MTR-00205',
    address: 'Plaza Rd, Zone 3',
    lateral: 'East Section B',
    customerType: 'Consumer',
    previousReading: 45.0,
    presentReading: 62.4,
    consumed: 17.4, // >= 3 m3
    others: [-10], // auto -10 for consumer
    basePayable: 17.4 * 30 + 10, // 532.00
    totalPayable: (17.4 * 30 + 10) - 10, // 522.00
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '002',
    customerName: 'Don Crisostomo Ibarra',
    billingNumber: 'MTR-00350',
    address: 'Villa Ibarra, Sector B',
    lateral: 'West Section A',
    customerType: 'Member',
    previousReading: 120.0,
    presentReading: 135.5,
    consumed: 15.5, // >= 3 m3
    others: [0, -100], // multiple others selected
    basePayable: 15.5 * 30 + 10, // 475.00
    totalPayable: (15.5 * 30 + 10) - 100 < 0 ? 0 : (15.5 * 30 + 10) - 100, // 375.00
    createdAt: new Date().toISOString()
  }
];

export default function App() {
  const [records, setRecords] = useState<BillingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<BillingRecord | null>(null);
  const [bulkPrintRecords, setBulkPrintRecords] = useState<BillingRecord[] | null>(null);
  const [showFormulaInfo, setShowFormulaInfo] = useState(false);
  
  // High-priority customizable Invoice Name setting
  const [invoiceName, setInvoiceName] = useState(() => {
    return localStorage.getItem('water_billing_invoice_name') || 'Municipal Water Utility';
  });

  // Load state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('water_billing_ledger_records2');
    if (stored) {
      try {
        setRecords(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse billing records', e);
        setRecords(MOCK_RECORDS);
      }
    } else {
      setRecords(MOCK_RECORDS);
      localStorage.setItem('water_billing_ledger_records2', JSON.stringify(MOCK_RECORDS));
    }
  }, []);

  // Save records to localStorage whenever state shifts
  const saveRecordsToStorage = (newRecords: BillingRecord[]) => {
    setRecords(newRecords);
    localStorage.setItem('water_billing_ledger_records2', JSON.stringify(newRecords));
  };

  // Add newly computed record
  const handleAddRecord = (recordData: Omit<BillingRecord, 'id'>) => {
    const parsedIdNum = records.length > 0 
      ? Math.max(...records.map(r => parseInt(r.id, 10))) + 1
      : 0;
    
    const newRecord: BillingRecord = {
      ...recordData,
      id: formatId(parsedIdNum)
    };

    const updated = [newRecord, ...records];
    saveRecordsToStorage(updated);
  };

  // Delete matching record from master list
  const handleDeleteRecord = (id: string) => {
    const updated = records.filter(r => r.id !== id);
    saveRecordsToStorage(updated);
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord(null);
    }
  };

  // Reset/Clear mock storage helper
  const handleClearAll = () => {
    if (confirm('WARNING: Are you sure you want to clear all water logs? This will wipe the local database.')) {
      saveRecordsToStorage([]);
    }
  };

  // Compute next ID display safely
  const nextIdValue = records.length > 0
    ? Math.max(...records.map(r => parseInt(r.id, 10))) + 1
    : 0;

  const handleInvoiceNameChange = (name: string) => {
    setInvoiceName(name);
    localStorage.setItem('water_billing_invoice_name', name);
  };

  return (
    <div id="application-root-theme" className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-800 flex flex-col justify-between">
      
      {/* Professional Header Component */}
      <header className="bg-white border-b border-slate-200 px-6 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-3xs sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-extrabold shadow-sm select-none">
            W
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-1.5 flex-wrap">
              <span>AquaFlow</span>
              <span className="font-normal text-slate-500 text-sm bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                Billing System v2.2
              </span>
            </h1>
          </div>
        </div>

        {/* Dynamic header options including Invoice Name Customize control */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
          
          {/* Invoice Name input adjustment */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus-within:ring-1 focus-within:ring-blue-500 focus-within:bg-white transition-all">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider shrink-0">Invoice Name:</span>
            <input
              type="text"
              value={invoiceName}
              onChange={(e) => handleInvoiceNameChange(e.target.value)}
              className="bg-transparent font-black text-xs text-slate-700 border-none outline-none focus:outline-hidden p-0 w-44"
              placeholder="e.g. Municipal Water Utility"
              title="Change the Title branding displayed on receipts and logs"
            />
          </div>

          <button
            id="formula-logic-info-btn"
            onClick={() => setShowFormulaInfo(!showFormulaInfo)}
            className="p-1 px-2.5 bg-white hover:text-blue-600 hover:bg-slate-50 rounded-lg border border-slate-250 transition-all cursor-pointer flex items-center space-x-1"
          >
            <Info className="w-4 h-4 text-blue-500" />
            <span>Tariff Rules</span>
          </button>

          <div className="hidden sm:block h-4 w-[1px] bg-slate-250"></div>
          <span>Cycle: June 2026</span>
          <div className="hidden sm:block h-4 w-[1px] bg-slate-250"></div>
          <span>Operator</span>
        </div>
      </header>

      {/* Main Body Grid Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Formula Information Sheet */}
        <AnimatePresence>
          {showFormulaInfo && (
            <motion.div
              id="formula-guideline-card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-6 bg-blue-50/70 rounded-lg border border-blue-200 text-xs text-blue-900 space-y-3.5 shadow-2xs">
                <div className="flex items-center space-x-2 border-b border-blue-100 pb-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-sm text-blue-950 uppercase tracking-widest">Standard Utility Tariff Formula Rules</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <p className="font-bold text-blue-950 uppercase text-[10px] tracking-wide">1. Consumption Volume Calculation</p>
                    <p className="text-blue-850">
                      Subtracting Previous Meter Reading from Present Meter Reading yields total water volume consumed:
                    </p>
                    <p className="font-mono font-bold bg-white p-2.5 rounded border border-blue-150 text-slate-800">
                      Present Reading - Previous Reading = Consumed Cubic Meters (m³)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <p className="font-bold text-blue-950 uppercase text-[10px] tracking-wide">2. Tariff Pricing Policy</p>
                    <ul className="list-disc pl-4 space-y-1.5 text-blue-800">
                      <li>
                        <strong>Under 3 m³:</strong> Fixed flat-rate price of <strong>₱110.00</strong> (100 base + 10 monthly dues).
                      </li>
                      <li>
                        <strong>3 m³ and Above:</strong> Escalated scale computed as: 
                        <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-blue-150 text-blue-700 ml-1">
                          (Consumed × ₱30) + ₱10 base dues
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="border-t border-blue-100 pt-3 flex items-start gap-2 text-[10px] text-blue-700 font-semibold uppercase tracking-wider">
                  <Waves className="w-4 h-4 text-blue-500 shrink-0" />
                  <p>
                    Automatic Policy: Customer type 'Consumer' automatically presets Others adjustment to -10 subsidy, Member defaults to 0.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard Cards Row */}
        <StatsDashboard records={records} />

        {/* Form and Table Split Layout */}
        <div id="split-layout-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form */}
          <div className="lg:col-span-5">
            <BillingForm 
              nextId={nextIdValue}
              onAddRecord={handleAddRecord}
            />
          </div>

          {/* Table Ledger Panel */}
          <div className="lg:col-span-7 space-y-6">
            <BillingTable 
              records={records}
              onDeleteRecord={handleDeleteRecord}
              onViewRecord={(record) => setSelectedRecord(record)}
              onBulkPrint={(selectedList) => setBulkPrintRecords(selectedList)}
            />
          </div>
        </div>
      </main>

      {/* Floating Single Receipt Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <ReceiptModal 
            record={selectedRecord}
            invoiceName={invoiceName}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </AnimatePresence>

      {/* Floating Bulk Print Queue Modal */}
      <AnimatePresence>
        {bulkPrintRecords && (
          <BulkPrintModal 
            records={bulkPrintRecords}
            invoiceName={invoiceName}
            onClose={() => setBulkPrintRecords(null)}
          />
        )}
      </AnimatePresence>

      {/* Professional Footer Component */}
      <footer className="bg-slate-800 text-slate-400 px-6 sm:px-8 py-4 text-xs flex flex-col sm:flex-row justify-between items-center gap-4 mt-12 border-t border-slate-700">
        <div className="flex flex-wrap gap-4 sm:gap-6 uppercase tracking-widest font-semibold text-[10px]">
          <span>Database Sync: Online</span>
          <span className="text-slate-500">|</span>
          <span>Last Backup: Live</span>
          {records.length > 0 && (
            <>
              <span className="text-slate-500">|</span>
              <button 
                onClick={handleClearAll}
                className="text-red-400 hover:text-red-300 font-bold tracking-widest transition-colors cursor-pointer uppercase text-[10px]"
              >
                Reset Ledger Logs
              </button>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 font-semibold uppercase text-[10px] tracking-widest text-slate-400">
          <span>Water System Connection State: Optimal</span>
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
}
