/* 防止未登入直接訪問 booking 頁面 */
function checkMemberStatus(){
    fetch(`/api/user/auth`)
    .then(function(response){
        return response.json();
    }).then(function(data){
        if(data.data === null){
            window.location.assign(`${window.location.origin}/`)
        }else if(data.data){
            fetch("/api/booking")
            .then(function(response){
                return response.json();
            }).then(function(data){
                if(data.data.attractions.length === 0 ){
                    checkHaveBookingOrNot();
                };
                renderBookingBasicInfo(data);
                let totalCostToPay = 0;
                data.data.attractions.forEach(bookingInfo => {
                    renderItemsSection(bookingInfo);
                    totalCostToPay += Number(bookingInfo.price)
                });
                renderTotalCostToPay(totalCostToPay);
            })
        };
    })
};

/* 確認有無預定行程 */
function checkHaveBookingOrNot(){
    // 計算網頁無任何行程下的section數量
    const countSection = document.getElementsByTagName("section").length;
    const cleanTheBooking = document.querySelector(".wrap-content-forRWD");
    const sectionForNoBooking = document.querySelector("#noBooking");
    const goToBooking = document.querySelector(".goToBooking");
    if(countSection <= 7){
        cleanTheBooking.style.display = "none";
        sectionForNoBooking.style.display = "block";
        goToBooking.href = `${window.location.origin}/`
    }
};

function renderBookingBasicInfo(data){
    const welcomeName = document.querySelector("#welcome-name");
    welcomeName.textContent = data.name;
    const contactName = document.querySelector("#contact-name");
    contactName.value = data.name;
    const contactEmail = document.querySelector("#contact-email");
    contactEmail.value = data.email;    
}

function renderItemsSection(bookingInfo){
    let time;
    if(bookingInfo.time === "上半天"){
        time = "上午9點到下午2點";
    }else(
        time = "下午3點到晚上8點"
    )
    const welcomeSection = document.querySelector("#welcome");
    welcomeSection.insertAdjacentHTML("afterend", 
    `
    <section id = "items" class = "items-style">
        <div class = "items-attraction">
            <div id = "items-attraction-left-imgContainer" class = "items-attraction-item">
                <img class = "attraction-img" src="${bookingInfo.image}">
            </div>
            <div id = "items-attraction-right-bookingInfo" class = "items-attraction-item">
                <div class = "items-attraction-right-bookingInfo-title">台北一日遊 : ${bookingInfo.name}</div>
                <div id = "date">日期 : ${bookingInfo.date}</div>
                <div id = "time">時間 : ${time}</div>
                <div id = "price">費用 : ${bookingInfo.price}</div>
                <div id = "address">地點 : ${bookingInfo.address}</div>
                <div id = "booking-id">預定編號 : ${bookingInfo.booking_id}</div>
            </div>
            <img class = "booking-attraction-delete-active" src = "/static/image/icon_delete.png" onclick = "removeBooking();"/>
        </div>
    </section>
    `
    );
    const removeBookingBtn = document.querySelector(".booking-attraction-delete-active");
    // 賦予一個和預定編號相同的 value，刪除時可以用上!
    removeBookingBtn.value = bookingInfo.booking_id;
    removeBookingBtn.addEventListener("click", removeBooking)
}

function renderTotalCostToPay(totalCostToPay){
    const totalCostShowToUser = document.querySelector(".total-cost-in-dollars");
    totalCostShowToUser.textContent = totalCostToPay;
}

function removeBooking(){
    const bookingWantToDelete = this.value;
    let responseStatus;
    fetch("/api/booking", {
        method : "DELETE",
        credentials : "include",
        body : JSON.stringify({"bookingWantToDelete" : bookingWantToDelete}),
        cache : "no-cache",
        headers : new Headers({
            "content-type" : "application/json"
        })
    })
    .then(function(response){
        responseStatus = response.status;
        return response.json();
    })
    .then(function(data){
        window.location.reload();
    })
}

/* tappay金流套件 */

// Display ccv field
let fields = {
    number: {
        // css selector
        element: '#card-number',
        placeholder: '**** **** **** ****'
    },
    expirationDate: {
        // DOM object
        element: document.getElementById('card-expiration-date'),
        placeholder: 'MM / YY'
    },
    ccv: {
        element: '#card-ccv',
        placeholder: 'ccv'
    }
}

TPDirect.card.setup({    
    fields: fields,
    styles: {
        // Style all elements
        'input': {
            'color': 'gray'
        },
        // Styling ccv field
        'input.ccv': {
            // 'font-size': '16px'
        },
        // Styling expiration-date field
        'input.expiration-date': {
            // 'font-size': '16px'
        },
        // Styling card-number field
        'input.card-number': {
            // 'font-size': '16px'
        },
        // style focus state
        ':focus': {
            // 'color': 'black'
        },
        // style valid state
        '.valid': {
            'color': 'green'
        },
        // style invalid state
        '.invalid': {
            'color': 'red'
        },
        // Media queries
        // Note that these apply to the iframe, not the root window.
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    },
    // 此設定會顯示卡號輸入正確後，會顯示前六後四碼信用卡卡號
    isMaskCreditCardNumber: true,
    maskCreditCardNumberRange: {
        beginIndex: 6,
        endIndex: 11
    }
})

TPDirect.card.onUpdate(function (update) {
    // update.canGetPrime === true
    // --> you can call TPDirect.card.getPrime()
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        // submitButton.removeAttribute('disabled')
    } else {
        // Disable submit Button to get prime.
        // submitButton.setAttribute('disabled', true)
    }

    // cardTypes = ['mastercard', 'visa', 'jcb', 'amex', 'unionpay','unknown']
    if (update.cardType === 'visa') {
        // Handle card type visa.
    }
    const numberValidImg = document.querySelector(".card-number-valid-img");
    const numberInvalidImg = document.querySelector(".card-number-invalid-img");
    const expValidImg = document.querySelector(".card-exp-valid-img");
    const expInvalidImg = document.querySelector(".card-exp-invalid-img");
    const ccvValidImg = document.querySelector(".card-ccv-valid-img");
    const ccvInvalidImg = document.querySelector(".card-ccv-invalid-img");

    // number 欄位是錯誤的
    if (update.status.number === 2) {
        numberValidImg.style.display = "none";
        numberInvalidImg.style.display = "block";
    } else if (update.status.number === 0) {
        numberValidImg.style.display = "block";
        numberInvalidImg.style.display = "none";
    } else if (update.status.number != 2 && update.status.number != 0) {
        numberValidImg.style.display = "none";
        numberInvalidImg.style.display = "block";
        return
    }

    if (update.status.expiry === 2) {
        expValidImg.style.display = "none";
        expInvalidImg.style.display = "block";
    } else if (update.status.expiry === 0) {
        expValidImg.style.display = "block";
        expInvalidImg.style.display = "none";
    } else if (update.status.expiry != 2 && update.status.expiry != 2) {
        expValidImg.style.display = "none";
        expInvalidImg.style.display = "block";
        return
    }

    if (update.status.ccv === 2) {
        ccvValidImg.style.display = "none";
        ccvInvalidImg.style.display = "block";
    } else if (update.status.ccv === 0) {
        ccvValidImg.style.display = "block";
        ccvInvalidImg.style.display = "none";
    } else if (update.status.ccv != 2 && update.status.ccv != 0){
        ccvValidImg.style.display = "none";
        ccvInvalidImg.style.display = "block";
        return
    }
})

/* request data for orders */
function processOrdersData(orderDataFromPage){
    const totalCostInDollars = document.querySelector(".total-cost-in-dollars").textContent;
    orderDataFromPage.totalPrice = totalCostInDollars;
    const orders = document.querySelectorAll("#items");
    const regex = /預定編號 : (\d+)/;
    orders.forEach(eachOrder => {
        const bookingIdElement = eachOrder.querySelector("#booking-id");
        const match = bookingIdElement.textContent.match(regex);
        if (match) {
            const bookingId = match[1];
            orderDataFromPage.bookingId.push(bookingId);
        }
    });
    return orderDataFromPage
}

function contactInfo(){
    const contactName = document.querySelector("#contact-name").value;
    const contactEmail = document.querySelector("#contact-email").value;
    const contactPhone = document.querySelector("#contact-phone").value;
    return {
            name : contactName,
            email : contactEmail,
            phone : contactPhone
    }
}

// call TPDirect.card.getPrime when user submit form to get tappay prime
const checkOrderToPayButton = document.querySelector(".check-order-to-pay");
checkOrderToPayButton.addEventListener("click", onSubmit);
function onSubmit(event) {
    loadingStart();
    event.preventDefault()

    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()

    // 確認是否可以 getPrime
    if (tappayStatus.canGetPrime === false) {
        loadingComplete();
        const message = "請確認輸入資料正確"
        popUpMessage(message)
        return
    }

    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            const message = result.msg
            popUpMessage(message)
            return
        }
        const prime = result.card.prime;
        const orderDataFromPage = {
            "totalPrice" : "",
            "bookingId" : []
        };
        const bookingIdAndTotalCost = processOrdersData(orderDataFromPage);
        const contact = contactInfo();
        fetch("/api/orders", {
            method : "POST",
            credentials : "include",
            body : JSON.stringify(
                {
                    "prime" : prime,
                    "order" : bookingIdAndTotalCost,
                    "contact" : contact
                }
            ),
            cache : "no-cache",
            headers : new Headers({
                "content-type" : "application/json"
            })
        }).then(function(response){
            // responseStatus = response.status;
            return response.json()
        }).then(function(orderData){
            if(orderData.data.payment.status === 0){
                const orderNumber = orderData.data.orderNumber;
                popUpMessage(`${orderData.data.payment.message}`);
                window.location.assign(`${window.location.origin}/thankyou?number=${orderNumber}`)
            }
            else{
                loadingComplete();
                popUpMessage(`${orderData.data.payment.message}`)
            }
        })

        // alert('get prime 成功，prime: ' + result.card.prime)
        // send prime to your server, to pay with Pay by Prime API .
        // Pay By Prime Docs: https://docs.tappaysdk.com/tutorial/zh/back.html#pay-by-prime-api
    })
};

function loadingStart(){
    const wrapPayButton = document.querySelector("#total-info");
    const payButton = document.querySelector(".check-order-to-pay");
    wrapPayButton.style.cursor = "not-allowed";
    payButton.style.pointerEvents = "none";
    const loadingLayer = document.querySelector(".layer-payment-loading");
    loadingLayer.style.display = "flex";
};

function loadingComplete(){
    const wrapPayButton = document.querySelector("#total-info");
    const payButton = document.querySelector(".check-order-to-pay");
    wrapPayButton.style.cursor = "pointer";
    payButton.style.pointerEvents = "auto";
    const loadingLayer = document.querySelector(".layer-payment-loading");
    loadingLayer.style.display = "none";
};


function bookingInfoFormatValid(){
    const contactNameInput = document.querySelector("#contact-name");
    const contactEmailInput = document.querySelector("#contact-email");
    const contactPhoneInput = document.querySelector("#contact-phone");
    const nameValidImg = document.querySelector(".name-valid-img");
    const nameInvalidImg = document.querySelector(".name-invalid-img");
    const emailValidImg = document.querySelector(".email-valid-img");
    const emailInvalidImg = document.querySelector(".email-invalid-img");
    const phoneValidImg = document.querySelector(".phone-valid-img");
    const phoneInvalidImg = document.querySelector(".phone-invalid-img");
    contactNameInput.addEventListener("input", () => {
        const contactNameInputValue = document.querySelector("#contact-name").value;
        const nameValidation = (/^[\w\u4E00-\u9FFF]([^<>\s]){1,20}$/g.test(contactNameInputValue));
        if (nameValidation){
            nameValidImg.style.display = "block";
            nameInvalidImg.style.display = "none"
        }else if (!nameValidation){
            nameValidImg.style.display = "none";
            nameInvalidImg.style.display = "block"
        }
    });
    contactEmailInput.addEventListener("input", () => {
        const contactEmailInputValue = document.querySelector("#contact-email").value;
        const emailValidation = (/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(contactEmailInputValue));
        if (emailValidation) {
            emailValidImg.style.display = "block";
            emailInvalidImg.style.display = "none"
        }else if (!emailValidation){
            emailValidImg.style.display = "none";
            emailInvalidImg.style.display = "block"
        }
    });
    contactPhoneInput.addEventListener("input", () => {
        const contactPhoneInputValue = document.querySelector("#contact-phone").value;
        const phoneValidation = (/^\d{10}$/.test(contactPhoneInputValue));
        if (phoneValidation){
            phoneValidImg.style.display = "block";
            phoneInvalidImg.style.display = "none"
        }else if (!phoneValidation){
            phoneValidImg.style.display = "none";
            phoneInvalidImg.style.display = "block"
        }
    });

};


/* 載入時啟動 */
checkMemberStatus();
bookingInfoFormatValid();
