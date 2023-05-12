# Redirect Let's Encrypt Requests to Another Server

[Let's Encrypt](https://letsencrypt.org/) and [Certbot](https://certbot.eff.org) are great tools to easily obtain valid TLS certificates.
We use it extensively and have it included in many of our integrations.

But recently, I had to migrate an old server and wanted to keep the downtime as short as possible while being able to prepare the new server.
This included getting new certificates and testing the automation.

The problem: Let's encrypt would still contect the original server for verification.


## Manual Fix

The easiest way to solve this problem is to just copy over the certificate from the old server.
Then, you can set-up certbot later.

Another solution would be to not use `http` verification but e.g. `dns` verification for Let's Encrypt.

Both would work but I wanted to make sure everything worked before and not tinker with the Ansible deployment scripts.
That is why I thought, why not just reverse proxy the new server, redirecting only the certbot requests.


## Reverse Proxy Certbot Requests

This method requires a reverse proxy like [NGINX](https://nginx.com) on the system.
But if you have that, it's really easy to redirect certificate verification requests toi the new server.

In the NGINX configuration (e.g. `/etc/nginx/nginx.conf`), add something like this in the `server` blocks:

```python
location /.well-known/ {
   proxy_pass    $scheme://131.131.22.66;
}
```

…with `131.131.22.66` being the IP address of your new server.

Certbot requests should now reach your new server.
Obviously, the old server will not get any certbot requests any longer.
But given that you want to migrate, that should hopefully be fine.

<time>
Fri May 12 12:36:20 PM CEST 2023
</time>
