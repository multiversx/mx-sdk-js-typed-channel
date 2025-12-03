import { EventBus, type IEventBus } from '../EventBus';
import { ApproveEventsEnum } from './approveModal.types';

const createApproveTemplate = (data: string) => {
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
export class ApproveModal extends HTMLElement {
  private readonly eventBus: IEventBus = new EventBus();
  private data: string | null = null;
  private unsubscribeData: (() => void) | null = null;

  connectedCallback() {
    this.unsubscribeData = this.eventBus.subscribe(
      ApproveEventsEnum.LOGIN_REQUEST,
      (data) => {
        this.data = typeof data === 'string' ? data : null;
        this.render();
      }
    );

    this.render();
  }

  disconnectedCallback() {
    if (this.unsubscribeData) {
      this.unsubscribeData();
      this.unsubscribeData = null;
    }
  }

  async getEventBus(): Promise<IEventBus> {
    return this.eventBus;
  }

  private render() {
    if (!this.data) {
      this.innerHTML = '';
      return;
    }

    this.innerHTML = createApproveTemplate(this.data);
    this.bindButtons();
  }

  private bindButtons() {
    const approveButton = this.querySelector<HTMLButtonElement>(
      '#approve-modal-approve'
    );
    const rejectButton = this.querySelector<HTMLButtonElement>(
      '#approve-modal-reject'
    );

    if (approveButton) {
      approveButton.onclick = () => {
        this.eventBus.publish(ApproveEventsEnum.LOGIN_RESPONSE, true);
        this.data = null;
        this.render();
      };
    }

    if (rejectButton) {
      rejectButton.onclick = () => {
        this.eventBus.publish(ApproveEventsEnum.LOGIN_RESPONSE, false);
        this.data = null;
        this.render();
      };
    }
  }
}

if (!customElements.get('approve-modal-web')) {
  customElements.define('approve-modal-web', ApproveModal);
}
