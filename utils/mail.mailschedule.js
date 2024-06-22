import checkEmailDelivery from "./mail.checkEmailDelivery.js";


export function scheduleEmailDeliveryCheck() {
    setTimeout(() => {
        checkEmailDelivery();
    }, 60000); // Check after 60 seconds
}

