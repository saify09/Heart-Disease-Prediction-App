document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader-dots');
    const resultContainer = document.getElementById('result-container');
    
    // Sliders
    const sliders = [
        { id: 'RestingBP', displayId: 'restingbp-val' },
        { id: 'Cholesterol', displayId: 'cholesterol-val' },
        { id: 'MaxHR', displayId: 'maxhr-val' }
    ];

    sliders.forEach(slider => {
        const el = document.getElementById(slider.id);
        const display = document.getElementById(slider.displayId);
        el.addEventListener('input', () => {
            display.textContent = el.value;
        });
    });

    // Toggles
    const toggles = [
        { id: 'FastingBS', labelId: 'fastingbs-label' },
        { id: 'ExerciseAngina', labelId: 'exerciseangina-label' }
    ];

    toggles.forEach(toggle => {
        const el = document.getElementById(toggle.id);
        const label = document.getElementById(toggle.labelId);
        el.addEventListener('change', () => {
            label.textContent = el.checked ? 'Yes' : 'No';
        });
    });

    // Form Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // UI State: Loading
        submitBtn.disabled = true;
        btnText.style.display = 'none';
        loader.style.display = 'flex';
        resultContainer.style.display = 'none';

        const formData = new FormData(form);
        const data = {
            Age: parseInt(formData.get('Age')),
            Sex: formData.get('Sex'),
            ChestPainType: formData.get('ChestPainType'),
            RestingBP: parseInt(formData.get('RestingBP')),
            Cholesterol: parseInt(formData.get('Cholesterol')),
            FastingBS: formData.get('FastingBS') ? "1" : "0",
            RestingECG: formData.get('RestingECG'),
            MaxHR: parseInt(formData.get('MaxHR')),
            ExerciseAngina: formData.get('ExerciseAngina') ? "Y" : "N",
            Oldpeak: parseFloat(formData.get('Oldpeak')),
            ST_Slope: formData.get('ST_Slope')
        };

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.status === 'success') {
                showResult(result);
            } else {
                alert('Analysis failed: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Could not connect to the diagnostic server. Please ensure the backend is running.');
        } finally {
            submitBtn.disabled = false;
            btnText.style.display = 'block';
            loader.style.display = 'none';
        }
    });
});

function showResult(result) {
    const resultContainer = document.getElementById('result-container');
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const probVal = document.getElementById('probability-val');
    const probFill = document.getElementById('probability-fill');
    
    resultContainer.style.display = 'block';
    
    // Smooth scroll to result
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (result.prediction === 1) {
        resultContainer.className = 'result-container result-danger';
        title.textContent = 'High Risk Detected';
        message.textContent = 'Our diagnostic model predicts a high likelihood of heart disease. We strongly recommend consulting a healthcare professional for a detailed evaluation.';
    } else {
        resultContainer.className = 'result-container result-safe';
        title.textContent = 'Low Risk Detected';
        message.textContent = 'Our results indicate a low risk of heart disease. However, maintaining a healthy lifestyle and regular check-ups remain essential for long-term health.';
    }

    // Probability update
    if (result.probability !== null) {
        const prob = Math.round(result.probability * 100);
        probVal.textContent = prob;
        // Small delay for animation
        setTimeout(() => {
            probFill.style.width = prob + '%';
        }, 100);
    } else {
        probVal.parentElement.style.display = 'none';
    }
}

function resetForm() {
    const form = document.getElementById('prediction-form');
    const resultContainer = document.getElementById('result-container');
    const probFill = document.getElementById('probability-fill');
    
    form.reset();
    resultContainer.style.display = 'none';
    probFill.style.width = '0%';
    
    // Reset range displays
    document.getElementById('restingbp-val').textContent = '120';
    document.getElementById('cholesterol-val').textContent = '200';
    document.getElementById('maxhr-val').textContent = '150';
    
    // Reset toggle labels
    document.getElementById('fastingbs-label').textContent = 'No';
    document.getElementById('exerciseangina-label').textContent = 'No';

    window.scrollTo({ top: 0, behavior: 'smooth' });
}
