document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-form");
    const submitBtn = document.getElementById("submit-btn");
    const btnText = submitBtn.querySelector(".btn-text");
    const loader = submitBtn.querySelector(".loader");
    const statusContainer = document.getElementById("status-container");
    const statusText = document.getElementById("status-text");
    const dateInput = document.getElementById("res-date");

    // UX: Prevent selecting past dates immediately on load
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);

    const validateField = (input) => {
        const group = input.closest(".group");
        const err = group.querySelector(".error-msg");
        
        if (!input.checkValidity()) {
            input.classList.add("invalid-input");
            if (err) err.classList.add("show-error");
            return false;
        }
        
        input.classList.remove("invalid-input");
        if (err) err.classList.remove("show-error");
        return true;
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Reset Status UI
        statusContainer.classList.remove("show-msg", "success-theme", "error-theme");
        
        let isValid = true;
        const requiredFields = form.querySelectorAll("input[required], select[required]");
        
        requiredFields.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
                input.classList.add("shake");
                setTimeout(() => input.classList.remove("shake"), 400);
            }
        });

        if (!isValid) return;

        // Enter Loading State
        submitBtn.disabled = true;
        btnText.style.opacity = "0";
        loader.classList.remove("hidden");

        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: form.method,
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Handle Success
                statusText.textContent = "Reservation securely archived. A confirmation email will follow.";
                statusContainer.classList.add("show-msg", "success-theme");
                form.reset();
            } else {
                // Handle Server-side errors (like Formspree being down)
                const data = await response.json();
                throw new Error(data.error || "Submission failed");
            }
        } catch (error) {
            // Handle Connection/Network errors
            statusText.textContent = "Vault access interrupted. Please check your connection and retry.";
            statusContainer.classList.add("show-msg", "error-theme");
        } finally {
            // Exit Loading State
            submitBtn.disabled = false;
            btnText.style.opacity = "1";
            loader.classList.add("hidden");
        }
    });
});