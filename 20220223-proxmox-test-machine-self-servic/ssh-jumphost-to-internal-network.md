SSH Jumphost for the Internal Network
=====================================

> - This guide assumes [an internal network has already been set up](internal-network.md) on the Proxmox server.
> - This guide assumes [a DNS and DHCP server for the internal network has been set up](dhcp-and-dns-in-internal-network.md).

Having an internal network is nice, but it also makes it harder for legitimate users to log into and thus use machines. Having a public SSH jump-host is a mechanism to give users access by having SSH automatically tunnel connections through this machine.

Imagine it like you would first log into that machine to then execute a second SSH command on that machine, which then causes you to end up on the internal machine. Just without doing all of this manually. As a user, you can just log into internal machines and SSH magically takes care of the additional hop.

Similar to the [set-up of `dnsmasq`](dhcp-and-dns-in-internal-network.md), you can use the Proxmox server itself as jump-host or set up a dedicated client machine or container to be used for this task.

- The advantage of a dedicated client machine or container is that you do not hand out any logins to your Proxmox server. While you would usually secure the “jump” users, this gives you additional separation and will protect you even if you misconfigure something.

- The advantage of using the Proxmox server itself is that you have all your infrastructure defined at one place and have a separation between infrastructure and clients. That way, no one can e.g. accidentally shut down or drop your infrastructure machines on a test server.

This guide describes both ways, but you can skip lots of steps if you decide to use the Proxmox server itself. In that case, jump straight to [DNS Resolution](#dns-resolution).


Using a Virtual Machine or Container
------------------------------------

Create a Debian container with 64 MB of RAM and assign it a static IPv4 address on the internal network.
Make sure the IPv4 address is unique and does not clash with already assigned addresses.
I have `10.0.0.1` assigned to Proxmox and will use `10.0.0.3` for the SSH jump-host.
Also make sure to set up your internal DNS server for this machine to be able to resolve internal domain names.

- Bridge: `vmbr1` (your internal network)
- IPv4: Static
- IPv4/CIDR: `10.0.0.3/16`
- Gateway (IPv4): `10.0.0.1`
- DNS domain: pve-internal.home.lkiesow.io
- DNS server: `10.0.0.2`

Make sure to update the container as usual:

```term
❯ apt update
❯ apt upgrade
```

### Setting up the SSH Server

Now that we have the environment, we can set up the OpenSSH server.
On your Proxmox server, you already have this. Even on a container, the `openssh-server` might even already be installed in your container.
Still, to be sure, run:

```term
❯ apt install openssh-server
```

Then, start and enable `sshd`:`

```term
❯ systemctl start sshd.service
❯ systemctl enable sshd.service
```

### Root Login

The first thing to decide after setting up `sshd` is if you want to allow logging in via the `root` user.
This account is often attacked first and therefore, many people choose to disallow logins via this account or allow `rrot` to only login via SSH keys.

You can configure this by editing `/etc/ssh/sshd_config` and setting either of these options:

```
PermitRootLogin yes
PermitRootLogin no
PermitRootLogin without-password
```

After changing the option, restart `sshd`:

```term
❯ systemctl restart sshd.service
```

If you decide not to allow logins via `root`, you can still login via Proxmox and create new users from there.
However, this might become somewhat cumbersome if you need to modify users regularly.
In that case, you could add a new management user and allow it `sudo` privileges. The steps are similar to the user creation down below, only that you would assign a regular shell and add the user to the `sudo` group or add sudo privileges via `/etc/sudoers` like this:

```
sshadmin  ALL=(ALL) NOPASSWD: ALL
```

Then prepare adding an SSH key by adding an `authorized_keys` file with the correct permissions for this user.


### Testing SSH

With your current set-up, you should now be able to SSH into this machine from your Proxmox server
or any other machines on the internal network:

```term
❯ ssh 10.0.0.3
root@10.0.0.3's password:
Linux ssh-jump 5.13.19-4-pve #1 SMP PVE 5.13.19-8 (Mon, 31 Jan 2022 10:09:37 +0100) x86_64
...
Last login: Sun Feb 13 20:37:34 2022 from 10.0.0.1
```


Forwarding SSH Port
-------------------

While we can SSH into the server, we could also SSH into any other server on the internal network in the same way.
So, it's time to expose the jump-host to the outside.

For that, we forward port `2222` on Proxmox to the new jump-host port `22` (SSH).
To do that, on the Proxmox server, run:

```term
❯ iptables -t nat -A PREROUTING -p tcp -i vmbr0 --dport 2222 -j DNAT --to-destination 10.0.0.3:22
```

Make sure that your external network interface (`vmbr0`) and your destination address (`10.0.0.3`) are correct.

You should now be able to log into your jump host from outside, by connecting to your Proxmox server on port 2222:

```term
❯ ssh -p 2222 root@proxmox.home.lkiesow.io
root@proxmox.home.lkiesow.io's password:
...
Last login: Sun Feb 13 21:04:12 2022 from 10.0.0.1
```


Make Forwarding Persistent
--------------------------

Similar to the NAT configuration, we can put the `iptables` command into `/etc/network/interfaces` to automatically configure the forwarding whenever the networks comes up:

```
iface vmbr1 inet static
   address 10.0.0.1/16
   …
   post-up   iptables -t nat -A PREROUTING -p tcp -i vmbr0 --dport 2222 -j DNAT --to-destination 10.0.0.3:22
   post-down iptables -t nat -D PREROUTING -p tcp -i vmbr0 --dport 2222 -j DNAT --to-destination 10.0.0.3:22
```

DNS Resolution
--------------

For SSH to forward the connections to the internal hosts, it must be able to resolve the internal domain names. This is true only for the jump host. Users do not need to be able to so that on their local machines.

For example, on the jump host, I should be able to resolve `a.pve-internal.home.lkiesow.io`, which is a machine in my internal network, and ping this machine:

```term
❯ ping -c1 a.pve-internal.home.lkiesow.io
PING a.pve-internal.home.lkiesow.io (10.0.243.108) 56(84) bytes of data.
64 bytes from a.pve-internal.home.lkiesow.io (10.0.243.108): icmp_seq=1 ttl=64 time=0.065 ms
```

If this does not work, make sure to add your local DNS server.
The DNS settings when creating the container should have already taken care of this:

```term
❯ cat /etc/resolv.conf 
# --- BEGIN PVE ---
search pve-internal.home.lkiesow.io
nameserver 10.0.0.1
# --- END PVE ---
```


Adding “Jump” Users
-------------------

Adding a user only allowed to use the server to jump to other servers in the internal network,
but not to actually log into the server itself, is quite simple.
When creating a user, you just assign `/bin/false` as login shell:

```term
❯ useradd -m -s /bin/false lars
```

Next, prepare the `authorized_keys` file:

```term
❯ mkdir -m 700 /home/lars/.ssh
❯ touch /home/lars/.ssh/authorized_keys
❯ chmod 600 /home/lars/.ssh/authorized_keys
❯ chown -R lars:lars /home/lars/.ssh/
```

And finally, you would add the user's SSH key to `/home/lars/.ssh/authorized_keys`.


Using the Proxy
---------------

You should now be able to use the jump-host to connect to machines in the internal network. However, if you try connecting to the jump-host itself, you will automatically be rejected:

```term
❯ ssh -p 2222 lars@proxmox.home.lkiesow.io
Linux ssh-jump 5.13.19-4-pve #1 SMP PVE 5.13.19-8 (Mon, 31 Jan 2022 10:09:37 +0100) x86_64
...
Connection to proxmox.home.lkiesow.io closed.
```

To tell SSH to jump over it, users have to edit their local SSH configuration in `~/.ssh/config` and set something like:

```
# Configuration for proxmox client machines in internal network
# All connections need use the jump host
Host *.pve-internal.home.lkiesow.io
   User root
   ProxyJump pve-internal.proxmox.home.lkiesow.io

# Configuratiion for jump host
Host pve-internal.proxmox.home.lkiesow.io
   HostName proxmox.home.lkiesow.io
   Port 2222
   User lars
   IdentityFile ~/.ssh/home-lkiesow.de
```

The `ProxyJump` option instructs SSH to connect to the jump host before attempting to connect to the internal machines.
The `Host` in this configuration is different from the actual `HostName` so that you can still have a configuration for Proxmox itself and SSH will not try using e.g. port `2222` when you try to connect there.

Now you can SSH into any internal machine as if they were on a public network:

```term
❯ ssh a.pve-internal.home.lkiesow.io
root@a.pve-internal.home.lkiesow.io's password:
...
Last login: Sun Feb 13 22:42:08 2022 from 10.0.0.3
root@a:~#
```

---

[◂   Back to: Part 2 – Proxmox & Internal Network Magic](part-2-internal-network-magic.md)
