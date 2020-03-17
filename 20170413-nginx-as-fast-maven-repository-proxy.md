Nginx As Fast Maven Repository Proxy
====================================

With [Opencast](http://opencast.org) we are using [Sonatype
Nexus](http://www.sonatype.org/nexus/) as repository manager for a while to
proxy and combine several other maven repositories and host a very few of our
own artifacts.

Since we are an international open source project we even have set-up multiple
Nexus servers all around the world to speed things up for users with most of
them just mirroring our main server.

While that works just fine, there are several problems with this approach, the
most important ones being:

- Nexus is not packaged in any big Linux distribution, hence we have to
  [package it on our own
  ](https://copr.fedorainfracloud.org/coprs/lkiesow/nexus-oss/) and always keep
  up with security updates, … which is a lot of work.
- For a proper set-up, you would want a Nexus to run behind a reverse proxy to
  serve content over the default ports (80, 443) and have your proxy deal with
  TLS to secure connections. Hence you need to run additional software.
- Nexus is a *beast* when it comes to resources. It takes several gigabytes of
  memory. And for what? It's basically a slightly intelligent web server!

Especially due to the gigantic memory consumption I was tempted to write my own
repository manager with less features but better performance and less resource
consumption but thinking about this I came to the conclusion that what I needed
is a proxy server with caching. Something Nginx has built in.

Let's try it!


Minimal Set-Up
--------------

For a first tests, let's just set-up a proxy server for a maven repository. If
that works, we can then deal with caching. A minimal Nginx configuration for a
proxy would look like this:

    server {
      listen       80;
      server_name  maven.lkiesow.de;

      location / {
        proxy_pass http://nexus.virtuos.uos.de:8081;
      }
    }

Nothing fancy here, but this should already work and you can test a Maven build
against this. It should be relatively slow, though, since Nginx will request
all resources from the upstream repository. Basically, all artifacts are now
making a detour over the new server.

If that works, let's introduce caching:

    proxy_cache_path /var/lib/nginx/cache levels=1:2
                                          keys_zone=maven_cache:10m
                                          max_size=10g inactive=1M
                                          use_temp_path=off;

    server {
      …
      location / {
        proxy_cache maven_cache;
        proxy_pass http://nexus.virtuos.uos.de:8081;
      }
    }

This will enable basic caching. The options to [proxy\_cache\_path
](http://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_cache_path)
define the size and location of the cache. Here, the cache will be stored at
`/var/lib/nginx/cache`.

- *levels* specifies that one level of sub-folders are used.
- *keys\_zone* specifies a 10MB in-memory storage for the cache to store the
  information if an artifact is cached or not.
- *max¸_size* specifies the maximum size of the cache. If the cache exceeds
  this size, it will be cleaned up.
- *inactive* specifies how long files are kept if they are not requested.
  Keeping them for a month is sufficient for me. Increase this if you want to
  still cache artifacts which are seldom requested (e.g. for old versions).
- *use\_temp\_path* specifies that cached items are directly written to the
  cache and not to the temp folder before that.

With this set and Nginx restarted, the first build should still be slow since
the cache needs time to fill up, but subsequent requests should be much faster
since artifacts are now served from cache. Or are they not?


Optimization
------------

Remember that Nginx is usually caching web applications which regularly change
their content but with hundreds of requests per minute. Hence caching defaults
are set to update caches fairly regularly and to throw out old cache items. For
a maven repository proxy I expect much less requests. I am also pretty sure
that upstream content never changes. For example, `xy-1.2.3.jar` should stay
the same or become `xy-1.2.4.jar`.

This is something we should consider for our configuration. The good thing is
that Nginx has hundreds of options tu tune its behavior. Here is my
configuration:

    proxy_cache_path …

    server {
      …
      location / {
        # Use a specific caching zone for this proxy. The zone is
        # defined in proxy_cache_path.
        proxy_cache maven_cache;

        # Proxy to a specific host
        proxy_pass http://nexus.virtuos.uos.de:8081;

        # Use stale caches whenever possible if there seems to be an
        # upstream error so that repository will work even if upstream
        # is down.  Additionally, use the stale files if an asset is
        # just being updated.
        proxy_cache_use_stale error timeout updating http_500
                              http_502 http_503 http_504;

        # Cache successful retrieved files for a long time (a month)
        # before updating them. Usually, we should always be able to
        # retieve files from upstream again, hence I am updating this
        # once a month. If you are not so sure about that, set it to
        # several years (centuries?)
        proxy_cache_valid 200 1M;

        # Since we are caching artifacts for a long time, it may make
        # sense to not cache everything as soon as it is requested
        # once (e.g. for testing) but only cache artifacts which are
        # requested fairly regularly. For example, this will require
        # an artifact to be requested three times before it is
        # cached..  That should happen pretty fast with artifacts
        # actually used in production.
        proxy_cache_min_uses 3;

        # To reduce traffic, this can be set to only retrieve an asset
        # once if it requested and make all other people requesting the
        # same artifact wait until the first process has finished. This
        # may reduce the speed for initial requests (except for the
        # first one) but reduces the bandwith used. This should be no
        # problem if your artifacts are reasonable small.
        proxy_cache_lock on;

        # This allows starting a background subrequest to update an
        # expired asset, while a stale cached response is returned to
        # the client.  Note that this requires Nginx version 1.11.10.
        #proxy_cache_background_update on;
      }
    }

For more information and additional options, please check the
[official ngx\_http\_proxy\_module
documentation](http://nginx.org/en/docs/http/ngx_http_proxy_module.html).

Performance
-----------

Checking the performances, in the end there was no big difference between Nginx
and our main Nexus server when it came to build time. It was roughly the same
with most of the time being spent on tests, compiling, … anyway.

That said, I did not do a proper performance test yet but just did two builds
with empty local Maven caches each from Osnabrück, Germany and Saskatchewan,
Canada which yielded similar results except for the Osnabrück build against
Nexus being a bit faster. But then, the nexus is actually located in Osnabrück.

The set-up:

- Nexus was running on a VM at the [Unmiversity of Osnabrück](http://uos.de),
  Germany with 4GB of RAM, 4CPU cores, and a gigabit internet connection
- Nginx was running on a low-end VM at [Time4VPS](https://time4vps.eu/),
  Lithuania with 1 CPU core, 1GB of RAM and a 400 megabit connection

What was interesting was that the *whole* Nginx VM was using only 50MB RAM, so
there was a lot to spare which I cannot say for Nexus.

Of course, this is not a proper performance test since the set-ups are so much
different. I will make a proper test using one of our real repository servers
and publish the results later. But this already hints at Nginx being way more
efficient and with it being packaged in most modern Linux distributions it is
definitely easier to set-up and much easier to maintain.


<time>Thu Apr 13 11:53:18 CEST 2017</time>
