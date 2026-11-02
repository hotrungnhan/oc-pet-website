import { useEffect, useRef, useState } from "react";
import { copy, type Language } from "./i18n";

const scenes = [
  { id: "cuddle", pet: "cat-persian.svg" },
  { id: "snack", pet: "rabbit-lop.svg" },
  { id: "drag", pet: "otter-sea.svg" },
  { id: "football", pet: "cow-highland.svg" },
  { id: "basketball", pet: "dog-corgi.svg" },
  { id: "sleep", pet: "rabbit-upright.svg" },
];
const asset = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;

function Cursor() {
  return (
    <svg viewBox="0 0 32 40" fill="none" aria-hidden="true">
      <path d="M4 3v29l7-7 6 12 5-3-6-11h11L4 3Z" fill="#fffdf6" stroke="#37463d" strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function DesktopDemo({ language }: { language: Language }) {
  const t = copy[language];
  const [selected, setSelected] = useState(0);
  const [take, setTake] = useState(0);
  const [paused, setPaused] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const screen = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const drag = useRef({ x: 0, y: 0, moved: false });
  const scene = scenes[selected];

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const changed = () => setPaused(media.matches);
    media.addEventListener("change", changed);
    return () => media.removeEventListener("change", changed);
  }, []);

  useEffect(() => {
    if (!section.current) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    observer.observe(section.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible || dragging) return;
    const timer = setTimeout(() => {
      setSelected((index) => (index + 1) % scenes.length);
      setOffset({ x: 0, y: 0 });
    }, 6500);
    return () => clearTimeout(timer);
  }, [selected, take, paused, visible, dragging]);

  function choose(index: number) {
    setSelected(index);
    setOffset({ x: 0, y: 0 });
    setTake((value) => value + 1);
  }

  return (
    <section ref={section} className="desktop-showcase" aria-labelledby="desktop-title">
      <div className="gallery-heading">
        <div>
          <p className="eyebrow">{t.desktopEyebrow}</p>
          <h2 id="desktop-title">{t.desktopTitle}</h2>
        </div>
        <span className="mac-label">{t.animatedPreview}</span>
      </div>
      <div className="desktop-scene-picker" role="group" aria-label={t.desktopScenes}>
        {t.sceneNames.map((name, index) => (
          <button key={scenes[index].id} aria-pressed={selected === index} onClick={() => choose(index)}>
            <span aria-hidden="true">{["♡", "✦", "↗", "⚽", "◉", "☾"][index]}</span> {name}
          </button>
        ))}
      </div>
      <div className={`desktop-frame ${paused || !visible ? "demo-paused" : ""}`}>
        <div className="desktop-titlebar" aria-hidden="true">
          <span className="traffic-lights"><i /><i /><i /></span>
          <span>OC Pet <span className="desktop-titlebar-detail">· {t.desktopWindow}</span></span>
          <span className="desktop-titlebar-symbol">⌘</span>
        </div>
        <div ref={screen} key={`${scene.id}-${take}`} className={`desktop-screen scene-${scene.id}`}>
          <div className="wallpaper-orb orb-one" aria-hidden="true" />
          <div className="wallpaper-orb orb-two" aria-hidden="true" />
          <div className="desktop-menubar" aria-hidden="true"><span>✦ <strong>Finder</strong> <span>File &nbsp; Edit &nbsp; View</span></span><span>◒ &nbsp; ▰ &nbsp; 9:41</span></div>
          <div className="desktop-note" aria-hidden="true">
            <div className="note-top"><span /><span /><span /></div>
            <p>{t.noteTitle}</p>
            <div className="note-task done"><i />{t.noteTask}</div>
            <div className="note-task"><i />{t.noteBreak}</div>
            <span className="note-doodle">{scene.id === "sleep" ? "☾" : "✿"}</span>
          </div>
          <div className="desktop-folder" aria-hidden="true"><span>▰</span><small>{t.littleThings}</small></div>
          <div className="scene-pet-position" style={{ translate: `${offset.x}px ${offset.y}px`, animation: dragging || offset.x !== 0 || offset.y !== 0 ? "none" : undefined }}>
            <div className="scene-bubble" aria-hidden="true">{t.sceneLines[selected]}</div>
            <button className={`scene-pet ${dragging ? "is-dragging" : ""}`} aria-label={t.touchDesktopPet}
              style={dragging || offset.x !== 0 || offset.y !== 0 ? { animation: "none" } : undefined}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.currentTarget.setPointerCapture(event.pointerId);
                drag.current = { x: event.clientX - offset.x, y: event.clientY - offset.y, moved: false };
                setDragging(true);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId) || !screen.current) return;
                const bounds = screen.current.getBoundingClientRect();
                const x = event.clientX - drag.current.x;
                const y = event.clientY - drag.current.y;
                if (Math.abs(x - offset.x) + Math.abs(y - offset.y) > 3) drag.current.moved = true;
                setOffset({ x: Math.max(-bounds.width * .25, Math.min(bounds.width * .25, x)), y: Math.max(-bounds.height * .2, Math.min(bounds.height * .15, y)) });
              }}
              onPointerUp={(event) => {
                event.currentTarget.releasePointerCapture(event.pointerId);
                setDragging(false);
              }}
              onPointerCancel={() => { setDragging(false); setOffset({ x: 0, y: 0 }); }}
              onClick={() => { if (!drag.current.moved) choose(0); }}>
              <img src={asset(scene.pet)} alt="" draggable={false} />
            </button>
            <span className="scene-pet-shadow" aria-hidden="true" />
            {scene.id === "cuddle" && <span className="scene-hearts" aria-hidden="true"><i>♡</i><i>♡</i><i>♡</i></span>}
            {scene.id === "sleep" && <><span className="sleep-blanket" aria-hidden="true" /><span className="sleep-zzz" aria-hidden="true"><i>z</i><i>z</i><i>Z</i></span></>}
          </div>
          {(scene.id === "cuddle" || scene.id === "drag") && <div className="scene-cursor" aria-hidden="true"><Cursor /><span /></div>}
          {scene.id === "snack" && <div className="scene-snack" aria-hidden="true"><span>🥕</span><i /></div>}
          {scene.id === "football" && <><div className="scene-goal" aria-hidden="true"><span /></div><span className="scene-football" aria-hidden="true">⚽</span></>}
          {scene.id === "basketball" && <><div className="scene-hoop" aria-hidden="true"><span /><i /></div><span className="scene-basketball" aria-hidden="true">🏀</span></>}
          <div className="desktop-dock" aria-hidden="true"><span className="dock-finder">☺</span><span className="dock-browser">◈</span><span className="dock-notes">≡</span><i /><img src={asset("cow.svg")} alt="" /></div>
        </div>
        <div className="desktop-playback">
          <p><span className="playback-dot" aria-hidden="true" />{t.sceneNames[selected]}</p>
          <button onClick={() => setPaused(!paused)} aria-label={paused ? t.resumeDemo : t.pauseDemo} aria-pressed={paused}>
            <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span> {paused ? t.playDemo : t.pauseLabel}
          </button>
        </div>
      </div>
      <p className="desktop-hint">{t.desktopHint}</p>
    </section>
  );
}
