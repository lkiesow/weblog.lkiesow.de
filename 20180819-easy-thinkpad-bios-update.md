Lenovo Thinkpad BIOS Update Using fwupd
=======================================

*This is an update to the [Lenovo Thinkpad BIOS Update With
Linux]/(20171217-lenovo-thinkpad-t470s-bios-update) post since with the recent
join of Lenovo to [fwupd.org](https://fwupd.org/) things have gotten a lot
easier.*

While the old method should still work, Lenovo made updates a lot easier when
they joined [fwupd.org](https://fwupd.org/) which let's you update your
firmware directly from a Linux shell (or even a GUI). Unfortunately, this is
not yet available for all Lenovo devices but most high-end ThinkPads are
supported already and more devices will be added over time. For more details,
including a list of supported devices, take a look at [fwupd's end user
page](https://fwupd.org/users) but here is a quick guide:

1. Install `fwupd` (and its `fwupdmgr` tool). On Fedora, this would for example be:

        % dnf install fwupd

2. Refresh firmware list:

        % fwupdmgr refresh

3. List devices and available updates:

        % fwupdmgr get-devices
        % fwupdmgr get-topology
        % fwupdmgr get-updates

4. Apply all updates (root privileges may be required):

        % fwupdmgr update

That's it!

<time>Sun Aug 19 15:13:50 CEST 2018</time>
