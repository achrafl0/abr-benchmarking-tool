import cp from "child_process";
import { IProxy, IToxic } from "./toxiproxyTypes";

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

  toxics: Array<IToxic> = [];

  listen: string;

  upstream: string;

  enabled: boolean = true;

  constructor(listen: string = `localhost:${TOXIPROXY_PORT}`, upstream: string = `localhost:${CDN_PORT}`) {
    this.listen = listen;
    this.upstream = upstream;
  }

  private normalizeToxic = (toxic: IToxic): IToxic => {
    const toxicity = toxic.toxicity ?? 1;
    const stream = toxic.stream ?? "downstream";
    return { ...toxic, toxicity, stream };
  };

  public async populate(): Promise<cp.ChildProcess> {
    return cp.exec(
      `toxiproxy-cli create -l ${this.listen} -u ${this.upstream} ${this.name}`,
    );
  }

  public async addToxic(toxic: IToxic): Promise<cp.ChildProcess> {
    const normalizedToxic = this.normalizeToxic(toxic);
    return cp.exec(
      `toxiproxy-cli toxic add -t ${normalizedToxic.type} -a ${dictToString(
        normalizedToxic.attributes,
      )} --tox ${normalizedToxic.toxicity} ${
        normalizedToxic.stream === "downstream" ? "-d" : "-u"
      } ${this.name}`,
    );
  }

  public async removeToxic(toxicName: string) {
    return cp.exec(`toxiproxy-cli toxic remove -n ${toxicName} ${this.name}`);
  }

  public async updateToxic(toxic: IToxic) {
    const normalizedToxic = this.normalizeToxic(toxic);
    return cp.exec(
      `toxiproxy-cli toxic update -n ${normalizedToxic.name} -a ${dictToString(
        normalizedToxic.attributes,
      )} --tox ${normalizedToxic.toxicity} ${this.name}`,
    );
  }
}

export default new Toxiproxy();
