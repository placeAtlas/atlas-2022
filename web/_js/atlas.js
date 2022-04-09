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

window.addEventListener("error", function (e) {
	console.log(e);
	var errorMessage = "<p class=\"error\">An error has occurred:</p>";
	errorMessage += "<p class=\"errorBody\">" + e.message + "</p>";
	errorMessage += "<p class=\"errorBody\">on line " + e.lineno + "</p>";
	errorMessage += "<p class=\"error\">If this keeps happening, feel free to send me a <a href=\"mailto:roland.rytz@gmail.com\">mail</a>.</p>";
	document.getElementById("loadingContent").innerHTML = errorMessage;
});

function getPositionOfEntry(entry){
	let startX = 2000, startY = 2000;
	for(let [x, y] of entry.path){
		startX = Math.min(x, startX);
		startY = Math.min(y, startY)
	}
	if(startX === 2000 || startY === 2000) return null;
	return [parseInt(startX), parseInt(startY)];
}

const areaMap = new Map();

// Modified from https://stackoverflow.com/a/33670691 
function calcPolygonArea(vertices) {
	var hit = areaMap.get(vertices);
	if (hit != null) {
		return hit;
	}

    var total = 0;

    for (var i = 0, l = vertices.length; i < l; i++) {
      var addX = vertices[i][0];
      var addY = vertices[i == vertices.length - 1 ? 0 : i + 1][1];
      var subX = vertices[i == vertices.length - 1 ? 0 : i + 1][0];
      var subY = vertices[i][1];

      total += (addX * addY * 0.5);
      total -= (subX * subY * 0.5);
    }

	var area = Math.floor(Math.abs(total));
	areaMap.set(vertices, area);
	
    return area;
}