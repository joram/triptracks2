import json
import os


def get_sitemap_urls(website):
    website = website.rstrip("/")
    pwd = os.path.dirname(os.path.realpath(__file__))
    slug_url = website.replace("https://", "").replace("http://", "").replace("/", "_").rstrip("/")
    filepath = os.path.join(pwd, f"../../data/sitemaps/{slug_url}.sitemap.json")
    if os.path.exists(filepath):
        with open(filepath, "r") as f:
            return json.load(f)

    try:

        from usp.tree import sitemap_tree_for_homepage

        tree = sitemap_tree_for_homepage(website)
        sitemap = tree.all_pages()
        sitemap = [page.url for page in sitemap]
    except Exception as e:
        print(e)
        return []
    if len(sitemap) == 0:
        return []

    dir = os.path.dirname(filepath)
    if not os.path.exists(dir):
        os.makedirs(dir)

    with open(filepath, "w") as f:
        json.dump(sitemap, f)
    return sitemap
