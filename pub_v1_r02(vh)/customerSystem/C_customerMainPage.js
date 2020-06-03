/// @file C_customerMainPage.js
/// @namespace
/// Module for user action

/// This function is called when user click undo
function undoAction()
{    
    if(orderCommandList.length == 0)
        return;
    
    // Pop the event
    redoCommand = orderCommandList.pop();
    var totalCost = 0;
    orderItemList = [];
    
    var itemsList = document.getElementById("orderList");
    if(orderCommandList.length == 0)
        itemsList.innerHTML = "";
    
    for(var i = 0; i < orderCommandList.length; i++)
    {
        var itemIdx = -1;
        for(var j = 0; j < orderItemList.length; j++)
        {
            if(orderItemList[j].itemName == orderCommandList[i].itemName)
            {
                itemIdx = j;
                break;
            }
        }
        
        if(itemIdx > -1)
            orderItemList[itemIdx].itemAmount += orderCommandList[i].itemAmount;
        else
            orderItemList.push(new OrderItem(orderCommandList[i].itemId, 
                                     orderCommandList[i].itemName, 
                                     orderCommandList[i].itemPrice,
                                     1));
    }
    
    // Filter out the deleted item
    for(var i = 0; i < orderItemList.length; i++)
        if(orderItemList[i].itemAmount == 0)
            orderItemList.splice(i,1);
    
    // Recreate the list, then draw a new list
    drawOrderList();
}

/// This function is called when user click redo
function redoAction()
{
    addItemToOrder(redoCommand.itemId, redoCommand.itemName, redoCommand.itemPrice, redoCommand.itemAmount);
    redoCommand = undefined;
    drawOrderList();
}

/// This function is called when user tpye the information in the search box
/// This function is not used due to performance issue
function searchTextChange()
{
    var searchText = document.getElementById("searchText").value.trim();
    if(searchText.length == 0)
        loadAllDrinks();
    else
        loadAllDrinks(searchText.toLowerCase());
}

/// Clear the text in the search box
function clearSearch()
{
    currentCategory = 0;
    document.getElementById("cat").selectedIndex = 0;
    
    document.getElementById("searchText").value = "";
    loadAllDrinks();
}

/// This function is called when user click finish button
function checkOut()
{
    showView("checkOutPopup");
    checkOutFunc();
}

/// This function is obsoleted
function confirmCheckOut()
{
    showView();
    resetAll();
}

/// This function is called for page redirection to the login page
function logout()
{
    sessionStorage.removeItem('pub_uname');
    sessionStorage.removeItem('pub_pword');
    
    location.href = "../logintest.html";
}

/// Open the inventory page
function openInventoryPage()
{
    saveEnvironment();
    // Create session storage
    sessionStorage.setItem('pub_uname', systemEnvironment.username);
    sessionStorage.setItem('pub_pword', systemEnvironment.password);
    
    location.href='stock management/bartenderStockManagement.html';
}

/// This function is called when the user click option menu
function showMenuOption()
{
    showView('menuOption');
}

/// This function is called when user close the option menu
function closeMenuOption()
{
    showView();
}

/// This function is called when user click help
function showHelp()
{
    showView('helpPopup');
}

/// This function is called when user want to change the language
/// @param lang is a string that determine the language to be dispalyed
function changeLanguage(lang)
{
    if(lang == undefined)
        return;
    
    if(lang != "en" && lang != "sv")
    {
        console.error("Detecting unaccepted language pack: " + lang);  
        return;
    }
    
    systemEnvironment.language = lang;
    
    if(lang == "en")
        var langPack = langPack_en;
    else if(lang == "sv")
        var langPack = langPack_sv;

    // data-locale
    var data = getAllElementsWithAttribute("data-locale");
    
    if(data.length == 0)
        return;
   
    for(var i = 0; i < data.length; i++){
        if(data[i].getAttribute("data-locale") == "shortcut"){ 
            if(data[i].innerHTML == "drop shortcut here" || data[i].innerHTML == "Lägg Till Favorit") {
                data[i].innerHTML = langPack[data[i].getAttribute("data-locale")]
            } else {
               // For debug purpose       
            }
        } else {
            data[i].innerHTML = langPack[data[i].getAttribute("data-locale")]
        }	
    };
    
    // data-placeholder
    data = getAllElementsWithAttribute("data-placeholder");
    
    if(data.length == 0)
        return;
   
    for(var i = 0; i < data.length; i++)
        data[i].placeholder = langPack[data[i].getAttribute("data-placeholder")];
    
    // data-placeholder
    data = getAllElementsWithAttribute("data-value");
    
    if(data.length == 0)
        return;
   
    for(var i = 0; i < data.length; i++)
        data[i].value = langPack[data[i].getAttribute("data-value")];
    
    // Then, toggle the selected attribute
    if(systemEnvironment.language == "en")
    {
        document.getElementById("enImgButton").setAttribute("class", "selectedImage imageButton");
        document.getElementById("svImgButton").setAttribute("class", "imageButton");
    }
    else if(systemEnvironment.language == "sv")
    {
        document.getElementById("enImgButton").setAttribute("class", "imageButton");
        document.getElementById("svImgButton").setAttribute("class", "selectedImage imageButton");
    }    
}

/// This function used for added item into the orderList which will be used as a main structure for drawing ordered items
/// @param id is a beer id
/// @param name is the name of the beer
/// @param price1 is the price of the beer
/// @param amount is the amount that the users has order (optioanl argument)
function addItemToOrder(id, name, price1, amount)
{
    redoCommand = undefined;
    if(amount == undefined)
        amount = 1;

    orderCommandList.push(new OrderItem(id, name, price1, amount));
    
    var itemIdx = -1;
    for(var i = 0; i < orderItemList.length; i++)
    {
        if(orderItemList[i].itemId == id)
        {
            itemIdx = i;
            break;
        }
    }
    
    if(itemIdx > -1)
    {
        orderItemList[i].itemAmount+= amount;
        if(orderItemList[i].itemAmount == 0)
            orderItemList.splice( i, 1);
    }
    else
    {
        var item = new OrderItem(id, name, price1, amount);
        orderItemList.push(item);
    }
    
    drawOrderList();
}

//--------------------- Drag and drop API -----------------------
 function allowDrop(ev) {
    // The function is called when the object is on the move
    ev.preventDefault();
     // Change smiley icon
    ui_wantBeer(ev); 
}

function drag(ev, id, name1, price) {
    var passVal = new OrderItem(id, name1, price, 1);
    ev.dataTransfer.setData("text", JSON.stringify(passVal));
}

function drop(ev) {
    ev.preventDefault();
     ui_haveBeer(ev.target.id);
    var shortCutId = ev.target.getAttribute("id");
    if(shortCutId == null)
        shortCutId = ev.target.parentNode.getAttribute("id");
    var data = ev.dataTransfer.getData("text");
    setShortCut(data, shortCutId);
    
    // Update the favorite items in localstorage
    var shortcutnumber = ev.target.id.slice(-1);
    localStorage.setItem("fav" + shortcutnumber, data);
}

function dragLeave(event) {
    console.log("drag leave!");
    var shortcutnumber = event.target.id.slice(-1);
    if (localStorage.getItem("fav" + shortcutnumber)) { // restore favorite if there was a favorite there before
        ui_haveBeer("shortCut" + shortcutnumber);
    } else {
        // set the default 'no beer' smiley icon
        ui_noBeer(event); 
    }
}

/// Sets smiley icon to a character that reaches for beer. Used when holding drag-and-drop item above element
/// @param event is a parameter that hold the event info
function ui_wantBeer(event) {
    'use strict';
    var elem = document.getElementById(event.target.id);
    elem.classList.remove('sHasBeer');
    elem.classList.add('sWantBeer');
}

/// Sets smiley icon to a character holding a beer bottle. Used when a favorite is displayed
function ui_haveBeer(id) {
    'use strict';
    var elem = document.getElementById(id);
    elem.classList.remove('sWantBeer');
    elem.classList.add('sHasBeer');
}

/// Default smiley icon. Not that happy.
function ui_noBeer(event) {
    'use strict';
    console.log(document.getElementById(event.target.id));
    var elem = document.getElementById(event.target.id);
    //console.log(elem.classList);
    elem.classList.remove('sHasBeer');
    elem.classList.remove('sWantBeer');
    elem.classList.add('sNoBeer');
}

/// This function random the beer for the user
function beer_roulette()
{ 
    var ids=["141001", "151503", "180202", "651201", "895390"];
    var beers=["Bedarö Bitter","Brewdog IPA","Cidraie","Ecologica","Electric"];
    var prices=[30,25, 20, 75, 40]; 

    var k= Math.floor((Math.random() * 5) -1); 
    if(k == -1)
        k = 0;
    
    showView("beerPopup"); 
    
    if(systemEnvironment.language == "en")
        beerPopup.innerHTML = "<br><h1 style='padding: 1.58vh; font-size: 2em; text-align: center;'>Lucky Pick<br><br>" + beers[k] + "</h1>"; 
    else if(systemEnvironment.language == "sv")
        beerPopup.innerHTML = "<br><h1 style='padding: 1.58vh; font-size: 2em; text-align: center;'>Tur Plockning<br><br>" + beers[k] + "</h1>";
    addItemToOrder(ids[k],beers[k],prices[k],1);
}
