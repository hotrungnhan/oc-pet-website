import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  AUTHOR_URL,
  CACHE_TTL,
  loadReleases,
  readCache,
  REPO_URL,
  RELEASES_URL,
  selectDownloads,
  type ReleaseResult,
} from "./releases";
import "./style.css";
const image = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;
const pets = [
  {
    id: "cow",
    name: "Clover",
    species: "Cow",
    color: "#e8edda",
    note: "A little countryside calm.",
  },
  {
    id: "rabbit",
    name: "Pip",
    species: "Rabbit",
    color: "#f3e4e8",
    note: "Small paws. Big personality.",
  },
  {
    id: "otter",
    name: "Mochi",
    species: "Otter",
    color: "#e0ebed",
    note: "Your very own work buddy.",
  },
  {
    id: "dog",
    name: "Biscuit",
    species: "Dog",
    color: "#f4e8d2",
    note: "Always happy to see you.",
  },
  {
    id: "cat",
    name: "Miso",
    species: "Cat",
    color: "#e9e3f0",
    note: "A softer kind of coworker.",
  },
];
function storage() {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
function App() {
  const [selected, setSelected] = useState(pets[0]);
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
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
          setError(false);
        }
      } catch {
        if (alive) setError(true);
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
  }, []);
  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      storage()?.setItem("oc-pet-theme", next ? "dark" : "light");
    } catch {
      /* Theme still works without persistence. */
    }
  }
  return (
    <>
      <a className="sr-only focus:not-sr-only" href="#main">
        Skip to content
      </a>
      <header className="shell flex h-20 items-center justify-between gap-3 md:h-24">
        <a
          href="#"
          className="flex items-center gap-2 text-2xl font-bold tracking-tight"
        >
          <img className="size-10" src={image("cow.svg")} alt="" />
          OC Pet<span className="hidden text-sage sm:inline">✳</span>
        </a>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-3 text-sm md:gap-7"
        >
          <a className="hidden md:block" href="#companions">
            Meet the pets
          </a>
          <a className="hidden md:block" href={AUTHOR_URL}>
            Meet the maker ↗
          </a>
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
            aria-pressed={dark}
          >
            {dark ? "☀" : "☾"}
          </button>
          <a
            className="rounded-lg border border-line px-3 py-2 text-xs font-semibold md:px-5 md:text-sm"
            href="#download"
          >
            Get OC Pet ↓
          </a>
        </nav>
      </header>
      <main id="main">
        <section className="shell grid items-center gap-7 py-7 md:grid-cols-2 md:gap-16 md:py-20">
          <div>
            <p className="eyebrow">A SMALL FRIEND FOR YOUR EVERYDAY</p>
            <h1 className="text-[2.65rem] leading-[1.12] tracking-[-2px] md:text-6xl">
              A little company.
              <br />A <em>happier</em> desktop.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-7 text-muted md:mt-6 md:text-base">
              A tiny companion for your screen. Happy hops, sleepy afternoons,
              and a little warmth for your workday.
            </p>
            <a className="button mt-6" href="#download">
              Find your desktop friend <span>↓</span>
            </a>
            <p className="mt-3 text-[11px] text-muted">
              macOS & Windows · No account needed
            </p>
          </div>
          <div
            className="pet-stage"
            style={{ backgroundColor: selected.color }}
          >
            <div className="flex justify-between border-b border-black/10 px-4 py-3 text-[9px] text-[#657052]">
              <span>● ● ●</span>
              <span>your little desktop corner</span>
              <span>✳</span>
            </div>
            <span className="absolute right-6 top-14 text-5xl text-[#a3af78]">
              ✳
            </span>
            <p className="speech" aria-live="polite">
              {selected.name} is happy you’re here ♡
            </p>
            <img
              className="stage-pet"
              src={image(`${selected.id}.svg`)}
              alt={`${selected.name} the ${selected.species.toLowerCase()}`}
            />
            <div className="absolute inset-x-0 bottom-0 flex justify-between border-t border-black/10 px-4 py-3 text-[9px] text-[#657052]">
              <span>● Currently: making your day</span>
              <span>♡ +1</span>
            </div>
          </div>
        </section>
        <section id="companions" className="shell py-8 md:py-16">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="eyebrow hidden md:block">
                THE DESKTOP FRIEND GROUP
              </p>
              <h2 className="text-2xl md:text-4xl">
                Five faces. <em>Your favorite.</em>
              </h2>
            </div>
            <p className="hidden text-xs text-muted md:block">
              15 breeds. 10 growth appearances. A friend for you.
            </p>
          </div>
          <div className="grid grid-cols-5 gap-2 md:gap-5">
            {pets.map((pet) => (
              <button
                className="group min-w-0 text-left"
                key={pet.id}
                onClick={() => setSelected(pet)}
                aria-pressed={selected.id === pet.id}
                aria-label={`Preview ${pet.name}`}
              >
                <div
                  className={`pet-tile ${selected.id === pet.id ? "ring-2 ring-sage ring-offset-2 ring-offset-paper" : ""}`}
                  style={{ backgroundColor: pet.color }}
                >
                  <span className="hidden text-[9px] tracking-widest text-[#657052] md:block">
                    {pet.species.toUpperCase()}
                  </span>
                  <img
                    className="mx-auto w-full transition-transform group-hover:-translate-y-1"
                    src={image(`${pet.id}.svg`)}
                    alt=""
                    loading="lazy"
                  />
                </div>
                <h3 className="mt-2 truncate text-center text-[10px] font-semibold md:mt-4 md:text-left md:text-base">
                  {pet.name}
                </h3>
                <p className="mt-1 hidden text-[11px] text-muted md:block">
                  {pet.note}
                </p>
              </button>
            ))}
          </div>
        </section>
        <section className="border-y border-line bg-panel">
          <div className="shell grid gap-10 py-10 md:grid-cols-2 md:items-center md:gap-16 md:py-16">
            <div>
              <p className="eyebrow hidden md:block">
                A LITTLE LIFE, ALONGSIDE YOURS
              </p>
              <h2 className="text-2xl md:text-4xl">
                Small moments.
                <br className="hidden md:block" /> <em>Good company.</em>
              </h2>
              <div className="mt-5 flex flex-wrap gap-2 md:hidden">
                {[
                  "Feed & grow",
                  "Naps & games",
                  "Hide & mute",
                  "English / Tiếng Việt",
                ].map((text) => (
                  <span
                    key={text}
                    className="rounded-full border border-line px-3 py-1 text-[11px] text-muted"
                  >
                    {text}
                  </span>
                ))}
              </div>
              <div className="mt-7 hidden space-y-6 md:block">
                {[
                  [
                    "01",
                    "Watch a friendship grow",
                    "Feed your pet, share affection, and watch it grow. Every friend keeps its own progress.",
                  ],
                  [
                    "02",
                    "Make the everyday playful",
                    "Stretches, naps, foraging, and a little football or basketball between tasks.",
                  ],
                  [
                    "03",
                    "Settle into your space",
                    "Adjust size and sound. Hide, mute, or use click-through when you need to focus. English and Vietnamese included.",
                  ],
                ].map(([n, title, copy]) => (
                  <div className="flex gap-5" key={n}>
                    <span className="text-sage">{n}</span>
                    <div>
                      <h3 className="text-sm font-semibold">{title}</h3>
                      <p className="mt-1 max-w-sm text-xs leading-6 text-muted">
                        {copy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <figure className="hidden rounded-xl border border-line bg-[#e5deeb] p-5 md:block dark:bg-[#393340]">
              <img
                className="rounded-lg"
                src={image("appearance.png")}
                alt="OC Pet Appearance settings with pet and breed selection"
                loading="lazy"
              />
              <figcaption className="mt-4 text-center text-[10px] text-muted">
                The actual app · soft colors, familiar controls.
              </figcaption>
            </figure>
          </div>
        </section>
        <section id="download" className="shell py-10 text-center md:py-20">
          <p className="eyebrow hidden md:block">
            YOUR NEW FRIEND IS A FEW CLICKS AWAY
          </p>
          <h2 className="text-3xl md:text-5xl">
            Bring a little <em>company home.</em>
          </h2>
          <div className="mx-auto mt-6 grid max-w-3xl gap-3 sm:grid-cols-2 md:mt-9 md:gap-5">
            {(
              [
                ["mac", "macOS", "DMG · Drag to Applications", "⌘"],
                ["windows", "Windows", "EXE · Run the installer", "⊞"],
              ] as const
            ).map(([key, title, instruction, symbol]) => {
              const file = result?.downloads[key];
              return (
                <article key={key} className="download-card">
                  <div className="flex items-center gap-3 sm:block">
                    <span className="text-2xl text-sage">{symbol}</span>
                    <h3 className="font-semibold sm:mt-2">
                      OC Pet for {title}
                    </h3>
                  </div>
                  <p className="my-2 hidden text-xs text-muted sm:block">
                    {instruction}
                  </p>
                  <a
                    className="button mt-3 w-full text-xs"
                    href={file?.url || RELEASES_URL}
                  >
                    {file
                      ? `Download for ${title}`
                      : "View downloads on GitHub"}{" "}
                    <span>↓</span>
                  </a>
                  <p className="mt-2 text-[10px] text-muted">
                    {file
                      ? `${file.version} · ${(file.size / 1024 / 1024).toFixed(1)} MB`
                      : busy
                        ? "Checking releases…"
                        : "Installers on GitHub Releases"}
                  </p>
                </article>
              );
            })}
          </div>
          <p role="status" className="mt-4 text-[10px] text-muted">
            {result?.stale
              ? "Showing saved downloads. We’ll check again when GitHub is available."
              : error
                ? "GitHub is unavailable. Browse releases directly."
                : result
                  ? `Checked ${new Date(result.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · Updates every 15 minutes`
                  : "Checking GitHub Releases…"}
          </p>
          <a
            className="mt-3 inline-block text-xs underline underline-offset-4"
            href={RELEASES_URL}
          >
            All releases & notes ↗
          </a>
          <p className="mt-4 text-[10px] text-muted">
            macOS builds are unsigned and not notarized.
          </p>
        </section>
        <section className="shell pb-10 md:pb-16">
          <div className="rounded-xl border border-line bg-panel p-5 md:p-8">
            <div className="mb-4 flex items-center gap-4">
              <img
                className="size-24 rounded-xl"
                src={image("young-boy-studio.svg")}
                alt="Young Boy Studio, a curious boy and a star"
                loading="lazy"
              />
              <div>
                <p className="eyebrow mb-2">A NOTE FROM THE MAKER</p>
                <p className="text-lg font-semibold">Young Boy Studio</p>
              </div>
            </div>
            <h2 className="text-xl md:text-2xl">
              Little pets. A human behind them.
            </h2>
            <p className="mt-3 max-w-3xl text-xs leading-6 text-muted md:text-sm md:leading-7">
              OC Pet may offer paid assets in the future, and some currently
              free assets may become paid. Its maker needs food and water, too.
              If that day comes, I hope you’ll keep supporting this little
              project. Thanks for giving it a home. ♡
            </p>
            <div className="mt-4 flex flex-wrap gap-4 text-xs">
              <a className="underline underline-offset-4" href={AUTHOR_URL}>
                Young Boy Studio · @hotrungnhan ↗
              </a>
              <a className="underline underline-offset-4" href={REPO_URL}>
                Website & public releases ↗
              </a>
            </div>
          </div>
        </section>
        <section
          id="privacy"
          className="shell pb-10 md:grid md:grid-cols-2 md:gap-16 md:pb-16"
        >
          <h2 className="mb-4 text-2xl">A few little details.</h2>
          <div>
            {[
              [
                "What happens when I drop a file?",
                "Valid regular files dropped on your pet move to Trash / Recycle Bin by default. Disable file cleanup in Config for pretend snacks that keep originals.",
              ],
              [
                "What about analytics?",
                "Usage statistics are optional and off until you agree. GameAnalytics uses a persistent random ID and receives usage, platform, connection/IP and device information, so data is pseudonymous rather than fully anonymous. We do not send names, files, file contents, foreground app names or account details. Choose Not now on first launch, or turn statistics off in Config. Disabling stops new measurements and shuts down analytics; already queued events may finish. Restart the app to enable analytics again after disabling. Downloads without configured analytics do not send usage statistics.",
              ],
              [
                "Does my pet need an account?",
                "No account is required. Pet progress and settings stay on your computer.",
              ],
            ].map(([q, a]) => (
              <details
                className="border-b border-line py-3"
                key={q}
                open={
                  q === "What about analytics?" &&
                  window.location.hash === "#privacy"
                }
              >
                <summary className="cursor-pointer text-xs font-semibold">
                  {q}
                </summary>
                <p className="mt-2 text-xs leading-6 text-muted">{a}</p>
              </details>
            ))}
            <a
              className="mt-4 inline-block text-xs underline underline-offset-4"
              href={`${REPO_URL}/issues`}
            >
              Report a bug ↗
            </a>
          </div>
        </section>
      </main>
      <footer className="shell flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-[11px] text-muted">
        <span>OC Pet · Young Boy Studio</span>
        <a href="https://www.gameanalytics.com/trust/privacy-notice">
          GameAnalytics privacy ↗
        </a>
        <a href={AUTHOR_URL}>@hotrungnhan ↗</a>
      </footer>
    </>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
