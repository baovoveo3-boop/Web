import time
from selenium import webdriver
from selenium.webdriver.edge.options import Options

options = Options()
options.add_argument('--headless')
options.add_argument('--disable-gpu')
options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

try:
    driver = webdriver.Edge(options=options)
    driver.get("https://marketmmoai.com/")
    time.sleep(5)
    body_text = driver.find_element("tag name", "body").text
    
    with open("scraped_content.txt", "w", encoding="utf-8") as f:
        f.write(body_text)
        
    driver.quit()
    print("Scraping completed. Data saved to scraped_content.txt")
except Exception as e:
    print("Error:", e)
