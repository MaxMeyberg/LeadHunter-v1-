from apify_client import ApifyClient
from dotenv import load_dotenv
import os
import json

load_dotenv("../.env")

def APIFY_LinkedIn_WebScrape(url: str) -> str: 
    API_TOKEN = os.getenv("APIFY_API_TOKEN")
    client = ApifyClient(API_TOKEN)

    if API_TOKEN is None:
        return json.dumps({"error": "No API token found"})


    """
    API DOCS STUFF, DONT TOUCH
    -----
    """
    # Prepare the Actor input .
    run_input = { "profileUrls": [
            url
        ] }

    # Run the Actor and wait for it to finish, the "2SyF0bVxmgGr8IVCZ" is just the ID for Apify ,DONT be stupid and touch it, I got it from the Docs
    run = client.actor("2SyF0bVxmgGr8IVCZ").call(run_input=run_input)

    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        break  # Only take the first item

    # Ensure keys exist before accessing them
    about = item.get("about", "")
    headline = item.get("headline", "")
    email = item.get("email", "")
    fullName = item.get("fullName", "")

    result = {
        "about": about,
        "headline": headline,
        "email": email,
        "fullName": fullName
    }

    return json.dumps(result, indent=2)
