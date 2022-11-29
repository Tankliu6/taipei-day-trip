/* 全域變數 */
const heroSection = document.querySelector("#hero-section-container-grid");
const Name = document.querySelector("#name");
const categoryMrt = document.querySelector("#category-mrt");
const description = document.querySelector("#description");
const address = document.querySelector("#address");
const transport = document.querySelector("#transport");
const dots = document.querySelector("#dots");

/* 向左按鈕 */
function previous(){

};

/* 向右按鈕 */
function next(){

};

/* 網頁跳轉進來後渲染資料 */
function fetchData(){
    // 抓取跳轉過來的 id
    let id = window.location.href.split("/");
    id = id[id.length - 1];
    // fetch 後端 api 取回對應 id 景點資料
    let url = `/api/attraction/${id}`;
    fetch(url).then(function(response){
        return response.json();
    }).then(function(data){
        Name.textContent = data.data.name;
        categoryMrt.textContent = data.data.category + "&" + data.data.mrt;
        description.textContent = data.data.description;
        address.textContent = data.data.address;
        transport.textContent = data.data.transport;
        let picContainer = document.querySelector("#pic-container");
        let imgNum = 0; /* 幫每張照片編號，與slide下方點點成對 */
        // 將圖片依序放進 slide 容器中
        for(imgUrl of data.data.images){
            /* img */
            let img = document.createElement("img");    
            img.src = imgUrl;

            /* give the pair value to dot */
            img.value = imgNum;
        
            picContainer.appendChild(img);

            /* create dot and append in dots */
            let dot = document.createElement("div");
            dot.setAttribute("class", "dot");

            /* give the pair value to img */
            dot.value = imgNum;
            dot.setAttribute("id", `${imgNum}`)

            /* dot onclick and switching to pairedImg */
            dot.addEventListener("click", function (){
                /* container have 2 more img, previous and next btn */
                let pairImg = document.querySelectorAll(`div#pic-container img`)

                /* So we need to plus 2 to get the right order in img container */
                let num = this.value + 2;
            
                /* hidden the img playing on the pic-container */
                for(img of pairImg){
                    console.log(img.style.display);
                    if(img.style.display === "block"){
                        img.style.display = "none";
                        /* 要去抓到關閉的dot所在位置，將其背景顏色改變 */
                        let dotWhere = document.querySelector(`#dots div.${img.value}`);
                        console.log(dotWhere);
                    };
                };

                /* Show the clicked dot paired img */
                pairImg[num].style.display = "block";
            });
            dots.appendChild(dot);
            if(imgNum == 0){
                img.style.display = "block";
            }else{
                img.style.display = "none";
            };
            imgNum ++;
        };
        /* 算slide容器中圖片數量 */
        let picContainerLength = picContainer.getElementsByTagName("img").length;

    })
};



/* 轉換花費 */
function changeRadioCharge(radioBtn){
    /* radioBtn 會回傳div */
    console.log(radioBtn.value);
    const chargeBoxOnHtml = document.querySelector("#chargeBox");
    const charge = radioBtn.value;
    chargeBoxOnHtml.textContent = charge;
}
