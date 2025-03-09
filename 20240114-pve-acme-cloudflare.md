# Configure ACME via Cloudflare DNS in Proxmox

First, create a new API token with limited access in Cloudflare.
For that, log in and go to “My Profile” → “API Tokens”.

The access rights for the Token should look similar to this:

```
└── <account name>
      └── <domain> - Zone:Read, DNS:Edit
```

Next, on the Proxmox user interface, go to
“Datacenter” → “ACME” → “Accounts” → “Add”,
fill out the form and register.

Next, go to “Challenge Plugins” → “Add”
Fill in the “Plugin ID” (name) and at DNS API choose “Cloudflare Managed DNS”.
`CF_Token` and `CF_Zone_ID` are the “API Token” and “Zone ID” for Cloudflare DNS.

After the plugin is set up, head to “Server” → “Certificate”.
Change “Using Account” from “None” to the previously created account.

Go to “ACME” → “Add”, select “DNS” as challenge type and select the newly created plugin.
Enter the hostname of your server and hit create.

Finally, click “Order Certificate Now” to get a new certificate right now.

<time>
Sun Jan 14 12:19:57 AM CET 2024
</time>
