import { formatBytesMBGB } from './utils.js';

const parentMap = new Map();
const tNum = (x,d=1)=> x.toFixed(d)+' %';
const projectOf = n => (n.split('-').length>=3 ? n.split('-').slice(0,-2).join('-') : n);

/* ── ligne service ── */
function serviceRow(c){
  return `<tr data-svc="${c.name}">
    <td>${c.name}</td>
    <td class="cpu">${tNum(c.cpu_pct)}</td>
    <td class="ramp">${tNum(c.mem_pct)}</td>
    <td class="ram">${formatBytesMBGB(c.mem_used)} / ${formatBytesMBGB(c.mem_lim)}</td>
  </tr>`;
}

/* ── création DataTable ── */
export function createDashboardTable(){
  const dt = $('#contTable').DataTable({
    columns:[
      {className:'details-control',orderable:false,data:null,defaultContent:''},
      {title:'Nom',   data:'name'},
      {title:'CPU %', data:'cpu'},
      {title:'RAM %', data:'ramp'},
      {title:'RAM',   data:'ram'}
    ],
    order:[],
    language:{url:'https://cdn.datatables.net/plug-ins/1.13.8/i18n/fr-FR.json'}
  });

  $('#contTable tbody').on('click','td.details-control',function(){
    const tr=$(this).closest('tr'); const row=dt.row(tr);
    row.child.isShown() ? (row.child.hide(),tr.removeClass('shown'))
                        : (row.child.show(),tr.addClass('shown'));
  });
  return dt;
}

/* ── mise à jour ── */
export function updateDashboardTable(table, raw){
  const groups={};
  raw.forEach(r=>(groups[projectOf(r.name)]??=[]).push(r));

  Object.entries(groups).forEach(([proj,list])=>{
    const cpu=list.reduce((a,c)=>a+c.cpu_pct,0);
    const mem=list.reduce((a,c)=>a+c.mem_used,0);
    const lim=list[0].mem_lim||1;

    const parent={
      name:proj,
      cpu:tNum(cpu),
      ramp:tNum(mem/lim*100),
      ram:`${formatBytesMBGB(mem)} / ${formatBytesMBGB(lim)}`
    };

    if(parentMap.has(proj)){
      const row=parentMap.get(proj);
      row.data(parent);
      if(row.child.isShown()){
        list.forEach(c=>{
          const tr=row.child().find(`tr[data-svc="${c.name}"]`);
          if(tr.length){
            tr.find('.cpu').text(tNum(c.cpu_pct));
            tr.find('.ramp').text(tNum(c.mem_pct));
            tr.find('.ram').text(`${formatBytesMBGB(c.mem_used)} / ${formatBytesMBGB(c.mem_lim)}`);
          }
        });
      }
    }else{
      const row=table.row.add(parent).row();
      row.node().id=`row-${proj}`;
      row.child(`<table class="table table-sm mb-0">
        <thead class="thead-light">
          <tr><th>Service</th><th>CPU %</th><th>RAM %</th><th>RAM</th></tr>
        </thead><tbody>${list.map(serviceRow).join('')}</tbody></table>`).hide();
      parentMap.set(proj,row);
    }
  });

  /* retire projets disparus */
  [...parentMap.keys()].forEach(p=>{
    if(!groups[p]){ parentMap.get(p).remove(); parentMap.delete(p); }
  });

  table.draw(false);
}
