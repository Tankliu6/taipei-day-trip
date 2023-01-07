function checkMemberStatusInMemberPage(){
    fetch("/api/user/auth", {
        method : "GET",
        credentials: "include",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    }).then(function(response){
        return response.json();
    }).then(function(data){
        if(data.data == null){
            window.location.assign("/")
        }
        else{
            memberPageInit(data.data.name)
        }
    })
};

function memberPageInit(memberName){
    const memberNameOnPage = document.querySelector(".member-name");
    memberNameOnPage.textContent = memberName;
}

function updateBasicMemberInfo(){
    const updateSubmitBtn = document.querySelector(".member-info-basic-submit");
    let responseStatus;
    updateSubmitBtn.addEventListener("click", () => {
        updateLoadingStart();
        const updateData = updateBasicInfoData()
        fetch("/api/member/update", {
            method : "POST",
            credentials: "include",
            body: JSON.stringify(updateData),
            cache: "no-cache",
            headers: new Headers({"content-type": "application/json"})
        }).then(function(response){
                responseStatus = response.status;
                return response.json()
        }).then(function(data){
            if (responseStatus != 200){
                updateLoadingComplete();
                popUpMessage(data.message)
            }
            else{
                updateLoadingComplete();
                popUpMessage(data.message);
                resetUpdateInput();
                memberPageInit(updateData.name);
            };
        })               
    });
};

function updateBasicInfoData(){
    const name = document.querySelector(".basic-info-name").value;
    const phone = document.querySelector(".basic-info-phone").value;
    const password = document.querySelector(".basic-info-password").value;
    return {
        name : name,
        phone : phone,
        password : password
    }
};

function memberInfoUpdateFormatValid(){
    const memberNameInput = document.querySelector(".basic-info-name");
    const memberPhoneInput = document.querySelector(".basic-info-phone");
    const memberPasswordInput = document.querySelector(".basic-info-password");
    const nameValidImg = document.querySelector(".member-info-name-valid-img");
    const nameInvalidImg = document.querySelector(".member-info-name-invalid-img");
    const phoneValidImg = document.querySelector(".member-info-phone-valid-img");
    const phoneInvalidImg = document.querySelector(".member-info-phone-invalid-img");
    const passwordValidImg = document.querySelector(".member-info-password-valid-img")    
    const passwordInvalidImg = document.querySelector(".member-info-password-invalid-img")

    const wrapUpdateSubmitBtn = document.querySelector(".wrap-update-submit-button");
    const updateSubmitBtn = document.querySelector(".member-info-basic-submit")
    wrapUpdateSubmitBtn.style.cursor = "not-allowed";
    updateSubmitBtn.style.pointerEvents = "none";

    let nameFormatIsOk;
    let phoneFormatIsOk;
    let passwordFormatIsOk;

    memberNameInput.addEventListener("input", () => {
        const name = document.querySelector(".basic-info-name").value;
        const nameValidation = (/^[\w\u4E00-\u9FFF]([^<>\s]){1,20}$/g.test(name));
        if (nameValidation){
            nameValidImg.style.display = "block";
            nameInvalidImg.style.display = "none";
            nameFormatIsOk = true;
            if (nameFormatIsOk && phoneFormatIsOk && passwordFormatIsOk){
                activeUpdateSubmitButton()
            }
        }else if (!nameValidation){
            nameValidImg.style.display = "none";
            nameInvalidImg.style.display = "block";
            nameFormatIsOk = false;
            inactiveUpdateSubmitButton()
        }
    });

    memberPhoneInput.addEventListener("input", () => {
        const phone = document.querySelector(".basic-info-phone").value;
        const phoneValidation = (/^\d{10}$/.test(phone));
        if (phoneValidation){
            phoneValidImg.style.display = "block";
            phoneInvalidImg.style.display = "none";
            phoneFormatIsOk = true;
            if (nameFormatIsOk && phoneFormatIsOk && passwordFormatIsOk){
                activeUpdateSubmitButton()
            }
        }else if (!phoneValidation){
            phoneValidImg.style.display = "none";
            phoneInvalidImg.style.display = "block"
            phoneFormatIsOk = false;
            inactiveUpdateSubmitButton()
        }
    });

    memberPasswordInput.addEventListener("input", () => {
        const password = document.querySelector(".basic-info-password").value;
        const passwordValidation = ((/^[\w]([^<>\s]){7,20}$/.test(password)));
        if (passwordValidation){
            passwordValidImg.style.display = "block";
            passwordInvalidImg.style.display = "none";
            passwordFormatIsOk = true;
            if (nameFormatIsOk && phoneFormatIsOk && passwordFormatIsOk){
                activeUpdateSubmitButton()
            }
        }else if (!passwordValidation){
            passwordValidImg.style.display = "none";
            passwordInvalidImg.style.display = "block";
            passwordFormatIsOk = false;
            inactiveUpdateSubmitButton()
        }
    });

};

function activeUpdateSubmitButton(){
    const wrapUpdateSubmitBtn = document.querySelector(".wrap-update-submit-button");
    const updateSubmitBtn = document.querySelector(".member-info-basic-submit");
    wrapUpdateSubmitBtn.style.cursor = "pointer";
    updateSubmitBtn.style.pointerEvents = "auto"    
}

function inactiveUpdateSubmitButton(){
    const wrapUpdateSubmitBtn = document.querySelector(".wrap-update-submit-button");
    const updateSubmitBtn = document.querySelector(".member-info-basic-submit");
    wrapUpdateSubmitBtn.style.cursor = "not-allowed";
    updateSubmitBtn.style.pointerEvents = "none"    
}

function updateLoadingStart(){
    const layerLoading = document.querySelector("#htmlLayer-zindex50");
    const loadingIcon = document.querySelector(".loading-icon");
    loadingIcon.style.display = "block";
    layerLoading.style.display = "block"
}

function updateLoadingComplete(){
    const layerLoading = document.querySelector("#htmlLayer-zindex50");
    const loadingIcon = document.querySelector(".loading-icon");
    loadingIcon.style.display = "none";
    layerLoading.style.display = "none"
}

function resetUpdateInput(){
    const name = document.querySelector(".basic-info-name");
    const phone = document.querySelector(".basic-info-phone");
    const password = document.querySelector(".basic-info-password");
    const validInvalidIcon = document.querySelectorAll(".valid-invalid-icon");
    inactiveUpdateSubmitButton();
    name.value = "";
    phone.value = "";
    password.value = "";
    validInvalidIcon.forEach(icon => {
        icon.style.display = "none"
    });
}

function changeAsideMenuButtonColor(){
    const menuItems = document.querySelectorAll(".list-item-url");

    menuItems.forEach(itemNode => {

        itemNode.addEventListener("click", () => {

            menuItems.forEach(itemNode => {
                itemNode.classList.remove("item-url-active");
            });

            itemNode.classList.add("item-url-active");
        })
    });
}

let historyRound = 0;
function historyOrder(){
    const historyOrderButton = document.querySelector(".list-item-orders");

    historyOrderButton.addEventListener("click", () => {
        if (historyRound > 0){
            return
        };
        cleanAsideInfoContainer();
        ordersLoadingStart();
        let responseStatus;

        fetch("/api/member/orders")
        .then(function(response){
            responseStatus = response.status;
            return response.json()
        })
        .then(function(data){
            if (data.orders.length === 0){
                setTimeout(
                    ordersLoadingComplete,
                    1000
                );
                renderEmptyOrdersPage();
                historyRound += 1;
            }
            else{
                renderOrdersPage(data.orders);
                historyRound += 1;
            }
        });
        
    });
}

function cleanAsideInfoContainer(){
    const basicInfoTitle = document.querySelector(".member-info-basic-title");
    basicInfoTitle.style.display = "none";

    const divider = document.querySelector(".member-info-divider");
    divider.style.display = "none";

    const basicInfo = document.querySelectorAll(".member-info-basic");
    basicInfo.forEach(info => {
        info.style.display = "none"
    });
    
}

function ordersLoadingStart(){
    const orderLoadingIcon = document.querySelector(".wrap-order-loading-icon");
    orderLoadingIcon.style.display = "block";

    const ordersContainer = document.querySelector(".page-container-aside-member-info");
    ordersContainer.classList.add("loading")
}

function ordersLoadingComplete(){
    const orderLoadingIcon = document.querySelector(".wrap-order-loading-icon");
    orderLoadingIcon.style.display = "none"

    const ordersContainer = document.querySelector(".page-container-aside-member-info");
    ordersContainer.classList.remove("loading")

}


function renderEmptyOrdersPage(){
    const infoContainer = document.querySelector(".page-container-aside-member-info");
    infoContainer.insertAdjacentHTML("afterbegin", 
    `    
    <h1>歷史訂單</h1>
    <div class = "member-info-divider"></div>
    <div class = "wrap-empty-order-background"><img src = "/static/image/noorder.png" class = "empty-order-background"></div>
    `
    );  
}

function renderOrdersPage(orders){
    const infoContainer = document.querySelector(".page-container-aside-member-info");

    const orderTitle = document.createElement("h1");
    orderTitle.textContent = "歷史訂單";
    

    const divider = document.createElement("div");
    divider.classList.add("member-info-divider");

    infoContainer.append(orderTitle, divider);

    let arrowDownIconLoadingRound = 0;
    let tripNumber = 0;
    orders.forEach(order => {
        const orderListGroupWrap = document.createElement("div");
        orderListGroupWrap.classList.add("wrap-order-list-item-group")

        const orderListGroup = document.createElement("div");
        orderListGroup.classList.add(`order-list-item-group`);

        const arrowDownIcon = new Image();
        arrowDownIcon.onload = () => {
            arrowDownIconLoadingRound += 1
            if (arrowDownIconLoadingRound === orders.length){
                setTimeout(
                    ordersLoadingComplete,
                    1000
                );
            };
        };
        arrowDownIcon.src = "/static/image/downward-arrow.png";
        arrowDownIcon.classList.add("order-list-arrowDownIcon")
        orderListGroup.appendChild(arrowDownIcon);
        
        const orderListGroupTitle = document.createElement("div");
        orderListGroupTitle.textContent = `訂單編號 : ${order[0]}`;
        orderListGroup.appendChild(orderListGroupTitle);

        orderListGroupWrap.appendChild(orderListGroup);

        fetch(`/api/order/${order[0]}`)
        .then(function(response){
            return response.json()
        })
        .then(function(data){
            const orderData = data
            renderSingleOrderPage(orderData, orderListGroupWrap, tripNumber);
    
            infoContainer.appendChild(orderListGroupWrap);

            tripNumber += 1;
    
        });

    });
}

function resetOrdersPage(){
    const infoContainer = document.querySelector(".page-container-aside-member-info");
    infoContainer.innerHTML = "";
}

function renderSingleOrderPage(orderData, orderListGroupWrap, tripNumber){
    const singleOrderContainer = document.createElement("div");
    singleOrderContainer.classList.add("single-order-container-style")    
    singleOrderContainer.classList.add(`single-order-container-${tripNumber}`);

    const allOrder = orderData.data.trips;

    allOrder.forEach(singleOrder => {
        const wrapSingleOrderImage = document.createElement("div");
        wrapSingleOrderImage.classList.add("single-order-image")

        const singleOrderImageHyperlink = document.createElement("a");
        singleOrderImageHyperlink.href = `${window.location.origin}/attraction/${singleOrder.attraction.id}`;

        const singleOrderImage = document.createElement("img");
        singleOrderImage.src = singleOrder.attraction.image;

        wrapSingleOrderImage.appendChild(singleOrderImage);
        singleOrderImageHyperlink.appendChild(wrapSingleOrderImage);

        const singleOrderName = document.createElement("div");
        singleOrderName.classList.add("single-order-name")
        singleOrderName.textContent = singleOrder.attraction.name;

        const singleOrderAddress = document.createElement("div");
        singleOrderAddress.classList.add("single-order-address");
        singleOrderAddress.textContent = singleOrder.attraction.address;

        const singleOrderPrice = document.createElement("div");
        singleOrderPrice.classList.add("single-order-price");
        singleOrderPrice.textContent = `導覽費用 : ${singleOrder.attraction.price}`;

        const singleOrderDate = document.createElement("div");
        singleOrderDate.classList.add("single-order-date");
        singleOrderDate.textContent = `導覽日期 : ${singleOrder.date}`;

        const singleOrderTime = document.createElement("div");
        singleOrderTime.classList.add("single-order-time");
        singleOrderTime.textContent = `導覽時段 : ${singleOrder.time}`;

        const wrapSingleOrderInfo = document.createElement("div");
        wrapSingleOrderInfo.classList.add("wrap-single-order-info");

        const wrapSingleOrderDetail = document.createElement("div");
        wrapSingleOrderDetail.classList.add('wrap-single-order-detail');

        wrapSingleOrderInfo.append(
            singleOrderName, 
            singleOrderAddress,
            singleOrderPrice,
            singleOrderDate,
            singleOrderTime
        );

        wrapSingleOrderDetail.append(
            singleOrderImageHyperlink,
            wrapSingleOrderInfo 
        );
        
        singleOrderContainer.appendChild(wrapSingleOrderDetail)

        singleOrderContainer.style.display = "none";

        orderListGroupWrap.addEventListener("click", () => {
            const singleOrderDetail = document.querySelector(`.single-order-container-${tripNumber}`);
            singleOrderDetail.style.display = "flex";

            const layer = document.querySelector("#htmlLayer-opacity0-zindex50");
            layer.style.display = "block";

            layer.addEventListener("click", () => {
                singleOrderDetail.style.display = "none";
                layer.style.display = "none"
            });

            const singleOrderList = document.querySelectorAll(`.order-list-item-group`);
            singleOrderList.forEach(list => {
                list.addEventListener("click", () => {
                    singleOrderDetail.style.display = "none";
                    layer.style.display = "none"    
                });
            });

        });

        orderListGroupWrap.appendChild(singleOrderContainer);

    });

}

/* <div class="wrap-order-list-item-group">
    <div class="order-list-item-group">
        <img src="/static/image/downward-arrow.png." class="order-list-arrowDownIcon" />
        <div>訂單編號 : 2-20221230004045</div>
    </div>
    <div class = "single-order-container">
        <div class = "single-order-totalCost">總價格 : 4000</div>        
        <div class = "single-order-image">
            <img src ="https://www.travel.taipei/d_upload_ttn/sceneadmin/pic/11000848.jpg"/>
        </div>
        <div class = "single-order-name">新北投溫泉區</div>
        <div class = "single-order-address">台北市 北投區中山路、光明路沿線</div>
        <div class = "single-order-price">價格 : 2000</div>
        <div class = "single-order-date">2023-01-26</div>
        <div class = "single-order-time">上半天</div>
    </div>
</div>
 */
/* 載入時啟動 */
checkMemberStatusInMemberPage();
updateBasicMemberInfo();
memberInfoUpdateFormatValid();
changeAsideMenuButtonColor();
historyOrder();