function getOrderNumber(){
    const orderNumber = document.querySelector(".order-number");
    orderNumberFromUrl = window.location.search.split("=")[1];
    orderNumber.textContent = orderNumberFromUrl;
}

/* 載入時觸發 */
getOrderNumber();