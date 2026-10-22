// A scan takes milliseconds, a few seconds on a very big game. A call to the
// backend that lasts longer than this one does not answer any more (the
// backend crashed, or loops): the interface gives up instead of turning forever.
export const SCAN_TIMEOUT_MS = 60_000

export class BackendTimeout extends Error {
  constructor(public readonly ms: number) {
    super(`no answer from the backend after ${ms} ms`)
    this.name = 'BackendTimeout'
  }
}

// The promise, or a BackendTimeout when it takes more than `ms`. A late answer
// is dropped.
export const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new BackendTimeout(ms)), ms)
    promise.then(
      value => {
        clearTimeout(timer)
        resolve(value)
      },
      error => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
