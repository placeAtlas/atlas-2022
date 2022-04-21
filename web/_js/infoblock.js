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
    function createInfoItem(name, value){
        let entryParagraphPositionElement = document.createElement("div");
        let nameElement = document.createElement("span");
        nameElement.className = "fw-bold";
        nameElement.innerText = name;
        let valueElement = document.createElement("span");
        valueElement.innerText = value;
        entryParagraphPositionElement.appendChild(nameElement);
        entryParagraphPositionElement.appendChild(valueElement);
        return entryParagraphPositionElement;
    }
    function createInfoListItem(name, value){
        let entryParagraphPositionElement = document.createElement("li");
        entryParagraphPositionElement.className = "list-group-item";
        let nameElement = document.createElement("span");
        nameElement.className = "fw-bold";
        nameElement.innerText = name;
        let valueElement = document.createElement("span");
        valueElement.innerText = value;
        entryParagraphPositionElement.appendChild(nameElement);
        entryParagraphPositionElement.appendChild(valueElement);
        return entryParagraphPositionElement;
    }

    var element = document.createElement("div");
    element.className = "card mb-2 overflow-hidden shadow";

    let headerElement = document.createElement("h4");
    headerElement.className = "card-header";
    let linkElement = document.createElement("a");
    linkElement.className = "text-decoration-none d-flex justify-content-between text-body";
    linkElement.href = "#" + entry.id;
    let linkNameElement = document.createElement("span");
    linkNameElement.className = "flex-grow-1 text-break";
    linkNameElement.innerText = entry.name;
    headerElement.appendChild(linkElement);
    linkElement.appendChild(linkNameElement);
    linkElement.insertAdjacentHTML("beforeend", '<i class="bi bi-link-45deg align-self-center link-primary"></i>');// '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-link-45deg ms-1 align-self-center flex-shrink-0" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/></svg>');

    let bodyElement = document.createElement("div");

    element.appendChild(headerElement);
    element.appendChild(bodyElement);

    if (entry.description) {
        let descElement = document.createElement("div");
        descElement.id = "objectDescription";
        // descElement.innerText = entry.description;
        descElement.innerHTML = '<p>' + entry.description.replace(/\n/g, '</p><p>');
        bodyElement.appendChild(descElement);
    }

    let linkListElement = document.createElement("div");
    if (entry.description || entry.website || entry.subreddit) {
        bodyElement.className = "card-body d-flex flex-column gap-3";

        if (entry.website || entry.subreddit) {
            linkListElement.className = "d-flex flex-column gap-2";
            bodyElement.appendChild(linkListElement);
        }
    }

    if (entry.website) {
        let websiteGroupElement = document.createElement("div");
        websiteGroupElement.className = "btn-group";
        linkListElement.appendChild(websiteGroupElement);

        let websiteLinkElement = document.createElement("a");
        websiteLinkElement.className = "btn btn-primary"
        websiteLinkElement.target = "_blank";
        websiteLinkElement.href = entry.website;
        websiteLinkElement.innerText = "Website";
        websiteGroupElement.appendChild(websiteLinkElement);
    }

    
    if (entry.subreddit) {
        let subredditGroupElement = document.createElement("div");
        subredditGroupElement.className = "btn-group-vertical";
        linkListElement.appendChild(subredditGroupElement);

        var subreddits = entry.subreddit.split(",");

        for (var i in subreddits) {
            var subreddit = subreddits[i].trim();
            if (subreddit.substring(0, 2) == "r/") {
                subreddit = "/" + subreddit;
            } else if (subreddit.substring(0, 1) != "/") {
                subreddit = "/r/" + subreddit;
            }
            let subredditLinkElement = document.createElement("a");
            subredditLinkElement.className = "btn btn-primary text-truncate";
            subredditLinkElement.target = "_blank";
            subredditLinkElement.rel = "noopener noreferrer";
            subredditLinkElement.href = "https://reddit.com" + subreddit;
            subredditLinkElement.innerText = subreddit;
            subredditGroupElement.appendChild(subredditLinkElement);
        }
    }

    let listElement = document.createElement("ul");
    listElement.className = "list-group list-group-flush";
    element.appendChild(listElement);

    if (entry.diff) {
        let diffElement = createInfoListItem("Diff: ", entry.diff);
        if (entry.diff == "add") {
            diffElement.className = "list-group-item list-group-item-success";
        } else if (entry.diff == "edit") {
            diffElement.className = "list-group-item list-group-item-warning";
        } else if (entry.diff == "delete") {
            diffElement.className = "list-group-item list-group-item-danger";
        }
        listElement.appendChild(diffElement);
    }
    
    let [x, y] = entry.center;
    listElement.appendChild(createInfoListItem("Position: ", `${Math.floor(x)}, ${Math.floor(y)}`));

    if(entry.path){
        let area = calcPolygonArea(entry.path);
        listElement.appendChild(createInfoListItem("Area: ", `${area} pixels`));
    }

    let idElement = createInfoItem("ID: ", entry.id);
    let idElementContainer = document.createElement("div");
    idElementContainer.className = "card-footer d-flex justify-content-between align-items-center";
    idElementContainer.appendChild(idElement);
    element.appendChild(idElementContainer);

    let editElement = document.createElement("button");
    editElement.type = "button";
    editElement.innerText = "Edit";
    editElement.className = "btn btn-sm btn-outline-primary";
    editElement.href = "./?mode=draw&id=" + entry.id;
    idElementContainer.appendChild(editElement);


    return element;
}