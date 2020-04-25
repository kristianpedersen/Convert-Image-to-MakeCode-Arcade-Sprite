// https://makecode.com/_Cm17aw5xbKpU
// https://makecode.com/_1oqHvKFEE9Lf
// https://makecode.com/_EvPP98M4pYEC

const canvas = document.querySelector("canvas")
const copyButton = document.querySelector("button")
const info = document.querySelector("p#info")
const input = document.querySelector("input")
const textarea = document.querySelector("textarea")
const status = document.querySelector("#status")

// Happens when image is uploaded
input.addEventListener("change", function onLoadedImage() {
	// 1. Set button text back to its original state,
	// 2. Add info text to help users
	// 3. Create image element, and send it through the convert function
	copyButton.innerText = "Copy code"
	info.innerHTML = "Go to a project at <a href='https://arcade.makecode.com/'>arcade.makecode.com</a>, enter JavaScript mode, and paste the code!"
	const img = document.createElement("img")
	img.src = window.URL.createObjectURL(this.files[0])
	img.addEventListener("load", () => convert(img))
})

function convert(img) {
	const defaultMakeCodeArcadeColors = [
		"#00000000", // Transparent
		"#ffffff",
		"#ff2121",
		"#ff93c4",
		"#ff8135",
		"#fff609",
		"#249ca3",
		"#78dc52",
		"#003fad",
		"#87f2ff",
		"#8e2ec4",
		"#a4839f",
		"#5c406c",
		"#e5cdc4",
		"#91463d",
		"#000000",
	].map(function convertFromHexToRGB(color, index) {
		const r = parseInt(color[1] + color[2], 16) // a -> 10
		const g = parseInt(color[3] + color[4], 16)
		const b = parseInt(color[5] + color[6], 16)
		return {
			color: { r, g, b },
			index: (index).toString(16) // 10 -> a
		}
	})

	// For the time being, we assume images to be wider than they are tall
	const ratio = img.width / 120
	img.width = 120
	img.height /= ratio

	// Get the image's pixels and draw them onto a canvas element
	// This way, we can loop through the pixels
	canvas.width = img.width
	canvas.height = img.height
	const c = canvas.getContext("2d")
	c.drawImage(img, 0, 0, canvas.width, canvas.height)


	let pixelIndex = 0
	const makeCodeString = {}
	const data = c.getImageData(0, 0, canvas.width, canvas.height).data

	// The pixels are stored in one single-dimensional array:
	// [r, g, b, a, r, g, b, a, etc.]
	for (let i = 0; i < data.length; i += 4) {
		// This is how you get x and y coordinates from one variable
		let x = pixelIndex % canvas.width
		let y = Math.floor(pixelIndex / canvas.width)

		const r = data[i + 0]
		const g = data[i + 1]
		const b = data[i + 2]
		const a = data[i + 3]

		/*
		Now we have the rgba values for one pixel from the original image.
		MakeCode colors are represented as index values from 0-15.
		We loop through the 16 color palette and pick the one that has
		the closest r, g, and b values to the pixel we're checking.
		*/
		const nearest = defaultMakeCodeArcadeColors.sort((prev, curr) => {
			const rDifference = Math.abs(prev.color.r - r) - Math.abs(curr.color.r - r)
			const gDifference = Math.abs(prev.color.g - g) - Math.abs(curr.color.g - g)
			const bDifference = Math.abs(prev.color.b - b) - Math.abs(curr.color.b - b)
			return rDifference + gDifference + bDifference
		})[0]

		// Draw a preview
		c.fillStyle = `rgb(${nearest.color.r}, ${nearest.color.g}, ${nearest.color.b})`
		c.fillRect(x, y, 1, 1)

		/*
		makeCodeString is a piece of working code that can be directly
		pasted into MakeCode's JavaScript window.
		*/
		if (makeCodeString[`row-${y}`] === undefined) {
			makeCodeString[`row-${y}`] = ""
		} else {
			if (nearest.index == 0) {
				// 0 is transparent, 15 is black.
				// f = 15 (0 1 2 3 4 5 6 7 8 9 a b c d e f)
				makeCodeString[`row-${y}`] += "f" + "\t"
			} else {
				makeCodeString[`row-${y}`] += nearest.index + "\t"
			}
		}

		pixelIndex++
	}

	// Loop through the makeCodeString object to create the output
	let finalOutput = "let mySprite = sprites.create(img`"
	for (const row in makeCodeString) {
		finalOutput += makeCodeString[row] + "\n"
	}
	finalOutput += "`, SpriteKind.Player)"

	// Copy text when user clicks button
	// Sure, they can copy it themselves, but it's good to do nice things sometimes.
	textarea.textContent = finalOutput
	copyButton.removeAttribute("disabled")

	copyButton.addEventListener("click", () => {
		textarea.select()
		document.execCommand("copy")
		copyButton.innerText = "Code copied to clipboard!"
	})
}