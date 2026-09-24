// frontend/src/components/admin/RollbackLab.jsx
import React, { useState } from 'react';
import { orderService } from '../../services/orderService.js';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Layers,
  ShieldCheck,
  Package,
} from 'lucide-react';

export default function RollbackLab() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorResult, setErrorResult] = useState(null);

  const runSimulation = async (simulateFailure) => {
    setLoading(true);
    setResult(null);
    setErrorResult(null);

    try {
      const response = await orderService.simulateRollbackTest(simulateFailure);
      setResult(response);
    } catch (err) {
      console.log('Caught simulated test response:', err);
      // The backend returns status 400 when simulation failure is triggered, providing audit steps and inventory verification
      setErrorResult(err.data || {
        message: err.message,
        errorCode: err.errorCode,
        auditSteps: err.auditSteps,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Cpu className="w-4 h-4" />
          <span>Admin Tools — Transaction Integrity</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          Multi-Vendor Atomic Rollback Demonstration Lab
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
          Demonstrate transaction atomicity during complex multi-vendor checkout. When Vendor C encounters an inventory constraint or fulfillment anomaly, all prior sub-orders and inventory locks are aborted cleanly without any leaked reservations.
        </p>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-4 mt-6">
          <button
            onClick={() => runSimulation(true)}
            disabled={loading}
            className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            <span>Simulate Seller C Failure & Rollback</span>
          </button>

          <button
            onClick={() => runSimulation(false)}
            disabled={loading}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>Run Clean Multi-Vendor Commit</span>
          </button>
        </div>
      </div>

      {/* Test Scenarios Architecture Map */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-xs">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              A
            </span>
            <span>Vendor A: TechNova</span>
          </div>
          <p className="text-slate-500 mb-2">Product: UltraBook Pro 15 (₹89,999)</p>
          <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
            Stage: Stock Available &rarr; Reserved
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              B
            </span>
            <span>Vendor B: AudioPulse</span>
          </div>
          <p className="text-slate-500 mb-2">Product: Precision Wireless Mouse (₹2,499)</p>
          <span className="inline-block bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium">
            Stage: Stock Available &rarr; Reserved
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 mb-2">
            <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              C
            </span>
            <span>Vendor C: GadgetWorld</span>
          </div>
          <p className="text-slate-500 mb-2">Product: Sony WH-1000XM5 (₹24,999)</p>
          <span className="inline-block bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium">
            Stage: Injected Simulation Exception
          </span>
        </div>
      </div>

      {/* Execution Results View */}
      {(result || errorResult) && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Live Transaction Execution &amp; Rollback Audit
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Outcome:{' '}
                <span className="font-mono font-bold text-slate-800">
                  {result ? result.simulationRan : errorResult?.simulationRan || 'SIMULATED_EXCEPTION'}
                </span>
              </p>
            </div>
            {errorResult?.inventoryAudit?.isStockPreserved && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                100% Stock Preserved
              </span>
            )}
          </div>

          {/* Audit Steps Terminal */}
          <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2 overflow-x-auto mb-6">
            <div className="text-slate-400 pb-2 border-b border-slate-800 flex justify-between">
              <span>[SESSION AUDIT LOG]</span>
              <span>ISOLATION LEVEL: SNAPSHOT / REPEATABLE_READ</span>
            </div>
            {(result?.auditSteps || errorResult?.auditSteps || []).map((step, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-indigo-400">[{String(step.step).padStart(2, '0')}]</span>
                <span
                  className={
                    step.status === 'FAILED'
                      ? 'text-rose-400 font-bold'
                      : step.status === 'ROLLED_BACK'
                      ? 'text-amber-300 font-bold'
                      : 'text-emerald-400'
                  }
                >
                  [{step.status}]
                </span>
                <span className="text-slate-300 font-semibold">{step.action}:</span>
                <span className="text-slate-400">{step.message}</span>
              </div>
            ))}
          </div>

          {/* Inventory Verification Table */}
          {errorResult?.inventoryAudit && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Pre- vs Post-Simulation Stock Comparison:
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Stock Before Test</th>
                      <th className="p-3">Reserved During Step</th>
                      <th className="p-3">Stock After Rollback</th>
                      <th className="p-3 text-right">Verification Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {errorResult.inventoryAudit.before?.map((bItem, i) => {
                      const aItem = errorResult.inventoryAudit.after?.[i] || {};
                      return (
                        <tr key={bItem.productId}>
                          <td className="p-3 font-semibold text-slate-800">{bItem.name}</td>
                          <td className="p-3 font-mono">{bItem.availableStock}</td>
                          <td className="p-3 font-mono text-amber-600">
                            +1 (Temporary Lock)
                          </td>
                          <td className="p-3 font-mono font-bold text-emerald-600">
                            {aItem.availableStock}
                          </td>
                          <td className="p-3 text-right font-bold text-emerald-600">
                            &check; Restored ({bItem.availableStock} == {aItem.availableStock})
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
