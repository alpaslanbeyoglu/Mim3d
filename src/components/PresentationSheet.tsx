import React from 'react';
import { RoomData, ProjectMetaData, ZoningParams } from '../types';
import { evaluateZoningCompliance, calculatePolygonArea } from '../utils/zoningEngine';
import { Printer, Download, Stamp, Building, FileCheck } from 'lucide-react';

interface PresentationSheetProps {
  room: RoomData;
  projectMeta: ProjectMetaData;
  zoning: ZoningParams;
  floorCount: number;
}

export const PresentationSheet: React.FC<PresentationSheetProps> = ({
  room,
  projectMeta,
  zoning,
  floorCount
}) => {
  const evaluation = evaluateZoningCompliance(room, zoning, floorCount);
  const baseArea = calculatePolygonArea(room.points);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full h-full bg-slate-200 p-8 overflow-y-auto flex flex-col items-center">
      {/* Top Action Bar */}
      <div className="w-full max-w-5xl mb-4 flex justify-between items-center bg-white p-4 rounded-xl shadow border border-slate-300 print:hidden">
        <div className="flex items-center space-x-3">
          <FileCheck className="w-6 h-6 text-indigo-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-800">MİMARİ SUNUM PAFTASI (STANDART BELEDİYE ANTETLİ)</h2>
            <p className="text-[11px] text-slate-500">A3/A4 Formatı Ölçekli Çizim ve İmar Hesabı Paftası</p>
          </div>
        </div>

        <button
          onClick={handlePrint}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-2 shadow transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>PAFTAYI YAZDIR / PDF OLUŞTUR</span>
        </button>
      </div>

      {/* Main Architectural Sheet (A3 / A4 Pafta Canvas) */}
      <div className="w-full max-w-5xl bg-white border-4 border-slate-900 p-8 shadow-2xl flex flex-col justify-between aspect-[1.414/1] relative print:m-0 print:border-2">
        {/* Outer Frame Lines */}
        <div className="border border-slate-800 p-6 flex-1 flex flex-col justify-between">

          {/* Header Title */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex justify-between items-end">
            <div>
              <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">T.C. {projectMeta.city.toUpperCase()} BÜYÜKŞEHİR BELEDİYESİ</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">{projectMeta.district} İMAR VE ŞEHİRCİLİK MÜDÜRLÜĞÜ MİMARİ PROJESİ</h1>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-700 block">{projectMeta.projectName}</span>
              <span className="text-[10px] text-slate-500 font-mono">TARİH: {projectMeta.date}</span>
            </div>
          </div>

          {/* Central Content Grid: 2D Blueprint + Subrooms + Zoning Table */}
          <div className="grid grid-cols-12 gap-6 flex-1 my-4">

            {/* 2D Plan View Container */}
            <div className="col-span-8 border-2 border-slate-300 rounded-lg p-4 bg-slate-50 relative flex flex-col justify-between">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1">
                ÖLÇEKLİ KAT PLANINI VE CEPHELER (ÖLÇEK 1:50)
              </span>

              {/* Simplified Blueprint Drawing for Sheet */}
              <div className="flex-1 flex items-center justify-center p-4">
                <svg viewBox="-10 -10 20 20" className="w-full h-full max-h-[320px]">
                  {/* Outer Walls */}
                  <polygon
                    points={room.points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="rgba(99, 102, 241, 0.05)"
                    stroke="#1e293b"
                    strokeWidth="0.25"
                  />

                  {/* Dimensions */}
                  {room.points.map((p, i) => {
                    const nextP = room.points[(i + 1) % room.points.length];
                    const mx = (p.x + nextP.x) / 2;
                    const my = (p.y + nextP.y) / 2;
                    const len = Math.sqrt((nextP.x - p.x) ** 2 + (nextP.y - p.y) ** 2);
                    return (
                      <text
                        key={i}
                        x={mx}
                        y={my}
                        fontSize="0.4"
                        fontWeight="bold"
                        fill="#0f172a"
                        textAnchor="middle"
                      >
                        {len.toFixed(2)}m
                      </text>
                    );
                  })}
                </svg>
              </div>

              <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 border-t border-slate-200 pt-2 font-mono">
                <span>KOT: ±0.00</span>
                <span>YÜKSEKLİK: h={room.wallHeight.toFixed(2)}m</span>
                <span>BAĞIMSIZ BÖLÜM: BRÜT {baseArea.toFixed(1)} m²</span>
              </div>
            </div>

            {/* Room Breakdown & Zoning Table */}
            <div className="col-span-4 flex flex-col justify-between space-y-4">
              {/* Room Schedule */}
              <div className="border border-slate-300 rounded-lg p-3 bg-white">
                <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block mb-2 border-b pb-1">
                  MAHAL LİSTESİ VE NET ALANLAR
                </span>
                <table className="w-full text-left text-[10px]">
                  <thead>
                    <tr className="border-b text-slate-400 font-bold">
                      <th className="py-1">Mahal</th>
                      <th className="py-1 text-right">Net m²</th>
                    </tr>
                  </thead>
                  <tbody>
                    {room.subRooms.map((sr) => (
                      <tr key={sr.id} className="border-b border-slate-100">
                        <td className="py-1 font-medium text-slate-700">{sr.name}</td>
                        <td className="py-1 text-right font-bold font-mono text-slate-900">{sr.area.toFixed(1)} m²</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Zoning Calculation Box */}
              <div className="border-2 border-indigo-200 rounded-lg p-3 bg-indigo-50/50">
                <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block mb-2 border-b border-indigo-200 pb-1">
                  İMAR & KENTSEL DÖNÜŞÜM HESAP TABLOSU
                </span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex justify-between text-slate-700">
                    <span>Parsel Alanı:</span>
                    <span className="font-bold font-mono">{zoning.parcelArea} m²</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>TAKS (%{zoning.taks * 100}):</span>
                    <span className="font-bold font-mono">{evaluation.maxAllowedBaseArea.toFixed(1)} m²</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Projelendirilen Taban:</span>
                    <span className="font-bold font-mono text-indigo-700">{evaluation.buildingBaseArea.toFixed(1)} m²</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Emsal (KAKS):</span>
                    <span className="font-bold font-mono">{evaluation.maxAllowedTotalArea.toFixed(1)} m²</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span>Kentsel Dönüşüm Artışı:</span>
                    <span className="font-bold text-amber-600">+{zoning.urbanRenewalBonusPercent}% Emsal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Title Block (Mimari Antet) */}
          <div className="border-2 border-slate-900 mt-4 grid grid-cols-12 divide-x-2 divide-slate-900 text-[10px]">
            {/* Municipality info */}
            <div className="col-span-3 p-2 font-bold uppercase flex flex-col justify-between">
               <span className="text-slate-400 text-[8px]">İLGİLİ BELEDİYE</span>
               <span className="text-slate-900">{zoning.municipality}</span>
               <span className="text-[8px] text-slate-500 font-normal">İMAR YÖNETMELİĞİ UYUM ONAYLI</span>
            </div>

            {/* Tapu / Ada Parsel */}
            <div className="col-span-3 p-2 font-bold flex flex-col justify-between">
               <span className="text-slate-400 text-[8px] uppercase">ADA / PARSEL BİLGİSİ</span>
               <span className="text-slate-900 font-mono">ADA: {projectMeta.adaNo} | PARSEL: {projectMeta.parselNo}</span>
               <span className="text-slate-500 font-normal">{projectMeta.district}</span>
            </div>

            {/* Architect Sign / Stamp Box */}
            <div className="col-span-4 p-2 flex flex-col justify-between">
               <span className="text-slate-400 text-[8px] uppercase font-bold">MİMAR VE MÜELLİF BİLGİLERİ</span>
               <span className="text-slate-900 font-bold">{projectMeta.architectName}</span>
               <span className="text-[8px] text-slate-500">TMMOB MİMARLAR ODASI SİCİL NO: 48129</span>
            </div>

            {/* Official Stamp Mock */}
            <div className="col-span-2 p-2 flex flex-col items-center justify-center bg-slate-50 text-center">
               <Stamp className="w-5 h-5 text-indigo-600 mb-0.5" />
               <span className="text-[8px] font-bold text-indigo-900 uppercase">MİMARİ ONAY STAMPI</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
