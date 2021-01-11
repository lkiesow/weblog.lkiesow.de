Changes to the Opencast RPM Repository Coming with Opencast 9
=============================================================

> _Updated at Mon Jan 11 11:48:45 PM CET 2021_


*I've been maintaining the RPM repository for Opencast for about 8 years now.
In that time, it has become one of the primary ways of installing Opencast.
In fact, as demonstrated at the last conference, you can do a production ready installation in less than 30min.*

But the RPM repository changed quite a bit between Opencast 8 and Opencast 9.
This article explains some of these changes in more details than the official documentation.
It also provides a detailed upgrade guide to Opencast 9.

If you do a fresh install, please follow the official documentation:

- [Opencast 9 Installation Guide for CentOS/RHEL 8](https://docs.opencast.org/r/9.x/admin/installation/rpm-el8/)
- [Opencast 9 Installation Guide for CentOS/RHEL 7](https://docs.opencast.org/r/9.x/admin/installation/rpm-el7/)


Separate Repositories for Major Versions
----------------------------------------

The biggest change to the repository is that starting with Opencast 9 every major version has its own repository.
This change tries to prevent accidental updates between versions with breaking changes.

Before, this was achieved by including the major version of Opencast in the package name.
For example, `opencast8-allinone` was the package name for the Opencast 8 allinone distribution.
Running something like `dnf update` would update the package to the latest 8.x release
but would never automatically (accidentally) update to Opencast 9.

Unfortunately, this process is no longer sufficient for Opencast 9.
Opencast 9 is the first version which does not come with an internal Elasticsearch.
Instead, you have to run is as a separate service.
You can also not run any version of Elaticsearch.
It has to be one which is compatible with the specific Opencast major version.

This means that we now have the same problem with Elasticsearch version, we already have with Opencast major versions.
And while we could have solved the problem the same way,
this would have meant that users would need to keep track of the correct versions on their own.

Using separate repositories instead means that you can just install the latest version from that repository
and your package manager will pick the correct version for you automatically.

This is hopefully much simpler and will lead to less errors.


Open Access to the Repository
-----------------------------

While this change was done a while ago and also applies to the old repository,
it is worth mentioning that you do not have to register any longer for the Opencast repository.

In times of automated installs and prepared images to deploy, we felt like this was a relict of the past
and did not serve its original purpose any longer.


Using Repository Packages
-------------------------


One additional change allowed by the open access was to provide the repository configuration via packages.
This makes it much easier to configure the repository but also allows to automatically track changes to the repository itself.

Activating the repository on CentOS 8 is a mere:

```sh
% dnf install https://pkg.opencast.org/rpms/release/el/8/oc-09/noarch/opencast-repository-9-0-1.el8.noarch.rpm
```

This gives us the flexibility to make changes to the repository
without having to fear that we break the manually crafted repository configuration of all the installations out there.


Upgrade from Opencast 8 to Opencast 9
-------------------------------------

The following steps explain how to upgrade from an old Opencast 8 installation to Opencast 9
while switching the repository along the way.


As usual, first stop Opencast.
This allows for configuration and dependency updates without Opencast constantly trying to load and apply potentially broken configuration.

```sh
% systemctl stop opencast
```

Next, remove the old Opencast repository.
Use `dnf` if you already use the repository packages.
If you previously configured the repository manually, just remove the repository files:

```sh
% dnf remove opencast-repository-8
% rm -v /etc/yum.repos.d/opencast*repo
```

Then, install the new Opencast 9 repository:

```sh
% dnf install https://pkg.opencast.org/rpms/release/el/8/oc-09/noarch/opencast-repository-9-0-1.el8.noarch.rpm
```

The system's repository configuration should now look like this:

```sh
% dnf repolist 'opencast*'
repo id                    repo name                                   status
opencast                   Opencast 9 el 8 Repository                  enabled
opencast-noarch            Opencast 9 el 8 Repository - noarch         enabled
opencast-testing           Opencast 9 el 8 Test Repository             disabled
opencast-testing-noarch    Opencast 9 el 8 Test Repository - noarch    disabled
```

Until the Opencast 9.1 RPMS have been moved to stable,
you also need to enable the testing repository.

```sh
% sed -i 's/enabled *= *0/enabled = 1/' /etc/yum.repos.d/opencast-testing.repo

% dnf repolist 'opencast*'
repo id                    repo name                                   status
opencast                   Opencast 9 el 8 Repository                  enabled
opencast-noarch            Opencast 9 el 8 Repository - noarch         enabled
opencast-testing           Opencast 9 el 8 Test Repository             enabled
opencast-testing-noarch    Opencast 9 el 8 Test Repository - noarch    enabled
```

Now that the repository is set up, you can upgrade Opencast.
The new Opencast 9 packages will automatically replace the old Opencast 8 packages.
They will also try adopting your old configuration changes whenever possible.

Replace `opencast-<dist>` with the distribution you want to upgrade,
for example `opencast-allinone`:

```sh
% dnf  install opencast-<dist>
...
 Package               Architecture         Version          Repository            Size
========================================================================================
Installing:
 opencast-allinone     noarch               9.1-5.el8        @commandline         218 M
     replacing  opencast8-allinone.noarch 8.10-1.el8
...
```

Before starting the new version, make sure to follow the [upgrade guide](https://docs.opencast.org/r/9.x/admin/upgrade/).
In particular:

- [Install Elasticsearch](https://docs.opencast.org/r/9.x/admin/#installation/rpm-el8/#install-elasticsearch)
- [Rebuild the Elasticsearch Index](https://docs.opencast.org/r/9.x/admin/upgrade/#rebuild-the-elasticsearch-indexes)
- [Apply the basic configuration changes](https://docs.opencast.org/r/9.x/admin/configuration/basic/)


Finally, (re)start and enable all necessary services:

```
% systemctl restart elasticsearch
% systemctl enable elasticsearch
% systemctl restart activemq
% systemctl enable activemq
% systemctl restart opencast
% systemctl enable opencast
```

At this point you should have Opencast 9 up and running.


Feedback
--------

If you have any feedback to the new RPM repository, how packages are build, how the repository is structured or how it is deployed,
please [contact me directly](mailto:opencast@lkiesow.de) or bring it to Opencast's mailing list.

<time>Sat Jan  2 15:27:25 PM CET 2021</time>
