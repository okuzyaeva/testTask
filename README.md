# Video Upload from AWS S3 to Facebook

This project demonstrates an example of uploading a video from AWS S3 to Facebook using the Facebook API. The example is derived from a larger project I previously worked on. However, this version is isolated from the original context and will not function as a complete solution. The purpose of this example is to showcase an interesting technical challenge I worked on and highlight my experience in writing code.

## Problem Statement

Facebook has a specific API for uploading videos to a user's page (at least, this was the case when I wrote this code; it may have changed since then). Unlike platforms such as Pinterest, where you can provide a link to a video file and have it uploaded automatically, Facebook requires videos to be uploaded in chunks.

Uploading a video to Facebook involves three phases:

1. **Initiating the Upload:**
   - Send the total file size to Facebook.
   - Receive a `sessionId` to be used in the next steps.

2. **Uploading the Video in Chunks:**
   - Use the `sessionId` to send video chunks sequentially.

3. **Completing the Upload:**
   - Finalize the upload and receive confirmation from Facebook.

## Solution

To enable chunked video uploads from AWS S3 to Facebook, I implemented an iterator function called `createChunkDownloader`. This function contains a generator, `chunkDownloader`, which retrieves video chunks from S3 and forwards them for upload to Facebook.

Key aspects of the implementation:

- The iterator function accepts the chunk size and total file size as parameters.
- It fetches specific byte ranges from the S3 video file using `downloadRange` until the entire file is processed.
- An `asyncRetry` wrapper is used around S3 requests to handle potential failures:
  - If a request fails during video retrieval, it retries multiple times.
  - A timeout mechanism ensures that unresponsive requests are handled properly.
- If an error occurs during the Facebook upload, the process is terminated and the error is returned.

## Code Structure and Flow

### 1. Facebook Video Publishing Logic
   - Located in `facebookService`.
   - The function `safePostPublication` contains the core logic for publishing videos to Facebook.
   - Only the relevant portion for video uploads is retained.

### 2. AWS S3 Video Download Logic
   - Found in `utils/aws`.
   - The function `downloadFileByChunks` utilizes `createChunkDownloader` to retrieve video chunks from S3.
   - `createChunkDownloader` iterates over the file and fetches specified byte ranges.

### 3. Facebook API Video Upload Logic
   - Implemented in `facebookClient`.
   - Handles interactions with Facebook's API for chunked video uploads.

### 4. Testing
   - Tests were originally designed for a larger project.
   - Some test cases include extra functionality unrelated to this isolated example.
   - The primary test logic for video uploads is in `mockVideoPublicationPostByDestination` within `test/facebook/utils`.

## How to Use

To explore the logic behind this solution, follow this order:
1. **Start with `facebookService.safePostPublication`** – This contains the core Facebook video upload logic.
2. **Move to `utils/aws`** – Understand how videos are fetched from S3 using chunk downloading.
3. **Check `facebookClient`** – Learn how Facebook's API is used for video uploads.
4. **Review the test cases (`test/facebook/utils`)** – Focus on `mockVideoPublicationPostByDestination` for the main video upload tests.

## Notes
- This is a partial implementation meant for demonstration purposes.
- The logic for authentication and other necessary configurations for Facebook and AWS S3 are omitted.
- If Facebook's API has changed, adjustments may be required.

---

This project serves as an example of efficiently handling large video uploads using AWS S3 and Facebook's chunked upload API. If you have any questions or need further details, feel free to reach out!