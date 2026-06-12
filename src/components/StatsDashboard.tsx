import { motion } from 'motion/react';
import { Droplet, DollarSign, Users, TrendingUp } from 'lucide-react';
import { BillingRecord } from '../types';

interface StatsDashboardProps {
  records: BillingRecord[];
}

export default function StatsDashboard(props: StatsDashboardProps) {
  const { records } = props;

  const totalBills = records.length;
  const totalConsumed = records.reduce((sum, r) => sum + r.consumed, 0);
  const totalAmount = records.reduce((sum, r) => sum + r.totalPayable, 0);
  const avgAmount = totalBills > 0 ? totalAmount / totalBills : 0;
  
  const consumerCount = records.filter(r => r.customerType === 'Consumer').length;
  const memberCount = records.filter(r => r.customerType === 'Member').length;

  const cardVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
  };

  return (
    <div id="stats-dashboard-container" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
      {/* Total Receivables Card */}
      <motion.div
        id="stat-card-receivables"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-4"
      >
        <div className="p-3 bg-blue-50 text-blue-600 rounded-md">
          <DollarSign className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Total Receivables</p>
          <h3 className="text-2xl font-black text-slate-800 font-sans mt-1.5">
            ₱{totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">{totalBills} registered invoice(s)</p>
        </div>
      </motion.div>

      {/* Water Consumed */}
      <motion.div
        id="stat-card-consumption"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-4"
      >
        <div className="p-3 bg-cyan-50 text-cyan-600 rounded-md">
          <Droplet className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Water Consumed</p>
          <h3 className="text-2xl font-black text-slate-800 font-sans mt-1.5">
            {totalConsumed.toLocaleString('en-US', { maximumFractionDigits: 2 })} <span className="text-xs font-normal text-slate-400">m³</span>
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">
            Avg: {totalBills > 0 ? (totalConsumed / totalBills).toFixed(1) : 0} m³ / user
          </p>
        </div>
      </motion.div>

      {/* Average Bill Amount */}
      <motion.div
        id="stat-card-average"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-4"
      >
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-md">
          <TrendingUp className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Average Billing</p>
          <h3 className="text-2xl font-black text-slate-800 font-sans mt-1.5">
            ₱{avgAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 font-mono">Per dispatch cycle</p>
        </div>
      </motion.div>

      {/* Customer Ratio Breakdown */}
      <motion.div
        id="stat-card-customers"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex items-center space-x-4 min-w-0"
      >
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-md shrink-0">
          <Users className="w-6 h-6" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">User Ratio</p>
          <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 mt-1.5">
            <span className="text-xl font-black text-slate-800">{consumerCount}</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Consumers</span>
            <span className="text-slate-300 font-light">|</span>
            <span className="text-xl font-black text-slate-800">{memberCount}</span>
            <span className="text-[10px] font-bold text-emerald-600 uppercase">Members</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 font-mono truncate">
            {totalBills > 0 ? `${Math.round((consumerCount / totalBills) * 100)}% Consumers` : '0 profiles registered'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
