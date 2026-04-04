Disable System Bell in Linux
============================

Have you even been in a terminal, the login screen or somewhere else deep in
the system, hit backspace and your Linux laptop screamed at you with a loud and
annoying “BEEEPP”?

Congratulations! You found the system bell. A relic from the past and something
you might just want to disable.

The easiest way to do that is to just unload the kernel module for it.
To do this temporarily, just run:

```sh
sudo modprobe -r pcspkr
```

If you want to make this permanent, blacklist the module in the modprobe configuration:

```sh
echo "blacklist pcspkr" | sudo tee /etc/modprobe.d/blacklist-pcspkr.conf
```

<time>
Sat Apr  4 11:12:36 PM CEST 2026
</time>
