// @ts-check

/**
 * @type {number}
 */
let elapseTime = 0; // in milliseconds
let pauseStartTime = 0; // in milliseconds
let startTime = 0; // in milliseconds
let duration = 10 * 60 * 1000; // 10 minutes
/** @type {boolean} */
export let isPaused = false; // check if this is paused in the game loop.

/**
 * Get the current time in milliseconds.
 * @returns {number}
 */
function getTimeNow() {
  /**@type {number} */
  return new Date().getTime();
}

export function pauseTimer() {
  if (isPaused) {
    return;
  }
  pauseStartTime = getTimeNow();
  elapseTime += pauseStartTime - startTime; // add the time that was paused to the elapse time.
  startTime = 0;
}

export function resumeTimer() {
  if (!isPaused) {
    return;
  }
  elapseTime += getTimeNow() - pauseStartTime; // add the time that was paused to the elapse time.
  startTime = getTimeNow(); // sa
  pauseStartTime = 0;
}

// restarts the timer sets start to now erases all values
export function resetTimer() {
  startTime = getTimeNow();
  elapseTime = 0;
}

export function stopTimer() {
  isPaused = false; // hard reset for the Pause should be done externally, but this is a safety measure.
  elapseTime = 0;
  pauseStartTime = 0;
  startTime = 0;
}

export function startTimer() {
  isPaused = false; // hard reset for the Pause should be done externally, but this is a safety measure.
  startTime = getTimeNow();
}

/**
 * Get the elapsed time in milliseconds.
 * @returns {number}
 */
export function getElapseTime() {
  if (isPaused) {
    return elapseTime;
  } else {
    return elapseTime + (getTimeNow() - startTime); // stores the time that has passed since the last call to elapseTime
  }
}

export function checkDuration() {
  if (getElapseTime() >= duration) {
    stopTimer();
  }
}