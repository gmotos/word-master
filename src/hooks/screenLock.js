import { useEffect, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'

async function setLockScreen(enable, wakeLockObject, visibility, callback, errorCallback) {
  if (!('wakeLock' in navigator)) {
    return
  }
  try {
    if (visibility && enable && !wakeLockObject) {
      const lock = await navigator.wakeLock.request('screen')
      console.log('Enabled wake lock')
      if (callback) {
        callback(lock)
      }
    } else if ((!visibility || !enable) && wakeLockObject) {
      const lock = await wakeLockObject.release('screen')
      console.log('Disabled wake lock')
      if (callback) {
        callback(lock)
      }
    }
  } catch (e) {
    console.log(e)
    if (errorCallback) {
      errorCallback(e)
    }
  }
}

export const useScreenLock = () => {
  const [screenLockEnabled, setScreenLockEnabled] = useLocalStorage('screen-lock-enabled', false)
  const [wakeLockObject, setWakeLockObject] = useState(null)
  const [visibility, setVisibility] = useState(true)

  useEffect(() => {
    //update screen lock based on state
    setLockScreen(screenLockEnabled, wakeLockObject, visibility, (lock) => {
      setWakeLockObject(lock)
    })
    return () => {}
  }, [screenLockEnabled, wakeLockObject, visibility])

  useEffect(() => {
    const onVisibilityChange = function () {
      //set visibility state
      setVisibility(document.visibilityState === 'visible')
    }
    console.log('Adding visibility listener')
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      console.log('Removing visibility listener')
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return [screenLockEnabled, setScreenLockEnabled]
}
