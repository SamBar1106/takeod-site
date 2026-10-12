import { useEffect } from "react";
import { CUT_POINTS, HERO_CLIPS, MEDIA } from "../config.js";
import { prefersReducedMotion } from "../lib/motion.js";

function waitFor(target, event) {
  return new Promise((resolve) => {
    if (event === "canplay" && target.readyState >= 3) {
      resolve();
      return;
    }
    const done = () => {
      target.removeEventListener(event, done);
      target.removeEventListener("error", done);
      resolve();
    };
    target.addEventListener(event, done);
    target.addEventListener("error", done);
  });
}

function armInline(video) {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
}

/**
 * Two-buffer hero cutter. Clips crossfade on opacity only.
 * The poster stays up until a clip is actually playing.
 */
export function useHeroReel(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const poster = root.querySelector(".hero__poster");
    const playButton = root.querySelector(".hero__play");
    const videos = [...root.querySelectorAll(".hero__video")];
    if (videos.length < 2) return undefined;

    videos.forEach(armInline);
    const [videoA, videoB] = videos;
    let activeSlot = 0;
    let clipIndex = 0;
    let cutCursor = 0;
    let started = false;
    let advancing = false;
    let beatsLive = false;
    let heroInView = true;
    let rafId = 0;
    let errors = 0;
    let cancelled = false;

    const activeVideo = () => videos[activeSlot];
    const hiddenVideo = () => videos[1 - activeSlot];
    const showPlay = () => document.documentElement.classList.add("needs-play");

    const hidePoster = () => {
      poster?.classList.add("is-gone");
    };

    const arm = (video, index) => {
      const clip = HERO_CLIPS[index];
      if (video.dataset.clip === String(index) && video.readyState >= 2) return;
      video.dataset.clip = String(index);
      video.pause();
      video.preload = "auto";
      video.src = `${MEDIA}${clip.file}`;
      video.load();
    };

    const pauseOthers = (current) => {
      root.querySelectorAll("video").forEach((video) => {
        if (video !== current && !video.paused) video.pause();
      });
    };

    const shouldPlay = () => started && heroInView && !document.hidden && !cancelled;

    const syncPlayback = () => {
      const video = activeVideo();
      if (shouldPlay()) {
        if (video.paused) {
          pauseOthers(video);
          video.play().catch(() => showPlay());
        }
      } else if (!video.paused) {
        video.pause();
      }
    };

    const crossfade = (incoming, outgoing) => {
      if (prefersReducedMotion()) {
        incoming.classList.add("is-active");
        outgoing.classList.remove("is-active");
        outgoing.pause();
        return Promise.resolve();
      }
      incoming.classList.add("is-incoming");
      return new Promise((resolve) => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          incoming.removeEventListener("animationend", finish);
          incoming.classList.add("is-active");
          incoming.classList.remove("is-incoming");
          outgoing.classList.remove("is-active");
          outgoing.pause();
          resolve();
        };
        incoming.addEventListener("animationend", finish);
        window.setTimeout(finish, 220);
      });
    };

    const advance = async () => {
      if (advancing || cancelled) return;
      advancing = true;
      const nextIndex = (clipIndex + 1) % HERO_CLIPS.length;
      const incoming = hiddenVideo();
      const outgoing = activeVideo();
      if (incoming.dataset.clip !== String(nextIndex)) arm(incoming, nextIndex);
      if (incoming.readyState < 3) await waitFor(incoming, "canplay");
      if (cancelled) return;
      if (incoming.error) {
        errors += 1;
        advancing = false;
        if (errors <= HERO_CLIPS.length) arm(incoming, (nextIndex + 1) % HERO_CLIPS.length);
        return;
      }
      try {
        pauseOthers(incoming);
        await incoming.play();
      } catch {
        showPlay();
        advancing = false;
        return;
      }
      if (cancelled) return;
      await crossfade(incoming, outgoing);
      hidePoster();
      clipIndex = nextIndex;
      activeSlot = 1 - activeSlot;
      cutCursor = 0;
      errors = 0;
      arm(outgoing, (clipIndex + 1) % HERO_CLIPS.length);
      advancing = false;
    };

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!beatsLive || advancing || !shouldPlay()) return;
      const video = activeVideo();
      const time = video.currentTime;
      if (!CUT_POINTS.length) {
        if (video.ended) advance();
        return;
      }
      if (cutCursor < CUT_POINTS.length && time >= CUT_POINTS[cutCursor]) {
        const last = cutCursor === CUT_POINTS.length - 1;
        cutCursor += 1;
        if (last) advance();
      } else if (video.ended) {
        advance();
      }
    };

    const playWhenReady = async (video) => {
      armInline(video);
      const attempt = async () => {
        try {
          await video.play();
          return true;
        } catch (error) {
          if (error?.name === "AbortError") return video.paused ? false : true;
          return false;
        }
      };
      if (await attempt()) return true;
      if (cancelled) return false;
      if (video.readyState < 3) await waitFor(video, "canplay");
      if (cancelled) return false;
      return attempt();
    };

    const start = async () => {
      if (cancelled) return;
      if (started) {
        syncPlayback();
        return;
      }
      started = true;
      document.documentElement.classList.remove("needs-play");
      const first = activeVideo();
      if (!first.getAttribute("src")) arm(first, 0);
      else first.dataset.clip = first.dataset.clip || "0";
      pauseOthers(first);
      const playing = await playWhenReady(first);
      if (cancelled) return;
      if (!playing) {
        started = false;
        showPlay();
        return;
      }
      hidePoster();
      arm(hiddenVideo(), 1);
      if (!rafId) tick();
      const time = activeVideo().currentTime;
      cutCursor = CUT_POINTS.findIndex((point) => point > time + 0.05);
      if (cutCursor < 0) cutCursor = CUT_POINTS.length;
      beatsLive = true;
    };

    const onPlay = () => {
      start();
    };
    playButton?.addEventListener("click", onPlay);

    const viewObserver = new IntersectionObserver(
      (entries) => {
        heroInView = entries.some((entry) => entry.isIntersecting);
        syncPlayback();
      },
      { threshold: 0.2 },
    );
    viewObserver.observe(root);

    const onVis = () => syncPlayback();
    document.addEventListener("visibilitychange", onVis);

    if (prefersReducedMotion()) {
      videos.forEach((video) => {
        video.autoplay = false;
        video.pause();
      });
      showPlay();
    } else start();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      viewObserver.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      playButton?.removeEventListener("click", onPlay);
      videos.forEach((video) => video.pause());
    };
  }, [rootRef]);
}

export function useLifestyleVideo(rootRef) {
  useEffect(() => {
    const root = rootRef.current;
    const video = root?.querySelector(".about__video");
    const poster = root?.querySelector(".about__poster");
    const section = video?.closest(".about__media") || video?.closest("section");
    if (!video || !section) return undefined;
    armInline(video);
    let armed = false;

    const load = () => {
      if (armed) return;
      armed = true;
      video.preload = "auto";
      video.src = `${MEDIA}l1-classroom.mp4`;
      video.load();
    };

    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        load();
        loadObserver.disconnect();
      },
      { rootMargin: "100% 0px" },
    );
    loadObserver.observe(section);

    const playObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);
        if (!armed || !visible || document.hidden || prefersReducedMotion()) {
          video.pause();
          return;
        }
        video.play().then(() => {
          poster?.classList.add("is-gone");
        }).catch(() => {});
      },
      { threshold: 0.35 },
    );
    playObserver.observe(section);

    const onVis = () => {
      if (document.hidden) video.pause();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      loadObserver.disconnect();
      playObserver.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      video.pause();
    };
  }, [rootRef]);
}
