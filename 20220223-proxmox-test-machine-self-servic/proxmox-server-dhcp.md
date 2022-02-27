Set Network to use DHCP
=======================

> __⚠ Warning:__ Remember that you are modifying your network configuration.
> Make sure to have a backup plan in case you lock yourself out.

Having changing IP addresses can cause problems for Proxmox.
That is why the default behavior is to configure static addresses.
Please evaluate your environment before following this guide.

Why I went with DHCP
--------------------

I wanted to bring some Proxmox servers to an enterprise environment.
This means that if I want to get a device deployed, I have to:

- Talk to one of our network managers
- Get my device (MAC address) added to our IP address management (IPAM) solution
- Get an IP address based on the network segment I want to be in
- Configure the address or enable DHCP

This means that even with DHCP, I have a static IP address guaranteed unless I specifically request a change.

Still, my first deployment used static IP addresses.
That worked great until I requested the server to be moved from the data center internal network to the external network so that our developers can access the machine from home.
That is when I get a net IP in a different network segment assigned.
That is also, when my server had an invalid network configuration, and I was unable to access it.

Not great when you work from home and access to your data center is restricted to internal personal only.
Luckily, I still had access through the server's (horrible) remote management console and was able to resolve the issue.
Nevertheless, that drove me to using static IPs assigned via DHCP.

By now, I almost always use DHCP for Proxmox, using my network infrastructure to assign static IP addresses.
I do that even at home, where accessing a device directly is relatively easy.


Network Configuration
---------------------

To enable DHCP, on your server, edit `/etc/network/interfaces`.
You should see a configuration like this (interface names may varry):

```
iface vmbr0 inet static
        address 192.168.1.157/24
        gateway 192.168.1.1
        bridge-ports enp5s0
        bridge-stp off
        bridge-fd 0
```

Modify this block and turn it into a DHCP configuration:

```
iface vmbr0 inet dhcp
        bridge-ports enp5s0
        bridge-stp off
        bridge-fd 0
```


Configure Hostname
------------------

You should also make sure your hostname is properly configured.
You can set the hostname using the tool `hostnamectl`:

```term
❯ hostnamectl set-hostname proxmox.home.lkiesow.io
```

To verify it is set correctly, use:

```term
❯ hostname
proxmox.home.lkiesow.io
```

Finally, make sure, the hostname is entered correctly in `/etc/hosts`.
The file should look somewhat like this:

```
127.0.0.1      localhost.localdomain localhost
192.168.1.157  proxmox.home.lkiesow.io proxmox
```


Dynamic Host Configuration
--------------------------

On a Proxmox server, when updating the IP address, `/etc/hosts` must be updated as well.
That is why just enabling DHCP can cause problems.

If you can use your infrastructure to ensure IPs do not change, that's great.
If not, you can use dhcpclient hooks to automatically update this file.
To do that, create a new file `/etc/dhcp/dhclient-exit-hooks.d/update-etc-hosts` with content like this:

```sh
if ([ $reason = "BOUND" ] || [ $reason = "RENEW" ])
then
  sed -i "s/^.*\sproxmox.home.lkiesow.io\s.*$/${new_ip_address} proxmox.home.lkiesow.io proxmox/" /etc/hosts
fi
```

I don't usually use this, but it may be helpful in some cases.

---

[◂   Back to: Part 1 – Basic Set-up of Proxmox](part-1-basic-setup.md)
