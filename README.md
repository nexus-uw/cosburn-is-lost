doc'd at https://onion.monster

todo: better readme


## how to run using Docker Compose


```yaml
services:
    <Your HTTPS front end proxy of choice to proxy to cosburn-is-lost:3000>
    cosburn-is-lost:
        image: ghcr.io/nexus-uw/cosburn-is-lost:master
        restart: always
        environment:
            PROXY: "socks5h://torproxy:9150"
            ROOT_NAME: "<YOUR DOMAIN NAME>"
            WHITELIST: "collection of onion domains, semicolon separated"
    torproxy:
        restart: always
        image: peterdavehello/tor-socks-proxy

```