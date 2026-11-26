# Content bank batch p15-p29 (Nov 26 2026): LinkedIn posts for the Dec 3 - Jan 21 calendar.
# Renders 4 images per post (light diagram, dark diagram, light creative, dark creative) and appends entries to posts.json.
import json, os, re
from playwright.sync_api import sync_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); BANK = os.path.dirname(HERE)
RAW = "https://raw.githubusercontent.com/metalearnhub/dijae-cv-landing/main/crm/content-bank/"
B = "https://www.dijaedadula.com/"

P = [
 dict(id="p15", date="2026-12-03", pillar="AI search", stem="15-answer-first", title="Write the answer first.\nThen the explanation.",
  sub="AI assistants quote pages that answer clearly, near the top.",
  steps=[("Question as the heading", "Use the words customers actually type"), ("Short answer first", "One or two sentences that stand alone"), ("Proof and detail", "Dates, sources and examples underneath"), ("FAQ at the end", "The follow-up questions people ask")], hl=(2,),
  motif="chat", fallback="what-is-generative-engine-optimization", fbtitle="What Is Generative Engine Optimization (GEO)?", upcoming=53,
  post="Write the answer first. Then the explanation.\n\nMost business pages make readers dig. Three paragraphs of background before the one sentence they came for.\n\nPeople skim. AI assistants skim too. When ChatGPT or Google's AI answers a question, it needs a clear, self-contained answer it can quote.\n\nA simple page structure that helps both:\n\n→ Use the customer's question as the heading\n→ Answer it in one or two sentences right under it\n→ Then add the detail: steps, dates, sources, examples\n→ Close with the follow-up questions people ask\n\nIt's not a trick. It's good writing that machines can read.\n\nWhich page on your site makes visitors dig the hardest?\n\n#GEO #ContentStrategy #AISearch",
  post2="If an AI assistant read your service page today, could it quote one clear answer?\n\nMost pages bury the answer under background and sales copy.\n\nFlip the order:\n\n→ The question as the heading\n→ A short answer that stands on its own\n→ The proof and detail underneath\n→ An FAQ for the next questions\n\nCustomers find the answer faster. AI assistants find something worth citing.\n\nWhat's the one question every customer asks you first?\n\n#GEO #AISearch #SmallBusiness",
  comment="How AI assistants find and cite businesses → "),
 dict(id="p16", date="2026-12-08", pillar="Lead response", stem="16-inquiry-flow", title="Every inquiry deserves\na next step.",
  sub="From first message to booked call, without the back-and-forth.",
  steps=[("Reply in minutes", "Acknowledge and ask what they need"), ("Three qualifying questions", "Goal, timing, budget range"), ("Offer a booking link", "Only to the people who fit"), ("Reminder before the call", "So the slot doesn't go to waste")], hl=(4,),
  motif="funnel", fallback="lead-response-time", fbtitle="Lead Response Time", upcoming=31,
  post="Every inquiry deserves a next step.\n\nCoaches and consultants rarely lose clients to a better offer. They lose them in the gap between \"I'm interested\" and a booked call.\n\nA simple flow closes that gap:\n\n→ Reply within minutes, even outside office hours\n→ Ask three questions: goal, timing, budget range\n→ Send the booking link only to people who fit\n→ Remind them before the call\n\nThe AI handles the first steps. You show up to calls with people who are ready to talk.\n\nWhere do your inquiries go quiet: before the reply, or before the booking?\n\n#AIAutomation #Coaching #LeadGeneration",
  post2="\"Let me check my calendar and get back to you.\"\n\nThat sentence costs consultants more clients than any competitor.\n\nReplace the back-and-forth with one clear path:\n\n→ An instant, friendly reply\n→ Three short qualifying questions\n→ A booking link for the right people\n→ A reminder so they show up\n\nYour time goes to the calls, not the scheduling.\n\nHow many messages does it take to book a call with you today?\n\n#AIAutomation #Consulting #SalesProcess",
  comment="Why the first five minutes decide who wins the customer → "),
 dict(id="p17", date="2026-12-10", pillar="Follow-up", stem="17-win-back", title="Silence isn't a no.",
  sub="Most quiet leads are busy, not lost. Give them an easy way back.",
  steps=[("Wait a few days", "Not hours: give them room"), ("One useful message", "An answer, a resource, a short question"), ("Make replying easy", "A yes/no or one-tap option"), ("Then stop politely", "Close the loop and leave the door open")], hl=(3,),
  motif="chat", fallback="automate-lead-follow-up", fbtitle="How to Automate Lead Follow-Up With AI", upcoming=34,
  post="Silence isn't a no.\n\nWhen a lead stops replying, most businesses either chase too hard or give up completely.\n\nUsually the person just got busy.\n\nA respectful win-back sequence:\n\n→ Wait a few days, not a few hours\n→ Send one useful message: an answer, a resource or a short question\n→ Make replying effortless: a yes or no, one tap\n→ If there's still nothing, close the loop politely and leave the door open\n\nAutomation handles the timing. The tone should still sound like you.\n\nHow do you follow up with leads who went quiet?\n\n#LeadFollowUp #AIAutomation #SalesTips",
  post2="The lead who stopped replying is not a lost lead. Not yet.\n\nThe mistake is sending \"Just checking in!\" five times.\n\nSend one message that's worth opening instead:\n\n→ Answer the question they were stuck on\n→ Offer one simple next step\n→ Make it easy to say yes, no or later\n\nThen stop. Respect gets more replies than pressure.\n\nWhat's the best re-engagement message you've ever received?\n\n#LeadFollowUp #CustomerExperience #SmallBusiness",
  comment="The follow-up system that still sounds like you → "),
 dict(id="p18", date="2026-12-15", pillar="Process first", stem="18-sop-first", title="Write the SOP\nbefore the prompt.",
  sub="If your team can't follow the steps, your AI agent can't either.",
  steps=[("Pick one task", "Frequent, repetitive, clear outcome"), ("Write the steps", "As your best person actually does them"), ("Mark the decisions", "Where judgment or approval is needed"), ("Then turn it into instructions", "The SOP becomes the agent's playbook")], hl=(4,),
  motif="ladder", fallback="dont-automate-chaos", fbtitle="Don't Automate Chaos", upcoming=37,
  post="Write the SOP before you write the prompt.\n\nMany AI projects start with a tool demo. They should start with a document.\n\nIf the steps live only in someone's head, the agent will guess. And it will guess differently every time.\n\nBefore you build:\n\n→ Pick one frequent, repetitive task\n→ Write the steps the way your best person actually does them\n→ Mark every point that needs judgment or approval\n→ Then turn that SOP into the agent's instructions\n\nThe SOP becomes your test too: did the agent follow the steps?\n\nWhich task in your business lives only in one person's head?\n\n#AIAgents #SOP #ProcessImprovement",
  post2="Your best employee already knows how to do the job your AI agent is meant to do.\n\nWrite it down first.\n\n→ The steps, in order\n→ The questions they ask\n→ The moments they escalate\n→ The things they never promise\n\nThat document is half of your agent's instructions, and all of your quality test.\n\nDoes your team have SOPs, or does it run on memory?\n\n#AIAgents #Operations #Automation",
  comment="Why automation fails on broken processes → "),
 dict(id="p19", date="2026-12-17", pillar="Knowledge", stem="19-team-teachers", title="Your best people are\nyour agent's best teachers.",
  sub="Turn the answers they give every day into the agent's knowledge.",
  steps=[("Collect real questions", "From chats, calls and emails"), ("Record the best answers", "From the people who know"), ("One fact, one home", "Each answer lives in one file"), ("Review monthly", "The experts keep it current")], hl=(2,),
  motif="network", fallback="ai-agent-knowledge-base", fbtitle="How to Write a Knowledge Base Your AI Agent Can Use", upcoming=64,
  post="Your best people are your agent's best teachers.\n\nAn AI agent doesn't know your prices, your policies or the exceptions your team handles every week.\n\nThe people who answer customers do.\n\nTurn that know-how into the agent's knowledge:\n\n→ Collect the real questions customers ask\n→ Have your most experienced people write the best answers\n→ Keep each fact in exactly one place\n→ Let those same experts review it every month\n\nThe agent gets better because your team does, not because the model changed.\n\nWho on your team answers the questions nobody else can?\n\n#AIAgents #KnowledgeManagement #CustomerService",
  post2="The model is the same for everyone. Your team's knowledge isn't.\n\nThat's where a business AI agent gets its edge.\n\n→ Real customer questions\n→ Answers written by your experts\n→ One source of truth for each fact\n→ A monthly review by the people who know\n\nGreat agents are taught, not just configured.\n\nWhat's the most common question your team answers that isn't written down anywhere?\n\n#AIAgents #KnowledgeBase #Expertise",
  comment="The five files every AI agent knowledge base needs → "),
 dict(id="p20", date="2026-12-22", pillar="Development", stem="20-automation-audit", title="Automate the boring,\nfrequent work first.",
  sub="Score each task before you build anything.",
  steps=[("Frequent", "It happens many times a week"), ("Repetitive", "The steps barely change"), ("Rule-based", "Clear rules, few exceptions"), ("Low risk", "A mistake is easy to fix")], hl=(1,2,3,4),
  motif="gauge", fallback="assist-first-automate-second", fbtitle="Assist First, Automate Second", upcoming=40,
  post="Automate the boring, frequent work first.\n\nThe exciting AI project is rarely the right first project.\n\nScore each task on four things:\n\n→ Frequent: it happens many times a week\n→ Repetitive: the steps barely change\n→ Rule-based: clear rules, few exceptions\n→ Low risk: a mistake is easy to spot and fix\n\nTasks that score high on all four are where automation pays back fastest and fails least.\n\nThe complex, high-stakes work can wait until the simple wins prove the system works.\n\nWhich task in your week would score four out of four?\n\n#Automation #AIAgents #Productivity",
  post2="Before you automate anything, run a 30-minute audit.\n\nList the tasks your team repeats every week. Then ask four questions about each:\n\n→ How often does it happen?\n→ Do the steps change?\n→ Are the rules clear?\n→ What happens if it goes wrong?\n\nStart with the tasks that are frequent, stable, clear and safe. That's where the first three automations should come from.\n\nWhat would top your list?\n\n#Automation #Operations #SmallBusiness",
  comment="A safe rollout path for AI in your business → "),
 dict(id="p21", date="2026-12-24", pillar="Optimization", stem="21-peak-season", title="Peak season is the\nreal test.",
  sub="Prepare your chatbot before the rush, not during it.",
  steps=[("Update the facts", "Holiday hours, cut-offs, promos"), ("Test the busy questions", "Shipping, stock, returns"), ("Staff the handoff", "Who answers when the bot can't"), ("Watch daily", "Fix what breaks the same day")], hl=(3,),
  motif="gauge", fallback="how-to-test-an-ai-chatbot", fbtitle="How to Test an AI Chatbot", upcoming=44,
  post="Peak season tests your chatbot more than any demo.\n\nMore messages. Different questions. Less patience.\n\nBefore the rush:\n\n→ Update the facts: holiday hours, delivery cut-offs, promos\n→ Test the questions that spike: shipping, stock, returns\n→ Decide who takes over when the bot can't answer\n→ Review conversations daily and fix what breaks the same day\n\nA chatbot that worked in a quiet month can still fail on the busiest day of the year.\n\nWhat question floods your inbox during the holidays?\n\n#Chatbots #Ecommerce #CustomerService",
  post2="Your chatbot's busiest day is coming. Is it ready?\n\nFour checks before peak season:\n\n→ Are holiday hours and cut-off dates in its knowledge?\n→ Does it answer the top shipping and stock questions correctly?\n→ Is a person on duty for handoffs?\n→ Will someone review the chats every day?\n\nThirty minutes of preparation beats a week of apologies.\n\nWhich of the four would you check first?\n\n#Chatbots #CustomerExperience #RetailTips",
  comment="How to test an AI chatbot before it talks to customers → "),
 dict(id="p22", date="2026-12-29", pillar="Review & audit", stem="22-choose-partner", title="Hire the builder who\nasks the most questions.",
  sub="Good partners interrogate the brief before they quote.",
  steps=[("What's the one job?", "And the number that proves it"), ("What must it never do?", "Scope and hand-off rules"), ("Where do facts live?", "Knowledge, owner, updates"), ("How will we test it?", "Acceptance criteria before the build")], hl=(4,),
  motif="network", fallback="ai-agent-brief", fbtitle="The AI Agent Brief", upcoming=36,
  post="Hire the AI builder who asks the most questions.\n\nThe fastest quote is often the riskiest one.\n\nA good partner wants to know:\n\n→ What's the one job, and the number that proves it works?\n→ What must the agent never do, and when does it hand off?\n→ Where do the facts live, and who keeps them current?\n→ How will we test it before customers see it?\n\nIf a builder never asks these, the answers get decided during the build, usually by accident.\n\nWhat's the best question a vendor ever asked you?\n\n#AIAgents #Outsourcing #BusinessStrategy",
  post2="Before you hire someone to build your AI agent, listen to their questions.\n\nNot their pitch. Their questions.\n\n→ Do they ask about your goal and how you'll measure it?\n→ Do they ask what the agent must never do?\n→ Do they ask who owns the knowledge?\n→ Do they ask how you'll test it?\n\nThe questions tell you how the project will go.\n\nWhat do you ask a vendor first?\n\n#AIAgents #Hiring #SmallBusiness",
  comment="The eight decisions to make before anyone builds → "),
 dict(id="p23", date="2026-12-31", pillar="Review & audit", stem="23-year-end-review", title="Review what you run\nbefore you add more.",
  sub="A year-end check for every automation in your business.",
  steps=[("List every automation", "Bots, flows, integrations"), ("Check the number", "Is it still moving the metric?"), ("Check the facts", "Prices, policies, hours"), ("Keep, fix or retire", "Decide one by one")], hl=(4,),
  motif="ladder", fallback="ai-agent-monitoring-weekly-review", fbtitle="AI Agent Monitoring After Launch", upcoming=49,
  post="Before you add more AI next year, review what you already run.\n\nAutomations pile up. A chatbot here, a follow-up flow there, an integration someone set up and forgot.\n\nA simple year-end review:\n\n→ List every bot, flow and integration you run\n→ Check whether each one still moves the number it was built for\n→ Check the facts it uses: prices, policies, hours\n→ Decide one by one: keep, fix or retire\n\nThe best 2027 plan might start by switching something off.\n\nWhat automation in your business has nobody checked in months?\n\n#Automation #AIAgents #Planning",
  post2="New year, new AI tools? First, audit the old ones.\n\nFor every automation you run, ask:\n\n→ Is it still working?\n→ Is it still accurate?\n→ Is it still worth what it costs?\n\nKeep what works. Fix what drifted. Retire what nobody needs.\n\nThen plan what's next with a clean slate.\n\nHow many automations does your business run today? Do you know?\n\n#Automation #Operations #2027Planning",
  comment="A 30-minute weekly review routine for AI agents → "),
 dict(id="p24", date="2027-01-05", pillar="Cost control", stem="24-bot-and-va", title="Not chatbot or VA.\nChatbot and VA.",
  sub="Let each do the work it's best at.",
  steps=[("Chatbot", "Instant replies, FAQs, booking, 24/7"), ("Virtual assistant", "Judgment, exceptions, relationships"), ("Shared rules", "Clear hand-off triggers"), ("One inbox", "Both see the full conversation")], hl=(3,),
  motif="chat", fallback="ai-chatbot-cost", fbtitle="How Much Does an AI Chatbot Cost", upcoming=67,
  post="It's not chatbot or virtual assistant. It's chatbot and virtual assistant.\n\nThe question \"Should I hire a VA or set up a chatbot?\" usually has the wrong frame.\n\nThey're good at different work:\n\n→ The chatbot: instant replies, FAQs, booking, every hour of the day\n→ The VA: judgment calls, exceptions, upset customers, relationships\n→ Clear hand-off rules between them\n→ One inbox where both see the full conversation\n\nThe chatbot takes the repetitive load. The VA's hours go to the work that needs a person.\n\nHow does your team split the work today?\n\n#VirtualAssistant #Chatbots #SmallBusiness",
  post2="A chatbot won't replace a great virtual assistant. It will make one more valuable.\n\nLet the bot handle:\n→ The same ten questions every day\n→ Booking and reminders\n→ After-hours replies\n\nLet the VA handle:\n→ Exceptions and complaints\n→ Sales conversations that need judgment\n→ Anything you'd want a person to own\n\nWhere would a chatbot free up the most hours on your team?\n\n#VirtualAssistant #AIAutomation #Productivity",
  comment="The real monthly cost of an AI chatbot → "),
 dict(id="p25", date="2027-01-07", pillar="Human handoff", stem="25-keep-human", title="Automate the answer.\nKeep the relationship human.",
  sub="Decide what AI handles and what always reaches a person.",
  steps=[("AI answers", "Hours, prices, order status, booking"), ("AI drafts, person approves", "Quotes, special requests"), ("Person owns", "Complaints, refunds, sensitive cases"), ("Always visible", "Customers can ask for a person anytime")], hl=(3,),
  motif="shield", fallback="ai-chatbot-human-handoff", fbtitle="When Should an AI Chatbot Hand Off to a Human?", upcoming=70,
  post="Automate the answer. Keep the relationship human.\n\nAI customer service works best when the line is clear.\n\n→ AI answers alone: hours, prices, order status, booking\n→ AI drafts, a person approves: quotes, special requests\n→ A person owns it: complaints, refunds, sensitive cases\n→ And customers can always ask for a person\n\nCustomers don't mind talking to AI for simple things. They mind being trapped with it when things get complicated.\n\nWhere do you draw the line in your business?\n\n#CustomerService #AIAgents #CustomerExperience",
  post2="The goal of AI customer service isn't fewer humans. It's humans on the right conversations.\n\nSort every customer request into three groups:\n\n→ Answer automatically\n→ Draft, then approve\n→ Always a person\n\nWrite those groups down before anyone builds anything. They become the agent's rules and your quality test.\n\nWhich requests would you never let AI handle alone?\n\n#CustomerService #AIAutomation #SmallBusiness",
  comment="Seven triggers that should always reach a person → "),
 dict(id="p26", date="2027-01-12", pillar="AI training, explained", stem="26-benchmarks", title="A benchmark score is not\na job interview.",
  sub="Leaderboards measure models on tests. Your business is a different test.",
  steps=[("Benchmarks", "Standard tests, same for every model"), ("Your tasks", "Your customers, your facts, your rules"), ("The gap", "A top score doesn't guarantee your job"), ("Your own test", "Real questions with known answers")], hl=(4,),
  motif="gauge", fallback="human-feedback-ai-training", fbtitle="Human Feedback in AI Training Explained", upcoming=73,
  post="A benchmark score is not a job interview.\n\nAI leaderboards rank models on standard tests: the same questions, scored the same way, for every model.\n\nThat's useful for comparing models. It doesn't tell you how a model will handle your customers, your prices or your policies.\n\nBefore you choose a model for a business agent:\n\n→ Use benchmarks to build a shortlist\n→ Collect real questions from your own conversations\n→ Write the correct answers down\n→ Test each shortlisted model on those, then decide\n\nYour own test set is the benchmark that matters.\n\nHow did you choose the AI model you use today?\n\n#AIModels #AIAgents #TechStrategy",
  post2="\"This model scored highest on the leaderboard.\" Good start. Not the decision.\n\nPublic benchmarks test general skills. Your agent needs specific ones:\n\n→ Your product facts\n→ Your tone\n→ Your rules about what it must never say\n\nTwenty real questions with known answers will tell you more than any leaderboard.\n\nDo you test AI models on your own questions before choosing one?\n\n#AIModels #Benchmarks #AIAgents",
  comment="How AI models learn from human judgment → "),
 dict(id="p27", date="2027-01-14", pillar="Pricing", stem="27-pricing-models", title="How you pay for AI\nshapes what you get.",
  sub="Per seat, per conversation, per outcome: know the trade-offs.",
  steps=[("Per seat", "Predictable, but pays for idle licences"), ("Per conversation", "Scales with volume, watch the spikes"), ("Per outcome", "Pays for results, needs a clear definition"), ("Your choice", "Match the model to your volume and risk")], hl=(3,),
  motif="ladder", fallback="ai-model-choice-agent-costs", fbtitle="Choosing the Right AI Model for a Business Agent", upcoming=76,
  post="How you pay for an AI agent shapes what you get from it.\n\nThree common pricing models:\n\n→ Per seat: predictable, but you pay whether it's used or not\n→ Per conversation: scales with volume, so watch the busy months\n→ Per outcome: you pay for results, but \"result\" must be defined clearly\n\nNone is always best. A small, steady inbox suits one. A seasonal business with spikes suits another.\n\nAsk any vendor: what exactly am I paying for, and what happens to my bill in my busiest month?\n\nWhich pricing model do your AI tools use?\n\n#AIPricing #AIAgents #CostControl",
  post2="\"How much does the AI cost?\" is the wrong first question.\n\nAsk \"How am I charged?\"\n\n→ Per user?\n→ Per conversation or message?\n→ Per resolved case?\n\nThen run your busiest month through it. That's your real price.\n\nHave you ever been surprised by an AI or software bill?\n\n#AIPricing #SaaS #SmallBusiness",
  comment="How to choose a model and keep agent costs down → "),
 dict(id="p28", date="2027-01-19", pillar="Integrations", stem="28-automation-tools", title="Pick the tool your\nteam can maintain.",
  sub="The best automation platform is the one someone will fix at 9 pm.",
  steps=[("Who maintains it?", "Skills on your team, not the vendor's"), ("What does it connect?", "Your apps, today and next year"), ("What does it cost at volume?", "Your busiest month"), ("Can you see what ran?", "Logs and error alerts")], hl=(1,),
  motif="network", fallback="mcp-ai-agent-business-tools", fbtitle="Build an AI Agent That Uses Your Business Tools With MCP", upcoming=78,
  post="Pick the automation tool your team can maintain, not just the cheapest one.\n\nZapier, Make, n8n and others can all connect your apps. The real differences show up months later, when something breaks.\n\nFour questions before you choose:\n\n→ Who on your team will maintain it?\n→ Does it connect the apps you use now and plan to use next?\n→ What does it cost in your busiest month?\n→ Can you see what ran, and get alerted when something fails?\n\nAn automation nobody can fix is a liability, not an asset.\n\nWhich automation tool does your business run on?\n\n#Automation #NoCode #Operations",
  post2="Every automation breaks eventually. The question is who fixes it.\n\nBefore choosing a platform, check:\n\n→ The skills on your team\n→ The apps it must connect\n→ The cost at your real volume\n→ The logs and alerts when something fails\n\nThe best tool is the one your team understands.\n\nWhat's the most important automation running in your business today?\n\n#Automation #Integrations #SmallBusiness",
  comment="How to connect an AI agent to your business tools safely → "),
 dict(id="p29", date="2027-01-21", pillar="Governance", stem="29-ai-policy", title="Write the AI rules\ndown.",
  sub="One page your whole team can follow.",
  steps=[("Approved tools", "Which AI tools the team may use"), ("Data rules", "What never goes into an AI tool"), ("Human review", "What must be checked before it's sent"), ("Who to ask", "One owner for questions")], hl=(2,),
  motif="shield", fallback="prompt-injection-business-owners", fbtitle="Prompt Injection Explained for Business Owners", upcoming=83,
  post="Your team may already be using AI tools. Write the rules down.\n\nYou don't need a 30-page policy. One page covers what matters:\n\n→ Which AI tools are approved for work\n→ What data must never go into them: customer details, passwords, private documents\n→ What must be reviewed by a person before it's sent\n→ Who to ask when something isn't clear\n\nClear rules don't slow people down. They let them use AI with confidence.\n\nDoes your business have an AI use policy yet?\n\n#AIPolicy #AIGovernance #SmallBusiness",
  post2="A one-page AI policy beats a perfect policy nobody reads.\n\nFour sections:\n\n→ Approved tools\n→ Data that stays out\n→ What needs human review\n→ Who owns questions\n\nShare it, explain it, and update it when your tools change.\n\nWhat's the first rule you'd put on your team's AI policy?\n\n#AIPolicy #Governance #FutureOfWork",
  comment="How hidden text can hijack an AI agent, and how to limit the damage → "),
]

def css(dark):
    if dark:
        bg = "linear-gradient(180deg,#0a0b0c 0%,#1f2224 100%)"; fg = "#fff"; k = "#4fd1b5"; m = "#b5b9bd"; box = "#17191b"; bd = "#3a3f43"; hi = "#10302a"; line = "#2a2e31"
    else:
        bg = "#f7f5ef"; fg = "#14181c"; k = "#007a66"; m = "#5b6470"; box = "#ffffff"; bd = "#d8dee4"; hi = "#e8f4f1"; line = "#e3e8ee"
    return f"""*{{box-sizing:border-box;margin:0;padding:0}}body{{width:1080px;height:1350px;font-family:Inter,Arial,sans-serif;color:{fg};background:{bg};position:relative;overflow:hidden}}
.wrap{{position:absolute;left:80px;right:80px;top:84px}}.k{{font-size:24px;font-weight:900;letter-spacing:4px;color:{k};text-transform:uppercase}}
h1{{font-size:70px;line-height:1.06;font-weight:900;letter-spacing:-1.5px;margin-top:22px}}.sub{{font-size:28px;line-height:1.4;font-weight:600;color:{m};margin-top:26px;max-width:900px}}
.body{{position:absolute;left:80px;right:80px;top:560px}}.box{{background:{box};border:2px solid {bd};border-radius:18px;display:flex;align-items:center;padding:22px 26px;margin-bottom:16px}}
.box.hi{{background:{hi};border:3px solid #3fbfa6}}.n{{font-size:32px;font-weight:900;color:{k};width:54px}}.a{{font-size:30px;font-weight:800}}.b{{font-size:22px;font-weight:600;color:{m};margin-top:4px}}
.foot{{position:absolute;left:80px;right:80px;bottom:60px;border-top:2px solid {line};padding-top:26px;display:flex;justify-content:space-between;align-items:center}}
.foot b{{font-size:22px;font-weight:900;letter-spacing:4px}}.foot span{{font-size:20px;font-weight:600;color:{m}}}"""

def diagram(p, dark):
    st = "".join(f"<div class='box{' hi' if i in p['hl'] else ''}'><div class='n'>{i}</div><div><div class='a'>{a}</div><div class='b'>{b}</div></div></div>" for i, (a, b) in enumerate(p['steps'], 1))
    return (f"<html><head><link href='https://fonts.googleapis.com/css2?family=Inter:wght@600;700;800;900&display=swap' rel='stylesheet'><style>{css(dark)}</style></head><body>"
            f"<div class='wrap'><div class='k'>{p['pillar']}</div><h1>{p['title'].replace(chr(10), '<br>')}</h1><div class='sub'>{p['sub']}</div></div>"
            f"<div class='body'>{st}</div><div class='foot'><b>DIJAE DADULA</b><span>Guide: dijaedadula.com</span></div></body></html>")

G = '#3fbfa6'
def motifs(D, S, L):
    return {
     'chat': f"<rect x='60' y='60' width='420' height='150' rx='40' fill='{D}' stroke='{S}' stroke-width='4'/><rect x='110' y='110' width='240' height='18' rx='9' fill='{L}'/><rect x='110' y='148' width='160' height='18' rx='9' fill='{L}'/><rect x='300' y='250' width='420' height='150' rx='40' fill='#10302a' stroke='{G}' stroke-width='5'/><rect x='350' y='300' width='260' height='18' rx='9' fill='{G}'/><rect x='350' y='338' width='180' height='18' rx='9' fill='#2f6b5f'/><circle cx='760' cy='120' r='46' fill='none' stroke='{G}' stroke-width='5'/><path d='M738 120 l16 16 l30 -34' stroke='{G}' stroke-width='7' fill='none' stroke-linecap='round'/>",
     'ladder': "".join(f"<rect x='{80+i*150}' y='{400-i*70}' width='120' height='{40+i*70}' rx='14' fill='{G if i == 4 else D}' stroke='{G if i == 4 else S}' stroke-width='4'/>" for i in range(5)),
     'funnel': f"<path d='M120 80 h640 l-220 220 v140 l-200 -60 v-80 z' fill='{D}' stroke='{S}' stroke-width='5'/><circle cx='440' cy='160' r='22' fill='{G}'/><circle cx='360' cy='130' r='16' fill='{L}'/><circle cx='520' cy='120' r='16' fill='{L}'/><circle cx='440' cy='330' r='18' fill='{G}'/>",
     'gauge': f"<path d='M140 400 A300 300 0 0 1 740 400' fill='none' stroke='{S}' stroke-width='34' stroke-linecap='round'/><path d='M140 400 A300 300 0 0 1 600 160' fill='none' stroke='{G}' stroke-width='34' stroke-linecap='round'/><line x1='440' y1='400' x2='590' y2='220' stroke='{L}' stroke-width='10' stroke-linecap='round'/><circle cx='440' cy='400' r='26' fill='{G}'/>",
     'shield': f"<path d='M440 60 l240 80 v120 c0 120 -100 190 -240 230 c-140 -40 -240 -110 -240 -230 v-120 z' fill='{D}' stroke='{G}' stroke-width='6'/><path d='M370 270 l50 50 l100 -110' stroke='{G}' stroke-width='14' fill='none' stroke-linecap='round' stroke-linejoin='round'/>",
     'network': f"<line x1='440' y1='240' x2='160' y2='100' stroke='{S}' stroke-width='5'/><line x1='440' y1='240' x2='720' y2='100' stroke='{S}' stroke-width='5'/><line x1='440' y1='240' x2='160' y2='400' stroke='{S}' stroke-width='5'/><line x1='440' y1='240' x2='720' y2='400' stroke='{S}' stroke-width='5'/><circle cx='440' cy='240' r='70' fill='#10302a' stroke='{G}' stroke-width='6'/><circle cx='440' cy='240' r='24' fill='{G}'/>" + "".join(f"<circle cx='{x}' cy='{y}' r='44' fill='{D}' stroke='{S}' stroke-width='5'/>" for x, y in [(160, 100), (720, 100), (160, 400), (720, 400)]),
    }

def art(p, dark):
    if dark:
        bg = "linear-gradient(180deg,#0a0b0c 0%,#1f2224 100%)"; m = motifs('#17191b', '#3a3f43', '#3a3f43')
    else:
        bg = "#f7f5ef"; m = motifs('#ffffff', '#c9d0d6', '#c9d0d6')
    return (f"<html><body style='margin:0;width:1080px;height:1350px;background:{bg};overflow:hidden'>"
            f"<svg style='position:absolute;left:100px;top:640px' width='880' height='520' viewBox='0 0 880 520'>{m[p['motif']]}</svg></body></html>")

def main():
    d = json.load(open(os.path.join(BANK, 'posts.json')))
    have = {x['id'] for x in d['posts']}
    with sync_playwright() as pw:
        b = pw.chromium.launch(); pg = b.new_page(viewport={'width': 1080, 'height': 1350})
        for p in P:
            s = p['stem']
            for name, html in [(s + '.png', diagram(p, False)), (s + '-dark.png', diagram(p, True)), (s + '-creative.png', art(p, False)), (s + '-dark-creative.png', art(p, True))]:
                pg.set_content(html); pg.wait_for_timeout(500); pg.screenshot(path=os.path.join(BANK, name))
            if p['id'] in have: continue
            url = B + p['fallback']
            alt = f"{p['pillar']} diagram: {p['title'].replace(chr(10), ' ')} " + "; ".join(f"{i}. {a}" for i, (a, _) in enumerate(p['steps'], 1)) + "."
            d['posts'].append({
                "id": p['id'], "date": p['date'], "added": "2026-11-26", "pillar": p['pillar'], "title": p['title'].replace("\n", " "),
                "file": s + ".png", "alt": alt, "blog": {"title": p['fbtitle'], "url": url},
                "post": p['post'], "post2": p['post2'], "comment": p['comment'] + url,
                "upcomingBlog": p['upcoming'],
                "image": RAW + s + ".png", "image3": RAW + s + "-dark.png", "file3": s + "-dark.png",
                "art": RAW + s + "-creative.png", "artFile": s + "-creative.png", "artTitle": p['title'],
                "artAlt": f"Flat illustration ({p['motif']} motif) with green accents.",
                "art2": RAW + s + "-dark-creative.png", "art2File": s + "-dark-creative.png", "theme": "dark"})
        b.close()
    d['updated'] = "2026-11-26"
    json.dump(d, open(os.path.join(BANK, 'posts.json'), 'w'), indent=1, ensure_ascii=False)
    for p in P:
        assert len(p['post']) < 1300 and len(p['post2']) < 1300, p['id']
    print('posts', len(d['posts']))

if __name__ == '__main__':
    main()
