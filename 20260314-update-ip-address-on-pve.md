Update IP Address of Proxmox Server
===================================

Updating the IP address of a Proxmox server requires more then just updating
the network configuration.

1. Update the network configuration in `/etc/network/interfaces` by configuring
   the new the address, netmask, and gateway for the bridge (typically `vmbr0`).

2. Update the host file `/etc/hosts` which Proxmox uses for internal node
   resolution if run as a cluster.

3. Update the DNS configuration in `/etc/resolv.conf` if you moved to a
   different network and the nameserver has changed.

4. Update the cluster consideration in `/etc/pve/corosync.conf` if the node is
   part of a corosync cluster. This file is read-only unless you increment the
   `config_version`. So, update the `ringX_addr` for the specific node and
   increment `config_version`.

5. Reboot the node.

**Note:** If you use Ceph, you will also need to update `/etc/pve/ceph.conf`.

<time>
Sat Mar 14 10:50:49 PM CET 2026
</time>
