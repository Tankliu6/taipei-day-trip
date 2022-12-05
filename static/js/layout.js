/* 全域變數 */


/* 跳轉至首頁 */
function homepage(){
    const homepage = document.querySelector("#Nav-backToIndex");
    homepage.addEventListener("click", function (){
        window.location.assign(`${window.location.origin}/`)
    });
};


/* 會員登入/註冊 */
const signInInterface = document.querySelector("#member-signin");
const signUpInterface = document.querySelector("#member-signup");
const closeIcon = document.querySelectorAll("#member-icon-close");
console.log(closeIcon);
function showSignIn(){
    signInInterface.style.display = "block";
};

function switchToSignUp(){
    signInInterface.style.display = "none";
    signUpInterface.style.display = "block";
};

function switchToSignIn(){
    signInInterface.style.display = "block";
    signUpInterface.style.display = "none";
};

function closeMemberInterface(){
    for(icon of closeIcon){
        icon.addEventListener("click", function(){
            signInInterface.style.display = "none";
            signUpInterface.style.display = "none";
        });
    };
};


/* 載入時觸發 */
homepage();
closeMemberInterface();