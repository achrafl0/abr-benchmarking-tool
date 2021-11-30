import cp from "child_process";
import path from "path";
import {
  IApiToxic,
  INormalizedToxic,
  IProxy,
  ToxicType,
} from "./toxiproxyTypes";

// TODO Might be better written somewhere else
const TOXIPROXY_CLI_EXEC = path.join(__dirname, "..", "..", "toxiproxy-cli");
const CDN_PORT = 5000;
const TOXIPROXY_PORT = 5001;

function dictToString(dict: any): string {
  return Object.entries(dict).reduce((
    prev,
    [key, value],
  ) => `${prev}${key}=${value} `, "");
}

class Toxiproxy implements IProxy {
  name: string = "CDN-ABR-PROXY";

  toxics: Array<INormalizedToxic> = [];

  listen: string;

  upstream: string;

  enabled: boolean = true;

  constructor(
    listen: string = `localhost:${TOXIPROXY_PORT}`,
    upstream: string = `localhost:${CDN_PORT}`,
  ) {
    this.listen = listen;
    this.upstream = upstream;
  }

  public async initialize(): Promise<void> {
    return execProm(
      `${TOXIPROXY_CLI_EXEC} create -l ${this.listen} -u ${this.upstream} ${this.name}`,
    ).then(() => {});
  }

  public async updateToxics(toxics: IApiToxic[]): Promise<void> {
    this.removeCurrentToxics();
    const proms : Array<Promise<string>> = [];
    for (let i = 0; i < toxics.length; i += 1) {
      const toxic = toxics[i];
      const normalizedToxic = normalizeToxic(toxic);
      const attributeList = dictToString(normalizedToxic.attributes);
      const streamFlag = normalizedToxic.stream === "downstream" ? "-d" : "-u";
      proms.push(execProm(
        `${TOXIPROXY_CLI_EXEC} toxic add -t ${normalizedToxic.type} -a ${attributeList} --tox ${normalizedToxic.toxicity} ${streamFlag} -n ${normalizedToxic.name} ${this.name}`,
      ));
      this.toxics.push(normalizedToxic);
    }
    return Promise.all(proms).then(() => {});
  }

  public async removeCurrentToxics() : Promise<void> {
    const proms = this.toxics.map((toxic) => {
      this.toxics.shift();
      return execProm(`${TOXIPROXY_CLI_EXEC} toxic remove -n ${toxic.name} ${this.name}`);
    });
    return Promise.all(proms).then(() => {});
  }
}

function execProm(input : string) : Promise<string> {
  /* eslint-disable-next-line no-console */
  console.info("Executing command: ", input);
  return new Promise((res, rej) => {
    cp.exec(input, (error, stdout) => {
      if (error === null || error.code === 0) {
        res(stdout);
      }
      rej(error);
    });
  });
}

let id = 0;
function generateToxicName() : string {
  id += 1;
  return String(id);
}

function normalizeToxic(toxic: IApiToxic): INormalizedToxic {
  checkNumberProperty(toxic.toxicity, "toxicity");
  const toxicity = toxic.toxicity ?? 1;
  if (
    toxic.stream !== undefined
    && toxic.stream !== "upstream"
    && toxic.stream !== "downstream"
  ) {
    throw new Error("Invalid stream property given.");
  }
  const stream = toxic.stream ?? "downstream";

  if (typeof toxic.type !== "string") {
    throw new Error("Invalid type property given: not a string.");
  }
  if (typeof toxic.attributes !== "object" || toxic.attributes === null) {
    throw new Error("Invalid attributes property given");
  }
  const attributes = toxic.attributes as Record<string, unknown>;

  switch (toxic.type) {
    case ToxicType.LATENCY:
      checkNumberProperty(attributes.latency, "latency");
      checkNumberProperty(attributes.jitter, "jitter");
      return {
        name: generateToxicName(),
        type: ToxicType.LATENCY,
        toxicity,
        stream,
        attributes: {
          latency: attributes.latency,
          jitter: attributes.jitter,
        },
      };

    case ToxicType.BANDWIDTH:
      checkNumberProperty(attributes.rate, "rate");
      return {
        name: generateToxicName(),
        type: ToxicType.BANDWIDTH,
        toxicity,
        stream,
        attributes: {
          rate: attributes.rate,
        },
      };

    default:
      throw new Error(`Unknown toxic type: ${toxic.type}`);
  }
}

function checkNumberProperty(
  x : unknown,
  propertyName : string,
) : asserts x is number | undefined {
  if (
    x !== undefined
    && typeof x !== "number"
  ) {
    throw new Error(`Invalid ${propertyName} property given: not a number.`);
  }
}

export default new Toxiproxy();
