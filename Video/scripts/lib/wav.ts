import { readFileSync, writeFileSync } from "node:fs";

export type Pcm = { sampleRate: number; channels: number; data: Float32Array[] };

/** Read a 16-bit PCM or 32-bit float WAV into float channels. */
export function readWav(file: string): Pcm {
    const buf = readFileSync(file);
    if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WAVE") {
        throw new Error(`${file} is not a WAV file`);
    }
    let off = 12;
    let fmt: { format: number; channels: number; rate: number; bits: number } | undefined;
    while (off + 8 <= buf.length) {
        const id = buf.toString("ascii", off, off + 4);
        const size = buf.readUInt32LE(off + 4);
        const body = off + 8;
        if (id === "fmt ") {
            fmt = {
                format: buf.readUInt16LE(body),
                channels: buf.readUInt16LE(body + 2),
                rate: buf.readUInt32LE(body + 4),
                bits: buf.readUInt16LE(body + 14),
            };
        } else if (id === "data" && fmt) {
            const bytes = fmt.bits / 8;
            const frames = Math.floor(size / (bytes * fmt.channels));
            const data = Array.from({ length: fmt.channels }, () => new Float32Array(frames));
            for (let i = 0; i < frames; i++) {
                for (let c = 0; c < fmt.channels; c++) {
                    const p = body + (i * fmt.channels + c) * bytes;
                    data[c][i] = fmt.format === 3 ? buf.readFloatLE(p) : buf.readInt16LE(p) / 32768;
                }
            }
            return { sampleRate: fmt.rate, channels: fmt.channels, data };
        }
        off = body + size + (size % 2);
    }
    throw new Error(`${file}: no audio data found`);
}

/** Write float channels as a 16-bit PCM WAV. */
export function writeWav(file: string, pcm: Pcm): void {
    const frames = pcm.data[0].length;
    const ch = pcm.channels;
    const buf = Buffer.alloc(44 + frames * ch * 2);
    buf.write("RIFF", 0, "ascii");
    buf.writeUInt32LE(36 + frames * ch * 2, 4);
    buf.write("WAVE", 8, "ascii");
    buf.write("fmt ", 12, "ascii");
    buf.writeUInt32LE(16, 16);
    buf.writeUInt16LE(1, 20);
    buf.writeUInt16LE(ch, 22);
    buf.writeUInt32LE(pcm.sampleRate, 24);
    buf.writeUInt32LE(pcm.sampleRate * ch * 2, 28);
    buf.writeUInt16LE(ch * 2, 32);
    buf.writeUInt16LE(16, 34);
    buf.write("data", 36, "ascii");
    buf.writeUInt32LE(frames * ch * 2, 40);
    let p = 44;
    for (let i = 0; i < frames; i++) {
        for (let c = 0; c < ch; c++) {
            const v = Math.max(-1, Math.min(1, pcm.data[c][i]));
            buf.writeInt16LE(Math.round(v * 32767), p);
            p += 2;
        }
    }
    writeFileSync(file, buf);
}
