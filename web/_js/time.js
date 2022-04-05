const timeConfig = [
    {
        timestamp: 16000000,
        url: "/_img/place-indexed-4.png",
        image: null
    },
    {
        timestamp: 16000030,
        url: "/_img/place-indexed-5.png",
        image: null
    },
    {
        timestamp: 16000060,
        url: "/_img/place-indexed.png",
        image: null
    },
];

let slider = document.getElementById("timeControlsSlider");
let image = document.getElementById("image");

// SETUP
slider.max = timeConfig.length;
slider.value = timeConfig.length;
updateTime(timeConfig.length)

slider.oninput = (event) => {
    updateTime(parseInt(event.target.value))
};

async function updateTime(index) {
    let configObject = timeConfig[index-1];
    if (!configObject.image) {
        console.log("fetching");
        let fetchResult = await fetch(configObject.url);
        let imageBlob = await fetchResult.blob();
        configObject.image = URL.createObjectURL(imageBlob);
    }
    image.src = configObject.image;
}