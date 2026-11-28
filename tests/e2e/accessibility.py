"""Targeted Chromium checks, not full conformance."""
import json,pathlib,subprocess,threading,functools,http.server
from playwright.sync_api import sync_playwright
ROOT=pathlib.Path(__file__).resolve().parents[2]
subprocess.run(['node',str(ROOT/'scripts/build.cjs')],check=True)
server=http.server.ThreadingHTTPServer(('127.0.0.1',0),functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)))
threading.Thread(target=server.serve_forever,daemon=True).start()
results=[]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch()
  for entry in ['web/','dist/index.html']:
   page=browser.new_page(viewport={'width':1280,'height':900})
   errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   page.goto(f'http://127.0.0.1:{server.server_port}/'+entry)
   page.keyboard.press('Tab');assert page.locator('.skip').evaluate('(e)=>e===document.activeElement')
   page.keyboard.press('Enter');assert page.locator('#workspace').evaluate('(e)=>e===document.activeElement')
   checks=1;scanned=0;minimum=100
   theme=page.get_by_role('button',name='Light theme',exact=True)
   for light in [False,True]:
    if light:theme.click()
    assert theme.get_attribute('aria-pressed')==str(light).lower()
    ratios=page.evaluate("""()=>{
     const s=getComputedStyle(document.documentElement),get=n=>s.getPropertyValue(n).trim();
     const lum=c=>{const a=c.match(/[0-9a-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*a[0]+.7152*a[1]+.0722*a[2];};
     return [['--text','--panel'],['--muted','--panel'],['--cyan','--panel'],['--text','--field'],['--note-text','--note'],['--warn-text','--warn-bg'],['--graph-text','--instrument-surface']].map(([a,b])=>{const x=lum(get(a)),y=lum(get(b));return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);});
    }""")
    assert min(ratios)>=4.5,ratios
    minimum=min(minimum,min(ratios));checks+=1
    for name in ['dashboard','analyze','filter','math','academy']:
     page.locator(f'[data-nav={name}]').focus();page.keyboard.press('Enter')
     assert page.locator(f'[data-nav={name}]').get_attribute('aria-current')=='page'
     assert page.locator('#workspace').evaluate('(e)=>e===document.activeElement')
     assert page.locator('#workspace').get_attribute('aria-label').startswith('Workspace: ')
     unnamed=page.evaluate("""()=>[...document.querySelectorAll('input,select,textarea,button,canvas[role=img]')].filter(e=>e.getClientRects().length&&!e.hidden).filter(e=>!(e.getAttribute('aria-label')||e.getAttribute('aria-labelledby')||e.labels?.length||e.tagName==='BUTTON'&&e.textContent.trim())).map(e=>e.id||e.tagName)""")
     assert not unnamed,(name,unnamed)
     scanned+=page.evaluate("()=>[...document.querySelectorAll('input,select,textarea,button,canvas[role=img]')].filter(e=>e.getClientRects().length&&!e.hidden).length")
     checks+=1
   page.locator('[data-nav=analyze]').click()
   summary=page.locator('.data-disclosure summary');summary.focus();page.keyboard.press('Enter')
   assert page.locator('.data-disclosure').get_attribute('open') is not None
   assert page.get_by_role('table',name='Selected sample and frequency bin').is_visible()
   page.wait_for_function("document.getElementById('binIn').textContent!=='—'")
   assert 'solid' in page.locator('#module-analyze .legend').first.inner_text()
   checks+=1
   page.locator('[data-nav=academy]').click();page.locator('#labCheck').click()
   assert page.locator('#labAnswer').get_attribute('aria-invalid')=='true'
   page.locator('#labAnswer').fill('250');assert page.locator('#labAnswer').get_attribute('aria-invalid') is None
   checks+=1
   page.set_viewport_size({'width':320,'height':800})
   for name in ['dashboard','analyze','filter','math','academy']:
    page.locator(f'[data-nav={name}]').click();page.wait_for_timeout(80)
    assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),name
   checks+=1
   assert not errors,errors
   results.append(dict(entry=entry,check_groups=checks,visible_control_observations=scanned,min_tested_token_contrast=minimum,uncaught_js_errors=len(errors)))
   page.screenshot(path=str(ROOT/'dist'/('accessibility-modular.png' if entry=='web/' else 'accessibility-portable.png')),full_page=True)
   page.close()
  browser.close()
 report=dict(scope='Targeted DOM semantics, keyboard, selected token contrast and 320px reflow; not screen reader or full WCAG audit',results=results)
 print(json.dumps(report,indent=2))
 (ROOT/'dist'/'accessibility-report.json').write_text(json.dumps(report,indent=2)+'\n')
finally:
 server.shutdown();server.server_close()
