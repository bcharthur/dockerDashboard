import { createDashboardTable } from './datatable.js';
import { connectStats }        from './stats.js';

document.addEventListener('DOMContentLoaded', () => {
  $('[data-toggle="tooltip"]').tooltip();
  const table = createDashboardTable();

  // Ferme la modal Bootstrap dès la première data reçue
  let hideLoadingModal = () => {
    const modal = document.getElementById('loadingModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('show');
      modal.classList.add('fade');
    }
  };

  connectStats(table, hideLoadingModal); // on passe la fonction à connectStats
});
