Desktop freezes on 1 AMD Ryzen AI 7 350 with Radeon 860M
========================================================

I finally replaced my good old ThinkPad T470s after years of happy companionship.

Unfortunately, on my new laptop, the desktop environment would freeze occasionally. However, I could still switch to the terminal using `Ctrl + Alt + F2`. There I could kill and restart Cinnamon to fix the problem. So, there is no kernel panic freezing the entire system. This also wasn't related to Cinnamon specifically, I had the same issues in Cosmic, Gnome and KDE.

I managed to narrow the issue down to the `amdgpu` driver and found a fix that resolved it. If you have the same problem, here is what I did.


The Fix
-------

The fix is the addition of the Kernel parameter:

```ini
amdgpu.dcdebugmask=0x12
```

To set the parameter, edit the GRUB defaults:
```bash
vim /etc/default/grub
```

Find the `GRUB_CMDLINE_LINUX` line and append the parameter:

```makefile
GRUB_CMDLINE_LINUX="... rhgb quiet amdgpu.dcdebugmask=0x12"
```

Regenerate the GRUB config:

```bash
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
```

Reboot.


What does `amdgpu.dcdebugmask=0x12` actually do?
------------------------------------------------

This is a bitmask controlling specific Display Core features:

| Bit | Hex Value | Flag                         | Meaning                                          |
|-----|-----------|------------------------------|--------------------------------------------------|
| 0   | `0x01`    | `DC_DISABLE_PIPE_SPLIT`      | Disable pipe splitting                           |
| 1   | `0x02`    | `DC_DISABLE_STUTTER`         | Disable memory stutter mode                      |
| 2   | `0x04`    | `DC_DISABLE_DSC`             | Disable Display Stream Compression               |
| 3   | `0x08`    | `DC_DISABLE_CLOCK_GATING`    | Disable clock gating optimizations               |
| 4   | `0x10`    | `DC_DISABLE_PSR`             | **Disable Panel Self Refresh (PSR v1 + PSR-SU)** |
| 5   | `0x20`    | `DC_FORCE_SUBVP_MCLK_SWITCH` | Force mclk switch in SubVP                       |
| 9   | `0x200`   | `DC_DISABLE_PSR_SU`          | Disable PSR Selective Update only                |
| 10  | `0x400`   | `DC_DISABLE_REPLAY`          | Disable Panel Replay                             |

So **`0x12` = `0x10` + `0x02`**, meaning it disables:

- **PSR** (`0x10`) — Panel Self Refresh (the primary freeze culprit)
- **Stutter mode** (`0x02`) — Memory stutter/low-power idle state for the display engine

The result may be a slightly higher power consumption. But that's much better than a regularly freezing desktop, and I didn't notice a significant difference.

<date>
Mon May 25 11:47:50 AM CEST 2026
</date>
