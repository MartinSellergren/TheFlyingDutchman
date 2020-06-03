/// @file C_bartenderMainPage.js
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
    // delete username and passowrd in session storage
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

/// Redirect page to accoutnmanagement page
function openAccountPage()
{
    saveEnvironment();
    // Create session storage
    sessionStorage.setItem('pub_uname', systemEnvironment.username);
    sessionStorage.setItem('pub_pword', systemEnvironment.password);
    
    location.href='adminEdit/adminEdit.html';    
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
                // For debuging purpose
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

    // Add command to the list
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
}

function drag(ev, id, name1, price) {
    var passVal = new OrderItem(id, name1, price, 1);
    ev.dataTransfer.setData("text", JSON.stringify(passVal));
}

function drop(ev) {
    ev.preventDefault();

    var shortCutId = ev.target.getAttribute("id");
    if(shortCutId == null)
        shortCutId = ev.target.parentNode.getAttribute("id");
    
    var data = ev.dataTransfer.getData("text");
    setShortCut(data, shortCutId);
}
