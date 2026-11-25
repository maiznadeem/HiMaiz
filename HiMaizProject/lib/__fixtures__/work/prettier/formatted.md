---
kind: job
name: Formatted Job
role: Software Engineer
start: 2024-09
end: 2025-09
order: 1
summary: A file in the form Prettier leaves it in, with the stack list broken over lines.
intro: The writers produce files like this, and the orchestrator runs Prettier on each one as it comes in. The loader must read the formatted form exactly as it reads the plain one.
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
    - id: one
      title: A scene in a formatted file.
      body: |
          This body line is deliberately far longer than one hundred columns, so the test can show that Prettier leaves a line inside a YAML block scalar exactly as it was written.

          A second paragraph.
      stats:
          - value: "22 → 10 ms"
            label: a stat with an arrow
    - id: two
      title: Two.
      body: Two.
    - id: three
      title: Three.
      body: Three.
---
