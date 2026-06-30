"use client";

import { useEffect, useRef, useState } from "react";

// The video presentation attached to a submission — the core deliverable.
// Records via the browser MediaRecorder API and previews the take. (Blob is
// kept in-memory for the session — upload/persistence is a later step.)
const MAX_SECONDS = 240;

export default function VideoRecorder({ onUsed }: { onUsed?: (used: boolean) => void }) {
  const liveRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [used, setUsed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function cleanupStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (timerRef.current) clearInterval(timerRef.current);
  }

  useEffect(() => {
    return () => {
      cleanupStream();
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setError(null);
    setUsed(false);
    onUsed?.(false);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
      streamRef.current = stream;
      if (liveRef.current) {
        liveRef.current.srcObject = stream;
        await liveRef.current.play().catch(() => {});
      }
      chunksRef.current = [];
      const rec = new MediaRecorder(stream);
      rec.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "video/webm" });
        setVideoUrl(URL.createObjectURL(blob));
        cleanupStream();
      };
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setSeconds(0);
      timerRef.current = setInterval(() => {
        setSeconds((s) => {
          if (s + 1 >= MAX_SECONDS) stop();
          return s + 1;
        });
      }, 1000);
    } catch {
      setError("Couldn't access your camera. Allow camera + mic permission (needs a real browser).");
      cleanupStream();
    }
  }

  function stop() {
    if (recorderRef.current && recorderRef.current.state !== "inactive") recorderRef.current.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-1 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-200">🎥 Record your presentation</h3>
        <span className="text-xs text-slate-500">up to 4 min</span>
      </div>
      <p className="mb-3 text-xs leading-relaxed text-slate-400">
        Present your recommendation on camera — this is the main event, the part companies actually
        watch. Selfie-style is fine.
      </p>

      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black/40 ring-1 ring-white/10">
        <video
          ref={liveRef}
          muted
          playsInline
          className={`h-full w-full object-cover ${recording ? "block" : "hidden"}`}
        />
        {!recording && videoUrl && (
          <video src={videoUrl} controls playsInline className="h-full w-full object-cover" />
        )}
        {!recording && !videoUrl && (
          <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
            No take yet
          </div>
        )}
        {recording && (
          <div className="absolute right-2 top-2 flex items-center gap-1.5 rounded-full bg-black/60 px-2 py-1 text-xs font-semibold text-rose-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500" />
            {seconds}s / {MAX_SECONDS}s
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {!recording ? (
          <button
            onClick={start}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            {videoUrl ? "Re-record" : "Start recording"}
          </button>
        ) : (
          <button
            onClick={stop}
            className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-semibold text-white hover:bg-white/20"
          >
            Stop
          </button>
        )}
        {videoUrl && !recording && (
          <button
            onClick={() => {
              setUsed(true);
              onUsed?.(true);
            }}
            disabled={used}
            className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
          >
            {used ? "Attached ✓" : "Attach this take"}
          </button>
        )}
      </div>
    </div>
  );
}
