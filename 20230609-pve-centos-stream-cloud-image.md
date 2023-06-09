# Import CentOS Stream Cloud Image in Proxmox

> Based on [Perfect Proxmox Template with Cloud Image and Cloud Init](https://docs.technotim.live/posts/cloud-init-cloud-image/) by [Techno Tim](https://twitter.com/TechnoTimLive).

The CentOS Stream project provides ready-to-use cloud images which can be easily imported in Proxmox.
They support `cloud-init` so that you can easily set user, password, … afterward
without you having to click through a lengthy installation process.

You can find a list of all CentOS Stream 9 images at:
- https://cloud.centos.org/centos/9-stream/x86_64/images/

## Get Latest Image

While you can select the image you want manually from the site linked above,
you can also log into you proxmox server and just download the latest version by running:

```sh
LATEST_IMAGE=$(curl -s https://cloud.centos.org/centos/9-stream/x86_64/images/ | sed -n 's/^.*\(CentOS-Stream-GenericCloud-9-[0-9.]*x86_64.qcow2\).*$/\1/p' | sort | tail -n1)
wget "https://cloud.centos.org/centos/9-stream/x86_64/images/${LATEST_IMAGE}"
```

## Create VM Template

After downloading the image, you can create the template.
Make sure to select a unique ID for your template.
I usually select an ID from a completely different range than my default IDs.

You also need to select the storage on which to create the templates.
The storage needs to be able to hold VM disks.

Here we use the ID `8000` and the storage `local-lvm`:

```sh
VMID=8000
VMSTORAGE=local-lvm
qm create "${VMID}" --memory 2048 --core 2 --cpu host --name centos-stream-9-cloud --net0 virtio,bridge=vmbr0
qm importdisk "${VMID}" CentOS-Stream-GenericCloud-9-*.x86_64.qcow2 "${VMSTORAGE}"
qm set "${VMID}" --scsihw virtio-scsi-pci --scsi0 "${VMSTORAGE}:vm-${VMID}-disk-0"
qm set "${VMID}" --ide2 "${VMSTORAGE}:cloudinit"
qm set "${VMID}" --boot c --bootdisk scsi0
qm set "${VMID}" --serial0 socket --vga serial0
qm template "${VMID}"
rm CentOS-Stream-GenericCloud-9-*.x86_64.qcow2
```

The `qm create` command defines the default options for the template.
You may want to adjust this to select a different default network interface, memory size, etc.


## Automate Update

Using these instructions, you can easily create a script to update the image automatically.
But as this will delete the existing image:

- Make sure you do not have an existing VM with the selected ID
- Do not use linked clones since they will require the original template, and you cannot update the template.

The script:

```sh
#!/bin/sh

set -eux

VMID=8000
VMSTORAGE=local-zfs

# Destroy old image
if qm list | grep "${VMID}"; then
  qm destroy "${VMID}"
fi

LATEST_IMAGE=$(curl -s https://cloud.centos.org/centos/9-stream/x86_64/images/ | sed -n 's/^.*\(CentOS-Stream-GenericCloud-9-[0-9.]*x86_64.qcow2\).*$/\1/p' | sort | tail -n1)
wget "https://cloud.centos.org/centos/9-stream/x86_64/images/${LATEST_IMAGE}"

qm create "${VMID}" --memory 2048 --core 2 --cpu host --name centos-stream-9-cloud --net0 virtio,bridge=vmbr0
qm importdisk "${VMID}" CentOS-Stream-GenericCloud-9-*.x86_64.qcow2 "${VMSTORAGE}"
qm set "${VMID}" --scsihw virtio-scsi-pci --scsi0 "${VMSTORAGE}:vm-${VMID}-disk-0"
qm set "${VMID}" --ide2 "${VMSTORAGE}:cloudinit"
qm set "${VMID}" --boot c --bootdisk scsi0
qm set "${VMID}" --serial0 socket --vga serial0
qm template "${VMID}"
rm CentOS-Stream-GenericCloud-9-*.x86_64.qcow2
```

<date>
Fri Jun  9 04:48:37 PM CEST 2023
</date>
