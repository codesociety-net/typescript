import { describe, it, expect } from "vitest";
import {
  CodecDetector,
  ThumbnailExtractor,
  MediaConversionFacade,
} from "./production";

describe("Facade (Production)", () => {
  describe("CodecDetector", () => {
    it("detects h264 for .mp4", () => {
      expect(new CodecDetector().detect("video.mp4")).toBe("h264");
    });

    it("detects h265 for .mkv", () => {
      expect(new CodecDetector().detect("video.mkv")).toBe("h265");
    });

    it("detects xvid for .avi", () => {
      expect(new CodecDetector().detect("video.avi")).toBe("xvid");
    });

    it("returns unknown for unsupported extension", () => {
      expect(new CodecDetector().detect("video.flv")).toBe("unknown");
    });
  });

  describe("ThumbnailExtractor", () => {
    it("replaces extension with _thumb.jpg", () => {
      const thumb = new ThumbnailExtractor().extract("video.mp4", 5);
      expect(thumb).toBe("video_thumb.jpg");
    });
  });

  describe("MediaConversionFacade", () => {
    it("convert returns outputPath with new format extension", () => {
      const facade = new MediaConversionFacade();
      const result = facade.convert("lecture.mkv", { outputFormat: "mp4" });
      expect(result.outputPath).toBe("lecture.mp4");
    });

    it("convert detects codec from input extension", () => {
      const facade = new MediaConversionFacade();
      const result = facade.convert("lecture.mkv", { outputFormat: "mp4" });
      expect(result.detectedCodec).toBe("h265");
    });

    it("convert returns thumbnailPath when thumbnailAt is set", () => {
      const facade = new MediaConversionFacade();
      const result = facade.convert("lecture.mkv", {
        outputFormat: "mp4",
        thumbnailAt: 5,
      });
      expect(result.thumbnailPath).toBe("lecture_thumb.jpg");
    });

    it("convert returns null thumbnailPath when thumbnailAt is omitted", () => {
      const facade = new MediaConversionFacade();
      const result = facade.convert("lecture.mkv", { outputFormat: "mp4" });
      expect(result.thumbnailPath).toBeNull();
    });

    it("convert handles webm output format", () => {
      const facade = new MediaConversionFacade();
      const result = facade.convert("clip.mp4", { outputFormat: "webm" });
      expect(result.outputPath).toBe("clip.webm");
      expect(result.detectedCodec).toBe("h264");
    });

    it("convert handles metadata option without error", () => {
      const facade = new MediaConversionFacade();
      const result = facade.convert("video.avi", {
        outputFormat: "mov",
        metadata: { title: "Test", author: "Tester" },
      });
      expect(result.outputPath).toBe("video.mov");
    });

    it("convert works end-to-end with all options", () => {
      const facade = new MediaConversionFacade();
      const result = facade.convert("film.avi", {
        outputFormat: "mp4",
        thumbnailAt: 10,
        metadata: { title: "Film" },
      });
      expect(result.outputPath).toBe("film.mp4");
      expect(result.thumbnailPath).toBe("film_thumb.jpg");
      expect(result.detectedCodec).toBe("xvid");
    });
  });
});
