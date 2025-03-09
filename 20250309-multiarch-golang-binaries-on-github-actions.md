# Build Multiarch Golang Binaries on GitHub Actions

By default, GitHub actions only provides x64\_64 runner for non-enterprise organizations.
You can still easily cross-build Go binaries for different architectures.

Using [github.com/elastic/golang-crossbuild](https://github.com/elastic/golang-crossbuild) makes cross-compiling really simple.
Instead of running `go build`, you just run the docker command like this:

```sh
docker run
  -v .:/go/src/github.com/<organization>/<repository>
  -w /go/src/github.com/<organization>/<repository>
  docker.elastic.co/beats-dev/golang-crossbuild:1.23.6-arm
  --build-cmd "go build"
  -p linux/arm64
```

The result will be an arm64 binary instead of an x84_64 binary.

In a GitHub Actions workflow, this could look look like this:

```yaml
name: Build ARM binaries

on:
  push:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build arm64
        env:
          CONTAINER: 1.23.6-arm
          ARCH: arm64
        run: >
          docker run
          -v .:/go/src/github.com/virtuos/opencast-ca-display
          -w /go/src/github.com/virtuos/opencast-ca-display
          docker.elastic.co/beats-dev/golang-crossbuild:${CONTAINER}
          --build-cmd "go build"
          -p linux/${ARCH}

      - run: file opencast-ca-display
```

For a full example of how to create a GitHub release
and include binaries statically build for multiple architectures,
take a look at [github.com/virtUOS/opencast-ca-display](https://github.com/virtUOS/opencast-ca-display/blob/0.1.1/.github/workflows/build-release.yml).

<time>
Sun Mar  9 05:29:22 PM CET 2025
</time>
