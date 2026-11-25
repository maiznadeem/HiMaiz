---
kind: job
name: PRTL Labs
role: Software Engineer
start: 2024-09
end: 2025-09
place: Remote
order: 3
draft: false
summary: I built AI agents on Cloudflare that turn a plain-English request into a plan, run it as durable workflows, and wake themselves on schedule.
intro: At PRTL Labs I worked on AI agents that run marketing for local retail brands. We tried to get several agents working together on Cloudflare, and the parts below are the ones I designed and built. AI coding tools wrote part of the code, and the design and the calls were mine.
stack:
    [
        TypeScript,
        Cloudflare Workers,
        Durable Objects,
        Cloudflare Workflows,
        MCP,
        Workers AI,
        MongoDB,
        Google Cloud Run,
    ]
scenes:
    - id: workflow-agent
      title: One plain sentence in, the right workflows out.
      kicker: Agent orchestration
      body: |
          An agent here is a program that reads a request, picks its own tools and uses them. Our pipelines were separate jobs that someone had to start with the right settings. I designed and built one agent to start them all.

          You send it a sentence in plain English. A language model on Cloudflare reads it next to the agent's four tools and answers with a JSON plan: which tool, what settings and why. The agent checks the plan, starts each job as a durable Cloudflare Workflow and returns its decision trail. I published it as an MCP server, so other agents and Claude clients can call it too.
      stats:
          - value: "4"
            label: tools the agent chooses between
          - value: "3"
            label: ways to call it, SSE, HTTP and RPC
          - value: "99%"
            label: of the agent's code from my commits
      video:
          src: /work/prtl-labs/workflow-agent.mp4
          poster: /work/prtl-labs/workflow-agent.jpg
          captions: /work/prtl-labs/workflow-agent.vtt
          seconds: 74
          transcript: |
              An agent is a program that reads a request, picks its own tools, and uses them. Our campaign pipelines were separate jobs, and someone had to start each with the right settings. I designed and built one agent to sit in front of them all. You send it one plain-English sentence, like: schedule a marketing campaign for the next day. The agent sets that sentence beside its four tools. Create a campaign, scrape product data, search web trends, check a running job. A language model running on Cloudflare reads both, and answers with a plan in JSON. Each action names a tool, its settings, and the reason for it. The agent pulls the plan out of the reply and checks each tool name. Then it starts each job as a Cloudflare Workflow, which saves its progress step by step. It sends back its decision trail, so you can see what it chose and why. I also published it as an MCP server, the standard way AI tools call each other. Other agents and Claude clients reach it over SSE, HTTP, or RPC. The new scheduler hands its jobs to it too.
    - id: campaign-pipeline
      title: Ten steps from a local trend to a posted campaign.
      kicker: Durable pipeline
      body: |
          A campaign takes ten jobs in order, and most call an outside service that can fail. So it runs as one Cloudflare Workflow, one step per job.

          It checks the request, reads recent campaigns to avoid repeats and searches local trends. It writes a topical post instead of a sales pitch, makes an image and a video, and saves a campaign per store. Then it posts to Instagram and X and records the results.

          Each step saves its result. A failed step retries alone, up to two or three times with longer waits, and the steps before it don't run again. I reworked most steps and wrote the content step.
      stats:
          - value: "10"
            label: durable steps from trend to post
          - value: "2 or 3"
            label: retries at most for a failed step
      video:
          src: /work/prtl-labs/campaign-pipeline.mp4
          poster: /work/prtl-labs/campaign-pipeline.jpg
          captions: /work/prtl-labs/campaign-pipeline.vtt
          seconds: 76
          transcript: |
              A campaign needs ten jobs done in order, and most of them call an outside service that can fail. So it runs as one Cloudflare Workflow, with each job as its own step. Step one checks the request. Step two reads recent campaigns, so the next one doesn't repeat them. Step three searches the web for what's happening locally right now. Step four, which I wrote, turns a trend into a topical post instead of a sales pitch. Steps five and six make an image and a short video with AI models, and store them. Step seven saves one campaign for each store. Steps eight and nine post it to Instagram, Reels included, and to X. Step ten records where everything went. Every finished step saves its result. When a step fails, it retries on its own, up to two or three times, waiting longer each time. So if the Instagram post fails, only the Instagram step runs again. The trend search, the post, the image and the video are not made twice. For testing, a sandbox mode jumps straight to the media steps and posts nothing. I reworked most of these steps, from the trend search to the posts.
    - id: scheduler
      title: One alarm per object, so one object per task.
      kicker: Scheduling
      body: |
          Scheduled posts sat in a key-value list that a cron job swept every minute. Cloudflare's Durable Objects can wake themselves with an alarm, but each holds only one at a time. So my scheduler makes a new object for every task.

          A language model reads a request like "post this at 9am tomorrow" and returns the agent, job and time. A fresh object, named after the task, stores it and sets its alarm. When it rings, the object hands the job to the right agent.

          When I tested it, posts scheduled through the API fired on time. From chat, some didn't, so adding checks there was next on the list.
      stats:
          - value: "1"
            label: alarm a Durable Object can hold
          - value: "1"
            label: Durable Object per scheduled task
          - value: "1 min"
            label: how often the old sweep ran
      video:
          src: /work/prtl-labs/scheduler.mp4
          poster: /work/prtl-labs/scheduler.jpg
          captions: /work/prtl-labs/scheduler.vtt
          seconds: 77
          transcript: |
              Scheduled posts used to sit in a list in a key-value store. A cron job woke every minute to sweep it and run whatever was due. Cloudflare has a better way to wait: a Durable Object, a small program with its own storage and an alarm. The catch is that each Durable Object can hold only one alarm at a time. So one scheduler object can't wait for three posts at three different times. I rebuilt the scheduler to create a new object for every task. You ask it something like: post to Instagram at 9am tomorrow. A language model splits that into which agent, what to do, and when. The scheduler checks the time is in the future and makes a fresh task ID. It creates a Durable Object named after that ID, stores the task inside it, and sets its one alarm. Three tasks means three objects, each with its own clock. When an alarm rings, its object wakes the right agent and hands it the job. Then it deletes the task. When I tested it, posts scheduled through the API fired on time. From chat, some didn't, so the next job was adding checks to that path.
more:
    - Extended a teammate's knowledge-graph agent so it repairs its own database queries. When a generated query fails, the error and the schema go back to the model for a rewrite and another try.
    - Found that the graph database lost its data whenever the host scaled down, because it wrote to local disk, and argued for running it on a VM.
    - Set up builds on Google Cloud with triggers that rebuild only when the paths they watch change.
    - Merged the separate agent and workflow apps into one TypeScript monorepo, with one set of schemas shared by the workflows, the agents and the APIs.
    - Before the platform, built agents on the open-source Pippin framework. One checked basketball scores every hour, made a highlight image and posted it to X. Another posted weekly marketing and sent advertising notifications.
    - Built loyalty sign-up pages that put a membership card straight into Apple Wallet or Google Wallet, picking the right one for the phone.
    - Added Google sign-in, email verification and analytics to a chat CRM, and ran a loyalty-points sync as a scheduled Kubernetes job.
---
