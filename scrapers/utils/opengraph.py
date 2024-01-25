from bs4 import BeautifulSoup


def parse(soup: BeautifulSoup):
    og = {}
    for meta in soup.findAll('meta'):
        if meta.has_attr('property') and meta['property'].startswith('og:'):
            og[meta['property'].replace('og:', '')] = meta['content']
        if meta.has_attr('property') and meta['property'].startswith('product:'):
            og[meta['property'].replace('product:', '')] = meta['content']

    return og