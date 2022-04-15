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

const variationsConfig = {
    default: {
        name: "r/place",
        code: "",
        default: 14,
        versions: [
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
            }
        ]
    }
}

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
    }
];

const codeReference = {}

const variantsEl = document.getElementById("variants")

for (let variation in variationsConfig) {
    codeReference[variationsConfig[variation].code] = variation
    const optionEl = document.createElement('option')
    optionEl.value = variation
    optionEl.textContent = variationsConfig[variation].name
    variantsEl.appendChild(optionEl)
}

const timelineSlider = document.getElementById("timeControlsSlider");
const tooltip = document.getElementById("timeControlsTooltip")
const image = document.getElementById("image");

let defaultPeriod = timeConfig.length - 1
let maxPeriod = timeConfig.length - 1
let currentPeriod = defaultPeriod
let currentVariation = "default"
window.currentPeriod = currentPeriod
window.currentVariation = currentVariation

// SETUP
timelineSlider.max = timeConfig.length - 1;
timelineSlider.value = currentPeriod;

timelineSlider.addEventListener("input", (event) => {
    updateTime(parseInt(event.target.value), currentVariation)
})

variantsEl.addEventListener("input", (event) => {
    updateTime(currentPeriod, event.target.value)
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

async function updateBackground(newPeriod = currentPeriod, newVariation = currentVariation) {
    currentPeriod = newPeriod
    // console.log(newPeriod, newVariation)
    const variationConfig = variationsConfig[newVariation]
    if (currentVariation !== newVariation) {
        currentVariation = newVariation
        timelineSlider.max = variationConfig.versions.length - 1;
        currentPeriod = variationConfig.default;
        newPeriod = currentPeriod 
        timelineSlider.value = currentPeriod 
    }
    const configObject = variationConfig.versions[currentPeriod];
    if (!configObject.image) {
        const fetchResult = await fetch(configObject.url);
        const imageBlob = await fetchResult.blob();
        configObject.image = URL.createObjectURL(imageBlob);
    }
    image.src = configObject.image;
    
    return [configObject, newPeriod, newVariation]
}

async function updateTime(newPeriod = currentPeriod, newVariation = currentVariation) {
    let configObject
    [configObject, newPeriod, newVariation] = await updateBackground(newPeriod, newVariation)
    
    atlas = []
    for ( var atlasIndex in atlasAll ) {
        let pathChosen, centerChosen, chosenIndex

        let validPeriods2 = Object.keys(atlasAll[atlasIndex].path)

        // console.log(chosenIndex)

        for (let i in validPeriods2) {
            let validPeriods = validPeriods2[i].split(', ')
            for (let j in validPeriods) {
                let [start, end, variation] = parsePeriod(validPeriods[j])
                // console.log(start, end, variation, newPeriod, newVariation)
                if (isOnPeriod(start, end, variation, newPeriod, newVariation)) {
                    // console.log("match", start, end, variation, newPeriod, newVariation, i)
                    chosenIndex = i
                    break
                }
            }
            if (chosenIndex !== undefined) break
        }

        // console.log(testMatches)

        // console.log(chosenIndex)
        if (chosenIndex === undefined) continue 
        pathChosen = Object.values(atlasAll[atlasIndex].path)[chosenIndex]
        centerChosen = Object.values(atlasAll[atlasIndex].center)[chosenIndex]

        if (pathChosen === undefined) continue

        // console.log(123)

        atlas.push({
            ...atlasAll[atlasIndex],
            path: pathChosen,
            center: centerChosen,
        })
    }
    // console.log(atlas)

    dispatchTimeUpdateEvent(newPeriod, atlas)
    if (typeof configObject.timestamp === "number") tooltip.querySelector('p').textContent = new Date(configObject.timestamp*1000).toUTCString()
    else tooltip.querySelector('p').textContent = configObject.timestamp
    tooltip.style.left = (((timelineSlider.offsetWidth)*(timelineSlider.value-1)/(timelineSlider.max-1)) - tooltip.offsetWidth/2) + "px"
}

tooltip.parentElement.addEventListener('mouseenter', () => tooltip.style.left = (((timelineSlider.offsetWidth)*(timelineSlider.value-1)/(timelineSlider.max-1)) - tooltip.offsetWidth/2) + "px")

window.addEventListener('resize', () => tooltip.style.left = (((timelineSlider.offsetWidth)*(timelineSlider.value-1)/(timelineSlider.max-1)) - tooltip.offsetWidth/2) + "px")

function isOnPeriod(start, end, variation, currentPeriod, currentVariation) {
	return currentPeriod >= start && currentPeriod <= end && variation === currentVariation 
}

function parsePeriod(periodString) {
    // console.log(periodString)
    let variation = "default"
	periodString = periodString + ""
    if (periodString.split(':').length > 1) {
        let split = periodString.split(':')
        variation = codeReference[split[0]]
        periodString = split[1]
    }
	if (periodString.search('-') + 1) {
		var [start, end] = periodString.split('-').map(i => parseInt(i))
		return [start, end, variation]
	} else {
		let periodNew = parseInt(periodString)
		return [periodNew, periodNew, variation]
	}
}