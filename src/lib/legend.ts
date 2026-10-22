// The legend at the bottom of the panel (the buttons and what they do) is drawn by Steam: its
// entries wrap onto several lines, three rows or more once the shortcuts of Swindle are in it.
// This puts them on one line: smaller entries, and the whole row shrunk when it is still wider
// than the panel. It only touches the style of the legend, in the document of the panel.

// The scale that makes a row of `total` px fit in `available` px, never above 1 and never so
// small that the text can no longer be read.
export const MIN_LEGEND_SCALE = 0.7

export const legendScale = (total: number, available: number): number => {
  if (total <= 0 || available <= 0 || total <= available) {
    return 1
  }
  return Math.max(available / total, MIN_LEGEND_SCALE)
}

const GLYPH_SIZE = '14px'
const LABEL_FONT_SIZE = '10px'

// The row of the legend, found from the label of one of its entries: an entry is a glyph (an
// image) followed by the label, and the row wraps its entries.
export const findLegendRow = (doc: Document, label: string): HTMLElement | null => {
  for (const leaf of Array.from(doc.querySelectorAll('div'))) {
    if (leaf.childElementCount !== 0 || leaf.textContent !== label) {
      continue
    }
    const entry = leaf.parentElement
    const row = entry?.parentElement
    if (!entry || !row || !entry.querySelector('img')) {
      continue
    }
    if (row.dataset.swindleLegend === '1' || getComputedStyle(row).flexWrap === 'wrap') {
      return row
    }
  }
  return null
}

// One line, compact entries, and shrunk to the width of the panel when it is still too wide.
// The entries whose label is in `hidden` are left out: they say what is obvious (B goes back, the
// D-pad moves). Safe to call again whenever Steam redraws the entries.
export const fitLegendRow = (row: HTMLElement, hidden: readonly string[] = []): void => {
  row.dataset.swindleLegend = '1'
  row.style.flexWrap = 'nowrap'
  row.style.justifyContent = 'flex-end'
  row.style.overflow = 'hidden'
  row.style.transform = ''

  for (const entry of Array.from(row.children) as HTMLElement[]) {
    entry.style.flexShrink = '0'
    entry.style.whiteSpace = 'nowrap'
    entry.style.padding = '2px 3px'
    entry.style.height = 'auto'
    // an entry is its glyphs (two when Steam merges L1 and R1) then its label
    const parts = Array.from(entry.children) as HTMLElement[]
    const label = parts.pop()
    entry.style.display = label && hidden.includes(label.textContent ?? '') ? 'none' : ''
    for (const glyph of parts) {
      // wide enough for all its images: L1 and R1 are merged into one glyph with two of them
      glyph.style.width = 'auto'
      glyph.style.display = 'flex'
      glyph.style.gap = '2px'
      glyph.style.height = GLYPH_SIZE
      for (const image of Array.from(glyph.querySelectorAll('img'))) {
        image.style.width = GLYPH_SIZE
        image.style.height = GLYPH_SIZE
      }
    }
    if (label) {
      label.style.fontSize = LABEL_FONT_SIZE
      label.style.marginLeft = '3px'
      label.style.height = 'auto'
    }
  }

  // the row takes the width the bar leaves it (without this it grows with its entries)
  const bar = row.parentElement
  if (bar) {
    const style = getComputedStyle(bar)
    const available = bar.clientWidth - parseFloat(style.paddingLeft || '0') - parseFloat(style.paddingRight || '0')
    row.style.flex = 'none'
    row.style.width = `${available}px`
  }

  const total = Array.from(row.children).reduce((sum, entry) => sum + (entry as HTMLElement).getBoundingClientRect().width, 0)
  const scale = legendScale(total, row.clientWidth)
  if (scale < 1) {
    row.style.transformOrigin = 'right center'
    row.style.transform = `scale(${scale})`
  }
}

// Keeps the legend on one line as long as it is called: looks for the row now and then, and
// fits it again when Steam changes its entries. Returns what stops it.
export const keepLegendOnOneLine = (doc: Document, label: string, hidden: readonly string[] = []): (() => void) => {
  let row: HTMLElement | null = null
  let observer: MutationObserver | null = null

  const look = () => {
    if (row && row.isConnected) {
      return
    }
    observer?.disconnect()
    row = findLegendRow(doc, label)
    if (!row) {
      return
    }
    const found = row
    observer = new MutationObserver(() => fitLegendRow(found, hidden))
    observer.observe(found, { childList: true, subtree: true, characterData: true })
    fitLegendRow(found, hidden)
  }

  look()
  const timer = window.setInterval(look, 500)
  return () => {
    window.clearInterval(timer)
    observer?.disconnect()
  }
}
