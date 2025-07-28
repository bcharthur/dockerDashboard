import { createDashboardTable } from './datatable.js';
import { connectStats }        from './stats.js';

document.addEventListener('DOMContentLoaded', () => {
  $('[data-toggle="tooltip"]').tooltip();    // ← initialise les infobulles
  const table = createDashboardTable();
  connectStats(table);
});
