const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),{Readable}=require('node:stream');
const cache=new Map(),port=Number(process.env.PORT)||4300;
const designTags='<link rel="stylesheet" href="/assets/amsterdam-heerlen.css"><link rel="stylesheet" href="/assets/amsterdam-regulations.css"><link rel="stylesheet" href="/assets/amsterdam-community.css"><link rel="stylesheet" href="/assets/amsterdam-themes.css"><script defer src="/assets/amsterdam-regulations-data.js"></script><script defer src="/assets/amsterdam-heerlen.js"></script><script defer src="/assets/amsterdam-regulations.js"></script><script defer src="/assets/amsterdam-community.js"></script><script defer src="/assets/amsterdam-season-art.js"></script><script defer src="/assets/amsterdam-themes.js"></script>';
const server=http.createServer(async(req,res)=>{try{
 if(!req.url.startsWith('/')||req.url.startsWith('//')){res.writeHead(400);return res.end();}
 const pathname=new URL(req.url,'http://localhost').pathname;
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(409,{'Content-Type':'application/json'});return res.end(JSON.stringify({error:'Dit is een ontwerpvoorbeeld. Een aankoop, claim of accountwijziging moet op de bestaande website gebeuren.'}));}
 if(pathname==='/api/auth/discord/login'){res.writeHead(302,{Location:'https://amsterdamrp.nl'+req.url});return res.end();}
 if(/^\/(?:updates|vacatures)\/?$/.test(pathname)){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'});return res.end(fs.readFileSync(path.join(__dirname,'public/community.html')));}
 if(['/admin','/admin/','/admin/index.html'].includes(pathname)){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'});return res.end(fs.readFileSync(path.join(__dirname,'public/admin/index.html')));}
 if(/^\/(?:$|regels\/?$|camos\/?$|leaderboards\/?$|privacy\/?$|voorwaarden\/?$|doneren(?:\/.*)?$|product\/[^/]+\/[^/]+\/?$)/.test(pathname)){const html=fs.readFileSync(path.join(__dirname,'public/index.html'),'utf8').replace('</head>',designTags+'</head>');res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Robots-Tag':'noindex'});return res.end(html);}
 const asset=pathname.match(/^\/assets\/([a-zA-Z0-9_-]+\.(css|js))$/);if(asset){const local=path.join(__dirname,'assets',asset[1]);if(fs.existsSync(local)){res.writeHead(200,{'Content-Type':asset[2]==='css'?'text/css':'text/javascript','Cache-Control':'no-store'});return res.end(fs.readFileSync(local));}}
 res.setHeader('X-Robots-Tag','noindex');
 if(cache.has(req.url)){const item=cache.get(req.url);res.writeHead(item.status,{'Content-Type':item.type,'Cache-Control':'no-store'});return res.end(item.body);}
 const headers={Accept:req.headers.accept||'*/*'};if(req.headers.range)headers.Range=req.headers.range;
 const upstream=await fetch('https://amsterdamrp.nl'+req.url,{headers,signal:AbortSignal.timeout(pathname.endsWith('.mp4')?180000:25000),redirect:'manual'});
 if(upstream.status>=300&&upstream.status<400){res.writeHead(upstream.status,{Location:upstream.headers.get('location')});return res.end();}
 const type=upstream.headers.get('content-type')||'application/octet-stream';
 if(pathname==='/api/site/public-config'&&upstream.ok){const config=await upstream.json();res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify({...config,maintenance:false,sitePublic:true}));}
 if(type.includes('text/html')){let html=await upstream.text();html=html.replace('</head>',designTags+'</head>');res.writeHead(upstream.status,{'Content-Type':type,'Cache-Control':'no-store'});return res.end(html);}
 if(/javascript|text\/css|svg\+xml/.test(type)){const body=Buffer.from(await upstream.arrayBuffer());if(body.length<4000000)cache.set(req.url,{status:upstream.status,type,body});res.writeHead(upstream.status,{'Content-Type':type,'Cache-Control':'no-store'});return res.end(body);}
 const responseHeaders={'Content-Type':type,'Cache-Control':pathname.startsWith('/api/')?'no-store':'public,max-age=120'};for(const h of ['content-length','content-range','accept-ranges']){const v=upstream.headers.get(h);if(v)responseHeaders[h]=v;}
 res.writeHead(upstream.status,responseHeaders);if(!upstream.body)return res.end();const stream=Readable.fromWeb(upstream.body);stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
 }catch(error){if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'Voorbeeld kon deze publieke bron niet laden.'}));}});
server.listen(port,'127.0.0.1',()=>console.log('Amsterdam ontwerpvoorbeeld: http://127.0.0.1:'+port+' — alleen-lezen; bestaande Amsterdam-app en API blijven de bron.'));
