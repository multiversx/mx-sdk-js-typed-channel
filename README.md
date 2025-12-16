# @multiversx/typed-channel

Type‑safe request/response messaging over any event transport.

You define a protocol as tuples, then plug in your own `publish` / `subscribe`
functions (EventBus, BroadcastChannel, `postMessage`, etc.) and get a
type‑checked API for sending and receiving messages.

The `/example` app in this repo shows a full React + EventBus demo.

## Installation

```bash
npm install @multiversx/typed-channel
# or
pnpm add @multiversx/typed-channel
```

## Defining a protocol

In your app, you describe all request/response pairs as tuples using
`EndpointDef` and `Protocol`:

```ts
import type { EndpointDef, Protocol, RequestTypeMapOf } from '@multiversx/typed-channel';

type LoginEndpoint = EndpointDef<
  'LOGIN_REQUEST',
  string,
  'LOGIN_RESPONSE',
  boolean
>;

export type AppProtocol = readonly [LoginEndpoint] & Protocol;

export const requestResponseMap: RequestTypeMapOf<AppProtocol> = {
  LOGIN_REQUEST: 'LOGIN_RESPONSE',
} as const;
```

This gives you:

- a strongly‑typed **request payload map**
- a **response type map** from each request
- a **response payload map** keyed by response type

## Wiring a transport (EventBus example)

You can use any pub/sub style transport as long as you can:

- publish an event with a payload
- subscribe to an event and get an unsubscribe function

```ts
type EventCallback = (payload: unknown) => void;

export interface IEventBus {
  publish<T>(type: string, payload: T): void;
  subscribe(type: string, callback: EventCallback): () => void;
}
```

Using the `TypedChannel` class from this library:

```ts
import { TypedChannel } from '@multiversx/typed-channel';
import type { AppProtocol } from './protocol';
import { requestResponseMap } from './protocol';
import type { IEventBus } from './EventBus';

const eventBus: IEventBus = /* your implementation */;

const channel = new TypedChannel<AppProtocol>(
  (type, data) => eventBus.publish(type as string, data),
  (event, callback) => eventBus.subscribe(event, callback),
  requestResponseMap
);
```

## Sending a typed request

`sendMessage` is fully typed from your protocol definition:

```ts
const response = await channel.sendMessage({
  type: 'LOGIN_REQUEST',
  payload: 'TEST_USER',
  validate: async (payload) => typeof payload === 'boolean',
});

// response.type    -> 'LOGIN_RESPONSE'
// response.payload -> boolean
```

If `type` or `payload` don't match your protocol, TypeScript will error at
compile time.

## Cross‑tab `TypedChannel` over `window.postMessage`

This shows the **simplest possible** setup to use `TypedChannel` between:
- a **parent tab** (the one that calls `window.open`)
- a **child tab** (the one that gets opened)

All transport is done with `window.postMessage`; `TypedChannel` only cares about:
- how to **send** a message
- how to **subscribe** to messages

---

## 1. Define a tiny protocol

Put this somewhere shared (or duplicate it in both tabs for the demo):

```ts
// protocol.ts
export enum CrossTabEvents {
  LOGIN_REQUEST = 'LOGIN_REQUEST',
  LOGIN_RESPONSE = 'LOGIN_RESPONSE',
}

export type CrossTabProtocol = {
  [CrossTabEvents.LOGIN_REQUEST]: {
    request: { subtitle: string };
    response: boolean;
  };
};

export const requestResponseMap = {
  [CrossTabEvents.LOGIN_REQUEST]: CrossTabEvents.LOGIN_RESPONSE,
} as const;
```

---

## 2. Parent tab: open child and create `TypedChannel`

```ts
// parent.ts
import { TypedChannel } from '@multiversx/typed-channel';
import {
  CrossTabEvents,
  CrossTabProtocol,
  requestResponseMap,
} from './protocol';

const CHILD_URL = 'https://your-app.example.com/child';
const CHILD_ORIGIN = new URL(CHILD_URL).origin;

let childWindow: Window | null = null;

export function openChildTab() {
  childWindow = window.open(CHILD_URL, '_blank') ?? null;
}

function publish(type: string, payload: unknown) {
  if (!childWindow || childWindow.closed) return;
  childWindow.postMessage({ type, payload }, CHILD_ORIGIN);
}

function subscribe(
  type: string,
  callback: (payload: unknown) => void,
): () => void {
  const handler = (event: MessageEvent) => {
    if (event.origin !== CHILD_ORIGIN) return;
    if (childWindow && event.source !== childWindow) return;

    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== type) return;

    callback(data.payload);
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}

const channel = new TypedChannel<CrossTabProtocol>(
  publish,
  subscribe,
  requestResponseMap,
);

export async function askChildForLogin(): Promise<boolean> {
  const response = await channel.sendMessage({
    type: CrossTabEvents.LOGIN_REQUEST,
    payload: { subtitle: 'Please approve login in child tab' },
  });

  return response.payload;
}
```

Usage in the parent:

```ts
openChildTab();
const ok = await askChildForLogin();
console.log('Child answered:', ok);
```

---

## 3. Child tab: create a matching `TypedChannel`

```ts
// child.ts
import { TypedChannel } from '@multiversx/typed-channel';
import {
  CrossTabEvents,
  CrossTabProtocol,
  requestResponseMap,
} from './protocol';

const PARENT_ORIGIN = 'https://your-app.example.com'; // expected opener origin

function publish(type: string, payload: unknown) {
  if (!window.opener) return;
  window.opener.postMessage({ type, payload }, PARENT_ORIGIN);
}

function subscribe(
  type: string,
  callback: (payload: unknown) => void,
): () => void {
  const handler = (event: MessageEvent) => {
    if (event.origin !== PARENT_ORIGIN) return;
    if (window.opener && event.source !== window.opener) return;

    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.type !== type) return;

    callback(data.payload);
  };

  window.addEventListener('message', handler);
  return () => window.removeEventListener('message', handler);
}

const channel = new TypedChannel<CrossTabProtocol>(
  publish,
  subscribe,
  requestResponseMap,
);
```

Now you just answer requests. For the simplest case, approve everything:

```ts
// somewhere in child startup
channel.onRequest(CrossTabEvents.LOGIN_REQUEST, async (req) => {
  console.log('Child received request with subtitle:', req.payload.subtitle);
  // here you could show UI and wait for user click
  return true; // or false
});
```

---

## 4. Key points

- **TypedChannel does not care** that this is cross‑tab; it only needs:
  - a `publish(type, payload)` that uses `postMessage`
  - a `subscribe(type, callback)` that listens on `window.message`
- Always validate:
  - **`event.origin`** (must match expected origin)
  - optionally **`event.source`** (must be the expected window)
- Once the transport functions are wired, using `TypedChannel` is just:
  - `channel.sendMessage({ type, payload })` in the parent
  - `channel.onRequest(type, handler)` in the child.

## Example app

This repo includes a small example React app that wires `TypedChannel` to an
in‑memory EventBus and drives an approval modal UI:

- Source: `example/src/**`
- Entry: `example/src/main.tsx`

To run it locally:

```bash
cd example
pnpm install
pnpm dev
```

Then open the printed `localhost` URL in your browser.


