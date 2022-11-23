// HTML attractions section
const attractionsContainer = document.querySelector("#grid-attractions-container");

// 預設為 0
var nextPage = 0

// 存放attractions的 name、mrt、category、images(只要第一個 url)
let attractionsPool = [];

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
}


function getPage(){
    /* 第一次載入時的 nextPage = 0 */
    fetch(`/api/attractions?page=${nextPage}`)
    .then(function(response){
        return response.json(); // 讀取為 JSON 格式
    }).then(function(data){
        /* 替換nextPage (type = var)非 let */
        nextPage = data['nextPage'];
        /* 取得該頁有幾筆資料 */
        let datalength = Object.keys(data['data']).length;
        for(let dataNum = 0; dataNum < datalength ;dataNum++){
            attractionsPool.push(
                [data['data'][dataNum]['name'], 
                data['data'][dataNum]['mrt'], 
                data['data'][dataNum]['category'], 
                data['data'][dataNum]['images'][0]
            ])
        }
        for(dataNum = 0; dataNum < datalength; dataNum++){
            insertImg(attractionsPool, dataNum);
        }
        /* 清空，讓下一頁資料填進來 */
        attractionsPool = []
    })
}