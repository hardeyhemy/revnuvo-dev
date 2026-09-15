// Monitor a company and poll for evidence-backed changes.
// Usage: REVNUVO_API_KEY=rvk_... node 02-node-monitor.mjs acme.com
// npm install revnuvo   (or: npm i https://www.npmjs.com/package/revnuvo)
import { Revnuvo } from "revnuvo";

const domain = process.argv[2] || "example.com";
const rv = new Revnuvo({ apiKey: process.env.REVNUVO_API_KEY });

const mon = await rv.monitorCompany(domain, { intervalHours: 24 });
console.log(mon.already_monitored ? `${domain} already monitored` : `${domain} monitored (${mon.interval_hours}h) — baseline:`, mon.baseline_scan ?? mon);

const state = await rv.getCompanyState(domain);
console.log(`\nbaseline state @ ${state.observed_at} (hash ${state.observation_hash.slice(0, 12)}…):`);
for (const t of state.state.technologies) console.log(`  - ${t.name}${t.version ? "@" + t.version : ""} [${t.category}] conf=${t.confidence}`);

const changes = await rv.getCompanyChanges(domain);
console.log(`\n${changes.count} observed change(s) in your history window:`);
for (const c of changes.changes) {
  console.log(`  [${c.detected_at}] ${c.event_type}${c.technology ? `: ${c.technology}` : ""} conf=${c.confidence}`);
  console.log(`    evidence: ${JSON.stringify(c.evidence)}`);
}
console.log(`\nSignals are observed changes with evidence — not purchase-intent claims.`);
