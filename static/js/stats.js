// static/js/stats.js
import { updateDashboardTable } from './datatable.js';
import { formatBytesBinary, formatBytesMBGB } from './utils.js';

export function connectStats(table, onFirstStats) {
  const socket = io();
  let first = true;

  socket.on('stats', rows => {
    updateDashboardTable(table, rows);
    if (first && onFirstStats) {
      first = false;
      onFirstStats();
    }
  });

  socket.on('summary', s => {
    $('#cpuVal').text(s.cpu_pct_total.toFixed(2) + '%');
    $('#cpuMax').text(`/ ${s.cpu_pct_max}% (${s.cpus} CPUs)`);

    // Mémoire containers : MB/GB base 10
    $('#memVal').text(formatBytesMBGB(s.mem_used));
    // Limite Docker : GiB base 2 pour correspondre à `docker info`
    $('#memMax').text(`/ ${formatBytesBinary(s.mem_total)}`);
  });
}
