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

/**
 * Get the current time in milliseconds.
 * @returns {number}
 */
function getTimeNow() {
  /**@type {number} */
  return new Date().getTime();
}

function pauseTimer() {
  pauseStartTime = getTimeNow();
  elapseTime += pauseStartTime - startTime; // add the time that was paused to the elapse time.
  startTime = 0;
}

function resumeTimer() {

  startTime = getTimeNow(); // sa
  pauseStartTime = 0;
}

// restarts the timer sets start to now erases all values
function resetTimer() {
  startTime = getTimeNow();
  elapseTime = 0;
}

function stopTimer() {
  elapseTime = 0;
  pauseStartTime = 0;
  startTime = 0;
  timerRunning = false;
}

function startTimer() {
  startTime = getTimeNow();
  timerRunning = true;
}

/**
 * Get the elapsed time in milliseconds.
 * @returns {number}
 */
function getElapseTime(isPaused) {

  if (isPaused) {
    let timeInSeconds = getSeconds(elapseTime);
    return timeInSeconds;
  }
  if (timerRunning) {
    let timeInSeconds = getSeconds(elapseTime + (getTimeNow() - startTime));
    return timeInSeconds; // stores the time that has passed since the last call to elapseTime
  } else {
    return -1;
  }
}

function checkDuration() {
  if (elapseTime >= duration) {
    stopTimer();
    return false;
  }
  return true;
}

function getSeconds(time) {
  return Math.floor(time / 1000);
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
