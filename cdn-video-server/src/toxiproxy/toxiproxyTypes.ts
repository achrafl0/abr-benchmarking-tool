export interface IProxy {
    name?: string;
    listen: string;
    upstream: string;
    enabled?: boolean;
}

export enum ToxicType {
    LATENCY = "latency",
    BANDWIDTH = "bandwidth",
    SLOW_CLOSE = "slow_close",
    TIMEOUT = "timeout",
    RESET_PEER = "reset_peer",
    SLICER = "slicer",
    LIMIT_DATA = "limit_data",
}

/** Generic type for Toxics as sent to the HTTP API. */
interface IGenericApiToxic<T extends ToxicType, U> {
  type: T;
  stream?: "upstream" | "downstream";
  toxicity?: number;
  attributes: U;
}

/** Generic type for toxic communicated to toxiproxy. */
interface IGenericNormalizedToxic<T extends ToxicType, U> {
  name: string;
  type: T;
  stream?: "upstream" | "downstream";
  toxicity?: number;
  attributes: U;
}

/** Attributes configuring a latency-related toxic. */
interface ILatencyToxicAttributes {
  latency?: number;
  jitter?: number;
}

/** Attributes configuring a bandwidth-related toxic. */
interface IBandwidthToxicAttributes {
  rate?: number;
}

/** Attributes configuring a slow-close toxic. */
interface ISlowCloseToxicAttributes {
  rate?: number;
}

/** Attributes configuring a timeout toxic. */
interface ITimeoutToxicAttributes {
  timeout?: number;
}

/** Object configuring a latency toxic communicated to toxiproxy. */
export type INormalizedLatencyToxic = IGenericNormalizedToxic<
  ToxicType.LATENCY,
  ILatencyToxicAttributes
>;

/** Object configuring a bandwidth toxic communicated to toxiproxy. */
export type INormalizedBandwidthToxic = IGenericNormalizedToxic<
  ToxicType.BANDWIDTH,
  IBandwidthToxicAttributes
>;

/** Object configuring a slow-close toxic communicated to toxiproxy. */
export type INormalizedSlowCloseToxic = IGenericNormalizedToxic<
  ToxicType.SLOW_CLOSE,
  ISlowCloseToxicAttributes
>;

/** Object configuring a timeout toxic communicated to toxiproxy. */
export type INormalizedTimeoutToxic = IGenericNormalizedToxic<
  ToxicType.TIMEOUT,
  ITimeoutToxicAttributes
>;

// TODO? Other toxics

export type INormalizedToxic = INormalizedLatencyToxic |
  INormalizedBandwidthToxic |
  INormalizedTimeoutToxic |
  INormalizedSlowCloseToxic

export type IApiToxic = IGenericApiToxic<ToxicType, unknown>;
