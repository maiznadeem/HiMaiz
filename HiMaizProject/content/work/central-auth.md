---
kind: project
name: Central Auth
role: Solo build
order: 4
draft: false
summary: One sign-in server for all my apps, with my own sign-in pages and a deploy that fails unless 37 security promises hold.
intro: Central Auth is the one sign-in server every one of my apps uses, built on authentik, an open-source identity server. My part is everything around it. One file configures it, my own pages replace the stock ones, and every deploy has to prove the security still holds.
stack: [authentik, PostgreSQL, React, TypeScript, Vite, Playwright, Python, Docker Compose]
scenes:
    - id: deploy-checks-its-locks
      title: A deploy that checks its own locks.
      kicker: Security invariants
      body: |
          A sign-in server set up by hand drifts. An upgrade can quietly bring back a default sign-in flow, which is a second, weaker way in.

          So nothing is set up by hand. One 1,505-line file configures the whole server. After every deploy, a check runs inside the server and tests 37 promises against the live database. Only my flows exist. Every app sends people back only to exact https addresses. No app is open to every account. There's exactly one administrator. If one promise fails, the deploy fails.
      stats:
          - value: "37"
            label: promises checked on every deploy
          - value: "1,505"
            label: lines in the one configuration file
      video:
          src: /work/central-auth/deploy-checks-its-locks.mp4
          poster: /work/central-auth/deploy-checks-its-locks.jpg
          captions: /work/central-auth/deploy-checks-its-locks.vtt
          seconds: 58
          transcript: |
              Every one of my apps signs in through one server. If that server is wrong, every app is wrong. A sign-in
              server set up by hand drifts. And an upgrade can quietly bring back a default sign-in flow, a second,
              weaker way in. So nothing here is set up by hand. One file, over fifteen hundred lines long, describes
              the whole server. But a file only says what should be true. So after every deploy, a check runs inside
              the server, against the live database. It tests thirty-seven promises. Only my own sign-in flows
              exist. Every app sends people back to an exact secure address. No app is open to every account. There
              is exactly one administrator. When all thirty-seven hold, it prints invariants OK. Now slip one
              default flow back in. One lock stays open, and the deploy fails.
    - id: robot-check-own-page
      title: Why the robot check has its own page.
      kicker: Account privacy
      body: |
          If the human check sat on the username page, the server would skip it for names that don't exist. That tells anyone which usernames are real.

          So the check is its own step. Real and made-up names meet the same check and get the same response, and no step reveals whether an account exists. It uses a real check, never test keys that let everyone through. Every sign-in also ends in a second factor, with passkeys first.
      image:
          src: /work/central-auth/robot-check-own-page.jpg
          alt: Two paper sign-in flows side by side. On the left, a made-up username skips the human check and gives itself away. On the right, real and made-up names both pass through the same separate check.
          width: 1920
          height: 1080
    - id: looks-like-where-youre-going
      title: Signing in looks like where you're going.
      kicker: Sign-in pages
      body: |
          I replaced the stock sign-in pages with my own. They talk to the server one step at a time, so the server still makes every decision. Each page takes on the colours, icon and name of the app you're signing in to.

          If my pages ever meet a step they don't recognise, they hand over to the built-in pages, which always stay reachable. A bug in my pages can't lock anyone out.
      image:
          src: /work/central-auth/looks-like-where-youre-going.jpg
          alt: The same sign-in page shown three times for three invented apps, each in that app's own colours and icon, with a passkey prompt on the last one.
          width: 1920
          height: 1080
more:
    - The pages are tested without the real server. Unit tests replay challenges recorded from it, and browser tests run against an 851-line mock of its API, so CI needs no Docker and no network.
    - Machines get short-lived tokens too. The one machine client can use only that grant, has no return address, and is limited to a single service account.
---

I built Central Auth by directing AI coding agents. The design and the decisions are mine.
