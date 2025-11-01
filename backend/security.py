import re
from urllib.parse import urlparse

# List of blocked domains
BLOCKED_DOMAINS = ["example-scam.com", "badwebsite.net", "phishing-site.org"]

# Suspicious TLDs commonly used in phishing attacks
SUSPICIOUS_TLDS = {"zip", "xyz", "top", "info", "buzz", "click", "work", "gq", "tk"}

def is_blocked_domain(url: str) -> bool:
    """Check if the URL contains a blocked domain."""
    domain = urlparse(url).netloc
    for blocked in BLOCKED_DOMAINS:
        if domain.endswith(blocked):
            return True
    return False

def is_suspicious_url(url: str) -> bool:
    """Check if the URL has suspicious patterns (too many subdomains, bad TLDs)."""
    parsed_url = urlparse(url)
    domain = parsed_url.netloc
    
    # Check for excessive subdomains (e.g., "weird.sub.suspicious.com")
    subdomains = domain.split(".")
    if len(subdomains) > 3:  # Adjust threshold if needed
        return True

    # Check for unusual TLDs
    tld = subdomains[-1]
    if tld in SUSPICIOUS_TLDS:
        return True

    # Check for hexadecimal patterns in domain (common in phishing URLs)
    if re.search(r"[0-9a-f]{8,}", domain):  
        return True

    return False

def validate_url_format(url: str):
    """Validate the URL format."""
    regex = r'^(https?://)?([a-z0-9]+([-.][a-z0-9]+)*\.[a-z]{2,})'
    if not re.match(regex, url):
        raise ValueError("Invalid URL format.")

def check_url_security(url: str) -> bool:
    """Perform security checks on a URL."""
    if is_blocked_domain(url):
        print("❌ URL is in the blocked domain list!")
        return False

    if is_suspicious_url(url):
        print("⚠️ URL looks suspicious based on domain analysis.")
        return False

    # try:
    #     validate_url_format(url)
    # except ValueError as e:
    #     print(f"❌ URL validation failed: {e}")
    #     return False

    print("✅ URL passed security checks.")
    return True

# # Test cases
# test_urls = [
#     "https://goodwebsite.com",
#     "https://badwebsite.net/login",
#     "http://weird.sub.suspicious.com",
#     "https://example.zip",
#     "http://1337h4x0r.tk",
#     "https://youtu.be/S0EUmPQuEpQ?si=z79TY1U_W1QT2bSK"
# ]

# for url in test_urls:
#     print(f"\nChecking: {url}")
#     check_url_security(url)
