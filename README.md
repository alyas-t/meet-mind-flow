

**MeetingScribe**

## ✨ What It Does
* **Capture** – Streams microphone audio from any lecture or meeting directly to AWS Transcribe for speech‑to‑text.
* **Summarize** – Uses Amazon Bedrock LLMs to surface key points and extract actionable tasks every few seconds.
* **Display** – Shows a live two‑column panel: scrolling transcript on the left, continuously updating “Key Points” and “Action Items” on the right.
* **Store** – Saves transcripts indefinitely in S3 while auto‑purging raw audio after 30 days; users can revisit any session in a chronological dashboard.
* **Track** – Keeps an internal checklist of tasks with in‑app badges for pending items.

---

## 🏗️ High‑Level Stack
| Layer | Service / Tech |
|---|---|
| Front‑end | React + Vite (served via AWS Amplify or S3 + CloudFront) |
| Auth | Amazon Cognito (email/password & Google OAuth) |
| Real‑time audio | Web Audio API ➜ WebSocket ➜ API Gateway |
| Speech‑to‑text | **Amazon Transcribe Streaming** |
| Summaries / AIs | **Amazon Bedrock** (Claude or Llama 3) |
| Orchestration | **AWS Lambda** |
| Data | DynamoDB (metadata) • S3 (audio + transcripts) |
| Notifications | API Gateway WebSocket ➜ React context |
| Analytics & logs | CloudWatch, AWS Pinpoint (future) |

---

## 🚀 Getting Started (Local Dev)

### 1. Prerequisites
* **Node.js ≥ 18**
* **AWS account** with permissions for Transcribe, Bedrock, S3, DynamoDB, Cognito, API Gateway, and Lambda.
* **AWS CLI** configured locally (`aws configure`).

### 2. Clone & Install
```bash
# Clone the repo
$ git clone https://github.com/alyas-t/meet-mind-flow.git
$ cd intelligent‑meeting‑assistant

# Install front‑end dependencies
$ npm install



**Start Dev Server**

$ npm run dev




