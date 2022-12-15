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
                const welcomeName = document.querySelector("#welcome-name");
                welcomeName.textContent = data.name;
                const contactName = document.querySelector("#contact-name");
                contactName.value = data.name;
                const contactEmail = document.querySelector("#contact-email");
                contactEmail.value = data.email;
                for(bookingInfo of data.data.attractions){
                    renderItemsSection(bookingInfo);
                };
            })
        };
    })
};

/* 確認有無預定行程 */
function checkHaveBookingOrNot(){
    // 網頁無任何行程下有5個section
    const countSection = document.getElementsByTagName("section").length;
    const cleanTheBooking = document.querySelector(".wrap-content-forRWD");
    const sectionForNoBooking = document.querySelector("#noBooking");
    const goToBooking = document.querySelector(".goToBooking");
    if(countSection <= 6){
        cleanTheBooking.style.display = "none";
        sectionForNoBooking.style.display = "block";
        goToBooking.href = `${window.location.origin}/`
    }
};

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
        console.log(data);
        window.location.reload();
    })
}


/* 載入時啟動 */
checkMemberStatus();
