import { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Eye, 
  Filter, 
  MapPin, 
  Layers, 
  Calendar,
  Inbox,
  Printer
} from 'lucide-react';
import { BillingRecord, CustomerType } from '../types';

interface BillingTableProps {
  records: BillingRecord[];
  onDeleteRecord: (id: string) => void;
  onViewRecord: (record: BillingRecord) => void;
  onBulkPrint: (records: BillingRecord[]) => void;
}

export default function BillingTable(props: BillingTableProps) {
  const { records, onDeleteRecord, onViewRecord, onBulkPrint } = props;

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<CustomerType | 'All'>('All');
  const [selectedLateral, setSelectedLateral] = useState<string>('All');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Extract unique laterals from current list
  const uniqueLaterals = Array.from(
    new Set(records.map(r => r.lateral).filter(Boolean))
  ).sort();

  // Filtered Records
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.billingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.id.includes(searchTerm) ||
      record.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'All' || record.customerType === selectedType;
    const matchesLateral = selectedLateral === 'All' || record.lateral === selectedLateral;

    return matchesSearch && matchesType && matchesLateral;
  });

  // Batch selection actions
  const isAllSelected = filteredRecords.length > 0 && filteredRecords.every(r => selectedIds.has(r.id));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      const next = new Set(selectedIds);
      filteredRecords.forEach(r => next.delete(r.id));
      setSelectedIds(next);
    } else {
      const next = new Set(selectedIds);
      filteredRecords.forEach(r => next.add(r.id));
      setSelectedIds(next);
    }
  };

  const handleRowSelectToggle = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  return (
    <div id="billing-ledger-container" className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
      {/* Table Header Filter controls */}
      <div className="p-6 border-b border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-lg text-slate-800 tracking-tight">Billing Logs & Ledger</h2>
            <p className="text-xs text-slate-400">Total {records.length} customers registered. Showing {filteredRecords.length}.</p>
          </div>

          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            {/* Filter Pill: All */}
            <button
              id="filter-all"
              onClick={() => setSelectedType('All')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedType === 'All'
                  ? 'bg-white text-slate-800 shadow-3xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            {/* Filter Pill: Member */}
            <button
              id="filter-members"
              onClick={() => setSelectedType('Member')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedType === 'Member'
                  ? 'bg-white text-blue-600 shadow-3xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Members
            </button>
            {/* Filter Pill: Consumer */}
            <button
              id="filter-consumers"
              onClick={() => setSelectedType('Consumer')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                selectedType === 'Consumer'
                  ? 'bg-white text-indigo-600 shadow-3xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Consumers
            </button>
          </div>
        </div>

        {/* Search & Select Lateral inputs in a neat bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search box */}
          <div className="sm:col-span-2 relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              id="ledger-search-input"
              type="text"
              placeholder="Search by ID, name, meter number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-650 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Select Lateral line dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <select
              id="ledger-lateral-select"
              value={selectedLateral}
              onChange={(e) => setSelectedLateral(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-xs bg-white border border-slate-300 rounded-md focus:outline-hidden focus:border-blue-650 focus:ring-1 focus:ring-blue-600 transition-all text-slate-800 appearance-none font-medium cursor-pointer"
            >
              <option value="All">All Laterals</option>
              {uniqueLaterals.map(lat => (
                <option key={lat} value={lat}>{lat}</option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 pointer-events-none text-slate-400 font-bold text-3xs">▼</div>
          </div>
        </div>

        {/* Beautiful Floating Contextual Bulk Action Panel */}
        {selectedIds.size > 0 && (
          <div id="bulk-selection-bar" className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-lg text-xs">
            <div className="flex items-center space-x-2.5 text-blue-900 font-semibold">
              <Printer className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Selected <strong className="text-blue-700">{selectedIds.size}</strong> water bills in batch sequence</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setSelectedIds(new Set())}
                className="px-2.5 py-1.5 text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-white border border-slate-200 rounded-lg cursor-pointer transition-all uppercase"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => {
                  const selectedRecords = records.filter(r => selectedIds.has(r.id));
                  onBulkPrint(selectedRecords);
                }}
                className="px-3.5 py-1.5 text-[10px] font-black text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm cursor-pointer transition-all uppercase tracking-wider flex items-center space-x-1"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Bulk Print ({selectedIds.size})</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Ledger Table Section */}
      <div className="overflow-x-auto">
        {filteredRecords.length > 0 ? (
          <table id="billing-ledger-table" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAllToggle}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 text-center w-16">ID</th>
                <th className="py-3 px-5">Customer & Connection</th>
                <th className="py-3 px-4">Line Feeder</th>
                <th className="py-3 px-4 text-center">Consumption (m³)</th>
                <th className="py-3 px-4 text-right">Bills Amount</th>
                <th className="py-3 px-5 text-center">Date Logged</th>
                <th className="py-3 px-4 text-right w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredRecords.map((record) => (
                <tr 
                  key={record.id} 
                  id={`ledger-row-${record.id}`}
                  className={`hover:bg-slate-50/40 transition-colors group ${selectedIds.has(record.id) ? 'bg-blue-50/20' : ''}`}
                >
                  {/* Selection Checkbox */}
                  <td className="py-4 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(record.id)}
                      onChange={() => handleRowSelectToggle(record.id)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                    />
                  </td>

                  {/* ID */}
                  <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {record.id}
                    </span>
                  </td>

                  {/* Customer Information Column */}
                  <td className="py-4 px-5">
                    <div className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                      {record.customerName}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-slate-400 text-[10px] font-semibold bg-slate-50 px-1 py-0.25 rounded border border-slate-150">
                        {record.billingNumber}
                      </span>
                      <span className={`px-1.5 py-0.25 text-[9px] font-extrabold rounded ${
                        record.customerType === 'Consumer'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      }`}>
                        {record.customerType}
                      </span>
                    </div>
                  </td>

                  {/* Address & Lateral line */}
                  <td className="py-4 px-4 space-y-1">
                    <div className="flex items-center space-x-1.5 text-slate-500 max-w-[150px] truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{record.address}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Layers className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                      <span>{record.lateral || 'Lateral A'}</span>
                    </div>
                  </td>

                  {/* Consumption Values Column */}
                  <td className="py-4 px-4 text-center">
                    <div className="font-bold font-mono text-slate-800 text-sm">
                      {record.consumed.toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-450 mt-0.5">
                      {record.previousReading.toFixed(2)} ➡️ {record.presentReading.toFixed(2)}
                    </div>
                  </td>

                  {/* Payable Amount with summary choices */}
                  <td className="py-4 px-4 text-right font-mono">
                    <div className="font-extrabold text-blue-600 text-sm">
                      ₱{record.totalPayable.toFixed(2)}
                    </div>
                    {record.others.length > 0 && record.others.some(v => v !== 0) && (
                      <div className="text-[9px] text-red-500 font-extrabold bg-red-50 border border-red-100 rounded px-1.5 inline-block mt-0.5">
                        {record.others.reduce((a,b)=>a+b, 0) > 0 ? '+' : ''}₱{record.others.reduce((a,b)=>a+b, 0)}
                      </div>
                    )}
                  </td>

                  {/* Formatted Creation Date */}
                  <td className="py-4 px-5 text-center text-slate-500">
                    <div className="flex items-center justify-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-350" />
                      <span>{new Date(record.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  {/* Record Control Actions */}
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {/* View Receipt button */}
                      <button
                        id={`view-btn-${record.id}`}
                        onClick={() => onViewRecord(record)}
                        title="View Receipt Invoice"
                        className="p-1 px-2 border border-slate-300 rounded-md text-slate-700 bg-white hover:bg-slate-50 font-semibold text-[10px] transition-all cursor-pointer flex items-center space-x-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-450" />
                        <span>Bill</span>
                      </button>

                      {/* Delete button */}
                      <button
                        id={`delete-btn-${record.id}`}
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove client "${record.customerName}" from ledger logs?`)) {
                            onDeleteRecord(record.id);
                          }
                        }}
                        title="Delete Ledger Entry"
                        className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-700 border border-red-100 rounded-md cursor-pointer transition-all active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          /* Empty State */
          <div className="text-center py-16 px-6 flex flex-col items-center justify-center">
            <div className="p-4 bg-slate-50 text-slate-300 rounded-full mb-3.5">
              <Inbox className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-slate-700 text-sm">No Ledger Entries Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Adjust your query, select other filters, or save new computations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
