/* 全域變數 */
const layer = document.querySelector("#htmlLayer-zindex50")


/* 跳轉至首頁 */
function homepage(){
    const homepage = document.querySelector("#Nav-backToIndex");
    homepage.addEventListener("click", function (){
        window.location.assign(`${window.location.origin}/`)
    });
};


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
    console.log("name validation : " + /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(userSignupData.name));
    console.log("email validation : " + /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(userSignupData.email));
    console.log("password validation : " + /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/.test(userSignupData.password));
    if(nameValidation === false){
        return {
            valid : false,
            alertToUser : "姓名 : 至少8碼，要有大寫英文、小寫英文和數字"
        }
    }else if(emailValidation === false){
        return {
            valid : false,
            alertToUser : "郵件地址 : 請輸入正確的郵件地址"
        }
    }else if(passwordValidation === false){
        return {
            valid : false,
            alertToUser : "密碼 : 至少8碼，要有大寫英文、小寫英文、數字，和特殊符號"
        }
    }else if(nameValidation && emailValidation && passwordValidation){
        return {
            valid : true,
            alertToUser : "註冊成功，請登入系統"
        }
    }else{
        return {
            valid : false,
            alertToUser : "請確認會員資料填寫完整"
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
            }).then(async function(responseJsonData){
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
            console.log(handleUserSignupValidation().alertToUser);
            memberSignupAlert.textContent = handleUserSignupValidation().alertToUser;
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