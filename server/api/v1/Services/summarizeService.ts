import Anthropic from "@anthropic-ai/sdk";
import type { Response } from "express";

const anthropic = new Anthropic();

const SYSTEM_PROMPT =
  "You are an insurance claims analyst. Given a claim and its associated policy details, write a concise 2-3 sentence professional summary suitable for a claims manager review. Be factual and objective.";

export async function streamClaimSummary(
  claim: {
    description: string;
    claim_status: string;
    claim_date: string;
    type: string;
    coverage_amount: number;
  },
  res: Response
): Promise<void> {

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const userMessage = `Policy type: ${claim.type}
Coverage: $${claim.coverage_amount}
Date: ${claim.claim_date}
Status: ${claim.claim_status}
Description: ${claim.description}

Write a concise professional summary of this insurance claim.`;

  try {
    const stream = anthropic.messages.stream({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [{ role: "user", content: userMessage }],
    });

    stream.on("text", (text) => {
      if (!res.writableEnded) res.write(`data: ${text}\n\n`);
    });

    await stream.finalMessage();
    if (!res.writableEnded) res.write("data: [DONE]\n\n");
  } catch {
    res.write("data: [ERROR]\n\n");
  } finally {
    res.end();
  }
}
