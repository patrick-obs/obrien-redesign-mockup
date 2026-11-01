// Cloudflare entry point. The Worker forwards everything to one Durable Object, which holds
// the app, its settings, and its cache. Durable Objects get 30 s of CPU per request on the
// free plan, enough to parse ESPN's multi-megabyte responses; plain Workers get 10 ms.
import { DurableObject } from "cloudflare:workers";
import { App } from "./app.js";

export class Advisor extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.app = new App({ env, storage: ctx.storage, fetchFn: (u, i) => fetch(u, i) });
  }
  async fetch(request) {
    return this.app.handle(request);
  }
}

const stub = (env) => env.ADVISOR.get(env.ADVISOR.idFromName("advisor"));

export default {
  async fetch(request, env) {
    return stub(env).fetch(request);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(stub(env).fetch("https://advisor.internal/__warm", { headers: { "x-warm-key": env.SECRET_KEY || "" } }));
  },
};
