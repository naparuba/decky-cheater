// The searches that live side by side (one per thing the user looks for: ammo, health...).
// Each is an independent search in the backend; the panel shows one of them at a time.
export const NUM_SLOTS = 3

// The slot reached by going `delta` slots further (-1 = L1, +1 = R1), from the last to the
// first and the other way round.
export const nextSlot = (current: number, delta: number): number =>
  (((current + delta) % NUM_SLOTS) + NUM_SLOTS) % NUM_SLOTS

export type SlotLineState = 'active' | 'filled' | 'empty'

// How the line of a slot is drawn in the strip of tabs: full for the slot that is shown, then
// medium for a slot that holds a search and pale for one that is still empty.
export const slotLineState = (index: number, active: number, hasSearch: boolean): SlotLineState =>
  index === active ? 'active' : hasSearch ? 'filled' : 'empty'

export const SLOT_LINE_OPACITY: Record<SlotLineState, number> = {
  active: 1,
  filled: 0.5,
  empty: 0.18,
}
