import { openEventBusApproveModal } from '../event-bus/openEventBusApproveModal';

// Placeholder implementation that reuses the existing EventBus-backed modal.
// The visual design is identical; only the trigger button label differs.
export async function openBroadcastChannelApproveModal() {
  return openEventBusApproveModal();
}
