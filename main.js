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
].map((c, index) => {
	return { color: hexToHSL(c), index }
})

const size = 120
const img = document.querySelector("img")
img.width = size

const canvas = document.querySelector("canvas")
canvas.width = size
canvas.height = size
const c = canvas.getContext("2d")

c.drawImage(img, 0, 0, size, size)
var imgData = c.getImageData(0, 0, canvas.width, canvas.height);
var data = imgData.data;

let pixelIndex = 0
const getPixel = 100

let x = 0
let y = 0
const makeCodeString = Array(120).fill(Array(120))
for (let i = 0; i < data.length; i += 4) {
	x = pixelIndex % size
	y = Math.ceil(pixelIndex / size)

	const red = data[i];
	const green = data[i + 1];
	const blue = data[i + 2];

	const hexString = "#" + [red, green, blue].map(n => n.toString(16)).join("")
	const pixelAsHSL = hexToHSL(hexString)

	const nearestL = arcadeColors.sort((a, b) => {
		return Math.abs(a.color.l - pixelAsHSL.l) - Math.abs(b.color.l - pixelAsHSL.l)
	})[0]

	const nearestAsHSLString = `hsl(${nearestL.color.h}, ${Math.floor(nearestL.color.s)}%, ${Math.floor(nearestL.color.l)}%)`
	c.fillStyle = nearestAsHSLString
	c.fillRect(x, y, 1, 1)
	// console.log(x, y, nearestL.index);
	makeCodeString[x][y] = nearestL.index
	pixelIndex++
}

// console.log(makeCodeString.reduce((a, b) => a +))

// const output = makeCodeString.reduce((result, current) => {
// 	console.log(current)
// 	// result += current + "\n"
// 	return result
// }, "")

// console.log(output)

// const output = makeCodeString.reduce((finalOutput, current, index) => {
// 	// finalOutput += current + "\n"
// 	console.log(current, current.replace("\t", "").length)
// 	return finalOutput
// }, ``)

// console.log(output)

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