// Public data bridge. Existing accounts/payments remain on the original backend.
const headers={
 'Content-Type':'application/json; charset=utf-8',
 'Cache-Control':'no-store',
 'Netlify-CDN-Cache-Control':'no-store',
 'CDN-Cache-Control':'no-store',
 'Pragma':'no-cache'
};
const json=(statusCode,value)=>({statusCode,headers,body:JSON.stringify(value)});

exports.handler=async event=>{
 const method=event.httpMethod||'GET';
 if(!['GET','HEAD'].includes(method))return json(409,{error:'Accountwijzigingen, betalingen en claims gebruiken de bestaande Amsterdam-website. Deze publicatie is een ontwerpvoorbeeld.'});
 const route=event.queryStringParameters?.__amrp_path;
 if(!route||!/^[-a-zA-Z0-9_./]+$/.test(route)||route.split('/').some(part=>part==='.'||part==='..'))return json(400,{error:'Ongeldig API-pad.'});
 const target=new URL('/api/'+route,'https://amsterdamrp.nl');
 for(const [key,value]of Object.entries(event.queryStringParameters||{}))if(key!=='__amrp_path'&&value!==null)target.searchParams.set(key,value);
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),8000);
 try{
  const response=await fetch(target,{method,headers:{Accept:'application/json','Cache-Control':'no-cache'},cache:'no-store',redirect:'manual',signal:controller.signal});
  if(response.status>=300&&response.status<400){const location=response.headers.get('location');return location?{statusCode:response.status,headers:{...headers,Location:new URL(location,target).href},body:''}:json(502,{error:'Ongeldige backendredirect.'});}
  if(method==='HEAD')return {statusCode:response.status,headers,body:''};
  if(!response.headers.get('content-type')?.includes('application/json'))return json(502,{error:'De bestaande backend gaf geen JSON terug.'});
  return {statusCode:response.status,headers,body:JSON.stringify(await response.json())};
 }catch{return json(502,{error:'De bestaande Amsterdam-backend is tijdelijk niet bereikbaar.',live:false,status:'unknown',updatedAt:Date.now()});}
 finally{clearTimeout(timeout);}
};
