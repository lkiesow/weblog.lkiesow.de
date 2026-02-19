# HAProxy + Caddy: Recommended Set-up

In [HAProxy, Caddy, PROXY Protocol and X-Forwarded-For](/20260125-haproxy-caddy-proxy-protocol-x-forwarded-for) I explored how HAProxy and Caddy can work well together and pass or the real user's IP addresses, exploring different options and observing the behavior of HAProxy and Caddy.
You don't care and just want a quick recommendation instead? That's what you get here.

## The Set-up

We have an application cluster with HAProxy as load balancer and Caddy in front of the apps.
The flow of a request to an app therefor looks like this:

![User → HAProxy → Caddy → App](graph.png)

<!--
https://mermaid.live/edit#pako:eNplkF1vgyAUhv-KOdeWISoqMSZNd7GLXSxLdrPaCyr0IxMxqFm7pv99QNt06TghvOfwPucQTtBoIYHBptXfzY6bMXh9r7vAro9BmmA2q4KX-ZvRh6PXCy7ERc37_uK7u5flunJn-bSuyrWpykHxtq0i5GN1MV67Oe9VPtgJ8uEq8sBV30rUaHWl_XzHevFAxsiHqzTuGv3n7auXdv-BEuRjBSFszV4AG80kQ1DSKO5SODmyhnEnlayBWSm4-aqh7s6W6Xn3qbW6YUZP290tmXrBR_m851vDrWPD28FZZCekWeipG4FlJPI9gJ3gACxKCkSzlJKcUhLhIs5DOAJLsP2QJM3SHKeUJpieQ_jxUzGiOSEkijKS4jjHRXH-BRo8jWo
-->

##  Let Caddy accept X-Forward-For Headers set by HAProxy

In HAProxy, add `option forwardfor`.
This will make HAProxy send `X-Forward-For` headers.

```
backend caddy_server
    mode http
    option forwardfor
    default-server ca-file /etc/ssl/certs/ca-bundle.crt check ssl verify required sni req.hdr(host)
    server s1 caddy.example.com:443
```

In Caddy, mark HAProxy as trusted proxy.
Assuming `2.2.2.2` is the IP of HAProxy:

```
{
    servers {
        trusted_proxies static 2.2.2.2
    }
}

caddy.example.com {
    …
}
```

This will result in Caddy accepting or augmenting the `X-Forwarded-*` headers from HAProxy:

```yaml
❯ nc -l 8000
HEAD / HTTP/1.1
Host: example.com
Via: 1.1 Caddy
X-Client-Ip: 1.1.1.1
X-Forwarded-For: 1.1.1.1, 2.2.2.2
X-Forwarded-Host: example.com
X-Forwarded-Proto: https
X-Original-Forwarded-For: 1.1.1.1
X-Remote-Ip: [2.2.2.2]:60950
```

You can now use `client_ip` to check the user's IP address if necessary and Caddy will pass on the user's IP to applications.

<time>
Fri Feb 20 12:19:23 AM CET 2026
</time>
