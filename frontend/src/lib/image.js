// Turns a photo picked from the device into a small WebP image encoded as a
// Base64 data URL, so it can be saved inside the product record itself.

const MAX_SIDE = 800 // longest edge in pixels
const MAX_BYTES = 100 * 1024 // keeps product lists light to download
const MAX_SOURCE_BYTES = 15 * 1024 * 1024

// A Base64 string is 4 characters for every 3 bytes.
export const dataUrlBytes = (dataUrl) => Math.round(((dataUrl.length - dataUrl.indexOf(',') - 1) * 3) / 4)

const loadImage = (file) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('This file could not be read as an image. Try a JPG, PNG or WebP photo.'))
    }
    image.src = url
  })

export async function fileToWebpDataUrl(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file such as JPG, PNG or WebP.')
  if (file.size > MAX_SOURCE_BYTES) throw new Error('This photo is larger than 15 MB. Choose a smaller one.')

  const image = await loadImage(file)
  const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)

  // Browsers that cannot encode WebP silently return PNG; use JPEG there instead.
  const type = canvas.toDataURL('image/webp').startsWith('data:image/webp') ? 'image/webp' : 'image/jpeg'

  // Step the quality down until the image fits the size budget.
  let dataUrl = ''
  for (const quality of [0.82, 0.7, 0.58, 0.46, 0.34]) {
    dataUrl = canvas.toDataURL(type, quality)
    if (dataUrlBytes(dataUrl) <= MAX_BYTES) break
  }
  return dataUrl
}
