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

const timeConfig = [
    {
        timestamp: 1648822500,
        url: "./_img/place/1648822500.png",
        image: null
    },
    {
        timestamp: 1648847036,
        url: "./_img/place/1648847036.png",
        image: null
    },
    {
        timestamp: 1648870452,
        url: "./_img/place/1648870452.png",
        image: null
    },
    {
        timestamp: 1648893666,
        url: "./_img/place/1648893666.png",
        image: null
    },
    {
        timestamp: 1648917500,
        url: "./_img/place/1648917500.png",
        image: null
    },
    {
        timestamp: 1648942113,
        url: "./_img/place/1648942113.png",
        image: null
    },
    {
        timestamp: 1648956234,
        url: "./_img/place/1648956234.png",
        image: null
    },
    {
        timestamp: 1648968061,
        url: "./_img/place/1648968061.png",
        image: null
    },
    {
        timestamp: 1648979987,
        url: "./_img/place/1648979987.png",
        image: null
    },

    {
        timestamp: 1648992274,
        url: "./_img/place/1648992274.png",
        image: null
    },
    {
        timestamp: 1649012915,
        url: "./_img/place/1649012915.png",
        image: null
    },
    {
        timestamp: 1649037182,
        url: "./_img/place/1649037182.png",
        image: null
    },
    {
        timestamp: 1649060793,
        url: "./_img/place/1649060793.png",
        image: null
    },
    {
        timestamp: 1649084741,
        url: "./_img/place/1649084741.png",
        image: null
    },
    {
        timestamp: 1649113199,
        url: "./_img/place/final.png",
        image: null,
        showAtlas: true,
    }
];

let slider = document.getElementById("timeControlsSlider");
let tooltip = document.getElementById("timeControlsTooltip")
let image = document.getElementById("image");

let timeCallback = (a) => {};
let atlasBackup = [];

// SETUP
slider.max = timeConfig.length;
slider.value = timeConfig.length;
updateTime(slider.value)

slider.addEventListener("input", (event) => {
    updateTime(parseInt(event.target.value))
})

async function updateTime(index) {
    let configObject = timeConfig[index-1];
    if (!configObject.image) {
        console.log("fetching");
        let fetchResult = await fetch(configObject.url);
        let imageBlob = await fetchResult.blob();
        configObject.image = URL.createObjectURL(imageBlob);
    }
    image.src = configObject.image;
    // TEMP ATLAS ONLY ON LAST TIMESTAMP
    if (configObject.showAtlas) {
        atlas = atlasBackup
    } else {
        atlas = []
    }
    timeCallback(atlas)
    if (typeof configObject.timestamp === "number") tooltip.querySelector('div').textContent = new Date(configObject.timestamp*1000).toUTCString()
    else tooltip.querySelector('div').textContent = configObject.timestamp
    tooltip.style.left = (((slider.offsetWidth)*(slider.value-1)/(slider.max-1)) - tooltip.offsetWidth/2) + "px"
}

tooltip.parentElement.addEventListener('mouseenter', () => tooltip.style.left = (((slider.offsetWidth)*(slider.value-1)/(slider.max-1)) - tooltip.offsetWidth/2) + "px"
)

window.addEventListener('resize', () => tooltip.style.left = (((slider.offsetWidth)*(slider.value-1)/(slider.max-1)) - tooltip.offsetWidth/2) + "px"
)