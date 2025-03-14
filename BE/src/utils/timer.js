// @ts-check

/**
 * @type {number}
 */
let elapseTime = 0; // in milliseconds
let pauseStartTime = 0; // in milliseconds
let startTime = 0; // in milliseconds
let timerRunning = false;
let duration = 2 * 60 * 1000; // 10 minutes
/** @type {boolean} */

let isPaused = false; // check if this is paused in the game loop.

/**
 * Get the current time in milliseconds.
 * @returns {number}
 */
function getTimeNow() {
  /**@type {number} */
  return new Date().getTime();
}

function pauseTimer() {
  if (isPaused) {
    return;
  }
  pauseStartTime = getTimeNow();
  elapseTime += pauseStartTime - startTime; // add the time that was paused to the elapse time.
  startTime = 0;
}

function resumeTimer() {
  if (!isPaused) {
    return;
  }

  elapseTime += getTimeNow() - pauseStartTime; // add the time that was paused to the elapse time.
  startTime = getTimeNow(); // sa
  pauseStartTime = 0;
}

// restarts the timer sets start to now erases all values
function resetTimer() {
  startTime = getTimeNow();
  elapseTime = 0;
}

function stopTimer() {
  isPaused = false; // hard reset for the Pause should be done externally, but this is a safety measure.
  elapseTime = 0;
  pauseStartTime = 0;
  startTime = 0;
  timerRunning = false;
}

function startTimer() {
  isPaused = false; // hard reset for the Pause should be done externally, but this is a safety measure.
  startTime = getTimeNow();
  timerRunning = true;
}

/**
 * Get the elapsed time in milliseconds.
 * @returns {number}
 */
function getElapseTime() {
  if (isPaused) {
    return elapseTime;
  } if (timerRunning) {
    return elapseTime + (getTimeNow() - startTime); // stores the time that has passed since the last call to elapseTime
  } else {
    return -1;
  }
}

function checkDuration() {
  if (getElapseTime() >= duration) {
    stopTimer();
    return false;
  }
  return true;
}

module.exports = {
  pauseTimer,
  resumeTimer,
  resetTimer,
  stopTimer,
  startTimer,
  getElapseTime,
  checkDuration,
  getTimeNow,
};