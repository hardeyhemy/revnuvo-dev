// Machine-to-machine access with x402 — no Revnuvo account, no API key.
// Node 20+: node 07-x402-agent.mjs example.com
// Flow: POST -> 402 payment spec -> agent pays USDC on Base (x402 client lib) ->
//       replay with X-PAYMENT header -> intelligence + on-chain receipt.
// This demo prints the exact payment spec; plug in an x402 wallet client
// (e.g. the official x402-fetch / HTTPx402 helpers) at the PAY HERE marker.
const domain = process.argv[2] || "example.com";
const url = "https://intel.revnuvo.site/v1/x402/company-state";

// 1) probe — server returns 402 + machine-readable payment requirements
const probe = await fetch(url, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ domain }),
});
const spec = await probe.json();
console.log(`status ${probe.status} — payment required:`);
console.log(JSON.stringify(spec, null, 2));

if (probe.status === 402) {
  const req402 = spec.accepts[0];
  console.log(`\nTo complete: pay ${Number(req402.maxAmountRequired) / 1e6} USDC (Base) to ${req402.payTo}`);
  console.log(`  via an x402 client: ${req402.scheme} scheme, resource = ${req402.resource}`);
  // ---- PAY HERE ----
  // Using the x402 client library of your choice:
  //   import { createSigner, wrapFetchWithPayment } from "x402-fetch";
  //   const signer = await createSigner("base", PRIVATE_KEY);
  //   const paid = wrapFetchWithPayment(fetch, signer);
  //   const res = await paid(url, { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({domain}) });
  //   const intelligence = await res.json();   // + x-payment-receipt header = on-chain tx
  //
  // Or use a key instead (free 100 calls/mo): https://app.revnuvo.site
}
