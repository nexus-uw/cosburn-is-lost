

import http from 'http'
import { SocksProxyAgent } from 'socks-proxy-agent'

import { createServer } from 'node:http'
import { createCipheriv } from 'crypto'

const hostname = '0.0.0.0'
const port = 3000
const root = process.env.ROOT_NAME
const proxy = process.env.PROXY || 'socks5h://127.0.0.1:9150'

const agent = new SocksProxyAgent(
	proxy,
)

async function allowedDomain(domain) {
	// todo: put this in a DB
	return (process.env.WHITELIST || '').split(';').includes(domain)
}

const server = createServer((req, res) => {

	if(req.headers.host === root){
		res.statusCode = 200
		res.write(`TODO - build out landing page with contact info. something better than just a string`)
		res.end()
		return
	}

	const url = new URL(req.url, `http://${req.headers.host}`)
	// block root cookies? 6
	const host = `${url.hostname.split('.onion')[0]}.onion`
	console.debug(host)
	if (!allowedDomain(host)) {
		res.statusCode = 400
		res.write(`${host} is not whitelisted`)
		res.end()
		return
	}
	const headers = {
		'user-agent': 'some big old titites v0.2',
		...req.headers,
		//host // pretend to be og onion site
		// todo: filter out some headers?
	}

delete headers['x-forwarded-for']
delete headers['x-forwarded-host']
delete headers['x-forwarded-proto']
	const target = `http://${host}${url.pathname}${url.search}${url.hash}`
console.debug(req.method,target, headers)
	try{
	const proxyReq = http.request(target, {
		method: req.method,
		agent,
		headers
	}, (res2) => {
		console.log('response', res2.statusCode, res2.headers) //res2.headers?['set-cookie'],res2.headers.cookie)
		// if cookies, re-write site to be proxy's?
		res.statusCode = res2.statusCode
		for (const k in res2.headers) {
			res.setHeader(k, res2.headers[k])
		}
		res2.pipe(res)
	})

	// assert that post/put only
	req.on('data', chunk => {
		console.log('data')
		proxyReq.write(chunk, (err) => console.error('data forward err ' + err))
	});
	req.on('end', () => {
		proxyReq.end()
	});
	}catch(e){
		console.error(e)
		res.statusCode = 500
		res.write(`proxy req failed`)
		res.end()
	}


})

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})
