# Contributing

This project is open source, and contributions are welcome. In fact, the Atlas relies on user contributions.

You may contribute to the project by submitting a Pull Request on the GitHub repo or sending your submissions through [Reddit](https://www.reddit.com/r/placeAtlas2). Other than that, you can get help from [Discord](https://discord.gg/pJkm23b2nA) or [Reddit](https://www.reddit.com/r/placeAtlas2).

## New Atlas entries

> **Warning**: **WE ONLY ACCEPT NEW ENTRIES ON REDDIT!**

To contribute to the map, we require a certain format for artwork region and labels. This can be generated on [the drawing mode](https://place-atlas.stefanocoding.me?mode=draw) on the website. 

To add a new entry, go to [the drawing mode](https://place-atlas.stefanocoding.me?mode=draw) and draw a shape/polygon around the region you'd like to describe. You can use the <kbd>Undo</kbd>, <kbd>Redo</kbd>, and <kbd>Reset</kbd> buttons to help you creating a good polygon. Make sure that the lines you're drawing don't form a [self-intersecting polygon](https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Complex_polygon.svg/288px-Complex_polygon.svg.png). 

Multiple periods can be added to represent the changing state of the artwork on different times. You can set the start and end period, as well as chosing the appropriate canvas variations. You can also copy the polygon from one period to the other, duplicating a period to be edited later, as well as deleting a period (if there is more than one). An alert is also shown if there are errors for assistance.

When you're happy with the shape you've drawn, press <kbd>Finish</kbd>. You will now be able to enter some information about the highlighted region:

- **Name**: A short, descriptive name.
- **Description**: A short description that will also be understood by somebody not familiar with the topic. Usually, the first sentence on Wikipedia is a good example.
- **Links**: Some links that's either most relevant to the topic, or that was responsible for creating the artwork.
	- **Website**: If you're describing a project, the project's main website would be suitable here.
	- **Subreddit**: Format it like `r/subreddit`.
	- **Discord**: Write the invite code, that the invite link without the `discord.gg/` part.
	- **Wiki**: The page title of [The r/place Wiki](https://place-wiki.stefanocoding.me/).

All fields but the name are optional. For example, a country flag doesn't necessarily need a description.

Once you've entered all the information, you'll be presented with a pop-up window containing some [JSON](https://en.wikipedia.org/wiki/JSON)-formatted data. You can press the <kbd>Post Direct to Reddit</kbd> button and just press the send button on Reddit, or copy the entire JSON text and [create a new text post on the subreddit](https://www.reddit.com/r/placeAtlas2/submit). You don't need to add any other text; just directly send the data. 

Remember to flair your post with <kbd>New Entry</kbd>. On New Reddit, click the <kbd>Flair</kbd> button on the bottom part, and select <kbd>New Entry</kbd>. On Old Reddit, click the <kbd>select</kbd> button on the "choose a flair" section instead.

## Edits to Atlas entries

Other than adding new ones, you can edit existing atlas entries.

### Using the web interface

You can use the website to edit single entries easily. On the website, click <kbd>Edit</kbd> on an entry box. Afterwards, you are now on the drawing mode, editing the entry, in which you can follow the same instructions as [when creating a new entry](#new-atlas-entries). Upon submitting, please flair it as <kbd>Edit Entry</kbd> instead.

As an alternative, you can also submit an issue on GitHub using [this form](https://github.com/placeAtlas/atlas/issues/new?assignees=&labels=entry+update&template=edit-entry.yml).

### Manually

Edits are also welcome on this repository through GitHub. You may use GitHub for bulk or large-scale changes, such as removing duplicates.

`web/atlas.json` is where the Atlas data is located, in which you can edit on GitHub. Below is an example of an entry. The example has been expanded, but please save it in the way so each line is an entry which is minified.

Upon creating a fork of this repository and pushing the changes, create a Pull Request against the `cleanup` branch. A member will merge the pull request if it is adequate.

To help find duplicates, [use the Overlap mode](https://place-atlas.stefanocoding.me?mode=overlap).


### Example

Hereforth is an example of the structured data.

```json5
{
	"id": "tu203o",
	"name": "An entry",
	"description": "This is an entry, it is remarkable.",
	"links": {
		"subreddit": ["placeAtlas2", "subreddit1", "subreddit2"],
		"discord": ["pJkm23b2nA"],
		"website": ["https://example.com"],
		"wiki": ["An_Entry", "An_Entry_2"]
	},
	"path": {
		"109-166, T:0-1": [
			[1527, 1712],
			[1625, 1712],
			[1625, 1682]
		]
	},
	"center": {
		"109-166, T:0-1": [1639, 1754]
	}
}
```

`109-166, T:0-1` has this meaning.
  - `109-166`: Default canvas variation (r/place), period [109](https://place-atlas.stefanocoding.me/#/109) to [166](https://place-atlas.stefanocoding.me/#/166).
  - `T:0-1`: "The Final Clean" canvas variation, period [0](https://place-atlas.stefanocoding.me/#/T:0) (The Final Clean) to [1](https://place-atlas.stefanocoding.me/#/T:1) (Unofficial Corrections).

## Development

Other than contributing to the Atlas data, code contributions are also accepted. Here are some information regarding some aspects on the repository.

### Web interface

This website is built using classic HTML 5 (no JS frameworks such as Vue, React, etc are used). Bootstrap 5 is used as a CSS framework.

Opening the HTML file on your browser is adequate enough to edit. If it doesn't work, you can try running a local HTTP server.

```sh
# Run it inside the web/ folder.
cd web 

# Choose one of the following.
# Python 2
python -m SimpleHTTPServer 8000
# Python 3
python -m http.server 8000
# Node.js (http-server)
npx http-server
# Node.js (serve)
npx serve
```

### Tools

The `tools` folder have various scripts for the maintainance of the project, such as...

- Adding submitted entries from the subreddit
- Formatting/tidying up the data 
- Building the site for production

The tools are built using either Node.js and/or Python (3).