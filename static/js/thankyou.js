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
            return
        }else{
            window.location.assign(`${window.location.origin}/`)            
        };
    });
};

function getOrderNumber(){
    const orderNumber = document.querySelector(".order-number");
    orderNumberFromUrl = window.location.search.split("=")[1];
    orderNumber.textContent = orderNumberFromUrl;
}

/* 載入時觸發 */
getOrderNumber();
checkMemberStatus();