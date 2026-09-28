import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  Mic,
  PhoneIncoming,
  Clock,
  Radio,
  User,
  MapPin,
  Calendar,
  Languages,
  ShieldCheck,
  AlertCircle,
  FileAudio,
} from 'lucide-react';
import { IvrVoiceReport } from '../../types';

interface AudioWaveformPlayerProps {
  report: IvrVoiceReport;
}

export const AudioWaveformPlayer: React.FC<AudioWaveformPlayerProps> = ({ report }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const hasRealAudio = Boolean(
    report.audioUrl &&
    (report.audioUrl.startsWith('data:audio') || report.audioUrl.startsWith('http') || report.audioUrl.startsWith('blob:'))
  );

  // Reset playback if report changes
  useEffect(() => {
    setIsPlaying(false);
    setProgress(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [report.id]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isPlaying && !hasRealAudio) {
      // Simulate playback progress if no real audio element is attached
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 2.5;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, hasRealAudio]);

  const togglePlay = () => {
    if (hasRealAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch((err) => {
          console.warn('[Audio Play Warning]:', err);
          setIsPlaying(!isPlaying);
        });
      }
    } else {
      // SpeechSynthesis playback or timer simulation for transcript fixtures
      if (!isPlaying && 'speechSynthesis' in window && report.originalTranscript) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(report.originalTranscript);
          utterance.rate = 0.95;
          utterance.onend = () => setIsPlaying(false);
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
        } catch {
          // ignore
        }
      } else if (isPlaying && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const pct = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(pct);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Waveform bars heights (percentage)
  const barHeights = [
    25, 45, 70, 95, 60, 35, 65, 85, 100, 75, 45, 80, 90, 65, 40, 55, 75, 85, 60,
    40, 65, 90, 80, 50, 30, 45, 70, 65, 40, 25, 55, 75, 90, 60, 35, 50, 70, 40,
  ];

  const currentSeconds = Math.floor((progress / 100) * (report.durationSeconds || 24));

  return (
    <div className="bg-white border border-[#DCE3DD] rounded-3xl p-5 shadow-xs space-y-4">
      {/* Hidden real audio element if audioUrl is present */}
      {hasRealAudio && (
        <audio
          ref={audioRef}
          src={report.audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          preload="auto"
        />
      )}

      {/* 1. Header & Live vs Demo Disclosure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#DCE3DD] gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-sky-50 text-[#1677A8] border border-sky-200">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#1677A8]">
                1800-ELIM-WATER Field Voice Channel
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-[#1677A8] border border-sky-200 font-bold">
                Toll-Free Dial-in
              </span>
            </div>
            <p className="text-[10px] text-[#66736C]">
              Citizen watershed observation and ground truth alert audio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {report.isSimulated ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-mono font-semibold">
              <AlertCircle className="w-3 h-3 text-amber-600" />
              <span>DEMO VOICE — TRANSCRIPT FIXTURE</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-semibold">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              <span>LIVE FIELD VOICE AUDIO (SHA-256 RECORDED)</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Telephony & Caller Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-[#F7F8F4] p-3.5 rounded-2xl border border-[#DCE3DD]">
        <div>
          <span className="text-[10px] text-[#66736C] block font-mono">Caller & Role</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <User className="w-3.5 h-3.5 text-[#1677A8] shrink-0" />
            <span className="font-semibold text-[#17211D] truncate">{report.callerName}</span>
          </div>
          <span className="text-[10px] text-[#1677A8] font-medium">
            {report.callerRole || 'Citizen'}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-[#66736C] block font-mono">Location & Phone</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-[#075B45] shrink-0" />
            <span className="text-[#17211D] truncate">{report.callerVillage}</span>
          </div>
          <span className="text-[10px] text-[#66736C] font-mono">{report.callerPhone}</span>
        </div>

        <div>
          <span className="text-[10px] text-[#66736C] block font-mono">Dialect / Language</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Languages className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-semibold text-[#17211D]">{report.sourceLanguageName}</span>
          </div>
          <span className="text-[10px] text-[#66736C] font-mono">Code: {report.sourceLanguage.toUpperCase()}</span>
        </div>

        <div>
          <span className="text-[10px] text-[#66736C] block font-mono">Call Duration & Date</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Clock className="w-3.5 h-3.5 text-[#66736C] shrink-0" />
            <span className="text-[#17211D] font-mono text-[11px]">{report.durationSeconds || 24}s</span>
          </div>
          <span className="text-[10px] text-[#66736C]">
            {new Date(report.callTimestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* 3. Audio Controls & Dynamic Waveform Scrubber */}
      <div className="bg-[#F7F8F4] border border-[#DCE3DD] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className="w-12 h-12 rounded-2xl bg-[#075B45] hover:bg-[#0E8065] text-white flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-95 shadow-xs cursor-pointer"
          title={isPlaying ? 'Pause Audio' : hasRealAudio ? 'Play Field Audio' : 'Speak Transcript Aloud'}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6 fill-current" />
          ) : (
            <Play className="w-6 h-6 fill-current ml-0.5" />
          )}
        </button>

        {/* Waveform Bars */}
        <div className="flex-1 w-full h-12 flex items-center gap-1 bg-white px-3.5 rounded-xl border border-[#DCE3DD]">
          {barHeights.map((height, idx) => {
            const barPct = (idx / barHeights.length) * 100;
            const isPlayed = barPct <= progress;
            return (
              <div
                key={idx}
                className="flex-1 rounded-full transition-all duration-100"
                style={{
                  height: `${height}%`,
                  backgroundColor: isPlayed ? '#075B45' : '#DCE3DD',
                }}
              />
            );
          })}
        </div>

        {/* Timers & Audio Mode */}
        <div className="flex items-center gap-3 shrink-0 text-xs font-mono text-[#66736C]">
          <div className="text-right">
            <span className="text-[#075B45] font-bold">
              {currentSeconds < 10 ? `0:0${currentSeconds}` : `0:${currentSeconds}`}
            </span>
            <span className="text-[#66736C]"> / 0:{report.durationSeconds || 24}</span>
          </div>
          <div className="p-2 rounded-xl bg-white border border-[#DCE3DD] text-[#66736C]">
            <Volume2 className="w-4 h-4 text-[#075B45]" />
          </div>
        </div>
      </div>
    </div>
  );
};
