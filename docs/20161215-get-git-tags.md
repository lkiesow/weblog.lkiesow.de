Retrieve Tags From Remote Git Repository
========================================

For one project of mine, I needed to know all tags from a remote git repository.
If the repository is on one of the larger platforms like Bitbucket or Github,
you could possibly use their REST API to get these data. Of course, it was
hosted somewhere else. There is also always the solution of cloning the
repository and using `git tag` but that might be very slow and you have a lot
of data lying around which you do not need.

Fortunately, `git` can also get tags from remote repositories. You can use `git
ls-remote`, `sed` and `sort -V` to do the job:

    git ls-remote --tags ...url.git \
      | sed -n 's_^.*/\([^/}]*\)$_\1_p' \
      | sort -V

Note that I'm dropping all [tag references][1] and assume that the tag names do
not contain `/` or `}` characters. But that should usually be no problem.
Also, make sure that you have a recent version of `sort` that supports sorting
of version numbers.

Often, I want only the releases (no RCs, betas, …) for which I use a slightly modified `sed` command:

    git ls-remote -t ...url.git \
      | sed -n 's_^.*/\([0-9\.]*\)$_\1_p' \
      | sort -V

As an example, this would list all Opencast releases:

    % git ls-remote -t https://bitbucket.org/opencast-community/matterhorn.git \
      | sed -n 's_^.*/\([0-9\.]*\)$_\1_p' \
      | sort -V
    1.3.0
    1.3.1
    ...
    2.1.1
    2.1.2
    2.2.0

<time>Fri Dec 16 17:03:00 CET 2016</time>

[1]: http://stackoverflow.com/a/15472310/2352895
