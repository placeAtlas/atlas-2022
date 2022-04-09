/*
	========================================================================
	The 2022 /r/place Atlas

	An Atlas of Reddit's 2022 /r/place, with information to each
	artwork	of the canvas provided by the community.

	Copyright (c) 2017 Roland Rytz <roland@draemm.li>
	Copyright (c) 2022 r/placeAtlas2 contributors

	Licensed under the GNU Affero General Public License Version 3
	https://place-atlas.stefanocoding.me/license.txt
	========================================================================
*/

function createInfoBlock(entry) {
    function createInfoParagraph(name, value){
        let entryParagraphPositionElement = document.createElement("p");
        let nameElement = document.createElement("span");
        nameElement.style.fontWeight = "bold";
        nameElement.innerText = name;
        let valueElement = document.createElement("span");
        valueElement.innerText = value;
        entryParagraphPositionElement.appendChild(nameElement);
        entryParagraphPositionElement.appendChild(valueElement);
        return entryParagraphPositionElement;
    }

    var element = document.createElement("div");
    element.className = "object";

    let headerElement = document.createElement("h2");
    let linkElement = document.createElement("a");
    linkElement.href = "#" + entry.id;
    linkElement.innerText = entry.name;
    headerElement.appendChild(linkElement);

    element.appendChild(headerElement);

    if (entry.diff) {
        let diffElement = createInfoParagraph("Diff: ", entry.diff);
        diffElement.className = entry.diff;
        element.appendChild(diffElement);
    }

    if (entry.description) {
        let descElement = document.createElement("p");
        descElement.innerText = entry.description;
        element.appendChild(descElement);
    }
    
    let [x, y] = entry.center;
    element.appendChild(createInfoParagraph("Position: ", `${Math.floor(x)}, ${Math.floor(y)}`));

    if(entry.path){
        let area = calcPolygonArea(entry.path);
        element.appendChild(createInfoParagraph("Area: ", `${area} pixels`));
    }
    
    if (entry.website) {
        let websiteLinkElement = document.createElement("a");
        websiteLinkElement.target = "_blank";
        websiteLinkElement.href = entry.website;
        websiteLinkElement.innerText = "Website";
        element.appendChild(websiteLinkElement);
    }
    if (entry.subreddit) {
        var subreddits = entry.subreddit.split(",");

        for (var i in subreddits) {
            var subreddit = subreddits[i].trim();
            if (subreddit.substring(0, 2) == "r/") {
                subreddit = "/" + subreddit;
            } else if (subreddit.substring(0, 1) != "/") {
                subreddit = "/r/" + subreddit;
            }
            let subredditLinkElement = document.createElement("a");
            subredditLinkElement.target = "_blank";
            subredditLinkElement.href = "https://reddit.com" + subreddit;
            subredditLinkElement.innerText = subreddit;
            element.appendChild(subredditLinkElement);
        }
    }
    let idElement = createInfoParagraph("ID: ", entry.id);
    idElement.style.fontFamily = "Dejavu Sans Mono, sans, Sans-Serif;";
    element.appendChild(idElement);

    let editElement = document.createElement("a");
    editElement.innerText = "Edit"
    editElement.className = "objectEdit"
    editElement.href = "./?mode=draw&id=" + entry.id
    element.appendChild(editElement);

    return element;
}