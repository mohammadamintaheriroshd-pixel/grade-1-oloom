const expand = 20

export function pixelToPercent(element, parent, dropZone) {
  return {
    x: ((element.x - (dropZone && expand)) / parent.width) * 100,
    y: ((element.y - (dropZone && expand)) / parent.height) * 100,
    width: ((element.width + (dropZone && expand * 2)) / parent.width) * 100,
    height: ((element.height + (dropZone && expand * 2)) / parent.height) * 100,
  }
}