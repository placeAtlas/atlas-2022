/*
	========================================================================
	The 2022 r/place Atlas

	An atlas of Reddit's 2022 r/place, with information to each
	artwork	of the canvas provided by the community.

	Copyright (c) 2017 Roland Rytz <roland@draemm.li>
	Copyright (c) 2022 Place Atlas contributors

	Licensed under the GNU Affero General Public License Version 3
	https://place-atlas.stefanocoding.me/license.txt
	========================================================================
*/

function createInfoBlock(entry, isPreview) {
    function createLabel(name, value, parent) {
        const nameElement = document.createElement("span");
        nameElement.className = "fw-bold";
        nameElement.textContent = name;
        const valueElement = document.createElement("span");
        valueElement.textContent = value;
        parent.appendChild(nameElement);
        parent.appendChild(valueElement);
        return parent;
    }
    function createInfoListItem(name, value) {
        const entryInfoListElement = document.createElement("li");
        entryInfoListElement.className = "list-group-item";
        createLabel(name, value, entryInfoListElement);
        return entryInfoListElement;
    }

    const element = document.createElement("div");
    element.className = "card mb-2 overflow-hidden shadow";

    const headerElement = document.createElement("h4");
    headerElement.className = "card-header";
    const linkElement = document.createElement("a");
    linkElement.className = "text-decoration-none d-flex justify-content-between text-body";
    if (isPreview) linkElement.href = "#";
    else linkElement.href = "#" + entry.id;
    const linkNameElement = document.createElement("span");
    linkNameElement.className = "flex-grow-1 text-break";
    linkNameElement.textContent = entry.name;
    headerElement.appendChild(linkElement);
    linkElement.appendChild(linkNameElement);
    linkElement.insertAdjacentHTML("beforeend", '<i class="bi bi-link-45deg align-self-center link-primary" aria-hidden="true"></i>');// '<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" class="bi bi-link-45deg ms-1 align-self-center flex-shrink-0" viewBox="0 0 16 16"><path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z"/><path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z"/></svg>');
    element.appendChild(headerElement);
    
    const bodyElement = document.createElement("div");
    bodyElement.className = "card-body d-flex flex-column gap-3";
    element.appendChild(bodyElement);

    if (entry.description) {
        const descElement = document.createElement("div");
        descElement.id = "objectDescription";
        let formattedDesc = entry.description.replace(/\n{2}/g, '</p><p>');
        formattedDesc = formattedDesc.replace(/\n/g, '<br>');
        descElement.innerHTML = '<p>' + formattedDesc + '</p>';
        bodyElement.appendChild(descElement);
    }

    const linkListElement = document.createElement("div");
    linkListElement.className = "d-flex flex-column gap-2";
    bodyElement.appendChild(linkListElement);

    const listElement = document.createElement("ul");
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

    if (!isPreview) {
        const [x, y] = entry.center;
        listElement.appendChild(createInfoListItem("Position: ", `${Math.floor(x)}, ${Math.floor(y)}`));
    
        if(entry.path){
            const area = calcPolygonArea(entry.path);
            listElement.appendChild(createInfoListItem("Area: ", `${area} pixels`));
        }
    }

    if (entry.links.subreddit) {
        const subredditGroupElement = document.createElement("div");
        subredditGroupElement.className = "btn-group-vertical";
        linkListElement.appendChild(subredditGroupElement);

        entry.links.subreddit.forEach(subreddit => {
            if (subreddit) {
                subreddit = "r/" + subreddit;
                const subredditLinkElement = document.createElement("a");
                subredditLinkElement.className = "btn btn-primary text-truncate";
                subredditLinkElement.target = "_blank";
                subredditLinkElement.rel = "noopener noreferrer";
                subredditLinkElement.href = "https://reddit.com/" + subreddit;
                subredditLinkElement.innerHTML = `<i class="bi bi-reddit" aria-hidden="true"></i> ${subreddit}`;
                subredditGroupElement.appendChild(subredditLinkElement);
            }
        });
    };

    if (entry.links.website) {
        const websiteGroupElement = document.createElement("div");
        websiteGroupElement.className = "btn-group-vertical";
        linkListElement.appendChild(websiteGroupElement);

        entry.links.website.forEach(link => {
            if (link) {
                const websiteLinkElement = document.createElement("a");
                websiteLinkElement.className = "btn btn-primary text-truncate"
                websiteLinkElement.target = "_blank";
                websiteLinkElement.rel = "noopener noreferrer";
                websiteLinkElement.href = link;
                try {
                    const urlObject = new URL(link)
                    websiteLinkElement.innerHTML = `<i class="bi bi-globe" aria-hidden="true"></i> ${urlObject.hostname}`
                } catch (e) {
                    websiteLinkElement.innerHTML = `<i class="bi bi-globe" aria-hidden="true"></i> Website`;
                }
                websiteGroupElement.appendChild(websiteLinkElement);
            }
        });
    }

    if (entry.links.discord) {
        const discordGroupElement = document.createElement("div");
        discordGroupElement.className = "btn-group-vertical";
        linkListElement.appendChild(discordGroupElement);

        entry.links.discord.forEach(link => {
            if (link) {
                const discordLinkElement = document.createElement("a");
                discordLinkElement.className = "btn btn-primary text-truncate"
                discordLinkElement.target = "_blank";
                discordLinkElement.rel = "noopener noreferrer";
                discordLinkElement.href = "https://discord.gg/" + link;
                discordLinkElement.innerHTML = `<i class="bi bi-discord" aria-hidden="true"></i> ${link}`;
                discordGroupElement.appendChild(discordLinkElement);
            }
        });
    }

    if (entry.links.wiki) {
        const wikiGroupElement = document.createElement("div");
        wikiGroupElement.className = "btn-group-vertical";
        linkListElement.appendChild(wikiGroupElement);

        entry.links.wiki.forEach(link => {
            if (link) {
                const wikiLinkElement = document.createElement("a");
                wikiLinkElement.className = "btn btn-primary text-truncate"
                wikiLinkElement.target = "_blank";
                wikiLinkElement.rel = "noopener noreferrer";
                wikiLinkElement.href = "https://place-wiki.stefanocoding.me/wiki/" + link.replace(/ /g, '_');
                wikiLinkElement.innerHTML = `<i class="bi bi-book" aria-hidden="true"></i> Wiki Article`;
                wikiGroupElement.appendChild(wikiLinkElement);
            }
        });
    }

    const idElement = document.createElement("div");
    idElement.className = "py-1";
    createLabel("ID: ", entry.id, idElement);

    const idElementContainer = document.createElement("div");
    idElementContainer.className = "card-footer d-flex justify-content-between align-items-center";
    idElementContainer.appendChild(idElement);
    element.appendChild(idElementContainer);

    if (!isPreview && (!entry.diff || entry.diff !== "delete")) {
        const editElement = document.createElement("a");
        editElement.textContent = "Edit";
        editElement.className = "btn btn-sm btn-outline-primary";
        editElement.href = "./?mode=draw&id=" + entry.id;
        editElement.title = "Edit " + entry.name;
        idElementContainer.appendChild(editElement);
    }

    if (!bodyElement.hasChildNodes()) bodyElement.remove();
    if (!linkListElement.hasChildNodes()) linkListElement.remove();
    if (!listElement.hasChildNodes()) listElement.remove();

	return element;
}