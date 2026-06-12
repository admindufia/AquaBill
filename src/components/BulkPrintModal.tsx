import React from 'react';
import { motion } from 'motion/react';
import { X, Printer, Check, Copy, Droplet, Layers, MapPin, Calendar, FileText } from 'lucide-react';
import { BillingRecord } from '../types';

interface BulkPrintModalProps {
  records: BillingRecord[];
  invoiceName: string;
  onClose: () => void;
}

export default function BulkPrintModal(props: BulkPrintModalProps) {
  const { records, invoiceName, onClose } = props;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="bulk-receipt-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      {/* Custom print CSS strictly isolated here to prevent styling interference in default screen mode */}
      <style>{`
        @media print {
          /* Hide everything except our print target wrapper */
          #application-root-theme, 
          header, 
          footer, 
          #stats-dashboard-container, 
          #formula-guideline-card, 
          #split-layout-grid,
          #bulk-receipt-modal-header,
          #bulk-receipt-modal-footer,
          #receipt-modal-backdrop,
          .modal-actions-container {
            display: none !important;
            height: 0 !important;
            visibility: hidden !important;
            opacity: 0 !important;
          }
          
          /* Fullscreen print layout view configuration */
          #bulk-print-scrollable-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            height: auto !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background-color: white !important;
          }

          .print-receipt-ticket {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            border: 2px dashed #94a3b8 !important;
            box-shadow: none !important;
            margin-bottom: 30px !important;
            padding: 24px !important;
            background-color: white !important;
            border-radius: 8px !important;
          }
          
          body {
            background-color: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>

      <motion.div
        id="bulk-receipt-modal-panel"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div id="bulk-receipt-modal-header" className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-150 shrink-0">
          <div className="flex items-center space-x-2 text-slate-800">
            <Printer className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-bold text-base tracking-tight">Bulk Invoice Printing Queue</h3>
              <p className="text-3xs text-slate-400 font-medium">Rendered {records.length} water bills ready for dispatch</p>
            </div>
          </div>
          <button
            id="close-bulk-receipt-modal"
            onClick={onClose}
            className="p-1 px-1.5 rounded-lg hover:bg-slate-200/60 text-slate-400 hover:text-slate-700 transition-all font-semibold cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Receipt Previews & Physical Mockups */}
        <div 
          id="bulk-print-scrollable-content"
          className="p-6 md:p-8 overflow-y-auto flex-1 space-y-8 bg-slate-100/40"
        >
          {records.map((record, index) => {
            const formattedDate = new Date(record.createdAt).toLocaleString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });

            return (
              <div 
                key={record.id} 
                className="print-receipt-ticket bg-white p-6 rounded-xl border border-slate-250 shadow-sm relative max-w-lg mx-auto"
              >
                {/* Decorative cut rip dots */}
                <div className="absolute top-0 inset-x-0 h-1 bg-slate-200 flex overflow-hidden opacity-30 select-none print:hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-white rounded-full mt-[-5px] mx-[-1px] shrink-0" />
                  ))}
                </div>

                {/* Queue Tag on screen only */}
                <div className="absolute top-4 right-4 text-slate-350 bg-slate-50 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-slate-150 print:hidden select-none">
                  # {index + 1} of {records.length}
                </div>

                {/* Utility Brand Header */}
                <div className="text-center pb-4 border-b border-dashed border-slate-200">
                  <div className="inline-flex p-1.5 bg-blue-100 text-blue-600 rounded-full mb-1">
                    <Droplet className="w-5 h-5 fill-blue-500" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 tracking-wider uppercase">
                    {invoiceName || 'Municipal Water Utility'}
                  </h4>
                  <p className="text-[9px] text-slate-400 font-mono tracking-widest mt-0.5 uppercase">
                    OFFICIAL WATER UTILITY DISPATCH RECEIPT
                  </p>
                </div>

                {/* Customer Records Details Stack */}
                <div className="py-4 space-y-1.5 text-xs font-mono text-slate-700 border-b border-dashed border-slate-200">
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

                {/* Readings Statistics */}
                <div className="py-4 border-b border-dashed border-slate-200 text-xs font-mono">
                  <span className="text-2xs font-bold text-slate-400 block uppercase mb-2 leading-none">Reading Log (cubic meters)</span>
                  <div className="space-y-1 text-slate-705">
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

                {/* Billing Formulas */}
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

                  {/* Adjustments */}
                  <div className="flex justify-between text-slate-700">
                    <div>
                      <span>Others (Adjustments)</span>
                      <p className="text-4xs text-slate-400 font-sans leading-tight mt-0.5">
                        Adjustments sum: {record.others.map(o => o > 0 ? `+${o}` : `${o}`).join(', ')}
                      </p>
                    </div>
                    <span className={`font-bold shrink-0 ${record.others.reduce((a, b) => a + b, 0) < 0 ? 'text-rose-650' : 'text-slate-800'}`}>
                      {record.others.reduce((a, b) => a + b, 0) > 0 ? '+' : ''}
                      ₱{record.others.reduce((a, b) => a + b, 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Due Sum Banner */}
                <div className="pt-4 text-center">
                  <span className="text-3xs font-extrabold uppercase text-slate-400 tracking-wider block">Grand Payable Total</span>
                  <h2 className="text-2xl font-black text-blue-600 font-mono mt-1">
                    ₱{record.totalPayable.toFixed(2)}
                  </h2>
                </div>

                {/* Decorative cut rip dots */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-200 flex overflow-hidden opacity-30 select-none print:hidden">
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div key={i} className="w-2.5 h-2.5 bg-white rounded-full mb-[-5px] mx-[-1px] shrink-0" />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Actions */}
        <div id="bulk-receipt-modal-footer" className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-150 gap-4 shrink-0 modal-actions-container">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-250 rounded-xl transition-all cursor-pointer"
          >
            Cancel Queue
          </button>
          
          <button
            onClick={handlePrint}
            className="flex-1 py-3 px-6 bg-blue-650 hover:bg-blue-700 hover:shadow-lg text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer select-none"
          >
            <Printer className="w-4 h-4" />
            <span>Launch Printing Dialog ({records.length} Bills)</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
