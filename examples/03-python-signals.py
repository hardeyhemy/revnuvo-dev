"""Prospect scan: which observed companies recently adopted a technology?

Usage: REVNUVO_API_KEY=rvk_... python3 03-python-signals.py vue
pip install revnuvo-intel
"""
import os
import sys
from revnuvo_intel import Revnuvo, RevnuvoError

tech = sys.argv[1] if len(sys.argv) > 1 else "vue"
rv = Revnuvo(api_key=os.environ["REVNUVO_API_KEY"])

me = rv.whoami()
print(f"plan: {me['plan_label']} — quota {me['quota']['used']}/{me['quota']['api_calls_per_month']} used\n")

result = rv.search_signals(technology=tech, event_type="technology_added", limit=20)
print(f"companies recently observed ADDING '{tech}': {result['count']}")
for s in result["signals"]:
    print(f"  {s['domain']:<28} score={s['signal_score']:<4} conf={s['confidence']} @ {s['detected_at']}")
    print(f"    after: {s['new_state']}  evidence: {s['evidence']}")

print("\nThese are observed changes with evidence — your reasoning layer decides what they mean.")
