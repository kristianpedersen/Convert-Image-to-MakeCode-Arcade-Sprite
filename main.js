// https://makecode.com/_Cm17aw5xbKpU
// https://makecode.com/_1oqHvKFEE9Lf

const canvas = document.querySelector("canvas")
const ta = document.querySelector("textarea")
const copyButton = document.querySelector("button")

document.querySelector("input").addEventListener("change", function () {
	copyButton.innerText = "Copy code"
	const img = document.createElement("img")
	img.src = window.URL.createObjectURL(this.files[0])
	img.addEventListener("load", () => main(img))
})

function main(img) {
	const arcadeColors = [
		"#000000",
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
	].map((color, index) => {
		const r = parseInt(color[1] + color[2], 16)
		const g = parseInt(color[3] + color[4], 16)
		const b = parseInt(color[5] + color[6], 16)
		return {
			color: { r, g, b },
			index: (index).toString(16) // 9 = 9, 10 = a, 11 = b, etc.
		}
	})

	const factor = img.width / 120
	img.width = 120
	img.height /= factor

	canvas.width = img.width
	canvas.height = img.height
	const c = canvas.getContext("2d")

	c.drawImage(img, 0, 0, canvas.width, canvas.height)
	const imgData = c.getImageData(0, 0, canvas.width, canvas.height)
	const data = imgData.data
	c.fillStyle = "black"
	c.fillRect(0, 0, canvas.width, canvas.height)

	let pixelIndex = 0
	const makeCodeString = {}

	for (let i = 0; i < data.length; i += 4) {
		let x = pixelIndex % canvas.width
		let y = Math.floor(pixelIndex / canvas.width)

		const r = data[i + 0]
		const g = data[i + 1]
		const b = data[i + 2]
		const a = data[i + 3]

		const nearest = Array.from(arcadeColors).sort((prev, curr) => {
			const rDifference = Math.abs(prev.color.r - r) - Math.abs(curr.color.r - r)
			const gDifference = Math.abs(prev.color.g - g) - Math.abs(curr.color.g - g)
			const bDifference = Math.abs(prev.color.b - b) - Math.abs(curr.color.b - b)
			return rDifference + gDifference + bDifference
		})[0]

		c.fillStyle = `rgb(${nearest.color.r}, ${nearest.color.g}, ${nearest.color.b})`
		c.fillRect(x, y, 1, 1)

		if (makeCodeString[`row-${y}`] === undefined) {
			makeCodeString[`row-${y}`] = ""
		} else {
			// if (pixelIndex == 100000) {
			// 	console.log(makeCodeString[`row-${y}`])
			// }
			makeCodeString[`row-${y}`] += nearest.index + "\t"
		}

		pixelIndex++
	}

	let finalOutput = "let mySprite = sprites.create(img`"
	for (const row in makeCodeString) {
		finalOutput += makeCodeString[row] + "\n"
	}
	finalOutput += "`, SpriteKind.Player)"

	ta.textContent = finalOutput
	copyButton.removeAttribute("disabled")

	copyButton.addEventListener("click", () => {
		ta.select()
		document.execCommand("copy")
		copyButton.innerText = "Code copied to clipboard!"
	})
}