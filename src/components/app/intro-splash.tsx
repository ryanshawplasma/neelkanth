"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useT } from "@/i18n/client";
import { cn } from "@/lib/utils";

const SEEN_KEY = "dd_intro_seen";
/** Set once the intro has ever played on this device; the very first play cannot be skipped. */
const PLAYED_KEY = "dd_intro_played";
/** Bump when the intro footage is replaced, so cached copies of the old clip are not reused. */
const VIDEO_VERSION = "3";
const VIDEO_SRC = `/video/intro.mp4?v=${VIDEO_VERSION}`;
const POSTER_SRC = `/video/intro-poster.jpg?v=${VIDEO_VERSION}`;
/** Never hold the user hostage: if the video cannot start within this time, drop the overlay. */
const START_TIMEOUT_MS = 6000;
/** Hard ceiling in case `ended` never fires (some in-app browsers). */
const MAX_PLAY_MS = 14000;

/**
 * Full-screen opening video, shown once per browser session when the app is opened.
 * The very first time on a device the whole video plays (no Skip); later opens can skip it.
 *
 * - An inline script hides the overlay before first paint on repeat loads, so returning visitors
 *   never see a flash of black.
 * - Plays muted (the only way autoplay is allowed); a button un-mutes.
 * - The file is a portrait (9:19.5) render: the scene's centre over a blurred self-fill, so
 *   `object-cover` fills any phone edge to edge without cutting the subjects.
 * - Skipped automatically for reduced-motion users, when the file fails to load, or on timeout.
 */
export function IntroSplash() {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"pending" | "playing" | "closing" | "done">("pending");
  const [muted, setMuted] = useState(true);
  const [controls, setControls] = useState(false);
  const [firstTime, setFirstTime] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {}
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (seen || reduced) {
      setPhase("done");
      return;
    }
    try {
      sessionStorage.setItem(SEEN_KEY, "1");
      setFirstTime(localStorage.getItem(PLAYED_KEY) !== "1");
      localStorage.setItem(PLAYED_KEY, "1");
    } catch {}
    setPhase("playing");
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const v = videoRef.current;
    if (!v) return;

    const finish = () => setPhase((p) => (p === "playing" ? "closing" : p));
    let started = false;
    const onPlaying = () => {
      started = true;
      window.clearTimeout(startTimer);
    };
    const startTimer = window.setTimeout(() => {
      if (!started) finish();
    }, START_TIMEOUT_MS);
    const maxTimer = window.setTimeout(finish, MAX_PLAY_MS);
    const controlsTimer = window.setTimeout(() => setControls(true), 1500);

    v.addEventListener("playing", onPlaying);
    v.addEventListener("ended", finish);
    v.addEventListener("error", finish);
    v.muted = true;
    v.play().catch(finish);

    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(maxTimer);
      window.clearTimeout(controlsTimer);
      v.removeEventListener("playing", onPlaying);
      v.removeEventListener("ended", finish);
      v.removeEventListener("error", finish);
    };
  }, [phase]);

  // Lock page scroll while the overlay is up; unmount after the fade-out.
  useEffect(() => {
    if (phase === "pending" || phase === "playing") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    if (phase === "closing") {
      const id = window.setTimeout(() => setPhase("done"), 650);
      return () => window.clearTimeout(id);
    }
  }, [phase]);

  if (phase === "done") return null;

  function toggleSound() {
    const v = videoRef.current;
    if (!v) return;
    const soundOn = muted;
    v.muted = !soundOn;
    setMuted(!soundOn);
    if (soundOn) v.play().catch(() => {});
  }

  return (
    <>
      {/* Hide before hydration on repeat loads (same session) so there is no black flash. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{if(sessionStorage.getItem(${JSON.stringify(SEEN_KEY)})==="1"||matchMedia("(prefers-reduced-motion: reduce)").matches){document.currentScript.nextElementSibling.style.display="none"}}catch(e){}`,
        }}
      />
      <div
        id="intro-splash"
        role="presentation"
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-700 ease-out",
          phase === "closing" ? "pointer-events-none opacity-0" : "opacity-100",
        )}
      >
        {/* Portrait 9:19.5 render (scene over a blurred self-fill) so it covers any phone edge to edge. */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          poster={POSTER_SRC}
          muted
          autoPlay
          playsInline
          preload="auto"
          disablePictureInPicture
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-black/45 via-transparent to-black/60" />

        {/* Controls fade in after a moment so the opening beat stays clean. */}
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 pb-[max(1rem,env(safe-area-inset-bottom))] transition-opacity duration-500",
            controls ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <button
            type="button"
            onClick={toggleSound}
            className="flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3.5 py-2 text-xs font-medium text-white backdrop-blur hover:bg-black/60"
            aria-pressed={!muted}
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? t("common.introSoundOn") : t("common.introSoundOff")}
          </button>
          {!firstTime && (
            <button
              type="button"
              onClick={() => setPhase("closing")}
              className="rounded-full border border-white/25 bg-black/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur hover:bg-black/60"
            >
              {t("common.introSkip")}
            </button>
          )}
        </div>

        {/* Brand mark, bottom-centre, over the fade. */}
        <div className="pointer-events-none absolute inset-x-0 top-[max(1.25rem,env(safe-area-inset-top))] z-20 flex flex-col items-center gap-1 text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-kesari text-xl leading-none shadow-lg">ॐ</span>
          <span className="font-display text-lg font-bold tracking-wide">{t("common.appName")}</span>
        </div>
      </div>
    </>
  );
}
