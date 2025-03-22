from API_services.apify import APIFY_LinkedIn_WebScrape

import requests #used to send API requests

#Important stuff to run

def main():
    url = "https://www.linkedin.com/in/maxmeyberg/"
    print(APIFY_LinkedIn_WebScrape(url))
    

    
if __name__ == "__main__":
    main()


