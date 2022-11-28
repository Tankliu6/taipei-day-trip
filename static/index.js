// isloading for infinite scroll
let isloading = false;

// HTML attractions section
const attractionsContainer = document.querySelector("#grid-attractions-container");

// 預設為 0
var nextPage = [0];

// 存放attractions的 name、mrt、category、images(只要第一個 url)
let attractionsPool = [];

/* 渲染attraction section HTML函式 */
function insertImg(attractionsPool, dataNum){
    /* grid-attractions-item */ 
    let container = document.createElement('div');
    container.setAttribute("id", "grid-attractions-item");

    let wrap = document.createElement('div');
    wrap.setAttribute("id", "wrap-attractions");

    /* img in grid-attractions-item > wrap-attractions*/
    let img = document.createElement('img');
    img.src = attractionsPool[dataNum][3];

    /* mrt & category in grid-attractions-item > wrap-attractions*/
    let attractions_item_mrt = document.createElement('span');
    attractions_item_mrt.setAttribute("id", "attractions-item-mrt");
    attractions_item_mrt.textContent = attractionsPool[dataNum][1];

    let attractions_item_category = document.createElement('span');
    attractions_item_category.setAttribute("id", "attractions-item-category");
    attractions_item_category.textContent = attractionsPool[dataNum][2];

    let mrtCategory = document.createElement('div');
    mrtCategory.setAttribute("id", "attractions-item-mrt_category");

    /* name in grid-attractions-item > wrap-attractions*/
    let name = document.createElement('div');
    name.setAttribute("id", "attractions-item-name");
    name.textContent = attractionsPool[dataNum][0];

    /* render on attractions section */
    /* More than one child, append is a good idea for appendChild once */
    mrtCategory.append(attractions_item_mrt, attractions_item_category);
    wrap.append(img, name, mrtCategory);
    container.appendChild(wrap);
    attractionsContainer.appendChild(container);
};

function categories(){
    /* 打開搜尋分類框 */
    let categories = document.querySelector("#slogan-search-categories")
    categories.style.display = "grid";
    /* 清空搜尋分類框，否則會留存上一次append進來的分類 */
    categories.innerHTML = "";
    /* 開啟分類框的隱形遮罩 */
    let htmlLayer = document.querySelector("#htmlLayer-zindex50");
    htmlLayer.style.display = "block";
    /* fetch 資料並放入資料 */
    fetch("/api/categories")
    .then(function(response){
        return response.json();
    }).then(function(data){
        let datalength = Object.keys(data['data']).length;
        for(let dataNum = 0; dataNum < datalength; dataNum++){
            let categoryItemDiv = document.createElement("div");
            categoryItemDiv.setAttribute("id", "slogan-search-categories-item");
            categoryItemDiv.textContent = data['data'][dataNum];
            // 點擊分類，將文字放入搜尋框中
            categoryItemDiv.addEventListener("click", function (){
                let categoryInputValue = document.querySelector("#slogan-search-bar");
                categoryInputValue.value = this.textContent;
            })
            // 放入關閉分類收尋框功能
            categoryItemDiv.addEventListener("click", layerNone);
            // 將各分類放進分類搜尋框中
            let itemsContainer = document.querySelector("#slogan-search-categories");
            itemsContainer.appendChild(categoryItemDiv); 
        }
    })
};

// function show(this){
//     document.querySelector(this).style.display = "block";
// }

/* 分類搜尋框關閉相關 */
function layerNone(){
    /* 關閉分類框的隱形遮罩 */
    let htmlLayer = document.querySelector("#htmlLayer-zindex50");
    htmlLayer.style.display = "none";
    /* 關閉搜尋分類框 */
    let categories = document.querySelector("#slogan-search-categories")
    categories.style.display = "none";

};

/* 刪除 attractions 中的資料 */
function remove(){
    /* 點擊搜尋btn時排除無法讀取景點資料的可能性 */
    isloading = false; 
    /* 將下一頁歸零 */
    nextPage = [];
    nextPage.push(0);
    console.log("remove's loading Page: "+ nextPage);
    let first = document.querySelector("#grid-attractions-container").firstElementChild
    while (first) {
        first.remove();
        first = document.querySelector("#grid-attractions-container").firstElementChild
    }
    /* 是查無資料後產生的全域變數，注意觸發的先後順序 */
    errorContainerEmptyGrid = document.querySelector("#grid-attractions-container");
    errorContainerEmptyGrid.style.display = "grid";
};


/* 拿取頁面資料*/
function fetchPage(){  
    /* 標記工作階段 */
    if(isloading == false){
        isloading = true;
    }else{
        return
    }
    console.log("fetchPage's loading Page: "+nextPage);
    /* 取得關鍵字搜尋 */
    let keyword = document.querySelector("#slogan-search-bar").value;
    console.log("keyword: " + keyword + "typeof: " + typeof keyword + "keyword-length: " + keyword.length);
    if(keyword.length == 0){
        url = `/api/attractions?page=${nextPage[0]}`
    }else{
        url = `/api/attractions?page=${nextPage[0]}&keyword=${keyword}`
    };
    /* 第一次載入時的 nextPage = 0 */
    fetch(url)
    .then(function(response){
        return response.json(); // 讀取為 JSON 格式
    }).then(function(data){
        /* 如果資料為 [] 代表查無此資料 */
        if(data["data"].length === 0){
            let attractionsContainer = document.querySelector("#grid-attractions-container");
            /* 取消Grid 讓資料能順利排列與置中 */
            errorContainerEmptyGrid = document.querySelector("#grid-attractions-container"); /* 注意是全域變數 */
            errorContainerEmptyGrid.style.display = "block";
            /* 查無此資料 */
            let error_empty =
                `<div id = "error-containerEmpty-grid">
                    <img src="https://i.imgur.com/qIufhof.png" />
                    <h1>
                        <span>Data is not founded</span> <br />
                        Internal server error
                    </h1>

                    <p>We are currently trying to fix the problem.</p>

                </div>`;
            /* 渲染 errorEmpty 到前端畫面 */
            attractionsContainer.insertAdjacentHTML("beforeend", error_empty);
            /* 清空，讓下一頁資料填進來 */
            attractionsPool = [];
        }else{
            /* 替換nextPage (type = var)非 let */
            nextPage = [];
            nextPage.push(data['nextPage']);
            console.log("nextPage: " + nextPage);
            /* 取得該頁有幾筆資料 */
            let datalength = Object.keys(data['data']).length;
            for(let dataNum = 0; dataNum < datalength ;dataNum++){
                attractionsPool.push(
                    [data['data'][dataNum]['name'], 
                    data['data'][dataNum]['mrt'], 
                    data['data'][dataNum]['category'], 
                    data['data'][dataNum]['images'][0]
                ])
            };
            for(dataNum = 0; dataNum < datalength; dataNum++){
                insertImg(attractionsPool, dataNum);
            };
            /* 清空，讓下一頁資料填進來 */
            attractionsPool = [];
            /* 可以繼續下一次的fetch */
            isloading = false
        }
    })
};

/* 無限捲軸 */

/* 創造 Intersection Observer */
let options = {
    root: null,
    rootMargin: "0px",
    threshold: 1,
};

/* callback 函式 */
let callback = (entries, observer) => {
    entries.forEach((entry) => {
        if(entry.isIntersecting && isloading == false){
            console.log(entry.isIntersecting);
            console.log(isloading);
            console.log(observer);
            fetchPage();
        }
    })
}

/* 創建一個 observer */
let observer = new IntersectionObserver(callback, options);

/* 觀察 target */
let target = document.querySelector('footer');
observer.observe(target);
