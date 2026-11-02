# OC Pet

<img src="public/images/young-boy-studio.png" width="160" alt="Young Boy Studio" />

**A little company. A happier desktop.**

OC Pet is a desktop companion for macOS and Windows. Meet Clover the Cow, Pip the Rabbit, Mochi the Otter, Biscuit the Dog, and Miso the Cat: five little personalities that grow alongside your day.

[Visit the website](https://hotrungnhan.github.io/oc-pet-website/) · [Download OC Pet](https://github.com/hotrungnhan/oc-pet-website/releases) · [Report a bug](https://github.com/hotrungnhan/oc-pet-website/issues)

![OC Pet’s Appearance settings](public/images/appearance.png)

## Meet your desktop friend

- Five species, 15 breed variants, and ten growth appearances per pet.
- Feed, share affection, and keep independent progress for each companion.
- Little stretches, naps, foraging moments, football, and basketball.
- Adjustable size, sound, timed hide/mute, and click-through controls.
- English and Vietnamese interfaces. Progress and settings are saved locally; no account is required.

**File drops:** by default, dropping a valid regular file on the pet moves it to Trash / Recycle Bin. Disable file cleanup in Config for pretend snacks that keep originals.

## The maker and future paid assets

Made by **Young Boy Studio** ([studio artwork](public/images/young-boy-studio.png)) · [@hotrungnhan](https://github.com/hotrungnhan). The [app repository](https://github.com/hotrungnhan/oc-pet) is currently private; this repository hosts the public website and releases.

OC Pet may offer paid assets in the future, and some currently free assets may become paid. Its maker needs food and water too. If that day comes, I hope you’ll keep supporting this little project. Thanks for giving it a home. ♡

## Install

Get the installer for your platform from [GitHub Releases](https://github.com/hotrungnhan/oc-pet-website/releases). macOS and Windows releases may have different versions; the website finds the newest published installer for each platform.

- **macOS:** open the `.dmg` and drag OC Pet into Applications. Builds are unsigned and not notarized; review the release notes before installing.
- **Windows:** run the `-setup.exe` installer. Saved pets are retained on uninstall.

These are development builds. Windows hardware validation is still in progress. Report problems with your app version and operating system in Issues.

## Website development

This public repository contains the **React + TypeScript + Vite + Tailwind CSS landing page**, screenshots, original character images, and public app releases. The desktop app is developed in a separate repository.

Requires Node.js 24 and npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Website content is in `src/main.tsx`, styling in `src/style.css`, and images in `public/images/`. Download discovery is in `src/releases.ts`. It reads GitHub’s public releases API without credentials, excludes drafts/prereleases, and selects installers independently per platform. Responses and ETags are cached in localStorage for 15 minutes. Expired entries are revalidated with If-None-Match; saved downloads remain usable if GitHub is offline or rate limited. Checks run on page load, every 15 minutes while visible, and when the browser regains focus or goes online. If storage is blocked, downloads still work without caching. Without cached data, failures fall back to the Releases page.

The layout uses Tailwind CSS 4 through `@tailwindcss/vite`, following the [current Vite setup](https://tailwindcss.com/docs/installation/using-vite). Theme colors are CSS variables in `src/style.css`. Dark mode follows the system on first visit; the theme toggle persists the visitor’s preference. Mobile presents a compact pet picker and download cards, with extended feature copy and the settings screenshot reserved for larger screens.

## GitHub Pages

Pushes to `main` run `.github/workflows/deploy.yml`: install locked dependencies, test release selection, build the site, and deploy `dist/` to GitHub Pages. Pages must use **GitHub Actions** as its publishing source. `vite.config.js` sets the project path to `/oc-pet-website/`; update it and the metadata in `index.html` if you rename the repository or add a custom domain.

Deployment follows [Vite’s GitHub Pages guide](https://vite.dev/guide/static-deploy#github-pages) and [GitHub’s custom workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Automated app releases

The private app repository has a tag-triggered release workflow. A matching `vMAJOR.MINOR.PATCH` tag builds and tests both installers on a macOS GitHub runner, then publishes them here with SHA-256 checksums. No website rebuild is needed. Manual workflow runs build artifacts for validation without publishing a release. See `docs/RELEASING.md` in the app repository for credential setup and tagging instructions.

## Publishing app updates

Publish a non-prerelease GitHub Release in this repository and attach `OCPet-<version>.dmg` and/or `OCPet-<version>-setup.exe`. The website discovers published installers on page load; no website rebuild is needed. Include checksums and platform notes with each release. A release containing only one platform leaves the other platform on its most recent available installer.

Example (run from the website repository, adjusting paths):

```sh
gh release create v0.18.0 /path/to/OCPet-0.18.0.dmg /path/to/OCPet-0.18.0-setup.exe --title 'OC Pet 0.18.0' --notes-file /path/to/release-notes.md
```

## License

Website code is MIT. Original OC Pet character artwork is CC0-1.0; see [image attribution](public/images/LICENSE.md). The app screenshot is included to demonstrate OC Pet. External fonts are served by Google Fonts (DM Sans and Lora, SIL Open Font License).

## Release-note template

For manual releases, copy [the release template](.github/RELEASE_TEMPLATE.md) into the release description and replace `{{VERSION}}` and `{{CHANGES}}`. Automated releases render the app repository’s copy of this template using public change notes from `docs/releases/<version>.md` before publishing. The template includes installer details, checksum commands, platform limitations, and the maker’s note.

## Optional app analytics

Analytics-capable desktop releases ask for consent before initializing GameAnalytics. Not now or closing the dialog keeps it off. Config can disable it later; restarting is required to enable again after shutdown. Reports use pseudonymous random installation IDs, not complete anonymity. GameAnalytics receives usage/session, platform/device and connection/IP information. OC Pet does not send names, files, file contents, foreground app names, or account details. Previously queued events may finish during shutdown. See the [website privacy section](https://hotrungnhan.github.io/oc-pet-website/#privacy). The website itself does not load GameAnalytics. Studio branding is separate from the CC0 character library.
