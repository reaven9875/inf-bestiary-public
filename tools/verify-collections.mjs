import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const cards=JSON.parse(fs.readFileSync(new URL('../docs/data/monsters.json',import.meta.url)));
const collections=JSON.parse(fs.readFileSync(new URL('../docs/data/collections.json',import.meta.url)));
class Element {
  constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.value='';this.className='';this.textContent='';this.open=false;}
  append(...nodes){this.children.push(...nodes);}
  replaceChildren(...nodes){this.children=nodes;}
  setAttribute(name,value){this[name]=value;}
  addEventListener(){}
}
const elements=Object.fromEntries(['category-list','catalog-status','search','tier-filter','expand-all','collapse-all'].map(id=>[id,new Element('div')]));
elements['tier-filter'].value='all';
const walk=node=>[node,...node.children.filter(x=>x instanceof Element).flatMap(walk)];
const select=selector=>walk(elements['category-list']).filter(e=>selector.split(',').some(s=>e.className.split(' ').includes(s.trim().slice(1))));
const context=vm.createContext({URL,console,window:{location:{href:'https://reaven9875.github.io/inf-bestiary-public/'}},document:{
  querySelector:s=>elements[s.slice(1)],querySelectorAll:select,
  createElement:tag=>new Element(tag),createDocumentFragment:()=>new Element('fragment'),
},fetch:async url=>({ok:true,json:async()=>url.includes('custom-catalog')?{version:1,collections:[],enemies:[]}:url.includes('collections')?collections:cards})});
await vm.runInContext(fs.readFileSync(new URL('../docs/assets/app.js',import.meta.url),'utf8'),context);
assert.equal(select('.collection-group').length,1);
assert.equal(select('.category-group').length,13);
assert.equal(select('.monster-card').length,99);
assert.equal(select('.collection-summary')[0].children[0].textContent,'規則書圖鑑');
vm.runInContext('setAllDetails(false)',context);
assert(select('.collection-group, .category-group, .monster-card').every(e=>!e.open));
vm.runInContext('setAllDetails(true)',context);
assert(select('.collection-group, .category-group, .monster-card').every(e=>e.open));
elements.search.value='森蚺';vm.runInContext('render()',context);
assert.equal(select('.monster-card').length,2);
assert.equal(select('.collection-summary')[0].children[1].textContent,'2');
elements.search.value='no-monster-matches-this';vm.runInContext('render()',context);
assert.equal(select('.monster-card').length,0);
assert.equal(select('.collection-summary')[0].children[1].textContent,'0');
console.log('PASS: rulebook contains 99 cards and 13 subcategories; filters and all-expand/collapse preserve counts');
const group='custom-11111111-1111-4111-8111-111111111111', enemy='custom-22222222-2222-4222-8222-222222222222';
context.fetch=async url=>({ok:true,json:async()=>url.includes('custom-catalog')?{version:1,collections:[{id:group,name:'測試作者',subcategories:['測試小分類']}],enemies:[{id:enemy,collectionId:group,subcategory:'測試小分類',name:'測試怪物',tier:'D',category:'一般生物',card:'```text\n測試\n```',image:''}]}:url.includes('collections')?collections:cards});
elements.search.value='';await vm.runInContext('loadCatalog()',context);
assert.equal(select('.collection-group').length,2);assert.equal(select('.category-group').length,14);assert.equal(select('.monster-card').length,100);
assert.equal(select('.collection-summary')[1].children[0].textContent,'測試作者');
elements.search.value='測試怪物';vm.runInContext('render()',context);assert.equal(select('.monster-card').length,1);
context.fetch=async url=>({ok:!url.includes('custom-catalog'),json:async()=>url.includes('collections')?collections:cards});
elements.search.value='';await vm.runInContext('loadCatalog()',context);assert.equal(select('.monster-card').length,99);assert.equal(elements['catalog-status'].dataset.error,'true');
console.log('PASS: custom hierarchy/card rendering, filtering and failure isolation preserve immutable rulebook');
