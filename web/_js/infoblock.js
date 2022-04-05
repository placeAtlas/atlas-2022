function createInfoBlock(entry) {
    var element = document.createElement("div");
    element.className = "object";

    let headerElement = document.createElement("h2");
    let linkElement = document.createElement("a");
    linkElement.href = "?id=" + entry.id;
    linkElement.innerText = entry.name;
    headerElement.appendChild(linkElement);

    element.appendChild(headerElement);

    if (entry.description) {
        let descElement = document.createElement("p");
        descElement.innerText = entry.description;
        element.appendChild(descElement);
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
    let idElement = document.createElement("p");
    idElement.style.fontFamily = "Dejavu Sans Mono, sans, Sans-Serif;";
    idElement.innerText = "id: " + entry.id;
    element.appendChild(idElement);

    return element;
}