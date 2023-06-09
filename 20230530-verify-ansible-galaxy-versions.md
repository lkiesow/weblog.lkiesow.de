# Verify Ansible Galaxy Role Versions

Ansible Galaxy is a fantastic way of sharing common roles to deploy infrastructure.

To ensure that you don't get an unwanted surprise and change your infrastructure, because someone changed the roles,
you can also make roles local to your playbook and specify exact versions.

You do that by configuring the role locations in the `ansible.cfg`:
```ini
[defaults]
roles_path = ./.roles
collections_path = ./.collections
```

And by specifying versions in the `requirements.yml`:
```yml
roles:
  - name: lkiesow.dnf_autoupdate
    version: 2.0.1
```

The only problem with that: Ansible will not verify these versions and check if what is installed actually matches what is required.
You can always run `ansible-galaxy install --force -r requirements.yml`, but that is slow enough so that you don't want to do it every time, and thus easy to forget.

If only there was a way to automatically verify if the correct versions are installed 😁

## Verify Role Versions

Luckily, you have everything you need to automatically check the versions. The `requirements.yml` contains what you want and `ansible-galaxy list` lists what is installed.

The only thing left is a bit of glue-code making the comparison:

```python
#!/usr/bin/env python3

import re
import subprocess
import yaml


def installed_roles() -> dict[str, str]:
    '''Get the installed Ansible roles via `ansible-galaxy list` and return a
    dictionary of playbooks and their versions..
    '''
    result = subprocess.run(['ansible-galaxy', 'list'], stdout=subprocess.PIPE)
    roles = yaml.safe_load(result.stdout)
    result = {}
    for role in roles:
        name, version = role.split(',', 1)
        result[name] = version.strip()
    return result


def main():
    # Get required and installed roles
    with open('requirements.yml', 'r') as f:
        requirements = yaml.safe_load(f)
    installed = installed_roles()

    for role in requirements.get('roles', []):
        name = role.get('name')
        if not name:
            if role.get('scm') == 'git' and role.get('src'):
                name = re.search('/([^/]*)\\.git', role['src']).group(1)
            else:
                print(f'WARNING: could not handle {role}')
        if not name:
            continue
        if name not in installed:
            print(f'ERROR: role {name} is not installed')
            exit(1)
        version = role.get('version')
        if version and installed[name] != version:
            print(f'ERROR: role {name} has incorrect version')
            print(f'  required: {version}')
            print(f'  present: {installed[name]}')
            exit(1)


if __name__ == '__main__':
    main()

```

Save this as `.verify-galaxy-versions` and make it executable.
Running it will then reveal if you have the correct versions installed:

```
❯ ./.verify-galaxy-versions 
ERROR: role elan.elan_certbot has incorrect version
  required: 0.1.0
  present: 0.3.0
```

## Automate Checks in Play Runs

Since this check is very fast, you can make it part of your playbook with no major downside.
Just call the script as first task in your `playbook.yml`:

```yml
- name: Verify Galaxy Roles
  hosts: localhost
  connection: local
  gather_facts: false
  tasks:
    - name: Verify versions
      ansible.builtin.command:
        cmd: '{{ playbook_dir }}/.verify-galaxy-versions'
      changed_when: false
```

If there is a mismatch, the play will fail and you don't accidentally deploy something else on your infrastructure:

```
❯ ansible-playbook playbook.yml       

PLAY [Verify Galaxy Roles] *******************************************************************************************************************************************************************************************************************

TASK [Verify versions] ***********************************************************************************************************************************************************************************************************************
fatal: [localhost]: FAILED! => {"changed": false, "cmd": ["/home/lars/dev/uos/oc_setup/.verify-galaxy-versions"], "delta": "0:00:00.573399", "end": "2023-05-26 13:41:37.452125", "msg": "non-zero return code", "rc": 1, "start": "2023-05-26 13:41:36.878726", "stderr": "", "stderr_lines": [], "stdout": "ERROR: role elan.elan_certbot has incorrect version\n  required: 0.3.0\n  present: 0.1.0", "stdout_lines": ["ERROR: role elan.elan_certbot has incorrect version", "  required: 0.3.0", "  present: 0.1.0"]}

PLAY RECAP ***********************************************************************************************************************************************************************************************************************************
localhost                  : ok=0    changed=0    unreachable=0    failed=1    skipped=0    rescued=0    ignored=0   
```

It would be nice to have this integrated into Ansible in the long run, but this is a very effective solution for now.

<time>
Tue May 30 03:55:51 PM CEST 2023
</time>
