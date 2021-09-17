import {
   Bandwidth, Latency
} from "toxiproxy-node-client";
import { cdnProxy, DEFAULT_BANDWITH, DEFAULT_LATENCY } from "./config";
import {Router} from "express"
import { applyScenario, flushProxy, TestScenarios } from "./scenarios";

const router = Router()


router.get("/bandwidth", async (_req, res, _next) => {
  const proxy = await cdnProxy.update()
  await proxy.refreshToxics()
  const network = {latency: DEFAULT_LATENCY, bandwidth: DEFAULT_BANDWITH}
  proxy.toxics.forEach((toxic) => {
    if (toxic.type === "bandwidth"){
      network.bandwidth = <Bandwidth>toxic.attributes
    }
    if (toxic.type === "latency"){
      network.latency = <Latency>toxic.attributes
    }
  })
  return res.json(network)
})


router.post("/scenario/:id", async (req, res, next) => {
  const {id} = req.params
  const testScenario = TestScenarios.filter((scenario) => scenario.id === id)
  if (testScenario.length > 0){
    const [scenario] = testScenario
    const proxy = await flushProxy()
    await applyScenario(proxy, scenario)
    return res.json(scenario)
  } else {
    return res.status(404)
  }
  
})

export default router