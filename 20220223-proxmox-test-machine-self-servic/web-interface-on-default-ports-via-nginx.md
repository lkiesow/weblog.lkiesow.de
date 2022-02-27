HTTPS on Port 443 via Nginx
===========================

The web interface of Proxmox is available on port `8006` instead of the default HTTPS port `443`.
HTTP on Port `80` is not available at all.
This guide uses Nginx to make the interface available on the default ports and redirect HTTP to HTTPS.


Install and Configure Nginx
---------------------------

You can install Nginx from the Debian repository.
For our use-case, the smaller `nginx-light` package should suffice:

```term
❯ apt install nginx-light
```

This should already give us a web server which is up and running.
What is left is to configure Nginx as reverse proxy.

Remove the default configuration:

```term
❯ rm /etc/nginx/sites-*/default
```

Next, create a new file `/etc/nginx/sites-available/proxmox-web-interface`
and set its content to something like this:

```py
server {
  # Enforce HTTPS by redirecting requests
  listen 80;
  listen [::]:80;
  server_name proxmox.home.lkiesow.io;

  location / {
    return 301 https://proxmox.home.lkiesow.io$request_uri;
  }
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name proxmox.home.lkiesow.io;

  ssl_certificate_key /etc/pve/local/pveproxy-ssl.key;
  ssl_certificate     /etc/pve/local/pveproxy-ssl.pem;

  # Proxy configuration
  location / {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_pass https://127.0.0.1:8006;
    proxy_buffering off;
    client_max_body_size 0;
    proxy_connect_timeout  3600s;
    proxy_read_timeout  3600s;
    proxy_send_timeout  3600s;
    send_timeout  3600s;
    proxy_set_header Host $host;
    proxy_ssl_name $host;
    proxy_set_header X-Forwarded-For $remote_addr;
  }
}
```

You can set more complex security options.
For a longer example, see [my example `/etc/nginx/sites-enabled/proxmox-web-interface`](etc-nginx/sites-enabled/proxmox-web-interface).
It includes the reverse proxy options and sets a number of different headers.
The reasoning for each header is included with additional information about what it does exactly.
There is also a fine-tuned version of [`/etc/nginx/nginx.conf`](etc-nginx/nginx.conf) which can be used alongside this.

After updating the configuration, link it from the `sites-enabled` directory:

```term
❯ cd /etc/nginx/sites-enabled
❯ ln -s /etc/nginx/sites-available/proxmox-web-interface
```

Finally, check if Nginx can spot any errors:

```term
❯ nginx -t
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```


Restart Nginx and Enable it by Default
--------------------------------------

To start Nginx and make sure it starts automatically after a system reboot, run:

```term
❯ systemctl restart nginx.service
❯ systemctl enable nginx.service
```

Finally, make sure that Nginx will start only after Proxmox starts, since the certificates may otherwise not yet be available.
To do that, create a file `/etc/systemd/system/nginx.service.d/override.conf` with the content:

```
[Unit]
Requires=pve-cluster.service
After=pve-cluster.service
```

Alternatively, you can also use `systemctl edit nginx.service` to edit this file.


Make Proxmox UI Service Listen to Localhost Only
------------------------------------------------

> __⚠ Warning:__
> I'm unsure if this works in a cluster setup without problems,
> or if the other servers cannot reach the API any longer.
> If you tried and know the answer, please let me know.

The web interface is now available via https://proxmox.home.lkiesow.io and https://proxmox.home.lkiesow.io:8006.
To ensure everyone is using the Nginx set-up, we can make the web interface service listen to local requests only.

Create `/etc/default/pveproxy` and set:

```sh
LISTEN_IP="127.0.0.1"
```

Then restart the service:

```term
❯ systemctl restart pveproxy.service
```

---

[◂   Back to: Part 1 – Basic Set-up of Proxmox](part-1-basic-setup.md)
