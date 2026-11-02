# OC Pet {{VERSION}}

A little company. A happier desktop.

Made by **Young Boy Studio**.

## What’s new

{{CHANGES}}

## Downloads

| Platform | Installer | Installation |
| --- | --- | --- |
| macOS (Apple Silicon & Intel) | `OCPet-{{VERSION}}.dmg` | Open the DMG and drag OC Pet into Applications. |
| Windows (x86_64) | `OCPet-{{VERSION}}-setup.exe` | Run the installer and follow the setup steps. |

Download the installers attached to this release. Saved pet progress stays on your computer.

## Before installing

- **macOS:** this build is unsigned and not notarized.
- **Windows:** the installer is cross-compiled on macOS. Windows hardware validation is still in progress.
- **File drops:** valid regular files dropped onto your pet move to Trash / Recycle Bin by default. Disable file cleanup in Config for pretend snacks that keep originals.

## Verify your download

Compare the installer’s SHA-256 checksum with the attached `SHA256SUMS.txt`.

macOS:

```sh
shasum -a 256 OCPet-{{VERSION}}.dmg
```

Windows PowerShell:

```powershell
Get-FileHash .\OCPet-{{VERSION}}-setup.exe -Algorithm SHA256
```

## A note from the maker

OC Pet may offer paid assets in the future, and some currently free assets may become paid. Its maker needs food and water, too. If that day comes, I hope you’ll keep supporting this little project. Thanks for giving it a home. ♡

[Website](https://hotrungnhan.github.io/oc-pet-website/) · [Public repository](https://github.com/hotrungnhan/oc-pet-website) · [Maker](https://github.com/hotrungnhan) · [Report a bug](https://github.com/hotrungnhan/oc-pet-website/issues)

When reporting a bug, include your operating system, app version, and steps to reproduce it.
