// Constants for the animation
const ANIMATION_DELAY = 1500;  // ms between steps
const MAX_HEIGHT = 500;        // px (should match CSS var --chart-height)
const MAX_VALUE = 400;         // for scaling bar height
const CYCLES = 5;

// Spending retention rates
const LOCAL_RETENTION = 0.8;   // 80% stays in local economy
const UK_RETENTION = 0.4;      // 40% stays in UK economy
const FOREIGN_RETENTION = 0.25; // 25% stays in economy

// Get DOM elements
const fillLocal = document.getElementById('fill-local');
const fillUK = document.getElementById('fill-uk');
const fillForeign = document.getElementById('fill-foreign');
const amtLocal = document.getElementById('amt-local');
const amtUK = document.getElementById('amt-uk');
const amtForeign = document.getElementById('amt-foreign');
const pctLocal = document.getElementById('pct-local');
const pctUK = document.getElementById('pct-uk');
const pctForeign = document.getElementById('pct-foreign');
const cycleNumber = document.getElementById('cycle-number');
const resetBtn = document.getElementById('reset-btn');

// Initialize values
let totalLocal = 0, totalUK = 0, totalForeign = 0;
let currentCycle = 0;
let initialSpend = 100;
let animationRunning = false;
let animationInterval = null;
let initialized = false;

// Pre-calculate values for each cycle
const localValues = [];
const ukValues = [];
const foreignValues = [];

function precalculateValues() {
  localValues.length = 0;
  ukValues.length = 0;
  foreignValues.length = 0;
  
  // First cycle shows the amount that stays in the economy from the initial £100
  localValues.push(initialSpend * LOCAL_RETENTION); // 80% of £100 = £80
  ukValues.push(initialSpend * UK_RETENTION);       // 40% of £100 = £40
  foreignValues.push(initialSpend * FOREIGN_RETENTION); // 25% of £100 = £25
  
  // Calculate subsequent cycles
  let localSpend = localValues[0];
  let ukSpend = ukValues[0];
  let foreignSpend = foreignValues[0];
  
  for (let i = 1; i < CYCLES; i++) {
    localSpend *= LOCAL_RETENTION;
    ukSpend *= UK_RETENTION;
    foreignSpend *= FOREIGN_RETENTION;
    
    localValues.push(localSpend);
    ukValues.push(ukSpend);
    foreignValues.push(foreignSpend);
  }
}

// Update the UI for the current step
function updateUI() {
  // Calculate percentage of max value
  const pctLocalValue = Math.min(totalLocal / MAX_VALUE, 1) * 100;
  const pctUKValue = Math.min(totalUK / MAX_VALUE, 1) * 100;
  const pctForeignValue = Math.min(totalForeign / MAX_VALUE, 1) * 100;

  // Update height and text
  fillLocal.style.height = `${pctLocalValue}%`;
  fillUK.style.height = `${pctUKValue}%`;
  fillForeign.style.height = `${pctForeignValue}%`;

  amtLocal.textContent = `£${totalLocal.toFixed(2)}`;
  amtUK.textContent = `£${totalUK.toFixed(2)}`;
  amtForeign.textContent = `£${totalForeign.toFixed(2)}`;
  
  // Update percentage text
  pctLocal.textContent = `${Math.round(pctLocalValue)}%`;
  pctUK.textContent = `${Math.round(pctUKValue)}%`;
  pctForeign.textContent = `${Math.round(pctForeignValue)}%`;
  
  // Update cycle number with animation
  cycleNumber.textContent = currentCycle;
  cycleNumber.classList.add('pulse-animation');
  
  // Remove animation class after animation completes
  setTimeout(() => {
    cycleNumber.classList.remove('pulse-animation');
  }, 500);
}

// Reset the animation
function resetAnimation() {
  // Prevent multiple resets
  if (animationRunning) {
    return;
  }
  
  // Stop current animation
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  
  // Reset all values
  totalLocal = 0;
  totalUK = 0;
  totalForeign = 0;
  currentCycle = 0;
  
  // Pre-calculate values
  precalculateValues();
  
  // Update UI
  updateUI();
  
  // Start animation after a short delay
  setTimeout(startAnimation, 300);
}

// Perform a single step of the animation
function animationStep() {
  // If we've completed all cycles, restart the animation
  if (currentCycle >= CYCLES) {
    clearInterval(animationInterval);
    animationInterval = null;
    animationRunning = false;
    
    setTimeout(() => {
      resetAnimation();
    }, ANIMATION_DELAY * 2);
    return;
  }

  // Update totals with pre-calculated values
  totalLocal += localValues[currentCycle];
  totalUK += ukValues[currentCycle];
  totalForeign += foreignValues[currentCycle];
  
  // Update cycle number
  currentCycle++;
  
  // Update UI
  updateUI();
}

// Start the animation
function startAnimation() {
  if (animationRunning) return;
  
  // Make sure values are calculated
  if (localValues.length === 0) {
    precalculateValues();
  }
  
  animationRunning = true;
  animationStep();
  animationInterval = setInterval(animationStep, ANIMATION_DELAY);
}

// Initialize the animation once on page load
function init() {
  if (initialized) return;
  initialized = true;
  resetAnimation();
}

// Event listeners
resetBtn.addEventListener('click', function() {
  // Force a reset even if animation is running
  if (animationInterval) {
    clearInterval(animationInterval);
    animationInterval = null;
  }
  animationRunning = false;
  resetAnimation();
});

// Start animation on load, but only once
window.addEventListener('load', init);

// Only restart animation if it's not already running when visibility changes
document.addEventListener('visibilitychange', function() {
  if (document.visibilityState === 'visible' && !animationRunning) {
    resetAnimation();
  }
}); 