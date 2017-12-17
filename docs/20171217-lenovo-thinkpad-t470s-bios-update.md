Lenovo Thinkpad BIOS Update With Linux
======================================

*This is for a Thinkpad 470s, but other models should be quite similar.*

Though Thinkpads are popular amound Linux users, unfortunately, Lenono does not
provide a BIOS update mechanism for Linux but all their recommended ways
include Windows at one point or another. But it is still pretty easy to get a
BIOS update done with Linux only:

0. Ensure that your laptop's battery is charged and your power supply is
   plugged in.

1. Download the *BIOS Update (Bootable CD) for Windows…* from Lonovo's [support
   website](https://pcsupport.lenovo.com/de/en/products/laptops-and-netbooks/thinkpad-t-series-laptops/thinkpad-t470s/downloads).
   You should get a file like `n1wur15w.iso`.

2. Next, we need to convert this into something we can put on a USB thumb
   drive. For that, download the El Torito boot image extractor. On Fedora:

        dnf install geteltorito.noarch

3. Convert the image:

        geteltorito -o bios-20171217.img n1wur15w.iso

4. Next, insert a USB thumb drive to use for the update. Not that *all data on
   this drive will be erased!* Make sure it is unmounted (use `unmount`) in
   case it got mounted automatically and find out the device name (probably
   something like `/dev/sdX`). *Make sure the name is correct as you might
   otherwise overwrite the wrong device and loose valuable data!* Tools which
   might help finding out the correct device name include `dmesg` or `mount`
   (while the drive is still mounted).

5. Copy the file to the USB thumb drive. Again, make sure the device name is
   correct:

        dd if=bios-20171217.img of=/dev/sdg bs=1M

6. Reboot your laptop

7. When the Lenovo logo shows up during the reboot, press `Enter` and then
   `F12` to get into the boot menu where you should be able to select the USB
   thumb drive to boot from.

8. From here, follow the instructions to update your *system program*.

<time>Sun Dec 17 13:51:20 CET 2017</time>
