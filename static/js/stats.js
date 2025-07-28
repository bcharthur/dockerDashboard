import { updateDashboardTable } from './datatable.js';
import { formatBytesMBGB }      from './utils.js';

export function connectStats(table) {
  const socket = io();

  socket.on('stats', rows => updateDashboardTable(table, rows));

  socket.on('summary', s => {
    $('#cpuVal').text(s.cpu_pct_total.toFixed(2) + '%');
    $('#cpuMax').text(`/ ${s.cpu_pct_max}% (${s.cpus} CPUs)`);
    $('#memVal').text(formatBytesMBGB(s.mem_used));
    $('#memMax').text(`/ ${formatBytesMBGB(s.mem_total)}`);
  });
}
