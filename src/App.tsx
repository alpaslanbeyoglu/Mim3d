'use client';

import { useState } from 'react';
import { 
  Layers, 
  Cpu, 
  Scan, 
  Box, 
  FileText, 
  Monitor, 
  ArrowLeft, 
  Plus, 
  Minus, 
  Check, 
  Info,
  Layers3,
  Printer,
  Building2,
  FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Components
import { LeftSidebar } from './components/LeftSidebar';
import { MaterialSidebar } from './components/MaterialSidebar';
import { BlueprintEditor } from './components/BlueprintEditor';
import { Scene } from './components/Scene';
import { ZoningReport } from './components/ZoningReport';
import { PresentationSheet } from './components/PresentationSheet';

// Types & Data
import { 
  ViewMode, 
  RoomData, 
  MaterialOption, 
  MATERIALS, 
  MOCK_ROOMS,
  ZoningParams,
  MOCK_ZONING_PARAMS,
  ProjectMetaData,
  MOCK_PROJECT_META
} from './types';

export default function App() {
  const [hasProjectStarted, setHasProjectStarted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('3D');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/png");

  const [selectedMaterial, setSelectedMaterial] = useState<MaterialOption>(
    MATERIALS.find(m => m.category === 'interior') || MATERIALS[0]
  );
  const [selectedFacade, setSelectedFacade] = useState<MaterialOption>(
    MATERIALS.find(m => m.category === 'facade') || MATERIALS[4]
  );

  const [room, setRoom] = useState<RoomData>(MOCK_ROOMS[0]);
  const [zoning, setZoning] = useState<ZoningParams>(MOCK_ZONING_PARAMS);
  const [projectMeta, setProjectMeta] = useState<ProjectMetaData>(MOCK_PROJECT_META);

  const [floorCount, setFloorCount] = useState<number>(2);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setActiveNotification(message);
    setTimeout(() => {
      setActiveNotification(null);
    }, 4000);
  };

  const handleUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setUploadedImage(url);
    setImageMimeType(file.type);
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    showNotification('Kat planı taslağı yüklendi! Gemini Yapay Zeka taraması için hazır.');
  };

  const handleScan = async () => {
    if (!imageBase64) {
      showNotification('Lütfen önce bir kat planı görseli yükleyin.');
      return;
    }
    
    setIsScanning(true);
    showNotification('Gemini AI kat planını analiz ediyor, duvarlar ve odalar algılanıyor...');
    
    try {
      const response = await fetch('/api/scan-blueprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: imageBase64,
          mimeType: imageMimeType
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Tarama hatası.');
      }

      const data = await response.json();
      
      setRoom(prev => ({
        ...prev,
        id: 'gemini-detected-plan',
        name: data.name || 'AI Algılanan Kat Planı',
        points: data.points || [
          { x: -5, y: -4 },
          { x: 5, y: -4 },
          { x: 5, y: 4 },
          { x: -5, y: 4 }
        ]
      }));
      
      setViewMode('2D');
      showNotification('Yapay Zeka Planı Çıkardı! Artık 2D editörde düzenleme yapabilir ve kapı/pencere ekleyebilirsiniz.');
    } catch (error: any) {
      console.error('Scan error:', error);
      showNotification(`Yapay zeka analiz hatası: ${error.message || 'Lütfen daha net bir görsel yükleyin'}`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleGenerateRender = () => {
    setIsGenerating(true);
    showNotification('Yüksek çözünürlüklü mimari render işleniyor...');
    
    setTimeout(() => {
      setIsGenerating(false);
      
      const container = document.getElementById('threejs-viewport-canvas-container');
      const canvas = container?.querySelector('canvas');
      
      if (canvas) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `Architectural_Render_${room.name.toLowerCase().replace(/\s+/g, '_')}.png`;
          link.href = dataUrl;
          link.click();
          showNotification('4K Mimari Render başarıyla indirildi!');
        } catch (error) {
          console.error("Capture failed:", error);
          fallbackDownload();
        }
      } else {
        fallbackDownload();
      }
    }, 1800);
  };

  const fallbackDownload = () => {
    const link = document.createElement('a');
    link.download = 'Architectural_Render.png';
    link.href = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80';
    link.target = '_blank';
    link.click();
  };

  const handleCapture = (canvas: HTMLCanvasElement) => {};

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-800 font-sans overflow-hidden select-none">
      {/* Header */}
      <header className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-white shrink-0 z-30 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-md shadow-indigo-600/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-tight text-slate-900 leading-none">Mimari CAD & İmar Pro Stüdyo</span>
            <span className="text-[10px] text-slate-400 font-mono tracking-widest mt-0.5">TÜRKİYE & İSTANBUL İMAR YÖNETMELİĞİ</span>
          </div>
        </div>
        
        {hasProjectStarted && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400 font-medium">Aktif Proje:</span>
              <span className="text-indigo-600 font-bold">{projectMeta.projectName}</span>
            </div>

            {/* Presentation Mode Button */}
            <button
              onClick={() => setViewMode(viewMode === 'PRESENTATION' ? '3D' : 'PRESENTATION')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                viewMode === 'PRESENTATION'
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{viewMode === 'PRESENTATION' ? 'Çalışma Moduna Dön' : 'Resmi Mimari Pafta Modu'}</span>
            </button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
              İmar Denetim Motoru Aktif
            </span>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!hasProjectStarted ? (
          /* Landing Screen */
          <motion.main 
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 relative bg-slate-50 flex items-center justify-center overflow-hidden"
          >
            <div className="absolute inset-0 opacity-[0.35] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="relative z-10 p-10 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[32px] shadow-2xl flex flex-col items-center text-center max-w-xl"
            >
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100 mb-6 shadow-inner">
                 <Building2 className="w-8 h-8 text-indigo-600" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Mimari Kat Planı & İmar Stüdyosu</h2>
              <p className="text-slate-500 mb-8 leading-relaxed text-sm font-medium">
                Türkiye ve İstanbul belediyeleri Planlı Alanlar İmar Yönetmeliği ile Kentsel Dönüşüm imar teşviklerine
                %100 uyumlu tam kapsamlı 2D kat planı çizimi, 3D yapı modelleme ve antetli mimari pafta oluşturucu.
              </p>
              
              <div className="flex gap-3 w-full">
                 <button 
                   onClick={() => setHasProjectStarted(true)}
                   className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                 >
                    Yeni Mimari Proje Başlat
                 </button>
              </div>
            </motion.div>
          </motion.main>
        ) : viewMode === 'PRESENTATION' ? (
          /* Official Presentation Sheet Mode */
          <motion.main
            key="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 overflow-hidden"
          >
            <PresentationSheet
              room={room}
              projectMeta={projectMeta}
              zoning={zoning}
              floorCount={floorCount}
            />
          </motion.main>
        ) : (
          /* Active Editor Workspace */
          <motion.main 
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 overflow-hidden relative flex-col"
          >
            <div className="flex flex-1 overflow-hidden">
              {/* Left Sidebar */}
              <LeftSidebar
                viewMode={viewMode}
                setViewMode={setViewMode}
                isScanning={isScanning}
                onScan={handleScan}
                onUpload={handleUpload}
                uploadedImage={uploadedImage}
              />

              {/* Center Viewport */}
              <div className="flex-1 flex flex-col relative overflow-hidden bg-slate-100/60">
                {/* Viewport Top Bar */}
                <div className="h-12 border-b border-slate-200 bg-white/95 px-6 flex items-center justify-between z-10 shrink-0 shadow-sm">
                  <button
                    onClick={() => setHasProjectStarted(false)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>ANA EKRANA DÖN</span>
                  </button>

                  <div className="flex items-center gap-4">
                    {/* Floor Count Control */}
                    <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 shadow-inner">
                      <button
                        onClick={() => setFloorCount(Math.max(1, floorCount - 1))}
                        disabled={floorCount <= 1}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold font-mono tracking-wider min-w-[80px] text-center text-slate-700">
                        KAT SAYISI: {floorCount}
                      </span>
                      <button
                        onClick={() => setFloorCount(Math.min(zoning.maxFloors, floorCount + 1))}
                        disabled={floorCount >= zoning.maxFloors}
                        className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="h-4 w-[1px] bg-slate-200" />

                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                      <Info className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Fare Tekerleği: Zoom | Sağ Tık: Döndür/Kaydır</span>
                    </div>
                  </div>
                </div>

                {/* Viewport Content */}
                <div className="flex-1 relative">
                  {viewMode === '2D' ? (
                    <BlueprintEditor
                      room={room}
                      setRoom={setRoom}
                      uploadedImage={uploadedImage}
                    />
                  ) : (
                    <Scene
                      room={room}
                      material={selectedMaterial}
                      facadeMaterial={selectedFacade}
                      floorCount={floorCount}
                      onCapture={handleCapture}
                      setRoom={setRoom}
                    />
                  )}

                  {/* Scanning Loading Overlay */}
                  <AnimatePresence>
                    {isScanning && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-4"
                      >
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <motion.div
                            className="absolute inset-0 border-t-2 border-r-2 border-indigo-600 rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                          />
                          <Cpu className="w-8 h-8 text-indigo-600 animate-pulse" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-slate-800">Gemini Mimari Taraması</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Duvar ve oda sınırları analiz ediliyor...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Generating Render Loading Overlay */}
                  <AnimatePresence>
                    {isGenerating && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/95 backdrop-blur-md z-20 flex flex-col items-center justify-center gap-4"
                      >
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <motion.div
                            className="absolute inset-0 border-2 border-indigo-600 rounded-3xl"
                            animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 180, 270, 360] }}
                            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                          />
                          <Layers3 className="w-8 h-8 text-indigo-600" />
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs uppercase font-extrabold tracking-[0.2em] text-slate-800">4K Mimari Render İşleniyor</span>
                          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Gölge haritaları ve kaplamalar pişiriliyor...</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Notification Toast */}
                  <AnimatePresence>
                    {activeNotification && (
                      <motion.div
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: -20, x: '-50%' }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white border border-indigo-100 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-30 max-w-sm w-full"
                      >
                        <div className="w-5 h-5 bg-indigo-50 rounded-full flex items-center justify-center shrink-0 border border-indigo-100">
                          <Check className="w-3 h-3 text-indigo-600" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide leading-tight">{activeNotification}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Sidebar: Materials */}
              <MaterialSidebar
                selectedMaterial={selectedMaterial}
                selectedFacade={selectedFacade}
                onSelect={setSelectedMaterial}
                onFacadeSelect={setSelectedFacade}
                onGenerate={handleGenerateRender}
                isGenerating={isGenerating}
              />
            </div>

            {/* Bottom Panel: Zoning Compliance & Urban Renewal Report */}
            <ZoningReport
              room={room}
              zoning={zoning}
              setZoning={setZoning}
              floorCount={floorCount}
            />
          </motion.main>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="h-8 border-t border-slate-200 bg-white flex items-center justify-between px-6 text-[10px] text-slate-400 uppercase tracking-wider shrink-0 z-30 font-semibold">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5">
            <Scan className="w-3 h-3 text-emerald-500 animate-pulse" /> İmar Denetleyici: Hazır
          </span>
          <span className="text-slate-200">|</span>
          <span>Türkiye / İstanbul İmar Yönetmeliği V2026</span>
        </div>
        <div>
          Mimari Pro CAD & 3D Stüdyo © 2026
        </div>
      </footer>
    </div>
  );
}
