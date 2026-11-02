import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { copy, type Language } from "./i18n";
import { detectPlatform, type Platform } from "./platform";
import {
  CACHE_TTL,
  loadReleases,
  readCache,
  REPO_URL,
  RELEASES_URL,
  selectDownloads,
  type ReleaseResult,
} from "./releases";
import { DesktopDemo } from "./DesktopDemo";
import "./style.css";
const base = import.meta.env.BASE_URL;
const image = (name: string) => `${base}images/${name}`;
const pets = [
  { id: "cow", name: "Clover", color: "#e8edda", skins: ["dairy", "highland", "zebu"] },
  { id: "rabbit", name: "Pip", color: "#f3e4e8", skins: ["upright", "lop", "lionhead"] },
  { id: "otter", name: "Mochi", color: "#e0ebed", skins: ["sea", "river", "small_clawed"] },
  { id: "dog", name: "Biscuit", color: "#f4e8d2", skins: ["corgi", "pitbull", "poodle"] },
  { id: "cat", name: "Miso", color: "#e9e3f0", skins: ["shorthair", "siamese", "persian"] },
];
function storage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
function initialLanguage(): Language {
  const query = new URLSearchParams(location.search).get("lang");
  if (query === "vi" || query === "en") return query;
  try {
    const saved = storage()?.getItem("oc-pet-language");
    if (saved === "vi" || saved === "en") return saved;
  } catch {
    /* Blocked browser storage does not block language selection. */
  }
  return navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en";
}
function Chevron() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .8a11.2 11.2 0 0 0-3.54 21.83c.56.1.76-.24.76-.54v-2.08c-3.12.68-3.78-1.33-3.78-1.33-.5-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.68.08-.68 1.13.08 1.73 1.16 1.73 1.16 1 1.72 2.62 1.22 3.26.93.1-.73.39-1.22.71-1.5-2.49-.28-5.1-1.24-5.1-5.54 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.08 1.15A10.7 10.7 0 0 1 12 6.18c.95 0 1.9.13 2.8.38 2.13-1.45 3.08-1.15 3.08-1.15.62 1.55.23 2.7.12 2.98.72.79 1.15 1.8 1.15 3.02 0 4.31-2.62 5.25-5.12 5.53.4.35.76 1.03.76 2.08v3.07c0 .3.2.65.77.54A11.2 11.2 0 0 0 12 .8Z" />
    </svg>
  );
}
function DownloadButton({
  language,
  result,
  busy,
  failed,
}: {
  language: Language;
  result: ReleaseResult | null;
  busy: boolean;
  failed: boolean;
}) {
  const t = copy[language];
  const [platform] = useState<Platform>(() => detectPlatform(navigator));
  const [open, setOpen] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const labels = { mac: "macOS", windows: "Windows" };
  const file = platform === "unsupported" ? null : result?.downloads[platform];
  const title =
    platform === "unsupported"
      ? t.unsupported
      : file
        ? `${t.download} ${labels[platform]}`
        : busy
          ? t.checking
          : `${labels[platform]} · ${t.unavailable}`;
  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOutside);
    menu.current
      ?.querySelector<HTMLElement>('[role="menuitem"]:not(:disabled)')
      ?.focus();
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, [open]);
  return (
    <div
      className="mt-6"
      ref={container}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          setOpen(false);
      }}
    >
      <div className="relative inline-flex max-w-full rounded-xl bg-action text-action-ink">
        {file ? (
          <a className="download-main" href={file.url}>
            {title}
          </a>
        ) : (
          <button className="download-main cursor-default opacity-80" disabled>
            {title}
          </button>
        )}
        <button
          ref={toggle}
          className="download-toggle"
          aria-label={t.more}
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls="download-menu"
          onClick={() => setOpen(!open)}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setOpen(true);
            }
          }}
        >
          <Chevron />
        </button>
        {open && (
          <div
            id="download-menu"
            ref={menu}
            role="menu"
            aria-label={t.more}
            className="download-menu"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
                toggle.current?.focus();
              }
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                const items = [
                  ...event.currentTarget.querySelectorAll<HTMLElement>(
                    '[role="menuitem"]:not(:disabled)',
                  ),
                ];
                const current = items.indexOf(
                  document.activeElement as HTMLElement,
                );
                items[
                  (current +
                    (event.key === "ArrowDown" ? 1 : -1) +
                    items.length) %
                    items.length
                ]?.focus();
              }
            }}
          >
            <p className="px-3 pb-2 text-[10px] font-semibold tracking-wide text-muted">
              {t.other}
            </p>
            {(["mac", "windows"] as const)
              .filter((key) => key !== platform)
              .map((key) => {
                const download = result?.downloads[key];
                return download ? (
                  <a
                    key={key}
                    role="menuitem"
                    className="download-option"
                    href={download.url}
                    onClick={() => setOpen(false)}
                  >
                    <span>{labels[key]}</span>
                    <small>{download.version} ↓</small>
                  </a>
                ) : (
                  <button
                    key={key}
                    role="menuitem"
                    className="download-option w-full text-left opacity-60"
                    disabled
                  >
                    <span>{labels[key]}</span>
                    <small>{t.comingSoon}</small>
                  </button>
                );
              })}
            <a
              role="menuitem"
              className="download-option mt-1 border-t border-line pt-3 text-xs"
              href={RELEASES_URL}
              onClick={() => setOpen(false)}
            >
              {t.allReleases}
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
      <p className="mt-2.5 min-h-4 text-[11px] text-muted" role="status">
        {file
          ? `${file.version} · ${(file.size / 1024 / 1024).toFixed(1)} MB`
          : t.noAccount}
      </p>
      {(result?.stale || failed) && (
        <p className="mt-1 max-w-xs text-[10px] text-muted">
          {result?.stale ? t.stale : t.failed}
        </p>
      )}
      {platform === "mac" && (
        <p className="mt-1 text-[10px] text-muted">{t.unsigned}</p>
      )}
    </div>
  );
}
type Mood = "hello" | "love" | "feed" | "play";
function Companion({ language }: { language: Language }) {
  const t = copy[language];
  const [selected, setSelected] = useState(pets[0]);
  const [skin, setSkin] = useState(0);
  const [reaction, setReaction] = useState<{ mood: Mood; count: number }>({ mood: "hello", count: 0 });
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  function react(mood: Mood) {
    clearTimeout(timer.current);
    setReaction((previous) => ({ mood, count: previous.count + 1 }));
    timer.current = setTimeout(() => setReaction((previous) => ({ ...previous, mood: "hello" })), 2200);
  }
  return (
    <div className="companion">
      <div className="pet-stage" style={{ backgroundColor: selected.color }}>
        <span className="stage-spark spark-one" aria-hidden="true">✧</span>
        <span className="stage-spark spark-two" aria-hidden="true">✦</span>
        <p className="speech" aria-live="polite">
          {reaction.mood === "hello" ? `${selected.name} ${t.greeting} ♡` : t.reactions[reaction.mood]}
        </p>
        <button className="pet-touch" onClick={() => react("love")} aria-label={`${t.petAction} ${selected.name}`}>
          <img key={`${selected.id}-${skin}-${reaction.count}`} className={`stage-pet mood-${reaction.mood}`}
            src={image(`${selected.id}-${selected.skins[skin]}.svg`)} alt={selected.name} />
        </button>
        {reaction.mood !== "hello" && <span key={reaction.count} className={`reaction-effect effect-${reaction.mood}`} aria-hidden="true">
          {reaction.mood === "love" ? "♡" : reaction.mood === "feed" ? "✦" : "⚽"}
        </span>}
        <span className="stage-ground" aria-hidden="true" />
      </div>
      <div className="pet-picker" role="group" aria-label={t.pets}>
        {pets.map((pet) => <button key={pet.id} aria-label={`${t.preview} ${pet.name}`}
          aria-pressed={selected.id === pet.id} className={selected.id === pet.id ? "chosen" : ""}
          onClick={() => { setSelected(pet); setSkin(0); react("hello"); }}>
          <img src={image(`${pet.id}.svg`)} alt="" /><span>{pet.name}</span>
        </button>)}
      </div>
      <div className="skin-picker" role="group" aria-label={t.skins}>
        <span>{t.skins}</span>
        {selected.skins.map((variant, index) => <button key={variant} aria-label={t.skinNames[variant as keyof typeof t.skinNames]}
          aria-pressed={skin === index} onClick={() => { setSkin(index); react("hello"); }}>
          <img src={image(`${selected.id}-${variant}.svg`)} alt="" />
        </button>)}
      </div>
      <div className="demo-actions" role="group" aria-label={t.tryDemo}>
        <button onClick={() => react("love")}><span aria-hidden="true">♡</span> {t.petAction}</button>
        <button onClick={() => react("feed")}><span aria-hidden="true">✦</span> {t.feedAction}</button>
        <button onClick={() => react("play")}><span aria-hidden="true">⚽</span> {t.playAction}</button>
      </div>
      <p className="demo-hint">{t.tryDemo}</p>
    </div>
  );
}
function MacGallery({ language }: { language: Language }) {
  const t = copy[language];
  const [selected, setSelected] = useState(0);
  const frames = ["macos-skins.png", "macos-wardrobe.png", "macos-cat.png"];
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <section className="mac-gallery" aria-labelledby="gallery-title">
      <div className="gallery-heading">
        <div><p className="eyebrow">{t.inTheWild}</p><h2 id="gallery-title">{t.galleryTitle}</h2></div>
        <span className="mac-label"><span aria-hidden="true">●</span> {t.macCaptures}</span>
      </div>
      <div className="gallery-tabs" role="group" aria-label={t.screenshots}>
        {t.galleryCaptions.map((caption, index) => <button key={index} aria-pressed={selected === index}
          onClick={() => setSelected(index)}>{caption}</button>)}
      </div>
      <figure>
        <button className="screenshot-button" onClick={() => dialog.current?.showModal()} aria-label={t.enlarge}>
          <img key={selected} className="gallery-image" src={image(frames[selected])}
            alt={t.galleryAlts[selected]} width="2000" height="1520" loading="lazy" />
          <span className="enlarge-label" aria-hidden="true">↗</span>
        </button>
        <figcaption>{t.galleryCaptions[selected]} <span>· {t.enlarge}</span></figcaption>
      </figure>
      <dialog ref={dialog} className="screenshot-dialog" onClick={(event) => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <button className="dialog-close" autoFocus onClick={() => dialog.current?.close()} aria-label={t.close}>×</button>
        <img src={image(frames[selected])} alt={t.galleryAlts[selected]} width="2000" height="1520" />
      </dialog>
    </section>
  );
}
function App() {
  const [language, setLanguage] = useState<Language>(initialLanguage);
  const t = copy[language];
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark"),
  );
  const [result, setResult] = useState<ReleaseResult | null>(() => {
    const cache = readCache(storage());
    return cache
      ? {
          downloads: selectDownloads(cache.releases),
          checkedAt: cache.checkedAt,
          stale: Date.now() - cache.checkedAt >= CACHE_TTL,
        }
      : null;
  });
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const legacyPrivacy =
    location.hash === "#privacy" &&
    !/\/(?:terms|privacy)\.html$/.test(location.pathname);
  const page = /\/terms(?:\.html)?\/?$/.test(location.pathname)
    ? "terms"
    : /\/privacy(?:\.html)?\/?$/.test(location.pathname) || legacyPrivacy
      ? "privacy"
      : "home";
  const link = (name: "home" | "terms" | "privacy") =>
    `${base}${name === "home" ? "" : `${name}.html`}?lang=${language}`;
  useEffect(() => {
    document.documentElement.lang = language;
    const address = new URL(location.href);
    if (legacyPrivacy) {
      address.pathname = `${base}privacy.html`;
      address.hash = "";
    }
    address.searchParams.set("lang", language);
    history.replaceState(null, "", address);
    document.title = `${page === "terms" ? t.terms : page === "privacy" ? t.privacy : "OC Pet"} · Young Boy Studio`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        page === "home"
          ? t.intro
          : page === "terms"
            ? t.termsIntro
            : t.privacyIntro,
      );
    try {
      storage()?.setItem("oc-pet-language", language);
    } catch {
      /* Language also works without storage. */
    }
  }, [language, page, t]);
  useEffect(() => {
    if (page !== "home") return;
    let alive = true;
    let pending = false;
    async function refresh() {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      setBusy(true);
      try {
        const next = await loadReleases({ storage: storage() });
        if (alive) {
          setResult(next);
          setFailed(false);
        }
      } catch {
        if (alive) setFailed(true);
      } finally {
        pending = false;
        if (alive) setBusy(false);
      }
    }
    void refresh();
    const interval = window.setInterval(refresh, CACHE_TTL);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    return () => {
      alive = false;
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
    };
  }, [page]);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      storage()?.setItem("oc-pet-theme", next ? "dark" : "light");
    } catch {
      /* Theme remains usable. */
    }
  }
  return (
    <>
      <a className="sr-only focus:not-sr-only" href="#main">
        {t.skip}
      </a>
      <header className="shell flex h-20 items-center justify-between gap-2">
        <a
          href={link("home")}
          className="flex shrink-0 items-center gap-1 text-lg font-bold tracking-tight"
        >
          <img src={image("cow.svg")} className="size-8" alt="" />
          OC Pet
        </a>
        <nav aria-label={t.nav} className="flex items-center gap-1 sm:gap-3">
          <select
            className="nav-select"
            aria-label={t.language}
            value={language}
            onChange={(event) => setLanguage(event.target.value as Language)}
          >
            <option value="en">EN</option>
            <option value="vi">VI</option>
          </select>
          <button
            className="theme-toggle"
            aria-label={dark ? t.light : t.dark}
            aria-pressed={dark}
            onClick={toggleTheme}
          >
            {dark ? "☀" : "☾"}
          </button>
          <a href={REPO_URL} className="github-button">
            <GithubIcon />
            <span>{t.github}</span>
          </a>
        </nav>
      </header>
      <main id="main" className="shell">
        {page === "home" ? (
          <>
            <section className="hero">
              <div className="hero-copy">
                <p className="eyebrow">{t.eyebrow}</p>
                <h1>
                  {t.headline}
                  <br />
                  <em>{t.headlineAccent}</em>
                </h1>
                <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
                  {t.intro}
                </p>
                <DownloadButton
                  language={language}
                  result={result}
                  busy={busy}
                  failed={failed}
                />
              </div>
              <Companion language={language} />
            </section>
            <div className="feature-line">
              {t.features.map((feature) => (
                <span key={feature}>{feature}</span>
              ))}
            </div>
            <DesktopDemo language={language} />
            <details className="customization-gallery">
              <summary>{t.customization}</summary>
              <MacGallery language={language} />
            </details>
            <section className="studio-note">
              <img
                src={image("young-boy-studio.svg")}
                alt="Young Boy Studio"
                className="size-20 shrink-0"
              />
              <div>
                <p className="eyebrow mb-2">{t.studio}</p>
                <p className="max-w-2xl text-xs leading-6 text-muted">
                  {t.paid}
                </p>
              </div>
            </section>
            <p className="mb-7 max-w-2xl text-[10px] leading-5 text-muted">
              {t.fileNote}
            </p>
          </>
        ) : (
          <article className="legal-copy">
            <a
              href={link("home")}
              className="text-xs text-muted hover:text-ink"
            >
              ← {t.home}
            </a>
            <h1 className="mt-7 text-4xl">
              {page === "terms" ? t.terms : t.privacy}
            </h1>
            <p className="mt-3 text-[11px] text-muted">{t.updated}</p>
            <p className="mt-6 text-sm leading-7 text-muted">
              {page === "terms" ? t.termsIntro : t.privacyIntro}
            </p>
            {(page === "terms" ? t.termsSections : t.privacySections).map(
              (section) => (
                <section key={section.title}>
                  <h2>{section.title}</h2>
                  <p>{section.body}</p>
                </section>
              ),
            )}
            {page === "terms" ? (
              <a
                className="legal-reference"
                href="https://opensource.org/license/mit"
              >
                {t.license} ↗
              </a>
            ) : (
              <a
                className="legal-reference"
                href="https://www.gameanalytics.com/trust/privacy-notice"
              >
                {t.providerPrivacy} ↗
              </a>
            )}
          </article>
        )}
      </main>
      <footer className="shell flex flex-wrap items-center justify-between gap-3 border-t border-line py-5 text-[10px] text-muted">
        <span>© 2026 Young Boy Studio</span>
        <div className="flex gap-5">
          <a
            href={link("terms")}
            aria-current={page === "terms" ? "page" : undefined}
          >
            {t.terms}
          </a>
          <a
            href={link("privacy")}
            aria-current={page === "privacy" ? "page" : undefined}
          >
            {t.privacy}
          </a>
        </div>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
