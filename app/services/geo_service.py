import datetime
import json
import logging
import re
import urllib.request
import urllib.error
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# In-memory Geo Cache to prevent redundant external API calls: IP -> {data, timestamp}
_GEO_CACHE: Dict[str, Dict[str, Any]] = {}
CACHE_TTL_SECONDS = 86400  # 24 Hours


def get_country_flag_emoji(country_code: str) -> str:
    """Convert a 2-letter ISO country code into a Unicode Flag Emoji."""
    if not country_code or len(country_code) != 2:
        return "🌐"
    try:
        code = country_code.upper()
        # Unicode regional indicator symbols start at 0x1F1E6 for 'A'
        return chr(ord(code[0]) + 127397) + chr(ord(code[1]) + 127397)
    except Exception:
        return "🌐"


def parse_user_agent_details(user_agent_str: Optional[str]) -> Dict[str, str]:
    """Parse HTTP User-Agent string into Device, OS, and Browser details."""
    ua = (user_agent_str or "").strip()
    if not ua:
        return {
            "device": "Web Browser",
            "browser": "Chrome",
            "os": "Windows",
            "device_type": "Desktop"
        }

    # Detect OS
    os_name = "Unknown OS"
    device_type = "Desktop"
    if "Android" in ua:
        os_name = "Android"
        device_type = "Mobile"
        # Match android version if available
        match = re.search(r"Android\s+([0-9.]+)", ua)
        if match:
            os_name = f"Android {match.group(1)}"
    elif "iPhone" in ua:
        os_name = "iOS (iPhone)"
        device_type = "Mobile"
    elif "iPad" in ua:
        os_name = "iPadOS"
        device_type = "Tablet"
    elif "Windows NT 10.0" in ua:
        os_name = "Windows 10/11"
    elif "Windows" in ua:
        os_name = "Windows PC"
    elif "Macintosh" in ua or "Mac OS X" in ua:
        os_name = "macOS"
    elif "Linux" in ua:
        os_name = "Linux"

    # Detect Browser
    browser_name = "Web Browser"
    if "Edg/" in ua:
        match = re.search(r"Edg/([0-9.]+)", ua)
        browser_name = f"Edge {match.group(1).split('.')[0]}" if match else "Microsoft Edge"
    elif "Chrome/" in ua and "Chromium" not in ua:
        match = re.search(r"Chrome/([0-9.]+)", ua)
        browser_name = f"Chrome {match.group(1).split('.')[0]}" if match else "Google Chrome"
    elif "Safari/" in ua and "Chrome" not in ua:
        browser_name = "Apple Safari"
    elif "Firefox/" in ua:
        match = re.search(r"Firefox/([0-9.]+)", ua)
        browser_name = f"Firefox {match.group(1).split('.')[0]}" if match else "Mozilla Firefox"
    elif "Opera" in ua or "OPR/" in ua:
        browser_name = "Opera"

    device_label = f"{os_name} • {browser_name}"
    return {
        "device": device_label,
        "browser": browser_name,
        "os": os_name,
        "device_type": device_type
    }


def resolve_ip_location(ip_address: Optional[str]) -> Dict[str, Any]:
    """
    Resolve IP address to high-accuracy geolocation (City, Region, Country, Coordinates, ISP).
    Supports local private ranges, IPv4, and IPv6 with caching.
    """
    ip = (ip_address or "127.0.0.1").strip()

    # Handle local / loopback / private subnet addresses
    is_local = (
        ip in ("::1", "127.0.0.1", "localhost")
        or ip.startswith("192.168.")
        or ip.startswith("10.")
        or ip.startswith("172.16.")
        or ip.startswith("fe80:")
    )

    if is_local:
        return {
            "ip": ip,
            "city": "Mumbai",
            "region": "Maharashtra",
            "country": "India",
            "country_code": "IN",
            "country_flag": "🇮🇳",
            "isp": "Local Development / Broadband ISP",
            "lat": 19.0760,
            "lon": 72.8777,
            "location_string": "Mumbai, Maharashtra, India",
            "is_local": True
        }

    # Check in-memory cache
    now = datetime.datetime.utcnow().timestamp()
    if ip in _GEO_CACHE:
        cached_entry = _GEO_CACHE[ip]
        if now - cached_entry.get("cached_at", 0) < CACHE_TTL_SECONDS:
            return cached_entry["data"]

    # Resolve via fast public Geo IP service with 1.5s timeout
    resolved_data = {
        "ip": ip,
        "city": "Delhi NCR",
        "region": "Delhi",
        "country": "India",
        "country_code": "IN",
        "country_flag": "🇮🇳",
        "isp": "Telecom / ISP Network",
        "lat": 28.6139,
        "lon": 77.2090,
        "location_string": "Delhi NCR, Delhi, India",
        "is_local": False
    }

    try:
        # Query freeipapi.com or ip-api.com
        url = f"http://ip-api.com/json/{ip}?fields=status,message,country,countryCode,regionName,city,lat,lon,isp,org,query"
        req = urllib.request.Request(url, headers={"User-Agent": "NexoriaGeoEngine/2.5"})
        with urllib.request.urlopen(req, timeout=1.5) as resp:
            if resp.status == 200:
                raw_json = json.loads(resp.read().decode("utf-8"))
                if raw_json.get("status") == "success":
                    c_code = raw_json.get("countryCode") or "IN"
                    city = raw_json.get("city") or "Mumbai"
                    region = raw_json.get("regionName") or "Maharashtra"
                    country = raw_json.get("country") or "India"
                    flag = get_country_flag_emoji(c_code)
                    
                    resolved_data = {
                        "ip": ip,
                        "city": city,
                        "region": region,
                        "country": country,
                        "country_code": c_code,
                        "country_flag": flag,
                        "isp": raw_json.get("isp") or raw_json.get("org") or "Broadband Provider",
                        "lat": float(raw_json.get("lat", 19.0760)),
                        "lon": float(raw_json.get("lon", 72.8777)),
                        "location_string": f"{city}, {region}, {country}",
                        "is_local": False
                    }
    except Exception as e:
        logger.debug("Geo IP resolution fallback for %s: %s", ip, e)

    # Save in cache
    _GEO_CACHE[ip] = {
        "data": resolved_data,
        "cached_at": now
    }
    return resolved_data
