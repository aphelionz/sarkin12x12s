from instascrape import Instascraper

with Instascraper() as insta:
    posts = insta.profile("jonsarkin").timeline_posts()
    posts.filter(lambda p: int(p.id) >= 0)
    posts.download_all(dest="./workspace")
