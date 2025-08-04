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

// Function to calculate power and flight time
function calculatePower() {
    const baseMass = parseFloat(massInput.value) || 0;
    const totalMass = baseMass + currentPayloadWeight + currentBatteryWeight;
    const auxPower = parseFloat(auxPowerInput.value) || 0;
    const batterySize = currentBatteryCapacity;
    const batteryMargin = parseFloat(batteryMarginInput.value) || 0;
    const lightingLevel = parseInt(lightingSlider.value) || 0;
    
    // Calculate lighting power based on slider position
    const lightingPower = lightingLevel === 0 ? 0 : lightingLevel === 1 ? 20 : 50;
    
    // Calculate intermediate values
    const massOver100 = totalMass / 100;
    const term1 = 6.3 * massOver100;
    const term2 = 0.66 * Math.pow(massOver100, 2);
    const totalPower = term1 + term2 + auxPower + lightingPower;
    
    // Calculate flight time
    const effectiveCapacity = batterySize * (1 - batteryMargin / 100);
    const flightTimeHours = effectiveCapacity / totalPower;
    const flightTimeMinutes = flightTimeHours * 60;
    
    // Update displays
    totalWeightDisplay.textContent = totalMass.toFixed(0) + 'g';
    massOver100Display.textContent = massOver100.toFixed(2);
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
            const weight = this.getAttribute('data-weight');
            massInput.value = weight;
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
            currentPayloadDisplay.textContent = currentPayloadWeight + 'g';
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
        currentPayloadDisplay.textContent = '0g';
        
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