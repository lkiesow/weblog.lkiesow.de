# Proxmox TLS Certificates via EAB (HARICA)

You can use ACME external account binding (EAB) to easily obtain certificates
for services in internal networks if you have a provider that supports this
mechanism. For most European Universities such a provider is HARICA.

One service typically not exposed on the internet is Proxmox. Which acrually
supports EAB. Although it's unfortunately somewhat hidden and only available
via CLI, not via the web GUI.

Here is what you need to do once you got your EAB data which should look like this:

- Server-URL: <https://acme-v02.harica.gr/acme/…/directory>
- Key ID: *key_id*
- HMAC Key: *hmac_key*

First, register your ACME account on Proxmox. Note that the `pvenode acme account
register` command currently appears to have a bug in Proxmox. Use `pvesh` instead:

```sh
❯ pvesh create /cluster/acme/account \
    --contact admin@example.com \
    --directory https://acme-v02.harica.gr/acme/<...>/directory \
    --eab-kid <key id> \
    --eab-hmac-key <key> \
    --name harica \
    --tos_url https://repo.harica.gr/documents/SA-ToU.pdf
```

<div style="opacity: 0.45;">

Alternatively, if the bug is resolved, you can use the interactive method:

```sh
❯ pvenode acme account register harica admin@example.com
Directory endpoints:
0) Let's Encrypt V2 (https://acme-v02.api.letsencrypt.org/directory)
1) Let's Encrypt V2 Staging (https://acme-staging-v02.api.letsencrypt.org/directory)
2) Custom
Enter selection: 2
Enter custom URL: https://acme-v02.harica.gr/acme/…/directory

Attempting to fetch Terms of Service from 'https://acme-v02.harica.gr/acme/…/directory'.
Terms of Service: https://repo.harica.gr/documents/SA-ToU.pdf
Do you agree to the above terms? [y|N]: y
The CA requires external account binding.
You should have received a key id and a key from your CA.
Enter EAB key id: <key_id>
Enter EAB key: <hmac_key>

Attempting to register account with 'https://acme-v02.harica.gr/acme/…/directory'..
Generating ACME account key..
Registering ACME account..
Registration successful, account URL: 'https://acme-v02.harica.gr/acme/…''
Task OK
```

</div>

Now that we have an account, we can use it to add domains for this node:

```sh
❯ pvenode config set --acme account=harica,domains="pve.example.com" 
```

If you need a certificate for multiple domans, you can separate the domains by semicolon:
`domains="pve.example.com;pve.ex.com"`.

Finally, we can now order the first certificate:

```sh
❯ pvenode acme cert order
Loading ACME account details
Placing ACME order
Order URL: https://acme-v02.harica.gr/acme/…

Getting authorization details from 'https://acme-v02.harica.gr/acme/…'
pve.ex.com is already validated!

Getting authorization details from 'https://acme-v02.harica.gr/acme/…'
pve.example.com is already validated!

All domains validated!

Creating CSR
Checking order status
Order is ready, finalizing order
still processing, trying again in 30 seconds
valid!

Downloading certificate
Setting pveproxy certificate and key
Restarting pveproxy
Task OK
```

That's it. You are all done.

<time>
Tue Mar 17 02:25:14 PM CET 2026
</time>
