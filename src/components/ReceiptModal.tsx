import { motion } from 'motion/react';
import { X, Printer, Milestone, FileText, Droplet, Check, Copy } from 'lucide-react';
import { BillingRecord } from '../types';
import { useState } from 'react';

interface ReceiptModalProps {
  record: BillingRecord | null;
  invoiceName: string;
  onClose: () => void;
}

export default function ReceiptModal(props: ReceiptModalProps) {
  const { record, invoiceName, onClose } = props;
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const handleCopy = () => {
    const text = `
--------------------------------------------
      ${invoiceName.toUpperCase()} BILL
--------------------------------------------
ID:          ${record.id}
Customer:    ${record.customerName}
Billing #:   ${record.billingNumber}
Address:     ${record.address}
Lateral:     ${record.lateral}
Type:        ${record.customerType}
Date:        ${new Date(record.createdAt).toLocaleDateString()}
--------------------------------------------
Previous Reading:  ${record.previousReading.toFixed(2)} m³
Present Reading:   ${record.presentReading.toFixed(2)} m³
Consumed:          ${record.consumed.toFixed(2)} m³
--------------------------------------------
Base Payable:      ₱${record.basePayable.toFixed(2)}
Adjustments (Others): ₱${record.others.reduce((a, b) => a + b, 0).toFixed(2)}
============================================
TOTAL PAYABLE:     ₱${record.totalPayable.toFixed(2)}
============================================
    Thank you! Please pay in full.
--------------------------------------------
    `;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(record.createdAt).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div id="receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        id="receipt-modal-panel"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-slate-800">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base tracking-tight">Invoice Receipt</h3>
          </div>
          <button
            id="close-receipt-modal"
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-all font-semibold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Receipt Physical Mockup Container */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/75 relative">
            {/* Top decorative cutout ripples */}
            <div className="absolute top-0 inset-x-0 h-1 bg-slate-200 flex overflow-hidden opacity-30 select-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 bg-white rounded-full mt-[-5px] mx-[-1px] shrink-0" />
              ))}
            </div>

            {/* Utility Brand Details */}
            <div className="text-center pb-4 border-b border-dashed border-slate-200 mt-2">
              <div className="inline-flex p-1.5 bg-blue-100 text-blue-600 rounded-full mb-1">
                <Droplet className="w-5 h-5 fill-blue-500" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800 tracking-wider uppercase">
                {invoiceName || 'Municipal Water Utility'}
              </h4>
              <p className="text-3xs text-slate-400 font-mono tracking-widest mt-0.5 uppercase">
                EST. 1994 • REGISTERED DISPATCH
              </p>
            </div>

            {/* Customer metadata stack */}
            <div className="py-4 space-y-2 text-xs font-mono text-slate-700 border-b border-dashed border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-400">INVOICE ID:</span>
                <span className="font-bold text-slate-900">{record.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">BILLING # / METER:</span>
                <span className="font-bold text-slate-900">{record.billingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CUSTOMER NAME:</span>
                <span className="font-bold text-slate-900">{record.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">SERVICE ADDRESS:</span>
                <span className="font-bold text-slate-900 text-right max-w-[200px] truncate">{record.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">LATERAL FEEDER:</span>
                <span className="font-bold text-slate-900">{record.lateral || 'Lateral A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CUSTOMER TYPE:</span>
                <span className="font-bold text-blue-600 bg-blue-50 px-1 rounded text-2xs">{record.customerType}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-slate-400">CREATED TIME:</span>
                <span className="text-slate-600 font-sans text-3xs">{formattedDate}</span>
              </div>
            </div>

            {/* Water Readings Calculation */}
            <div className="py-4 border-b border-dashed border-slate-200 text-xs font-mono">
              <span className="text-2xs font-bold text-slate-400 block uppercase mb-2 leading-none">Reading Log (Cubic Meters)</span>
              <div className="space-y-1.5 text-slate-705">
                <div className="flex justify-between">
                  <span>Present Reading:</span>
                  <span className="font-bold text-slate-800">{record.presentReading.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Reading:</span>
                  <span className="font-bold text-slate-800">{record.previousReading.toFixed(2)} m³</span>
                </div>
                <div className="flex justify-between items-center text-blue-700 pt-1 font-semibold">
                  <span>Consumption Total:</span>
                  <span className="bg-blue-50 px-1.5 py-0.5 rounded text-xs font-bold">{record.consumed.toFixed(2)} m³</span>
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="py-4 border-b border-dashed border-slate-200 text-xs font-mono space-y-2">
              <span className="text-2xs font-bold text-slate-400 block uppercase mb-1 leading-none">Charge Breakdown</span>
              
              <div className="flex justify-between text-slate-700">
                <div className="max-w-[240px]">
                  <span>Base Water Rate</span>
                  <p className="text-4xs text-slate-400 font-sans leading-tight mt-0.5">
                    {record.consumed < 3 
                      ? 'Flat rate: ₱100 + ₱10' 
                      : `Consolidated: (${record.consumed.toFixed(2)} m³ × ₱30) + ₱10`}
                  </p>
                </div>
                <span className="font-bold text-slate-800 shrink-0">₱{record.basePayable.toFixed(2)}</span>
              </div>

              {/* Adjustments (Others) */}
              <div className="flex justify-between text-slate-700">
                <div>
                  <span>Others (Adjustments)</span>
                  <p className="text-4xs text-slate-400 font-sans leading-tight mt-0.5">
                    Selected choices: {record.others.map(o => o > 0 ? `+${o}` : `${o}`).join(', ')}
                  </p>
                </div>
                <span className={`font-bold shrink-0 ${record.others.reduce((a, b) => a + b, 0) < 0 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {record.others.reduce((a, b) => a + b, 0) > 0 ? '+' : ''}
                  ₱{record.others.reduce((a, b) => a + b, 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Total Due Amount */}
            <div className="pt-4 text-center">
              <span className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider block">Grand Payable Total</span>
              <h2 className="text-3xl font-extrabold text-blue-600 font-mono mt-1 tracking-tight">
                ₱{record.totalPayable.toFixed(2)}
              </h2>
              <div className="inline-flex items-center space-x-1 mt-2 text-4xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Check className="w-2.5 h-2.5" />
                <span>BILLING STATUS: ACTIVE COMPUTE</span>
              </div>
            </div>

            {/* Bottom decorative cutout ripples */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-200 flex overflow-hidden opacity-30 select-none">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="w-2.5 h-2.5 bg-white rounded-full mb-[-5px] mx-[-1px] shrink-0" />
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-55 border-t border-slate-100 gap-3">
          <button
            id="copy-text-receipt"
            onClick={handleCopy}
            className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
              copied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copied ? <Check className="w-4.5 h-4.5" /> : <Copy className="w-4 h-4 text-slate-400" />}
            <span>{copied ? 'Copied Ledger!' : 'Copy String Spec'}</span>
          </button>
          
          <button
            id="print-receipt-btn"
            onClick={() => window.print()}
            className="flex-1 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Mock Print Bill</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
