const {chromium}=require('playwright');
const http=require('node:http');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
 const server=http.createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(req.url.startsWith('/comment') ? '<html><body><p class=comment>panic crisis</p></body></html>' : '<html><body><article><a href="/story">panic crisis</a> <button id="original">Original action</button></article><p>ordinary text</p></body></html>');});
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 let context;
 try {
 const extension=require('node:path').resolve(__dirname,'..');
 context=await chromium.launchPersistentContext('',{channel:'chromium',headless:true,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
 const worker=context.serviceWorkers()[0] || await context.waitForEvent('serviceworker');
 const control=await context.newPage(); await control.goto(worker.url().replace('/background.js','/options.html'));
 const update=async settings=>{const response=await control.evaluate(settings=>chrome.runtime.sendMessage({type:'saveSettings',settings}),settings);assert.equal(response.ok,true,response.error);};
 const errors=[];worker.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 const origin=`http://127.0.0.1:${server.address().port}`;
 await update({enabled:true,strictMode:false,frictionMode:false,blockedDomains:[],manipulativeKeywords:['panic','crisis'],intensity:'high'});
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.goto(origin+'/?utm_source=a&fbclid=b&keep=1');
 await page.waitForSelector('.pn-sun-block',{timeout:5000});
 assert.equal(await page.locator('article').evaluate(el=>getComputedStyle(el).display), 'none');
 assert.equal(new URL(page.url()).search,'?keep=1');
 await page.locator('.pn-sun-block button').click();
 assert.equal(await page.locator('article').evaluate(el=>getComputedStyle(el).display==='none'),false);
 await page.evaluate(()=>{document.querySelector('#original').addEventListener('click',()=>{window.originalClicked=true;});});
 // Execute the actual overlay code in the page and check that existing event handlers survive.
 await page.addScriptTag({path:extension+'/core.js'});
 await page.addScriptTag({path:extension+'/counter_measures/semantic_nuke.js'});
 await page.evaluate(()=>window.SemanticNuke.execute(20,['<img src=x onerror=alert(1)>']));
 assert.equal(await page.locator('#pn-nuke-overlay img').count(),0);
 await page.locator('#pn-bypass-nuke').click();await page.locator('#original').click();assert.equal(await page.evaluate(()=>window.originalClicked),true);
 await update({blockedDomains:['127.0.0.1'],strictMode:true,frictionMode:true,countdownSeconds:0});
 await page.goto(origin+'/blocked');await page.waitForURL('**/blocked.html?**');
 assert.equal(await page.locator('#forensic-score').textContent(),'Not measured');
 await page.waitForFunction(()=>!document.querySelector('#open-btn').disabled);
 await page.locator('#open-btn').click();await page.waitForURL(origin+'/blocked');
 await page.waitForTimeout(300);assert.equal(page.url(),origin+'/blocked');
 await page.reload();await page.waitForURL('**/blocked.html?**');
 await update({whitelistDomains:['127.0.0.1']});
 await page.goto(origin+'/allowed');await page.waitForTimeout(200);assert.equal(await page.locator('.pn-sun-block').count(),0);
 await update({whitelistDomains:[],blockedDomains:[],strictMode:false});
 await page.goto(origin+'/comment');await page.waitForSelector('.pn-sun-block');
 assert.equal(await page.locator('.comment').evaluate(el=>getComputedStyle(el).display),'none');
 await update({intensity:'low'});await page.goto(origin+'/comment');await page.waitForTimeout(200);
 assert.equal(await page.locator('.pn-sun-block').count(),0);assert.equal(await page.locator('#pn-nuke-overlay').count(),0);
 await update({intensity:'high'});
 await update({enabled:false});
 assert.equal(await worker.evaluate(async()=> (await chrome.declarativeNetRequest.getDynamicRules()).length),0);
 await page.goto(origin+'/?utm_source=retained&fbclid=retained');assert.match(page.url(),/utm_source=retained/);

 await update({enabled:true,whitelistDomains:[],blockedDomains:[],strictMode:false});
 await page.goto(origin+'/sun');await page.waitForSelector('.pn-sun-block',{timeout:5000});if(process.env.PN_SCREENSHOT) await page.screenshot({path:process.env.PN_SCREENSHOT});
 assert.deepEqual(errors,[]);
 console.log('PASS: actual MV3 rules accepted; multi-parameter stripping, sun/reveal, DOM event preservation, safe overlay text, strict override + re-block, whitelist, and master switch verified in Chromium.');
 } finally {if(context)await context.close();server.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
