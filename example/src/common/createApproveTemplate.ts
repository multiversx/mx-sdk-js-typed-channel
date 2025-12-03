export const createApproveTemplate = (data: string) => {
  return `
      <div class="modal-overlay" role="dialog" aria-modal="true">
        <div class="modal">
          <h2 class="modal-title">Approve Modal</h2>
          <p class="modal-subtitle">${data}</p>
          <div class="modal-actions">
            <button class="modal-button modal-button-approve" type="button" id="approve-modal-approve">
              Approve
            </button>
            <button class="modal-button modal-button-reject" type="button" id="approve-modal-reject">
              Reject
            </button>
          </div>
        </div>
      </div>
    `;
};
