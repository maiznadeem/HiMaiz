---
kind: job
name: Qoria
role: Backend Lead
start: 2024-08
end: present
place: Remote
order: 1
draft: false
summary: I lead Qoria's backend. I took it from falling over at 3,500 phones to holding 10,000, and halved its database work on the same hardware.
intro: Qoria is a learning platform built around working artists and teachers. I joined in August 2024 and now run the backend, from the API and the database to AWS and the Cloudflare edge in front of them. AI coding agents wrote much of the code below, and I directed the work and made the calls.
stack: [Python, Django, PostgreSQL, Aurora Serverless, AWS ECS, Cloudflare, Locust, GitHub Actions]
scenes:
    - id: load-test
      title: The first load test fell over at 3,500 phones.
      kicker: Load testing
      body: |
          Our advisor drafted the first test plan. I had it replanned around simulated phones that behave exactly like the app, then built and ran it. It ran on a throwaway copy of production with 100,000 seeded accounts and stand-ins for every outside service. Each phone had its own account and device key, signed its requests the way the app does, and walked the app's real screens.

          Run 1 collapsed. The database hit 100% CPU, ran out of memory twice, and 89% of requests failed. Between runs I capped database connections and fixed slow queries. Run by run, the phones served in under a second went from 2,600 to all 10,000.
      stats:
          - value: "10,000"
            label: simulated phones in the app at once
          - value: "2 of 350,794"
            label: requests lost in a climb and its hold
          - value: "9"
            label: runs in two days, a change between each
    - id: half-the-work
      title: Half the database work, on the same hardware.
      kicker: Query performance
      body: |
          At 10,000 phones the database sat at 93% CPU. The easy fix was a bigger machine. I fixed the code instead, and the answers had to stay exactly the same.

          I ranked the database's busiest statements by their share of total time, not their average speed. Search and Discover now read a page's keys first, then fetch only those rows. A search of one or two letters skips the fuzzy-match index. Likes, saves, shares, comments and follows each run four fewer statements. Before merging, 392 recorded responses from the old code matched the new code exactly.

          Then I ran the same test on the same machine.
      stats:
          - value: "22 → 10 ms"
            label: database CPU per request
          - value: "93% → 44%"
            label: database CPU at 10,000 phones
          - value: "3,310 → 54 ms"
            label: free member's one-letter search time
      video:
          src: /work/qoria/half-the-work.mp4
          poster: /work/qoria/half-the-work.jpg
          captions: /work/qoria/half-the-work.vtt
          seconds: 76
          transcript: |
              At 10,000 phones, the database sat at 93% CPU. Each request cost it 22 milliseconds of work. The easy fix was a bigger machine, and I fixed the code instead. And the answers had to stay exactly the same. I ranked the database's busiest statements by their share of total time, not by their average speed. Search, Discover and feed shares came out on top, with more than half of it. They now read a page's keys first, then fetch only those rows. A search of one or two letters skips the fuzzy-match index entirely. Likes, saves, shares, comments and follows each run four fewer statements. Before merging, 392 recorded responses from the old code had to match the new code exactly. They all did. Then the same test ran again, on the same machine. Database CPU fell from 93% to 44%. Work per request fell from 22 milliseconds to 10. For a free member, a search on a single letter went from 3,310 milliseconds of database time to 54. Same hardware, half the work.
    - id: scaler
      title: A scaler that sizes for the crowd that's coming.
      kicker: Autoscaling
      body: |
          A new server takes about a minute to be ready, and step rules wait for the load before adding one, so they're always late.

          The idea was mine: scale on how fast load grows, not only how high it is. Every 15 seconds the scaler projects the last minute's traffic forward to when a new server would be ready, and sizes for that. It scales up at once and down slowly. AI agents worked out the exact formula and wrote the code and tests.

          In a two-minute rush, step rules lost 7.9% of requests and the scaler lost 1.5%. In a longer, five-minute rush, the scaler lost 0.01%.
      stats:
          - value: "7.9% → 1.5%"
            label: lost in a two-minute rush, old vs scaler
          - value: "0.01%"
            label: lost by the scaler in a five-minute rush
          - value: "24 → 15"
            label: servers, stepped down by itself
    - id: side-door
      title: Closing the side door.
      kicker: Security
      body: |
          Qoria's API sat behind Cloudflare, but a direct request could still reach it. Now the API only answers traffic that came through the edge, and everything else gets a 403. Rate limits now see the real caller. Scanner probes are turned away before they reach the app. Cloudflare's managed rules against known exploits are on, with strict TLS 1.2 or newer.

          Before that, I ran a full OWASP audit of the backend. It found one Critical and two High issues, and fixes for account takeover and payment replay were among the first to land. Two weeks later there were no Critical or High issues left.
      stats:
          - value: "403"
            label: for anything that skips the edge
          - value: "1 → 0, 2 → 0"
            label: Critical and High audit findings
          - value: "32 → 7"
            label: Medium audit findings, two weeks later
    - id: how-i-work
      title: I lead the backend by directing AI agents.
      kicker: How I work
      body: |
          The team is small. I set the goal and the rules for each piece of work, ask for the plan, make the go and no-go calls, and review what comes back. Agents write much of the code, the load-test tools and the reports. Design decisions are written down as decision records.

          That only works if checking is fast. The test suite took about 30 minutes, and the cost was in the setup, not the tests: mocks rebuilt for every test and real password hashing for every fake user. I made the setup cheap and spread the suite over 24 workers. One workflow now deploys all three environments.
      stats:
          - value: "91 s"
            label: for 8,253 tests, down from about 30 min
          - value: "60"
            label: decision records written
          - value: "1,503 of 2,782"
            label: backend commits co-written with agents
      video:
          src: /work/qoria/how-i-work.mp4
          poster: /work/qoria/how-i-work.jpg
          captions: /work/qoria/how-i-work.vtt
          seconds: 70
          transcript: |
              Our backend team is small, so I lead it by directing AI coding agents. I set the goal and the rules for each piece of work, and ask for a plan. Agents write much of the code, the load-test tools and the reports. I make the go and no-go calls, and review what comes back. Design decisions get written down, and there are 60 decision records so far. Of my 2,782 backend commits, 1,503 were co-written with an agent. That only works if checking the work is fast. Our test suite took about 30 minutes, and every pull request paid for it two or three times. The tests weren't slow. The setup was, with mocks rebuilt for every test and real password hashing for every fake user. I made the setup cheap and spread the suite across 24 workers. Now 8,253 tests run in 91 seconds. One workflow now deploys all three environments. In its first two weeks, a production deploy took a median of 2 minutes 40 seconds.
more:
    - Moved the live database twice in a month, from MySQL to PostgreSQL with built-in vector search, then to Aurora Serverless with a write pause of 5 minutes 23 seconds.
    - Found that a forgotten GitHub webhook was 55% of production requests and 96% of server time, with nothing listening. I removed it and blocked it at the load balancer.
    - Cut each API worker's memory by 31% by freezing shared objects before the server forks its workers.
    - Cut a heavy member's first home feed page from 1,452 ms to under 260 ms of database time, with 42 kinds of viewer checked for identical results.
    - Fixed a goal-progress check that ran 4,025 queries and timed out. It now runs 77.
    - Made the yearly payments ledger in the admin panel load in 0.84 seconds instead of 52.7, by paging and streaming it.
    - Put 22 views across nine flows behind Apple's device check.
    - Built the React admin panel from scratch, with required multi-factor sign-in, payouts, takedowns and an audit trail.
---
