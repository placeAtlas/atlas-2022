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

let timelineSlider = document.getElementById("timeControlsSlider");
let tooltip = document.getElementById("timeControlsTooltip")
let image = document.getElementById("image");

let defaultPeriod = timeConfig.length - 1
let maxPeriod = timeConfig.length - 1
var period = defaultPeriod
window.period = period

// SETUP
timelineSlider.max = timeConfig.length - 1;
// document.querySelector('#period-group .period-start').max = defaultPeriod
// document.querySelector('#period-group .period-end').max = defaultPeriod
timelineSlider.value = timelineSlider.max;
updateTime(timelineSlider.value)

timelineSlider.addEventListener("input", (event) => {
    updateTime(parseInt(event.target.value))
})

// document.querySelector('#period-group .period-start').oninput = (event) => {
//     slider.value = parseInt(event.target.value)
//     updateTime(parseInt(event.target.value))
// };

// document.querySelector('#period-group .period-end').oninput = (event) => {
//     slider.value = parseInt(event.target.value)
//     updateTime(parseInt(event.target.value))
// };

const dispatchTimeUpdateEvent = (period = timelineSlider.value, atlas = atlas) => {
    const timeUpdateEvent = new CustomEvent('timeupdate', {
        detail: {
            period: period,
            atlas: atlas
        }
    });
    document.dispatchEvent(timeUpdateEvent);
}

async function updateTime(currentPeriod) {
    period = currentPeriod
    let configObject = timeConfig[currentPeriod];
    if (!configObject.image) {
        let fetchResult = await fetch(configObject.url);
        let imageBlob = await fetchResult.blob();
        configObject.image = URL.createObjectURL(imageBlob);
    }
    image.src = configObject.image;
    // TEMP ATLAS ONLY ON LAST TIMESTAMP
    atlas = []
    for ( var atlasIndex in atlasAll ) {
        var validPeriods = atlasAll[atlasIndex].period
        var isValid = false
        if (validPeriods === undefined) validPeriods = defaultPeriod + ""
        if (typeof validPeriods === "string") {
            validPeriods.split(', ').some(period => {
                if (period.search('-') + 1) {
                    var [before, after] = period.split('-')
                    if (currentPeriod >= before && currentPeriod <= after) {
                        return atlas.push(atlasAll[atlasIndex])
                    }
                } else {
                    var single = period
                    if (single == currentPeriod) {
                        return atlas.push(atlasAll[atlasIndex])
                    }
                }
            })
        }
        if (isValid) atlas.push(atlasAll[atlasIndex])
    }
    dispatchTimeUpdateEvent(currentPeriod, atlas)
    if (typeof configObject.timestamp === "number") tooltip.querySelector('p').textContent = new Date(configObject.timestamp*1000).toUTCString()
    else tooltip.querySelector('p').textContent = configObject.timestamp
    tooltip.style.left = (((timelineSlider.offsetWidth)*(timelineSlider.value-1)/(timelineSlider.max-1)) - tooltip.offsetWidth/2) + "px"
}

tooltip.parentElement.addEventListener('mouseenter', () => tooltip.style.left = (((timelineSlider.offsetWidth)*(timelineSlider.value-1)/(timelineSlider.max-1)) - tooltip.offsetWidth/2) + "px")

window.addEventListener('resize', () => tooltip.style.left = (((timelineSlider.offsetWidth)*(timelineSlider.value-1)/(timelineSlider.max-1)) - tooltip.offsetWidth/2) + "px")

