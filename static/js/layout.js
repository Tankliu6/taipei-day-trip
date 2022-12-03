/* 全域變數 */


/* 跳轉至首頁 */
function homepage(){
    const homepage = document.querySelector("#Nav-backToIndex");
    homepage.addEventListener("click", function (){
        window.location.assign(`${window.location.origin}/`)
    });
};


/* 載入時觸發 */
homepage();