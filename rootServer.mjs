/**
 * 
 * @param {http.IncomingMessage} req 
 * @param {Response} res 
 * @returns 
 */
export function handleRootRequest(agent, req, res) {

    if (req.path === "/health") {
        // assert than tor client is up and running. q: should this be hidden service or clearnet site? hidden service is more likely to be down due to larger number of moving pieces 
        // todo - make this configurable
        const proxyReq = http.request("http://ramsayswljlwqo7yvw3ovxhyzavllyduxkgh4rbobzkc263jyro6cjyd.onion/ping", {
            method: 'GET',
            agent,
            timeout: 29000 //ms - less than proxy timeout
        }, (res2) => {
            console.debug('health check response', res2.statusCode)
            res.statusCode = res2.statusCode
            res2.pipe(res)
        })

        proxyReq.on('error', e => {
            console.error(e)
            res.statusCode = 500
            res.write(`health check req failed`)
            res.end()
        })
    } else {
        res.statusCode = 200
        res.write(`
	  <html>
	  <head>
		<title>onion monster</title>
		  <meta name="description" content="expose hidden service fediverse servers for proper federation">
		  <meta name="keywords" content="tor hidden service, fedi, fediverse">
		   <meta name="viewport" content="width=device-width, initial-scale=1" />
			<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self'; style-src 'self';">
	  </head>
	  <body>
	  <h1>hello there</h1>
	  <p>you have come across my INPROGRESS project </p>
	  <p> What is this thing? onion.monster is a service that exposes tor hidden service fediverse servers to the broader fediverse so that they can properly federate. </p>
	  <p> Why would you want to do such a thing? clearnet servers do not know how to connect to .onion domains (since those requests need to go through tor. While it would be possible for servers to configure their own tor proxy, I would not expect most servers to take on this work. 
	  Additionally, from my expriences, servers have a HARD requirement to communicate over HTTPS. <a href="https://community.torproject.org/onion-services/advanced/https/">Hidden services can be servered over HTTPS, it not practical in 2024</a>. This is where onion.monster comes in.
	  It operates as whitelisted tor2web style proxy, so that fedi servers can register with it and be accessible to the clear net as https://<onionV3>.onion.monster
	  </p>
	  <h2> would you like to host a server on onion.monster</h2>
	  <p> TODO - contact </p>
	  
	  <h2> DISCALIMER </h2>
	  <p> There are some inherit security flaws with this setup. I need to properly document them. So, for now this is just a fun test thing.</p>
	  <p> this is also a slow way to do things (it is communiticating with a hidden service over 6 nodes, and if the fedi server needs to make its own call out, it will have to make 3 more tor node hops). Due to inherit design of onion routing, th</p>
	  <h3> Links </h3>
	   <ul>
		<li><a href="https://github.com/nexus-uw/cosburn-is-lost/tree/master">CODE</a></li>
		<li><a href="https://github.com/nexus-uw/cosburn-is-lost/tree/master/sample">Sample gotosocial server setup using dockercompose</a></li>
		<li><a href="https://sampleg325ps7z3d6oqadfgmokwvuic72lgr3b4um22ekgf3jq6ebaad.onion.monster">test server 1</a></li>
		<li><a href="https://lfom7wkestbnygwr6ae22loll363pv3eb5nrwraf3cc6fdlrw55kerqd.onion.monster">test server 2</a></li>
		<li><a href="https://mastodon.social/@onion_monster/112607557795698912"> sample thread between the 2 test servers and a normal Mastadon account, showing that they are all able to federate amongst themselves</a> </li>
		<li><a href="https://elk.onion.monster">elk client configured to work with onion.monster servers</a></li>
	  </ul> 
	  <footer>
		2024 - CURRENT YEAR TODO license
	  </footer>
	  </body>
	  </html>`)
        res.end()
        return
    }
}