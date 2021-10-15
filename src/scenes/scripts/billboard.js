import { editNumber, checkOnline } from "./tools";

// API URL (this one is set to get list of supported coins and market data)
const url =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=cryptocurrency&order=volume_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h";

// Global Variables
var geckoData,
    geckoLoaded;

// headers setting for returning proper format
const options = {
  headers: {
    accept: "application/json",
  },
};

var billboard;

/**
 * Fetch call to Coin Gecko API to get list of supported coins and marked data
 */
async function getGeckoData() {
  await fetch(url, options)
    .then((res) => res.json())
    .then((data) => {
        geckoData = data;
        // console.log(data);
        geckoLoaded = true;
    });
}


/**
 * Iterate through geckoData and return template literals with individual coin data.
 */
function renderGeckoData() {
    const renderedGeckoData = geckoData.map(coin => {
        var editedPrice = editNumber(coin.current_price)
        var editedPercent = editNumber(coin.price_change_percentage_24h);
        
        return (`
        <article class="coinDisplay">
            <div class="coinName">
                <img class="coinDisplay-img" src=${coin.image}/>
                <h3 class="coinDisplay-key">${coin.symbol.toUpperCase()}</h3>
            </div>
            <div class="coinDisplay-data">
                <h3 class="coinDisplay-price">$<span class="priceValue">${editedPrice}</span></h3>
                ${coin.price_change_percentage_24h > 0 ?
                    `<h3 class="coinDisplay-status" id="green"><span class="statusValue">${editedPercent}</span>%<img class="coinDisplay-icon" src="/assets/billboard/upIcon.png"/></h3>`
                    :
                    `<h3 class="coinDisplay-status" id="red"><span class="statusValue">${editedPercent}</span>%<img class="coinDisplay-icon" src="/assets/billboard/downIcon.png"/></h3>`
                }
            </div>      
        </article>
        `)
    }).join('');
    billboard.getChildByID("cgBody").innerHTML = renderedGeckoData;
}

/**
 * Creates Dom Element in gameScene and gets data
 * @param {Phaser.Scene} scene 
 */
function createBillboard(scene) {
  billboard = scene.add
    .dom(35, 1990)
    .createFromCache("billboard")
    .setDepth(4)
    .addListener("click");
  getGeckoData();

  billboard.on("click", function(event) {
    const cgBody = billboard.getChildByID("cgBody");
    if(event.target.id === "scrollUp") {
      
      cgBody.scroll({
        top: cgBody.scrollTop - 180,
        left: 0,
        behavior: 'smooth'
      })
    }

    if( event.target.id === "scrollDown") {
      cgBody.scroll({
        top: cgBody.scrollTop + 180,
        left: 0,
        behavior: 'smooth'
      })
    }
  })
}

/**
 * If geckoData is loaded, render geckoData
 */
setInterval(() => {
    if(geckoLoaded && checkOnline()) {
        getGeckoData();
        renderGeckoData();
    }
}, 1000);

export { createBillboard };