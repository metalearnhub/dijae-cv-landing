# Renders the dark-theme LinkedIn diagrams (1080x1350) for upcoming content-bank posts.
import sys
from playwright.sync_api import sync_playwright
CSS="""*{box-sizing:border-box;margin:0;padding:0}
body{width:1080px;height:1350px;font-family:Inter,Arial,sans-serif;color:#fff;
background:linear-gradient(180deg,#0a0b0c 0%,#1f2224 100%);position:relative;overflow:hidden}
.wrap{position:absolute;left:80px;right:80px;top:84px;bottom:0}
.k{font-size:24px;font-weight:900;letter-spacing:4px;color:#4fd1b5;text-transform:uppercase}
h1{font-size:72px;line-height:1.05;font-weight:900;letter-spacing:-1.5px;margin-top:22px}
.sub{font-size:28px;line-height:1.4;font-weight:600;color:#b5b9bd;margin-top:26px;max-width:880px}
.body{position:absolute;left:0;right:0;top:470px}
.foot{position:absolute;left:80px;right:80px;bottom:60px;border-top:2px solid #2a2e31;padding-top:26px;display:flex;justify-content:space-between;align-items:center}
.foot b{font-size:22px;font-weight:900;letter-spacing:4px}
.foot span{font-size:20px;font-weight:600;color:#8a8f94}
.box{background:#17191b;border:2px solid #3a3f43;border-radius:18px}
.hi{background:#10302a;border:3px solid #3fbfa6}
.g{color:#4fd1b5}.m{color:#b5b9bd}
.row{display:flex;gap:14px}
"""
def page(k,title,sub,body,foot):
    return f"<html><head><link href='https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&display=swap' rel='stylesheet'><style>{CSS}</style></head><body><div class='wrap'><div class='k'>{k}</div><h1>{title}</h1><div class='sub'>{sub}</div><div class='body'>{body}</div></div><div class='foot'><b>DIJAE DADULA</b><span>{foot}</span></div></body></html>"
def steps(items,num=True,hl=()):
    out=""
    for i,(a,b) in enumerate(items,1):
        cls="box hi" if i in hl else "box"
        n=f"<div style='font-size:30px;font-weight:900;color:#4fd1b5;width:46px'>{i}</div>" if num else ""
        s=f"<div class='m' style='font-size:21px;font-weight:600;margin-top:4px'>{b}</div>" if b else ""
        out+=f"<div class='{cls}' style='display:flex;align-items:center;padding:20px 26px;margin-bottom:14px'>{n}<div><div style='font-size:28px;font-weight:800'>{a}</div>{s}</div></div>"
    return out
P={}
P["09-mcp-dark"]=page("Integrations · MCP","A chatbot answers.<br>An agent acts.","MCP is an open standard for connecting AI to the systems where your data lives.",
 "<div class='box hi' style='text-align:center;padding:30px'><div style='font-size:40px;font-weight:900'>AI agent</div><div class='m' style='font-size:22px;font-weight:600;margin-top:6px'>asks, decides, acts</div></div>"
 "<div class='g' style='text-align:center;font-size:26px;font-weight:900;letter-spacing:2px;margin:18px 0'>↓ MCP ↓</div>"
 "<div class='row'>"+"".join(f"<div class='box' style='flex:1;text-align:center;padding:24px 0;font-size:26px;font-weight:800'>{x}</div>" for x in ["CRM","Calendar","Files","Database"])+"</div>"
 "<div style='border-top:3px solid #3fbfa6;margin-top:44px;padding-top:16px;display:flex;justify-content:space-between'><div><div style='font-size:24px;font-weight:900'>Nov 2024</div><div class='m' style='font-size:20px;font-weight:600'>Introduced</div></div><div style='text-align:right'><div style='font-size:24px;font-weight:900'>Dec 2025</div><div class='m' style='font-size:20px;font-weight:600'>Donated to the Agentic AI Foundation<br>(Linux Foundation)</div></div></div>",
 "Sources: Anthropic (2024, 2025)")
def bar(label,val,pct,hi):
    col="#3fbfa6" if hi else "#5a6066"
    return (f"<div style='display:flex;justify-content:space-between;font-size:28px;font-weight:800;margin-bottom:12px'><span>{label}</span><span class='{'g' if hi else 'm'}'>{val}</span></div>"
            f"<div style='height:62px;background:#2a2e31;border-radius:12px;margin-bottom:44px'><div style='width:{pct}%;height:100%;background:{col};border-radius:12px'></div></div>")
P["10-process-dark"]=page("Process first","AI runs a broken<br>process faster.","Share of organizations that redesign workflows around AI.",
 "<div style='margin-top:60px'>"+bar("AI high performers","nearly 3 in 4",74,True)+bar("Everyone else","about 1 in 4",25,False)+"</div><div style='text-align:center;font-size:28px;font-weight:700' class='m'>Fix the process. <span class='g' style='font-weight:900'>Then</span> add the AI.</div>",
 "Source: McKinsey, The State of AI 2026")
P["11-accountability-dark"]=page("Accountability","Your chatbot speaks<br>for your business.","A company is responsible for what its chatbot tells customers.",
 "<div class='box' style='border-left:8px solid #3fbfa6;padding:22px 28px;margin-top:-40px'><div class='g' style='font-size:19px;font-weight:900;letter-spacing:2px'>MOFFATT v. AIR CANADA · FEB 2024</div><div style='font-size:26px;font-weight:800;margin-top:8px;line-height:1.3'>Wrong fare advice from a website chatbot. The airline was held liable.</div></div>"
 "<div class='m' style='font-size:20px;font-weight:900;letter-spacing:2px;margin:26px 0 14px'>TEST BEFORE IT TALKS</div>"+steps([("Real questions","Build the test set from real chats"),("Define correct","What a good answer looks like"),("Test and name failures","Fix the root cause"),("Re-test","After every change")]),
 "Source: BC Civil Resolution Tribunal (2024)")
def ladder(a,b,w,hi):
    return f"<div class='box{' hi' if hi else ''}' style='width:{w}%;padding:22px 28px;margin-bottom:16px'><div style='font-size:30px;font-weight:900'>{a}</div><div class='m' style='font-size:22px;font-weight:600;margin-top:4px'>{b}</div></div>"
P["12-pricing-dark"]=page("Pricing","Sell the outcome,<br>not the hours.","Hourly pricing punishes you for working faster.",
 "<div style='margin-top:70px'>"+ladder("Fix one bottleneck","A focused first win",62,False)+ladder("Build the full system","Capture, reply, follow up, hand off",81,False)+ladder("Monthly optimization","Monitor, test, improve",100,True)+"<div style='font-size:19px;font-weight:600;color:#8a8f94'>Illustrative package ladder</div></div>",
 "Guide: dijaedadula.com/price-ai-automation-services")
P["13-clients-dark"]=page("Client system","Get clients without<br>living on social media.","Seven parts. AI helps most with the two in green.",
 "<div style='margin-top:-10px'>"+"".join(f"<div class='box{' hi' if i in (4,6) else ''}' style='display:flex;align-items:center;padding:14px 24px;margin-bottom:12px'><div style='font-size:28px;font-weight:900;color:#4fd1b5;width:46px'>{i}</div><div style='font-size:28px;font-weight:800'>{t}</div></div>" for i,t in enumerate(["Be specific","Get found, not just seen","Offer a useful first step","Answer every inquiry instantly","Make booking effortless","Follow up until they decide","Turn clients into proof"],1))+"</div>",
 "Guide: dijaedadula.com/get-more-clients-with-ai")
P["14-assist-dark"]=page("Assistive AI","Assist first.<br>Automate second.","Let evidence decide what the AI handles alone.",
 "<div class='row' style='margin-top:90px'><div class='box hi' style='flex:1;padding:30px'><div style='font-size:34px;font-weight:900'>Assist</div><div class='m' style='font-size:23px;font-weight:600;line-height:1.5;margin-top:12px'>AI drafts the reply<br>flags intent<br>suggests next step</div><div style='font-size:24px;font-weight:900;margin-top:34px'>A person approves</div></div>"
 "<div class='box' style='flex:1;padding:30px'><div style='font-size:34px;font-weight:900'>Automate</div><div class='m' style='font-size:23px;font-weight:600;line-height:1.5;margin-top:12px'>AI handles it end to end<br>&nbsp;<br>&nbsp;</div><div style='font-size:24px;font-weight:900;margin-top:34px'>A person reviews exceptions</div></div></div>"
 "<div class='g' style='text-align:center;font-size:27px;font-weight:900;margin-top:30px'>→ Move a task across once it has earned it</div>",
 "Guide: dijaedadula.com/what-is-an-ai-agent")
out=sys.argv[1] if len(sys.argv)>1 else ".."
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':1080,'height':1350})
    for n,h in P.items():
        pg.set_content(h);pg.wait_for_timeout(700);pg.screenshot(path=f"{out}/{n}.png")
    b.close()
print(len(P))
