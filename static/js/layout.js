/* 全域變數 */
const layer = document.querySelector("#htmlLayer-zindex50");
const signinAndSignup = document.querySelector("#Nav-btn-signin-signup");
const logout = document.querySelector("#Nav-btn-logout");

/* 跳轉至首頁 */
function homepage(){
    const homepage = document.querySelector("#Nav-backToIndex");
    homepage.addEventListener("click", function (){
        window.location.assign(`${window.location.origin}/`)
    });
};

/* 確認登入狀態 */
function checkMemberStatus(){
    fetch("/api/user/auth", {
        method : "GET",
        credentials: "include",
        cache: "no-cache",
        headers: new Headers({
            "content-type": "application/json"
        })
    }).then(function(response){
        return response.json();
    }).then(function(responseJsonData){
        if(responseJsonData.data != null){
            logout.style.display = "block";
            signinAndSignup.style.display = "none"
            logout.classList.remove("Nav-btn-right")
            logout.classList.add("Nav-btn-right-active")
        }else{
            logout.style.display = "none";
            signinAndSignup.style.display = "block";
        };
    });
};

/* 登出會員系統 */
function logoutBtn(){
    fetch("/api/user/auth", {
        method : "DELETE",
        credentials : "include",
        cache : "no-cache",
    }).then(function(response){
        return response.json();
    }).then(function(responseJsonData){
        if(responseJsonData.ok === true){
            window.location.reload();
        }else{
            window.location.assign("/");
        }
    })
}

/* 會員登入/註冊 */
const loginInInterface = document.querySelector("#member-login");
const signUpInterface = document.querySelector("#member-signup");
const popUpDialog = document.querySelector("#dialog-pop-up-message");
const closeIcon = document.querySelectorAll("#member-icon-close");
const loginInEmail = document.querySelector("#login-email-input");
const loginInpassword = document.querySelector("#login-password-input");
const signUpName = document.querySelector("#signup-name-input");
const signUpEmail = document.querySelector("#signup-email-input");
const signUpPassword = document.querySelector("#signup-password-input");
const memberLoginAlert = document.querySelector("#member-login-alert");
const memberSignupAlert = document.querySelector("#member-signup-alert");

function showSignIn(){
    layer.style.display = "block";
    loginInInterface.style.display = "block";
};

function switchToSignUp(){
    loginInInterface.style.display = "none";
    signUpInterface.style.display = "block";
};

function switchToSignIn(){
    loginInInterface.style.display = "block";
    signUpInterface.style.display = "none";
};

/* 點擊註冊&登入右上角叉叉進行關閉 */
function closeMemberInterface(){  
    loginInInterface.style.display = "none";
    signUpInterface.style.display = "none";
    popUpDialog.style.display = "none";
    clearLoginSignup();
}
/* 頁面載入時賦予登入&註冊頁叉叉關閉功能 */
for(icon of closeIcon){
    icon.addEventListener("click", closeMemberInterface);
};

function signUpData(){
    const data = {
        "name" : null,
        "email" : null,
        "password" : null,
    };
    const name = signUpName.value;
    const email = signUpEmail.value;
    const password = signUpPassword.value;
    data.name = name;
    data.email = email;
    data.password = password; 
    return data;
};

function handleUserSignupValidation(){
    const userSignupData = signUpData();
    const nameValidation = (/^[\w\u4E00-\u9FFF]([^<>\s]){1,20}$/g.test(userSignupData.name));
    const emailValidation = (/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(userSignupData.email));
    const passwordValidation = (/^[\w]([^<>\s]){7,20}$/.test(userSignupData.password));
    if(userSignupData.name === userSignupData.password){
        return{
            "valid" : false,
            "message" : "使用者名稱不可與密碼相同"
        }
    }else if(!nameValidation){
        return {
            "valid" : false,
            "message" : "使用者名稱 : 2碼至20碼，不可含'<''>'及空格"
        }
    }else if(!emailValidation){
        return {
            "valid" : false,
            "message" : "郵件地址 : 請輸入正確的郵件地址"
        }
    }else if(!passwordValidation){
        return {
            "valid" : false,
            "message" : "密碼 : 8碼至20碼，不含'<''>'及空格"
        }
    }else if(nameValidation && emailValidation && passwordValidation){
        return {
            "valid" : true,
            "message" : "註冊成功，請登入系統"
        }
    }else{
        return {
            "valid" : false,
            "message" : "請確認會員資料填寫完整"
        }
    }
};

function signUp(){
    const submit = document.querySelector(".signup-submit");
    submit.addEventListener("click", function(){
        let responseStatus;
        /* 註冊會員格式正確 */
        if(handleUserSignupValidation().valid){
            const data = signUpData();
            fetch(`/api/user`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(data),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }).then(function(response){
                responseStatus = response.status;
                return response.json();
            }).then(function(responseJsonData){
                if(responseStatus == 400){
                    memberSignupAlert.textContent = responseJsonData.message;
                    memberSignupAlert.style.color = "red";
                    memberSignupAlert.style.display = "block";
                    return responseJsonData
                }else if(responseStatus == 200){
                    memberSignupAlert.textContent = responseJsonData.message;
                    memberSignupAlert.style.color = "green";
                    memberSignupAlert.style.display = "block";
                    return responseJsonData
                }else{
                    memberSignupAlert.textContent = responseJsonData.message;
                    memberSignupAlert.style.color = "red";
                    memberSignupAlert.style.display = "block";
                    return responseJsonData
                }
            })
        }else{ /* 註冊會員格式不正確 */
            memberSignupAlert.textContent = handleUserSignupValidation().message;
            memberSignupAlert.style.color = "red";
            memberSignupAlert.style.display = "block";
        }
    });
};

/* 關閉註冊會員的提示訊息 */
function clearMemberAlert(){
    memberLoginAlert.style.display = "none";
    memberSignupAlert.style.display = "none";
}

/* 登入會員 */
function signIn(){
    const loginSubmit = document.querySelector(".login-submit");
    let loginStatus;
    loginSubmit.addEventListener("click", function(){
        if(handleUserSigninValidation().valid){
            let data = handleUserSigninValidation().loginData;
            fetch("/api/user/auth", {
                method: "PUT",
                credentials: "include",
                body: JSON.stringify(data),
                cache: "no-cache",
                headers: new Headers({
                    "content-type": "application/json"
                })
            }).then(function(response){
                loginStatus = response.status;
                return response.json();
            }).then(function(responseJsonData){
                if(loginStatus == 200){
                    memberLoginAlert.textContent = "登入成功，轉至會員頁面";
                    memberLoginAlert.style.color = "green";
                    memberLoginAlert.style.display = "block";
                    window.location.reload();
                }else if(loginStatus == 400){
                    memberLoginAlert.textContent = responseJsonData.message;
                    memberLoginAlert.style.color = "red";
                    memberLoginAlert.style.display = "block" 
                }else{
                    memberLoginAlert.textContent = responseJsonData.message;
                    memberLoginAlert.style.color = "red";
                    memberLoginAlert.style.display = "block" 
                }
            });
        }else{
            memberLoginAlert.textContent = handleUserSigninValidation().message;
            memberLoginAlert.style.color = "red";
            memberLoginAlert.style.display = "block"
        }        
    })
}

/* 確認登入會員信箱及密碼格式 */
function handleUserSigninValidation(){
    const emailValidation = (/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(loginInEmail.value));
    const passwordValidation = (/^[\w]([^<>\s]){7,20}$/.test(loginInpassword.value));
    if(emailValidation && passwordValidation){
        return{
            "valid" : true,
            "loginData" : {
                "email" : loginInEmail.value,
                "password" : loginInpassword.value
            }
        }
    }else if(emailValidation === false){
        return{
            "valid" : false,
            "message" : "郵件地址 : 請輸入正確的郵件地址"
        }
    }else if(passwordValidation === false)
        return{
            "valid" : false,
            "message" : "密碼 : 8碼至20碼，不含'<''>'及空格"
        }
}

/* 登入/註冊會員下方反黑部分 */
function clearLoginSignup(){
    layer.style.display = "none";
    loginInInterface.style.display = "none";
    signUpInterface.style.display = "none";
}

/* shopping-cart-icon btn */
function booking(){
    const shoppingCartBtn = document.querySelector("#Nav-btn-left")
    shoppingCartBtn.addEventListener("click", function(){
        fetch("/api/user/auth", {
            method : "GET",
            credentials: "include",
            cache: "no-cache",
            headers: new Headers({
                "content-type": "application/json"
            })
        }).then(function(response){
            return response.json();
        }).then(function(responseJsonData){
            if(responseJsonData.data != null){
                let pathname = window.location.pathname;
                if(pathname === "/booking"){
                    logout.style.display = "block";
                    signinAndSignup.style.display = "none";
                    window.location.reload();
                }else{
                    popUpMessage(`網頁即將跳轉至<a href = ${window.location.origin}/booking>預定行程頁</a>`);
                    setTimeout(() =>{
                        logout.style.display = "block";
                        signinAndSignup.style.display = "none";
                        window.location.assign(`${window.location.origin}/booking`);
                    }, 500)    
                }
            }else{
                showSignIn();
                logout.style.display = "none";
                signinAndSignup.style.display = "block"
            };
        });
    });
}

/* popUpMessage */
function popUpMessage(message){
    const popMsg = document.querySelector("#dialog-pop-up-message");
    popMsg.style.display = "block"
    const popMsgText = document.querySelector(".dialog-pop-up-message-text");
    popMsgText.textContent = "";
    popMsgText.insertAdjacentHTML("afterbegin", message);
};


/* dialog show-close-password */
function passwordShowClose(){
    const show = document.querySelectorAll(".password-show");
    const close = document.querySelectorAll(".password-close");
    show.forEach(closeIcon => {
        closeIcon.addEventListener("click", function(){
            const closeIcon = document.querySelectorAll(".password-close-icon");
            closeIcon.forEach(icon => {
                icon.style.display = "none";
            });
            const showIcon = document.querySelectorAll(".password-show-icon");
            showIcon.forEach(icon => {
                icon.style.display = "block";
            });
            const loginPassword = document.querySelector("#login-password-input");
            const signUpPassword = document.querySelector("#signup-password-input");
            loginPassword.type = "text";
            signUpPassword.type = "text";
            })
        });
    close.forEach(showIcon => {
        showIcon.addEventListener("click", function(){
            const closeIcon = document.querySelectorAll(".password-close-icon");
            closeIcon.forEach(icon => {
                icon.style.display = "block";
            });
            const showIcon = document.querySelectorAll(".password-show-icon");
            showIcon.forEach(icon => {
                icon.style.display = "none";
            });
            const loginPassword = document.querySelector("#login-password-input");
            const signUpPassword = document.querySelector("#signup-password-input");
            loginPassword.type = "password";
            signUpPassword.type = "password";
        })    
    })
};

/* shopping-cart-count */
function shoppingCartCount() {
    fetch('/api/booking/count')
    .then(response => {
        return response.json()
    })
    .then(data => {
        const shoppingCartCount = document.querySelector(".shopping-cart-count");
        shoppingCartCount.textContent = data.count;
    });
};

/* dropdown list */
function openDropDownList(){
    const dropdownList = document.querySelector(".wrap-dropdown-list-item-group");
    const dropdownListArrow = document.querySelector(".dropdown-arrow");
    const bodyLayer = document.querySelector("#htmlLayer-opacity0-zindex50");

    bodyLayer.addEventListener("click", closeDropdownList);
    bodyLayer.style.display = "block"

    dropdownList.classList.remove("close");
    dropdownListArrow.classList.remove("close");
    dropdownList.classList.add("open-block");
    dropdownListArrow.classList.add("open-block");
}

function closeDropdownList(){
    const dropdownList = document.querySelector(".wrap-dropdown-list-item-group");
    const dropdownListArrow = document.querySelector(".dropdown-arrow");
    const bodyLayer = document.querySelector("#htmlLayer-opacity0-zindex50");

    dropdownList.classList.remove("open-block");
    dropdownListArrow.classList.remove("open-block");
    dropdownList.classList.add("close");
    dropdownListArrow.classList.add("close");

    bodyLayer.style.display = "none";
}

function memberBasicInfoSetting(){
    const memberCenter = document.querySelector(".dropdown-list-item-member-basic-setting");
    memberCenter.href = `${window.location.origin}/member`;
}

function memberHistoryOrder(){
    const memberHistoryOrder = document.querySelector(".dropdown-list-item-member-history-orders");
    memberHistoryOrder.href = `${window.location.origin}/member`;
}

/* 載入時觸發 */
homepage();
closeMemberInterface();
clearLoginSignup();
signUp();
signIn();
checkMemberStatus();
booking();
layer.addEventListener("click", clearLoginSignup);
logout.addEventListener("click", openDropDownList);
passwordShowClose();
shoppingCartCount();
memberBasicInfoSetting();
memberHistoryOrder();
