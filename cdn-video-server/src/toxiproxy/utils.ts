import cp from "child_process";
import path from "path";
import { IProxy, IToxic } from "./toxiproxyTypes";

// TODO Might be better written
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

  toxics: Array<IToxic> = [];

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

  private normalizeToxic = (toxic: IToxic): IToxic => {
    const name = String(this.toxics.length);
    const toxicity = toxic.toxicity ?? 1;
    const stream = toxic.stream ?? "downstream";
    return {
      ...toxic,
      toxicity,
      stream,
      name,
    };
  };

  public async initialize(): Promise<void> {
    return execProm(
      `${TOXIPROXY_CLI_EXEC} create -l ${this.listen} -u ${this.upstream} ${this.name}`,
    ).then(() => {});
  }

  public async updateToxics(toxics: IToxic[]): Promise<void> {
    this.removeCurrentToxics();
    const proms : Array<Promise<string>> = [];
    for (let i = 0; i < toxics.length; i += 1) {
      const toxic = toxics[i];
      const normalizedToxic = this.normalizeToxic(toxic);
      proms.push(execProm(
        `${TOXIPROXY_CLI_EXEC} toxic add -t ${normalizedToxic.type} -a ${dictToString(
          normalizedToxic.attributes,
        )} --tox ${normalizedToxic.toxicity} ${
          normalizedToxic.stream === "downstream" ? "-d" : "-u"
        } ${this.name}`,
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
  return new Promise((res, rej) => {
    cp.exec(input, (error, stdout) => {
      if (error === null || error.code === 0) {
        res(stdout);
      }
      rej(error);
    });
  });
}

export default new Toxiproxy();
