/* ==========================================================================
   CivicProof - Public Issue AI Verification & Complaint Portal Interactivity
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // 1. File Upload Drag & Drop & Selection Feedback
    const fileInput = document.getElementById('evidence-file');
    const uploadBox = fileInput ? fileInput.closest('div') : null;

    if (fileInput && uploadBox) {
        // Highlight box on drag over
        ['dragenter', 'dragover'].forEach(eventName => {
            uploadBox.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadBox.style.backgroundColor = '#e6f0ff';
                uploadBox.style.borderColor = '#0052cc';
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            uploadBox.addEventListener(eventName, (e) => {
                e.preventDefault();
                uploadBox.style.backgroundColor = '#f4f8ff';
                uploadBox.style.borderColor = '#0072ff';
            }, false);
        });

        // Handle dropped files
        uploadBox.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                fileInput.files = files;
                updateFileName(files[0].name);
            }
        });

        // Handle selected files via file dialog
        fileInput.addEventListener('change', (e) => {
            if (fileInput.files.length > 0) {
                updateFileName(fileInput.files[0].name);
            }
        });
    }

    function updateFileName(name) {
        let infoText = uploadBox.querySelector('p');
        if (infoText) {
            infoText.innerHTML = `<strong>Selected File:</strong> ${name}`;
            infoText.style.color = '#0072ff';
        }
    }

    // 2. Form Submission & Verification Simulation
    const verificationForm = document.querySelector('form');
    
    if (verificationForm) {
        verificationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Get submit button
            const submitBtn = verificationForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            // Show loading state
            submitBtn.innerHTML = 'Running Multi-Model Verification... ⏳';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            // Simulate AI processing delay (2 seconds)
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                submitBtn.style.opacity = '1';

                // Scroll smoothly to results panel
                const resultsSection = document.querySelector('article:last-child');
                if (resultsSection) {
                    resultsSection.scrollIntoView({ behavior: 'smooth' });
                }

                // Trigger a subtle success notification
                alert('Verification analysis completed successfully! Review the forensic metrics on the right panel.');
            }, 2000);
        });
    }

    // 3. Action Buttons Interactivity (Export, Share, Dispute)
    const exportPdfBtn = document.querySelector('button:not([type])'); // Export PDF Certificate button
    // Let's target buttons inside the results section precisely
    const resultButtons = document.querySelectorAll('article:last-child button[type="button"]');

    if (resultButtons.length >= 3) {
        // Export PDF Certificate
        resultButtons[0].addEventListener('click', () => {
            alert('Generating tamper-proof cryptographic PDF certificate... Download will begin shortly.');
        });

        // Share Public Link
        resultButtons[1].addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href);
            alert('Public verification link copied to clipboard!');
        });

        // Dispute / Request Human Review
        resultButtons[2].addEventListener('click', () => {
            const reason = prompt('Please enter brief notes for requesting human expert moderation:');
            if (reason) {
                alert('Your dispute has been flagged and sent to expert human moderators for review.');
            }
        });
    }

});