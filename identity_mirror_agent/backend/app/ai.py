from typing import List, Optional
from textblob import TextBlob
import os
import httpx

try:
    from anthropic import Anthropic
except Exception:  # pragma: no cover - optional at runtime
    Anthropic = None  # type: ignore

from .config import ANTHROPIC_API_KEY


def detect_sentiment(text: str) -> str:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    if polarity > 0.3:
        return "positive"
    elif polarity < -0.3:
        return "negative"
    else:
        return "neutral"


def _anthropic_client() -> Optional["Anthropic"]:
    if not ANTHROPIC_API_KEY or Anthropic is None:
        return None
    # Optional insecure mode for local dev behind strict proxies
    insecure = os.getenv("AI_INSECURE_SSL") == "1" or os.getenv("TLS_INSECURE") == "1"
    if insecure:
        # Disable SSL verification (DEV ONLY). Consider setting REQUESTS_CA_BUNDLE/SSL_CERT_FILE instead.
        http_client = httpx.Client(verify=False, timeout=30.0)
        return Anthropic(api_key=ANTHROPIC_API_KEY, http_client=http_client)
    return Anthropic(api_key=ANTHROPIC_API_KEY)


def summarize_entry(text: str) -> str:
    """Summarize a single journal entry in 3–4 sentences and detect tone."""
    client = _anthropic_client()
    prompt = (
        "Summarize this user journal entry in 3–4 sentences and detect tone.\n\n"
        f"Entry:\n{text}\n\n"
        "Return only the summary text with tone, no preamble."
    )

    if client is None:
        # Fallback: naive summary
        sentences = text.split('.')
        summary = '.'.join(sentences[:3]).strip()
        tone = detect_sentiment(text)
        return f"Summary: {summary}. Tone: {tone}."

    msg = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=300,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text if hasattr(msg, 'content') else str(msg)


def reflect_over_logs(user_name: str, logs: List[str]) -> str:
    """Generate reflection over last 5 logs."""
    client = _anthropic_client()
    joined = "\n\n".join([f"Entry {i+1}: {t}" for i, t in enumerate(logs)])
    prompt = (
        f"Based on the past {len(logs)} entries from {user_name}, summarize recurring "
        "themes, tone, and personality traits of the user. Write a reflection as if you "
        "were their mirror self, compassionate and honest, 3–5 short paragraphs.\n\n"
        f"Entries:\n{joined}"
    )

    if client is None:
        # Fallback deterministic reflection
        sentiments = [detect_sentiment(t) for t in logs]
        pos = sentiments.count("positive")
        neg = sentiments.count("negative")
        neu = sentiments.count("neutral")
        return (
            f"Mirror Reflection for {user_name}:\n"
            f"I notice a mix of emotions across your recent days (positive: {pos}, neutral: {neu}, negative: {neg}). "
            "Themes of perseverance and self-awareness appear. Keep acknowledging your wins and giving yourself grace."
        )

    msg = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=700,
        messages=[{"role": "user", "content": prompt}],
    )
    return msg.content[0].text if hasattr(msg, 'content') else str(msg)


def mirror_chat(user_name: str, message: str, history: Optional[List[dict]] = None) -> str:
    client = _anthropic_client()
    sys_prompt = (
        f"You are {user_name}'s mirror twin. Respond in their tone, reflecting their patterns. "
        "Be supportive, insightful, and concise. Ask 1 thoughtful follow-up when helpful."
    )

    if client is None:
        # Fallback echo-style mirror
        sentiment = detect_sentiment(message)
        return (
            f"Reflecting back, I hear {sentiment} energy. If you were advising a friend, what would you say now?"
        )

    messages = []
    if history:
        for turn in history[-10:]:
            messages.append({"role": turn.get("role", "user"), "content": turn.get("content", "")})
    messages.append({"role": "user", "content": message})

    msg = client.messages.create(
        model="claude-3-haiku-20240307",
        max_tokens=400,
        messages=[{"role": "user", "content": sys_prompt}] + messages,
    )
    return msg.content[0].text if hasattr(msg, 'content') else str(msg)
