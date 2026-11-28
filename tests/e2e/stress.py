"""Repeated synthetic browser interaction and post-GC JS heap diagnostics (Chromium only)."""
import json, pathlib, subprocess, threading, functools, http.server, time
from urllib.parse import urlparse
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2]
subprocess.run(['node',str(ROOT/'scripts/build.cjs')],check=True)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  page=browser.new_page(viewport={'width':1280,'height':900})
  errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  external=[];page.on('request',lambda r:external.append(r.url) if urlparse(r.url).scheme in ('http','https','ws','wss') and urlparse(r.url).hostname!='127.0.0.1' else None)
  page.goto(f'http://127.0.0.1:{server.server_port}/')
  cdp=page.context.new_cdp_session(page)
  snapshots=[];timings=[]
  def snapshot(cycle):
   # Normalize source and controls before each diagnostic sample.
   page.locator('[data-nav=dashboard]').click(); page.locator('#reset').click()
   page.evaluate('()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
   cdp.send('HeapProfiler.collectGarbage')
   heap=cdp.send('Runtime.getHeapUsage')
   dom=cdp.send('Memory.getDOMCounters')
   snapshots.append(dict(cycle=cycle,js_heap_used_bytes=heap['usedSize'],js_heap_total_bytes=heap['totalSize'],documents=dom['documents'],nodes=dom['nodes'],listeners=dom['jsEventListeners']))
  def cycle(i):
   start=time.perf_counter()
   page.evaluate("""i=>{set({...defaults,n:4096,fs:16000,freq:125*(1+i%8),amp2:0,noise:0,filter:i%2?'low':'none',cutoff:1200,window:['rect','hann','hamming','blackman'][i%4],stftSize:256});}""",i)
   for module in ['analyze','filter','math','academy','dashboard']:
    page.locator(f'[data-nav={module}]').click()
    page.wait_for_function(f"!document.getElementById('module-{module}').hidden")
    page.evaluate("()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))")
    if module=='analyze':
     assert page.locator('#peak').inner_text()!='—'
     assert 'frames' in page.locator('#stftInfo').inner_text()
    elif module=='filter':
     page.locator('#firTaps').select_option(['15','31','63','127'][i%4])
     assert 'taps' in page.locator('#firInfo').inner_text()
    elif module=='math':
     page.locator('#keep').fill(str(4+i%12))
     page.wait_for_function(f"document.getElementById('keepOut').textContent.startsWith('{4+i%12} /')")
     assert 'RMSE' in page.locator('#reconInfo').inner_text()
   assert page.evaluate('last.x.length===4096 && last.y.every(Number.isFinite)')
   assert not errors,errors
   timings.append((time.perf_counter()-start)*1000)
  for i in range(3): cycle(i)
  timings.clear();snapshot(0)
  for i in range(120):
   cycle(i+3)
   if (i+1)%20==0:snapshot(i+1)
  assert not errors,errors
  assert not external,external
  report=dict(browser=browser.version,cycles=120,workspace_visits=600,record_samples=4096,elapsed_ms=sum(timings),snapshots=snapshots,uncaught_js_errors=len(errors),external_http_requests=len(external),scope='Chromium synthetic UI cycles; CDP post-GC JS heap and DOM counters after normalized reset; excludes GPU/native memory and physical audio')
  print(json.dumps(report,indent=2))
  (ROOT/'dist'/'browser-stress.json').write_text(json.dumps(report,indent=2)+'\n')
  page.screenshot(path=str(ROOT/'dist'/'stress-dashboard.png'),full_page=True)
  browser.close()
finally:
 server.shutdown();server.server_close()
