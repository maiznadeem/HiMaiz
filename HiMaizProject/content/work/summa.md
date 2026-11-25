---
kind: project
name: Summa
role: Solo build
order: 3
draft: false
summary: A private money app that reads statements and money emails, and builds a ledger where every number traces back to its source.
intro: Summa is my private money app. It reads bank statements, receipts and money emails, and builds a ledger where every number can be traced back to the document it came from. When something is unclear, it asks me instead of guessing.
stack: [Next.js, React, PostgreSQL, Drizzle, Tailwind, Docker]
scenes:
    - id: statement-must-add-up
      title: A statement that doesn't add up is rejected.
      kicker: Reconciliation
      body: |
          Reading a bank statement is easy to get slightly wrong. One misread line and the ledger is off forever, without anyone noticing.

          So a parsed statement is only trusted when its opening balance plus every line lands exactly on its own closing balance. If it doesn't, the whole parse is rejected. When two exports overlap, Summa cuts the second one right after the line where the first one's running balance stopped, so nothing is counted twice and nothing on the boundary day is lost.
      video:
          src: /work/summa/statement-must-add-up.mp4
          poster: /work/summa/statement-must-add-up.jpg
          captions: /work/summa/statement-must-add-up.vtt
          seconds: 64
          transcript: |
              A bank statement is a list of lines, and reading one is easy to get slightly wrong. Miss one line, or read one
              number wrong, and the ledger is off for good. Nobody notices. So Summa doesn't trust what it reads
              until the statement proves it. Every statement prints an opening balance and a closing balance. Summa
              starts from the opening balance and adds every line it read. If the total lands exactly on the closing
              balance, the statement is trusted. If it's off by even one unit, the whole statement is rejected.
              There's a second trap. Two exports from the same account can overlap, and the first one can stop
              halfway through a day. Cut by date, and you either count that day twice or lose the rest of it. So
              Summa finds the line where the first export's running balance stopped, and cuts right after it.
              Nothing is counted twice, and nothing is lost. Every statement line in the ledger came from a
              statement that added up.
    - id: assistant-can-do-it-too
      title: Anything I can do, my AI assistant can do.
      kicker: AI tools
      body: |
          AI assistants are first-class users of Summa. 60 tools let a connected assistant do what I can do in the app, behind a consent screen I approve.

          A test keeps it that way. Every action I can take in the app has to map to a tool, or be left out on purpose with a written reason. A new action fails the build until it's mapped.
      stats:
          - value: "60"
            label: tools for AI assistants
          - value: "~703"
            label: test cases
          - value: "63"
            label: database migrations
      image:
          src: /work/summa/assistant-can-do-it-too.jpg
          alt: An invented AI assistant chat asking Summa to categorise a coffee charge, beside a test run where a new app action fails until a matching tool is added.
          width: 1920
          height: 1080
    - id: it-asks
      title: It asks instead of guessing.
      kicker: Review
      body: |
          When Summa can't tell what an email is, it doesn't guess. It puts a card in front of me that asks what the email is, with three answers: money moved, about money but nothing moved, or not about money. My answer files it as something the rest of the app already understands.
      image:
          src: /work/summa/it-asks.jpg
          alt: A Summa review card for an invented sender that asks what the email is, with three answers, Money moved, About money, nothing moved, and Not about money.
          width: 1920
          height: 1080
more:
    - Receipts are checked against themselves and against the payment. If the lines don't match the printed total, or the total is less than the charge, as when a tip was added, it says so and changes nothing.
    - Every source document is stored sealed and encrypted.
---

I built Summa by directing AI coding agents. The design and the decisions are mine.
