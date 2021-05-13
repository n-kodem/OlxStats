const xPadding = 30;
const yPadding = 30;
let prices = [];
let amplitude;
let maxPrice;
let minPrice;
let lastNumOfRanges=0;
let lastUrl = location.href;

// Object to observe and react to changes in the URL
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        onUrlChange();
    }
}).observe(document, {subtree: true, childList: true});


function loadGraph(data){
    let i;
    let graph;

    // Returns the max Y value in our data list
    function getMaxY() {
        let max = 0;

        for(let i = 0; i < data.values.length; i ++) {
            if(data.values[i].Y > max) {
                max = data.values[i].Y;
            }
        }
        max += 10 - max % 10;
        return max+5;
    }

    // Return the x pixel for a graph point
    function getXPixel(val) {
        return ((graph.width - xPadding) / data.values.length) * val + (xPadding * 1.5);
    }

    // Return the y pixel for a graph point
    function getYPixel(val) {
        return graph.height - (((graph.height - yPadding) / getMaxY()) * val) - yPadding;
    }

    graph = document.getElementById("graph");
    let c = document.getElementById("graph").getContext('2d');
    c.clearRect(0,0,graph.width,graph.height);
    c.lineWidth = 2;
    c.strokeStyle = '#6763db';
    c.font = 'italic 9pt sans-serif';
    c.fillStyle= "#9c9bc6";
    c.textAlign = "center";
    // Draw the axises
    c.beginPath();
    c.moveTo(xPadding-10, 0);
    c.lineTo(xPadding-10, graph.height - yPadding);
    c.lineTo(graph.width-10, graph.height - yPadding);
    c.stroke();
    // Draw the X value texts
    for(i = 0; i < data.values.length; i ++) {
        c.fillText(data.values[i].X, getXPixel(i), graph.height - yPadding + 20);
    }

    // Draw the Y value texts
    c.textAlign = "right";
    c.textBaseline = "middle";
    let jumpVal = 5;
    for(i = 0; i < getMaxY(); i += jumpVal) {
        c.fillText(i+" -", xPadding-10, getYPixel(i));
    }


    // Draw the line graph
    c.strokeStyle = '#247dc6';
    c.beginPath();
    c.moveTo(getXPixel(0), getYPixel(data.values[0].Y));
    for(i = 1; i < data.values.length; i ++) {
        c.lineTo(getXPixel(i), getYPixel(data.values[i].Y));
    }
    c.stroke();

    // Draw the dots
    for(i = 0; i < data.values.length; i ++) {
        c.fillStyle= "#5c09d7";
        c.font = "20px Arial";
        c.beginPath();
        c.arc(getXPixel(i), getYPixel(data.values[i].Y), 4, 0, Math.PI * 2, true);
        c.fillText(data.values[i].Y+" ", getXPixel(i)+11, getYPixel(data.values[i].Y)-15);
        c.fill();
    }
    console.log("Graph should be loaded.");
}

// Function to load a graph based on user data
function loadGraphFromData(parameters) {
    let parInData = {values: []};
    for (let parIndex=0;parIndex<parameters.length;parIndex+=2){
        parInData.values.push({X:`${parameters[parIndex].value} - ${parameters[parIndex+1].value}`,Y:0})
        for (let price=0;price<prices.length;price+=1) {
            if (prices[price] >= parameters[parIndex].value && prices[price] <= parameters[parIndex+1].value) {
                parInData.values[parIndex/2].Y += 1;
            }
        }
    }
    return parInData;
}
// Function which returns data in a form understandable for the loadGraph function
function generateData() {
    let data = {values: []}
    // Pushing values to data
    data.values.push({X: `${minPrice} - ${Math.round(amplitude / 6)}`, Y: 0});
    data.values.push({X: `${Math.round(amplitude / 6)} - ${Math.round((amplitude / 6) * 2)}`, Y: 0});
    data.values.push({X: `${Math.round((amplitude / 6) * 2)} - ${Math.round((amplitude / 6) * 3)}`, Y: 0});
    data.values.push({X: `${Math.round((amplitude / 6) * 3)} - ${Math.round((amplitude / 6) * 4)}`, Y: 0});
    data.values.push({X: `${Math.round((amplitude / 6) * 4)} - ${Math.round((amplitude / 6) * 5)}`, Y: 0});
    data.values.push({X: `${Math.round((amplitude / 6) * 5)} - ${maxPrice}`, Y: 0});

    for (let price of prices) {
        if (price >= minPrice && price <= Math.round((amplitude) / 6)) {
            data.values[0].Y += 1;
        } else if (price > Math.round((amplitude) / 6) && price <= Math.round((amplitude / 6) * 2)) {
            data.values[1].Y += 1;
        } else if (price > Math.round((amplitude / 6) * 2) && price <= Math.round((amplitude / 6) * 3)) {
            data.values[2].Y += 1;
        } else if (price > Math.round((amplitude / 6) * 3) && price <= Math.round((amplitude / 6) * 4)) {
            data.values[3].Y += 1;
        } else if (price > Math.round((amplitude / 6) * 4) && price <= Math.round((amplitude / 6) * 5)) {
            data.values[4].Y += 1;
        } else if (price > Math.round((amplitude / 6) * 5) && price <= maxPrice) {
            data.values[5].Y += 1;
        }
    }
    return data;
}
// Function that changes the number of containers and its children based on the given parameter and its previous value
function generateRanges(rangesNumber) {
        if(lastNumOfRanges<rangesNumber){
            for (let i = 0; i<rangesNumber-lastNumOfRanges;i+=1){
                document.getElementById("rangesContainerContainer").insertAdjacentHTML('beforeend',`
                <div class="rangesContainer">
                    <input class="ranges" type="number" min="0" value="0">
                    <input class="ranges" type="number" min="0" value="1">
               </div>
                `)
            }
        }
        else{
            for (let i = 0; i<lastNumOfRanges-rangesNumber;i+=1){
                document.getElementsByClassName("rangesContainer")[document.getElementsByClassName("rangesContainer").length-1].remove();
            }
        }
    lastNumOfRanges=rangesNumber;
}
// Function to reset values of all ranges in ranges Containers
function resetValues() {
    Array.prototype.forEach.call( document.getElementsByClassName("ranges"), function(item,index) {
        (index %2===0) ? item.value=0 :item.value=1;
    });
}
// Main function used to load content into the page
function loadContent (){
    // For loop used to get all prizes to array
    for (let i = 2; i < document.getElementsByClassName("price").length; i++) {
        let prize = Number(document.getElementsByClassName("price").item(i).innerText.replace(/,/g, '.').match(/[+]?\d+(\.\d+)?/g).join(""));
        if (prize != null) {
            prices.push(prize);
        }
    }
    // Getting Minimal Price, Maximal Price and Amplitude
    amplitude = Math.max.apply(Math, prices) - Math.min.apply(Math, prices);
    maxPrice = Math.max.apply(Math, prices);
    minPrice = Math.min.apply(Math, prices);
    // Creating HTML content
    let dataDiv = document.createElement('div');
    dataDiv.id = 'block';
    dataDiv.innerHTML = `
    <div id="titleContainer"><h1 style="color: #23e5db; padding: 5px; top: 5%;">ANALIZA</h1></div>
    <div id="mainDataContainer">
        <text id="MinVal">Minimalna cena: ${minPrice} zł</text><br>
        <text id="MaxVal">Maksymalna cena: ${maxPrice} zł</text><br>
        <text id="Amplitude">Amplituda: ${amplitude} zł</text><br>
    </div>
    <br>
    <div id="graphContainer">
        <canvas id="graph" width="590" height="300">
        </canvas>
    </div>
    <div id="dataChangeContainer">
        <div id="operatorsContainer">
            <button class="operatorBtn" id="doItBtn">Wyznacz przedziały</button>
            <button class="operatorBtn" id="resetBtn">Resetuj</button>
            <button class="operatorBtn" id="resetValBtn">Resetuj Wartości</button>
            <input class="operatorBtn" id="rangesNumberInput" type="number" min="2" max="100" value="4">
        </div>
        <div id="rangesContainerContainer"></div>
    </div>
    `;

    // Applying HTML content
    document.getElementsByTagName('body')[0].appendChild(dataDiv);

    // Adding corresponding functions to the buttons
    document.getElementById("doItBtn").onclick=function(){loadGraph(loadGraphFromData(document.getElementsByClassName('ranges')))};
    document.getElementById("resetBtn").onclick=function(){loadGraph(generateData())};
    document.getElementById("resetValBtn").onclick=function(){resetValues()};

    // Making the generateRanges function work after any change in the value of an element
    document.getElementById("rangesNumberInput").onchange=function(){generateRanges(this.value)};
    document.getElementById("rangesNumberInput").onkeypress=function(){this.onchange()};
    document.getElementById("rangesNumberInput").onpaste=function(){this.onchange()};
    document.getElementById("rangesNumberInput").oninput=function(){this.onchange()};
    generateRanges(document.getElementById("rangesNumberInput").value);

    // Creating css
    const css = `
        #block{
            display:flex;
            flex-wrap:wrap;
            align-items:center;
            position:fixed;
            width:600px;
            min-height:650px;
            max-height:1050px;
            background: #002f34;
            color: white;
            left:-575px;
            top:20%;
            border-radius: 0 15px 15px 0;
            z-index:15;
            transition: left 0.35s ease, border-radius 0.25s linear;
            text-align:center;
        }
        #block:hover{
            left:0;
            border-radius:0;
        }
        #titleContainer{
            width:100%;
            text-align: center;
            align-items:center;
            position:absolute;
            top:1%;
        }
        #mainDataContainer{
            position:absolute;
            background: #f2f4f5;
            color: #002f34;
            width: 80%;
            left: 10%;
            top:10%;
            border-radius: 15px;
            transition: border-radius 0.25s linear;
            line-height:25px;
        }
        #mainDataContainer:hover{
            border-radius: 0;
        }
        #graphContainer{
            background: #f2f4f5;
            width:590px;
            height:300px;
            top: 25%;
            position:absolute;
            left:5px;
            border-radius: 15px;
            transition: border-radius 0.25s linear;
        }
        #graphContainer:hover{
            border-radius: 0;
        }
        #graph{
            left:0;
        }
        #dataChangeContainer{
            background: #f2f4f5;
            width:590px;
            min-height:45px;
            top: 72.5%;
            position:absolute;
            left:5px;
            border-radius: 15px;
            transition: border-radius 0.25s linear;
        }
        #operatorsContainer{
            display:flex;
        }
        .operatorBtn{
            width:100%;
            float:auto;
            margin: 5px;
            border-radius:15px;
            transition: border-radius 0.25s linear,border 0.25s linear;
            border: black dashed 1px;
        }
        .operatorBtn:hover{
            border-radius:0;
            border: 1px solid black;
        }
        #rangesContainerContainer{
            display:flex;
            box-sizing:content-box;
            overflow-x:scroll;
            width:100%;
        }
        .rangesContainer{
            display:flex;
            min-width:150px;
            width:100%;
            flex-wrap:wrap;
            align-content:space-between;
            box-sizing: content-box;
            background:#f2f4f5;
            border:solid black 1px;
        }
        .ranges{
            width:100%;
            border-radius:15px;
            transition: border-radius 0.25s linear,border 0.25s linear;
            border: black dashed 1px;
            margin:5px;
            font-size: 20pt;
        }
        .ranges:hover{
            border-radius:0;
            border: black solid 1px;
        }

        #rangesContainerContainer::-webkit-scrollbar {
            width: 15px;
        }
        
        #rangesContainerContainer::-webkit-scrollbar-track {
            border-radius: 0 0 10px 10px;
        }
        
        #rangesContainerContainer::-webkit-scrollbar-thumb {
            background: #0e3d43;
            border-radius: 0 0 10px 10px;
        }
        
        #rangesContainerContainer::-webkit-scrollbar-thumb:hover {
            background: #01292f;
        }
    `;
    // Applying styles. Please if you know a better way to do this let me know
    let style = document.createElement('style');
    if (style.styleSheet) {
        style.styleSheet.cssText = css;
    } else {
        style.appendChild(document.createTextNode(css));
    }
    document.getElementsByTagName('head')[0].appendChild(style);
    // Generating a graph
    loadGraph(generateData());
}
// Firstly function start after load
window.addEventListener("load", loadContent());

// When the page URL changes
function onUrlChange() {
    document.getElementById("block").remove();
    lastNumOfRanges=0;
    prices = [];
    loadContent();
}