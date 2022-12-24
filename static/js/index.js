// isloading for infinite scroll
let isloading = false;

// htmlLayer for closing category-search-bar & login-and-signup-interface
const htmlLayer = document.querySelector("#htmlLayer-zindex50");

// HTML attractions section
const attractionsContainer = document.querySelector("#grid-attractions-container");

// 預設為 0
let nextPage = 0;

/* 渲染attraction section HTML函式 */
function renderAttractionsOnPage(attraction){
    /* grid-attractions-item */ 
    const container = document.createElement('div');
    container.setAttribute("id", "grid-attractions-item");

    const wrap = document.createElement('div');
    wrap.setAttribute("id", "wrap-attractions");

    /* img in grid-attractions-item > wrap-attractions*/
    const img = document.createElement('img');
    img.src = attraction.images[0];

    /* mrt & category in grid-attractions-item > wrap-attractions*/
    const attractions_item_mrt = document.createElement('span');
    attractions_item_mrt.setAttribute("id", "attractions-item-mrt");
    attractions_item_mrt.textContent = attraction.mrt;

    const attractions_item_category = document.createElement('span');
    attractions_item_category.setAttribute("id", "attractions-item-category");
    attractions_item_category.textContent = attraction.category;

    const mrtCategory = document.createElement('div');
    mrtCategory.setAttribute("id", "attractions-item-mrt_category");

    /* name in grid-attractions-item > wrap-attractions*/
    const name = document.createElement('div');
    name.setAttribute("id", "attractions-item-name");
    name.textContent = attraction.name;

    /* 最外層包裹一層 <a> 讓景點圖片能跳轉至該景點*/
    const attractionRedirectHref = document.createElement("a");
    attractionRedirectHref.setAttribute("id", "attraction-a-redirect");
    attractionRedirectHref.setAttribute("href", `${window.location.origin}/attraction/${attraction.id}`)

    /* render on attractions section */
    /* More than one child, append is a good idea for appendChild once */
    mrtCategory.append(attractions_item_mrt, attractions_item_category);
    wrap.append(img, name, mrtCategory);
    container.appendChild(wrap);
    attractionRedirectHref.appendChild(container);
    attractionsContainer.appendChild(attractionRedirectHref);
};

/* 渲染分類搜尋框 */
function categories(){
    /* 打開搜尋分類框 */
    const categories = document.querySelector("#slogan-search-categories")
    categories.style.display = "grid";
    /* 清空搜尋分類框，否則會留存上一次append進來的分類 */
    categories.innerHTML = "";
    /* 開啟分類框的隱形遮罩 */
    const htmlLayer = document.querySelector("#htmlLayer-zindex50");
    htmlLayer.style.display = "block";
    /* fetch 資料並放入資料 */
    fetch("/api/categories")
    .then(function(response){
        return response.json();
    })
    .then(function(data){
        console.log(data)
        const categories = data.data;
        categories.forEach(category => {
            const categoryItemDiv = document.createElement("div");
            categoryItemDiv.setAttribute("id", "slogan-search-categories-item");
            categoryItemDiv.textContent = category;
            // 點擊分類，將文字放入搜尋框中
            categoryItemDiv.addEventListener("click", function (){
            const categoryInputValue = document.querySelector("#slogan-search-bar");
            categoryInputValue.value = this.textContent;
            });
            // 放入關閉分類收尋框功能
            categoryItemDiv.addEventListener("click", clearCategories);
            // 將各分類放進分類搜尋框中
            const itemsContainer = document.querySelector("#slogan-search-categories");
            itemsContainer.appendChild(categoryItemDiv); 
            }
        )
    })
};

/* 關閉分類搜尋框及下方 htmlLayer */
function clearCategories(){
    /* 關閉分類框的隱形遮罩 */
    htmlLayer.style.display = "none";
    /* 關閉搜尋分類框 */
    const categories = document.querySelector("#slogan-search-categories")
    categories.style.display = "none";
};

/* 刪除 attractions 中的資料 */
function remove(){
    /* 關閉查無搜尋的頁面 */
    const keywordNotFoundPage = document.querySelector("#error-containerEmpty-grid");
    keywordNotFoundPage.style.display = "none";
    /* 點擊搜尋btn時排除無法讀取景點資料的可能性 */
    isloading = false; 
    /* 將下一頁歸零 */
    nextPage = 0;
    let first = document.querySelector("#grid-attractions-container").firstElementChild;
    while (first) {
        first.remove();
        first = document.querySelector("#grid-attractions-container").firstElementChild
    };
};

/* 拿取一般頁面資料*/
function fetchPage(){
    const keywordNotFoundPage = document.querySelector("#error-containerEmpty-grid");
    keywordNotFoundPage.style.display = "none";  
    /* 標記工作階段 */
    if(isloading == false){
        isloading = true;
    }else{
        return
    }
    let responseStatus;
    /* 取得關鍵字搜尋 */
    const keyword = document.querySelector("#slogan-search-bar").value;
    let url;
    if(!keyword){
        url = `/api/attractions?page=${nextPage}`
    }else{
        url = `/api/attractions?page=${nextPage}&keyword=${keyword}`
    }
    /* 第一次載入時的 nextPage = 0 */
    fetch(url)
    .then(function(response){
        responseStatus = response.status;
        return response.json(); // 讀取為 JSON 格式
    }).then(function(data){
        /* 關鍵字查詢無資料時的回應，還需要優化 */
        if(keyword && !data.data){
            const keywordWantToFind = document.querySelector(".keywordWantToFind");
            keywordWantToFind.textContent = keyword;
            keywordNotFoundPage.style.display = "block";
        }else{
            /* 替換nextPage */
            nextPage = data.nextPage;
            /* 取得該頁有幾筆資料 */
            const attractions = data.data
            attractions.forEach(attraction => {
                renderAttractionsOnPage(attraction)
            });
            /* 可以繼續下一次的fetch */
            isloading = false
        }
    })
};

/* 無限捲軸 */

/* 創造 Intersection Observer */
const options = {
    threshold: [0, 0.2, 0.4, 0.6, 0.8, 1]
};

/* callback 函式 */
const callback = (entries) => {
    entries.forEach(entry => {
        if(nextPage != null && !isloading){
            observer.observe(target);
            fetchPage();
        }else if(nextPage === null){
            observer.unobserve(target);
        }
    });
};

/* 創建一個 observer */
const observer = new IntersectionObserver(callback, options);

/* 觀察 target */
const target = document.querySelector('footer');
observer.observe(target);

/* 載入時觸發 */
htmlLayer.addEventListener("click", clearCategories);