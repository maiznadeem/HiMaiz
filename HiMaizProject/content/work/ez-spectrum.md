---
kind: job
name: EZ-Spectrum
role: Software Engineer
start: 2025-04
end: present
place: Remote
order: 2
draft: false
summary: I led the rebuild of a radio engineering firm's software into one platform. On the same set of studies, it runs 33 times faster than the tool it replaced.
intro: EZ-Spectrum is a small radio-frequency engineering firm that does frequency studies, coordination and licensing. I led the rebuild of its software. An old desktop tool and the web tool that followed it became one platform, and on a benchmark set of 7,630 frequency studies it runs 33 times faster than the web tool it replaced, with the same answers.
stack: [.NET, React, PostgreSQL, PostGIS, Azure, Auth0, GitHub Actions]
scenes:
    - id: study-engine
      title: The same studies, 33 times faster.
      kicker: Study engine
      body: |
          A study answers whether a proposed radio site can use a channel without interfering with anyone already licensed nearby. A project is thousands of them.

          I rebuilt how they run. Studies wait in a queue inside the database, and workers claim them with a lease, so any machine can join a run. One shared worker pool replaced a pool per group. Cutting a state's border into small pieces took the licensee search from 26.6 seconds to 0.34. Every answer had to match the old tool, channel for channel.

          On a project of 7,630 studies, the web tool it replaced took 96 minutes. The new engine takes under three.
      stats:
          - value: "33x"
            label: faster on the same 7,630 studies
          - value: "151,214"
            label: studies in about 40 minutes
          - value: "0.34 s"
            label: statewide border search, from 26.6 s
      video:
          src: /work/ez-spectrum/study-engine.mp4
          poster: /work/ez-spectrum/study-engine.jpg
          captions: /work/ez-spectrum/study-engine.vtt
          seconds: 85
          transcript: |
              A frequency study answers one question.
              Can a new radio site use this channel without interfering with anyone licensed nearby?
              It finds every nearby licensee, draws their protected areas and the new site's reach, and checks the overlaps.
              A project is thousands of these: every site, times every channel.
              On one project of 7,630 studies, the web tool it replaced needed 96 minutes.
              I rebuilt how studies run, with one rule: every answer must match the old tool.
              Studies now wait in a queue inside the database.
              Each worker claims one and holds a lease, so any machine can join in.
              One shared worker pool replaced a pool per group.
              Searching a state's border for licensees took 26.6 seconds.
              Cut into small pieces, the border takes a third of a second.
              A cloud database would have turned a ten-minute run into days, so the engine stays next to its data.
              The same 7,630 studies now finish in under three minutes.
              That's 33 times faster, with the same answers.
              In production, one 96-core server ran 151,214 studies in about 40 minutes.
    - id: plan-reports
      title: 836 reports in about 12 minutes.
      kicker: License plans
      body: |
          A statewide project needed 836 license-plan reports. One plan took more than ten minutes, because its query scanned the whole results table, over a billion rows. Each plan scanned the table twice, for its PDF and for its map, so building the 836 one at a time would have taken about 280 hours.

          Each plan now reads only the studies that can hold its results, and one pass finds the results for every plan at once. One background job builds 16 plans at a time, with progress, failures per plan and a cancel button. Instead of a proposed 8 GB index, I narrowed what each plan reads.
      stats:
          - value: "836"
            label: plan reports in one project
          - value: "~12 min"
            label: for all of them
          - value: "20.8 s"
            label: for one plan, from over 10 minutes
      video:
          src: /work/ez-spectrum/plan-reports.mp4
          poster: /work/ez-spectrum/plan-reports.jpg
          captions: /work/ez-spectrum/plan-reports.vtt
          seconds: 85
          transcript: |
              A statewide radio project needed 836 license-plan reports.
              Each one is a PDF, built from the results of the project's studies.
              The project held 185,161 studies and over eight million results.
              One plan took more than ten minutes, because it scanned the whole results table, over a billion rows.
              Scanning twice per plan, one at a time, all 836 would have taken about 280 hours.
              First I measured where a plan's time went, and most of it was loading results.
              So each plan now finds its studies first and reads only their results, not the whole table.
              One plan dropped to 20.8 seconds.
              Then one pass over the studies finds the results for every plan at once.
              Each contour is prepared once, instead of once for every licensee it's checked against.
              Instead of adding a proposed eight-gigabyte index, I narrowed what each plan reads.
              Then one background job builds the plans sixteen at a time.
              It shows progress, lists any failure by plan, and can be cancelled.
              All 836 plans finished in about twelve minutes.
              That's under a second per plan.
    - id: operations
      title: Every service, on one page, with eyes on it.
      kicker: Operations
      body: |
          The owner wanted to start, pause and stop every service and read its logs. None of that existed.

          Every service now writes the same rolling logs. A small supervisor that depends on none of the apps reports each one's state, CPU, memory and uptime, starts and stops it, and streams its log, even when the app itself won't start. Pausing workers is a row in the database, so the whole fleet pauses at once and the study in flight finishes.

          I deleted cloud hosting and monitoring that had never served a user, and made deploys one job with a rollback.
      stats:
          - value: "~35 s"
            label: push to live, from about 15 minutes
      video:
          src: /work/ez-spectrum/operations.mp4
          poster: /work/ez-spectrum/operations.jpg
          captions: /work/ez-spectrum/operations.vtt
          seconds: 61
          transcript: |
              The owner asked to start, pause and stop every service, and read its logs.
              None of that existed.
              So first, every service writes the same kind of log, in rolling files tagged by app.
              Then I added a small supervisor that depends on none of the apps.
              It reports each service's state, CPU, memory and uptime.
              It starts and stops them, and streams their logs live.
              Because it stands apart, it still answers when an app won't start.
              Pausing the workers is a row in the database, not a signal or a file.
              Flip it, and the whole fleet pauses together, while the study in flight finishes.
              An Operations page puts all of it in one place, live.
              Then I cleaned up the cloud.
              Hosting and monitoring that had never served a user were deleted.
              Deploys became one job, with a rollback.
              Push to live went from about fifteen minutes to thirty-five seconds.
    - id: overnight-waves
      title: Six waves of AI agents in one night, every change proven.
      kicker: AI agents
      body: |
          In one night I ran six waves of AI coding agents across the whole platform, for speed, bugs, dead code and structure. Every change had to pass the same rules.

          Measure first, with the same harness before and after, at least five runs. Outputs must be identical, checked against saved fixtures and hashes. Every bug fix comes with a test that fails on the old code. Production is only read, and everything lands on a preview branch for a person to merge.

          Security bugs were found and fixed, and the build now fails if any endpoint has no access check.
      stats:
          - value: "837 → 45 ms"
            label: file downloads
          - value: "27.5% → 9.3%"
            label: run time lost to memory clean-up
          - value: "3.26 → 1.98 s"
            label: home page on a phone
      video:
          src: /work/ez-spectrum/overnight-waves.mp4
          poster: /work/ez-spectrum/overnight-waves.jpg
          captions: /work/ez-spectrum/overnight-waves.vtt
          seconds: 70
          transcript: |
              In one night, I sent six waves of AI coding agents across the whole platform.
              Each wave had a job: speed, bugs, dead code, or structure.
              Agents write code fast, so every change had to pass the same rules.
              Measure first, with the same harness before and after.
              At least five runs, with the median and the spread.
              The outputs must be identical, checked against saved fixtures and hashes.
              Every bug fix comes with a test that fails on the old code.
              Production is only read, never written.
              And everything lands on a preview branch, for a person to merge.
              Here's some of what came back.
              File downloads went from 837 milliseconds to 45.
              Time lost to memory clean-up fell from 27.5 percent of a run to 9.3.
              The home page on a phone shows its main content in 1.98 seconds, down from 3.26.
              Security bugs were found and fixed.
              And the build now fails if any endpoint has no access check.
    - id: one-platform
      title: Four codebases became one platform.
      kicker: Consolidation
      body: |
          The company's software lived in four places: an old desktop app, the web tool that followed it, a suite of browser engineering tools the owner built, and the website.

          I folded them into one platform: one repository, one sign-in and one access model, on a shared UI library. I built the staff admin twice: first in two days, with 492 tests, then again in React in three days, page by page against a parity list. The old web stacks are retired.
more:
    - When my first speed headline turned out to measure only part of the work, I withdrew it in the results document. The seven optimisations that didn't help are written down there too.
    - On a 3,086-study run, the old tool wrote 37 GB into its database, most of it map files. The new one keeps map files out of the database.
    - A project summary workbook ran into the network edge's 100-second request limit, so I built it outside the request. It went from 66.8 seconds to 36.2, and downloads stopped dying.
    - A 14,382-frequency upload took 18 to 27 minutes and often failed. Each site is now built in memory and saved once.
    - The weekly refresh of FCC license data builds on a side copy and waits for running studies before it swaps in.
    - I cut the CI test step from 174 seconds to about 27. Later, every CI job moved to our own runners.
    - Before the rebuild, I kept the old web tool and desktop tool running, and built a performance dashboard with a timeline of every worker.
    - In 2025 I built the company website in two days. Later I moved it and the customer portal into the platform.
---

I built most of this platform by directing AI coding agents. I set the targets, held every change to measured proof, and reviewed and merged the work.
