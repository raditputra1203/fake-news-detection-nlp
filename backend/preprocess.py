"""
preprocess.py
─────────────
Preprocessing pipeline for the fake-news DistilBERT model.
Mirrors the logic in 00_data_preparation.ipynb exactly.
"""

import re

# Regex patterns (compiled once at import time)
PUBLISHER_PATTERN = re.compile(
    r'^[A-Z\s,\.]+\s*\([^)]+\)\s*[-\u2013]\s*',
    re.MULTILINE
)
URL_RE   = re.compile(r'http\S+|www\.\S+|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}')
PUNCT_RE = re.compile(r'[^a-zA-Z\s]')


# Remove publisher / dateline headers
def remove_metadata(text: str) -> str:
    """Strip leading publisher tags like 'WASHINGTON (Reuters) - '."""
    if not isinstance(text, str):
        return ''
    return PUBLISHER_PATTERN.sub('', text).strip()


# Light normalisation (no stemming / no stopword removal)
def preprocess_base(text: str) -> str:
    """
    DL / BERT preprocessing:
      lowercase → strip URLs & IPs → strip punctuation → collapse whitespace
    Intentionally keeps stopwords and word roots so DistilBERT can use them.
    """
    text = text.lower()
    text = URL_RE.sub(' ', text)
    text = PUNCT_RE.sub(' ', text)
    return re.sub(r'\s+', ' ', text).strip()


# Public entry-point
def prepare_for_distilbert(title: str = '', body: str = '') -> str:
    """
    Full pipeline for a single article before DistilBERT tokenisation.

    Steps
    -----
    1. Remove publisher/dateline metadata from the body.
    2. Concatenate title + cleaned body  (mirrors `text_combined` column).
    3. Apply DL normalisation.

    Parameters
    ----------
    title : str   Article headline (may be empty).
    body  : str   Article body text.

    Returns
    -------
    str  Preprocessed text ready for the tokeniser.
    """
    clean_body   = remove_metadata(body)
    combined     = f"{title.strip()} {clean_body}".strip()
    preprocessed = preprocess_base(combined)
    return preprocessed


# Quick self-test
if __name__ == '__main__':
    sample_title = "Trump drops Steve Bannon from National Security Council"
    sample_body  = (
        "WASHINGTON (Reuters) - U.S. President Donald Trump on Wednesday "
        "removed his chief strategist Steve Bannon from the National Security "
        "Council's principals committee, reversing an earlier decision."
    )
    result = prepare_for_distilbert(sample_title, sample_body)
    print("Input title :", sample_title)
    print("Input body  :", sample_body[:80], "...")
    print("Output      :", result[:120], "...")
