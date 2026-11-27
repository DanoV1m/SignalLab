from playwright.sync_api import sync_playwright
from pathlib import Path
import json,time,statistics
import os, subprocess, argparse, threading, wave, io, math, struct
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
parser=argparse.ArgumentParser()
parser.add_argument("--hosted",action="store_true",help="Test a real localhost origin (required in CI)")
parser.add_argument("--modular",action="store_true",help="Serve modular source")
args=parser.parse_args()
if args.modular and not args.hosted: parser.error("--modular requires --hosted")
root=Path(__file__).resolve().parents[2]
build=root/'dist'/'index.html'
build.parent.mkdir(exist_ok=True)
subprocess.run(['node',str(root/'scripts'/'build.cjs'),str(build)],check=True)
html=build.read_text()
server=None
if args.hosted:
 server=ThreadingHTTPServer(("127.0.0.1",0),partial(SimpleHTTPRequestHandler,directory=str(root if args.modular else build.parent)))
 threading.Thread(target=server.serve_forever,daemon=True).start()
 url=f"http://127.0.0.1:{server.server_port}/" + ("web/" if args.modular else "")
with sync_playwright() as p:
 b=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or None,args=['--no-sandbox','--disable-dev-shm-usage','--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream'])
 c=b.new_context(viewport={'width':1440,'height':1000},accept_downloads=True,permissions=['microphone']); page=c.new_page(); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
 if args.hosted: page.goto(url,wait_until="load")
 else: page.set_content(html)
 page.wait_for_timeout(200)
 assert page.locator('#module-dashboard').is_visible(); assert page.locator('#peak').inner_text()!='—'; print('PASS dashboard metrics',flush=True)
 # Instrument wrappers prove hidden work is skipped.
 page.evaluate('''()=>{window.calls={stft:0,response:0,reconstruct:0,convolve:0};for(const [obj,name] of [[DSP,'stft'],[AdvancedDSP,'response'],[AdvancedDSP,'reconstruct'],[AdvancedDSP,'convolve']]){const old=obj[name];obj[name]=(...args)=>{calls[name]++;return old(...args)}};render()}''')
 assert page.evaluate('Object.values(calls).every(x=>x===0)'); print('PASS no hidden DSP work on dashboard',flush=True)
 page.evaluate('''()=>{window.statusMutations=0;const observer=new MutationObserver(records=>statusMutations+=records.length);observer.observe(document.getElementById("status"),{childList:true,subtree:true,characterData:true});render();render();}''')
 page.wait_for_timeout(50); assert page.evaluate('statusMutations===0'); print('PASS unchanged live status does not repeat announcements',flush=True)
 page.screenshot(path=str(build.parent/('dashboard-modular.png' if args.modular else 'dashboard-bundled.png')),full_page=True)
 page.locator('[data-nav=analyze]').click(); page.wait_for_timeout(150); assert page.locator('#time').evaluate('(c)=>c.getContext("2d").getImageData(0,0,c.width,c.height).data.some(v=>v!==0)'); page.locator('#presetChirp').click(); assert 'frames' in page.locator('#stftInfo').inner_text(); assert page.evaluate('calls.stft>0 && calls.response===0 && calls.reconstruct===0'); print('PASS analyzer and isolated STFT',flush=True)
 page.screenshot(path=str(build.parent/('analyzer-modular.png' if args.modular else 'analyzer-bundled.png')),full_page=True)
 page.locator('#themeToggle').click(); page.wait_for_timeout(100); assert page.locator('html').get_attribute('data-theme')=='light'; print('PASS light theme',flush=True)
 page.locator('[data-nav=filter]').click(); page.locator('#presetFilter').click(); assert 'stable' in page.locator('#pzInfo').inner_text(); assert page.evaluate('calls.response>0 && calls.reconstruct===0'); print('PASS filter isolation',flush=True)
 page.locator('[data-nav=math]').click(); page.wait_for_timeout(100); assert 'RMSE' in page.locator('#reconInfo').inner_text(); assert page.evaluate('calls.reconstruct>0 && calls.convolve>0'); print('PASS mathematical tools',flush=True)
 page.locator('[data-nav=academy]').focus(); page.keyboard.press('Enter'); assert page.locator('[data-nav=academy]').get_attribute('aria-current')=='page'; assert page.locator('#workspace').evaluate('(e)=>e===document.activeElement'); hint=page.locator('#labHint'); hint.focus(); page.keyboard.press('Enter'); assert hint.get_attribute('aria-expanded')=='true' and page.locator('#labHintText').is_visible(); page.keyboard.press('Enter'); assert hint.get_attribute('aria-expanded')=='false' and not page.locator('#labHintText').is_visible(); print('PASS keyboard navigation and hint disclosure',flush=True)
 page.locator('#labAnswer').fill('250'); page.locator('#labCheck').click(); assert '1 / 6' in page.locator('#labProgress').inner_text(); page.locator('#labRun').click(); assert page.locator('#labResults').is_visible();
 with page.expect_download() as d: page.locator('#labExport').click()
 assert d.value.suggested_filename.endswith('.md'); print('PASS prediction, experiment and report',flush=True)
 # Exercise local file decoding and CSV export without network access.
 page.locator('[data-nav=analyze]').click()
 wav=io.BytesIO()
 with wave.open(wav,'wb') as w:
  w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000)
  w.writeframes(b''.join(struct.pack('<h',round(12000*math.sin(2*math.pi*500*i/8000))) for i in range(8000)))
 page.locator('#n').select_option('4096'); page.wait_for_timeout(100)
 page.locator('#audioFile').set_input_files({'name':'test-tone.wav','mimeType':'audio/wav','buffer':wav.getvalue()})
 page.wait_for_function("document.getElementById('source').textContent.includes('test-tone.wav')")
 assert abs(float(page.locator('#peak').inner_text().split()[0])-500)<=float(page.locator('#resolution').inner_text().split()[0]), page.locator('#peak').inner_text()
 with page.expect_download() as csv: page.locator('#csv').click()
 assert csv.value.suggested_filename.endswith('.csv')
 assert Path(csv.value.path()).read_text().startswith('time_seconds,input,filtered')
 page.locator('#clearAudio').click(); print('PASS WAV decoding and CSV export',flush=True)
 if args.hosted:
  page.reload(wait_until='load'); assert page.locator('html').get_attribute('data-theme')=='light'
  page.locator('[data-nav=academy]').click(); assert '1 / 6' in page.locator('#labProgress').inner_text()
  print('PASS origin reload persistence',flush=True)
  page.locator('[data-nav=analyze]').click(); page.locator('#mic').click()
  page.wait_for_function("document.getElementById('source').textContent.includes('microphone')",timeout=15000)
  assert page.locator('#fs').is_disabled()
  page.locator('#mic').click(); assert page.locator('#fs').is_enabled()
  assert 'synthetic' in page.locator('#source').inner_text()
  print('PASS synthetic microphone start/stop (not physical hardware)',flush=True)
 else:
  print('SKIP reload persistence and microphone: --hosted required',flush=True)
 page.set_viewport_size({'width':390,'height':844})
 for mod in ['dashboard','analyze','filter','math','academy']:
  page.locator(f'[data-nav={mod}]').click(); page.wait_for_timeout(100); assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),mod
 print('PASS five modules at 390px',flush=True)
 assert not errors,errors; print('PASS zero uncaught JS errors',flush=True); b.close()

if server: server.shutdown()
