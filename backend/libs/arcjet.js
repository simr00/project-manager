import arcjet from "@arcjet/node";
import { shield, detectBot, tokenBucket, validateEmail} from "@arcjet/node";

const aj = arcjet({
  key: "ajkey_01krs45nbve8x9vaq8kpz7rc7n",
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),

    detectBot({
      mode: "LIVE",
      allow: ["CATEGORY:SEARCH_ENGINE"],
    }), // ✅ comma added here

     validateEmail({
      mode: "LIVE",
      deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
    }),

    tokenBucket({
      mode: "LIVE",
      refillRate: 5,
      interval: 10,
      capacity: 10,
    }),
  ],
});

export default aj;