---
kind: job
name: Newer Job
role: Backend Lead
start: 2025-03
end: present
place: Remote
order: 1
summary: The newer job.
intro: I joined to fix the slow parts. This is what happened.
stack: [Django, PostgreSQL]
scenes:
    - id: opening
      title: The first scene.
      kicker: Start
      body: |
          What was wrong, what I did, what happened.
      stats:
          - value: "10,000"
            label: concurrent users
      video:
          src: /work/b-job/opening.mp4
          poster: /work/b-job/opening.jpg
          captions: /work/b-job/opening.vtt
          seconds: 74
          transcript: |
              The narration.
    - id: still
      title: The second scene.
      body: A still image instead of a video.
      image:
          src: /work/b-job/still.webp
          alt: A cut paper chart.
          width: 1600
          height: 900
    - id: last
      title: The third scene.
      body: Plain text only.
more:
    - Also did this smaller thing.
---

A closing note with a [link](https://example.com).
