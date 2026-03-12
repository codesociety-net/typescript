// Facade Pattern – Production
// Single convert() call hides codec detection, transcoding,
// thumbnail extraction, and metadata writing.

// ── Subsystems (stubs simulating real libraries) ───────────────────────────────

export class CodecDetector {
  detect(filePath: string): string {
    const ext = filePath.split(".").pop() ?? "";
    const map: Record<string, string> = { mp4: "h264", mkv: "h265", avi: "xvid" };
    return map[ext] ?? "unknown";
  }
}

export class VideoTranscoder {
  transcode(input: string, output: string, codec: string): void {
    console.log(`[Transcoder] ${input} → ${output} using ${codec}`);
  }
}

export class ThumbnailExtractor {
  extract(input: string, timecodeSec: number): string {
    const thumb = input.replace(/\.\w+$/, "_thumb.jpg");
    console.log(`[Thumbnailer] extracted frame at ${timecodeSec}s → ${thumb}`);
    return thumb;
  }
}

export class MetadataWriter {
  write(filePath: string, meta: Record<string, string>): void {
    console.log(`[Metadata] wrote to ${filePath}:`, meta);
  }
}

// ── Options & result ───────────────────────────────────────────────────────────

export interface ConversionOptions {
  outputFormat: "mp4" | "webm" | "mov";
  thumbnailAt?: number; // seconds into video
  metadata?: Record<string, string>;
}

export interface ConversionResult {
  outputPath: string;
  thumbnailPath: string | null;
  detectedCodec: string;
}

// ── Facade ────────────────────────────────────────────────────────────────────

export class MediaConversionFacade {
  private detector = new CodecDetector();
  private transcoder = new VideoTranscoder();
  private thumbnailer = new ThumbnailExtractor();
  private metaWriter = new MetadataWriter();

  convert(inputPath: string, opts: ConversionOptions): ConversionResult {
    const codec = this.detector.detect(inputPath);
    const outputPath = inputPath.replace(/\.\w+$/, `.${opts.outputFormat}`);

    this.transcoder.transcode(inputPath, outputPath, codec);

    const thumbnailPath =
      opts.thumbnailAt !== undefined
        ? this.thumbnailer.extract(inputPath, opts.thumbnailAt)
        : null;

    if (opts.metadata) {
      this.metaWriter.write(outputPath, opts.metadata);
    }

    return { outputPath, thumbnailPath, detectedCodec: codec };
  }
}


// Demo (runs when executed directly)
if (import.meta.url === `file://${process.argv[1]}`) {
  // ── Usage ──────────────────────────────────────────────────────────────────────
  const facade = new MediaConversionFacade();
  const result = facade.convert("lecture.mkv", {
    outputFormat: "mp4",
    thumbnailAt: 5,
    metadata: { title: "Lecture 1", author: "Prof. Smith" },
  });
  console.log("Done:", result);
}
