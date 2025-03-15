// DOM Elements
const currentInputEl = document.getElementById('current-input');
const previousOperationEl = document.getElementById('previous-operation');
const historyPanel = document.getElementById('history-panel');
const historyList = document.getElementById('history-list');
const themeToggle = document.getElementById('theme-toggle');
const moonIcon = document.getElementById('moon-icon');
const sunIcon = document.getElementById('sun-icon');
const historyToggle = document.getElementById('history-toggle');
const clearHistoryBtn = document.getElementById('clear-history');
const errorToast = document.getElementById('error-toast');
const errorMessage = document.getElementById('error-message');

// Calculator state
let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetInput = false;
let history = [];

// Check for saved history and theme in localStorage
function initializeAppState() {
  // Initialize theme
  const savedTheme = localStorage.getItem('calculatorTheme');
  if (savedTheme === 'dark') {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  }
  
  // Initialize history
  const savedHistory = localStorage.getItem('calculatorHistory');
  if (savedHistory) {
    try {
      history = JSON.parse(savedHistory);
      renderHistory();
    } catch (e) {
      console.error('Failed to parse history from localStorage', e);
      history = [];
    }
  }
}

// Render/update calculator display
function updateDisplay() {
  currentInputEl.textContent = currentInput;
  
  if (operation !== null) {
    previousOperationEl.textContent = `${previousInput} ${getOperationSymbol(operation)}`;
  } else {
    previousOperationEl.textContent = '';
  }
}

// Get the readable symbol for operations
function getOperationSymbol(op) {
  switch (op) {
    case '+': return '+';
    case '-': return '−';
    case '*': return '×';
    case '/': return '÷';
    default: return '';
  }
}

// Handle number input
function handleNumberInput(number) {
  if (currentInput === '0' || shouldResetInput) {
    currentInput = number;
    shouldResetInput = false;
  } else if (currentInput.length < 12) { // Prevent overflow
    currentInput += number;
  }
  updateDisplay();
}

// Handle operation input
function handleOperationInput(op) {
  if (operation !== null) {
    calculate();
  }
  
  previousInput = currentInput;
  operation = op;
  shouldResetInput = true;
  updateDisplay();
}

// Handle decimal point input
function handleDecimalInput() {
  if (shouldResetInput) {
    currentInput = '0.';
    shouldResetInput = false;
  } else if (!currentInput.includes('.')) {
    currentInput += '.';
  }
  updateDisplay();
}

// Handle equals button press
function handleEquals() {
  if (operation === null) return;
  
  calculate();
  operation = null;
  updateDisplay();
}

// Handle clear button press
function handleClear() {
  currentInput = '0';
  previousInput = '';
  operation = null;
  shouldResetInput = false;
  updateDisplay();
}

// Handle backspace button press
function handleBackspace() {
  if (currentInput.length === 1 || (currentInput.length === 2 && currentInput[0] === '-')) {
    currentInput = '0';
  } else {
    currentInput = currentInput.slice(0, -1);
  }
  updateDisplay();
}

// Handle percentage button press
function handlePercentage() {
  const value = parseFloat(currentInput);
  if (!isNaN(value)) {
    currentInput = (value / 100).toString();
    updateDisplay();
  }
}

// Perform calculation
function calculate() {
  const prev = parseFloat(previousInput);
  const current = parseFloat(currentInput);
  
  if (isNaN(prev) || isNaN(current)) return;
  
  let result;
  const calculationText = `${previousInput} ${getOperationSymbol(operation)} ${currentInput}`;
  
  try {
    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          throw new Error('Cannot divide by zero');
        }
        result = prev / current;
        break;
      default:
        return;
    }
    
    // Round to avoid floating point issues
    result = Math.round(result * 1000000) / 1000000;
    
    // Format result for display
    const resultStr = result.toString();
    
    // Add to history
    addToHistory(calculationText, resultStr);
    
    currentInput = resultStr;
    shouldResetInput = true;
  } catch (err) {
    showError(err.message);
  }
}

// Add calculation to history
function addToHistory(calculation, result) {
  history.unshift({ calculation, result });
  
  // Keep history at a reasonable length
  if (history.length > 50) {
    history = history.slice(0, 50);
  }
  
  // Save to localStorage
  localStorage.setItem('calculatorHistory', JSON.stringify(history));
  
  // Update the UI if the history panel is open
  if (!historyPanel.classList.contains('hidden')) {
    renderHistory();
  }
}

// Render history in the UI
function renderHistory() {
  historyList.innerHTML = '';
  
  if (history.length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.textContent = 'No calculations yet';
    emptyItem.style.fontStyle = 'italic';
    emptyItem.style.color = 'var(--text-secondary)';
    historyList.appendChild(emptyItem);
    return;
  }
  
  history.forEach(item => {
    const listItem = document.createElement('li');
    
    const calculationSpan = document.createElement('span');
    calculationSpan.className = 'calculation';
    calculationSpan.textContent = `${item.calculation} =`;
    
    const resultSpan = document.createElement('span');
    resultSpan.className = 'result';
    resultSpan.textContent = item.result;
    
    listItem.appendChild(calculationSpan);
    listItem.appendChild(resultSpan);
    
    historyList.appendChild(listItem);
  });
}

// Clear calculation history
function clearHistory() {
  history = [];
  localStorage.removeItem('calculatorHistory');
  renderHistory();
}

// Show error toast
function showError(message) {
  errorMessage.textContent = `Error: ${message}`;
  errorToast.classList.remove('hidden');
  
  // Hide after 3 seconds
  setTimeout(() => {
    errorToast.classList.add('hidden');
  }, 3000);
}

// Toggle theme between light and dark mode
function toggleTheme() {
  const isDarkMode = document.body.classList.contains('dark-mode');
  
  if (isDarkMode) {
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
    localStorage.setItem('calculatorTheme', 'light');
  } else {
    document.body.classList.remove('light-mode');
    document.body.classList.add('dark-mode');
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
    localStorage.setItem('calculatorTheme', 'dark');
  }
}

// Toggle history panel
function toggleHistoryPanel() {
  historyPanel.classList.toggle('hidden');
  
  if (!historyPanel.classList.contains('hidden')) {
    renderHistory();
  }
}

// Setup event listeners
function setupEventListeners() {
  // Theme toggle
  themeToggle.addEventListener('click', toggleTheme);
  
  // History toggle
  historyToggle.addEventListener('click', toggleHistoryPanel);
  
  // Clear history
  clearHistoryBtn.addEventListener('click', clearHistory);
  
  // Number keys
  document.querySelectorAll('.number-key[data-number]').forEach(button => {
    button.addEventListener('click', () => {
      handleNumberInput(button.getAttribute('data-number'));
    });
  });
  
  // Operation keys
  document.querySelectorAll('.operation-key[data-operation]').forEach(button => {
    button.addEventListener('click', () => {
      handleOperationInput(button.getAttribute('data-operation'));
    });
  });
  
  // Decimal key
  document.querySelector('[data-action="decimal"]').addEventListener('click', handleDecimalInput);
  
  // Equals key
  document.querySelector('[data-action="equals"]').addEventListener('click', handleEquals);
  
  // Clear key
  document.querySelector('[data-action="clear"]').addEventListener('click', handleClear);
  
  // Backspace key
  document.querySelector('[data-action="backspace"]').addEventListener('click', handleBackspace);
  
  // Percentage key
  document.querySelector('[data-action="percentage"]').addEventListener('click', handlePercentage);
  
  // Keyboard support
  document.addEventListener('keydown', handleKeyDown);
}

// Handle keyboard input
function handleKeyDown(e) {
  // Numbers
  if (/^[0-9]$/.test(e.key)) {
    handleNumberInput(e.key);
  }
  // Operations
  else if (['+', '-', '*', '/'].includes(e.key)) {
    handleOperationInput(e.key);
  }
  // Equals and Enter
  else if (e.key === '=' || e.key === 'Enter') {
    e.preventDefault();
    handleEquals();
  }
  // Backspace
  else if (e.key === 'Backspace') {
    handleBackspace();
  }
  // Clear
  else if (e.key === 'Escape') {
    handleClear();
  }
  // Decimal
  else if (e.key === '.') {
    handleDecimalInput();
  }
  // Percentage
  else if (e.key === '%') {
    handlePercentage();
  }
}

// Initialize the app
function initApp() {
  initializeAppState();
  updateDisplay();
  setupEventListeners();
}

// Start the app when the page is loaded
window.addEventListener('DOMContentLoaded', initApp);