CentOS Stream LXC Container Template
====================================

We heavily use CentOS and other Red Hat based distributions, and I was kind of disappointed that Proxmox does not have current LXC templates for CentOS Stream.
Luckily, the CentOS project [does provide cloud images](https://cloud.centos.org/centos/9-stream/x86_64/images/) which can be easily converted to LXC templates.

For this guide, we will use [CentOS-Stream-GenericCloud-9-20220217.0.x86_64.qcow2](https://cloud.centos.org/centos/9-stream/x86_64/images/CentOS-Stream-GenericCloud-9-20220217.0.x86_64.qcow2), but the procedure is the same for other versions.

> If you are lazy and do not want to bother creating a container template yourself, you can just download one of my pre-built templates.
> No guarantee that these are bug-free, though!
>
> - [CentOS-Stream-GenericCloud-8-20220125.1.x86_64.tar.xz](https://data.lkiesow.io/proxmox/CentOS-Stream-GenericCloud-8-20220125.1.x86_64.tar.xz)
> - [CentOS-Stream-GenericCloud-9-20220217.0.x86_64.tar.xz](https://data.lkiesow.io/proxmox/CentOS-Stream-GenericCloud-9-20220217.0.x86_64.tar.xz)

Create a Template
-----------------

First, we use `qemu` to convert this file to a raw disk image:

```
❯ qemu-img convert -p -O raw CentOS-Stream-GenericCloud-9-20220217.0.x86_64.qcow2 CentOS-Stream-GenericCloud-9-20220217.0.x86_64.raw
```

Next, we need to find out where the actual partition in this file starts to be able to mount this.
We can use `fdisk` to find out about the sector size and the start sector:

```
❯ fdisk -l CentOS-Stream-GenericCloud-9-20220217.0.x86_64.raw
Disk CentOS-Stream-GenericCloud-9-20220217.0.x86_64.raw: 10 GiB, 10737418240 bytes, 20971520 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x310556db

Device                                              Boot Start      End  Sectors  Size Id Type
CentOS-Stream-GenericCloud-9-20220217.0.x86_64.raw1 *     2048 16386047 16384000  7.8G 83 Linux
```

Based on these two information, we can determine the byte offset of the partition: `512 × 2048 = 1048576`.
This should rarely change, and we don't usually need to recalculate this every time we update the image.
Nevertheless, it is good to know how to do this just in case.

With this information at hand, we can now mount the included file system:

```
❯ mkdir /mnt/stream9
❯ mount -o loop -o offset=1048576 CentOS-Stream-GenericCloud-9-20220217.0.x86_64.raw /mnt/stream9
```

To find out where to put the new LXC template, we need to locate the template directory.
This is typically `/var/lib/vz/template/cache/`.
Once we have that, we can now compress the CentOS Stream file system into a tarball in this directory.
We can exclude `/boot` since we do not need the CentOS Stream Kernel, Grub, etc. for our LXC container:

```
❯ cd /mnt/stream9
❯ tar cfJ /var/lib/vz/template/cache/CentOS-Stream-GenericCloud-9-20220217.0.x86_64.tar.xz --exclude=boot *
```

We could also use `cfz` to create `.tar.gz` archives instead.
They are quite a bit larger, but take way less time to generate.

The new LXC template is now ready to be used.
Of course, we can now unmount the raw image and remove the `.raw` and the `.qcow2` files to clean up.


Automate the Process
--------------------

Instead of doing all this manually every time we want to update an image, I created a small script to automatically prepare the latest image as LXC template:

```sh
#!/bin/sh

set -uex

BASEURL="https://cloud.centos.org/centos/9-stream/x86_64/images/"
IMAGE="$(curl -s "$BASEURL" | sed -n 's/^.*\(CentOS-Stream-GenericCloud-9-[^"]*.qcow2\)".*$/\1/p' | tail -n1)"
RAW="${IMAGE%.qcow2}.raw"
TARBALL="${IMAGE%.qcow2}.tar.gz"

# download and check image
TMPDIR="$(mktemp -d)"
cd "$TMPDIR"
curl -s -O "$BASEURL$IMAGE"
curl -s -O "$BASEURL$IMAGE.SHA256SUM"
sha256sum -c "$IMAGE.SHA256SUM"

# convert to raw image
qemu-img convert -p -O raw "$IMAGE" "$RAW"

# mount locally
MOUNTDIR="$(mktemp -d)"
mount -o loop -o offset=1048576 "$RAW" "$MOUNTDIR"
cd "$MOUNTDIR"

# create template archive
tar cfz "/var/lib/vz/template/cache/${TARBALL}" --exclude=boot *

# cleanup
cd /
umount "$MOUNTDIR"
rm -rf "$TMPDIR"
```

We could even have this run on a regular basis automatically by using a cronjob or a systemd timer.
That would allow us to always have the latest image available.

<time>
Sat Feb 19 03:09:55 PM CET 2022
</time>
