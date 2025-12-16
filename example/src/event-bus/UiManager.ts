import type { IEventBus } from './EventBus';
import './WebcomponentModal';

export class UiManager {
  private static _instance: UiManager | null = null;

  static getInstance(): UiManager {
    if (!UiManager._instance) {
      UiManager._instance = new UiManager();
    }
    return UiManager._instance;
  }

  async mount(): Promise<IEventBus> {
    const approveModal = document.createElement(
      'webcomponent-modal'
    ) as HTMLElement & { getEventBus: () => Promise<IEventBus> };

    document.body.appendChild(approveModal);
    return approveModal.getEventBus();
  }

  unmount(): void {
    const approveModal = document.querySelector('webcomponent-modal');
    if (approveModal) {
      approveModal.remove();
    }
  }
}
