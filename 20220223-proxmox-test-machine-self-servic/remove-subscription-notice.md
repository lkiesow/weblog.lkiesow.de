Remove Subscription Notice
==========================

Proxmox is free software and can be used without acquiring a license.
But there are commercial subscriptions for enterprise repositories available.
These provide not only access to the repository, but also additional support.

If you use Proxmox for production, please consider [getting a subscription](https://www.proxmox.com/en/proxmox-ve/pricing).
Not only will you get support if necessary, but you also help to sustain the project.

If you use Proxmox without subscription, you will get a notice whenever you log in.
Usually, you can just ignore this.
Nevertheless, this might be annoying in a few cases.
[John McLaren published a way to simply remove the notification](https://johnscs.com/remove-proxmox51-subscription-notice/) without subscription.

In short, just run:

```
❯ sed -Ezi.bak "s/(Ext.Msg.show\(\{\s+title: gettext\('No valid sub)/void\(\{ \/\/\1/g" /usr/share/javascript/proxmox-widget-toolkit/proxmoxlib.js
```

Of course, this is not officially supported and may stop working at any time.

---

[◂   Back to: Part 1 – Basic Set-up of Proxmox](part-1-basic-setup.md)
