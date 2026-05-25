export function uploadToS3(
  presignedUrl: string,
  blob: Blob,
  onProgress?: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", "video/mp4");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        console.error("[S3 upload] HTTP", xhr.status, xhr.statusText);
        console.error("[S3 upload] Response:", xhr.responseText?.slice(0, 1000));
        // Try to extract S3 error code from XML response
        const codeMatch = xhr.responseText?.match(/<Code>([^<]+)<\/Code>/);
        const msgMatch = xhr.responseText?.match(/<Message>([^<]+)<\/Message>/);
        const detail = codeMatch
          ? `${codeMatch[1]}${msgMatch ? `: ${msgMatch[1]}` : ""}`
          : `${xhr.status} ${xhr.statusText}`;
        reject(new Error(`S3 upload failed — ${detail}`));
      }
    });

    xhr.addEventListener("error", () => {
      console.error(
        "[S3 upload] Network error — likely CORS. Check the bucket CORS policy allows PUT from this origin.",
      );
      reject(
        new Error(
          "S3 upload blocked (CORS or network). Check bucket CORS policy allows PUT from this origin.",
        ),
      );
    });

    xhr.addEventListener("abort", () => reject(new Error("S3 upload aborted")));

    xhr.send(blob);
  });
}
