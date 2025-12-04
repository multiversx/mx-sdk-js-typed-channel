import type { EndpointDef, RequestTypeMapOf } from '../../../src/protocol';

// ---- Type-level protocol using EndpointDef ----
export enum ApproveEventsEnum {
  LOGIN_REQUEST = 'LOGIN_REQUEST',
  LOGIN_RESPONSE = 'LOGIN_RESPONSE'
}

export type ApproveProtocol = readonly [
  EndpointDef<
    ApproveEventsEnum.LOGIN_REQUEST,
    string,
    ApproveEventsEnum.LOGIN_RESPONSE,
    boolean
  >
];

// Runtime map consistent with ApproveResponseTypeMap
export const requestResponseMap: RequestTypeMapOf<ApproveProtocol> = {
  [ApproveEventsEnum.LOGIN_REQUEST]: ApproveEventsEnum.LOGIN_RESPONSE
};
