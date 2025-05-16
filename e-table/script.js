document.addEventListener('DOMContentLoaded', function () {
    const restaurantButtons = document.querySelectorAll('.restaurantButton');
    const restaurantMenu = document.getElementById('restaurantMenu');
    const dateTimeSection = document.getElementById('dateTimeSection');
    const reservationInfoSection = document.getElementById('reservationInfoSection');
    const confirmationMessage = document.getElementById('confirmationMessage');
    const submitReservationButton = document.getElementById('submitReservation');
    const confirmationDetails = document.getElementById('confirmationDetails');
    const enterButton = document.getElementById('enterButton');
    const backButton = document.getElementById('backButton');

    let selectedRestaurant = '';

    // Handle restaurant selection
    restaurantButtons.forEach(button => {
        button.addEventListener('click', function () {
            selectedRestaurant = button.dataset.restaurant;
            restaurantMenu.classList.add('hidden');
            dateTimeSection.classList.remove('hidden');
        });
    });

    // Handle the Enter button click (Date and Time Selection)
    enterButton.addEventListener('click', function () {
        const date = document.getElementById('reservationDate').value;
        const time = document.getElementById('reservationTime').value;

        if (date && time) {
            dateTimeSection.classList.add('hidden');
            reservationInfoSection.classList.remove('hidden');
        } else {
            alert("Please select a valid date and time.");
        }
    });

    // Handle reservation date/time submission
    submitReservationButton.addEventListener('click', function () {
        const name = document.getElementById('reservationName').value;
        const email = document.getElementById('reservationEmail').value;
        const date = document.getElementById('reservationDate').value;
        const time = document.getElementById('reservationTime').value;

        if (name && email && date && time) {
            dateTimeSection.classList.add('hidden');
            reservationInfoSection.classList.add('hidden');
            confirmationMessage.classList.remove('hidden');
            confirmationDetails.innerHTML = `
                Reservation for <strong>${name}</strong><br>
                Restaurant: <strong>${selectedRestaurant}</strong><br>
                Date: <strong>${date}</strong><br>
                Time: <strong>${time}</strong><br>
                Email: <strong>${email}</strong><br>
            `;
        } else {
            alert("Please fill in all the fields.");
        }
    });

    // Handle the Back button click (go back to the first screen)
    backButton.addEventListener('click', function () {
        // Reset the inputs and restaurant selection
        selectedRestaurant = ''; // Clear the selected restaurant
        document.getElementById('reservationDate').value = ''; // Clear the date input
        document.getElementById('reservationTime').value = ''; // Clear the time input
        document.getElementById('reservationName').value = ''; // Clear the name input
        document.getElementById('reservationEmail').value = ''; // Clear the email input

        // Hide all screens and show the first screen
        confirmationMessage.classList.add('hidden');
        reservationInfoSection.classList.add('hidden');
        dateTimeSection.classList.add('hidden');
        restaurantMenu.classList.remove('hidden');
    });
});
