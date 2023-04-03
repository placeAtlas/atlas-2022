// Based on GitHub's favicon switcher. Temporary(?) fix for Chromium based browsers that won't dynamically update embedded CSS media query inside of SVG
function updateFavicon(colorScheme) {
	const favicon = document.head.querySelector('.js-site-favicon[type="image/svg+xml"]')
	const faviconFallback = document.head.querySelector('.js-site-favicon[type="image/png"]')
	if (favicon && faviconFallback) {
		if (colorScheme || colorScheme === 'dark') {
			favicon.href = '_img/favicon-dark.svg'
			faviconFallback.href = '_img/favicon-dark.png'
		} else {
			favicon.href = '_img/favicon.svg'
			faviconFallback.href = '_img/favicon.png'
		}
	}
}

function prefersDarkColorScheme() {
	return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}

if (prefersDarkColorScheme()) {
	// update favicon to dark on page load
	updateFavicon('dark')
}

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
	updateFavicon(prefersDarkColorScheme())
})
