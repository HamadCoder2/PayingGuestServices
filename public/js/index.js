document.addEventListener('DOMContentLoaded', function () {
    const errorMessages = document.getElementsByClassName('error-message');

    // Check if there is at least one error message element
    if (errorMessages.length > 0) {
        // Loop through each error message element
        for (let i = 0; i < errorMessages.length; i++) {
            const errorMessage = errorMessages[i];

            // Display the error message element
            errorMessage.style.display = 'block';

            // Set a timeout to hide the error message after 5 seconds (adjust as needed)
            setTimeout(function () {
                errorMessage.style.display = 'none';
            }, 2000);
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const successMessages = document.getElementsByClassName('success-message');

    // Check if there is at least one element with the class 'success-message'
    if (successMessages.length > 0) {
        // Access the first element in the collection
        const successMessage = successMessages[0];

        // Set the style of the first element
        successMessage.style.display = 'block';

        // Set a timeout to hide the element after 5 seconds (adjust as needed)
        setTimeout(function () {
            successMessage.style.display = 'none';
        }, 3000);
    }
});
