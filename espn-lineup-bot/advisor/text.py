"""Plain-text rendering of a report dict, for the command line."""

from typing import List


def table(rows: List[List[str]], headers: List[str]) -> str:
    widths = [len(h) for h in headers]
    for r in rows:
        for i, c in enumerate(r):
            widths[i] = max(widths[i], len(str(c)))
    out = ["  ".join(h.ljust(widths[i]) for i, h in enumerate(headers)),
           "  ".join("-" * w for w in widths)]
    for r in rows:
        out.append("  ".join(str(c).ljust(widths[i]) for i, c in enumerate(r)))
    return "\n".join(out)


def lineup_rows(assignment: dict, slot_counts: dict, order: list) -> List[List[str]]:
    rows = []
    for slot in order:
        ps = assignment.get(slot, [])
        for p in ps:
            rows.append([slot, p["name"], p["pos"], p["team"], p["opp"],
                         f"#{p['opp_rank']}" if p["opp_rank"] else "", f"{p['proj']:.1f}",
                         f"{p['recent_avg']:.1f}" if p["recent_avg"] is not None else "", p["notes"]])
        for _ in range(slot_counts.get(slot, 0) - len(ps)):
            rows.append([slot, "-- EMPTY --", "", "", "", "", "0.0", "", "nobody eligible"])
    return rows


def espn(v) -> str:
    return f"{v:.1f}" if v is not None and v >= 0 else "n/a"


def render_text(rep: dict, show_waivers: bool = True, league_wide: bool = True, trades: list = None) -> str:
    H = ["Slot", "Player", "Pos", "Team", "Opp", "OppRk", "Proj", "L3avg", "Notes"]
    L = []
    wk_note = "" if rep["week"] == rep["current_week"] else f"  (current week is {rep['current_week']})"
    L.append(f"\n{rep['league']}  |  {rep['season']} week {rep['week']}{wk_note}")
    L.append(f"{rep['team']} ({rep['record']})  vs  {rep['opponent']} ({rep['opponent_record']})")
    L.append(f"ESPN projects: you {espn(rep['espn_projection']['me'])}  |  them {espn(rep['espn_projection']['opponent'])}")
    L.append(f"Your starters as set: {rep['current_lineup_proj']:.1f}  |  recommended: {rep['recommended_lineup_proj']:.1f}"
             f"  ({rep['recommended_lineup_proj'] - rep['current_lineup_proj']:+.1f})")

    L.append("\nRECOMMENDED LINEUP")
    L.append(table(lineup_rows(rep["recommended"], rep["slot_counts"], rep["slot_order"]), H))

    L.append("\nCHANGES TO MAKE" if rep["moves"] else "\nCHANGES TO MAKE\n  None. Your lineup already matches the projections.")
    L.extend(f"  {m}" for m in rep["moves"])

    if rep["warnings"]:
        L.append("\nWATCH OUT")
        L.extend(f"  ! {w}" for w in rep["warnings"])

    L.append("\nBENCH")
    for p in rep["bench"]:
        L.append(f"  {p['name']:<24}{p['pos']:<5}{p['team']:<5}{p['proj']:>5.1f}  {p['notes']}")

    L.append(f"\nOPPONENT: {rep['opponent']}  (best lineup from their roster: {rep['opponent_best_proj']:.1f})")
    L.append(table(lineup_rows(rep["opponent_lineup"], rep["slot_counts"], rep["slot_order"]), H))
    if rep["opponent_issues"]:
        L.append("  Their problems as set: " + "; ".join(rep["opponent_issues"]))

    if rep["waivers"]:
        L.append("\nWAIVER WATCH  (free agents projected above your weakest starter at that position)")
        for pos, picks in rep["waivers"].items():
            for d in picks:
                if "error" in d:
                    L.append(f"  {pos}: could not load ({d['error']})")
                    continue
                owned = f"{d['owned']:.0f}% owned" if d.get("owned") is not None else ""
                why = "fills your EMPTY slot" if d["fills_empty_slot"] else f"+{d['edge']:.1f}"
                st = d["status"].title() if d["status"] != "ACTIVE" else ""
                L.append(f"  {pos:<5}{d['name']:<24}{d['team']:<5}vs {d['opp']:<5}{d['proj']:>5.1f} proj  ({why})  {owned}  {st}")
    elif show_waivers:
        L.append("\nWAIVER WATCH\n  No free agent out-projects your starters this week.")

    if trades is not None:
        L.append("\nTRADE IDEAS  (1-for-1, ranked by what your lineup gains per week)")
        if not trades:
            L.append("  Nothing that clearly helps you without hurting the other side.")
        for t in trades:
            L.append(f"  {t['with']}: give {t['give']} ({t['give_pos']}, {t['give_value']:.1f}) for "
                     f"{t['get']} ({t['get_pos']}, {t['get_value']:.1f})  you {t['my_gain']:+.1f}/wk, them {t['their_gain']:+.1f}/wk")

    if league_wide and "matchups" in rep:
        L.append(f"\nALL MATCHUPS, WEEK {rep['week']}  (ESPN projection / best possible from roster)")
        for sides in rep["matchups"]:
            if len(sides) == 2:
                a, b = sides
                you = " <- you" if rep["team_id"] in (a["team_id"], b["team_id"]) else ""
                L.append(f"  {a['team']} ({a['record']}) {espn(a['espn_proj'])}/{a['best_lineup_proj']:.1f}"
                         f"  vs  {b['team']} ({b['record']}) {espn(b['espn_proj'])}/{b['best_lineup_proj']:.1f}{you}")
            elif sides:
                L.append(f"  {sides[0]['team']} ({sides[0]['record']}) has a bye")
            for s in sides:
                if s["problems"]:
                    L.append(f"      {s['team']}: " + "; ".join(s["problems"]))

        L.append("\nLEAGUE INJURY REPORT  (whole rosters, not just starters)")
        for t in rep["injury_report"]:
            mark = " <- you" if t["team_id"] == rep["team_id"] else ""
            L.append(f"  {t['team']}{mark}: " + ("; ".join(t["injuries"]) if t["injuries"] else "healthy"))

        if rep.get("results"):
            L.append("\nYOUR SEASON SO FAR")
            for e in rep["results"]:
                sc = f"{e['score']:.1f}-{e['opp_score']:.1f}" if e.get("score") is not None and e.get("opp_score") is not None else ""
                L.append(f"  wk {e['week']:>2}  {e['result']}  {sc:<13} vs {e['opponent']}")
        if rep.get("schedule"):
            L.append("\nYOUR REMAINING SCHEDULE  (regular season)")
            for e in rep["schedule"]:
                inj = f"  injuries: {len(e['injuries'])}" if e["injuries"] else ""
                L.append(f"  wk {e['week']:>2}  {e['opponent']:<28}{e['record']:<7} avg {e['avg_pf']:>6.1f}{inj}")

    L.append("\nSTANDINGS")
    for t in rep["standings"]:
        me_mark = " <- you" if t["team_id"] == rep["team_id"] else ""
        L.append(f"  {t['rank']:>2}. {t['team']:<28}{t['record']:<7} PF {t['pf']:>7.1f}  avg {t['avg_pf']:>6.1f}  PA {t['pa']:>7.1f}{me_mark}")
    L.append("\nOPRK: ESPN's opponent rank against that position, as shown on the ESPN site.")
    L.append("This tool only reads your league. Make the moves on ESPN yourself, or use the web app's button.\n")
    return "\n".join(L)
