
import os
import csv

"""

      var con = mysql.createConnection({
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_UPGRADED_NAME
      });

"""
HTTPS = 'https://'
HTTP = 'http://'
BASE_URL = 'dalissaevents.com'
DATABASE = os.getenv('DATABASE_UPGRADED_NAME')
HOST = os.getenv('DATABASE_HOST')
USER = os.getenv('DATABASE_USER')
PASSWORD = os.getenv('DATABASE_PASSWORD')

url = HTTPS + BASE_URL
from bs4 import BeautifulSoup
import requests

categories = [
    'tables',
    'centerpieces',
    'candy-carts',
    'decor',
    'pipe-drape',
    'drinkware',
    'flowers-plants-trees-topiaries-1',
    'lighting-decor',
    'linen',
    'marquee-led-signs',
    'pedestals-plinths',
    'serveware',
    'teaware-coffeeware',
    'throne-chairs',
    'kids-collection',
    'candelabras'
]

# Steps :
# 1. Access the page
# 2. Access the categories page
# 3. Get the category's name
# Check if the category exists in the database
# If it does not exist, add it to the database
# If it exists, skip it
# 4. Get the category's list of items
# 5. For each item in the list, get the item's name
# Check if the item exists in the database for the category
# If it does not exist, add it to the database
# If it exists, skip it
# 6. Get the item's price
# 7. Get the item's description
# 8. Get the item's image
# 9. Get the item's link
with open('dalissa_events.csv', 'w') as csv_file:
    csv_writer = csv.writer(csv_file)
    csv_writer.writerow(['categoryName', 'ItemName',  'Description', 'unitPrice', 'Image'])
    for category_url in categories:
        current_url = url + '/' + category_url
        current_page = requests.get(current_url)
        current_soup = BeautifulSoup(current_page.content, 'html.parser')
        # find the category by xpath
        category_element_title = current_soup.findByXpath('/html/body/div[1]/main/article/section/div[2]/div/div/div/div/div[1]/div/div/h4')
        category_title = category_element_title.text
        # find all the items cards 
        all_items_cards = current_soup.find_all('gspro-item-card')
        for item_card in all_items_cards:
            # find the item's title
            h3_containing_title_ = item_card.findByXpath('/html/body/div[1]/main/article/section/div[2]/div/div/div/div/div[2]/div/div[1]/gspro-item-list/div/gspro-item-card[1]/div[2]/h3')
            item_title = h3_containing_title_.text
            # find the item's price by css selector
            div_price = item_card.find('div', class_='div.gspro-gallery-viewer:nth-child(1) > gspro-item-list:nth-child(1) > div:nth-child(1) > gspro-item-card:nth-child(1) > div:nth-child(2) > div:nth-child(2)')
            item_price_with_dollar_sign_and_per_day = div_price.text
            item_price = item_price_with_dollar_sign_and_per_day.replace('$', '').replace('/day', '')
            description = "will-get-it-later"
            csv_writer.writerow([category_title, item_title, description , item_price, 'url-later'])


        """
            /html/body/div[1]/main/article/section/div[2]/div/div/div/div/div[2]/div/div[1]/gspro-item-list/div/gspro-item-card[1]/div[2]/h3/a
        """



