# Contributing

This project is open-source, and contributions are welcome. In fact, the Atlas relies on user contributions.

You may contribute to the project by submitting a Pull Request on the GitHub repo or sending your submissions through [Reddit](https://www.reddit.com/r/placeAtlas2). Other than that, you can get help from [Discord](https://discord.gg/pJkm23b2nA) or [Reddit](https://www.reddit.com/r/placeAtlas2).

## New Atlas entries

To contribute to the map, we require a certain format for artwork region and labels. This can be generated on [the drawing mode](https://2022.place-atlas.stefanocoding.me?mode=draw) on the website. 

To add a new entry, go to [the drawing mode](https://2022.place-atlas.stefanocoding.me?mode=draw) and draw a shape/polygon around the region you'd like to describe. You can use the <kbd>Undo</kbd>, <kbd>Redo</kbd>, and <kbd>Reset</kbd> buttons to help you creating a good polygon. Make sure that the lines you're drawing don't form a [self-intersecting polygon](https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Complex_polygon.svg/288px-Complex_polygon.svg.png).

If you want to see which areas of the canvas do not have entries yet, select "Highlight Empty" to hide areas that already have entries.

Multiple periods can be added to represent the changing state of the artwork on different times. You can set the start and end period, as well as chosing the appropriate canvas variations. You can also copy the polygon from one period to the other, duplicating a period to be edited later, as well as deleting a period (if there is more than one). An alert is also shown if there are errors that needed attention.

When you're happy with the shape you've drawn, press <kbd>Finish</kbd>. You will now be able to enter some information about the entry:

- **Name**: A short, descriptive name.
- **Description**: A short description that can be understood by somebody not familiar with the topic. If you were involved in drawing this artwork, you may include the meta, describing the process of drawing the artwork in the event. To include lengthy, additional information, consider creating a page on [the r/place Wiki](https://place-wiki.stefanocoding.me/).
- **Links**: Some links that are most relevant to the topic, and/or regarding the process of the drawing the artwork in the event.
	- **Website**: If you're describing a project, the project's main website would be suitable here.
	- **Subreddit**: Format it like `r/subreddit`.
	- **Discord**: Write the invite code, that the invite link without the `discord.gg/` part.
	- **Wiki**: The page title of [the r/place Wiki](https://place-wiki.stefanocoding.me/).

All fields but the name are optional. For example, a country flag doesn't necessarily need a description.

Once you've entered all the information, you'll be presented with a pop-up window containing some [JSON](https://en.wikipedia.org/wiki/JSON)-formatted data. This is the patch that you are going to submit. Depending on the method, there are two preferred methods. 

### Through Reddit

You can press the <kbd>Post Direct to Reddit</kbd> button, which will open a page with the title and body already been filled for you. You don't need to change anything what has been prepared.

If that didn't work, copy the entire JSON text and [create a new text post on the subreddit](https://www.reddit.com/r/placeAtlas2/submit). You don't need to add any other text; just directly send the patch. 

Remember to flair your post with <kbd>New Entry</kbd>. On New Reddit, click the <kbd>Flair</kbd> button on the bottom part, and select <kbd>New Entry</kbd>. On Old Reddit, click the <kbd>select</kbd> button on the "choose a flair" section instead.

### Through GitHub

If you know about Git and how to create a pull request on GitHub, you can try create a patch that will be merged, along with other patches, by one of the members.

You can try pressing the <kbd>Submit Direct to GitHub</kbd> button, which will open a page with the patch file already been prepared to you. 

If that didn't work, copy the entire JSON text and [create a new patch file to the repository through GitHub](https://github.com/placeAtlas/atlas-2022/new/cleanup/data/patches?filename=gh-0000-ENTRY-NAME-HERE.json
). Upon opening, replace the `ENTRY-NAME-HERE` into the name of the entry (with the slug format, if possible, e.g. `foo-bar`). You don't need to add any other text; just directly send the patch. 

If you haven't forked the repository, you would need to fork it with the provided instruction shown on the page. You may add attribution by adding an `_author` key, explained in the next paragraphs. After that, you can press <kbd>Submit changes</kbd>, add follow the steps to create a pull request within GitHub. 

The commit message and description doesn't matter, but you may change it into something more descriptive to make it easier for checking (e.g. <kbd>Add Foo Bar</kbd> or <kbd>Edit Foo Bar</kbd> for the commit message). However, we suggest you to edit the title (at least) and the description of the pull request, containing the changes that you want to do (something like <kbd>Add Foo Bar</kbd> or <kbd>Edit Foo Bar</kbd> for the title, similar to the commit message, is also sufficient).

If you can fork and clone the repository, you can use the provided `tools/create_patch.py` script. This script helps you to create a working patch, along with additional data such as your name for attribution sakes. Simply run the script inside the `tools/` folder and follow the given instructions. 

If you want to do this manually (e.g. you don't have Python), you can create a patch by creating a `.json` file inside `data/patches`, with the content of the JSON-formatted data that is given earlier. You may add attribution by adding an `_author` key with the value of your Reddit username or your GitHub username plus a `gh:` prefix.

```json5
{
	"id": -1,                  // -1 signififies a new entry.
	// ...
	// Choose one of the folllowing:
	"_author": "Hans5958_",    // Links to https://reddit.com/user/Hans5958_
	"_author": "gh:Hans5958",  // Links to https://github.com/Hans5958
}
```

Once you have successfully created the patch, the file can be committed, and a pull request towards the `cleanup` branch can be created. A member will merge the pull request if it is adequate.

## Edits to Atlas entries

Other than adding new ones, you can edit existing atlas entries.

### Using the web interface

You can use the website to edit single entries easily. On the website, click <kbd>Edit</kbd> on an entry box. Afterwards, you are now on the drawing mode, editing the entry, in which you can follow the same instructions as [when creating a new entry](#new-atlas-entries). 

Upon submitting, if you use Reddit, please flair it as <kbd>Edit Entry</kbd> instead. The method stays the same if you use GitHub.

As an alternative, you can also submit an issue on GitHub using [this form](https://github.com/placeAtlas/atlas-2022/issues/new?assignees=&labels=entry+update&template=edit-entry.yml) or report it on our Discord server.

### Manually by direct edits

Direct edits to the `web/atlas.json` are also welcome on this repository using Git through GitHub. You may use Git or GitHub for bulk or large-scale changes, such as removing duplicates, or doing those that are not possible by using patches, such as removing an entry. Keep in mind that this may causes conflicts, so only do it when necessary. 

`web/atlas.json` is where the Atlas data is located, in which you can edit on GitHub. The next section includes an example of an entry.

Upon creating a fork of this repository and pushing the changes, create a pull request towards the `cleanup` branch. A member will merge the pull request if it is adequate.

To help find duplicates, [use the Overlap mode](https://2022.place-atlas.stefanocoding.me?mode=overlap).

### Example

Hereforth is an example of the structured entry data. The example has been expanded, but when editing directly, please save it in the way so each line is an entry that is minified. The `tools/aformatter.py` script can help you with this.

```json5
{
	"id": 1,
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
  - `109-166`: Default canvas variation (r/place), period [109](https://2022.place-atlas.stefanocoding.me/#/109) to [166](https://2022.place-atlas.stefanocoding.me/#/166).
  - `T:0-1`: "The Final Clean" canvas variation, period [0](https://2022.place-atlas.stefanocoding.me/#/T:0) (The Final Clean) to [1](https://2022.place-atlas.stefanocoding.me/#/T:1) (Unofficial Corrections).

## Development

> [!IMPORTANT]
> 
> Instead of here, consider directing your contributions to [The 2023 r/place Atlas](https://github.com/placeAtlas/atlas-2023).
>
> Updates from the latest Atlas would be backported occasionally for the benefit of the other instances (e.g. the 2017 Atlas and the 2022 Atlas). Furthermore, there is a great chance that what you want to do would also benefit the other instances.
>
> There may some cases where what you want to do only apply on this specific instance. In that case, you may proceed. When in doubt, don't hesitate to contact us.

Other than contributing to the Atlas data, code contributions are also accepted. Here are some information regarding some aspects on the repository.

### Web interface

This website is built using classic HTML 5 (no JS frameworks such as Vue, React, etc are used). Bootstrap 5 is used as a CSS framework.

Opening the HTML file on your browser is adequate enough to edit. If it doesn't work, you can try running a local HTTP server.

```sh
# Run it inside the web/ folder.
cd web 

# Choose one of the following:
python -m SimpleHTTPServer 8000   # Python 2
python -m http.server 8000        # Python 3
npx http-server                   # Node.js (http-server)
npx serve                         # Node.js (serve)
```

### Tools

The `tools` folder have various scripts for the maintainance of the project, such as...

- Adding submitted entries from the subreddit
- Formatting/tidying up the data 
- Building the site for production

The tools may built with various programming languages, but mostly it is made in Python (3).