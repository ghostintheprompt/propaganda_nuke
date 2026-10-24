// Exercise the shipped code, not replacement definitions or fake cryptography.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
const path=require('node:path');
const {webcrypto}=require('node:crypto');
const core=require('../core');
function background() {
 const data={sync:{},local:{},session:{},managed:{}};let rules=[];const listeners={};
 const area=name=>({get:async key=>({[key]:structuredClone(data[name][key])}),set:async value=>Object.assign(data[name],structuredClone(value)),remove:async key=>{delete data[name][key];}});
 const chrome={storage:{...Object.fromEntries(Object.keys(data).map(name=>[name,area(name)])),onChanged:{addListener(){}}},
  declarativeNetRequest:{getDynamicRules:async()=>rules,updateDynamicRules:async change=>{rules=change.addRules;}},
  runtime:{getURL:file=>`chrome-extension://test/${file}`,onMessage:{addListener:fn=>{listeners.message=fn;}},onInstalled:{addListener(){}},onStartup:{addListener(){}}}};
 const context=vm.createContext({PNCore:core,importScripts(){},chrome,crypto:webcrypto,TextEncoder,structuredClone,console,Date,URL});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../background.js'),'utf8'),context);
 return {data,context,rules:()=>rules,message:(msg,sender={})=>new Promise(resolve=>listeners.message(msg,sender,resolve))};
}
test('settings migrate missing fields and preserve a zero countdown',()=>{
 const s=core.normalizeSettings({countdownSeconds:0});assert.equal(s.countdownSeconds,0);assert.deepEqual(s.whitelistDomains,[]);assert.equal(s.enabled,true);
});
test('literal keyword regex metacharacters cannot change or break the pattern',()=>{
 assert.equal(core.keywordScore('panic panic panicking',['panic']),2);
 assert.doesNotThrow(()=>core.keywordScore('ordinary text',['[','.*','(']));
 assert.equal(core.keywordScore('everything',['.*']),0);
});
test('domain categories and whitelist use host boundaries',()=>{
 let s=core.normalizeSettings({blockSocial:false});assert.equal(core.domainMatches('https://x.com/path',s),false);
 assert.equal(core.domainMatches('https://x.com.attacker.test',core.normalizeSettings()),false);
 s=core.normalizeSettings({whitelistDomains:['reddit.com']});assert.equal(core.domainMatches('https://old.reddit.com',s),false);
});
test('master switch removes network rules and combined redirect removes all named parameters',async()=>{
 const h=background();await h.message({type:'saveSettings',settings:{enabled:true}});
 const rule=h.rules().find(r=>r.id===1);assert.ok(rule.action.redirect.transform.queryTransform.removeParams.includes('fbclid'));
 assert.ok(rule.action.redirect.transform.queryTransform.removeParams.includes('utm_source'));
 assert.equal(h.rules().filter(r=>r.action.type==='redirect').length,1);
 await h.message({type:'saveSettings',settings:{enabled:false}});assert.equal(h.rules().length,0);
});
test('managed values override user settings without persisting policy into user preferences',async()=>{
 const h=background();h.data.managed.pn_settings={enabled:false};
 await h.message({type:'saveSettings',settings:{enabled:true}});
 assert.equal(h.data.sync.pn_settings.enabled,true);
 assert.equal((await h.message({type:'getSettings'})).settings.enabled,false);
});
test('concurrent events retain every counter increment',async()=>{
 const h=background();await Promise.all(Array.from({length:12},()=>h.message({type:'incrementStat',key:'hiddenResults',amount:2})));
 assert.equal(h.data.sync.pn_settings.stats.hiddenResults,24);
});
test('vault uses real SHA-256, retains concurrent events, and bounds retention',async()=>{
 const h=background();await Promise.all(Array.from({length:105},(_,n)=>h.message({type:'appendIncident',incident:{type:'TEST',metadata:{n}}})));
 const vault=h.data.local.forensic_vault;assert.equal(vault.length,100);
 const last=structuredClone(vault.at(-1));const checksum=last.checksum;delete last.checksum;
 const expected=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(last)))).toString('hex');
 assert.equal(checksum,expected);assert.equal(last.signature,undefined);assert.equal(last.metadata.n,104);
});
test('override rejects untrusted callers',async()=>{
 const h=background();const output=await h.message({type:'authorizeNavigation',target:'https://example.com'}, {url:'https://example.com',tab:{id:1}});
 assert.equal(output.ok,false);
});
test('override is tab-bound, target-bound, and single use',async()=>{
 const h=background();const sender={url:'chrome-extension://test/blocked.html?url=x',tab:{id:1}};
 const grant=await h.message({type:'authorizeNavigation',target:'https://example.com/?utm_source=x&a=1'},sender);assert.equal(grant.target,'https://example.com/?a=1');
 assert.equal((await h.message({type:'consumeNavigation'},{url:grant.target,tab:{id:2}})).allowed,false);
 assert.equal((await h.message({type:'consumeNavigation'},{url:'https://other.test/',tab:{id:1}})).allowed,false);
 assert.equal((await h.message({type:'consumeNavigation'},{url:grant.target,tab:{id:1}})).allowed,true);
 assert.equal((await h.message({type:'consumeNavigation'},{url:grant.target,tab:{id:1}})).allowed,false);
});
test('expired navigation grants do not bypass',async()=>{
 const h=background();h.data.session['override:1']={target:'https://example.com/',expires:Date.now()-1};
 assert.equal((await h.message({type:'consumeNavigation'},{url:'https://example.com/',tab:{id:1}})).allowed,false);
});
test('unsafe destinations are rejected',()=>{
 assert.throws(()=>core.cleanUrl('javascript:alert(1)'));
});
test('export checksum covers the complete snapshot and makes no actor attribution',async()=>{
 let blob;
 const context=vm.createContext({window:{},TextEncoder,crypto:webcrypto,Blob,Uint8Array,Date,
  URL:{createObjectURL:value=>{blob=value;return 'blob:test';},revokeObjectURL(){}},
  document:{createElement:()=>({click(){}})}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../war_room/fallout_map.js'),'utf8'),context);
 await context.window.FalloutMap.export(core.normalizeSettings());
 const output=JSON.parse(await blob.text());const checksum=output.checksum;delete output.checksum;
 const expected=Buffer.from(await webcrypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(output,null,2)))).toString('hex');
 assert.equal(checksum,expected);assert.equal(output.threat_actor_list,undefined);assert.equal(output.signature,undefined);
});
