HTTP(S) Reverse Proxy for Internal Machines
===========================================

> - This guide assumes [an internal network has already been set up](internal-network.html) on the Proxmox server.
> - This guide assumes [a DNS and DHCP server for the internal network has been set up](dhcp-and-dns-in-internal-network.html).
> - This guide assumes you already [have Nginx running to serve the Proxmox web interface](web-interface-on-default-ports-via-nginx.html) on the server.

Being able to quickly deploy machines in an internal network is great, but most of the time, you do want to provide services to the outside after all.
While you could use port-forwarding from the server, this only one service could run on the default port and most would need to use custom ports.

With HTTP(S) being the most commonly used protocol for services today, an alternative is to ruin Nginx as a reverse proxy on the Proxmox server to forward HTTP requests to the internal network.

> While this guide assumes you are running Nginx on the Proxmox server, you can also run it in its own container.
> I chose to use the server itself for this since I already use it to provide the Proxmox web interface on a default port.


The Idea
--------

We want to use Nginx as reverse proxy so that you can make HTTPS(S) request to internal machines and never notice that they are actually on a private network.

How this will work:

- Someone requests `a.pve-internal.home.lkiesow.io`
    - We need to make sure the domain resolves to our Proxmox server
- If HTTPS is being used, Nginx provides a valid TLS certificate
    - We need a wildcard certificate for `*.pve-internal.home.lkiesow.io`
- Nginx proxies the request to the internal machine
    - It uses the same protocol that is being requested


Reverse proxy for Specific Machines
-----------------------------------

If you just want to make certain machines available from the outside, you can add configurations for specific hosts to `/etc/nginx/sites-available/<name>`:

```py
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name a.pve-internal.home.lkiesow.io;

  # Certificate should be valid for the domain
  ssl_certificate_key /etc/pve/local/pveproxy-ssl.key;
  ssl_certificate     /etc/pve/local/pveproxy-ssl.pem;

  # Proxy configuration
  location / {
    # Use internal DNS server for name resolution
    resolver 10.0.0.2;
    set $backend $scheme://a.pve-internal.home.lkiesow.io;
    proxy_pass $backend;
    proxy_buffering off;
    client_max_body_size 0;
    proxy_set_header Host $host;
    proxy_ssl_name $host;
  }
}
```

Link this new file from the `sites-enabled` folder, which Debian's default Nginx configuration then automatically includes:

```
❯ cd /etc/nginx/sites-enabled
❯ ln -s /etc/nginx/sites-available/<name>
```

Make sure to use the internal DNS server to resolve the internal hostname.
This will return the internal IP address, and Nginx can use that to proxy to the internal server.

To check if the configuration is okay, run:

```
❯ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

Finally, restart Nginx:

```
❯ systemctl restart nginx
```


Proxy all Internal Machines
---------------------------

In certain scenarios, you may want to actually proxy to all internal machines automatically,
instead of handling each and every host manually.
Especially if you think about scenarios like a test cluster,
having this done automatically may make your life a lot easier.

This obviously means that you expose _all_ your machines to the external network via HTTP(S).
Your internal network thus has only limited protection against attacks via HTTP.

If you want automated proxying, create a file `/etc/nginx/sites-available/internal-host-proxy` with configuration like:

```py
server {
  listen 80;
  listen [::]:80;
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name *.pve-internal.home.lkiesow.io;

  ssl_certificate_key /etc/pve/local/pveproxy-ssl.key;
  ssl_certificate     /etc/pve/local/pveproxy-ssl.pem;

  # Proxy configuration
  location / {
    # Use internal DNS server for name resolution
    resolver 10.0.0.2;
    set $backend $scheme://$host;
    proxy_pass $backend;
    proxy_buffering off;
    client_max_body_size 0;
    proxy_set_header Host $host;
    proxy_ssl_name $host;
  }
}
```

This is a more generic version of the configuration for a single host, which matches a host using a wildcard and also now sets the backend dynamically.

As before, link the configuration from `sites-enabled`, test the configuration and restart Nginx to make this active:

```
❯ cd /etc/nginx/sites-enabled
❯ ln -s /etc/nginx/sites-available/internal-host-proxy
❯ nginx -t
❯ systemctl restart nginx
```

__⚠__ Don't Proxy to External Servers
-------------------------------------

Now that we dynamically decide which host to proxy, let's do a fun trick and make a request against our server, providing `Host: google.de` as an HTTP header in the request:

```http
❯ curl -i http://a.pve-internal.home.lkiesow.io -H 'Host: google.de'
HTTP/1.1 301 Moved Permanently
…
Location: http://www.google.de/
…
The document has moved
<A HREF="http://www.google.de/">here</A>.
```

We just made our server proxy Google.
This is obviously bad, since someone you exploit this behavior to attack other machines.

The reason for this behavior is that Nginx has fallback for server configurations to use in case no host matches.
To avoid this problem, we should explicitly define a default server which just returns a static response instead.
Create `/etc/nginx/sites-available/default` and set:

```py
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  listen 443 ssl http2 default_server;
  listen [::]:443 ssl http2 default_server;
  server_name _;

  ssl_certificate_key /etc/pve/local/pveproxy-ssl.key;
  ssl_certificate     /etc/pve/local/pveproxy-ssl.pem;

  location / {
    return 404 'Not found\n';
  }
}

```

Again, link the configuration from `sites-enabled`, test it and restart Nginx to make this active.
Now, doing the same request, we get a `404` directly from Nginx instead:

```
❯ curl -i http://a.pve-internal.home.lkiesow.io -H 'Host: google.de'
HTTP/1.1 404 Not Found
…
```

---

[◂   Back to: Part 2 – Proxmox & Internal Network Magic](part-2-internal-network-magic.md)
