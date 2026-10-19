// Temporary site-wide closure. No exceptions for admin, assets or API routes.
const page=`<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Onderhoud · Amsterdam Roleplay</title><style>html{color-scheme:dark;background:#0c1420;color:#f0f5fc;font-family:Arial,sans-serif}body{margin:0;min-height:100dvh;display:grid;place-items:center;box-sizing:border-box;padding:30px;text-align:center}main{max-width:560px}small{font-size:10px;letter-spacing:3px;color:#a8bed7}h1{font-size:clamp(27px,5vw,40px);line-height:1.25;letter-spacing:-1px;margin:24px 0 20px}p{font-size:15px;line-height:1.9;color:#aebdd0;margin:0}</style></head><body><main><small>AMSTERDAM ROLEPLAY · ONDERHOUD</small><h1>De website is tijdelijk gesloten.</h1><p>We werken aan de website.<br>Kom later terug.</p></main></body></html>`;

export default function maintenance(request){
 return new Response(request.method==='HEAD'?null:page,{
  status:503,
  headers:{
   'Content-Type':'text/html; charset=utf-8',
   'Cache-Control':'no-store, max-age=0',
   'Netlify-CDN-Cache-Control':'no-store',
   'CDN-Cache-Control':'no-store',
   'Retry-After':'300',
   'X-Robots-Tag':'noindex, nofollow, noarchive',
   'X-AMRP-Maintenance':'site-wide',
   'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"
  }
 });
}
