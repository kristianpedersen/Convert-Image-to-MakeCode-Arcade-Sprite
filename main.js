// https://makecode.com/_Cm17aw5xbKpU

setTimeout(main, 2)

function main() {
	const arcadeColors = [
		"#000000",
		"#ffffff",
		"#EB0B32",// "#ff2121", 
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
		return {
			color: hexToHSL(color),
			index: (index).toString(16) // 9 = 9, 10 = a, 11 = b, etc.
		}
	})

	console.table(arcadeColors[2])

	const form = document.querySelector("input")

	const MAX_IMAGE_SIZE = 180
	const img = document.querySelector("img")

	const factor =
		Math.min(img.width, img.height) / Math.max(img.width, img.height)

	img.width -= img.width - MAX_IMAGE_SIZE
	img.height -= img.height - MAX_IMAGE_SIZE
	//  img.width *= factor

	const canvas = document.querySelector("canvas")
	canvas.width = img.width
	canvas.height = img.height
	const c = canvas.getContext("2d")

	c.drawImage(img, 0, 0, canvas.width, canvas.height)
	const imgData = c.getImageData(0, 0, canvas.width, canvas.height)
	const data = imgData.data

	let pixelIndex = 0
	let x = 0
	let y = 0
	const makeCodeString = {}

	for (let i = 0; i < data.length; i += 4) {
		x = pixelIndex % canvas.width
		y = Math.floor(pixelIndex / canvas.height)

		const r = data[i + 0]
		const g = data[i + 1]
		const b = data[i + 2]
		const a = data[i + 3]

		const hexString = "#" + [r, g, b]
			.map(n => n.toString(16))
			.join("")
		const pixelAsHSL = hexToHSL(hexString)

		const nearestL = arcadeColors.sort((a, b) => {
			const hDifference = Math.abs(a.color.h - pixelAsHSL.h) - Math.abs(b.color.h - pixelAsHSL.h)
			const sDifference = Math.abs(a.color.s - pixelAsHSL.s) - Math.abs(b.color.s - pixelAsHSL.s)
			const lDifference = Math.abs(a.color.l - pixelAsHSL.l) - Math.abs(b.color.l - pixelAsHSL.l)
			return (hDifference * 0.2) + (sDifference * 0.2) + (lDifference * 200)
		})[0]

		const nearestAsHSLString = `hsl(${nearestL.color.h}, ${Math.floor(nearestL.color.s)}%, ${Math.floor(nearestL.color.l)}%)`
		c.fillStyle = nearestAsHSLString
		c.fillRect(x, y, 1, 1)

		if (makeCodeString[`row-${y}`] === undefined) {
			makeCodeString[`row-${y}`] = ""
		} else {
			makeCodeString[`row-${y}`] += nearestL.index + "\t"
		}

		pixelIndex++
	}

	let finalOutput = "let mySprite = sprites.create(img`"
	for (const row in makeCodeString) {
		finalOutput += makeCodeString[row] + "\n"
	}
	finalOutput += "`, SpriteKind.Player)"

	console.log(finalOutput)

	// hexToHSL: https://css-tricks.com/converting-color-spaces-in-javascript/
	function hexToHSL(H) {
		// Convert hex to RGB first
		let r = 0, g = 0, b = 0;
		if (H.length == 4) {
			r = "0x" + H[1] + H[1];
			g = "0x" + H[2] + H[2];
			b = "0x" + H[3] + H[3];
		} else if (H.length == 7) {
			r = "0x" + H[1] + H[2];
			g = "0x" + H[3] + H[4];
			b = "0x" + H[5] + H[6];
		}
		// Then to HSL
		r /= 255;
		g /= 255;
		b /= 255;
		let cmin = Math.min(r, g, b),
			cmax = Math.max(r, g, b),
			delta = cmax - cmin,
			h = 0,
			s = 0,
			l = 0;

		if (delta == 0)
			h = 0;
		else if (cmax == r)
			h = ((g - b) / delta) % 6;
		else if (cmax == g)
			h = (b - r) / delta + 2;
		else
			h = (r - g) / delta + 4;

		h = Math.round(h * 60);

		if (h < 0)
			h += 360;

		l = (cmax + cmin) / 2;
		s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
		s = +(s * 100).toFixed(1);
		l = +(l * 100).toFixed(1);

		return { h, s, l };
	}
}