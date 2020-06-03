/// @file M_customerMainPage.js
/// @namespace
/// Module for data processing

/// Create a prototype function for string to beable to use a has function
String.prototype.hashCode = function() 
{    
    var hash = 0, i, chr, len;

    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    
    return hash;
};


//--------- Define a systemEnvironment from passing argument---------------
userCredential = 'pub' + getCredential(sessionStorage.getItem('pub_uname'));
evString = localStorage.getItem(userCredential);

if(evString != null)
{
    // User Environment Exist
    systemEnvironment = JSON.parse(evString);
}
else
{
    // USer Environment Does Not Exist, create a new one
    systemEnvironment = {
    "username": sessionStorage.getItem('pub_uname'),
    "password": sessionStorage.getItem('pub_pword'),
    "theme":    "dark",
    "language": "en",
    "shortCut0": undefined,
    "shortCut1": undefined,
    "shortCut2": undefined,
    "shortCut3": undefined,
    "shortCut4": undefined,
    "orderList": undefined
    };
}
setTheme(systemEnvironment.theme);
//----------------------------------------------------------------------------


/*
/// by pass authentication. Enable when the database is too slow
sessionStorage.setItem('pub_uname','anddar');
sessionStorage.setItem('pub_pword','anddar');
*/

/// Global Variables
var orderItemList;
var orderCommandList;
var redoCommand;
var outOfStockItems;
var systemEnvironment;
var userCredential;
var beerlist = [];
var currentCategory = 0;

/// This function is called when the whole code has been loaded
window.onload = function ()  
{
    // Check that the system has passed username and password or not
    if(!hasCredential())
    {
        alert("Unauthorized Access!");
        location.href = '../logintest.html';
    }

    // Start the timer
    countdown('countdown');
    // Store order that print on the bill, the amount can be greather than 1
    orderItemList = [];
    // Store command that user click, the amount always = 1
    orderCommandList = [];
    // Empty redo command
    redoCommand = undefined;
    initialize();
}

/// Check that the passing session data contain username and password or not
function hasCredential(){
    if(sessionStorage.getItem('pub_uname') != null && 
       sessionStorage.getItem('pub_pword') != null)
        return true;    
    return false;
}

/// Save the data environment before before the page close
window.onunload = window.onbeforeunload = function() {
    saveEnvironment();
};

/// This function will initialize the page components
function initialize()
{   
    // set up events for shortcuts so that they change icons appropriately
    var shortcuts = document.getElementsByClassName("shortCut");
    for (var i = 0; i < shortcuts.length; i++) {
        shortcuts[i].addEventListener("dragleave", dragLeave, false);
    }
    
    // load all drink as default
    categories();
    loadAllDrinks();
    load_favorites();
    toggleButtons();
    // enableAutoLogout();

    // Add credit section
    getCredit();
    getPurchaseHistroy();
    // End section

    // Just a trick for resetting the favorites
    window.addEventListener("keydown", function(event) {
        if (event.key !== undefined && event.keyCode == 37) {
            for (var i = 0; i<5;i++) {
                localStorage.removeItem('fav'+i);
            }
        }
    });
    
    // sets theme again now when page is loaded to fix button highlighting etc.
    changeTheme(systemEnvironment.theme);

    // If the system environment exist, restore the user environment
    if(evString != null)
       restoreEnvironment();
}

/// Refresh the visible drink list as soon as the user changes category
function categories() {
    document.getElementById("cat").addEventListener("change", function(event) {
        currentCategory = document.getElementById("cat").value;
        if (document.getElementById("searchText").value == "") loadAllDrinks();
        else loadAllDrinks(document.getElementById("searchText").value.trim());
    });
}

/// Restore environment from the saved data
function restoreEnvironment()
{
    // reset passsword evertime
    systemEnvironment.password = sessionStorage.getItem('pub_pword');
    
    // en is a default language
    if(systemEnvironment.language == "sv")
        changeLanguage(systemEnvironment.language);
    
    orderItemList = systemEnvironment.orderList;
    drawOrderList();
}

/// Save the user environment
function saveEnvironment()
{
    systemEnvironment.orderList = orderItemList;
    localStorage.setItem(userCredential ,JSON.stringify(systemEnvironment));
}

/// Get credential name by hasing username with salt
function getCredential(uname)
{
    return (uname + 'pub').hashCode();
}

/// Reset the order data
function resetAll()
{
    // Settting
    orderItemList = [];
    orderCommandList = [];
    redoCommand = undefined;

    // Updating
    drawOrderList();
}

/// Class for hold the beer information
function OrderItem(id, name, price, amount)
{
    this.itemId = id,
    this.itemName = name,
    this.itemPrice = price,
    this.itemAmount = amount
};

/// Update the displaying button to conform with the data in the orderList
function toggleButtons()
{
    if(orderCommandList.length == 0)
        document.getElementById("undoButton").style.visibility = "hidden";
    else
        document.getElementById("undoButton").style.visibility = "visible";
    
    if(orderItemList.length == 0)
    {
        document.getElementById("finishButton").style.visibility = "hidden";
        document.getElementById("clearBill").style.visibility = "hidden";
    }
    else
    {
        document.getElementById("finishButton").style.visibility = "visible";
        document.getElementById("clearBill").style.visibility = "visible";
    }
    
    if(redoCommand == undefined)
        document.getElementById("redoButton").style.visibility = "hidden";
    else
        document.getElementById("redoButton").style.visibility = "visible";
}


/// This snippet is from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
/// Returns a random integer between min (included) and max (excluded)
/// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

/// Initialize category system
function getCategory() {
    var categories = {};
    
    for (var i = 0; i < beerlist.length-1 ; i++) {
        var request2 = "http://pub.jamaica-inn.net/fpdb/api.php?username=aamsta&password=aamsta&action=beer_data_get&beer_id=" + beerlist[i].beer_id;
    
        // do the request
        asyncAjax(request2, gotCategory);
    }
};

/// Call the request to the server
function asyncAjax(url, callback) {
    var httpRequest = new XMLHttpRequest();
    
    httpRequest.onreadystatechange = callback;
    httpRequest.open('GET', url);
    httpRequest.send();    
}

/// Ajax result with category comes in
function gotCategory(req) {
    if (req.target.readyState === 4) {
        if (req.target.status === 200) {
            if(typeof(req.target.responsetext) == 'undefined') {
                return;
            }
            
            var parseResult2 = JSON.parse(req.target.responsetext);
            var beerdata = parseResult2['payload'];
            
            if (beerdata.length != 1) {
                return;
            }
            
            categories[beerdata[0].varugrupp] = beerdata[0].varugrupp;
            var beer_cat = beerdata[0].varugrupp.toLowerCase();

            if (beer_cat.indexOf('alkohol') > 0) {
                beerlist[i].category = 1;
            }
            else if (beer_cat.indexOf('öl') > 0) {
                beerlist[i].category = 2;
            }
            else if (beer_cat.indexOf('vin') > 0) {
                beerlist[i].category = 3;
            }
            else if (beer_cat.indexOf('cider') > 0) {
                beerlist[i].category = 4;
            }
            else   if (beer_cat.indexOf('blanddryck') > 0) {
                beerlist[i].category = 5;
            }

            localStorage.setItem('beerlist', JSON.stringify(beerlist));
        }
    }
}

/// Load all drink with search condition
/// @param searchCondition is a string that will match with the beer item
function loadAllDrinks(searchCondition)
{
    var request = "http://pub.jamaica-inn.net/fpdb/api.php?username=" + "jorass" + "&password=" + "jorass"+ "&action=inventory_get";
    var data;

     if (localStorage.getItem("beerlist")) {
        data = JSON.parse(localStorage.getItem("beerlist"));
        beerlist = data;
    } else {
        result = httpGet(request);
        var parseResult = JSON.parse(result);
        data = parseResult['payload'];
        beerlist = data;

        for(var i = 0; i < data.length; i++) {
            beerlist[i].category = getRandomInt(1,6);
         }
        getCategory();
        localStorage.setItem('beerlist', JSON.stringify(beerlist));
    }
    
    var dynamicArea = document.getElementById("dynamicArea");
    dynamicArea.innerHTML = "";
    outOfStockItems = [];
    var categories = [];

    for(var i = 0; i < data.length; i++)
    {
        if(data[i].namn.length == 0)
            continue;
        
        //// start search condition area
        if(searchCondition != undefined)
            if(data[i].namn.toLowerCase().indexOf(searchCondition) == -1 && data[i].namn2.toLowerCase().indexOf(searchCondition) == -1)
                continue;
        //// end search condition area

        // Skip drinks that don't match the category chosen by the user
        if(currentCategory != 0 && currentCategory != beerlist[i].category) { // Category 0 is 'Show all'
            continue;
        }
        // main div that hold everything
        var node = document.createElement("div");
        node.setAttribute("name",data[i].beer_id);
        node.setAttribute("draggable", "true");
        node.setAttribute("ondragstart","drag(event," + data[i].beer_id + ",'" + (data[i].namn + data[i].namn2).replace("'","") + "'," + data[i].sbl_price +")");
        
        // Greyout
        if(data[i].count < 1)
        {
            node.setAttribute("class","listItem EmptyItem");
            outOfStockItems.push(data[i].beer_id);
        }
        else
            node.setAttribute("class","listItem");
        
        var section = document.createElement("section");        
        var drinkImg = document.createElement("img");
        
        drinkImg.src = "beeritem.png";
        drinkImg.alt = (data[i].namn + data[i].namn2).replace("'","");
        
        var drinkName = document.createElement("p");
        drinkName.innerHTML = data[i].namn + data[i].namn2;
        
        var drinkPrice = document.createElement("p");
        drinkPrice.innerHTML = data[i].sbl_price + "kr";
        
        node.appendChild(drinkImg);
        section.appendChild(drinkName);
        section.appendChild(drinkPrice);
        node.appendChild(section);
        
        var clickableNode = document.createElement("a");
        if(data[i].count > 0)
            clickableNode.setAttribute("onclick", "addItemToOrder(" + data[i].beer_id + ", '" + drinkName.innerHTML.replace("'","") + "'," + data[i].sbl_price + ")");
        clickableNode.appendChild(node);
        dynamicArea.appendChild(clickableNode);
    }

    localStorage.setItem('beerlist', JSON.stringify(data));    
}

/// Draw the item that has been ordered
function drawOrderList()
{
    var itemsList = document.getElementById("orderList");
    // remove every child
    itemsList.innerHTML = "";
    
    var totalCost = 0;
    for(var i = 0; i < orderItemList.length; i++)
    {
        var tmpNode = document.createElement("p");
        var itemIdentity = document.createElement("span");
        itemIdentity.innerHTML = "<span class=\"neonButton\" onclick=\"addItemToOrder(" + orderItemList[i].itemId + ",'" + orderItemList[i].itemName + "'," + orderItemList[i].itemPrice + ",-1)\">&#9986;</span>" + orderItemList[i].itemName.substring(0,11) + " x " + orderItemList[i].itemAmount;
        itemIdentity.setAttribute("class", "identityLeft");
        var itemCost = document.createElement("span");
        var total = (orderItemList[i].itemAmount * orderItemList[i].itemPrice);
        itemCost.innerHTML = total.toFixed(2);
        totalCost += total;
        itemCost.setAttribute("class","identityRight");
        tmpNode.appendChild(itemIdentity);
        tmpNode.appendChild(itemCost);
        itemsList.appendChild(tmpNode);
    }
    document.getElementById("totalCost").innerHTML = totalCost.toFixed(2) + " kr"; 
    toggleButtons();
}

/// A function that get a data from server
function httpGet(theUrl)
{
    // safety net. Not supposed to be here.
    /*
    if (theUrl.indexOf("inventory_get") != -1) return getOfflineResponse();
    */
        
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false );
    xmlHttp.send( null );
    return xmlHttp.responseText;
}

/// getElement with the specific attribute. For internationalization
/// @param input is a string for data-locale attribute
function getAllElementsWithAttribute(input)
{
    var matchingElements = [];
    var allElements = document.getElementsByTagName('*');
    for (var i = 0, n = allElements.length; i < n; i++)
    {
        if (allElements[i].getAttribute(input) !== null)
            matchingElements.push(allElements[i]);
    }
    return matchingElements;
}

/// Change theme
/// @param theme is a string parameter that determine which language to change to
function changeTheme(theme)
{
    if(theme != "dark" && theme != "white")
    {
        console.log("Detecting unaccpeted theme pack: " + theme);   
        return;
    }
    
    systemEnvironment.theme = theme;
    
    setTheme(theme);
    
    if(systemEnvironment.theme == "dark")
    {
        document.getElementById("logo").src = "../img/logo2.png";
        document.getElementById("darkTheme").setAttribute("class", "selectedImage imageButton");
        document.getElementById("whiteTheme").setAttribute("class", "imageButton");
    }
    else if(systemEnvironment.theme == "white")
    {
        document.getElementById("logo").src = "../img/logo3.png";
        document.getElementById("darkTheme").setAttribute("class", "imageButton");
        document.getElementById("whiteTheme").setAttribute("class", "selectedImage imageButton");
    }    
}

/// Disable style sheet when change to another theme to make sure that its work
/// @param theme is a string text of the theme
function setTheme(theme) {
    if (theme == "dark") {
        document.getElementById("darkStylesheet").disabled = false;
        document.getElementById("whiteStylesheet").disabled = true;
    }
    else if (theme == "white") {
        document.getElementById("darkStylesheet").disabled = true;
        document.getElementById("whiteStylesheet").disabled = false;
    }
}

/// logout from the system
function realLogout()
{
    // remove credential
    sessionStorage.removeItem('pub_uname');
    sessionStorage.removeItem('pub_pword');
    
    window.location.href = '../logintest.html';   
}

/// Show view
/// @param is a string parameter that detemine which view to show
function showView(view){
    
    if(view == "menuOption")
    {
        document.getElementById("defocus").style.visibility = 'visible';
        document.getElementById("menuOption").style.visibility = 'visible';
    }
    else if(view == "autoLogoutPopup")
    {
        document.getElementById("autoLogoutPopup").style.visibility = 'visible';
    }
    else if(view == "checkOutPopup")
    {
        document.getElementById("defocus").style.visibility = 'visible';
        document.getElementById("checkOutPopup").style.visibility = 'visible';
    }
    else if(view == "helpPopup")
    {
        document.getElementById("helpPopup").style.visibility = 'visible';
    }
    else if(view == "confirmLogoutPopup")
    {
	   document.getElementById("menuOption").style.visibility = 'hidden';
        document.getElementById("defocus").style.visibility = 'visible';
        document.getElementById("confirmLogoutPopup").style.visibility = 'visible';
    }
    else if(view == "resetTimer")
    {
        document.getElementById("defocus").style.visibility = 'visible';
        document.getElementById("resetTimer").style.visibility = 'visible';
    }
    else if(view == "purchaseTable")
    {
        document.getElementById("purchaseTable").style.visibility = 'visible';
    }
    else if(view == "beerPopup")
    {
        document.getElementById("defocus").style.visibility = 'visible';
        document.getElementById("beerPopup").style.visibility = 'visible';
    }
    else
    {
        // show main page
        document.getElementById("defocus").style.visibility = 'hidden';
        document.getElementById("menuOption").style.visibility = 'hidden';
        document.getElementById("autoLogoutPopup").style.visibility = 'hidden';
        document.getElementById("checkOutPopup").style.visibility = 'hidden';
        document.getElementById("helpPopup").style.visibility = 'hidden';
	document.getElementById("confirmLogoutPopup").style.visibility = 'hidden';
	document.getElementById("resetTimer").style.visibility = 'hidden';
      //added
        document.getElementById("purchaseTable").style.visibility = 'hidden';
        document.getElementById("beerPopup").style.visibility = 'hidden';
        //end added
    }
}

/// Set shortcut
/// @param sourceObj is an object that user drag
/// @param shortCutId is an id of the shortcut that user drop to
function setShortCut(sourceObj, shortCutId)
{
    var convertObj = JSON.parse(sourceObj);
    var shortCutItem = document.getElementById(shortCutId);
    shortCutItem.setAttribute("onclick","addItemToOrder(" + convertObj.itemId + ",'" + convertObj.itemName + "'," + convertObj.itemPrice + ",1)");
    shortCutItem.innerHTML = "<p>" + convertObj.itemName + "</p>";
    shortCutItem.style.borderColor = "rgb(35,31,32)";
}

/// Check that beer is available in the stock or not
/// @param beer_id is an id of the beer
function isNotAvailableForSell(beer_id)
{
    for(var i = 0; i < outOfStockItems.length; i++)
        if(outOfStockItems[i] == beer_id)
            return true;
    
    return false;
}

/// This looks for favorites in local storage (since that is not in the provided API) and loads them into the GUI.
function load_favorites() {
    'use strict';
    var i, fave;
    
    // For each of the favorite-spots in the user interface
    var recentlybought = 0;
    for (i = 0; i < 5; i++) {
        var searchfor = "fav" + i;
        fave = localStorage.getItem("fav" + i);
        if (fave) {
            ui_haveBeer("shortCut" + i);
            setShortCut(fave, "shortCut" + i);
        } else { 
            // Here we could pick a recently bought beer instead
        }
    }
}

/// Obsoleted function. Attempt to do a canvas but it take too much time
function drawHelpCanvas()
{
    var canvas = document.getElementById("helpCanvas");
    var ctx = canvas.getContext("2d");
    ctx.font = "4.43vh 'Trebuchet MS'";
    ctx.fillText("");
    
}

///----------------------- Timer Area ------------------------
// Timer variables
var interval;
var minutes = 3;
var seconds = 0;

/// Countdown the time
function countdown(element) 
{
    interval = setInterval(function() {
        var el = document.getElementById(element);
        
        if(seconds == 0) {
            if(minutes == 0) {
                realLogout();		      
            } else {
                minutes--;
                seconds = 59;
            }
        }
        else if(seconds == 30 ) {
            if(minutes == 0){
                showView("resetTimer");			   
            }
        }
        
        var seconds_text = "" + seconds;
        
        if(seconds < 10)
            seconds_text = "0" + seconds;
        
        if(systemEnvironment.language == "en")
            el.innerHTML = "Auto logout in " + minutes + ':' + seconds_text;
        else if(systemEnvironment.language == "sv")
            el.innerHTML = "Auto utloggning om " + minutes + ':' + seconds_text;
    
        seconds--;
    }, 1000);
}

/// Id the user request to continue the order, extend the time
function moreTime() {
    minutes = 3;
    seconds = 0;
}


/// Get credit of the user
function getCredit()
{
    var request = "http://pub.jamaica-inn.net/fpdb/api.php?username=" +systemEnvironment.username + "&password=" + systemEnvironment.password + "&action=iou_get"
    var result = httpGet(request);
    var parseResult = JSON.parse(result);
    var data = parseResult['payload'];
    var credit = data[0].assets;

    if(credit == undefined)
        document.getElementById("totalCredit").innerHTML = "N/A";
    else
        document.getElementById("totalCredit").innerHTML = credit + " kr";
} 

/// Get purchase history
function getPurchaseHistroy()
{
    var maxPurchaseHistory = 5;
    var request = "http://pub.jamaica-inn.net/fpdb/api.php?username=aamsta&password=aamsta&action=purchases_get"
    var result = httpGet(request);
    var parseResult = JSON.parse(result);
    var data = parseResult['payload'];

    for(var i = 1; i <= 5; i++)
    {
        document.getElementById("time" + i).innerHTML = data[i-1].timestamp;
        document.getElementById("price" + i).innerHTML = data[i-1].price;

        var request2 = "http://pub.jamaica-inn.net/fpdb/api.php?username=aamsta&password=aamsta&action=beer_data_get&beer_id=" + data[i-1].beer_id;
        var result2 = httpGet(request);
        var parseResult2 = JSON.parse(result);
        var data2 = parseResult['payload'];

        document.getElementById("beerName" + i).innerHTML = data2[i-1].namn + data2[i-1].namn2;
        if(data2[i-1].namn.length + data2[i-1].namn2.length == 0)
        {
            document.getElementById("beerName" + i).innerHTML = "N/A"
        }
    }
}

/// Show purchase history in a dialog box
function showPurchaseTable()
{
    showView('purchaseTable');
}

/// This function is called when click checkout
function checkOutFunc(tmp)
{
    var checkoutArea = document.getElementById('checkOutPopup');
    
    checkoutArea.innerHTML = "";
    
    if(systemEnvironment.language == "en")
    {
        // Sorry for dirty trick
        var tomSt = "<p onclick='closeCheckout()'>&#10006;</p><h1>Check Out</h1><div id='tableContainer'><table>"; 
        tomSt += "<tr><th class='c1'>#</th><th class='c2'>Items</th><th class='c3'>Price</th></tr>";
        
        var total = 0;
        for (var i = 0; i < orderItemList.length; i++) 
            for (var j = 0; j < orderItemList[i].itemAmount; j++)
            {
                tomSt += "<tr><td><input name='checkboxId' type='checkbox'  value='" + orderItemList[i].itemId + "' checked onchange='updateTotalCost()' ></td><td class='left'>" + orderItemList[i].itemName + "</td><td class='right'>" + orderItemList[i].itemPrice.toFixed(2) + " kr</td></tr>";
                total += orderItemList[i].itemPrice;
            }
        
        tomSt += "</table></div ><p><span style='float: left; font-size: 1.25em; margin-left: 1.58vh;' data-locale='total'>Total: </span><span style='float: right; font-size: 1.25em; margin-right: 1.58vh;' id='totalOutput'>" + total.toFixed(2) + " kr</span></p><br><br>";
    
        if(tmp == undefined)
            tomSt += "<p id='itemWarn' style='color: red; visibility: hidden;'>Please select item for checkout!</p><p><span class=\"neonButton\"  style=\"margin-top: 0.79vh; width: 11.87vh; float: left;  background-color:\" onclick=\"closeCheckout()\" />Close</span>";
        else
            tomSt += "<p id='itemWarn' style='color: red; visibility: hidden;'>Please select item for checkout!</p><p><span class=\"neonButton\"  style=\"margin-top: 0.79vh; width: 11.87vh; float: left;  background-color:\" onclick=\"resetCheckout()\" />Reset & Close</span>";
        
        tomSt += "<span class=\"neonButton\" style=\"margin-top: 0.79vh; width: 14.24vh; float: left;  background-color:\" onclick=\"uncheckAll()\"  />Uncheck All</span>";
        tomSt += "<span class=\"neonButton\" style=\"margin-top: 0.79vh; width: 14.24vh; float: left;  background-color:\" onclick=\"checkAll()\"  />Check All</span>";
        tomSt += "<span class=\"neonButton\"  style=\"margin-top: 0.79vh; width: 15.82vh; float: right;\" onclick=\"doPayment()\" />Pay</span></p>";
    }
    else if(systemEnvironment.language == "sv")
    {
        var tomSt = "<p onclick='closeCheckout()'>&#10006;</p><h1>Utcheckning</h1><div id='tableContainer'><table>"; 
        tomSt += "<tr><th class='c1'>#</th><th class='c2'>Objekt</th><th class='c3'>Pris</th></tr>";    
    
        var total = 0;
        for (var i = 0; i < orderItemList.length; i++) 
            for (var j = 0; j < orderItemList[i].itemAmount; j++)
            {
                tomSt += "<tr><td><input name='checkboxId' type='checkbox'  value='" + orderItemList[i].itemId + "' checked onchange='updateTotalCost()' ></td><td class='left'>"  + orderItemList[i].itemName + "</td><td class='right'>" + orderItemList[i].itemPrice.toFixed(2) + " kr</td></tr>";
                total += orderItemList[i].itemPrice;
            }
            
        tomSt += "</table></div ><p><span style='float: left; font-size: 1.25em; margin-left: 1.58vh;' data-locale='total'>Totalt: </span><span style='float: right; font-size: 1.25em; margin-right: 1.58vh;' id='totalOutput'>" + total.toFixed(2) + " kr</span></p><br><br>";
    
        if(tmp == undefined)
            tomSt += "</table></div ><p id='itemWarn' style='color: red; visibility: hidden;'>Please select item for checkout!</p><p><span class=\"neonButton\"  style=\"margin-top: 0.79vh; width: 11.87vh; float: left;  background-color:\" onclick=\"closeCheckout()\" />Stäng</span>";
        else
            tomSt += "</table></div ><p id='itemWarn' style='color: red; visibility: hidden;'>Please select item for checkout!</p><p><span class=\"neonButton\"  style=\"margin-top: 0.79vh; width: 11.87vh; float: left;  background-color:\" onclick=\"resetCheckout()\" />Återställ & Stäng</span>";
        
        tomSt += "<span class=\"neonButton\" style=\"margin-top: 0.79vh; width: 14.24vh; float: left;  background-color:\" onclick=\"uncheckAll();\"  />Avmarkera Alla</span>";
        tomSt += "<span class=\"neonButton\" style=\"margin-top: 0.79vh; width: 14.24vh; float: left;  background-color:\" onclick=\"checkAll()\"  />Markera Alla</span>";
        tomSt += "<span class=\"neonButton\" style=\"margin-top: 0.79vh; width: 15.82vh; float: right;\" onclick=\"doPayment()\" />Betala</span></p>";
    }
    checkoutArea.innerHTML = tomSt;
}

/// Update total cost when user do split bill
function updateTotalCost(){
    var checklist = document.getElementsByName('checkboxId');
    
    if(checklist.length == 0)
        return;
    
    var totalCost = 0;
    for(var i = 0; i < checklist.length; i++)
        if(checklist[i].checked){
            totalCost += getPriceFromId(checklist[i].value);
        }
    
    document.getElementById('totalOutput').innerHTML = totalCost.toFixed(2) + " kr";
}

/// Get price of the order item from the id
/// @param id is beer id that you want to know the price
function getPriceFromId(id)
{
    for(var i = 0; i < orderItemList.length; i++)
        if(orderItemList[i].itemId == id)
            return orderItemList[i].itemPrice;
    
    return NaN;
}

/// This function is called when user click pay. If will check that the user do split bill or not.
function doPayment() {
    var checklist = document.getElementsByName('checkboxId');
    if(checklist.length == 0)
        return;
    
    var nonChecked = true;
    var uncheckedItem = 0;
    for(var i = 0; i < checklist.length; i++){
        if(checklist[i].checked){
            nonChecked = false;
            httpGet("http://pub.jamaica-inn.net/fpdb/api.php?username=" + systemEnvironment.username + "&password=" + systemEnvironment.password + "&action=purchases_append&beer_id=" + checklist[i].value);
            removeItemInOrderListByOneById(checklist[i].value);
        }
        else
            uncheckedItem++;
    }
    
    if(!nonChecked)
    {
        document.getElementById('itemWarn').style.visibility = "hidden";
        
    }
    else
    {
     document.getElementById('itemWarn').style.visibility = "visible";   
    }
    
    if(uncheckedItem > 0){
        checkOutFunc(1);
    }
    else{
        // reset everthing
        orderCommandList = [];
        redoCommand = undefined;
        toggleButtons();
        showView();
        drawOrderList();
    }
}

/// Reset the orderItem data
function resetCheckout()
{
    // reset everthing
    orderItemList = [];
    orderCommandList = [];
    redoCommand = undefined;
    toggleButtons();
    showView();
    drawOrderList();
}

/// Uncheck the item in the split bill
function uncheckAll() {
    var checklist = document.getElementsByName('checkboxId');
    if(checklist.length == 0)
        return;
    
    for(var i = 0; i < checklist.length; i++)
        checklist[i].checked = false;
    
    updateTotalCost();
}

/// Check ever item in the split bill
function checkAll() {
    var checklist = document.getElementsByName('checkboxId');
    if(checklist.length == 0)
        return;
    
    for(var i = 0; i < checklist.length; i++)
        checklist[i].checked = true;
    
    updateTotalCost();
}

/// Close the checkout form
function closeCheckout()
{
    document.getElementById('itemWarn').style.visibility = "hidden";
    closeMenuOption();
}

/// Remove the item in the order list by id
/// @param id is an id of the particular item that you want to remove from the orderlist
function removeItemInOrderListByOneById(id){
    for(var i = 0; i < orderItemList.length; i++)
        if(orderItemList[i].itemId == id)
        {
            if(orderItemList[i].itemAmount > 1)
                orderItemList[i].itemAmount--;
            else
                orderItemList.splice(i,1);
            
            return;   
        }
}

//------------------------------------------------------------------------------------------------------------------------------------
///--------------------------------------------------- Offline database region -------------------------------------------------------
function getOfflineResponse() {
    return multiline(function() {/*!
{"type" : "inventory_get", "payload" : [{"namn" : "","namn2" : "","sbl_price" : "","pub_price" : "","beer_id" : "2259","count" : "389","price" : "20.00"},{"namn" : "","namn2" : "","sbl_price" : "","pub_price" : "","beer_id" : "22590","count" : "-1","price" : ""},{"namn" : "","namn2" : "","sbl_price" : "","pub_price" : "","beer_id" : "225900","count" : "-1","price" : ""},{"namn" : "Anchor Steam Beer","namn2" : "","sbl_price" : "23.90","pub_price" : "25","beer_id" : "157503","count" : "98","price" : "20.60"},{"namn" : "Beck's","namn2" : "","sbl_price" : "14.90","pub_price" : "20","beer_id" : "154903","count" : "16","price" : "14.10"},{"namn" : "Bedarö Bitter","namn2" : "","sbl_price" : "28.60","pub_price" : "30","beer_id" : "141001","count" : "20","price" : "28.20"},{"namn" : "BEO","namn2" : "Apple Green Tea","sbl_price" : "12.90","pub_price" : "15","beer_id" : "197702","count" : "18","price" : "12.90"},{"namn" : "BEO","namn2" : "Blood Orange Hibiscus","sbl_price" : "12.90","pub_price" : "15","beer_id" : "197302","count" : "5","price" : "12.90"},{"namn" : "Bitburger","namn2" : "Premium","sbl_price" : "12.60","pub_price" : "15","beer_id" : "156503","count" : "5","price" : "11.90"},{"namn" : "Black Tower","namn2" : "Rivaner","sbl_price" : "29.00","pub_price" : "35","beer_id" : "604504","count" : "100","price" : "29.00"},{"namn" : "Blue Nun","namn2" : "","sbl_price" : "38.00","pub_price" : "40","beer_id" : "693502","count" : "100","price" : "36.00"},{"namn" : "Bombardier","namn2" : "","sbl_price" : "20.90","pub_price" : "25","beer_id" : "152901","count" : "100","price" : "19.90"},{"namn" : "Brewdog","namn2" : "5 A.M. Saint","sbl_price" : "20.10","pub_price" : "25","beer_id" : "150103","count" : "100","price" : "20.10"},{"namn" : "BrewDog Dead Pony Club","namn2" : "","sbl_price" : "18.40","pub_price" : "20","beer_id" : "1191303","count" : "100","price" : "18.10"},{"namn" : "Brewdog Hardcore IPA","namn2" : "","sbl_price" : "28.90","pub_price" : "30","beer_id" : "159103","count" : "100","price" : "36.00"},{"namn" : "Brewdog Punk IPA","namn2" : "","sbl_price" : "21.40","pub_price" : "25","beer_id" : "151503","count" : "7","price" : "19.90"},{"namn" : "BrewDog Rip Tide","namn2" : "","sbl_price" : "27.90","pub_price" : "30","beer_id" : "162003","count" : "100","price" : "26.90"},{"namn" : "BrewDog Trashy Blonde","namn2" : "","sbl_price" : "19.90","pub_price" : "25","beer_id" : "1158103","count" : "10","price" : "18.90"},{"namn" : "Briccotondo","namn2" : "Barbera","sbl_price" : "79.00","pub_price" : "85","beer_id" : "277301","count" : "10","price" : "79.00"},{"namn" : "Brooklyn","namn2" : "East India Pale Ale","sbl_price" : "23.90","pub_price" : "25","beer_id" : "168803","count" : "10","price" : "22.90"},{"namn" : "Brooklyn Lager","namn2" : "","sbl_price" : "17.90","pub_price" : "20","beer_id" : "154803","count" : "2","price" : "16.90"},{"namn" : "Cameleon","namn2" : "Selection Malbec","sbl_price" : "43.00","pub_price" : "45","beer_id" : "658102","count" : "0","price" : "43.00"},{"namn" : "Campos Góticos","namn2" : "Tempranillo","sbl_price" : "49.00","pub_price" : "55","beer_id" : "209702","count" : "0","price" : "49.00"},{"namn" : "Casillero del Diablo","namn2" : "Chardonnay","sbl_price" : "29.00","pub_price" : "35","beer_id" : "207504","count" : "0","price" : "30.00"},{"namn" : "Ch Malavieille Alliance","namn2" : "","sbl_price" : "119.00","pub_price" : "125","beer_id" : "266201","count" : "0","price" : "119.00"},{"namn" : "Château Pech-Latt","namn2" : "","sbl_price" : "99.00","pub_price" : "105","beer_id" : "223301","count" : "0","price" : "99.00"},{"namn" : "Chilcas","namn2" : "Sauvignon Blanc","sbl_price" : "46.00","pub_price" : "50","beer_id" : "669702","count" : "1","price" : "45.00"},{"namn" : "Chill Out Mountains","namn2" : "Malbec","sbl_price" : "69.00","pub_price" : "75","beer_id" : "614601","count" : "0","price" : "69.00"},{"namn" : "Chimay blå","namn2" : "","sbl_price" : "29.90","pub_price" : "35","beer_id" : "165103","count" : "0","price" : "28.90"},{"namn" : "Cidraie Pear","namn2" : "","sbl_price" : "20.00","pub_price" : "25","beer_id" : "180202","count" : "800","price" : "20.00"},{"namn" : "Citra Pale Ale","namn2" : "","sbl_price" : "20.90","pub_price" : "25","beer_id" : "155103","count" : "0","price" : "20.90"},{"namn" : "Coopers Best","namn2" : "Extra Stout","sbl_price" : "19.90","pub_price" : "25","beer_id" : "1127103","count" : "0","price" : "19.90"},{"namn" : "Dr L","namn2" : "Riesling","sbl_price" : "81.00","pub_price" : "85","beer_id" : "721801","count" : "0","price" : "81.00"},{"namn" : "Duvel","namn2" : "","sbl_price" : "25.50","pub_price" : "30","beer_id" : "165403","count" : "0","price" : "24.90"},{"namn" : "Ecologica","namn2" : "Shiraz Malbec","sbl_price" : "69.00","pub_price" : "75","beer_id" : "651201","count" : "1","price" : "69.00"},{"namn" : "Einbecker Brauherren Alkoholfrei","namn2" : "","sbl_price" : "9.90","pub_price" : "15","beer_id" : "191402","count" : "2","price" : "9.90"},{"namn" : "El Cortejo","namn2" : "Sauvignon Blanc","sbl_price" : "34.00","pub_price" : "40","beer_id" : "601202","count" : "0","price" : "33.00"},{"namn" : "El Coto","namn2" : "Blanco","sbl_price" : "37.00","pub_price" : "40","beer_id" : "278002","count" : "0","price" : "37.00"},{"namn" : "Electric Nurse","namn2" : "Imperial Stout","sbl_price" : "34.90","pub_price" : "40","beer_id" : "8953903","count" : "1","price" : "34.90"},{"namn" : "Erdinger","namn2" : "Weissbier Hefe","sbl_price" : "21.90","pub_price" : "25","beer_id" : "1120801","count" : "0","price" : "21.90"},{"namn" : "Fentimans","namn2" : "Ginger Beer","sbl_price" : "22.50","pub_price" : "25","beer_id" : "196303","count" : "0","price" : "22.50"},{"namn" : "Flying Dog","namn2" : "Dogtoberfest Märzen","sbl_price" : "25.90","pub_price" : "30","beer_id" : "1163903","count" : "10","price" : "25.90"},{"namn" : "Flying Dog","namn2" : "Gonzo Imperial Porter","sbl_price" : "29.90","pub_price" : "35","beer_id" : "168303","count" : "10","price" : "29.90"},{"namn" : "Franziskaner","namn2" : "Hefe-Weissbier","sbl_price" : "21.90","pub_price" : "25","beer_id" : "168701","count" : "10","price" : "20.50"},{"namn" : "Freedom IPA","namn2" : "","sbl_price" : "27.40","pub_price" : "30","beer_id" : "8968701","count" : "10","price" : "27.00"},{"namn" : "Fuller's ESB","namn2" : "","sbl_price" : "25.90","pub_price" : "30","beer_id" : "1140501","count" : "10","price" : "25.40"},{"namn" : "Gambrinus","namn2" : "","sbl_price" : "16.50","pub_price" : "20","beer_id" : "1148901","count" : "0","price" : "15.90"},{"namn" : "Guinness","namn2" : "Extra Stout","sbl_price" : "17.90","pub_price" : "20","beer_id" : "156103","count" : "1","price" : "16.90"},{"namn" : "Hell","namn2" : "","sbl_price" : "25.90","pub_price" : "30","beer_id" : "1146001","count" : "-3","price" : "23.80"},{"namn" : "Hoegaarden","namn2" : "Wit-Blanche","sbl_price" : "17.40","pub_price" : "20","beer_id" : "156303","count" : "0","price" : "16.10"},{"namn" : "Hofbräu München Oktoberfest","namn2" : "","sbl_price" : "19.90","pub_price" : "25","beer_id" : "1129801","count" : "0","price" : "19.90"},{"namn" : "Hubert Beck","namn2" : "Réserve du Chevalier Pinot Gris","sbl_price" : "49.00","pub_price" : "55","beer_id" : "1210502","count" : "0","price" : "49.00"},{"namn" : "il Conte","namn2" : "Montepulciano d'Abruzzo","sbl_price" : "38.00","pub_price" : "40","beer_id" : "232202","count" : "0","price" : "36.00"},{"namn" : "il Nostro","namn2" : "Grecanico","sbl_price" : "57.00","pub_price" : "60","beer_id" : "2280301","count" : "0","price" : "57.00"},{"namn" : "Innis & Gunn","namn2" : "Oak Aged Beer","sbl_price" : "19.90","pub_price" : "25","beer_id" : "1144703","count" : "1","price" : "19.90"},{"namn" : "Innis & Gunn","namn2" : "Rum Finish Oak Aged Beer","sbl_price" : "19.90","pub_price" : "25","beer_id" : "1159803","count" : "1","price" : "19.90"},{"namn" : "Jever Pilsener","namn2" : "","sbl_price" : "16.90","pub_price" : "20","beer_id" : "150601","count" : "-1","price" : "15.90"},{"namn" : "Jever Pilsener","namn2" : "","sbl_price" : "12.90","pub_price" : "15","beer_id" : "150603","count" : "7","price" : "12.90"},{"namn" : "Karlovacko","namn2" : "","sbl_price" : "17.80","pub_price" : "20","beer_id" : "151001","count" : "0","price" : "16.90"},{"namn" : "Kasteel Triple","namn2" : "","sbl_price" : "40.80","pub_price" : "45","beer_id" : "8910403","count" : "-1","price" : "27.50"},{"namn" : "Königsmosel","namn2" : "Riesling","sbl_price" : "39.00","pub_price" : "45","beer_id" : "746902","count" : "0","price" : "39.00"},{"namn" : "King Goblin","namn2" : "","sbl_price" : "26.90","pub_price" : "30","beer_id" : "150401","count" : "0","price" : "25.90"},{"namn" : "Kiviks Astrakan Fläderblom","namn2" : "Äppelcider Halvtorr","sbl_price" : "19.90","pub_price" : "25","beer_id" : "187702","count" : "0","price" : "19.90"},{"namn" : "Kiviks Astrakan","namn2" : "Torr Cider","sbl_price" : "19.90","pub_price" : "25","beer_id" : "181803","count" : "2","price" : "18.90"},{"namn" : "Kiviks Williams","namn2" : "Päroncider Halvtorr","sbl_price" : "19.90","pub_price" : "25","beer_id" : "183203","count" : "0","price" : "18.90"},{"namn" : "Kloster","namn2" : "","sbl_price" : "32.30","pub_price" : "35","beer_id" : "8967303","count" : "0","price" : "32.30"},{"namn" : "Kung","namn2" : "","sbl_price" : "10.40","pub_price" : "15","beer_id" : "144612","count" : "0","price" : "10.60"},{"namn" : "Kwak","namn2" : "","sbl_price" : "23.90","pub_price" : "25","beer_id" : "166403","count" : "0","price" : "23.90"},{"namn" : "Lapin Kulta","namn2" : "","sbl_price" : "13.40","pub_price" : "15","beer_id" : "159412","count" : "0","price" : "13.10"},{"namn" : "Leffe","namn2" : "Blonde","sbl_price" : "19.90","pub_price" : "25","beer_id" : "165903","count" : "0","price" : "18.90"},{"namn" : "Leffe","namn2" : "Brune","sbl_price" : "19.90","pub_price" : "25","beer_id" : "133603","count" : "0","price" : "19.60"},{"namn" : "Leitz Eins Zwei Dry","namn2" : "Riesling","sbl_price" : "99.00","pub_price" : "105","beer_id" : "582201","count" : "0","price" : "99.00"},{"namn" : "Lindemans Bin 65","namn2" : "Chardonnay","sbl_price" : "45.00","pub_price" : "50","beer_id" : "210602","count" : "0","price" : "43.00"},{"namn" : "Mahou Negra","namn2" : "","sbl_price" : "14.90","pub_price" : "20","beer_id" : "172303","count" : "0","price" : "15.20"},{"namn" : "Mariestads","namn2" : "Alkoholfri","sbl_price" : "10.90","pub_price" : "15","beer_id" : "195202","count" : "1","price" : "10.90"},{"namn" : "Mariestads Export","namn2" : "","sbl_price" : "13.90","pub_price" : "15","beer_id" : "120003","count" : "0","price" : "13.90"},{"namn" : "Mariestads Export","namn2" : "","sbl_price" : "15.90","pub_price" : "20","beer_id" : "120301","count" : "0","price" : "15.40"},{"namn" : "Mariestads Old Ox","namn2" : "","sbl_price" : "17.50","pub_price" : "20","beer_id" : "137901","count" : "2","price" : "17.50"},{"namn" : "Mikkeller","namn2" : "American Dream","sbl_price" : "24.20","pub_price" : "30","beer_id" : "8966103","count" : "0","price" : "28.90"},{"namn" : "Mikkeller","namn2" : "Drink'in The Sun","sbl_price" : "16.90","pub_price" : "20","beer_id" : "1199403","count" : "2","price" : "16.90"},{"namn" : "Miller","namn2" : "Genuine Draft","sbl_price" : "14.90","pub_price" : "20","beer_id" : "157903","count" : "0","price" : "14.90"},{"namn" : "Modus Hoperandi","namn2" : "India Pale Ale","sbl_price" : "22.90","pub_price" : "25","beer_id" : "153915","count" : "0","price" : "22.90"},{"namn" : "Mountain Livin'","namn2" : "Pale Ale","sbl_price" : "24.90","pub_price" : "30","beer_id" : "8916315","count" : "0","price" : "25.20"},{"namn" : "Nanny State","namn2" : "","sbl_price" : "12.90","pub_price" : "15","beer_id" : "194703","count" : "3","price" : "12.40"},{"namn" : "Napa Smith","namn2" : "West Coast IPA","sbl_price" : "23.90","pub_price" : "25","beer_id" : "168103","count" : "0","price" : "23.90"},{"namn" : "Newcastle Brown Ale","namn2" : "","sbl_price" : "15.70","pub_price" : "20","beer_id" : "153803","count" : "0","price" : "15.20"},{"namn" : "Nils Oscar","namn2" : "India Ale","sbl_price" : "19.20","pub_price" : "25","beer_id" : "146403","count" : "0","price" : "18.90"},{"namn" : "Old Speckled Hen","namn2" : "","sbl_price" : "14.90","pub_price" : "20","beer_id" : "135603","count" : "0","price" : "15.90"},{"namn" : "Old Speckled Hen","namn2" : "","sbl_price" : "22.80","pub_price" : "25","beer_id" : "135601","count" : "0","price" : "22.80"},{"namn" : "Omnipollo Leon","namn2" : "","sbl_price" : "49.90","pub_price" : "55","beer_id" : "169301","count" : "0","price" : "49.90"},{"namn" : "Omnipollo","namn2" : "Nebuchadnezzar","sbl_price" : "29.90","pub_price" : "35","beer_id" : "123103","count" : "0","price" : "29.90"},{"namn" : "Oppigårds Amarillo","namn2" : "","sbl_price" : "19.90","pub_price" : "25","beer_id" : "144203","count" : "0","price" : "19.70"},{"namn" : "Oppigårds","namn2" : "Golden Ale","sbl_price" : "17.90","pub_price" : "20","beer_id" : "149003","count" : "2","price" : "17.90"},{"namn" : "Oppigårds","namn2" : "Indian Tribute","sbl_price" : "22.50","pub_price" : "25","beer_id" : "141503","count" : "0","price" : "20.90"},{"namn" : "Oppigårds","namn2" : "Thurbo Double IPA","sbl_price" : "26.30","pub_price" : "30","beer_id" : "8962903","count" : "1","price" : "26.30"},{"namn" : "Paulaner","namn2" : "Hefe-Weissbier","sbl_price" : "20.90","pub_price" : "25","beer_id" : "155701","count" : "0","price" : "20.40"},{"namn" : "Paulaner Oktoberfest","namn2" : "","sbl_price" : "21.90","pub_price" : "25","beer_id" : "1125001","count" : "0","price" : "21.90"},{"namn" : "Paulaner","namn2" : "Weissbier Kristall","sbl_price" : "20.90","pub_price" : "25","beer_id" : "153001","count" : "0","price" : "19.90"},{"namn" : "Pilsner Urquell","namn2" : "","sbl_price" : "14.90","pub_price" : "20","beer_id" : "156603","count" : "2","price" : "14.90"},{"namn" : "Pistonhead","namn2" : "Kustom Lager","sbl_price" : "9.90","pub_price" : "15","beer_id" : "145414","count" : "0","price" : "9.90"},{"namn" : "Pistonhead","namn2" : "Plastic Fantastic","sbl_price" : "10.90","pub_price" : "15","beer_id" : "148803","count" : "0","price" : "11.90"},{"namn" : "Poliziano Vino Nobile di Montepulciano","namn2" : "Viti Nuove","sbl_price" : "154.00","pub_price" : "160","beer_id" : "214401","count" : "0","price" : "149.00"},{"namn" : "Primator","namn2" : "Premium Lager","sbl_price" : "10.90","pub_price" : "15","beer_id" : "1151503","count" : "0","price" : "9.90"},{"namn" : "Primátor","namn2" : "Premium Dark","sbl_price" : "14.20","pub_price" : "20","beer_id" : "161503","count" : "0","price" : "13.90"},{"namn" : "Rabarbernektar","namn2" : "","sbl_price" : "39.00","pub_price" : "45","beer_id" : "194203","count" : "0","price" : "39.00"},{"namn" : "Rochefort 10","namn2" : "","sbl_price" : "39.90","pub_price" : "45","beer_id" : "162703","count" : "0","price" : "39.90"},{"namn" : "Running Duck","namn2" : "Sauvignon Blanc Semillon","sbl_price" : "75.00","pub_price" : "80","beer_id" : "202801","count" : "1","price" : "75.00"},{"namn" : "Ruppertsberger Hofstück","namn2" : "Riesling","sbl_price" : "65.00","pub_price" : "70","beer_id" : "591401","count" : "2","price" : "65.00"},{"namn" : "S:t Eriks","namn2" : "Oktoberfest","sbl_price" : "16.90","pub_price" : "20","beer_id" : "1125303","count" : "0","price" : "16.90"},{"namn" : "S:t Eriks","namn2" : "Organic Ale","sbl_price" : "19.90","pub_price" : "25","beer_id" : "1162503","count" : "0","price" : "19.90"},{"namn" : "S:t Eriks Pale Ale","namn2" : "","sbl_price" : "17.90","pub_price" : "20","beer_id" : "142003","count" : "0","price" : "17.90"},{"namn" : "Samuel Adams","namn2" : "Black Lager","sbl_price" : "19.90","pub_price" : "25","beer_id" : "153503","count" : "0","price" : "16.60"},{"namn" : "Samuel Adams","namn2" : "Boston Ale","sbl_price" : "19.90","pub_price" : "25","beer_id" : "164903","count" : "0","price" : "17.90"},{"namn" : "Samuel Adams","namn2" : "Boston Lager","sbl_price" : "17.90","pub_price" : "20","beer_id" : "154603","count" : "0","price" : "15.90"},{"namn" : "Sankt Anna","namn2" : "Riesling","sbl_price" : "49.00","pub_price" : "55","beer_id" : "212002","count" : "0","price" : "49.00"},{"namn" : "Saxhyttegubbens Blåbär 100%","namn2" : "","sbl_price" : "69.90","pub_price" : "75","beer_id" : "196403","count" : "0","price" : "69.90"},{"namn" : "Scarecrow","namn2" : "","sbl_price" : "24.90","pub_price" : "30","beer_id" : "1124601","count" : "0","price" : "24.50"},{"namn" : "Shatler's","namn2" : "San Fransisco","sbl_price" : "20.00","pub_price" : "25","beer_id" : "192804","count" : "1","price" : "20.00"},{"namn" : "Sierra Nevada","namn2" : "Pale Ale","sbl_price" : "23.50","pub_price" : "25","beer_id" : "152503","count" : "0","price" : "23.90"},{"namn" : "Sierra Nevada","namn2" : "Torpedo Extra IPA","sbl_price" : "24.90","pub_price" : "30","beer_id" : "1152803","count" : "0","price" : "26.90"},{"namn" : "Sigtuna East Coast Pale Ale","namn2" : "","sbl_price" : "18.90","pub_price" : "20","beer_id" : "149803","count" : "0","price" : "18.90"},{"namn" : "Sleepy Bulldog","namn2" : "Summer Pale Ale","sbl_price" : "19.80","pub_price" : "25","beer_id" : "8817303","count" : "0","price" : "19.80"},{"namn" : "Slottskällans","namn2" : "Barrel Aged Imperial Stout","sbl_price" : "40.30","pub_price" : "45","beer_id" : "8915103","count" : "0","price" : "39.80"},{"namn" : "Slottskällans Imperial Stout","namn2" : "","sbl_price" : "28.70","pub_price" : "30","beer_id" : "135503","count" : "0","price" : "28.70"},{"namn" : "Slottskällans Princess","namn2" : "","sbl_price" : "19.80","pub_price" : "25","beer_id" : "164103","count" : "0","price" : "24.90"},{"namn" : "Slottskällans Red Ale","namn2" : "","sbl_price" : "20.70","pub_price" : "25","beer_id" : "8875603","count" : "1","price" : "20.70"},{"namn" : "Sofiero Original","namn2" : "","sbl_price" : "9.50","pub_price" : "15","beer_id" : "122203","count" : "0","price" : "9.90"},{"namn" : "Somersby","namn2" : "Apple Cider Organic","sbl_price" : "17.20","pub_price" : "20","beer_id" : "183502","count" : "0","price" : "16.90"},{"namn" : "Somersby","namn2" : "Pear Cider","sbl_price" : "17.20","pub_price" : "20","beer_id" : "182402","count" : "0","price" : "16.90"},{"namn" : "Spaten München","namn2" : "","sbl_price" : "17.90","pub_price" : "20","beer_id" : "1133301","count" : "0","price" : "16.40"},{"namn" : "Spaten Oktoberfestbier","namn2" : "","sbl_price" : "20.60","pub_price" : "25","beer_id" : "1128101","count" : "0","price" : "20.60"},{"namn" : "St Peter's Cream Stout","namn2" : "","sbl_price" : "29.90","pub_price" : "35","beer_id" : "167101","count" : "0","price" : "29.40"},{"namn" : "St Peter's","namn2" : "G-Free Ale","sbl_price" : "36.30","pub_price" : "40","beer_id" : "157701","count" : "0","price" : "36.30"},{"namn" : "Starobrno Premium","namn2" : "","sbl_price" : "13.50","pub_price" : "15","beer_id" : "1134103","count" : "2","price" : "12.90"},{"namn" : "Staropramen","namn2" : "","sbl_price" : "16.40","pub_price" : "20","beer_id" : "167903","count" : "1","price" : "15.90"},{"namn" : "Staropramen Dark","namn2" : "","sbl_price" : "16.40","pub_price" : "20","beer_id" : "163203","count" : "0","price" : "15.90"},{"namn" : "Staropramen Granat","namn2" : "","sbl_price" : "16.40","pub_price" : "20","beer_id" : "160903","count" : "0","price" : "15.90"},{"namn" : "Staropramen","namn2" : "Non-Alcoholic","sbl_price" : "12.40","pub_price" : "15","beer_id" : "193002","count" : "2","price" : "12.40"},{"namn" : "Störtebeker 1402","namn2" : "","sbl_price" : "11.90","pub_price" : "15","beer_id" : "190002","count" : "0","price" : "10.90"},{"namn" : "Störtebeker","namn2" : "Bock-Bier","sbl_price" : "16.90","pub_price" : "20","beer_id" : "1159903","count" : "0","price" : "15.90"},{"namn" : "Stella Artois","namn2" : "","sbl_price" : "14.90","pub_price" : "20","beer_id" : "1137903","count" : "0","price" : "14.40"},{"namn" : "Stoneleigh","namn2" : "Riesling","sbl_price" : "99.00","pub_price" : "105","beer_id" : "649801","count" : "2","price" : "104.00"},{"namn" : "Stowford Press","namn2" : "","sbl_price" : "12.40","pub_price" : "15","beer_id" : "198902","count" : "5","price" : "12.90"},{"namn" : "Strongbow","namn2" : "","sbl_price" : "18.50","pub_price" : "20","beer_id" : "181903","count" : "0","price" : "17.90"},{"namn" : "Strongbow","namn2" : "","sbl_price" : "15.50","pub_price" : "20","beer_id" : "181902","count" : "0","price" : "15.50"},{"namn" : "Svart","namn2" : "","sbl_price" : "20.70","pub_price" : "25","beer_id" : "1134803","count" : "0","price" : "20.70"},{"namn" : "Thornbridge","namn2" : "Jaipur India Pale Ale","sbl_price" : "27.90","pub_price" : "30","beer_id" : "162601","count" : "0","price" : "27.90"},{"namn" : "Troppo","namn2" : "Merlot Cabernet","sbl_price" : "44.00","pub_price" : "50","beer_id" : "218002","count" : "0","price" : "39.00"},{"namn" : "Via del Campo","namn2" : "Blanco","sbl_price" : "64.00","pub_price" : "70","beer_id" : "645901","count" : "0","price" : "64.00"},{"namn" : "Viña Maipo","namn2" : "Chardonnay","sbl_price" : "33.00","pub_price" : "35","beer_id" : "667102","count" : "0","price" : "33.00"},{"namn" : "Weihenstephaner","namn2" : "Hefe Weissbier","sbl_price" : "20.90","pub_price" : "25","beer_id" : "152601","count" : "-1","price" : "19.90"},{"namn" : "Weihenstephaner","namn2" : "Hefeweissbier Alkoholfrei","sbl_price" : "12.90","pub_price" : "15","beer_id" : "192201","count" : "2","price" : "12.90"},{"namn" : "Wisby","namn2" : "Klosteröl","sbl_price" : "17.80","pub_price" : "20","beer_id" : "140003","count" : "0","price" : "16.90"},{"namn" : "Wyld Wood","namn2" : "Organic","sbl_price" : "27.90","pub_price" : "30","beer_id" : "186602","count" : "0","price" : "27.90"},{"namn" : "Xide Jungle","namn2" : "Passionfruit Habanero","sbl_price" : "15.90","pub_price" : "20","beer_id" : "171903","count" : "1","price" : "15.90"},{"namn" : "Xide Non Alco","namn2" : "Lemon Dragonfruit","sbl_price" : "13.90","pub_price" : "15","beer_id" : "192003","count" : "0","price" : "13.90"},{"namn" : "Xide Pine Citrus","namn2" : "","sbl_price" : "15.90","pub_price" : "20","beer_id" : "178503","count" : "1","price" : "15.90"},{"namn" : "Xide Wasabi Lemon","namn2" : "","sbl_price" : "15.90","pub_price" : "20","beer_id" : "182603","count" : "1","price" : "15.90"},{"namn" : "Yeti","namn2" : "Imperial Stout","sbl_price" : "33.90","pub_price" : "35","beer_id" : "166703","count" : "0","price" : "31.90"},{"namn" : "Young's Double Chocolate Stout","namn2" : "","sbl_price" : "26.90","pub_price" : "30","beer_id" : "160601","count" : "0","price" : "25.90"},{"namn" : "Zeitgeist","namn2" : "Black Lager","sbl_price" : "18.50","pub_price" : "20","beer_id" : "157803","count" : "0","price" : "15.90"},{"namn" : "Zeunerts","namn2" : "Höga Kusten","sbl_price" : "15.40","pub_price" : "20","beer_id" : "148001","count" : "1","price" : "15.40"},{"namn" : "Zlatopramen","namn2" : " Premium","sbl_price" : "16.90","pub_price" : "20","beer_id" : "158201","count" : "0","price" : "16.90"}]}
    
    */});
}
function multiline(f) {
  return f.toString().
      replace(/^[^\/]+\/\*!?/, '').
      replace(/\*\/[^\/]+$/, '');
}
