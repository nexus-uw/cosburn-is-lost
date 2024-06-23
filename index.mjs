

import http from 'http'
import { SocksProxyAgent } from 'socks-proxy-agent'

import { createServer } from 'node:http'
import { handleRootRequest } from './rootServer.mjs'

const hostname = '0.0.0.0'
const port = 3000
const root = process.env.ROOT_NAME
const proxy = process.env.PROXY || 'socks5h://127.0.0.1:9150'

const agent = new SocksProxyAgent(
	proxy,
	{
		timeout: 30000
	}
)

async function allowedDomain(domain) {
	// todo: put this in a DB
	return (process.env.WHITELIST || '').split(';').includes(domain)
}

const server = createServer((req, res) => {
	if (req.headers.host === root || req.headers.host === `localhost:${port}`) {
		handleRootRequest(agent, req, res)
	} else {

		const url = new URL(req.url, `http://${req.headers.host}`)
		// todo - block root cookies? https://aszx87410.github.io/beyond-xss/en/ch4/cookie-bomb/
		const host = `${url.hostname.split('.onion')[0]}.onion`
		
		if (!allowedDomain(host)) {
			console.log(`400 - NOT WHITELISTED ${host}`)
			res.statusCode = 400
			res.write(`${host} is not whitelisted`)
			res.end()
			return
		}
		const headers = {
			'user-agent': 'onion.monster/0.1',
			'x-tor2web':'1', // https://github.com/tor2web/Tor2web/issues/164
			...req.headers,
			//host // pretend to be og onion site
			// todo: filter out some headers?
		}

		delete headers['x-forwarded-for']
		delete headers['x-forwarded-host']
		delete headers['x-forwarded-proto']
		const target = `http://${host}${url.pathname}${url.search}${url.hash}`
		
		const start = Date.now()
		try {
			const proxyReq = http.request(target, {
				method: req.method,
				agent,
				headers,
				timeout: 29000 //ms - less than proxy timeout
			}, (res2) => {
				const end = Date.now()
				console.debug(`${res2.statusCode} - ${req.method} ${end-start} ${target}`) //res2.headers?['set-cookie'],res2.headers.cookie) // todo - would be great to pull out any caching related headers
				res.statusCode = res2.statusCode
				for (const k in res2.headers) {
					res.setHeader(k, res2.headers[k])
				}
				res2.pipe(res)
			})

			proxyReq.on('error', e => {
				const end = Date.now()
				console.error(e)
				console.debug(`500 - ProxyFailure ${req.method} ${end-start} ${target}`)
				res.statusCode = 500
				res.write(`proxy req failed`)
				res.end()
			})

			// assert that post/put only
			req.on('data', chunk => {
				proxyReq.write(chunk, (err) => { if (err) { console.error('data forward err ' + err) } })
			});
			req.on('end', () => {
				proxyReq.end()
			});
			req.on('error', (error) => {
				console.error(error)
				const end = Date.now()
				console.debug(`500 - RequestFailure ${req.method} ${end-start} ${target}`)
				res.statusCode = 500
				res.write(`proxy req failed`)
				res.end()
			});
		} catch (e) {
			console.error(e)
			const end = Date.now()
			console.debug(`500 - GeneralFailure ${req.method} ${end-start} ${target}`)
			res.statusCode = 500
			res.write(`proxy req failed`)
			res.end()
		}
	}

})

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})

server.on('clientError', (err, socket) => {
	console.log('clientError', err)
	if (err.code === 'ECONNRESET' || !socket.writable) {
		return;
	}

	socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
}); 
