# Contributing

This project is open source. You may contribute to the project by submitting a Pull Request on the GitHub repo.

## Map Contributions

<h3><b>WE ONLY ACCEPT NEW CONTRIBUTIONS ON REDDIT</b></h3>

To contribute to the map, we require a certain format for artwork region and labels. This can be generated on the [contributing page](https://place-atlas.stefanocoding.me/index.html?mode=draw) on the website. 

### Reddit Submission

1. Follow the instructions on the [contributing page](https://place-atlas.stefanocoding.me/index.html?mode=draw), then click "Post Direct to Reddit".
2. Flair your post with the "New Entry" tag.
3. A moderator will accept your contribution shortly.

<!--

### GitHub Submission

1. Create a fork of our repo.
2. Enter your data into the `web/_js/atlas.js` file, with the correct format and ID number.
3. Create a Pull Request.

-->

## Map Edits

1. Create a fork of our repo.
2. Enter your data into the `web/_js/atlas.json` file, with the correct format and ID number.
3. Create a Pull Request against the `/cleanup` branch.

## Cleaning Contributions

If you spot a duplicate, please PR against `/cleanup`. To help find duplicates, run the code locally, changing line 92 of `main.js` to `overlap`.