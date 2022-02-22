Bonus (sshuttle): VPN to the Internal Network
=============================================

> - This guide assumes [an internal network has already been set up
>   ](internal-network.md) on the Proxmox server.
> - This guide assumes [an SSH jump host to connect to your internal network exists](ssh-jumphost-to-internal-network.md).

Setting up an [HTTP(S) reverse proxy](https-reverse-proxy.md) to carry HTTP(S) requests into your internal network will already solve a lot of your cases where you want to provide a service to the outside because most  services are provided via HTTP today.

Nevertheless, as a developer, sometimes you need to get into the network to talk to other services. For that [`sshuttle`](https://github.com/sshuttle/sshuttle) comes in handy. It is a transparent proxy server that works as a poor man's VPN over SSH.

You can use it to easily route your TCP traffic through SSH as long as you have an SSH connection to one server in that network. No `root` required and the only thing you need to have installed on the remote machine is `python`.

Connecting to Internal Network
------------------------------

To connect to your internal network, users just need to run `sshuttle` on their local machine. Providing the `--dns` flag will cause local DNS requests to be forwarded so you can resolve internal domain names. Providing the subnet, users can choose to route their entire traffic through the  tunnel (`0.0.0.0/0`) or limit this to the internal network as target (`10.0.0.0/16`):

```
❯ sshuttle --dns -r a.pve-internal.home.lkiesow.io 10.0.0.0/16
c : Connected to server.
```

That's it. Now you can connect to internal servers via TCP as if you are a machine on the internal network itself:

```
❯ curl -I a.pve-internal.home.lkiesow.io
HTTP/1.1 200 OK
…
```
