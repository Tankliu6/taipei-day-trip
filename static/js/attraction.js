/* 全域變數 */
const heroSection = document.querySelector("#hero-section-container-grid");
const Name = document.querySelector("#name");
const categoryMrt = document.querySelector("#category-mrt");
const description = document.querySelector("#description");
const address = document.querySelector("#address");
const transport = document.querySelector("#transport");
const dots = document.querySelector("#dots");
const title = document.querySelector("title")

/* 向左按鈕 */
function previous(){
    console.log("pre");
    let dots = document.querySelectorAll(".dot");
    for(dot of dots){
        console.log("for fire");
        if(dot.style.backgroundColor == "rgb(0, 0, 0)"){
            console.log("if fire");
            /* 將黑色點點變成白色 */
            dot.style.backgroundColor = "#FFFFFF";
            /* 關閉黑色點點對應的景點圖片 */
            let imgPairToDot = document.querySelector("#pic-container img[style = 'display: block;']");
            imgPairToDot.style.display = "none";
            /* 找出被關閉圖片的上一個編號 */
            /* 如果從編號 '0' 找上一個，就讓圖片及點點編號到最後一個 */
            let previousNum;
            console.log(imgPairToDot.value);
            if(imgPairToDot.value === 0){
                previousNum = dots.length - 1;
                console.log(previousNum);
                console.log("one");
            }else{
                previousNum = imgPairToDot.value - 1; 
                console.log("two");
            };
            /* 打開上一個編號的景點圖片及點點背景(黑色) */
            console.log(previousNum);
            let dotShow = document.querySelector(`#dot-id${previousNum}`);
            dotShow.style.backgroundColor = "#000000";
            console.log("three");
            let imgShow = document.querySelector(`#img-id${previousNum}`);
            imgShow.style.display = "block"; 
            console.log("four");
            /* 如果執行過一次就跳出整個for(dot of dots) */
            /* 繼續檢查會導致編號'頭'跳編號'尾'時又執行一遍if(dot.style.backgroundColor == "rgb(0, 0, 0)") */
            return
        };
    }
};

/* 向右按鈕 */
function next(){
    console.log("nxt");
    let dots = document.querySelectorAll(".dot");
    for(dot of dots){
        console.log("for fire");
        if(dot.style.backgroundColor == "rgb(0, 0, 0)"){
            console.log("if fire");
            /* 將黑色點點變成白色 */
            dot.style.backgroundColor = "#FFFFFF";
            /* 關閉黑色點點對應的景點圖片 */
            let imgPairToDot = document.querySelector("#pic-container img[style = 'display: block;']");
            imgPairToDot.style.display = "none";
            /* 找出被關閉圖片的下一個編號 */
            /* 如果從編號 '5' 找下一個，就讓圖片及點點編號到第一個 */
            let nextNum;
            console.log(imgPairToDot.value);
            if(imgPairToDot.value === dots.length - 1){
                nextNum = 0;
                console.log(nextNum);
                console.log("one");
            }else{
                nextNum = imgPairToDot.value + 1; 
                console.log("two");
            };
            /* 打開上一個編號的景點圖片及點點背景(黑色) */
            console.log(nextNum);
            let dotShow = document.querySelector(`#dot-id${nextNum}`);
            dotShow.style.backgroundColor = "#000000";
            console.log("three");
            let imgShow = document.querySelector(`#img-id${nextNum}`);
            imgShow.style.display = "block"; 
            console.log("four");
            /* 如果執行過一次就跳出整個for(dot of dots) */
            /* 繼續檢查會導致編號'尾'跳編號'頭'時又執行一遍if(dot.style.backgroundColor == "rgb(0, 0, 0)") */
            return
        };
    }
};

/* 網頁跳轉進來後渲染資料 */
function fetchData(){
    // 抓取跳轉過來的網址 id
    let id = window.location.href.split("/");
    id = id[id.length - 1];

    // fetch 後端 api 取回對應 id 景點資料
    let url = `/api/attraction/${id}`;
    fetch(url).then(function(response){
        return response.json();
    }).then(function(data){
        /* 陽明山國家公園無捷運站 */
        if(data.data.mrt == null ){
            data.data.mrt = "nomrt"
        };
        /* 將接回的資料渲染到前端畫面 */
        title.textContent = data.data.name;
        Name.textContent = data.data.name;
        categoryMrt.textContent = `${data.data.category} at ${data.data.mrt}`;
        description.textContent = data.data.description;
        address.textContent = data.data.address;
        transport.textContent = data.data.transport;
        let picContainer = document.querySelector("#pic-container");

        /* 每張照片賦予編號，與 slide 下方點點(dot)成對 */
        let imgNum = 0; 

        // 將圖片依序放進 slide 容器中
        for(imgUrl of data.data.images){
            /* img.src */
            let img = document.createElement("img");    
            img.src = imgUrl;
            img.setAttribute("id", `img-id${imgNum}`);

            /* set img's pair value */
            img.value = imgNum;
            
            /* append Img into pic-container */
            picContainer.appendChild(img);

            /* create dot and append in dots */
            let dot = document.createElement("div");
            dot.setAttribute("class", "dot");

            /* set dot's pair value */
            dot.value = imgNum;

            /* set id{imgNum} on dot for changing background-color */
            dot.setAttribute("id", `dot-id${imgNum}`)

            /* dot onclick and switching pairedImg */
            dot.addEventListener("click", function (){
                /* container have 2 more imgs, previous and next btns' imgs. */
                let pairImg = document.querySelectorAll(`div#pic-container img`)

                /* So we need to plus 2 to get the right order in pairImg container */
                let num = this.value + 2;
            
                /* hidden the img playing on the pic-container */
                for(img of pairImg){
                    console.log(img.style.display);
                    if(img.style.display === "block"){
                        img.style.display = "none";
                        /* 圖片對應的 dot，將其背景顏色改變 */
                        let dotWhere = document.querySelector(`#dot-id${img.value}`);
                        dotWhere.style.backgroundColor = "#FFFFFF";
                        console.log(dotWhere);
                    };
                };

                /* change the background-color of dot we clicked */
                this.style.backgroundColor = "#000000";

                /* Show the clicked dot paired img */
                pairImg[num].style.display = "block";
            });
            dots.appendChild(dot);
            /* 第一張圖片(編號'0')預設'黑色'，點點預設'黑色' */
            if(imgNum == 0){
                img.style.display = "block";
                dot.style.backgroundColor = "#000000";
            }else{
                img.style.display = "none";
            };
            imgNum ++;
        };
    })
};



/* 轉換花費 */
function changeRadioCharge(radioBtn){
    /* radioBtn 會回傳div */
    const chargeBoxOnHtml = document.querySelector("#chargeBox");
    const charge = radioBtn.value;
    chargeBoxOnHtml.textContent = charge;
}

fetchData();