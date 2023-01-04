/* 全域變數 */
const heroSection = document.querySelector("#hero-section-container-grid");
const Name = document.querySelector("#name");
const categoryMrt = document.querySelector("#category-mrt");
const description = document.querySelector("#description");
const address = document.querySelector("#address");
const transport = document.querySelector("#transport");
const dotContainer = document.querySelector("#dots");
const title = document.querySelector("title")

/* slider 向左按鈕 */
function previous(){
    const dots = document.querySelectorAll(".dot");
    for(dot of dots){
        if(dot.style.backgroundColor == "rgb(0, 0, 0)"){
            /* 將黑色點點變成白色 */
            dot.style.backgroundColor = "#FFFFFF";
            /* 關閉黑色點點對應的景點圖片 */
            const imgPairToDot = document.querySelector("#pic-container img[style = 'display: block;']");
            imgPairToDot.style.display = "none";
            /* 找出被關閉圖片的上一個編號 */
            /* 如果從編號 '0' 找上一個，就讓圖片及點點編號到最後一個 */
            let previousNum;
            if(imgPairToDot.value === 0){
                previousNum = dots.length - 1;
            }else{
                previousNum = imgPairToDot.value - 1; 
            };
            /* 打開上一個編號的景點圖片及點點背景(黑色) */
            const dotShow = document.querySelector(`#dot-id${previousNum}`);
            dotShow.style.backgroundColor = "#000000";
            const imgShow = document.querySelector(`#img-id${previousNum}`);
            imgShow.style.display = "block"; 
            /* 如果執行過一次就跳出整個for(dot of dots) */
            /* 繼續檢查會導致編號'頭'跳編號'尾'時又執行一遍if(dot.style.backgroundColor == "rgb(0, 0, 0)") */
            return
        };
    }
};

/* slider 向右按鈕 */
function next(){
    const dots = document.querySelectorAll(".dot");
    for(dot of dots){
        if(dot.style.backgroundColor == "rgb(0, 0, 0)"){
            /* 將黑色點點變成白色 */
            dot.style.backgroundColor = "#FFFFFF";
            /* 關閉黑色點點對應的景點圖片 */
            const imgPairToDot = document.querySelector("#pic-container img[style = 'display: block;']");
            imgPairToDot.style.display = "none";
            /* 找出被關閉圖片的下一個編號 */
            /* 如果從編號 '5' 找下一個，就讓圖片及點點編號到第一個 */
            let nextNum;
            if(imgPairToDot.value === dots.length - 1){
                nextNum = 0;
            }else{
                nextNum = imgPairToDot.value + 1; 
            };
            /* 打開上一個編號的景點圖片及點點背景(黑色) */
            const dotShow = document.querySelector(`#dot-id${nextNum}`);
            dotShow.style.backgroundColor = "#000000";
            const imgShow = document.querySelector(`#img-id${nextNum}`);
            imgShow.style.display = "block"; 
            /* 如果執行過一次就跳出整個for(dot of dots) */
            /* 繼續檢查會導致編號'尾'跳編號'頭'時又執行一遍if(dot.style.backgroundColor == "rgb(0, 0, 0)") */
            return
        };
    }
};


/* attraction page 網頁跳轉進來後渲染資料 */
function renderDataOnPage(){
    // 抓取跳轉過來的網址 id
    let id = window.location.href.split("/");
    id = id[id.length - 1];
    // fetch 後端 api 取回對應 id 景點資料
    const url = `/api/attraction/${id}`;
    fetch(url).then(function(response){
        return response.json();
    }).then(function(data){
        /* 陽明山國家公園無捷運站 */
        if(data.data.mrt == null ){
            data.data.mrt = "nomrt"
        };
        /* 將接回的資料渲染到前端畫面 */
        processPageInfo(data);
        processImgOnSlider(data);
    })
};

/* render page basic info */
function processPageInfo(data){ 
    title.textContent = data.data.name;
    Name.textContent = data.data.name;
    categoryMrt.textContent = `${data.data.category} at ${data.data.mrt}`;
    description.textContent = data.data.description;
    address.textContent = data.data.address;
    transport.textContent = data.data.transport;
}

/* render Img slider */
function processImgOnSlider(data){
    dotContainer.style.display = "none";
    const picContainer = document.querySelector("#pic-container");
    const loadingPercentContainer = document.querySelector(".loading-percent");
    const loadingImg = document.querySelector(".lds-ring-wrap");
    const loadingProgress = data.data.images.length;
    let imgNum = 0;
    let loadingPercent;
    let numLoaded = 0; 
    /* 每張照片賦予編號，與 slide 下方點點(dot)成對 */
    const images = data.data.images.map(imgUrl => {
        const img = new window.Image();
        img.src = imgUrl;
        return img;
      });

    for (const img of images) {
        img.onload = function () {
            numLoaded++;
            // toFixed() would return string!!!
            loadingPercent = Number((numLoaded / loadingProgress).toFixed(2));
            loadingPercentContainer.textContent = `${loadingPercent * 100}%`;
            if (loadingPercent === 1) {
                loadingImg.style.display = "none";
                showFirstImage();
            }
        };
        img.setAttribute("id", `img-id${imgNum}`);
        img.value = imgNum;
        /* append Img into pic-container */
        picContainer.appendChild(img);
        /* create dot and append in dotContainer */
        const dot = document.createElement("div");
        dot.setAttribute("class", "dot");
        
        /* set dot's pair value */
        dot.value = imgNum;
        
        /* set id{imgNum} on dot for changing background-color */
        dot.setAttribute("id", `dot-id${imgNum}`);
        
        /* dot onclick and switching pairedImg */
        dot.addEventListener("click", changeImageOnDotClick);
        dotContainer.appendChild(dot);
        
        img.style.display = "none";
        /* 第一張圖片(編號'0')預設'block'，點點預設'黑色' */
        // if (imgNum == 0) {
        //     // dot.style.backgroundColor = "#000000";
        // } else {
        //     img.style.display = "none";
        // }
        imgNum++;
    };     
}

/* Dot below slider */
function changeImageOnDotClick() {
    /* container have 2 more imgs, previous and next btns' imgs. */
    const pairImg = document.querySelectorAll(`div#pic-container img`);

    /* So we need to plus 2 to get the right order in pairImg container */
    let num = this.value + 2;

    /* hidden the img playing on the pic-container */
    for (let img of pairImg) {
        if (img.style.display === "block") {
            img.style.display = "none";
            /* 圖片對應的 dot，將其背景顏色改變 */
            const dotWhere = document.querySelector(`#dot-id${img.value}`);
            dotWhere.style.backgroundColor = "#FFFFFF";
        }
    }

    /* change the background-color of dot we clicked */
    this.style.backgroundColor = "#000000";

    /* Show the clicked dot paired img */
    pairImg[num].style.display = "block";
}

/* show first slide when all Img well loaded */
function showFirstImage() {
    const firstImg = document.querySelector("#img-id0");
    firstImg.style.display = "block";
    dotContainer.style.display = "flex";
    const firstDot = document.querySelector("#dot-id0");
    firstDot.style.backgroundColor = "#000000";
    const sliderBtn = document.querySelectorAll(".slider-btn");
    sliderBtn.forEach(btn => {
        btn.style.display = "block"
    });
    
}; 

/* 轉換花費 */
function changeRadioCharge(radioBtn){
    /* radioBtn 會回傳div */
    const chargeBoxOnHtml = document.querySelector("#chargeBox");
    const charge = radioBtn.value;
    chargeBoxOnHtml.textContent = charge;
}

renderDataOnPage();