import { EventBus, type IEventBus } from '../EventBus';
import { ApproveEventsEnum } from './approveModal.types';
import { createApproveTemplate } from '../../common/createApproveTemplate';

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
