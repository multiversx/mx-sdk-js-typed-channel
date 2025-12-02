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


