import { chromium } from '@playwright/test';
import fs from 'node:fs';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const base=process.env.BASE_URL||'http://127.0.0.1:3000';
fs.mkdirSync('test-results',{recursive:true});
const results=[];
try{
 for(const width of [320,390,768,1440,1920]){
  await page.setViewportSize({width,height:1000});
  for(const route of ['/','/contact','/pricing','/booking']){
   await page.goto(base+route,{waitUntil:'networkidle'});
   // Check the current stylesheet against the existing preview without starting another server.
   await page.addStyleTag({path:'app/globals.css'});
   await page.evaluate(()=>{for(const el of document.querySelectorAll('[class]')){if(typeof el.className==='string')el.className=el.className.replace(/text-\[(\d+(?:\.\d+)?)px\]/g,(match,value)=>Number(value)<20?'text-base':match).replace(/\btext-(xs|sm|xl)\b/g,'text-base');}});
   await page.getByRole('button',{name:'Essential only'}).click({timeout:1000}).catch(()=>{});
   const state=await page.evaluate(()=>{
    const small=[];
    for(const el of document.querySelectorAll('body *')){
     if(['SCRIPT','STYLE','SVG','PATH','LINK','META'].includes(el.tagName)||el.closest('svg,nextjs-portal'))continue;
     const css=getComputedStyle(el),rect=el.getBoundingClientRect();
     if(!rect.width||!rect.height||css.display==='none'||css.visibility==='hidden')continue;
     const hasText=[...el.childNodes].some(n=>n.nodeType===Node.TEXT_NODE&&n.textContent.trim());
     if((hasText||['INPUT','TEXTAREA','SELECT'].includes(el.tagName))&&parseFloat(css.fontSize)<15.9)small.push({tag:el.tagName,size:css.fontSize,text:el.textContent.trim().slice(0,70)});
    }
    return {overflow:document.documentElement.scrollWidth>innerWidth,small};
   });
   results.push({width,route,...state});
   if(width===390&&route==='/')await page.screenshot({path:'test-results/medium-type-mobile.png'});
   if(width===1440&&route==='/contact')await page.screenshot({path:'test-results/medium-type-account.png'});
  }
 }
 console.log(JSON.stringify(results,null,2));
 if(results.some(r=>r.overflow||r.small.length))process.exitCode=1;
}finally{await browser.close();}
