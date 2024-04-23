

import http from 'http'
import { SocksProxyAgent } from 'socks-proxy-agent'

import { createServer } from 'node:http'

const hostname = '0.0.0.0'
const port = 3000

const proxy = process.env.PROXY || 'socks5h://127.0.0.1:9150'

const agent = new SocksProxyAgent(
	proxy,

)
const server = createServer((req, res) => {

	console.log(req.headers, req.url)


	const url = new URL(req.url, `http://${req.headers.host}`)
	const headers =  {
		'user-agent': 'some big old titites v0.2',
		...req.headers
	}
	console.log('request',url,req.headers,req.headers.cookie, '->',headers)
	//if (url.hostname.includes('.onion')) todo - filter
		const proxyReq = http.request(`http://${url.hostname.split('.onion')[0]}.onion${url.pathname}?${url.search}`, {
			method: req.method,
			agent,
			headers
		}, (res2) => {
			console.log('response',res2.headers, res2.statusCode) //res2.headers?['set-cookie'],res2.headers.cookie)
			res.statusCode = res2.statusCode
			for(const k in res2.headers){
				res.setHeader(k, res2.headers[k])
			}
			res2.pipe(res)
		})

		// assert that post/put only
    req.on('data', chunk => {
		proxyReq.write(chunk)
    });
    req.on('end', () => {
        proxyReq.end()
        
    });
		
		
})

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/`)
})


// import CacheableLookup from 'cacheable-lookup'

// const cacheableLookup = new CacheableLookup()
// cacheableLookup.servers = ['127.0.0.1:8853']
// cacheableLookup.servers = ['127.0.0.1:9999']





// import request from 'request'
// import Agent from 'socks5-http-client/lib/Agent'

// request.get('http://qxkp5h447ik6kuxqjkjtqwcgurnaeyqldnyx5kaqvpvcfdmlldakyyad.onion', {
// 	agentClass: Agent, agentOptions: {
// 		socksHost: '127.0.0.1',
// 		socksPort: 9150
// 	}
// })