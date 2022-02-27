Proxmox Part 0 – The Story of VMs for Developers
================================================

While we have a professionally managed virtual machine hosting at [Osnabrück University](https://uni-osnabrueck.de) where we can request machines which are run on a cluster, have backups and have people caring about these services, the process of requesting resources always takes time and not everyone is allowed to do this (it makes sense to not let the 1000+ employees ask for whatever they want with no checks in place).

This unfortunately means that getting a VM can take a few days after filling out the request form and sending it on its way.

This is annoying for quickly testing things like Ansible scripts in an agile development environment. I wanted a nice and simple solution for our developers to get testing resources quickly. With no need for other people to sign off on any requests. That's why I introduced [Proxmox Virtual Environment](https://proxmox.com).


Hardware and Environment
------------------------

Before we begin the story of how I set this up, we need to talk a bit about the environment, specifically the network environment I set this up in since this is quite a bit different from the simple setup I have in my own home network for example.

I'm running Proxmox on old servers our data center had lying around. It's running in and managed by our data center. Additionally, I've quickly turned another machine into a staging environment where we can test new settings without accidentally interrupting anyone's work.

The servers are running in a managed network where every device needs to be registered in a central IP Address Management (IPAM) solution. This means I cannot just bridge any machine to my external network and have it be configured automatically via DHCP/SLAAC like I have in my homelab.

Instead, application forms and paperwork need to be involved to register the machines, and I was in the same situation I was before: A cozy place with unnecessary paperwork!

The Perfect Plan Crushed
------------------------

To make it quite clear from the beginning: Our network administrators said no to this idea and I had to abandon it. But maybe in the future if the service is well established they change their mind. Who knows.

Our data center has a `/16` IP address block and I asked if they would part with a `/24` sub-block for me to route to my server, which I could then handle myself and use it to automatically assign addresses. Unfortunately, the answer was no.

A possibility would have been a `/64` IPv6 network, which our data center was willing to part with because no one uses IPv6 anyway. Unfortunately, this turned out to be true. A quick test among our developers revealed that several couldn't handle IPv6.

So, I'm stuck with paperwork… or am I?


Pragmatic Solutions for Instant Gratification
---------------------------------------------

To get started, I came up with something I named the _“The Excel Sheet Approach”_. But rest assured, no developers were harmed! …no Excel was actually involved.

While our data center does not lightly part with network segments, I am allowed to register new machines in our IPAM. With our `/16` network and enough free space in the server's network segment, no one complains if you pre-registers a few addresses. So, I randomly generated (_\*cough\*_) a number of MAC addresses and did throw a list like this into our GitLab where developers can now pick a MAC address for them to use:

```yaml
- Host: pvm001.example.com
  IPv4: 131.173.12.22
  IPv6: 2001:638:508:160::83ad:1705
  MAC:  DE:AD:BE:EF:00:00
  User: Lars
  Date: 2022-02-19
```

They only have to provide this MAC in the Proxmox interface when creating a new virtual machine or LXC container. That's it. They are ready to go.

Is this ugly? Absolutely! Does it work? Spectacularly!

Internal Network as Alternative
-------------------------------

Thinking about alternatives, I realized that in most cases, we just need two protocols to be accessible from the outside: HTTP(S) for providing basically any service today and SSH for developers to access the machines.

Based on this assumption, what we can do is to create an internal network and use network address translation (NAT) to give the machines internet access. This would work similar to a home router.

We can then configure an HTTP(S) reverse proxy to let people access internal servers via HTTP and set up a simple SSH jump host accessible from the outside to be able to connect to internal machines:

```
             +---------Intranet-------+
             |                        |
         +<------------------+        |
Internet |   |               |        |
         +-->HTTP --------> VM01      |
             SSH                      |
             +------------------------+
```

Which idea works better in the end is still to be seen, and I will make sure to get some feedback once this has been in use for a few months.
My current guess is that despite the loss of network transparency, developers will prefer the simpler set-up (for them) of using the internal network.
We'll see.

That's it with the ideas. Let's set the whole thing up.

---

 [Up Next: Part 1 – Basic Set-up of Proxmox   ▸](part-1-basic-setup.md)
