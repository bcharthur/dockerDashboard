import { formatBytesMBGB } from './utils.js';

const parentMap = new Map();          // project → DataTables row()
function projectOf(name) {
  const p = name.split('-');
  return p.length >= 3 ? p.slice(0, -2).join('-') : name;
}
function tNum(x, d=1) { return x.toFixed(d) + ' %'; }
function serviceRow(c) {
  return `<tr data-svc="${c.name}">
     <td>${c.name}</td>
     <td class="cpu">${tNum(c.cpu_pct)}</td>
     <td class="ramp">${tNum(c.mem_pct)}</td>
     <td class="ram">${formatBytesMBGB(c.mem_used)} / ${formatBytesMBGB(c.mem_lim)}</td>
     <td class="rd">${c.rd_mb.toFixed(1)}</td>
     <td class="wr">${c.wr_mb.toFixed(1)}</td>
   </tr>`;
}

/* ─── Création ─── */
export function createDashboardTable() {
  const dt = $('#contTable').DataTable({
    columns: [
      { className:'details-control', orderable:false, data:null, defaultContent:'' },
      { title:'Nom',  data:'name' },
      { title:'CPU %',data:'cpu'  },
      { title:'RAM %',data:'ramp' },
      { title:'RAM',  data:'ram'  },
      { title:'Read MB', data:'rd'},
      { title:'Write MB',data:'wr'}
    ],
    order:[]
  });

  $('#contTable tbody').on('click','td.details-control',function(){
    const tr=$(this).closest('tr'); const row=dt.row(tr);
    if(row.child.isShown()){ row.child.hide(); tr.removeClass('shown'); }
    else { row.child.show(); tr.addClass('shown'); }
  });
  return dt;
}

/* ─── Mise à jour ─── */
export function updateDashboardTable(table, raw) {
  /* Regroupement projects */
  const groups={};
  raw.forEach(r=>(groups[projectOf(r.name)]??=[]).push(r));

  /* Màj ou création parents */
  Object.entries(groups).forEach(([proj,list])=>{
    const cpu=list.reduce((a,c)=>a+c.cpu_pct,0);
    const mem=list.reduce((a,c)=>a+c.mem_used,0);
    const lim=list[0].mem_lim||1;

    const parentData={
      name:proj,
      cpu: tNum(cpu),
      ramp:tNum(mem/lim*100),
      ram: `${formatBytesMBGB(mem)} / ${formatBytesMBGB(lim)}`,
      rd:'',wr:''
    };

    if(parentMap.has(proj)){               // déjà présent → update
      const row=parentMap.get(proj);
      row.data(parentData);
      if(row.child.isShown()){
        // maj tbody service par service
        list.forEach(c=>{
          const tr=row.child().find(`tr[data-svc="${c.name}"]`);
          if(tr.length){
            tr.find('.cpu').text(tNum(c.cpu_pct));
            tr.find('.ramp').text(tNum(c.mem_pct));
            tr.find('.ram').text(`${formatBytesMBGB(c.mem_used)} / ${formatBytesMBGB(c.mem_lim)}`);
            tr.find('.rd').text(c.rd_mb.toFixed(1));
            tr.find('.wr').text(c.wr_mb.toFixed(1));
          }
        });
      }
    }else{                                 // nouveau projet
      const row=table.row.add(parentData).row();
      row.node().id=`row-${proj}`;
      const childHTML=
       `<table class="table table-sm mb-0">
          <thead class="thead-light">
            <tr><th>Service</th><th>CPU %</th><th>RAM %</th><th>RAM</th><th>Read MB</th><th>Write MB</th></tr>
          </thead><tbody>${list.map(serviceRow).join('')}</tbody></table>`;
      row.child(childHTML).hide();
      parentMap.set(proj,row);
    }
  });

  /* Supprime parents disparus */
  [...parentMap.keys()].forEach(proj=>{
    if(!groups[proj]){
      parentMap.get(proj).remove(); parentMap.delete(proj);
    }
  });

  table.draw(false);
}
