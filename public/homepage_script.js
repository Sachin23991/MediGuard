// homepage_script.js

// --- Main Application Class ---
class QuantumMediGuard {
    constructor() {
        this.medicines = new Set();
        this.isAnalyzing = false;
        
        // DOM element cache
        this.elements = {
            preloader: document.getElementById('preloader'),
            medicineInput: document.getElementById('medicine-input'),
            addBtn: document.getElementById('add-medicine'),
            medicineGrid: document.getElementById('medicine-grid'),
            analyzeBtn: document.getElementById('analyze-btn'),
            analysisDisplay: document.getElementById('analysis-display'),
            quantumLoader: document.getElementById('quantum-loader'),
            processingText: document.getElementById('processing-text'),
            activityStream: document.getElementById('activity-stream')
        };
        
        // Kickstart the application
        this.init();
    }

    async init() {
        this.showPreloader();
        this.bindEvents();
        this.startRealTimeSimulation();
    }

    // ===== PRELOADER & INITIALIZATION =====
    showPreloader() {
        // The preloader animation is handled by CSS. 
        // We just need to hide it after some time.
        setTimeout(() => {
            this.elements.preloader.classList.add('hidden');
            document.body.style.overflow = 'visible';
        }, 3500); // Match this with your preloader animation duration
    }
    
    // ===== EVENT BINDING =====
    bindEvents() {
        this.elements.addBtn.addEventListener('click', () => this.addMedicine());
        this.elements.medicineInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addMedicine();
        });
        this.elements.analyzeBtn.addEventListener('click', () => this.runAnalysis());
    }

    // ===== MEDICINE MANAGEMENT =====
    addMedicine() {
        const medicineName = this.elements.medicineInput.value.trim();
        
        if (!medicineName) return;
        if (this.medicines.has(medicineName.toLowerCase())) {
            this.showNotification('Medicine already added.', 'warning');
            return;
        }

        this.medicines.add(medicineName.toLowerCase());
        this.renderMedicineCard(medicineName);
        this.elements.medicineInput.value = '';
        this.updateAnalyzeButtonState();
        
        this.addActivity(`Added ${medicineName} to the analysis queue.`, 'fas fa-plus-circle');
    }

    renderMedicineCard(medicineName) {
        const card = document.createElement('div');
        card.className = 'medicine-card';
        card.dataset.medicine = medicineName.toLowerCase();
        
        card.innerHTML = `
            <div class="medicine-info">
                <i class="fas fa-pills"></i>
                <span class="medicine-name">${medicineName}</span>
            </div>
            <button class="remove-medicine">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        card.querySelector('.remove-medicine').addEventListener('click', () => this.removeMedicine(medicineName.toLowerCase()));
        this.elements.medicineGrid.appendChild(card);
    }

    removeMedicine(medicineName) {
        this.medicines.delete(medicineName);
        const card = this.elements.medicineGrid.querySelector(`[data-medicine="${medicineName}"]`);
        if (card) {
            card.style.animation = 'cardSlideOut 0.3s ease-out forwards';
            setTimeout(() => card.remove(), 300);
        }
        this.updateAnalyzeButtonState();
        this.addActivity(`Removed ${medicineName} from the queue.`, 'fas fa-minus-circle');
    }

    updateAnalyzeButtonState() {
        this.elements.analyzeBtn.disabled = this.medicines.size < 2;
    }

    // ===== CORE ANALYSIS LOGIC =====
    async runAnalysis() {
        if (this.isAnalyzing || this.medicines.size < 2) return;
        
        this.isAnalyzing = true;
        this.showQuantumLoader();
        
        try {
            const results = await this.fetchAnalysisFromServer();
            this.displayResults(results);
            this.addActivity(`Analysis complete for ${this.medicines.size} medications.`, 'fas fa-check-circle');
        } catch (error) {
            console.error('Analysis Error:', error);
            this.displayError(error.message);
            this.addActivity('A server error occurred during analysis.', 'fas fa-server');
        } finally {
            this.isAnalyzing = false;
            this.hideQuantumLoader();
        }
    }

    async fetchAnalysisFromServer() {
        // This is the key function that connects to your server.
        const medicineArray = Array.from(this.medicines);
        
        const response = await fetch('http://localhost:5500/check-interactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ medicines: medicineArray })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to get a valid response from the server.');
        }
        
        return await response.json();
    }

    // ===== UI & LOADER MANAGEMENT =====
    showQuantumLoader() {
        this.elements.quantumLoader.classList.remove('hidden');
        this.animateProcessingText();
    }

    hideQuantumLoader() {
        this.elements.quantumLoader.classList.add('hidden');
    }

    async animateProcessingText() {
        const phases = [
            "Initializing quantum protocols...",
            "Analyzing molecular structures...",
            "Cross-referencing pharmacokinetics...",
            "Running AI interaction simulation...",
            "Calculating risk vectors...",
            "Generating safety recommendations...",
            "Finalizing analysis..."
        ];

        for (const phase of phases) {
            if (!this.isAnalyzing) break; // Stop if analysis is done
            this.elements.processingText.textContent = phase;
            await this.sleep(700);
        }
    }
    
    // ===== DYNAMIC RESULTS DISPLAY =====
    displayResults(data) {
        const { interactions, side_effects, intelligent_suggestions } = data;
        const display = this.elements.analysisDisplay;
        
        // Clear previous results and inject new structure
        display.innerHTML = `
            <div id="result-interactions"></div>
            <div id="result-suggestions"></div>
            <div id="result-side-effects"></div>
        `;

        // Render each section
        this.renderInteractions(interactions);
        this.renderSuggestions(intelligent_suggestions);
        this.renderSideEffects(side_effects);
        
        // Scroll to results
        display.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    renderInteractions(interactions) {
        const container = document.getElementById('result-interactions');
        let html = `
            <div class="result-header">
                <div class="result-icon"><i class="fas fa-atom"></i></div>
                <h3 class="result-title">Interaction Analysis</h3>
            </div>
        `;

        if (interactions.length === 0) {
            html += `
                <div class="interaction-item severity-low">
                    <div class="interaction-header">
                        <h4><i class="fas fa-check-circle"></i> No Significant Interactions Found</h4>
                    </div>
                    <p class="interaction-description">Our AI analysis did not detect any significant interactions between the provided medications. However, always consult a healthcare professional.</p>
                </div>
            `;
        } else {
            interactions.forEach(item => {
                html += `
                    <div class="interaction-item severity-${item.severity.toLowerCase()}">
                        <div class="interaction-header">
                            <h4>${item.medicines.join(' & ')}</h4>
                            <span class="severity-badge severity-${item.severity.toLowerCase()}">${item.severity} Risk</span>
                        </div>
                        <p class="interaction-description">${item.description}</p>
                    </div>
                `;
            });
        }
        container.innerHTML = html;
    }

    renderSuggestions(suggestions) {
        const container = document.getElementById('result-suggestions');
        let html = `
            <div class="result-header">
                <div class="result-icon"><i class="fas fa-lightbulb"></i></div>
                <h3 class="result-title">AI Recommendations</h3>
            </div>
            <div class="suggestion-summary">${suggestions.summary}</div>
            <ul class="recommendations-list">
        `;
        suggestions.recommendations.forEach(rec => {
            html += `<li><i class="fas fa-shield-alt"></i><span>${rec}</span></li>`;
        });
        html += `</ul>`;
        container.innerHTML = html;
    }

    renderSideEffects(sideEffects) {
        const container = document.getElementById('result-side-effects');
        let html = `
            <div class="result-header">
                <div class="result-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <h3 class="result-title">Side Effect Profiles</h3>
            </div>
            <div class="side-effects-grid">
        `;
        sideEffects.forEach(med => {
            html += `
                <div class="side-effect-card">
                    <h4>${med.medicineName}</h4>
                    <h5>Common Side Effects</h5>
                    <ul class="effects-list common">${med.common.map(e => `<li>${e}</li>`).join('') || '<li>N/A</li>'}</ul>
                    <h5>Severe Side Effects (Seek Help)</h5>
                    <ul class="effects-list severe">${med.severe.map(e => `<li>${e}</li>`).join('') || '<li>N/A</li>'}</ul>
                </div>
            `;
        });
        html += `</div>`;
        container.innerHTML = html;
    }
    
    displayError(message) {
        this.elements.analysisDisplay.innerHTML = `
            <div class="interaction-item severity-high">
                <div class="interaction-header">
                    <h4><i class="fas fa-server"></i> Analysis Error</h4>
                </div>
                <p class="interaction-description">${message}</p>
                <p class="interaction-recommendation">Please check if the server is running and try again. If the problem persists, the AI model may be temporarily unavailable.</p>
            </div>
        `;
    }

    // ===== REAL-TIME ACTIVITY FEED SIMULATION =====
    startRealTimeSimulation() {
        setInterval(() => {
            const activities = [
                { text: 'User in New York analyzed 3 medications', icon: 'fas fa-user' },
                { text: 'Dangerous interaction detected and prevented', icon: 'fas fa-exclamation-triangle' },
                { text: 'Medicine database updated with new entries', icon: 'fas fa-database' },
                { text: 'AI model accuracy improved to 99.94%', icon: 'fas fa-brain' }
            ];
            const activity = activities[Math.floor(Math.random() * activities.length)];
            this.addActivity(activity.text, activity.icon);
        }, 8000 + Math.random() * 5000);
    }

    addActivity(text, iconClass) {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon"><i class="${iconClass}"></i></div>
            <div class="activity-content">
                <div class="activity-text">${text}</div>
                <div class="activity-time">${new Date().toLocaleTimeString()}</div>
            </div>
        `;
        this.elements.activityStream.prepend(item);
        if (this.elements.activityStream.children.length > 5) {
            this.elements.activityStream.lastChild.remove();
        }
    }
    
    // ===== UTILITY FUNCTIONS =====
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Initialize the application once the DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    new QuantumMediGuard();
});