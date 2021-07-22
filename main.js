let mode = "full-width"
// https://makecode.com/_EvPP98M4pYEC

/**
 * To do:
 * 
 * 1. Implement "fit", "fill", "custom"
 * 2. Black and white mode
 * 3. Other cool effects
 * 4. Shuffle colors
 */

const canvas = document.querySelector("canvas")
const copyButton = document.querySelector("button#copy")
const customSizes = document.querySelectorAll("input[type='number'].custom")
const fileInput = document.querySelector("input#myFile")
const form = document.querySelector("form")
const numberInputs = document.querySelectorAll("input[type='number']")
const radioButtons = document.querySelectorAll("input[type='radio']")
const scaleFactor = document.querySelector("input[type='number']#factor")
const textarea = document.querySelector("textarea")

let originalImageSize = {
	width: 0,
	height: 0
}

fileInput.addEventListener("change", function whenImageIsUploaded() {
	const img = document.createElement("img")
	img.src = window.URL.createObjectURL(this.files[0])
	const node = document.querySelector("img")

	if (node !== null) {
		node.parentNode.removeChild(node)
	}

	document.body.appendChild(img)

	img.addEventListener("load", () => {
		originalImageSize.width = img.width
		originalImageSize.height = img.height
		mode = "full-width"
		convert(img)
	})
})

radioButtons.forEach(radioButton => {
	radioButton.addEventListener("change", function sizeOption() {
		mode = this.id
		const numberInput = this.parentElement.querySelector("input[type='number']")
		customSizes.forEach(field => field.disabled = (mode !== "custom"))
		scaleFactor.disabled = (mode !== "scale")
		scaleFactor.value = 0.1
		img = document.querySelector("img")
		convert(img)
	})
})

form.addEventListener("submit", function convertImage(event) {
	event.preventDefault()
	const imageDOM = document.querySelector("img")
	if (originalImageSize.width === 0 && originalImageSize.height === 0) {
		originalImageSize.width = imageDOM.width
		originalImageSize.height = imageDOM.height
	}
	img = document.querySelector("img")
	convert(img)
	resetImageSize(img)
})

function convert(img) {
	// originalImageSize
	copyButton.innerText = "Copy code" // Reset text if another image is uploaded
	const arcadeColors = [
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
		const r = parseInt(color[1] + color[2], 16) // parseInt("a", 16) === 10
		const g = parseInt(color[3] + color[4], 16)
		const b = parseInt(color[5] + color[6], 16)

		return {
			color: { r, g, b },
			index: (index).toString(16) // (10).toString(16) === "a"
		}
	})

	/**
	 * MakeCode Arcade is 160x120
	 * 
	* 	Full width:
	 * 		factor = 160 / img.width
	 * 	Full height:
	 * 		factor = 120 / img.height
	 * 	Custom width:
	 * 		factor = n / img.width
	 * 	Custom height:
	 * 		factor = n / img.height
	 * 		 
	 * 	w *= factor
	 * 	h *= factor
	 */
	function setSpriteDimensions(type) {
		let imageWidth = originalImageSize.width
		let imageHeight = originalImageSize.height
		let factor = 1
		if (type === "custom") {
			let customWidth = document.querySelector(".custom#width").value
			let customHeight = document.querySelector(".custom#height").value

			if (customWidth && !customHeight) {
				const factor = customWidth / originalImageSize.width
				imageWidth = customWidth
				imageHeight *= factor
			} else if (!customWidth && customHeight) {
				const factor = customHeight / originalImageSize.height
				imageWidth *= factor
				imageHeight = customHeight
			} else {
				imageWidth = customWidth
				imageHeight = customHeight
			}
		} else if (type === "scale") {
			const factor = document.querySelector("input#factor").value
			imageWidth *= factor
			imageHeight *= factor
		} else if (type === "full-width") {
			const factor = 160 / imageWidth
			imageWidth *= factor
			imageHeight *= factor
		} else if (type === "full-height") {
			const factor = 120 / imageHeight
			imageWidth *= factor
			imageHeight *= factor
		}
		img.width = imageWidth
		img.height = imageHeight
		copyButton.innerText += ` (${img.width} x ${img.height})`
	}

	setSpriteDimensions(mode) // Mode is set when radio buttons are clicked. Default is full-width.

	// Get the image's pixels and draw them onto a canvas element
	// This way, we can loop through the pixels
	canvas.width = img.width
	canvas.height = img.height
	const c = canvas.getContext("2d")
	c.drawImage(img, 0, 0, canvas.width, canvas.height)

	let pixelIndex = 0
	let makeCodeString = {}
	const data = c.getImageData(0, 0, canvas.width, canvas.height).data

	// Canvas pixel values are stored as rgba: [r, g, b, a, r, g, b, a, ...]
	for (let i = 0; i < data.length; i += 4) {
		// This is how you get x and y coordinates from one variable
		const x = pixelIndex % canvas.width
		const y = Math.floor(pixelIndex / canvas.width)

		const r = data[i + 0]
		const g = data[i + 1]
		const b = data[i + 2]
		const a = data[i + 3]

		/*
		Now we have the rgba values for one pixel from the original image.
		MakeCode colors are represented as index values from 0-15 (or really, 0-f).
		We loop through the 16 color palette and pick the one that has
		the closest r, g, and b values to the pixel we're checking.
		*/
		const nearest = arcadeColors.sort((prev, curr) => {
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
				// 0 is transparent, f is black.
				makeCodeString[`row-${y}`] += "f"
			} else {
				makeCodeString[`row-${y}`] += nearest.index
			}
		}

		pixelIndex++
	}

	// Loop through the makeCodeString object to create the output
	let dateString = new Date()
		.toISOString()
		.replaceAll("-", "")
		.replaceAll(":", "")
		.replaceAll(".", "")
	let spriteJavaScript = `let mySprite${dateString} = sprites.create(img\``
	for (const row in makeCodeString) {
		spriteJavaScript += makeCodeString[row] + "\n"
	}
	spriteJavaScript += "`, SpriteKind.Player)"

	// Copy text when user clicks button
	// Sure, they can copy it themselves, but it's good to do nice things sometimes.
	textarea.textContent = spriteJavaScript
	copyButton.removeAttribute("disabled")

	copyButton.addEventListener("click", function addCodeToClipboard() {
		textarea.select()
		document.execCommand("copy")
		console.log("copy!");
		copyButton.innerText = "Code copied to clipboard!"
		resetImageSize(img)
	})
}

function resetImageSize(img) {
	img.width = originalImageSize.width
	img.height = originalImageSize.height
}