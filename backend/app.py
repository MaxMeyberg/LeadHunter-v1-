from API_services.apify import APIFY_LinkedIn_WebScrape

#Important stuff to run


#Stick in Resume
#Stick in linkedin link



#Output:
#email
#cold_email message to them
def main():
    url = "https://www.linkedin.com/in/jeff-price-9186173/"
    print(APIFY_LinkedIn_WebScrape(url))
    

    
if __name__ == "__main__":
    main()


