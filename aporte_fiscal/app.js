const form = document.querySelector('#paymentForm');
const $ = (name) => form.elements.namedItem(name);
const clean = (value) => String(value ?? '').trim();
const esc = (value) => clean(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const money = (value) => { const n=Number(value); return Number.isFinite(n)?new Intl.NumberFormat('es-CU',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n):'0,00'; };
const dateValue = (value) => { if(!value)return '—'; const [y,m,d]=value.split('-'); return d&&m&&y?[d,m,y].join('/') : value; };
const typeLabel = (value) => ({'0':'0 · Pago voluntario','1':'1 · Aplazamiento','2':'2 · Resolución administrativa','3':'3 · Declaración jurada rectificada'}[value]||value||'—');
const shortType = (value) => ({'0':'0 · Voluntario','1':'1 · Aplazamiento','2':'2 · Resolución','3':'3 · Rectificación'}[value]||value||'—');
const units=['cero','uno','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuno','veintidós','veintitrés','veinticuatro','veinticinco','veintiséis','veintisiete','veintiocho','veintinueve'];
function underHundred(n){if(n<30)return units[n];const tens=['','','','treinta','cuarenta','cincuenta','sesenta','setenta','ochenta','noventa'];return tens[Math.floor(n/10)]+(n%10?' y '+units[n%10]:'');}
function underThousand(n){if(n<100)return underHundred(n);if(n===100)return 'cien';const hundreds=['','','doscientos','trescientos','cuatrocientos','quinientos','seiscientos','setecientos','ochocientos','novecientos'];return hundreds[Math.floor(n/100)]+(n%100?' '+underHundred(n%100):'');}
function integerWords(n){n=Math.floor(Math.abs(n));if(n<1000)return underThousand(n);if(n<1000000){const th=Math.floor(n/1000),rest=n%1000;return(th===1?'mil':integerWords(th)+' mil')+(rest?' '+underThousand(rest):'');}if(n<1000000000){const m=Math.floor(n/1000000),rest=n%1000000;return(m===1?'un millón':integerWords(m)+' millones')+(rest?' '+integerWords(rest):'');}return String(n);}
function amountWords(value){const n=Number(value);if(!Number.isFinite(n))return '—';const centsTotal=Math.round(Math.abs(n)*100),whole=Math.floor(centsTotal/100),cents=centsTotal%100;let words=integerWords(whole).replace(/uno$/,'un');return(n<0?'menos ':'')+words+' pesos con '+String(cents).padStart(2,'0')+'/100';}
function values(){return Object.fromEntries([...form.elements].filter(el=>el.name).map(el=>[el.name,el.value]));}
const templatePicker=document.querySelector('#templatePicker');
const templateName=document.querySelector('#templateName');
const templateStatus=document.querySelector('#templateStatus');
let cloudTemplates=[];
const historyList=document.querySelector('#historyList');
const historyMessage=document.querySelector('#historyMessage');
const historyCount=document.querySelector('#historyCount');
const syncStatus=document.querySelector('#syncStatus');
let stateReady=false;
let stateTouchedBeforeLoad=false;
let currentView='form';
let stateSaveTimer=0;
function renderTemplates(selectedId=''){templatePicker.replaceChildren(new Option('Plantillas guardadas',''));cloudTemplates.forEach(item=>templatePicker.add(new Option(item.name,item.id)));if(selectedId)templatePicker.value=selectedId;}
function renderHistory(){
  historyList.replaceChildren();
  historyCount.textContent=cloudTemplates.length?String(cloudTemplates.length):'';
  if(!cloudTemplates.length){historyMessage.textContent='Aún no hay plantillas guardadas.';return;}
  historyMessage.textContent='Selecciona una plantilla para volver a usarla.';
  cloudTemplates.forEach(item=>{
    const data=item.values||{},card=document.createElement('article');card.className='history-card';
    const copy=document.createElement('div');copy.className='history-card-copy';
    const title=document.createElement('h2');title.textContent=item.name||'Aporte guardado';
    const entity=document.createElement('p');entity.className='history-entity';entity.textContent=data.entity||'Entidad sin nombre';
    const detail=document.createElement('p');detail.className='history-detail';detail.textContent=[data.tribute||'Aporte sin especificar',data.code?'Código '+data.code:'',data.currency==='MLC'?'MLC':'MN · CUP'].filter(Boolean).join(' · ');
    const saved=document.createElement('span');saved.className='history-date';saved.textContent=item.created_at?new Intl.DateTimeFormat('es-CU',{dateStyle:'medium'}).format(new Date(item.created_at)):'Guardada en la nube';
    copy.append(title,entity,detail,saved);
    const actions=document.createElement('div');actions.className='history-actions';
    const load=document.createElement('button');load.type='button';load.className='history-load';load.textContent='Usar plantilla';load.addEventListener('click',()=>{applyTemplate(item.id);showView('form');});
    const remove=document.createElement('button');remove.type='button';remove.className='history-delete';remove.textContent='Eliminar';remove.setAttribute('aria-label','Eliminar '+(item.name||'plantilla'));remove.addEventListener('click',()=>deleteTemplate(item.id));
    actions.append(load,remove);card.append(copy,actions);historyList.append(card);
  });
}
async function loadTemplates(){
  historyMessage.textContent='Cargando historial…';
  // El historial se carga a través de Nube.init
}
async function saveTemplate(){
  const data=values(),name=clean(templateName.value)||[data.entity,data.code].filter(Boolean).join(' · ')||'Aporte guardado';
  templateStatus.textContent='Guardando en la nube…';
  cloudTemplates.unshift({id:crypto.randomUUID(),name,values:data});
  renderTemplates();
  renderHistory();
  templateName.value='';
  templateStatus.textContent='Plantilla guardada en la nube.';
  Nube.guardar();
}
async function deleteTemplate(id){
  cloudTemplates=cloudTemplates.filter(item=>item.id!==id);
  renderTemplates();
  renderHistory();
  Nube.guardar();
}
function applyTemplate(id){const item=cloudTemplates.find(template=>template.id===id);if(!item)return;for(const [name,value] of Object.entries(item.values||{})){const field=$(name);if(field)field.value=value;}if(item.values.code&&!Array.from(tributePicker.options).some(option=>option.value===item.values.code)){tributePicker.add(new Option((item.values.tribute||'')+' · '+item.values.code,item.values.code));}if(item.values.code)tributePicker.value=item.values.code;templateName.value=item.name;templateStatus.textContent='Plantilla cargada · cambia el importe y vuelve a imprimir.';updatePreview();scheduleStateSave();}
function updatePreview(){const v=values(),currency=v.currency==='MLC'?'MLC':'CUP';document.querySelector('#previewNit').innerHTML=(v.nit||'').split('').slice(0,15).map(d=>'<span>'+esc(d)+'</span>').join('');document.querySelector('#previewDebitTo').textContent=v.debitTo||'—';document.querySelector('#previewTribute').textContent=v.tribute||'—';document.querySelector('#previewCode').textContent=v.code||'—';document.querySelector('#previewCurrency').textContent=v.currency==='MLC'?'MLC':'MN · CUP';document.querySelector('#previewAmount').textContent=money(v.amount)+' '+currency;document.querySelector('#previewType').textContent=shortType(v.paymentType);document.querySelector('#previewPeriod').textContent=dateValue(v.from)+' — '+dateValue(v.to);document.querySelector('#previewTaxBase').textContent=money(v.taxBase)+' '+currency;document.querySelector('#previewRate').textContent=(v.rate||'0')+'%';document.querySelector('#previewObligation').textContent=money(v.obligation)+' '+currency;document.querySelector('#previewPaymentRef').textContent=(typeLabel(v.paymentType)+(v.paymentRef?' · '+v.paymentRef:''));document.querySelector('#previewAddress').textContent=[v.residence,v.municipality,v.province].filter(Boolean).join(' · ')||'—';document.querySelector('#previewBankBranch').textContent=v.bankBranch||'—';document.querySelector('#previewBackPeriod').textContent=dateValue(v.from)+' — '+dateValue(v.to);}
function frontCopy(v,destination){const digits=(v.nit||'').split('').slice(0,15).map(d=>'<i>'+esc(d)+'</i>').join('');return '<article class="copy"><div class="copy-head"><span>CR-09</span><small>'+esc(destination)+'</small></div>'+ 
'<div class="copy-kind">DECLARACIÓN &nbsp;&nbsp; PAGO</div><div class="copy-nit"><b>NIT</b><div class="printed-digits">'+digits+'</div></div>'+ 
'<div class="print-field"><label>Debitece a:</label><strong>'+(esc(v.debitTo)||'—')+'</strong></div>'+ 
'<div class="print-field"><label>Código de cuenta</label><strong>'+(esc(v.account)||'—')+'</strong></div>'+ 
'<div class="print-row"><div class="print-field"><label>Código</label><strong>'+(esc(v.code)||'—')+'</strong></div><div class="print-field"><label>TM · 1 MLC / 2 MN</label><strong>'+(v.currency==='MLC'?'1 · MLC':'2 · MN')+'</strong></div></div>'+ 
'<div class="print-field"><label>Nombre del tributo</label><strong>'+(esc(v.tribute)||'—')+'</strong></div>'+ 
'<div class="print-field print-letters"><label>Importe a liquidar en letras</label><strong>'+esc(amountWords(v.amount))+'</strong></div>'+ 
'<div class="print-row"><div class="print-field"><label>Importe a liquidar</label><strong class="print-amount">'+money(v.amount)+' '+(v.currency==='MLC'?'MLC':'CUP')+'</strong></div><div class="print-field"><label>Tipo de pago</label><strong>'+esc(shortType(v.paymentType))+'</strong></div></div>'+ 
'<div class="print-field"><label>Período a liquidar · desde</label><strong>'+dateValue(v.from)+'</strong></div><div class="print-field"><label>Hasta</label><strong>'+dateValue(v.to)+'</strong></div>'+ 
'<div class="print-signatures"><span>Firma autorizada</span><span>Sello</span></div><div class="copy-recipient">'+esc(destination)+'</div></article>';}
function backCopy(v,destination){return '<article class="copy back-copy"><div class="copy-head"><span>CR-09</span><small>'+esc(destination)+'</small></div><div class="back-caption">INFORMACIÓN COMPLEMENTARIA</div>'+ 
'<div class="back-block"><label>Importe de la base imponible</label><strong>'+money(v.taxBase)+' '+(v.currency==='MLC'?'MLC':'CUP')+'</strong></div>'+ 
'<div class="back-grid"><div class="back-block"><label>Tipo impositivo</label><strong>'+esc(v.rate||'0')+'%</strong></div><div class="back-block"><label>Importe de la obligación</label><strong>'+money(v.obligation)+' '+(v.currency==='MLC'?'MLC':'CUP')+'</strong></div></div>'+ 
'<div class="back-block explain"><label>Tipo de pago / referencia</label><strong>'+esc(typeLabel(v.paymentType))+(v.paymentRef?' · '+esc(v.paymentRef):'')+'</strong></div>'+ 
'<div class="back-block"><label>Sucursal bancaria</label><strong>'+(esc(v.bankBranch)||'—')+'</strong></div>'+ 
'<div class="back-block address"><label>Lugar de residencia o domicilio fiscal</label><strong>'+(esc(v.residence)||'—')+'<br>'+(esc(v.municipality)||'—')+(v.province?', '+esc(v.province):'')+'</strong></div>'+ 
'<div class="back-grid"><div class="back-block"><label>Período · desde</label><strong>'+dateValue(v.from)+'</strong></div><div class="back-block"><label>Hasta</label><strong>'+dateValue(v.to)+'</strong></div></div>'+ 
'<div class="back-note">El tipo de pago se refleja en el escaque TP. Consigne el número de aprobación que ampara el pago, cuando corresponda.</div><div class="back-sign">Firma autorizada de la entidad · sello</div><div class="back-foot">'+esc(destination)+' &nbsp; · &nbsp; NIT '+esc(v.nit)+'</div><div class="copy-recipient">'+esc(destination)+'</div></article>';}
function printModel(){const v=values(),destinations=['CONTRIBUYENTE','BANCO','ONAT'];document.querySelector('#printRoot').innerHTML='<section class="print-sheet">'+destinations.map(d=>frontCopy(v,d)).join('')+'</section><section class="print-sheet">'+destinations.map(d=>backCopy(v,d)).join('')+'</section>';window.print();}
const tributePicker = document.querySelector('#tributePicker');
const tributeFilter = document.querySelector('#tributeFilter');
const codeField = $('code');
const initialCode = codeField.value;
const frequentCodes = new Set(['0114022','0114822','0201022','0400102','0400522','0400722','0510122','0510422','0520322','0610122','0610322','0740122','0810132','0820132','1100102']);
const filterNames = {popular:'Más usados',empresa:'Empresas',tcp:'TCP / personas naturales',mipyme:'MIPYMES',cooperativa:'Cooperativas',all:'Todos'};
let tributeCatalog = [];
function filterCatalog(){
  const filter = tributeFilter.value;
  if(filter==='popular') return tributeCatalog.filter((item)=>frequentCodes.has(item.codigo));
  if(filter==='empresa') return tributeCatalog.filter((item)=>item.persona==='Jurídica'||item.persona==='Ambos');
  if(filter==='tcp') return tributeCatalog.filter((item)=>item.persona==='Natural'||item.persona==='Ambos');
  if(filter==='mipyme') return tributeCatalog.filter((item)=>/mipymes?/i.test(item.tributo));
  if(filter==='cooperativa') return tributeCatalog.filter((item)=>/cooperativ/i.test(item.tributo));
  return tributeCatalog;
}
function addTributeGroup(parent,label,items,isPopular=false){
  if(!items.length)return;
  const group=document.createElement('optgroup');group.label=label;
  items.forEach((item)=>group.append(new Option((isPopular?'★ ':'')+item.tributo+' · '+item.codigo,item.codigo)));
  parent.append(group);
}
function renderTributeFilter(){
  const matches=filterCatalog();
  const currentCode=tributePicker.value||codeField.value||initialCode;
  const current=tributeCatalog.find((item)=>item.codigo===currentCode);
  tributePicker.replaceChildren(new Option('Selecciona un tributo',''));
  if(current&&!matches.some((item)=>item.codigo===current.codigo)) addTributeGroup(tributePicker,'Selección actual',[current]);
  const favorites=matches.filter((item)=>frequentCodes.has(item.codigo));
  const remaining=matches.filter((item)=>!frequentCodes.has(item.codigo));
  addTributeGroup(tributePicker,'★ Aportes frecuentes',favorites,true);
  addTributeGroup(tributePicker,filterNames[tributeFilter.value]||'Aportes',remaining);
  if(!matches.length){tributePicker.add(new Option('Sin aportes en este grupo',''));}
  tributePicker.value=currentCode;
  document.querySelector('#catalogStatus').textContent=matches.length+' códigos · '+(filterNames[tributeFilter.value]||'filtro');
}
function syncSelectedTribute(){
  const selected=tributeCatalog.find((item)=>item.codigo===tributePicker.value);
  if(selected){ $('tribute').value=selected.tributo; codeField.value=selected.codigo; }
  updatePreview();
}
async function loadTributeCatalog(){
  try{
    const response=await fetch('./tributos.json');
    if(!response.ok) throw new Error('No se pudo cargar el clasificador.');
    tributeCatalog=await response.json();
    renderTributeFilter();
    syncSelectedTribute();
  }catch(error){
    console.error(error);
    document.querySelector('#catalogStatus').textContent='No se pudo cargar el clasificador.';
  }
}
tributePicker.addEventListener('change',syncSelectedTribute);
tributeFilter.addEventListener('change',renderTributeFilter);
const previewFront = document.querySelector('#previewFront');
const previewBack = document.querySelector('#previewBack');
function setPreviewSide(side){
  const back = side === 'back';
  previewFront.hidden = back;
  previewBack.hidden = !back;
  document.querySelector('#showFront').classList.toggle('is-active',!back);
  document.querySelector('#showFront').setAttribute('aria-pressed',String(!back));
  document.querySelector('#showBack').classList.toggle('is-active',back);
  document.querySelector('#showBack').setAttribute('aria-pressed',String(back));
}
document.querySelector('#showFront').addEventListener('click',()=>setPreviewSide('front'));
document.querySelector('#showBack').addEventListener('click',()=>setPreviewSide('back'));
function calculateObligation(){
  const baseField=$('taxBase'),rateField=$('rate'),obligationField=$('obligation'),amountField=$('amount');
  if(baseField.value===''||rateField.value===''){obligationField.value='';amountField.value='';return;}
  const base=Number(baseField.value),rate=Number(rateField.value);
  const result=Number.isFinite(base)&&Number.isFinite(rate)?(Math.round((base*rate/100+Number.EPSILON)*100)/100).toFixed(2):'';
  obligationField.value=result;
  amountField.value=result;
}
async function loadAppState(){
  syncStatus.textContent='Conectando con la nube…';
  try{
    // Carga inicial manejada por Nube.init
    syncStatus.textContent='Sincronizado con la nube.';
  }catch(error){
    syncStatus.textContent='No se pudo conectar con la nube.';
    console.error(error);
  }
}
async function saveAppState(){
  if(!stateReady)return;
  Nube.guardar();
  syncStatus.textContent='Estado sincronizado en la nube.';
}
function scheduleStateSave(){
  if(!stateReady){stateTouchedBeforeLoad=true;return;}
  syncStatus.textContent='Guardando cambios en la nube…';
  clearTimeout(stateSaveTimer);
  stateSaveTimer=setTimeout(saveAppState,650);
}
function showView(view){
  const history=view==='history';
  currentView=history?'history':'form';
  document.querySelector('#formView').hidden=history;
  document.querySelector('#historyView').hidden=!history;
  document.querySelector('#formTab').classList.toggle('is-active',!history);
  document.querySelector('#formTab').setAttribute('aria-selected',String(!history));
  document.querySelector('#historyTab').classList.toggle('is-active',history);
  document.querySelector('#historyTab').setAttribute('aria-selected',String(history));
  scheduleStateSave();
}
function handleFormChange(event){if(event.target.name==='taxBase'||event.target.name==='rate')calculateObligation();else if(event.target.name==='amount')$('obligation').value=event.target.value;updatePreview();scheduleStateSave();}
form.addEventListener('input',handleFormChange);
form.addEventListener('change',handleFormChange);
document.querySelector('#saveTemplate').addEventListener('click',saveTemplate);
templatePicker.addEventListener('change',()=>applyTemplate(templatePicker.value));
document.querySelector('#formTab').addEventListener('click',()=>showView('form'));
document.querySelector('#historyTab').addEventListener('click',()=>showView('history'));
document.querySelector('#printButton').addEventListener('click',printModel);
renderTemplates();calculateObligation();updatePreview();loadTributeCatalog();loadTemplates();loadAppState();

if (typeof Nube !== 'undefined') {
  Nube.init({
    modulo: 'aporte_fiscal',
    datos: () => ({
      values: values(),
      templates: cloudTemplates
    }),
    alRecibir: (datos) => {
      if (!datos) return;
      if (datos.values) {
        for (const [name, value] of Object.entries(datos.values)) {
          const field = $(name);
          if (field) field.value = value;
        }
        updatePreview();
      }
      if (datos.templates) {
        cloudTemplates = datos.templates;
        renderTemplates();
        renderHistory();
      }
    }
  });
}

