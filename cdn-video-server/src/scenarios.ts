import {Latency, Bandwidth, Proxy, Toxic} from "toxiproxy-node-client"
import {DEFAULT_BANDWITH, DEFAULT_LATENCY, MBITS, cdnProxy} from "./config"





interface IScenario {
    id: string;
    latency: Latency;
    bandwidth: Bandwidth;
    latencyToxicity?: number;
    bandwidthToxicity?: number;
}
export const flushProxy = async () => {
    const proxy = await cdnProxy.update()
    await proxy.refreshToxics()
    for (const toxic of proxy.toxics) {
        await toxic.remove()
    }
    return proxy
}

export const applyScenario = async (proxy: Proxy, scenario: IScenario) => {
    const latencyToxic = new Toxic<Latency>(proxy, {
        attributes: scenario.latency,
        toxicity: scenario.latencyToxicity ?? 1,
        name: 'latency_downstream',
        stream: "downstream",
        type: "latency",
    })
    const bandwidthToxic = new Toxic<Bandwidth>(proxy, {
        attributes: scenario.bandwidth,
        toxicity: scenario.bandwidthToxicity ?? 1,
        name: 'bandwidth_downstream',
        stream: 'downstream',
        type: "bandwidth"
    })
    await proxy.addToxic(bandwidthToxic)
    await proxy.addToxic(latencyToxic)
}

export const TestScenarios: IScenario[] = [
    {
        id: "default",
        latency: DEFAULT_LATENCY,
        bandwidth: DEFAULT_BANDWITH
    },
    {
        id: "mediocre-bandwidth",
        latency: {
            jitter: 200,
            latency: 300
        },
        bandwidth: {
            rate: 3 * MBITS
        }
    },
    {
        id: "chaotic-network",
        latency: {
            jitter: 2000,
            latency: 100
        },
        bandwidth: DEFAULT_BANDWITH,
        latencyToxicity: 0.2
    },
    {
        id: "adsl-network",
        latency: DEFAULT_LATENCY,
        bandwidth: {
            rate: 500
        }
    }
]



