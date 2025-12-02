// 1. Define your protocol as tuples
export type EndpointDef<
  ReqType extends string,
  ReqPayload,
  ResType extends string,
  ResPayload
> = [ReqType, ReqPayload, ResType, ResPayload];

// A protocol is an array/tuple of endpoints
export type Protocol = readonly EndpointDef<any, any, any, any>[];

// 2. Helpers to extract parts of the tuple
type ReqTypeOf<E extends EndpointDef<any, any, any, any>> = E[0];
type ReqPayloadOf<E extends EndpointDef<any, any, any, any>> = E[1];
type ResTypeOf<E extends EndpointDef<any, any, any, any>> = E[2];
type ResPayloadOf<E extends EndpointDef<any, any, any, any>> = E[3];

// 3. Build the maps from the protocol tuple
export type RequestPayloadMapOf<P extends Protocol> = {
  [E in P[number] as ReqTypeOf<E>]: ReqPayloadOf<E>;
};

export type RequestTypeMapOf<P extends Protocol> = {
  [E in P[number] as ReqTypeOf<E>]: ResTypeOf<E>;
};

export type ResponsePayloadMapOf<P extends Protocol> = {
  [E in P[number] as ResTypeOf<E>]: ResPayloadOf<E>;
};
