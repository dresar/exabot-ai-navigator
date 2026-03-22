"""
GPT-4 reasoning layer: generates probability estimate + structured reasoning.
Uses the shared OpenAI key pool with automatic key rotation.
"""
import json
import re
from typing import Dict, Any, Optional

from app.integrations.openai_client import chat_completion


SYSTEM_PROMPT = """You are an expert prediction market analyst.
Given an event, market data, and recent news, you will:
1. Estimate the probability (0-100%) that the event resolves YES.
2. Provide a confidence score (0-100) based on available evidence.
3. Explain your reasoning concisely.
4. Identify key supporting factors and risk factors.

Respond ONLY in valid JSON with this exact structure:
{
  "probability": <number 0-100>,
  "confidence": <number 0-100>,
  "reasoning": "<2-3 sentence explanation>",
  "supporting_factors": ["factor1", "factor2"],
  "risk_factors": ["risk1", "risk2"],
  "sentiment_summary": "<brief market sentiment>"
}"""


async def generate_prediction(
    event_name: str,
    event_description: str,
    market_data: Dict[str, Any],
    news_summaries: list[str],
) -> Dict[str, Any]:
    """
    Returns dict with probability, confidence, reasoning, factors.
    Falls back to heuristic on API failure.
    """
    news_block = "\n".join(f"- {s}" for s in news_summaries[:5]) if news_summaries else "No recent news available."

    user_msg = f"""Event: {event_name}
Description: {event_description or "N/A"}

Market Data:
- Current YES price: {market_data.get('yes_price', 0.5):.2%}
- Volume (USD): ${market_data.get('volume_usd', 0):,.0f}
- 24h Change: {market_data.get('change_24h', 0):+.2%}

Recent News:
{news_block}

Analyze this prediction market event and provide your assessment."""

    content = await chat_completion(
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_msg},
        ],
        model="gpt-4o-mini",
        temperature=0.2,
        max_tokens=600,
    )

    if content:
        return _parse_response(content, market_data)

    return _fallback_prediction(market_data)


def _parse_response(content: str, market_data: Dict[str, Any]) -> Dict[str, Any]:
    # Extract JSON from response (handle markdown code blocks)
    json_match = re.search(r"\{[\s\S]*\}", content)
    if json_match:
        try:
            data = json.loads(json_match.group())
            return {
                "probability": max(1, min(99, float(data.get("probability", 50)))),
                "confidence": max(1, min(99, float(data.get("confidence", 50)))),
                "reasoning": str(data.get("reasoning", "Analysis unavailable")),
                "supporting_factors": data.get("supporting_factors", []),
                "risk_factors": data.get("risk_factors", []),
                "sentiment_summary": data.get("sentiment_summary", ""),
            }
        except (json.JSONDecodeError, ValueError):
            pass

    return _fallback_prediction(market_data)


def _fallback_prediction(market_data: Dict[str, Any]) -> Dict[str, Any]:
    yes_price = float(market_data.get("yes_price", 0.5))
    change = float(market_data.get("change_24h", 0))
    prob = yes_price * 100 + change * 10
    return {
        "probability": max(5, min(95, prob)),
        "confidence": 40,
        "reasoning": "AI analysis unavailable. Using market price as proxy probability.",
        "supporting_factors": ["Market price signal"],
        "risk_factors": ["Limited data available", "AI analysis failed"],
        "sentiment_summary": "Neutral",
    }
