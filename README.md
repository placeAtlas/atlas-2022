# The 2022 Place Atlas
The /r/place Atlas is a project aiming to catalog all the artworks created during Reddit's 2022 /r/place event.
This project was created by Roland Rytz and is licensed under the GNU Affero General Public License v3.0.

---

*You can check out the website by clicking [here](https://place-atlas.stefanocoding.me/).*

If you don't know GitHub and wanted to submit new entries or request changes to existing ones, please visit [/r/placeAtlas2](https://www.reddit.com/r/placeAtlas2/).

## How To Contribute

### Map Contributions

**WE ONLY ACCEPT NEW CONTRIBUTIONS ON REDDIT!**

To contribute to the map, we require a certain format for artwork region and labels. This can be generated on the [contributing page](https://place-atlas.stefanocoding.me/index.html?mode=draw) on the website. 

#### Reddit Submission

1. Follow the instructions on the [contributing page](https://place-atlas.stefanocoding.me/index.html?mode=draw), then click "Post Direct to Reddit".
2. Flair your post with the "New Entry" tag.
3. A moderator will accept your contribution shortly.

<!--

#### GitHub Submission

1. Create a fork of our repo.
2. Enter your data into the `web/_js/atlas.js` file, with the correct format and ID number.
3. Create a Pull Request.

-->

### Map Edits

1. Create a fork of our repo.
2. Enter your data into the `web/_js/atlas.json` file, with the correct format and ID number.
3. Create a Pull Request against the `cleanup` branch.

### Cleaning Contributions

If you spot a duplicate, please PR against the `cleanup` branch. To help find duplicates, append `?mode=overlap` to the url: [`https://place-atlas.stefanocoding.me?mode=overlap`](https://place-atlas.stefanocoding.me?mode=overlap).

---

# github pages support
## Setup
1. To allow github-pages rendering, create a `gh-pages` branch then move the web folder to docs.
```bash
git checkout -b gh-pages
git mv web docs
// Update ``.github/workflows/github-actions.yml`` to point to `docs` folder
git add .github/workflows/github-actions.yml
git commit -m "Move web to docs"
git push --set-upstream origin gh-pages
```
2. Then from `Settings` > `Pages`, select the `gh-pages` branch and the `/docs` folder. Then click save.
## Updating
1. Go back to `master`, fetch from upstream, handle conflicts as needed
2. Go back to `gh-pages` and rebase `master`
3. Push