Using Caddy to get TLS certificates from Harica verified via EAB
================================================================

Harica uses external account binding (EAB) to verify that someone is allowed to
request a specific certificate. Using this method, you can get TLS certificates
for internal servers without having to expose them to the internet.


```
{
	# Global configuration of certificate issuer
	cert_issuer acme {
		dir https://acme-v02.harica.gr/acme/.../directory
		# External Account Binding credentials from HARICA
		eab "...key_id..." "...hmac..."
	}
	email acme@example.com
}


# You can now automatically use the issuer for all your domains
# with no further configuration:

xy.ex.com {
	redir https://xy.example.com{uri}
}

xy.example.com {
	respond "It works"
}
```

Forward Proxy
-------------

Using EAB is useful if Caddy runs in an internal network. This, however, may
mean that you cannot reach the internet (and thus Harica) without going through
an HTTP forward proxy.

You can make Caddy use a proxy for requesting the certificates by defining the
`HTTP_PROXY` and `HTTPS_PROXY` environment variables.

For example, if you run Caddy as Systemd service, edit `/etc/systemd/system/caddy.service.d/override.conf` and set
```ini
[Service]
Environment="HTTP_PROXY=http://proxy.example.com:3128"
Environment="HTTPS_PROXY=http://proxy.example.com:3128"[lars@vm350 ~]$ cat /etc/systemd/system/caddy.service.d/override.conf
```

<time>
Sat Oct 11 01:08:18 PM CEST 2025
</time>
