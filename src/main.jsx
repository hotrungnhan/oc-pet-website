import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { REPOSITORY, REPO_URL, RELEASES_URL, selectDownloads } from './releases';
import './style.css';

const image = name => `${import.meta.env.BASE_URL}images/${name}`;
const pets = [
  { id: 'cow', name: 'Clover', species: 'The cow', note: 'A little countryside calm.', color: '#e8edda' },
  { id: 'rabbit', name: 'Pip', species: 'The rabbit', note: 'Small paws. Big personality.', color: '#f3e4e8' },
  { id: 'otter', name: 'Mochi', species: 'The otter', note: 'Your very own work buddy.', color: '#e0ebed' },
  { id: 'dog', name: 'Biscuit', species: 'The dog', note: 'Always happy to see you.', color: '#f4e8d2' },
  { id: 'cat', name: 'Miso', species: 'The cat', note: 'A softer kind of coworker.', color: '#e9e3f0' },
];
function Arrow({ down = false }) { return <span aria-hidden="true">{down ? '↓' : '↗'}</span>; }
function App() {
  const [selected, setSelected] = useState(pets[0]);
  const [downloads, setDownloads] = useState({});
  const [status, setStatus] = useState('loading');
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch(`https://api.github.com/repos/${REPOSITORY}/releases?per_page=100`, { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } })
      .then(r => { if (!r.ok) throw new Error('Release lookup failed'); return r.json(); })
      .then(releases => { setDownloads(selectDownloads(releases)); setStatus('ready'); })
      .catch(() => setStatus('error')).finally(() => clearTimeout(timeout));
    return () => { clearTimeout(timeout); controller.abort(); };
  }, []);
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="header wrap">
      <a className="brand" href="#" aria-label="OC Pet home"><img src={image('cow.svg')} alt="" /> OC Pet<span className="brand-dot">✳</span></a>
      <nav aria-label="Main navigation"><a href="#companions">Meet the pets</a><a href="#life">Little moments</a><a className="nav-download" href="#download">Get OC Pet <Arrow down /></a></nav>
    </header>
    <main id="main">
      <section className="hero wrap">
        <div className="hero-copy"><p className="eyebrow"><span className="live-dot" /> A SMALL FRIEND FOR YOUR EVERYDAY</p><h1>A little company.<br />A <em>happier</em> desktop.</h1><p className="intro">Meet the little companion that makes itself at home on your screen. A few happy hops, a sleepy afternoon, and suddenly work feels a little warmer.</p><a className="button primary" href="#download">Find your desktop friend <Arrow down /></a><p className="hero-note">Made for macOS & Windows · No account needed</p></div>
        <div className="hero-art" style={{ '--pet-color': selected.color }}>
          <div className="art-top"><span className="window-dots"><i/><i/><i/></span><span>a little corner of your desktop</span><span>✳</span></div>
          <span className="art-label">WORK IN PROGRESS.<br />COMPANY INCLUDED.</span>
          <span className="sun">✳</span><div className="bubble" aria-live="polite">{selected.name} is happy you're here ♡</div>
          <img className="hero-pet" src={image(`${selected.id}.svg`)} alt={`${selected.name}, your illustrated desktop companion`} />
          <span className="flower flower-one">✿</span><span className="flower flower-two">✿</span><div className="ground" />
          <div className="art-bottom"><span><span className="live-dot"/> Currently: making your day</span><span>♡ +1</span></div>
          <div className="sticker">100%<br /><strong>good company</strong></div>
        </div>
      </section>
      <div className="ribbon"><div className="wrap"><span>Little paws, big personality</span><span>✳</span><span>A companion, at your pace</span><span>✳</span><span>Make room for a little joy</span><span>✳</span></div></div>
      <section id="companions" className="section wrap">
        <div className="section-head"><div><p className="eyebrow">THE DESKTOP FRIEND GROUP</p><h2>Five faces. <em>Your favorite.</em></h2></div><p>A cow, a rabbit, an otter, a dog, a cat.<br />Someone here is very excited to meet you.</p></div>
        <div className="pet-grid">{pets.map(pet => <button key={pet.id} className={`pet-card ${selected.id === pet.id ? 'selected' : ''}`} onClick={() => setSelected(pet)} aria-pressed={selected.id === pet.id} style={{ '--pet-color': pet.color }}><div className="pet-image"><span>{pet.species}</span><img loading="lazy" src={image(`${pet.id}.svg`)} alt={`${pet.name} the ${pet.id}`} /><span className="pet-select" aria-hidden="true">{selected.id === pet.id ? '♡' : '+'}</span></div><h3>{pet.name}</h3><p>{pet.note}</p></button>)}</div>
        <p className="section-foot">Pick a face to preview above. In the app, discover 15 breed variants and 10 growth appearances per pet.</p>
      </section>
      <section id="life" className="life-section"><div className="wrap life-layout"><div><p className="eyebrow">MORE THAN A CUTE FACE</p><h2>A little life,<br /><em>alongside yours.</em></h2><p className="life-intro">There’s no perfect routine to keep. Just small moments of care, play, and company throughout your day.</p><div className="feature"><span>01</span><div><h3>Watch a friendship grow</h3><p>Feed your pet, share a little affection, and watch it grow through ten appearances. Each friend keeps its own progress.</p></div></div><div className="feature"><span>02</span><div><h3>Make the everyday playful</h3><p>A stretch between tasks. An afternoon nap. A little football or basketball when it’s time for a break.</p></div></div><div className="feature"><span>03</span><div><h3>Settle into your space</h3><p>Choose your size, language, and sound. Hide, mute, or use click-through whenever you need to focus.</p></div></div></div><figure className="app-figure"><div className="figure-heading"><span>MAKE YOURSELF AT HOME</span><span>↙</span></div><img loading="lazy" src={image('appearance.png')} alt="OC Pet’s Appearance settings showing Clover, character selection, and breed options"/><figcaption>The actual app · soft colors, familiar controls.</figcaption></figure></div></section>
      <section id="download" className="section wrap download-section"><p className="eyebrow">A NEW FRIEND IS A FEW CLICKS AWAY</p><h2>Give your desktop<br /><em>a little heartbeat.</em></h2><p>Pick your platform. Bring a little company home.</p><div className="download-grid">{[['mac', 'macOS', 'DMG · Drag to Applications'], ['windows', 'Windows', 'EXE · Run the installer']].map(([key, title, instruction]) => { const file = downloads[key]; return <article key={key} className="download-card"><div className="platform-symbol" aria-hidden="true">{key === 'mac' ? '⌘' : '⊞'}</div><h3>OC Pet for {title}</h3><p>{instruction}</p><a className="button primary" href={file?.url || RELEASES_URL}>{file ? `Download for ${title}` : status === 'loading' ? 'View releases' : status === 'error' ? 'Find downloads on GitHub' : 'Check for a release'} <Arrow down /></a><small>{file ? `${file.version} · ${(file.size / 1024 / 1024).toFixed(1)} MB` : status === 'ready' ? 'No installer published yet' : 'Downloads are hosted on GitHub Releases'}</small></article>; })}</div><p className="release-status" role="status">{status === 'error' ? 'Release details are unavailable right now. You can still get installers directly on GitHub.' : 'The newest available installer is shown for each platform; versions may differ.'}</p><a className="text-link" href={RELEASES_URL}>All releases & release notes <Arrow /></a><p className="install-note">macOS builds are unsigned and not notarized. Review the release notes before installing.</p></section>
      <section className="faq wrap"><h2>A few little details.</h2><div><details><summary>Does my pet need an account?</summary><p>No. Your pet’s progress and settings are saved locally on your computer. The app includes English and Vietnamese interfaces.</p></details><details><summary>Can I keep it around while I work?</summary><p>Yes. Resize your pet and use click-through to interact with windows behind it. Hide or mute it from the menu, including for a set duration.</p></details><details><summary>What happens if I drop a file on my pet?</summary><p>By default, dropping a valid regular file on your pet moves it to Trash or Recycle Bin. Turn file cleanup off in Config to keep the original files and use pretend snacks instead.</p></details><details><summary>Where can I report a bug?</summary><p>Open an <a href={`${REPO_URL}/issues`}>issue on GitHub</a>. Include your operating system, app version, and what happened.</p></details></div></section>
    </main>
    <footer className="wrap"><a className="brand" href="#"><img src={image('cow.svg')} alt=""/> OC Pet</a><p>A small friend. A softer workday.</p><a href={REPO_URL}>GitHub <Arrow /></a><a href={RELEASES_URL}>Releases <Arrow /></a><span>Made with a little ♡</span></footer>
  </>;
}
createRoot(document.getElementById('root')).render(<App />);
