import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  Check,
  AlertTriangle,
  RotateCcw,
  Zap,
  Shield,
  Maximize2,
} from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureConfirm: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
  isOpen,
  onClose,
  onCaptureConfirm,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraState, setCameraState] = useState<'INITIALIZING' | 'STREAMING' | 'CAPTURED' | 'ERROR'>('INITIALIZING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [capturedBlobUrl, setCapturedBlobUrl] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Stop camera tracks cleanly
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  // Start live camera stream
  const startCamera = async (mode: 'environment' | 'user' = facingMode) => {
    stopStream();
    setCameraState('INITIALIZING');
    setErrorMessage(null);

    // 1. Check for secure context and MediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('ERROR');
      setErrorMessage(
        'Camera API is not supported in this browser. Please use Chrome, Edge, Safari, or Firefox over HTTPS or localhost.'
      );
      return;
    }

    // 2. Enumerate available video inputs
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoInputs = devices.filter((d) => d.kind === 'videoinput');
      setHasMultipleCameras(videoInputs.length > 1);
    } catch {
      // ignore
    }

    // 3. Request user media
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setCameraState('STREAMING');
        };
      }
    } catch (err: any) {
      setCameraState('ERROR');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage(
          'Camera access was denied by your browser or operating system. Please grant camera permission in your browser address bar and try again.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage(
          'No camera device detected on this system. You can connect a webcam or upload an existing photo from disk.'
        );
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setErrorMessage(
          'Camera is already in use by another application (e.g. Zoom, Teams). Please close the other program and retry.'
        );
      } else {
        setErrorMessage(`Unable to access camera: ${err.message || 'Unknown media error'}`);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopStream();
      setCapturedBlobUrl(null);
      setCapturedFile(null);
      setCameraState('INITIALIZING');
    }
    return () => stopStream();
  }, [isOpen]);

  // Capture current frame onto hidden canvas
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || cameraState !== 'STREAMING') return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);

    // Convert to high-quality JPEG
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const filename = `FIELD_CAM_${Date.now()}.jpg`;
        const file = new File([blob], filename, { type: 'image/jpeg', lastModified: Date.now() });
        const url = URL.createObjectURL(blob);

        setCapturedFile(file);
        setCapturedBlobUrl(url);
        setCameraState('CAPTURED');
        stopStream();
      },
      'image/jpeg',
      0.92
    );
  };

  const handleRetake = () => {
    if (capturedBlobUrl) {
      URL.revokeObjectURL(capturedBlobUrl);
    }
    setCapturedBlobUrl(null);
    setCapturedFile(null);
    startCamera(facingMode);
  };

  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCaptureConfirm(capturedFile);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-[#141E28] border border-[#243242] rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl flex flex-col text-white">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#243242] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-[#10B981]" />
            <h3 className="font-bold text-sm tracking-wide uppercase font-mono">
              Live Field Camera Viewfinder
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#1A2634] text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder Canvas Area */}
        <div className="relative bg-black aspect-video sm:aspect-4/3 flex items-center justify-center overflow-hidden">
          {/* Live Video Preview */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            className={`w-full h-full object-cover ${cameraState === 'STREAMING' ? 'block' : 'hidden'}`}
          />

          {/* Captured Preview */}
          {cameraState === 'CAPTURED' && capturedBlobUrl && (
            <img
              src={capturedBlobUrl}
              alt="Captured frame"
              className="w-full h-full object-cover animate-fade-in"
            />
          )}

          {/* Hidden Canvas for Frame Grab */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder Framing Overlay (when streaming) */}
          {cameraState === 'STREAMING' && (
            <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 font-semibold bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-xs self-start">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-2" />
                <span>LIVE FEED • {facingMode.toUpperCase()} SENSOR</span>
              </div>

              {/* Center reticle */}
              <div className="self-center w-28 h-28 border-2 border-emerald-400/40 rounded-2xl relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400/80 rounded-full" />
              </div>

              <div className="text-[10px] font-mono text-slate-300 text-center bg-black/40 py-1 rounded backdrop-blur-xs">
                Align signboard or water structure inside the center frame
              </div>
            </div>
          )}

          {/* Initializing Spinner */}
          {cameraState === 'INITIALIZING' && (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin text-[#10B981]" />
              <span className="text-xs font-mono uppercase tracking-wider">
                Requesting camera hardware...
              </span>
            </div>
          )}

          {/* Error Display */}
          {cameraState === 'ERROR' && (
            <div className="p-6 max-w-md text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{errorMessage}</p>
              <button
                onClick={() => startCamera()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Permission</span>
              </button>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="p-5 border-t border-[#243242] bg-[#0B1117] flex items-center justify-between gap-3">
          {cameraState === 'STREAMING' && (
            <>
              {hasMultipleCameras ? (
                <button
                  onClick={handleSwitchCamera}
                  className="px-3.5 py-2.5 rounded-xl bg-[#141E28] hover:bg-[#1A2634] text-xs font-semibold border border-[#243242] flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-slate-400" />
                  <span className="hidden sm:inline">Flip Camera</span>
                </button>
              ) : (
                <div className="w-24" />
              )}

              {/* Shutter Button */}
              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-white bg-red-600 hover:bg-red-500 active:scale-95 transition-all shadow-lg flex items-center justify-center cursor-pointer"
                title="Capture Photograph"
              >
                <div className="w-12 h-12 rounded-full border-2 border-white/60" />
              </button>

              <div className="w-24 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-3.5 py-2 rounded-xl bg-[#141E28] hover:bg-[#1A2634] text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </>
          )}

          {cameraState === 'CAPTURED' && (
            <div className="w-full flex items-center justify-between gap-3">
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl bg-[#141E28] hover:bg-[#1A2634] text-xs font-semibold text-slate-200 border border-[#243242] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span>Retake</span>
              </button>

              <div className="text-center text-xs font-mono text-emerald-400 font-semibold">
                Photo Captured (Ready for Evidence Pipeline)
              </div>

              <button
                onClick={handleConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#075B45] hover:bg-[#0E8065] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Confirm & Analyze</span>
              </button>
            </div>
          )}

          {cameraState !== 'STREAMING' && cameraState !== 'CAPTURED' && (
            <div className="w-full flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#141E28] hover:bg-[#1A2634] text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
