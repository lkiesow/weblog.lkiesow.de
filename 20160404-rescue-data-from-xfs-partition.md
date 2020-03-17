Rescue Data From an XFS Partition
=================================

Today at work my systems main drive crashed. Of course you always think about
the possibility of this. After all, that is why we make backups. But you only
really think about what you loose when it happens.

Luckily, most of my data are properly backed up after all (yay). But then I was
only doing those backups manually and there were still some newer data which I
would have lost. These include todays coding work and some new SSH keys.

The first is only the work of one day, but it would still have been nice if I
had remembered to git-push the code more often. The second would have been
unrecoverable and I would have needed to talk to the technical admins of all
the systems I should have access to. In my case that would have been several
people at several different institutions causing a lot of work.

To summarize, while it would not be catastrophic, it would have been really
annoying to loose all the data and so I decided to attempt a data rescue
instead.


Step 1: Get Data From Disk
--------------------------

I could not mount the device anymore, Gparted completely crashed when doing
anything with the one partition on that disk: It did not look good.

That is why the first thing I did was to copy over the raw partition into a
file on another disk using `dd`:

    dd if=/dev/sdb1 of=lkvirtuos.bak.xfs.img

This took a while but I could be sure 

<time>Mon Apr  4 21:12:35 CEST 2016</time>
