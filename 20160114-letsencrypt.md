Let's Encrypt: Manual Mode, Docker and Nginx
============================================

[Let's Encrypt](https://letsencrypt.org/) is a nice way to get domain verified
SSL certificates valid for all modern browsers easy, fast and free of charge.
By default, however, the letsencrypt tool will modify your servers
configuration to archive the verification.

I do not want to have a tool modify (and possibly break) my configuration. So
here is a way to do the whole thing manually and mostly separated from your
server (and your configuration) while still keeping the whole process very easy.

> This article is based on [Using Let's Encrypt in manual
> mode](https://tty1.net/blog/2015/using-letsencrypt-in-manual-mode_en.html) by
> Thomas Pircher.  I recommend reading the full article to understand what the
> separate steps do and why it is used in the way, it is used.

The Tools
---------

- We use Docker to lock in letsencrypt. We do not really care what it does in
  the container. While Docker is *not* an absolutely safe way to jail
  applications, this time it should more then suffice to keep our file system
  and configuration clean.

- We use a modified version of Thomas' script to generate key and certificate
  before letting it sign by the Let's Encrypt Authority.

- We use Nginx to deploy our verification key. If you are running Apache httpd
  or something else instead, that should not be a problem. The principle stays
  exactly the same.


Launch Docker Container
-----------------------

We use Fedora version 23 or later as image for our container since letsencrypt
is already packaged in there and we do not need to install it manually. Apart
from that, the operating system should not matter at all since we only
temporarily need the container.

    docker run -i -t fedora:23 bash

Now install `letsencrypt` by running:

    dnf install letsencrypt

Finally, get the automation script from
[Thomas](https://tty1.net/blog/2015/using-letsencrypt-in-manual-mode_en.html#certificate-script).
Make sure to modify this script for your person. This means especially:

- country=UK
- state="Some State"
- town="Some Place"
- email=webmaster@example.com

You also might want to increase the key size and get a 4096 bit key, though a
2048 bit key should suffice at the moment:

    openssl req  […]  -newkey rsa:4096  […]

Store this script as something like `gencert.sh` and we are ready to get our
certificate.


Get Certificate
---------------

Now run the script with all domains you want to create a certificate for as
arguments, like this:

    ./gencert.sh weblog.larskiesow.de weblog.lkiesow.de

Answer with `yes` if asked if it is fine to publish your IP address and you
will see letsencrypt starting a BaseHTTPServer to serve your verification key
on port 80. This would obviously problematic if you already have an HTTP server
running on that port and do not want to take it down for a while. So here comes
the tricky part where we use our regular HTTP server to serve this key.

First of all we need to get the key and the location it needs be be served
from. For this, look for a line in the script output that looks like this:

    printf "%s" 7CWAlzYV-6Z… > .well-known/acme-challenge/7CWAlzY…

Which is basically:

    printf "%s"  [verification-code] > [path-to-serve]

What we need to do is just to ensure that our web-server serves this key at the
given path. If you have your server configured to just deliver files, you can
simply put a file containing the verification code in the right place of your
file system. It is a bit harder if you use your server for a web application
(e.g. as proxy).

If that is the case, modify your Nginx configuration to serve the verification
code directly by adding a configuration like this:

    location /.well-known/acme-challenge/7CWAlzY… {
	 	return 200 '7CWAlzYV-6Z…'
		add_header Content-Type text/plain;
	 }

Now go back to your Docker container and hit return to let the letsencrypt
script continue. You will have to repeat serving the verification code for
every domain. After the certificate is generated, you do not have to serve the
verification code any longer.


Applying Certificate
--------------------

Copy the certificate to your server:

    scp 0001_chain.pem certs/[domain]/privkey1.pem yourdomain.com:~

Finally, add it to your web-server's configuration

    server {
       listen              443 ssl;
       ssl_certificate_key /etc/nginx/ssl/yourdomain.key;
       ssl_certificate     /etc/nginx/ssl/yourdomain.pem;
       […]
    }


<time>Thu Jan 14  19:44:14 CET 2016</time>
