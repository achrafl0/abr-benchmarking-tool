

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

interface IAbstractToxic {
    name: string;
    type: ToxicType;
    stream?: "upstream" | "downstream";
    toxicity?: number;
    attributes: unknown
}


export interface ILatencyToxic extends IAbstractToxic {
    type: ToxicType.LATENCY;
    attributes: {
        latency?: number;
        jitter?: number;
    }
}

export interface IBandwidthToxic extends IAbstractToxic {
    type: ToxicType.BANDWIDTH;
    attributes: {
        rate?: number;
    }
}

export interface ISlowCloseToxic extends IAbstractToxic {
    type: ToxicType.SLOW_CLOSE;
    attributes: {
        delay?: number;
    }
}

export interface ITimeoutToxic extends IAbstractToxic {
    type: ToxicType.TIMEOUT;
    attributes: {
        timeout?: number;
    }
}

export interface IResetPeerToxic extends IAbstractToxic {
    type: ToxicType.RESET_PEER;
    attributes: {
        timeout?: number;
    }
}

export interface ISlicerToxic extends IAbstractToxic {
    type: ToxicType.SLICER;
    attributes: {
        average_size?: number;
        size_variation?: number;
        delay?: number;
    }
}

export interface ILimitDataToxic extends IAbstractToxic {
    type: ToxicType.LIMIT_DATA;
    attributes: {
        bytes?: number;
    }
}

export type IToxic = ILatencyToxic | IBandwidthToxic | IResetPeerToxic | ISlicerToxic | ITimeoutToxic | ILimitDataToxic | ISlowCloseToxic