Enable Non-Subscription Updates
===============================

Not all my machines have an update subscription.
But even without subscription, you can turn on updates.

You should be aware, though, that the [Proxmox VE No-Subscription Repository](https://pve.proxmox.com/wiki/Package_Repositories#sysadmin_no_subscription_repo)
is marked as for testing and non-production use.
If you want to use it probably depends on how important your server is.
Do you rely on the server, and it is a big deal if there is a problem?
Then, you probably want to consider paying for a subscription.
Is it for testing only?
Then, you are probably fine with the non-subscription repository.

There is no clear explanation what exactly the difference is,
but most likely updates are pushed there before they are pushed too the subscription repository to catch potential errors.

Switch to Non-Subscription Repository
-------------------------------------

In `/etc/apt/sources.list` add:

```sh
# PVE pve-no-subscription repository provided by proxmox.com
# On PVE 7.x: deb http://download.proxmox.com/debian/pve bullseye pve-no-subscription
deb http://download.proxmox.com/debian/pve bookworm pve-no-subscription
```

Additionally, you want to comment out the enterprise repository in `/etc/apt/sources.list.d/pve-enterprise.list`.
This will prevent `apt` from complaining if you do not have a subscription:

```sh
# deb https://enterprise.proxmox.com/debian/pve bullseye pve-enterprise
```


Update
------

Once enabled, use `apt` to run your first update:

```term
❯ apt update
❯ apt list --upgradable
❯ apt dist-upgrade
```

---

[◂   Back to: Part 1 – Basic Set-up of Proxmox](part-1-basic-setup.md)
