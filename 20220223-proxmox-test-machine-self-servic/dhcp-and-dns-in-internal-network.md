DHCP and DNS in Internal Network
================================

> This guide assumes [an internal network has already been set up](internal-network.md) on the Proxmox server.


While using static IPs on the internal network works, it can be pretty annoying.
Automatically auto-updating addresses using DHCP is therefore a nice addition.
We also want machines being able to talk to each other using their hostnames.

To get both, we can use `dnsmasq` to host a DHCP and DNS server either on the Proxmox server itself,
or on a machine or container running in Proxmox:

- The advantage of running the service in a machine or container is that this separates your service from Proxmox,
  having it on a separate operating system without access to all networks.

  This means that a misconfiguration should not effect your Proxmox server or even your outside network
  (e.g. accidentally launching a DHCP server on your external network, interfering with existing ones).

- The advantage of running it on the Proxmox server itself is that no one can accidentally shut down
  or even delete your infrastructure container.
  This means having a cleaner separation between infrastructure run on the host and machine clients.

I'm going to explain both by going through the setup using a Debian container in detail
and then looking at how this would differ if `dnsmasq` would be set up on the Proxmox server itself.


Using a VM/Container
--------------------

Create a Debian container with 128 MB of RAM and assign it a static IPv4 address on the internal network.
Make sure the IPv4 address is unique and does not clash with already assigned addresses.
I have `10.0.0.1` assigned to Proxmox and will use `10.0.0.2` for `dnsmasq`:

- Bridge: `vmbr1` (your internal network)
- IPv4: Static
- IPv4/CIDR: `10.0.0.2/16`
- Gateway (IPv4): `10.0.0.1`

Make sure to update the container as usual:

```
❯ apt update
❯ apt upgrade
```

The Proxmox Debian container template comes with `systemd-resolved` enabled.
This will conflict with `dnsmasq` and we don't actually need it.
We disable it running:

```
❯ systemctl stop systemd-resolved.service
❯ systemctl disable systemd-resolved.service
```

Now we are all ready to install `dnsmasq`:

```
❯ apt install dnsmasq
```

As usual, Debian will automatically start the service after an installation, and it should be running already.
But the service is configured as a DNS server only by default, and we need to add additional configuration.
For that, create a file `/etc/dnsmasq.d/internal` with configuration like this:

```properties
# Tells dnsmasq to never forward A or AAAA queries for plain names,
# without dots or domain parts, to upstream nameservers.
# If the name is not known from /etc/hosts or DHCP then a "not found" answer is
# returned.
domain-needed

# All reverse lookups for private IP ranges (ie 192.168.x.x, etc) which are not
# found in /etc/hosts or the DHCP leases file are answered with "no such domain"
# rather than being forwarded upstream.
bogus-priv

# Don't read /etc/resolv.conf. Get upstream servers only from the command line
# or the dnsmasq configuration file.
no-resolv

# Later  versions of windows make periodic DNS requests which don't get sensible
# answers from the public DNS and can cause problems by triggering dial-on-
# demand links. This flag turns on an option to filter such requests. The
# requests blocked are for records of types SOA and SRV, and type  ANY  where
# the requested name has underscores, to catch LDAP requests.
filterwin2k

# Add the domain to simple names (without a period) in /etc/hosts in the same
# way as for DHCP-derived names. Note that this does not apply to domain names
# in cnames, PTR records, TXT records etc.
expand-hosts

# Specifies DNS domains for the DHCP server. This  has  two  effects;
# firstly it causes the DHCP server to return the domain to any hosts which
# request it, and secondly it sets the domain which is legal for DHCP-configured
# hosts to claim.  In addition, when a suffix is set then hostnames without a
# domain part have the suffix added as an optional domain part.
# Example: In Proxmox, you create a Debian container with the hostname `test`.
# This host would be available as `test.pve-internal.home.lkiesow.io`.
domain=pve-internal.home.lkiesow.io

# This configures local-only domains.
# Queries in these domains are answered from /etc/hosts or DHCP only.
# Queries for these domains are never forwarded to upstream names servers.
local=/pve-internal.home.lkiesow.io/

# Listen on the given IP address(es) only to limit to what interfaces dnsmasq
# should respond to.
# This should be the IP address of your dnsmasq in your internal network.
listen-address=127.0.0.1
listen-address=10.0.0.2

# Upstream DNS servers
# We told dnsmasq to ignore the resolv.conf and thus need to explicitely specify
# the upstream name servers. Use Cloudflare's and Google's DNS server or specify
# a custom one.
server=1.1.1.1
server=8.8.8.8

# DHCP range
# Enable the DHCP server. Addresses will be given out from this range.
# The following reserves 10.0.0.1 to 10.0.0.255 for static addresses not handled
# by DHCP like the address for our Proxmox or dnsmasq server.
dhcp-range=10.0.1.0,10.0.255.255

# Set the advertised default route to the IP address of our Proxmox server.
dhcp-option=option:router,10.0.0.1
```

Finally, restart and enable `dnsmasq` and check that it is up and running:

```
❯ systemctl restart dnsmasq.service
❯ systemctl enable dnsmasq.service
❯ systemctl status dnsmasq.service
```

Set-up on Proxmox Server
------------------------

Since Proxmox is based on Debian, the set-up on the server itself is very much the same.
The differences are very minor:

- Proxmox does not use `systemd-resolved`.
  Therefore, it does not clash with `dnsmasq` and you can skip the steps to disable it.

- The server should have more network interfaces.
  Make sure the `listen-address` options are set correctly to listen on the internal network but not the external one.
  Otherwise, Proxmox would start responding to DHCP requests for the external network.
  Having multiple DHCP servers active and responding one one network is generally troublesome.
  You probably want to set:

  ```
  listen-address=10.0.0.1
  ```


Test the Set-up
---------------

Create two Debian containers `a` and `b`, put them on the internal network by
selecting `vmbr1` as network bridge and set the IPv4 network configuration to
DHCP.

After starting up both containers, log into `a` and check if you can ping an
external host (e.g. `gooogle.de`) and the container `b`:

```
❯ ping -c1 google.de
PING google.de (142.250.186.67) 56(84) bytes of data.
64 bytes from fra24s05-in-f3.1e100.net (142.250.186.67): icmp_seq=1 ttl=110 time=28.5 ms
```

```
❯ ping -c1 b
PING b.pve-internal.home.lkiesow.io (10.0.160.225) 56(84) bytes of data.
64 bytes from b.pve-internal.home.lkiesow.io (10.0.160.225): icmp_seq=1 ttl=64 time=0.092 ms
```

You should see both domain names being resolved and see a successful ping.


Auto-Start Infrastructure Containers
------------------------------------

Since you need your DHCP and DNS server to be running before you can start up any other machines on the internal network, it usually makes sense to have Proxmox start this container automatically.

In the Proxmox web interface, head to the “Datacenter” → “Node” → “Machine” → “Options”, where you can enable the “Start at boot” setting.


Troubleshooting: Machine not reachable via domain
-------------------------------------------------

If you repeat the test from above but instead spin up a container using
Proxmox's default CentOS 8 container and then try to ping it, you will get a
result like:

```
❯ ping -c1 c
ping: c: No address associated with hostname
```

The reason for this is that `c` does not advertise its hostname via DHCP and
`dnsmasq` thus cannot assign a domain name.

Use `hostnamectl` on host `c` to change this:

```
❯ hostnamectl set-hostname c
```

After rebooting `c`, the hostname should now be advertised.

---

[◂   Back to: Part 2 – Proxmox & Internal Network Magic](part-2-internal-network-magic.md)
