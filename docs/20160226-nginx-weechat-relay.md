Setting up a Weechat Relay Behind NGinx
=======================================

For some time now, [Weechat](https://weechat.org) supports a [relay protocol
](https://weechat.org/files/doc/devel/weechat_relay_protocol.en.html) which
enables other clients like [android apps
](https://github.com/ubergeek42/weechat-android) or [web interfaces
](http://glowing-bear.org) to connect to Weechat and its attached networks.

While you can just expose the Weechat relay to the internet, have it secured
with its own SSL certificate and open yet another port in your firewall, I have
to admit that I am not very comfortable with that option:

1. I have one more application exposed to direct attacks. While I think the
   folks from Weechat do a great job, everyone can make mistakes and it is yet
   another risk.
2. I have to manage SSL certificates in another location. This is my laziness,
	but I think it's nice to have everything at one place.
3. I have [Nginx](https://nginx.org) running anyway. Nginx is capable of acting
	as reverse proxy for WebSocket connections and hence for a Weechat relay.
	So, why not use it.

I am assuming that internal communication on my server is secure. If it's not,
all is lost anyway. That is why my plan is to not bother at all with SSL
certificates in Weechat. In short, I am going to have Nginx terminate the SSL
connections.


Nginx Configuration
-------------------

I am assuming a proper SSL configuration already exists for Nginx. Hence I am
not going into details on this. That may be an article for another time. For
now, I will just recommend the [Qualys SSL Server Test
](https://ssllabs.com/ssltest/) to check if SSL is properly set-up.


For Nginx we now want to add a proxy configuration that forwards all
connections to 127.0.0.1 port 9001 which we will later use for the Weechat
relay.

It is important that we pass on the HTTP Upgrade and Connection headers since
we have WebSocket connections. For more details about this, have a look at the
[Nginx documentation](http://nginx.org/en/docs/http/websocket.html).

Now, here is the configuration:

    # Set connection header based on upgrade header
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    # Proxy for Weechat relay
    server {
        listen      443 ssl http2;
        server_name weechat.example.com;

        ssl_certificate_key /path/to/ssl/key;
        ssl_certificate     /path/to/ssl/cert;

        location / {
            proxy_pass http://127.0.0.1:9001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            proxy_read_timeout 4h;
        }
    }

This should be enough to make Nginx work as proxy. Now test your configuration:

    nginx -t

And finally restart Nginx to load the new configuration:

    systemctl restart nginx.service


Weechat Relay Configuration
---------------------------

Now let's configure the Weechat relay. For this, set the following properties
in Weechat:

    /set relay.network.password yourpassword
    /set relay.network.bind_address "127.0.0.1"
    /relay add ipv4.weechat 9001

This will set your relay password and will create a new relay that is listening
to localhost port 9001.


Connect to Relay
----------------

You now should be ready to connect to your relay. Make sure to set-up your
client to connect to your domain, port 443. On port 9001, no external
connections are allowed. Additionally, make sure to set the connection
type to WebSocket.

<time>Fri Feb 26 03:31:16 CET 2016</time>
