Part 1 – Basic Set-up of Proxmox
================================

Now that we [have a plan for integrating Proxmox](part-0-the-idea.md) in our environment, let's get started and actually get Proxmox installed and configured. To make the process easier to follow, I'm describing the idea of what I want to change and why here, but link to separate articles for and explanation of the actual change. This part also serves as a basic set-up guide for steps to take on most Proxmox set-ups.

But first, [Download the Proxmox Virtual Environment ISO image](https://www.proxmox.com/en/downloads) and use the installation wizard to get the base system up and running. This is a very straightforward process with no real difference to the installation of any other Linux distribution.

Once finished, we should have a Proxmox server we can boot and login to.

Enable DHCP for Proxmox
-----------------------

The first item on my list of changes is to enable DHCP for the server. This may seem strange, and you should usually make sure that the Proxmox server has a static IP address. But I can ensure that through our IP address management system and getting things set-up with DHCP in place is so much easier:

- [Guide: Enable DHCP for the Proxmox server](proxmox-server-dhcp.md)

With this in place, I can access the server via SSH and if I ever need to switch networks, simply rebooting will at least ensure that I can get access again.

Non-Subscription Update
-----------------------

Next up, we should make sure to either enter our subscription keys or enable the non-subscription (community) update repositories instead. This will allow us to update Proxmox and also remove the error we get when updating the system:

- [Guide: Enable Non-Subscription Updates](update-repositories.md)

With this done, we can now easily keep our server up-to-date with a simple `apt upgrade` or with a single click from the Proxmox web interface.

Default HTTP(S) Ports
---------------------

Finally, we want to make the web interface available on the default HTTP and HTTPS ports with HTTP immediately redirecting to HTTPS. While this is not strictly necessary, it avoids confusion if many people use this since they have to remember to use a custom port. Using the defaults instead is just easier:

- [Guide: Use Nginx to serve web interface on default HTTP(S) ports](web-interface-on-default-ports-via-nginx.md)

That's it for the default set-up. With just this done, I can already hand out  logins and users can start creating new machines and containers. Even in the University network. …at least if they picked a registered MAC/IP from the list.

Bonus: Remove Subscription Notice
---------------------------------

I have a few sandbox systems for people to play around and wanted them to look and feel like the real systems even though I don't have a subscription for these. The notice after people logged into the system was confusing and I simply removed it on those systems:

- [Guide: Remove Subscription Notice](remove-subscription-notice.md)

If you use Proxmox for Production, please consider a subscription instead to support the project!

---

 [Up Next: Part 2 – Proxmox & Internal Network Magic   ▸](part-2-internal-network-magic.md)
