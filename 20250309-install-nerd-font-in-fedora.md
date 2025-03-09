Install Nerd Fonts in Fedora
============================

If you noticed that on your Linux distributions some emoticons won't render properly, try [Nerd Fonts](https://nerdfonts.com).
Nerd Fonts is a collection of a lot of different fonts which have all the icons you want.

To get started, first [select and download the font you want from the Nerd Font download page](https://www.nerdfonts.com/font-downloads).
I selected “Hack”, but you can pick any font you like.

Next, this is how you install the font in Fedora:

```sh=
# download font
curl -LO https://github.com/ryanoasis/nerd-fonts/releases/download/v3.3.0/Hack.zip

# create local font directory and unzip the font
mkdir -p ~/.local/share/fonts
unzip -d ~/.local/share/fonts Hack.zip

# update the font cache
fc-cache -fv

# remove downloaded archive
rm Hack.zip
```

You can now use the font whereever you like.

Finally, you might also want to select the font as the default font for your desktop environment.
For that, look for the `Font Selection` option in the start menu of your desktop.

<time>
Sun Mar  9 04:40:50 PM CET 2025
</time>
