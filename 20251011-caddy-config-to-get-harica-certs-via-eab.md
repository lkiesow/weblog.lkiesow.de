Using Caddy to get TSL certificates from HARICA verified via EAB
================================================================

HARICA uses external account binding (EAB) to verify that someone is allowed to
request a specific certificate. Using this method, you can get TSL certificates
for internal servers without having to expose them to the internet.


```
{
	cert_issuer acme {
		dir https://acme-v02.harica.gr/acme/.../directory
		# External Account Binding credentials from HARICA
		eab "...key_id..." "...hmac..."
	}
	email acme@example.com
}

xy.ex.com {
	redir https://xy.example.com{uri}
}

xy.example.com {
	respond "It works"
}

<time>
Sat Oct 11 01:08:18 PM CEST 2025
</time>
