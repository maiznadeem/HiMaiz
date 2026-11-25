---
kind: project
name: Argus
role: Solo build
order: 1
draft: false
summary: A private control room that maps where every one of my projects runs, checks my rules against that map, and never changes what it reads.
intro: Argus is a read-only control room for everything I run. It sweeps every cloud on a schedule, works out how each public address reaches its code, checks 23 rules against what it finds, and gathers every app's logs in one place. It never changes anything it reads.
stack: [Node.js, TypeScript, Hono, SQLite, React, Vite, VictoriaLogs, Docker]
scenes:
    - id: unknown-is-not-a-pass
      title: Unknown is never a pass.
      kicker: Rules as code
      body: |
          Most dashboards stay green when they can't see. Argus turns grey.

          Every sweep reads each source with a 60-second limit. A source that fails keeps its last good data and is marked stale. Then 23 rules run against the result, one file per rule, each with its reason and its exceptions. A rule can pass, break and name what broke it, be excepted, or say it could not check. Could not check never counts as a pass.
      stats:
          - value: "23"
            label: rules checked on every sweep
          - value: "60 s"
            label: limit for each source
          - value: "~2,960"
            label: test cases
      video:
          src: /work/argus/unknown-is-not-a-pass.mp4
          poster: /work/argus/unknown-is-not-a-pass.jpg
          captions: /work/argus/unknown-is-not-a-pass.vtt
          seconds: 54
          transcript: |
              Most dashboards have a quiet flaw. When they can't see something, they show green anyway. Argus is my control
              room, and it does the opposite. On every sweep it reads each source: the clouds, the address book, the
              code host, the server. Each source gets sixty seconds. If one fails, Argus keeps its last good data
              and marks it stale. Then twenty-three rules run against what came back. Each rule is one file, with
              its reason and its exceptions written down. A rule can pass. It can break, and name exactly what broke
              it. It can be excepted, on purpose, with a reason. Or it can say it could not check. Watch this source
              go stale. Its rules don't stay green. They turn grey. Could not check never counts as a pass. About
              three thousand tests hold that line.
    - id: the-map-draws-itself
      title: I type nothing. The map draws itself.
      kicker: Discovery
      body: |
          I don't keep a list of what runs where. Argus starts from each public address in DNS, the internet's address book, and follows the chain: through the content delivery network or not, then the edge worker, the origin, the cloud service or proxy route, the container, the app and the repo. Anything it can't place goes under Unexplained instead of being dropped.

          A small probe on a different cloud checks what a stranger sees: origins that answer without going through the delivery network, open ports, and certificate dates.
      image:
          src: /work/argus/the-map-draws-itself.jpg
          alt: The Argus map with invented app names. Public addresses on the left trace lines through edge, origin, container and repo, and two unplaced addresses sit in a box marked Unexplained.
          width: 1920
          height: 1080
    - id: no-keys-to-lose
      title: Reading production with no keys to lose.
      kicker: Access
      body: |
          Argus holds no long-lived cloud key. It asks my own sign-in server for a short-lived token and trades it with each cloud for access that runs out on its own.

          On the server itself, a root helper answers a fixed list of questions over a local socket. It returns the names of secrets, never their values, and it has no way to write anything. If Argus were ever taken over, there would be no key to steal and nothing it could change.
      image:
          src: /work/argus/no-keys-to-lose.jpg
          alt: A paper diagram. A token passes from a sign-in server to Argus and on to two clouds, with an expiry clock. Below, a helper hands back a list of secret names while a request for a value bounces off.
          width: 1920
          height: 1080
more:
    - Logs from every app arrive in one shape. A redaction guard scrubs credentials even when they're encoded or disguised with look-alike characters, and on 2,250 live lines it flagged nothing by mistake.
    - Everything stays inside free tiers, with caps that delete the oldest data before a bill can happen.
    - Web-push alerts when a rule breaks or recovers, and a Ctrl+K palette to jump anywhere.
---

I built Argus by directing AI coding agents. The design, the rules and the decisions are mine.
