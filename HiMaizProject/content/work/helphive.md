---
kind: fyp
name: HelpHive
role: Final Year Project
draft: false
order: 1
summary: My Final Year Project. A marketplace where hotels book housekeeping staff by the shift, which I've kept building on since.
intro: HelpHive is my Final Year Project, a marketplace where hotels book housekeeping staff by the shift, with an API, an Android app and an admin console. I've kept building on it since. The no-show rule, the risk rules and the website came later, built by directing AI coding agents.
stack: [Node.js, Express, TypeScript, MongoDB, React, React Native, Expo, Stripe]
scenes:
    - id: refunds-itself
      title: A booking that refunds itself.
      kicker: Self-enforcing timers
      body: |
          A paid booking can get stuck. If nobody accepts it by the start time, a timer in the cloud cancels it and refunds the customer.

          When I came back to it later, I added a no-show rule. Until then, an accepted booking that never started stayed open forever with the customer's money held. Now a second timer cancels and refunds it once the shift and a grace period are over, and it counts against nobody. The task service refuses anything more than 30 days ahead, so a long wait re-arms itself every 29 days.
      stats:
          - value: "29 days"
            label: before a long timer re-arms itself
      video:
          src: /work/helphive/refunds-itself.mp4
          poster: /work/helphive/refunds-itself.jpg
          captions: /work/helphive/refunds-itself.vtt
          seconds: 68
          transcript: |
              A hotel books a housekeeper for a morning shift, and pays up front. Two things can go wrong. Nobody accepts
              the job. Or someone accepts it, and never shows up. For the first, every booking has a timer in the
              cloud, set for its start time. If nobody has accepted by then, the booking cancels itself and the
              money goes back. When I came back to it later, I found an accepted job that never started just stayed
              open, with the hotel's money held. So I added a no-show rule. When a provider accepts, a second timer
              is set for the end of the shift, plus a grace period. If the job never started, the booking is
              cancelled and refunded. Nobody gets a strike for it, because nobody chose to cancel. One more catch:
              the cloud's task service won't schedule anything more than thirty days ahead. So a timer for a booking
              further out wakes at twenty-nine days, sees it's early, and sets itself again. No booking can get
              stuck, and nobody has to watch the clock.
    - id: jobs-come-to-you
      title: Jobs find the provider, even with the app closed.
      kicker: Matching
      body: |
          A provider taps one switch to go online. From then on, every paid job within 25 km arrives as a push notification, even with the app closed. They accept the job, ask to start when they arrive, and the customer approves.
      stats:
          - value: "25 km"
            label: radius for new-job alerts
      image:
          src: /work/helphive/jobs-come-to-you.jpg
          alt: An Android phone with the HelpHive app closed, showing a push notification for an invented housekeeping shift nearby, over a paper map with a 25 km circle.
          width: 1920
          height: 1080
    - id: money-waits
      title: Money waits until the work is done.
      kicker: Payments and risk
      body: |
          A provider's earnings are released only after the job is complete.

          When I came back to it later, I added risk rules. A rule can hold a provider's payouts or send them for review first, and a new rule can be tried against past bookings to see what it would have done before it goes live. The payment processor's own risk score is recorded for every charge, but it never changes what happens to the payment.
      image:
          src: /work/helphive/money-waits.jpg
          alt: The HelpHive admin console with invented data, showing a completed booking with its payout released, and a risk rule being tested against past bookings.
          width: 1920
          height: 1080
more:
    - 26 data models behind one API, shared by all four apps.
---
