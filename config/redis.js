// import Redis from "ioredis";

// let redis;

// if ( process.env.REDIS_URL ) {
//     // 🔥 Vercel / production (Upstash recommended)
//     redis = new Redis( process.env.REDIS_URL );
// } else {
//     // 🔥 Local
//     redis = new Redis( {
//         host: "127.0.0.1",
//         port: 6379,
//     } );
// }
// redis.on("connect", () => {
//   console.log("✅ Redis connected");
// });

// redis.on("error", (err) => {
//   console.log("❌ Redis Error:", err.message);
// });

// // extra test
// redis.ping().then((res) => {
//   console.log("📡 Redis PING:", res);
// });

// export { redis };
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// 🔥 TEST (safe for serverless)
const testRedis = async () => {
  try {
    await redis.set("ping", "pong");
    const res = await redis.get("ping");
    console.log("📡 Upstash Redis Test:", res);
  } catch (err) {
    console.log("❌ Redis Error:", err.message);
  }
};

testRedis();