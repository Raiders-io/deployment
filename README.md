# ft_transcendance #

## Usage ##

The only way to access the containers is by accessing the url from the nginx server. It could be `https://localhost/` or `https://username.42.fr` if you setupd `/etc/hosts` to point to `127.0.0.1` if the address is requested.

## Installation ##

You will need to use `docker`, if you don't have permissions to execute `docker compose` or anything related, please use a VM.

To properly setup the project, you need to create a `.env` file in `srcs/`. The file `.env.template` is here to give an example of how it could be filled. Fill the `here-*` with your values.
`OPENSSL_SUBJ` is only required for building images. `CN` as Common Name or server FQDN (Fully qualified domain name) could be simply `www.example.com`.

If you don't specify all the VARS, the build will stop. If you accept the risk, you can remove in the `compose.yml` file the `:?` after each environment varriable.

Please setup the `.env` file with all the required values and don't push it with VCS.

## Virtual Machines ##

If you are using a virtual machines, these commands will help you.

### How to send this project to your REMOTE ###

If you are working on the project, you should work on HOST as all your tools are already installed. You should only build and execute on REMOTE.
If it's not present :

```sh
make save
```

### Links ###

- [Grafana](http://127.0.0.1:3000/)
- [Prometheus](http://127.0.0.1:9090/)

### Resources ###

#### DevOps ####

- [Docker : publish your images](https://docs.docker.com/get-started/introduction/build-and-push-first-image/)
- [Docker : Grafana](https://hub.docker.com/r/grafana/grafana)
- [Setup Grafana with Docker](https://grafana.com/docs/grafana/latest/setup-grafana/installation/docker/)
- [Installing grafana a step by step guide](https://ikarthiks.medium.com/installing-grafana-a-step-by-step-guide-eb5f43b4477d)
- [Docker : distroless](https://docs.docker.com/dhi/core-concepts/distroless/)
- [Docker : debug](https://docs.docker.com/reference/cli/docker/debug/)
- [Docker, alpine vs distroless vs scratch](https://medium.com/google-cloud/alpine-distroless-or-scratch-caac35250e0b)
- [Docker : multi-stage build](https://docs.docker.com/build/building/multi-stage/)
- [Docker : Prometheus](https://prometheus.io/docs/prometheus/latest/installation/)
- [Prometheus configuration example](https://github.com/prometheus/prometheus/blob/main/documentation/examples/prometheus.yml)
