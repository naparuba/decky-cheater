// R2 starts the scan that is available, so that going to the button is not needed
// just to run the next scan.

export type ScanAction = 'first' | 'next'

// X on the roller that writes values: freeze every result, or unfreeze them all when at least
// one is frozen. Nothing when there is no result.
export const pickFreezeAllAction = (frozenCount: number, resultCount: number): 'freeze' | 'unfreeze' | null => {
  if (resultCount <= 0) {
    return null
  }
  return frozenCount > 0 ? 'unfreeze' : 'freeze'
}

// First scan when it is the only one available, else next scan when it is. Nothing while a
// scan is running, or when neither is available.
export const pickScanAction = (state: {
  loading: boolean
  firstScannable: boolean
  nextScannable: boolean
}): ScanAction | null => {
  if (state.loading) {
    return null
  }
  if (state.firstScannable) {
    return 'first'
  }
  if (state.nextScannable) {
    return 'next'
  }
  return null
}
