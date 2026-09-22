import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Percent,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Layers,
  Sparkles
} from 'lucide-react';
import { RoomData, ZoningParams } from '../types';
import { evaluateZoningCompliance } from '../utils/zoningEngine';

interface ZoningReportProps {
  room: RoomData;
  zoning: ZoningParams;
  setZoning: React.Dispatch<React.SetStateAction<ZoningParams>>;
  floorCount: number;
}

export const ZoningReport: React.FC<ZoningReportProps> = ({
  room,
  zoning,
  setZoning,
  floorCount
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const evaluation = evaluateZoningCompliance(room, zoning, floorCount);
  const { buildingBaseArea, totalConstructionArea, maxAllowedBaseArea, maxAllowedTotalArea, violations } = evaluation;

  const taksPercent = Math.round((buildingBaseArea / zoning.parcelArea) * 100);
  const allowedTaksPercent = Math.round(zoning.taks * 100);

  const hasErrors = violations.some(v => v.severity === 'error');
  const hasWarnings = violations.some(v => v.severity === 'warning');

  return (
    <div className="bg-white border-t border-slate-200 shadow-md">
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-6 py-3 bg-slate-900 text-white flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-indigo-400" />
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold tracking-wider uppercase">İmar & Kentsel Dönüşüm Uyum Denetimi</span>
            <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-400/30">
              TR/İST YÖNETMELİĞİ
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/40 rounded-full text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                {violations.filter(v => v.severity === 'error').length} İhlal Mevcut
              </span>
            ) : hasWarnings ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                {violations.filter(v => v.severity === 'warning').length} Uyarı
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                İmara Tam Uygun
              </span>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowConfig(!showConfig);
            }}
            className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-slate-200 transition-colors font-medium"
          >
            {showConfig ? 'Parametreleri Gizle' : 'İmar Parametrelerini Düzenle'}
          </button>

          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </div>
      </div>

      {/* Main Body */}
      {isOpen && (
        <div className="p-4 bg-slate-50 border-b border-slate-200 max-h-[300px] overflow-y-auto">
          {/* Quick Config Modal/Panel */}
          {showConfig && (
            <div className="mb-4 p-4 bg-white border border-indigo-100 rounded-xl shadow-inner grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Belediye / Bölge</label>
                <input
                  type="text"
                  value={zoning.municipality}
                  onChange={(e) => setZoning({...zoning, municipality: e.target.value})}
                  className="w-full border border-slate-200 rounded px-2 py-1 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">Parsel Alanı (m²)</label>
                <input
                  type="number"
                  value={zoning.parcelArea}
                  onChange={(e) => setZoning({...zoning, parcelArea: Number(e.target.value)})}
                  className="w-full border border-slate-200 rounded px-2 py-1 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">TAKS (Taban Katsayısı)</label>
                <input
                  type="number"
                  step="0.05"
                  value={zoning.taks}
                  onChange={(e) => setZoning({...zoning, taks: Number(e.target.value)})}
                  className="w-full border border-slate-200 rounded px-2 py-1 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-bold mb-1">KAKS / Emsal</label>
                <input
                  type="number"
                  step="0.1"
                  value={zoning.kaks}
                  onChange={(e) => setZoning({...zoning, kaks: Number(e.target.value)})}
                  className="w-full border border-slate-200 rounded px-2 py-1 font-semibold"
                />
              </div>

              <div className="flex items-center gap-2 pt-2 col-span-2">
                <input
                  type="checkbox"
                  id="urban-check"
                  checked={zoning.isUrbanRenewal}
                  onChange={(e) => setZoning({...zoning, isUrbanRenewal: e.target.checked})}
                  className="w-4 h-4 text-indigo-600 rounded"
                />
                <label htmlFor="urban-check" className="font-bold text-slate-700 flex items-center gap-1 cursor-pointer">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Kentsel Dönüşüm İmar Artışı Uyuşması (%25 - %30 Emsal Bonusu)
                </label>
              </div>

              {zoning.isUrbanRenewal && (
                <div>
                  <label className="block text-slate-500 font-bold mb-1">Dönüşüm Artış Oranı (%)</label>
                  <input
                    type="number"
                    value={zoning.urbanRenewalBonusPercent}
                    onChange={(e) => setZoning({...zoning, urbanRenewalBonusPercent: Number(e.target.value)})}
                    className="w-full border border-slate-200 rounded px-2 py-1 font-semibold text-indigo-600"
                  />
                </div>
              )}
            </div>
          )}

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Taban Oturumu (TAKS)</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-slate-800">{buildingBaseArea.toFixed(1)} m²</span>
                <span className="text-xs text-slate-400 font-medium">/ Azami {maxAllowedBaseArea.toFixed(1)} m²</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full ${buildingBaseArea > maxAllowedBaseArea ? 'bg-red-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min(100, (buildingBaseArea / maxAllowedBaseArea) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                Top. İnşaat Alanı (KAKS)
                {zoning.isUrbanRenewal && <span className="text-amber-500 font-bold">+%{zoning.urbanRenewalBonusPercent} Bonus</span>}
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-slate-800">{totalConstructionArea.toFixed(1)} m²</span>
                <span className="text-xs text-slate-400 font-medium">/ Max {maxAllowedTotalArea.toFixed(1)} m²</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className={`h-full ${totalConstructionArea > maxAllowedTotalArea ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.min(100, (totalConstructionArea / maxAllowedTotalArea) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kat Sayısı / Gabari</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-base font-black text-slate-800">{floorCount} Kat</span>
                <span className="text-xs text-slate-400 font-medium">/ Azami {zoning.maxFloors} Kat</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">Net Yükseklik: {room.wallHeight.toFixed(2)}m</span>
            </div>

            <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Kentsel Dönüşüm Durumu</span>
              <div className="flex items-center gap-1.5 mt-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-800">
                  {zoning.isUrbanRenewal ? `Teşvikli (+%${zoning.urbanRenewalBonusPercent} Emsal)` : 'Standart İmar'}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">{zoning.municipality}</span>
            </div>
          </div>

          {/* Violations & Warnings List */}
          {violations.length > 0 ? (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Tespit Edilen Uygunsuzluklar ({violations.length})</span>
              {violations.map((v) => (
                <div
                  key={v.id}
                  className={`p-3 rounded-lg border flex items-start gap-3 text-xs ${
                    v.severity === 'error'
                      ? 'bg-red-50 border-red-200 text-red-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${v.severity === 'error' ? 'text-red-600' : 'text-amber-600'}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between font-bold">
                      <span>[{v.code}] {v.title}</span>
                      <span className="font-mono text-[10px] bg-white/80 px-2 py-0.5 rounded border">
                        Mevcut: {v.currentValue} | Sınır: {v.allowedValue}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 opacity-90">{v.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Proje; Türkiye Planlı Alanlar İmar Yönetmeliği ve {zoning.municipality} standartlarına tamamen uygundur.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
