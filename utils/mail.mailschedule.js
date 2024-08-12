import checkEmailDelivery from "./mail.checkEmailDelivery.js";


export function scheduleEmailDeliveryCheck() {
    setTimeout(() => {
        checkEmailDelivery();
    }, 6000); // Check after 60 seconds
}

