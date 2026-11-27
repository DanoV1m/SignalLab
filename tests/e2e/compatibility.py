"""Synthetic-only compatibility and render timing; no hardware or deployment."""
import argparse, json, pathlib, subprocess, threading, functools, http.server
from playwright.sync_api import sync_playwright
parser=argparse.ArgumentParser()
parser.add_argument('--browser',choices=['chromium','firefox','webkit'],required=True)
args=parser.parse_args()
root=pathlib.Path(__file__).resolve().parents[2]
subprocess.run(['node',str(root/'scripts/build.cjs')],check=True)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(root/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=getattr(p,args.browser).launch()
  page=browser.new_page(viewport={'width':1280,'height':900})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  page.goto(f'http://127.0.0.1:{server.server_port}/',wait_until='load')
  assert page.locator('#peak').inner_text()!='—'
  timings={}
  for mod in ['dashboard','analyze','filter','math','academy']:
   page.locator(f'[data-nav={mod}]').click()
   assert page.locator(f'#module-{mod}').is_visible()
   timings[mod]=page.evaluate("""() => {const times=[];for(let i=0;i<10;i++){const start=performance.now();render();times.push(performance.now()-start);}times.sort((a,b)=>a-b);return {iterations:10,median_ms:(times[4]+times[5])/2,max_ms:times[9]};}""")
  # Paired cache-cold and cache-warm timings on the same browser and runner.
  page.locator('[data-nav=math]').click()
  paired=page.evaluate("""() => {
   const cold=[],warm=[];
   for(let i=0;i<20;i++){
    session.clear();
    let t=performance.now();render();cold.push(performance.now()-t);
    t=performance.now();render();warm.push(performance.now()-t);
   }
   const stats=a=>{a.sort((x,y)=>x-y);return {iterations:a.length,median_ms:(a[9]+a[10])/2,max_ms:a[19]};};
   return {cold:stats(cold),warm:stats(warm)};
  }""")
  page.locator('[data-nav=analyze]').click();page.locator('#window').select_option('blackman');page.wait_for_timeout(150)
  assert 'frames' in page.locator('#stftInfo').inner_text()
  page.locator('[data-nav=filter]').click();page.locator('#presetFilter').click();assert 'Group delay at' in page.locator('#groupDelayInfo').inner_text()
  page.set_viewport_size({'width':390,'height':844})
  for mod in ['dashboard','analyze','filter','math','academy']:
   page.locator(f'[data-nav={mod}]').click();page.wait_for_timeout(100)
   assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),mod
  assert not errors,errors
  report={'browser':args.browser,'version':browser.version,'scope':'synthetic synchronous render calls, excludes paint and interaction latency','timings':timings,'math_cache_pair':paired}
  print(json.dumps(report,indent=2))
  (root/'dist'/f'compatibility-{args.browser}.json').write_text(json.dumps(report,indent=2))
  browser.close()
finally:
 server.shutdown();server.server_close()
