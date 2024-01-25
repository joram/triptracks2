import os
import re
import time

import playwright
import requests
import json
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright


class FailedRequest(Exception):
    pass


_browser = None
def get_browser():
    global _browser
    if _browser is None:
        _browser = sync_playwright().start().chromium.launch()
    return _browser

class BaseScraper(object):
    FILETYPE = "json"

    def __init__(self, debug=False):
        self.debug = debug
        self.wait = 1
        self.items_count = 0
        self._data_dir = None
        self._data_raw_dir = None
        self.base_url = ""
        self.extension = "html"

    @property
    def data_dir(self):
        if self._data_dir is None:
            dir_path = os.path.dirname(os.path.realpath(__file__))
            data_dir = os.path.join(dir_path, "../data/", self.__class__.__name__, "./")
            data_dir = os.path.abspath(data_dir)
            if not os.path.exists(data_dir):
                os.makedirs(data_dir)
            self._data_dir = data_dir
        return self._data_dir

    def item_filepath(self, id):
        if not id.endswith(".{}".format(self.FILETYPE)):
            id += ".{}".format(self.FILETYPE)
        filepath = os.path.join(self.data_dir, "./{}".format(id))
        filepath = os.path.abspath(filepath)
        return filepath

    def have_item(self, filepath):
        return os.path.exists(filepath)

    def store_item(self, filepath, data):
        with open(filepath, "wb") as f:
            f.write(data)

    def get_item(self, filepath):
        with open(filepath, "r") as f:
            return f.read()

    def item_urls(self):
        raise NotImplemented()

    def item_cache_filepath(self, url):
        raise NotImplemented()

    def items(self):
        for url in self.item_urls():
            yield self.get_content(url)

    def json_items(self):
        for url in self.item_urls():
            yield json.loads(self.get_content(url))

    def get_uncached_content(self, url):
        if self.debug:
            print("downloading {}".format(url))
        time.sleep(self.wait)
        attempts = 0
        while attempts < 5:
            page = get_browser().new_page(user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ")
            try:
                page.goto(url)
                content = page.content()
                page.close()
                return content
            except:
                attempts += 1
                page.close()
                time.sleep(1)
        return None

    def get_content(self, url):

        # check cache
        cache_filepath = self.item_cache_filepath(url)
        if self.have_item(cache_filepath):
            if self.debug:
                print("loading cached {}".format(url))
            return self.get_item(cache_filepath)

        content = self.get_uncached_content(url)

        # update cache
        path = os.path.dirname(cache_filepath)
        if not os.path.exists(path):
            os.makedirs(path)
        with open(cache_filepath, "w") as f:
            f.write(content)

        return content

    def get_soup(self, url):
        html = self.get_content(url)
        soup = BeautifulSoup(html, features="html.parser")
        return soup

    def get_metadata(self, soup):
        data = {}

        # opengraph data
        for tag in soup.findAll(property=re.compile(r'^og')):
            key = tag["property"].replace("og:", "")
            val = tag["content"]
            data[key] = val

        # facebook data
        for tag in soup.findAll(property=re.compile(r'^fb')):
            key = tag["property"].replace("fb:", "")
            val = tag["content"]
            data[key] = val

        return data

    def item_cache_filepath(self, url):
        url = url.rstrip("/")
        url = url.replace("https://", "").replace("http://", "").replace("/", "_").rstrip("/")
        url = url.replace("?", "_").replace("=", "_").replace("&", "_")
        filepath = os.path.join(self.data_dir, "./{}".format(url))
        filepath = os.path.abspath(filepath)
        if not filepath.endswith(".html"):
            filepath += ".html"
        return filepath
