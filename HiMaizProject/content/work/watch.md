---
kind: project
name: Watch
role: Solo build
order: 2
draft: false
summary: My own streaming service for a home video library. It finds the skip-intro moment by itself, by listening to the audio.
intro: Watch is my own streaming service for a home video library. It plays on phones, TVs and laptops, resumes where you left off, and works offline. It finds the intro, the recap and the credits of every episode by itself, with nobody marking them.
stack: [Node.js, TypeScript, SQLite, ffmpeg, Preact, Vite, hls.js]
scenes:
    - id: finding-the-intro
      title: It finds the intro by listening.
      kicker: Audio fingerprinting
      body: |
          Nobody marks where an intro starts. So Watch listens.

          It decodes each episode's audio to mono at 8 kHz and takes a 1024-point FFT every 256 samples, which is 31.25 frames a second. Each frame becomes a 32-bit hash of how the energy moves across 33 bands between 300 and 3400 Hz. It's written in plain Node because the ffmpeg build has no fingerprint library.

          Then each episode is matched against its siblings in the season. The stretch most of them share is the intro. If only one sibling agrees, it's flagged. The edges snap to the nearest shot cut.
      stats:
          - value: "31.25"
            label: audio hashes a second
          - value: "32-bit"
            label: hash per frame
          - value: "33"
            label: frequency bands
      video:
          src: /work/watch/finding-the-intro.mp4
          poster: /work/watch/finding-the-intro.jpg
          captions: /work/watch/finding-the-intro.vtt
          seconds: 67
          transcript: |
              Every episode of a show has an intro, and nothing tells you where it is. I wanted a skip intro button anyway,
              so Watch listens for it. It turns the audio into one channel at eight kilohertz. Thirty-one times a
              second, it checks how the loudness shifts between neighbouring pitches. Thirty-three bands, from the
              low end of a voice to the top of it. Each moment becomes a thirty-two bit hash, a tiny barcode of the
              sound. It's written in plain Node, because the ffmpeg build had no fingerprint library. Now take two
              episodes from the same season. Watch slides one barcode strip past the other. Where the same theme
              song plays, the hashes line up and light up. One match could be luck, so other episodes vote. The
              stretch most of them share is the intro. If only one episode agrees, it gets flagged instead of
              trusted. Finally the edges snap to the nearest cut in the picture. Skip intro lands right where the
              story starts, with nobody marking a thing.
    - id: smaller-files
      title: A third smaller, same picture.
      kicker: Encoding
      body: |
          I tuned the 1080p stream and measured it on one 4K source episode. The bitrate cap went from 8 to 5 Mbps and the quality setting from 19 to 21. The file went from 1.48 GB to 0.94 GB, about 36% smaller. SSIM, a measure of how close the picture is to the source, moved from 0.913 to 0.911, with no visible difference at 100% crop. A faster encoder preset gave the same size and picture, and encoding went from 1.0× to 2.3× real time.

          One decode now feeds both the 1080p and 720p versions, and the first three segments are 2 seconds long so playback starts fast.
      stats:
          - value: "36%"
            label: smaller at 1080p
          - value: "0.913 → 0.911"
            label: SSIM, before and after
          - value: "2.3×"
            label: real-time encoding speed
      image:
          src: /work/watch/smaller-files.jpg
          alt: Two file bars side by side, 1.48 GB and 0.94 GB, over two matching frames from an invented test clip, with the SSIM scores 0.913 and 0.911 underneath.
          width: 1920
          height: 1080
    - id: home-beats-remote
      title: Home wins if it answers in 300 ms.
      kicker: Playback
      body: |
          At home, video should come straight off the home network. Away, it has to come the long way.

          The player pings both paths at once. If the home path answers within 300 ms, it wins. Otherwise the remote path plays. It checks again during an episode, so walking out of the house doesn't stop the show.
      image:
          src: /work/watch/home-beats-remote.jpg
          alt: The Watch player on a phone showing an invented episode with a Skip Intro button, and a paper diagram of two paths racing, a home path at 300 ms and a remote path.
          width: 1920
          height: 1080
more:
    - It also finds the recap and the credits. For credits it looks for shared closing audio, then a run of dark frames, then falls back to 30 seconds before the end.
---

I built Watch by directing AI coding agents. The design and the decisions are mine.
