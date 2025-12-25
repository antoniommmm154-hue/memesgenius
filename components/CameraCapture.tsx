
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Zap, AlertCircle } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  onClose: () => void;
  autoMagic: boolean;
  setAutoMagic: (val: boolean) => void;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onClose, autoMagic, setAutoMagic }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    async function setupCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          setIsReady(true);
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Could not access camera. Please check permissions.");
      }
    }
    setupCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative">
        <div className="p-4 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="relative">
               {/* Updated Status Indicator: Green for OK/Ready, Red only for Error */}
               <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : isReady ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></div>
            </div>
            <h2 className="font-bold text-lg">Image Capture</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="relative aspect-video bg-black flex items-center justify-center">
          {error ? (
            <div className="text-center p-8">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          ) : (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-full object-cover"
              />
              {!isReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                  <RefreshCw className="animate-spin text-emerald-500" size={32} />
                </div>
              )}
            </>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />

        <div className="p-6 bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setAutoMagic(!autoMagic)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full border transition-all ${autoMagic ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              <Zap size={16} fill={autoMagic ? "currentColor" : "none"} />
              <span className="text-sm font-semibold">Auto-Magic Mode</span>
            </button>
          </div>

          <button
            onClick={takePhoto}
            disabled={!isReady}
            className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-white hover:bg-emerald-50 disabled:opacity-50 transition-all active:scale-90"
          >
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-slate-900 group-hover:bg-emerald-600 transition-colors"></div>
            </div>
          </button>

          <div className="hidden sm:block text-xs text-slate-500 text-right">
            Click the shutter to <br /> capture your meme base
          </div>
        </div>
      </div>
    </div>
  );
};

export default CameraCapture;
