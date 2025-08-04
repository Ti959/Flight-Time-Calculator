console.log('Power Calculator script loading...');

// Get DOM elements
const massInput = document.getElementById('mass');
const auxPowerInput = document.getElementById('auxPower');
const batterySizeInput = document.getElementById('batterySize');
const batteryMarginInput = document.getElementById('batteryMargin');
const lightingSlider = document.getElementById('lightingSlider');
const massOver100Display = document.getElementById('massOver100');
const term1Display = document.getElementById('term1');
const term2Display = document.getElementById('term2');
const auxPowerDisplay = document.getElementById('auxPowerDisplay');
const lightingPowerDisplay = document.getElementById('lightingPowerDisplay');
const totalPowerDisplay = document.getElementById('totalPower');
const effectiveCapacityDisplay = document.getElementById('effectiveCapacity');
const flightTimeDisplay = document.getElementById('flightTime');
const currentPayloadDisplay = document.getElementById('currentPayload');
const clearConfigBtn = document.getElementById('clearConfig');
const currentBatteryDisplay = document.getElementById('currentBattery');
const totalWeightDisplay = document.getElementById('totalWeight');

// Payload configuration state
let currentPayloadWeight = 0;
let activeConfigs = new Set();
let currentBatteryWeight = 0;
let currentBatteryCapacity = 98.8;

// Unit state
let currentUnit = 'g';
let conversionFactor = 1; // 1 for g, 1000 for kg

// Function to calculate power and flight time
function calculatePower() {
    const baseMassInput = parseFloat(massInput.value) || 0;
    // Convert input mass to grams for calculation
    const baseMass = convertToGrams(baseMassInput, currentUnit);
    const totalMass = baseMass + currentPayloadWeight + currentBatteryWeight;
    const auxPower = parseFloat(auxPowerInput.value) || 0;
    const batterySize = currentBatteryCapacity;
    const batteryMargin = parseFloat(batteryMarginInput.value) || 0;
    const lightingLevel = parseInt(lightingSlider.value) || 0;
    
    // Calculate lighting power based on slider position
    const lightingPower = lightingLevel === 0 ? 0 : lightingLevel === 1 ? 20 : 50;
    
    // Calculate intermediate values (always use grams for calculation)
    const massOver100 = totalMass / 100;
    const term1 = 6.3 * massOver100;
    const term2 = 0.66 * Math.pow(massOver100, 2);
    const totalPower = term1 + term2 + auxPower + lightingPower;
    
    // Calculate flight time
    const effectiveCapacity = batterySize * (1 - batteryMargin / 100);
    const flightTimeHours = effectiveCapacity / totalPower;
    const flightTimeMinutes = flightTimeHours * 60;
    
    // Update displays
    const displayMass = convertFromGrams(totalMass, currentUnit);
    totalWeightDisplay.textContent = displayMass.toFixed(currentUnit === 'kg' ? 3 : 0) + currentUnit;
    massOver100Display.textContent = (currentUnit === 'kg' ? totalMass / 0.1 : massOver100).toFixed(2);
    term1Display.textContent = term1.toFixed(2);
    term2Display.textContent = term2.toFixed(2);
    auxPowerDisplay.textContent = auxPower.toFixed(1);
    lightingPowerDisplay.textContent = lightingPower.toFixed(1);
    totalPowerDisplay.textContent = totalPower.toFixed(2) + ' W';
    effectiveCapacityDisplay.textContent = effectiveCapacity.toFixed(1) + ' Wh';
    flightTimeDisplay.textContent = flightTimeMinutes.toFixed(1) + ' min';
    
    // Add animation effect to the result
    totalPowerDisplay.style.transform = 'scale(1.05)';
    setTimeout(() => {
        totalPowerDisplay.style.transform = 'scale(1)';
    }, 200);
}

// Add event listeners for real-time updates
massInput.addEventListener('input', calculatePower);
auxPowerInput.addEventListener('input', calculatePower);
batterySizeInput.addEventListener('input', calculatePower);
batteryMarginInput.addEventListener('input', calculatePower);
lightingSlider.addEventListener('input', calculatePower);

// Add event listeners for keyboard navigation
massInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        auxPowerInput.focus();
    }
});

auxPowerInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        batterySizeInput.focus();
    }
});

batterySizeInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        batteryMarginInput.focus();
    }
});

batteryMarginInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        massInput.focus();
    }
});

// Initialize calculation on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing calculator...');
    updateEquationDisplay();
    
    // Set default mass value based on current unit
    const defaultMassGrams = 1920;
    const defaultMass = convertFromGrams(defaultMassGrams, currentUnit);
    massInput.value = defaultMass.toFixed(currentUnit === 'kg' ? 3 : 0);
    
    calculatePower();
    
    // Add smooth transitions
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.style.transition = 'all 0.3s ease';
    });
    
    // Add hover effects to calculation steps
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });
        
        step.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Add event listeners for weight buttons
    const weightButtons = document.querySelectorAll('.use-weight-btn');
    console.log('Found weight buttons:', weightButtons.length);
    weightButtons.forEach(button => {
        button.addEventListener('click', function() {
            const weight = parseFloat(this.getAttribute('data-weight'));
            const convertedWeight = convertFromGrams(weight, currentUnit);
            massInput.value = convertedWeight.toFixed(currentUnit === 'kg' ? 3 : 0);
            calculatePower();
            
            // Add visual feedback
            this.style.background = '#4CAF50';
            this.textContent = 'Used!';
            setTimeout(() => {
                this.style.background = '#6c5ce7';
                this.textContent = 'Use';
            }, 1000);
        });
    });

    // Add event listeners for payload configuration buttons
    const configButtons = document.querySelectorAll('.config-btn');
    console.log('Found config buttons:', configButtons.length);
    configButtons.forEach(button => {
        button.addEventListener('click', function() {
            const weight = parseInt(this.getAttribute('data-weight'));
            const configName = this.parentElement.querySelector('.config-name').textContent.replace(':', '');
            
            if (activeConfigs.has(configName)) {
                // Remove configuration
                activeConfigs.delete(configName);
                currentPayloadWeight -= weight;
                this.classList.remove('active');
                this.textContent = 'Add';
            } else {
                // Add configuration
                activeConfigs.add(configName);
                currentPayloadWeight += weight;
                this.classList.add('active');
                this.textContent = 'Remove';
            }
            
            // Update displays
            const convertedPayload = convertFromGrams(currentPayloadWeight, currentUnit);
            currentPayloadDisplay.textContent = convertedPayload.toFixed(currentUnit === 'kg' ? 3 : 0) + currentUnit;
            calculatePower();
            
            // Add visual feedback
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });

    // Add event listener for clear configuration button
    clearConfigBtn.addEventListener('click', function() {
        currentPayloadWeight = 0;
        activeConfigs.clear();
        currentPayloadDisplay.textContent = '0' + currentUnit;
        
        // Reset all config buttons
        const configButtons = document.querySelectorAll('.config-btn');
        configButtons.forEach(button => {
            button.classList.remove('active');
            button.textContent = 'Add';
        });
        
        calculatePower();
        
        // Add visual feedback
        this.style.background = '#4CAF50';
        this.textContent = 'Cleared!';
        setTimeout(() => {
            this.style.background = '#95a5a6';
            this.textContent = 'Clear';
        }, 1000);
    });

    // Add event listeners for unit toggle buttons
    const unitButtons = document.querySelectorAll('.unit-btn');
    console.log('Found unit buttons:', unitButtons.length);
    unitButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('Unit button clicked:', this.getAttribute('data-unit'));
            const newUnit = this.getAttribute('data-unit');
            if (newUnit !== currentUnit) {
                // Store the old unit for conversion
                const oldUnit = currentUnit;
                
                // Update unit state
                currentUnit = newUnit;
                conversionFactor = newUnit === 'kg' ? 1000 : 1;
                
                // Update button states
                unitButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Update all displays with proper conversion
                updateUnitDisplay(oldUnit);
                
                // Add visual feedback
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            }
        });
    });
    
    // Fallback: Add event listeners using IDs
    const unitGButton = document.getElementById('unit-g');
    const unitKgButton = document.getElementById('unit-kg');
    console.log('Found unit-g button:', unitGButton);
    console.log('Found unit-kg button:', unitKgButton);
    
    if (unitGButton) {
        unitGButton.addEventListener('click', function() {
            console.log('Unit g button clicked (ID method)');
            if (currentUnit !== 'g') {
                const oldUnit = currentUnit;
                currentUnit = 'g';
                conversionFactor = 1;
                
                // Update button states
                unitButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                updateUnitDisplay(oldUnit);
                
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }
    
    if (unitKgButton) {
        unitKgButton.addEventListener('click', function() {
            console.log('Unit kg button clicked (ID method)');
            if (currentUnit !== 'kg') {
                const oldUnit = currentUnit;
                currentUnit = 'kg';
                conversionFactor = 1000;
                
                // Update button states
                unitButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                updateUnitDisplay(oldUnit);
                
                this.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    this.style.transform = 'scale(1)';
                }, 200);
            }
        });
    }

    // Add event listeners for battery configuration buttons
    const batteryButtons = document.querySelectorAll('.battery-btn');
    console.log('Found battery buttons:', batteryButtons.length);
    batteryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const batteryCapacity = parseFloat(this.getAttribute('data-battery'));
            const batteryWeight = parseInt(this.getAttribute('data-weight'));
            
            // Update battery state
            currentBatteryCapacity = batteryCapacity;
            currentBatteryWeight = batteryWeight;
            
            // Update battery display
            currentBatteryDisplay.textContent = batteryCapacity + ' Wh';
            
            // Update battery input field
            batterySizeInput.value = batteryCapacity;
            
            // Reset all battery buttons
            batteryButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.textContent = 'Use';
            });
            
            // Activate current button
            this.classList.add('active');
            this.textContent = 'Active';
            
            calculatePower();
            
            // Add visual feedback
            this.style.transform = 'scale(1.1)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 200);
        });
    });
});

// Unit conversion functions
function convertToGrams(value, unit) {
    return unit === 'kg' ? value * 1000 : value;
}

function convertFromGrams(value, unit) {
    return unit === 'kg' ? value / 1000 : value;
}

function updateEquationDisplay() {
    const equationElement = document.querySelector('.equation');
    if (currentUnit === 'kg') {
        equationElement.innerHTML = 'P(W) = 6.3(M/0.1) + 0.66(M/0.1)² + P<sub>aux</sub> + P<sub>lights</sub>';
    } else {
        equationElement.innerHTML = 'P(W) = 6.3(M/100) + 0.66(M/100)² + P<sub>aux</sub> + P<sub>lights</sub>';
    }
}

function updateUnitDisplay(oldUnit) {
    // Update mass input label
    document.getElementById('massUnit').textContent = currentUnit;
    
    // Update current mass value - convert from old unit to grams, then to new unit
    const currentMass = parseFloat(massInput.value) || 0;
    const massInGrams = convertToGrams(currentMass, oldUnit);
    const convertedMass = convertFromGrams(massInGrams, currentUnit);
    massInput.value = convertedMass.toFixed(currentUnit === 'kg' ? 3 : 0);
    
    // Update weight displays
    const weightElements = document.querySelectorAll('.weight-value');
    weightElements.forEach(element => {
        const weight = parseFloat(element.getAttribute('data-weight'));
        const convertedWeight = convertFromGrams(weight, currentUnit);
        element.textContent = convertedWeight.toFixed(currentUnit === 'kg' ? 3 : 0) + currentUnit;
    });
    
    // Update config weight displays
    const configWeightElements = document.querySelectorAll('.config-weight');
    configWeightElements.forEach(element => {
        const weight = parseFloat(element.getAttribute('data-weight'));
        const convertedWeight = convertFromGrams(weight, currentUnit);
        element.textContent = '+' + convertedWeight.toFixed(currentUnit === 'kg' ? 3 : 0) + currentUnit;
    });
    
    // Update battery weight display
    const batteryWeightElements = document.querySelectorAll('.battery-weight');
    batteryWeightElements.forEach(element => {
        const weight = parseFloat(element.getAttribute('data-weight'));
        const convertedWeight = convertFromGrams(weight, currentUnit);
        element.textContent = '+' + convertedWeight.toFixed(currentUnit === 'kg' ? 3 : 0) + currentUnit;
    });
    
    // Update current payload display
    const convertedPayload = convertFromGrams(currentPayloadWeight, currentUnit);
    currentPayloadDisplay.textContent = convertedPayload.toFixed(currentUnit === 'kg' ? 3 : 0) + currentUnit;
    
    // Update equation display
    updateEquationDisplay();
    
    // Recalculate power
    calculatePower();
}

// Add input validation
function validateInput(input) {
    const value = parseFloat(input.value);
    if (value < 0) {
        input.value = 0;
    }
}

massInput.addEventListener('blur', () => validateInput(massInput));
auxPowerInput.addEventListener('blur', () => validateInput(auxPowerInput));
batterySizeInput.addEventListener('blur', () => validateInput(batterySizeInput));
batteryMarginInput.addEventListener('blur', () => validateInput(batteryMarginInput)); 