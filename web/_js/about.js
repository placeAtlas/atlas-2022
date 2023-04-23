/*!
 * The 2022 r/place Atlas
 * Copyright (c) 2017 Roland Rytz <roland@draemm.li>
 * Copyright (c) 2022 Place Atlas contributors
 * Licensed under AGPL-3.0 (https://place-atlas.stefanocoding.me/license.txt)
 */

const redditWrapperEl = document.querySelector('#reddit-contributors-wrapper')
fetch('all-authors.txt')
	.then(response => response.text())
	.then(text => text.trim().split('\n').sort())
	.then(contributors => {
		document.querySelector('#reddit-contributors-count').textContent = contributors.length
		for (const contributor of contributors) {
			const userEl = document.createElement('a')
			userEl.href = 'https://reddit.com/user/' + contributor
			userEl.textContent = contributor
			redditWrapperEl.appendChild(userEl)
			redditWrapperEl.appendChild(document.createTextNode(' '))
		}
	})