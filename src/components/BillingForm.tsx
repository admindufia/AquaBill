import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  User, 
  MapPin, 
  Gauge, 
  Coins, 
  ChevronDown, 
  Check, 
  HelpCircle,
  Hash,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { CustomerType, BillingRecord } from '../types';
import { calculateBill, formatId } from '../utils';

interface BillingFormProps {
  nextId: number;
  onAddRecord: (record: Omit<BillingRecord, 'id'> & { id?: string }) => void;
}

export default function BillingForm(props: BillingFormProps) {
  const { nextId, onAddRecord } = props;

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [billingNumber, setBillingNumber] = useState('');
  const [address, setAddress] = useState('');
  const [lateral, setLateral] = useState('');
  const [customerType, setCustomerType] = useState<CustomerType>('Member');
  
  // Readings State
  const [previousReading, setPreviousReading] = useState<string>('');
  const [presentReading, setPresentReading] = useState<string>('');
  
  // Others Multi-select Dropdown State
  const [selectedOthers, setSelectedOthers] = useState<number[]>([0]); // Default state for Member is 0
  const [isOthersDropdownOpen, setIsOthersDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Available others options
  const othersOptions = [
    { value: -10, label: '₱-10 Standard Discount' },
    { value: -100, label: '₱-100 Special Rebate' },
    { value: 0, label: '₱0 Standard Adjustment' }
  ];

  // Auto-set others amount based on Customer Type selection
  const handleCustomerTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as CustomerType;
    setCustomerType(type);
    
    if (type === 'Consumer') {
      setSelectedOthers([-10]);
    } else {
      setSelectedOthers([0]);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOthersDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-select toggle handler
  const toggleOthersOption = (value: number) => {
    setSelectedOthers(prev => {
      if (prev.includes(value)) {
        const next = prev.filter(v => v !== value);
        return next.length === 0 ? [value] : next;
      } else {
        if (value === 0) {
          return [0];
        } else {
          return [...prev.filter(v => v !== 0), value];
        }
      }
    });
  };

  // Instant calculation for live preview
  const prevNum = parseFloat(previousReading) || 0;
  const presNum = parseFloat(presentReading) || 0;
  const calc = calculateBill(prevNum, presNum, selectedOthers);

  // Form Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customerName.trim()) return;
    if (!billingNumber.trim()) return;
    if (!calc.isValid) return;

    onAddRecord({
      customerName: customerName.trim(),
      billingNumber: billingNumber.trim(),
      address: address.trim() || 'Not Specified',
      lateral: lateral.trim() || 'Lateral A',
      customerType,
      previousReading: prevNum,
      presentReading: presNum,
      consumed: calc.consumed,
      others: selectedOthers,
      basePayable: calc.basePayable,
      totalPayable: calc.totalPayable,
      createdAt: new Date().toISOString()
    });

    // Reset Form Fields
    setCustomerName('');
    setBillingNumber('');
    setAddress('');
    setPreviousReading('');
    setPresentReading('');
    // Automatically set default again based on current customerType
    if (customerType === 'Consumer') {
      setSelectedOthers([-10]);
    } else {
      setSelectedOthers([0]);
    }
  };

  return (
    <div id="billing-form-wrapper" className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden sticky top-4">
      {/* Form Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-lg tracking-tight">Compute Water Bill</h2>
            <p className="text-xs text-slate-400">Add reader log and instant math</p>
          </div>
        </div>
        <div className="bg-slate-100 text-slate-700 font-mono text-xs px-3 py-1.5 rounded-md border border-slate-200 flex items-center space-x-1.5">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">NEXT ID:</span>
          <span className="font-black text-slate-800">{formatId(nextId)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            1. Customer Profile
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="customer-name" className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Customer Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="customer-name"
                  type="text"
                  required
                  placeholder="e.g. Maria Clara"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Meter Number / Billing # */}
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="meter-number" className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Billing # (Meter No.) *
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="meter-number"
                  type="text"
                  required
                  placeholder="e.g. MTR-90412"
                  value={billingNumber}
                  onChange={(e) => setBillingNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Address */}
            <div className="col-span-2">
              <label htmlFor="customer-address" className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Service Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  id="customer-address"
                  type="text"
                  placeholder="Unit, Street, Barangay"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800"
                />
              </div>
            </div>

            {/* Lateral */}
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="lateral-line" className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Lateral Position
              </label>
              <input
                id="lateral-line"
                type="text"
                placeholder="e.g. West Section A"
                value={lateral}
                onChange={(e) => setLateral(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800"
              />
            </div>

            {/* Customer Type Dropdown */}
            <div className="col-span-2 sm:col-span-1">
              <label htmlFor="customer-type-select" className="block text-[11px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                Customer Type *
              </label>
              <div className="relative">
                <select
                  id="customer-type-select"
                  value={customerType}
                  onChange={handleCustomerTypeChange}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 appearance-none pr-8 cursor-pointer font-medium"
                >
                  <option value="Member">Member</option>
                  <option value="Consumer">Consumer</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Others Selection Input */}
          <div>
            <div ref={dropdownRef} className="relative">
              <label className="block text-[11px] font-bold text-slate-600 mb-1.5 flex items-center justify-between uppercase tracking-wider">
                <span>Adjustment / Others</span>
                <span className="text-[10px] text-blue-500 font-semibold lowercase">Multiple Allowed</span>
              </label>
              <button
                id="others-multiselect-trigger"
                type="button"
                onClick={() => setIsOthersDropdownOpen(!isOthersDropdownOpen)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md text-left text-slate-800 flex items-center justify-between hover:bg-slate-50 transition-all text-ellipsis overflow-hidden cursor-pointer"
              >
                <span className="truncate font-semibold text-slate-700">
                  {selectedOthers.length === 0
                    ? 'None'
                    : selectedOthers.map(val => val > 0 ? `+${val}` : `${val}`).join(', ')}
                </span>
                <div className="flex items-center space-x-1.5 shrink-0 pl-2">
                  <span className="bg-blue-50 text-blue-700 font-mono text-[11px] px-2 py-0.5 rounded border border-blue-100 font-bold">
                    SUM: {selectedOthers.reduce((a, b) => a + b, 0) > 0 ? '+' : ''}
                    {selectedOthers.reduce((a, b) => a + b, 0)}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </button>

              <AnimatePresence>
                {isOthersDropdownOpen && (
                  <motion.div
                    id="others-dropdown-menu"
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    className="absolute z-20 top-[calc(100%+4px)] left-0 w-full bg-white border border-slate-200 rounded-md shadow-md p-1 space-y-0.5"
                  >
                    <div className="text-[10px] font-bold uppercase text-slate-400 px-3 py-1 bg-slate-50 rounded mb-1 flex items-center justify-between tracking-wider">
                      <span>Available Adjustments</span>
                      <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    {othersOptions.map((opt) => {
                      const isSelected = selectedOthers.includes(opt.value);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleOthersOption(opt.value)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-sm transition-all text-left cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50/70 text-blue-700 font-semibold'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                              isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-350'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span>{opt.label}</span>
                          </div>
                          <span className={`font-mono text-[10px] font-bold ${
                            opt.value < 0 ? 'text-red-500' : opt.value === 0 ? 'text-slate-400' : 'text-emerald-600'
                          }`}>
                            {opt.value > 0 ? `+₱${opt.value}` : `₱${opt.value}`}
                          </span>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Consumption Readings */}
        <div id="readings-section-container" className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
            2. Consumption Reading
          </h3>

          <div className="grid grid-cols-3 gap-4">
            {/* Previous Reading */}
            <div>
              <label htmlFor="prev-reading-input" className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Previous (m³) *
              </label>
              <input
                id="prev-reading-input"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={previousReading}
                onChange={(e) => setPreviousReading(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 font-mono"
              />
            </div>

            {/* Present Reading */}
            <div>
              <label htmlFor="pres-reading-input" className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Present (m³) *
              </label>
              <input
                id="pres-reading-input"
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="0.00"
                value={presentReading}
                onChange={(e) => setPresentReading(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 font-mono"
              />
            </div>

            {/* Consumed Math Display */}
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">
                Consumed
              </label>
              <input
                type="text"
                readOnly
                value={calc.isValid ? `${calc.consumed.toFixed(2)} m³` : '0.00'}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-md text-blue-700 font-black font-mono focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Total banner & Ledger Line Items */}
        <AnimatePresence mode="wait">
          {previousReading !== '' && presentReading !== '' && (
            <motion.div
              id="live-calculation-card"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className={`transition-all ${calc.isValid ? '' : 'p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-800'}`}>
                {calc.isValid ? (
                  <div className="space-y-4">
                    {/* Itemized Calculation review list matching professional ledger standard */}
                    <div className="border-t border-slate-150 pt-4 space-y-2 text-xs">
                      <div className="flex justify-between text-slate-500">
                        <span>Base Charge: {calc.consumed < 3 ? 'Tariff < 3 flat rate' : `Volume (${calc.consumed.toFixed(2)}m³ * ₱30)`}</span>
                        <span className="font-semibold text-slate-800">₱{calc.consumed < 3 ? '100.00' : (calc.consumed * 30).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Fixed Tariff Fee</span>
                        <span className="font-semibold text-slate-800">₱10.00</span>
                      </div>
                      {selectedOthers.reduce((a, b) => a + b, 0) !== 0 && (
                        <div className="flex justify-between text-red-500 italic">
                          <span>Adjustments (Others Amount)</span>
                          <span className="font-extrabold font-mono">
                            {selectedOthers.reduce((a, b) => a + b, 0) > 0 ? '+' : ''}
                            ₱{selectedOthers.reduce((a, b) => a + b, 0).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Professional Polish Total Banner */}
                    <div className="bg-[#eff6ff] border-l-4 border-[#2563eb] p-5 rounded-r-lg shadow-2xs">
                      <span className="block text-[11px] font-bold text-[#2563eb] mb-1 uppercase tracking-wider">
                        Total Payable Amount
                      </span>
                      <div className="text-4xl font-extrabold text-[#1e3a8a] tracking-tight font-sans">
                        ₱{calc.totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <p className="text-[10px] text-blue-500 mt-2 font-medium">
                        Auto-calculated based on current municipal tariff rates.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start space-x-2.5">
                    <span className="font-black text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-0.5">ALERT</span>
                    <div className="text-xs">
                      <p className="font-bold text-red-800">Infeasible Reading Log</p>
                      <p className="text-red-650 mt-0.5">{calc.error}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form Actions */}
        <button
          id="billing-submit-button"
          type="submit"
          disabled={!customerName.trim() || !billingNumber.trim() || !calc.isValid}
          className={`w-full py-3 px-4 rounded-md font-bold text-xs flex items-center justify-center space-x-2 uppercase tracking-widest transition-all ${
            customerName.trim() && billingNumber.trim() && calc.isValid
              ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg shadow-blue-105 hover:shadow-blue-200 text-white cursor-pointer hover:translate-y-[-0.5px]'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          <Calculator className="w-4 h-4" />
          <span>Save & Generate Bill</span>
        </button>
      </form>
    </div>
  );
}
