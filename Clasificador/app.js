import { accounts } from './accounts.js';
const search = document.querySelector('#search');
const rowContainer = document.querySelector('#account-rows');
const tableWrap = document.querySelector('#table-wrap');
const empty = document.querySelector('#empty');
const resultCount = document.querySelector('#result-count');
const filterButtons = [...document.querySelectorAll('.filter')];
let selectedNature = 'Todas';
const expandedGroups = new Set();

const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const removeColumnLabel = value => String(value).replace(/(?:Categor[ií]a|Naturaleza)\s*:\s*/gi, '').trim();
const mixedNatureCodes = new Set(['188*099','196*099','613','614','615','696','697','698','699','999']);
const prepared = accounts.map(([rawCode, rawDescription, rawNature]) => {
  const code = removeColumnLabel(rawCode);
  const nature = mixedNatureCodes.has(code) ? 'Mixta' : removeColumnLabel(rawNature);
  const description = String(rawDescription).trim();
  const [account, ...subParts] = code.split('*');
  return {code, account, subaccount: subParts.join('*'), description, nature};
}).filter(item => /\d/.test(item.account) && ['Deudora','Acreedora','Mixta'].includes(item.nature));

const roots = prepared.filter(item => item.code === item.account);
const groups = new Map();
for (const root of roots) {
  const key = 'desc:' + normalize(root.description);
  if (!groups.has(key)) groups.set(key, {key, description:root.description, roots:[], rootCodes:new Set(), allItems:[]});
  const group = groups.get(key);
  group.roots.push(root);
  group.rootCodes.add(root.account);
  group.allItems.push(root);
}
for (const group of groups.values()) {
  for (const item of prepared) {
    if (group.rootCodes.has(item.account) && item.code !== item.account) group.allItems.push(item);
  }
}
// Keep account families that have subaccounts but no separately listed main-account row.
const rootedCodes = new Set(roots.map(item => item.account));
for (const account of new Set(prepared.map(item => item.account))) {
  if (rootedCodes.has(account)) continue;
  const allItems = prepared.filter(item => item.account === account);
  const key = 'orphan:' + account;
  groups.set(key, {key, description:'Subcuentas agrupadas', roots:[], rootCodes:new Set([account]), allItems});
}
const sortedGroups = [...groups.values()].map(group => {
  group.roots.sort((a,b) => a.code.localeCompare(b.code, 'es', {numeric:true}));
  group.allItems.sort((a,b) => a.code.localeCompare(b.code, 'es', {numeric:true}));
  return group;
}).sort((a,b) => firstGroupCode(a).localeCompare(firstGroupCode(b), 'es', {numeric:true}));
function firstGroupCode(group) { return group.roots[0]?.account || [...group.rootCodes][0] || ''; }
function formatCodes(codes) {
  const nums = [...new Set(codes)].map(Number).filter(Number.isFinite).sort((a,b) => a-b);
  const parts=[];
  for (let i=0;i<nums.length;) {
    let end=i;
    while (end+1<nums.length && nums[end+1]===nums[end]+1) end++;
    parts.push(end>i ? nums[i]+'-'+nums[end] : String(nums[i]));
    i=end+1;
  }
  return parts.join(', ');
}
function groupCount(nature) {
  return sortedGroups.filter(group => group.allItems.some(item => nature === 'Todas' || item.nature === nature)).length;
}
document.querySelector('#all-count').textContent = groupCount('Todas');
document.querySelector('#debit-count').textContent = groupCount('Deudora');
document.querySelector('#credit-count').textContent = groupCount('Acreedora');
document.querySelector('#mixed-count').textContent = groupCount('Mixta');
function naturePill(nature) {
  if (!nature) return '';
  const tone = nature === 'Acreedora' ? 'credit' : nature === 'Mixta' ? 'mixed' : 'debit';
  return '<span class="nature-pill ' + tone + '">' + escapeHtml(nature) + '</span>';
}
function render() {
  const term = normalize(search.value);
  const groupsToShow = [];
  for (const group of sortedGroups) {
    const natureMatches = item => selectedNature === 'Todas' || item.nature === selectedNature;
    const termMatches = item => {
      const searchable = normalize([item.code, item.account, item.subaccount, item.description, item.nature].join(' '));
      return !term || searchable.includes(term);
    };
    const matching = group.allItems.filter(item => natureMatches(item) && termMatches(item));
    if (matching.length) {
      const rootHits = new Set(group.roots.filter(root => natureMatches(root) && termMatches(root)).map(root => root.account));
      const children = group.allItems.filter(item => item.code !== item.account && natureMatches(item) && (termMatches(item) || rootHits.has(item.account)));
      groupsToShow.push({group, matching, children, rootHits});
    }
  }
  resultCount.textContent = groupsToShow.length;
  rowContainer.innerHTML = groupsToShow.map(({group, matching, children, rootHits}) => {
    const rootCodes = group.roots.map(item => item.account);
    const hasChildren = children.length > 0;
    const isOpen = expandedGroups.has(group.key) || (term && children.some(item => !rootHits.has(item.account)));
    const matchedRootCodes = new Set(matching.filter(item => item.code === item.account).map(item => item.account));
    const displayCodes = (term || selectedNature !== 'Todas')
      ? [...new Set(matching.map(item => item.account))]
      : rootCodes;
    const codeLabel = group.roots.length ? formatCodes(displayCodes.length ? displayCodes : rootCodes) : firstGroupCode(group);
    const rootNatureSet = new Set(matching.filter(item => item.code === item.account).map(item => item.nature));
    const groupNature = rootNatureSet.size === 1 ? [...rootNatureSet][0] : '';
    const toggle = hasChildren
      ? '<button class="group-toggle" type="button" data-toggle-group="' + escapeHtml(group.key) + '" aria-expanded="' + Boolean(isOpen) + '" aria-label="' + (isOpen ? 'Ocultar' : 'Mostrar') + ' subcuentas de ' + escapeHtml(codeLabel) + '"><span class="toggle-chevron" aria-hidden="true"></span></button>'
      : '<span class="toggle-spacer" aria-hidden="true"></span>';
    const contextual = matchedRootCodes.size === 0 ? ' contextual' : '';
    let html = '<tr class="group-row' + contextual + '"><td class="code-cell">' + toggle + escapeHtml(codeLabel) + '</td><td class="subaccount-cell">—</td><td class="description-cell">' + escapeHtml(group.description) + (hasChildren ? '<span class="child-count">' + children.length + '</span>' : '') + '</td><td>' + naturePill(groupNature) + '</td></tr>';
    if (isOpen) html += children.map(item => '<tr class="child-row"><td></td><td class="subaccount-cell">' + escapeHtml(item.code) + '</td><td class="description-cell">' + escapeHtml(item.description) + '</td><td>' + naturePill(item.nature) + '</td></tr>').join('');
    return html;
  }).join('');
  empty.hidden = groupsToShow.length !== 0;
  tableWrap.hidden = groupsToShow.length === 0;
}
search.addEventListener('input', render);
rowContainer.addEventListener('click', event => {
  const toggle = event.target.closest('[data-toggle-group]');
  if (!toggle) return;
  const key = toggle.dataset.toggleGroup;
  if (expandedGroups.has(key)) expandedGroups.delete(key);
  else expandedGroups.add(key);
  render();
});
filterButtons.forEach(button => button.addEventListener('click', () => {
  selectedNature = button.dataset.nature;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  render();
}));
document.addEventListener('keydown', event => {
  if (event.key === '/' && !['INPUT','TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); search.focus(); }
  if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; render(); search.blur(); }
});
render();

const optionsButton = document.querySelector('#options-button');
const optionsDialog = document.querySelector('#options-dialog');
const entityName = document.querySelector('#entity-name');
const entityInput = document.querySelector('#entity-input');
const fallbackEntityName = 'NOEL & HENRY';
let savedEntityName = fallbackEntityName;
try { savedEntityName = localStorage.getItem('accountEntityName') || fallbackEntityName; } catch {}
entityName.textContent = savedEntityName;
entityInput.value = savedEntityName;
optionsButton.addEventListener('click', () => {
  entityInput.value = entityName.textContent;
  optionsDialog.showModal();
  entityInput.focus();
  entityInput.select();
});
document.querySelector('#close-options').addEventListener('click', () => optionsDialog.close());
document.querySelector('#cancel-options').addEventListener('click', () => optionsDialog.close());
document.querySelector('#save-options').addEventListener('click', () => {
  const value = entityInput.value.trim();
  if (!value) { entityInput.focus(); return; }
  entityName.textContent = value;
  try { localStorage.setItem('accountEntityName', value); } catch {}
  optionsDialog.close();
});
optionsDialog.addEventListener('click', event => {
  if (event.target === optionsDialog) optionsDialog.close();
});
