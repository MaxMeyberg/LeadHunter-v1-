from apify_client import ApifyClient
from dotenv import load_dotenv
#import json
import os #needed for API calls to work
load_dotenv("./.env")

"""
    Input: url from linkedin

    Output: user email
"""
def APIFY_LinkedIn_WebScrape(url: str) -> str: 
    

    API_TOKEN = os.getenv("APIFY_API_TOKEN")
    # Initialize the ApifyClient with your API token
    client = ApifyClient(API_TOKEN)

    # Check if API token is available
    #-----TEMP
    # for key, value in os.environ.items():
    #     print(f"{key}: {value}")
    #----
    if API_TOKEN == None:
        return "No API token found"



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

    # Fetch and print Actor results from the run's dataset (if there are any)
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        continue

    """
    Ok, you can write below here :)
    -----
    """

    #test to see if we even found an email:
    if item["email"] == None:
        return None
    return item["email"]

