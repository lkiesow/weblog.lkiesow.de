Prevent Claude from adding Co-Authored-By
=========================================

Claude has the annoying habit of adding `Co-Authored-By: Claude` to commit messages as free advertisement for Anthropic.
Writing in your `CLAUDE.md` helps but is regularly overwritten by the instructions Claude gets from Antropic itself.
Here is a simple way of adding an additional guard rail to prevent this.

Adding a git commit hook
------------------------

Create a script we can later use as git commit hook which checks for the `Co-Authored-By: Claude …` in the commit message.
I've created mine at `~/.bin/claude-commit-msg-git-hook`.
```sh
#!/bin/sh

msg_file="$1"

if grep -q 'Co-Authored-By: .*Claude' "$msg_file"; then
	echo 'commit-msg: refusing commit — `Co-Authored-By: Claude ...` may not be in the commit message' >&2
	exit 1
fi
```

Then make that file executable:
```sh
chmod +x ~/.bin/claude-commit-msg-git-hook
```

Then add this as a global `commit-msg` git hook:
```sh
git config --global hook.claude-co-authored-post-commit.event commit-msg
git config --global hook.claude-co-authored-post-commit.command ~/.bin/claude-commit-msg-git-hook
```

To check which commit message hooks run in a repository:
```sh
git hook list --show-scope commit-msg
```

<date>
Sun Oct  4 01:22:29 PM CEST 2026
</date>
