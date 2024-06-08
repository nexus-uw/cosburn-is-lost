
sample docker compose set up of a gotosocial server set up to run as a hidden service using onion.monster tor2web proxy

service will proxy outgoing requests over tor to help stay hidden

docker run --rm -it -v $PWD:/keys ghcr.io/cathugger/mkp224o:master -d /keys NAME


using gotosocial b/c - small single container instance + sets outbound proxy

tested with the following clients
 - [elk](https://github.com/elk-zone/elk)

TODO - hidden service password to limit access to onion.monster
