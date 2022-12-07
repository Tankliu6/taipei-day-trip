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
        }else{
            logout.style.display = "none";
            signinAndSignup.style.display = "block"
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

function closeMemberInterface(){
    for(icon of closeIcon){
        icon.addEventListener("click", function(){
            loginInInterface.style.display = "none";
            signUpInterface.style.display = "none";
            clearLoginSignup();
        });
    };
};

function signUpData(){
    let data = {
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
    let nameValidation = (/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(userSignupData.name));
    let emailValidation = (/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(userSignupData.email));
    let passwordValidation = (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(userSignupData.password));
    if(nameValidation === false){
        return {
            valid : false,
            message : "姓名 : 至少8碼，要有大寫英文、小寫英文和數字"
        }
    }else if(emailValidation === false){
        return {
            valid : false,
            message : "郵件地址 : 請輸入正確的郵件地址"
        }
    }else if(passwordValidation === false){
        return {
            valid : false,
            message : "密碼 : 至少8碼，要有大寫英文、小寫英文、數字，和特殊符號"
        }
    }else if(nameValidation && emailValidation && passwordValidation){
        return {
            valid : true,
            message : "註冊成功，請登入系統"
        }
    }else{
        return {
            valid : false,
            message : "請確認會員資料填寫完整"
        }
    }
};

function signUp(){
    const submit = document.querySelector(".signup-submit");
    submit.addEventListener("click", function(){
        console.log("click");
        console.log(handleUserSignupValidation().valid);
        let responseStatus;
        /* 註冊會員格式正確 */
        if(handleUserSignupValidation().valid){
            let data = signUpData();
            console.log(data);
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
                console.log(responseJsonData);
                if(responseStatus == 400){
                    console.log("here", responseJsonData.message);
                    memberSignupAlert.textContent = responseJsonData.message;
                    memberSignupAlert.style.color = "red";
                    memberSignupAlert.style.display = "block";
                    return responseJsonData
                }else if(responseStatus == 200){
                    memberSignupAlert.textContent = "註冊成功，請登入系統";
                    memberSignupAlert.style.color = "green";
                    memberSignupAlert.style.display = "block";
                    return responseJsonData
                }else{
                    console.log("here", responseJsonData.message);
                    memberSignupAlert.textContent = responseJsonData.message;
                    memberSignupAlert.style.color = "red";
                    memberSignupAlert.style.display = "block";
                    return responseJsonData
                }
            })
        }else{ /* 註冊會員格式不正確 */
            console.log(handleUserSignupValidation().message);
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
    console.log(loginSubmit);
    let loginStatus;
    console.log("signIn");
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
                console.log(responseJsonData);
                console.log(loginStatus);
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
    let emailValidation = (/^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(loginInEmail.value));
    let passwordValidation = (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(loginInpassword.value));
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
            "message" : "密碼 : 至少8碼，要有大寫英文、小寫英文、數字，和特殊符號"
        }
}

/* 登入/註冊會員下方反黑部分 */
function clearLoginSignup(){
    layer.style.display = "none";
    loginInInterface.style.display = "none";
    signUpInterface.style.display = "none";
}


/* 載入時觸發 */
homepage();
closeMemberInterface();
clearLoginSignup();
signUp();
signIn();
checkMemberStatus();