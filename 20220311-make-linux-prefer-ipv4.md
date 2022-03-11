Make Linux Prefer IPv4
======================

Like a surprising number of other ISPs in Germany, my ISP does not provide IPv6 for me.
While you mostly don't notice this, it is annoying if you specifically want to test IPv6 or access the (luckily rare) services hosted via IPv6 only.
This is why I use [Hurricane Electric's IPv6 tunnel](https://tunnelbroker.net) to enable IPv6 for my home network.

This works great but, as it is a shared medium, can be quite slow at times.
It is free, so I can't really complain, but it still is annoying.
What makes this more annoying is that now that my machines have access to IPv4 and IPv6, they automatically prefer IPv6.
So, in general, they prefer the slower connection over the faster connection.

My long-term solution for this will probably be to switch ISPs if there is ever an alternative to the current one when it comes to high-speed connections.
Unfortunately, there is no good alternative right now.
My midterm solution is to run my own tunnel from a nearby datacenter, which should hopefully make the tunnel barely noticeable.

My short-term solution, however, is to just make my machine prefer IPv4 over IPv6 instead.


Default behavior: getaddrinfo and RFC 3484
------------------------------------------

There is a default setting for how addresses are prioritized if more than one is available for a given hostname.
To quote from the `gai.conf` man page:

> A call to `getaddrinfo(3)` might return multiple answers.
> According to [RFC 3484](https://ietf.org/rfc/rfc3484.txt) these answers must be sorted so that the answer with the highest success rate is first in the list.
> The RFC provides an algorithm for the sorting.

This default algorithm for sorting and the set of rules behind it causes IPv6 to always be preferred over IPv4:

```
❯ man gai.conf
…
precedence  ::1/128       50
precedence  ::/0          40
precedence  2002::/16     30
precedence ::/96          20
precedence ::ffff:0:0/96  10
…
```

This specified IPv6 subnetworks and their priority.
IPv4 is actually an embedded subset of IPv6 and `::ffff:0:0/96` specified a 32 bit network which is IPv4 (Take a look at [RIPE's cheat sheet for IPv6 address prefixes](https://www.ripe.net/participate/member-support/lir-basics/ipv6_reference_card.pdf) for more details).
This means that, for example, the IPv6 address `::ffff:192.168.0.2` and the IPv4 address `192.168.0.2` are identical.

Understanding that, we now understand why IPv6 addresses will be preferred, and we see how we can easily raise the priority for IPv4.
Just turn the priority of `10` into something like `100` which is higher than anything else.


Applying the Configuration
--------------------------

To apply the configuration, simply edit or create `/etc/gai.conf` and set the default configuration with a modified priority for IPv4:

```
label  ::1/128       0
label  ::/0          1
label  2002::/16     2
label ::/96          3
label ::ffff:0:0/96  4
precedence  ::1/128       50
precedence  ::/0          40
precedence  2002::/16     30
precedence ::/96          20
precedence ::ffff:0:0/96  100
```

Make sure that you supply the whole configuration, since if anything is configured in this file,
the whole default configuration is discarded.


Testing the Result
------------------

An easy way for you to test this is to just see what type of IP address is being used when requesting a website.
This will request [my.ip.fi](http://my.ip.fi) via IPv4, via IPv6 and then use the default:

```
❯ curl -4 my.ip.fi && curl -6 my.ip.fi && curl my.ip.fi
77.21.80.1
2001:470:1f0b:bc0::f00
77.21.80.1
```

The default is now IPv4 🎉

<time>Fri Mar 11 06:19:05 PM CET 2022</time>
