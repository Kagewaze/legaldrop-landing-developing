// Google reports credential/authorization failures through this browser-global
// callback rather than by rejecting importLibrary(). Keep one bridge beside the
// canonical loader so map surfaces cannot overwrite each other or an existing
// callback installed by host instrumentation.
const authFailureListeners = new Set()
let authFailureBridge = null
let previousAuthFailure = null

export function subscribeMapsAuthFailure(listener) {
  if (typeof window === 'undefined' || typeof listener !== 'function') {
    return () => {}
  }

  if (!authFailureBridge) {
    previousAuthFailure = window.gm_authFailure
    authFailureBridge = (...args) => {
      try {
        if (typeof previousAuthFailure === 'function') {
          previousAuthFailure.apply(window, args)
        }
      } finally {
        ;[...authFailureListeners].forEach((authFailureListener) => {
          try {
            authFailureListener()
          } catch (error) {
            console.error(
              '[maps-loader] A Maps authentication-failure listener failed.',
              error,
            )
          }
        })
      }
    }
    window.gm_authFailure = authFailureBridge
  }

  authFailureListeners.add(listener)

  return () => {
    authFailureListeners.delete(listener)

    if (authFailureListeners.size === 0 && authFailureBridge) {
      if (window.gm_authFailure === authFailureBridge) {
        window.gm_authFailure = previousAuthFailure
      }
      authFailureBridge = null
      previousAuthFailure = null
    }
  }
}
