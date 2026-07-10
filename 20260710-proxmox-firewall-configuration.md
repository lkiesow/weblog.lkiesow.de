Enable Firewall in Proxmox
==========================

> __⚠ Warning:__ Don't just flip the firewall switch on.
> The default policy is deny, so unless you already have rules allowing
> management access, you will instantly lock yourself out of the web UI
> and SSH.

Before you start:

- Rules set on **Datacenter** level apply to all nodes, unless a node
  specifically overrides them.
- **VMs do not inherit** firewall rules from the datacenter or node level.
- For a VM's firewall to do anything, it must be enabled both on the VM
  itself and on its network interface(s).

Create the Allow Rules First
-----------------------------

Go to *Datacenter → Firewall* and add the following rules before enabling
anything:

| Direction | Action | Enable | Protocol | Port / Macro              |
|-----------|--------|--------|----------|---------------------------|
| IN        | ACCEPT | true   | TCP      | 8006 (PVE web interface)  |
| IN        | ACCEPT | true   | –        | macro: SSH                |
| IN        | ACCEPT | true   | –        | macro: Ping               |

Enable the Firewall
--------------------

Only once the rules above exist, go to *Datacenter → Firewall → Options*
and set:

- **Firewall**: `Yes`

That's it. Nodes now enforce the datacenter rules, and you can add
node-specific overrides or VM/interface-level firewalls as needed. Just
remember that VMs need their own firewall and rules enabled, since they
don't inherit any of the above.

<time>
Fri Jul 10 09:54:15 PM CEST 2026
</time>
</content>
