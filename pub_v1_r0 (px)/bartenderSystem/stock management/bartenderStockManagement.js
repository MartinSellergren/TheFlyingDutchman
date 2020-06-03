//systemEnvironment
userCredential = 'pub' + getCredential(sessionStorage.getItem('pub_uname'));
systemEnvironment = JSON.parse(localStorage.getItem(userCredential));   //Global variabel
setTheme(systemEnvironment.theme);
//


window.onload = function() {
    
//------------------ Start Beir Region -----------------------------
    if(!hasCredential())
    {
        alert("Unauthorized Access!");
        location.href='../../logintest.html';
    }
//-------------------- End Beir Region -----------------------------
    
    
    //these values should be implemented in the database for each beverage
    DEFAULT_EMAIL_ADRESS = "orders@systemet.se";
    DEFAULT_EMAIL_TEXT = "default";
    DEFAULT_STOCK_STATUS_LOW_LIMIT = 5;
    
    currentTab = 1;     //global variabel. 1:generated orders, 2:incoming inv, 3: beverage edit
    popupIsOpen = false;
    generatedOrdersList = [];   //global array, used by generatedOrdersTab
    sentOrdersList = []         //global array, used by incomingInventoryTab
    allBeveragesList = []       //global array, -filled in generatedOrdersTab for use by incomingInventoryTab
                                    //-also filled in and used by beverageEditTab
    
    setTheme(systemEnvironment.theme);  //just to set the selected themeButton (can't set when theme set before onload)
    if (systemEnvironment.theme == "white") document.getElementById("helpButton").src = "helpButton_black.png";
    
    openTab(1);
    
    keyboardSearchString = "";  //global variable
    MAX_TIME_BETWEEN_KEYPRESS = 1500;    //constant, ms
    previousFoundRow = null;
    timeout = null;
    window.onkeydown = function(event) {
        if (!popupIsOpen) {
            if (event.keycode == 32) event.preventDefault();
            keyboardSearch(event);
        }
        else if (event.keyCode == 27) {
            if (currentTab == 3) {
                if (helpContentDivOpen) beverageEditTabNS.closeHelpContentDiv (
                        document.getElementById("helpContentDiv_beverageEdit"), 
                            document.getElementById("popupContentDiv_beverageEdit"),
                                document.getElementById("defocus"));
                else closeBeverageEditPopup();
            }
            else closePopup();
        }
    };
}

window.onbeforeunload = function(e) {
    console.log(systemEnvironment.language + "...");
    localStorage.setItem(userCredential, JSON.stringify(systemEnvironment)); 
    //save systemEnvironment
};


//------------------ Start Beir Region -----------------------------
function hasCredential(){
    if(sessionStorage.getItem('pub_uname') != null && 
       sessionStorage.getItem('pub_pword') != null)
        return true;
    
    return false;
}
//-------------------- End Beir Region -----------------------------

function openTab(newTab) {
    currentTab = newTab;
    var table = document.getElementsByTagName("table")[0];
    table.innerHTML = "";
    
    if (newTab == 1) openGeneratedOrdersTab(table);
    else if (newTab == 2) openIncomingInventoryTab(table);
    else if (newTab == 3) openBeverageEditTab(table);
    else console.log("error openTab newTab");
    
    setTabButtonsColors(newTab);
    setTextByLanguage(systemEnvironment.language);    //all text is set
}

function setTabButtonsColors(selectedTab) {
    var tabButtons = document.getElementsByClassName("tabButtons");
    for (var i=0; i<tabButtons.length; i++) {
        if (selectedTab == i+1) {
            //tabButtons[i].style.backgroundColor = "rgb(35,31,32)";
            //tabButtons[i].style.color = "white";
            tabButtons[i].classList.add("tabButtonSelected");
        }
        else {
            //tabButtons[i].style.backgroundColor = "inherit";
            //tabButtons[i].style.color = "initial";
            tabButtons[i].className = "tabButtons";
        }
    }
}

function keyboardSearch(event) {
    clearTimeout(timeout);
    event = event || window.event;
    if (event.keyCode == 13 && previousFoundRow != null) {  //enter
        var i = getIndexOfRow(previousFoundRow);
        if (currentTab == 1)
            openPopup(generatedOrdersList[i]);
        else if (currentTab == 2)
            openPopup(sentOrdersList[i]);
        else if (currentTab == 3)
            openPopup({"beverage":allBeveragesList[i], "clickedTableRow":previousFoundRow.parentElement});
    }
    else if (event.keyCode == 38) { //up arrow
        var name_tdList = document.getElementsByClassName("name_td");
        if (name_tdList.length == 0) return;
        var i;
        if (previousFoundRow == null) i = name_tdList.length-1;
        else i = getIndexOfRow(previousFoundRow)-1;
        if (i < 0) i = 0;
        newFoundRow(name_tdList[i]);
        keyboardSearchString = "";
    }
    else if (event.keyCode == 40) { //down arrow
        var name_tdList = document.getElementsByClassName("name_td");
        if (name_tdList.length == 0) return;
        var i;
        if (previousFoundRow == null) i = 0;
        else i = getIndexOfRow(previousFoundRow)+1;
        if (i >= name_tdList.length) i = name_tdList.length-1;
        newFoundRow(name_tdList[i]);
        keyboardSearchString = "";
    }
    else {
        if (event.keyCode == 8) {   //backshlash
            keyboardSearchString = keyboardSearchString.substring(0, keyboardSearchString.length-1);
            if (keyboardSearchString.length < 1) return;
        }
        else keyboardSearchString = keyboardSearchString + String.fromCharCode(event.keyCode);
    
        var name_tdList = document.getElementsByClassName("name_td");
        //if (previousFoundRow != null) previousFoundRow.parentElement.style.backgroundColor = "initial";
        //previousFoundRow = null;
        for (var i=0; i<name_tdList.length; i++) {
            if (name_tdList[i].innerHTML.replace(/[^a-zA-Z ]/g, "").toUpperCase().indexOf(keyboardSearchString) == 0) {
                newFoundRow(name_tdList[i]);
                break;
            }
        }
    }
    
    if (previousFoundRow != null) {
        timeout = setTimeout(function() {
            keyboardSearchString = "";
            if (previousFoundRow != null) previousFoundRow.parentElement.classList.remove("keysearchFoundRow");
            previousFoundRow = null;
        }, MAX_TIME_BETWEEN_KEYPRESS);
    }else keyboardSearchString = "";
    
    
    function newFoundRow(row) {
        if (previousFoundRow != null)
            previousFoundRow.parentElement.classList.remove("keysearchFoundRow");
        row.parentElement.classList.add("keysearchFoundRow");
        row.scrollIntoView(true);
        previousFoundRow = row;
    }
    
    function getIndexOfRow(row) {
        var name_tdList = document.getElementsByClassName("name_td");
        for (var i=0; i<name_tdList.length; i++) {
            if (previousFoundRow == name_tdList[i]) return i;
        }
    }
}


//data="help" / "setting" / or selected beverage if get orderDetails/incoming inventory/beverage edit
    //if from beverage edit, also clicked table row in data: data.beverage and data.clickedTableRow
function openPopup(data) {
    popupIsOpen = true;
    //document.getElementById("closeButton").style.visibility = "visible";
    var popupDiv = document.getElementById("popupDiv");
    var popupContentDiv = document.getElementsByClassName("popupContentDiv")[0];
    popupContentDiv.innerHTML = "";
    
    var defocus = document.getElementById("defocus");
    defocus.style.visibility = "visible";
    defocus.setAttribute("onclick", "");
    
    if (data == "help") {
        popupDiv.style.height = "560px";
        defocus.setAttribute("onclick", "closePopup()");
        //document.getElementById("closeButton").style.visibility = "hidden";
        
        var helpTextP = document.createElement("p");
        helpTextP.id = "helpTextP";
        if (currentTab == 1) generatedOrdersTabNS.fillPopupDiv_help(helpTextP);
        else if (currentTab == 2) incomingInventoryTabNS.fillPopupDiv_help(helpTextP);
        else beverageEditTabNS.fillPopupDiv_help(helpTextP);
        
        popupContentDiv.appendChild(helpTextP);
    }
    else if (data == "setting") {
        defocus.setAttribute("onclick", "closePopup()");
        document.getElementById("settingPopup").style.visibility = "visible";
        return;
    }
    else if (currentTab == 1) {
        popupDiv.style.height = "500px";
        fillPopupDiv(popupContentDiv, data);
    }
    else if (currentTab == 2) {
        defocus.setAttribute("onclick", "closePopup()");
        popupDiv.style.height = "400px";
        fillPopupDiv(popupContentDiv, data);
    }
    else if (currentTab == 3) {
        popupDiv.style.padding = "10px";
        popupDiv.style.height = "560px";
        beverageEditTabNS.fillPopupDiv(popupContentDiv, data);
    }
    
    popupDiv.style.display = "block";
    setTextByLanguage(systemEnvironment.language);    //all text is set
}

function closePopup() {
    popupIsOpen = false;
    document.getElementById("defocus").style.visibility = "hidden";
    document.getElementById("popupDiv").style.display = "none";
    document.getElementById("settingPopup").style.visibility = "hidden";
}

function fillPopupDiv(popupContentDiv, data) {
    var emailAdressText = document.createElement("p");
    if (currentTab == 1) emailAdressText.dataset.locale = "send to:";
    else if (currentTab == 2) emailAdressText.dataset.locale = "sent to:";
    emailAdressText.class = "popupText";
    emailAdressText.id = "emailAdressText";

    var emailAdressTextfield = document.createElement("input");
    emailAdressTextfield.type = "text";
    emailAdressTextfield.disabled = true;
    emailAdressTextfield.value = data.emailAdress;
    emailAdressTextfield.id = "emailAdressTextfield";

    var emailTextText = document.createElement("p");
    emailTextText.dataset.locale = "message:";
    emailTextText.setAttribute("id", "emailTextText");
    emailTextText.id = "emailTextText";
    emailTextText.class = "popupText";

    var emailTextArea = document.createElement("textarea");
    if (currentTab == 1) emailTextArea.value = data.emailText;
    else if (currentTab == 2) emailTextArea.value = data.emailText + "\n\n(date sent: " + data.dateSent + ")";
    emailTextArea.disabled = true;
    emailTextArea.id = "emailTextArea";
    
    popupContentDiv.appendChild(emailAdressText);
    popupContentDiv.appendChild(emailAdressTextfield);
    popupContentDiv.appendChild(emailTextText);
    popupContentDiv.appendChild(emailTextArea);
    
    if (currentTab == 1) {
        var editButton = document.createElement("input");
        editButton.type = "button";
        editButton.dataset.value = "edit";
        editButton.className = "editButton";
        editButton.setAttribute("onclick", "toggleEditEmailDetails(this)");

        var cancelButton = document.createElement("input");
        cancelButton.type = "button";
        cancelButton.dataset.value = "cancel";
        cancelButton.className = "cancelButton";
        cancelButton.onclick = function() { closePopup(); };

        var confirmButton = document.createElement("input");
        confirmButton.type = "button";
        confirmButton.dataset.value = "confirm";
        confirmButton.className = "confirmButton";
        confirmButton.onclick = function() { confirmEmailPopup(data); };


        var buttonsTempDiv = document.createElement("div");
        buttonsTempDiv.id = "buttonsTempDiv";
        buttonsTempDiv.appendChild(editButton);
        buttonsTempDiv.appendChild(cancelButton);
        buttonsTempDiv.appendChild(confirmButton);

        var emailPopupHelpText = document.createElement("p");
        emailPopupHelpText.id = "emailPopupHelpText";
        emailPopupHelpText.dataset.locale = "Changes will be lost when you";
        
        popupContentDiv.appendChild(buttonsTempDiv);
        popupContentDiv.appendChild(emailPopupHelpText);
        
        emailAdressTextfield.onkeyup = function() {
            if (emailAdressTextfield.value == "" || emailTextArea.value == "") confirmButton.disabled = true;
            else if (emailAdressTextfield.value != "" && emailTextArea.value != "") confirmButton.disabled = false;
        }
        emailTextArea.onkeyup = function() {
            if (emailAdressTextfield.value == "" || emailTextArea.value == "") confirmButton.disabled = true;
            else if (emailAdressTextfield.value != "" && emailTextArea.value != "") confirmButton.disabled = false; 
        }
    }
}


/*related localStorage entries:
id + "_orderSent        -"" (exists?)
id + "_dateOrderSent    -date
id + "_emailAdress      -email adress
id + "_emailText        -email text*/
function storeSentOrderInLocalStorage(beverage) {
    localStorage.setItem(beverage.id + "_orderSent", "");
    localStorage.setItem(beverage.id + "_dateOrderSent", new Date().toLocaleString('swe'));
    localStorage.setItem(beverage.id + "_emailAdress", beverage.emailAdress);
    localStorage.setItem(beverage.id + "_emailText", beverage.emailText);
}
function removeSentOrderFromLocalStorage(beverage) {
    localStorage.removeItem(beverage.id + "_orderSent");
    localStorage.removeItem(beverage.id + "_dateOrderSent");
    localStorage.removeItem(beverage.id + "_emailAdress");
    localStorage.removeItem(beverage.id + "_emailText");
}

/*related localStorage entries
id + "_orderGenerated        -"" (exists?)*/
function storeGeneratedOrderInLocalStorage(beverage) {
    localStorage.setItem(beverage.id + "_orderGenerated", "");
}
function removeGeneratedOrderFromLocalStorage(beverage) {
    localStorage.removeItem(beverage.id + "_orderGenerated");
}


function fillTable(table, captionText, buttonText, headerList, useCheckboxes,
                    checkboxesChecked, contentList, useNumInput, useId) {
    //caption start
    var caption = document.createElement("caption");
    var tempdiv = document.createElement("div");
    tempdiv.style.position = "relative";
    var captionP = document.createElement("p");
    if (captionText.length > 0) captionP.dataset.locale = captionText.substring(0,20);
    else captionP.innerHTML = "&zwnj;";
    tempdiv.appendChild(captionP);
    
        //tableButton start
    if (buttonText != "none") {
        var button = document.createElement("input");
        button.setAttribute("type", "button");
        //button.setAttribute("value", buttonText);
        button.dataset.value = buttonText;
        button.setAttribute("id", "tableButton");
        if (!checkboxesChecked) {
            button.disabled = true;
            button.style.cursor = "inherit";
        }
        tempdiv.appendChild(button);
    }
        //tableButton end
    caption.appendChild(tempdiv);
    table.appendChild(caption);
    //caption end
    
    //header start
    var tr = document.createElement("tr");
    for (var i=0; i<headerList.length; i++) {
        var th = document.createElement("th");
        if (i == 0 && currentTab == 3) th.style.textAlign = "center";
        th.dataset.locale = headerList[i].substring(0,20);
        tr.appendChild(th);
    }
    
    if (useCheckboxes) {
        if (currentTab == 1) {
            var checkbox = document.createElement("input");
            checkbox.setAttribute("type", "checkbox");
            if (checkboxesChecked) checkbox.setAttribute("checked", "true");
            checkbox.setAttribute("id", "selectAll_checkbox");
            var checkbox_th = document.createElement("th");
            checkbox_th.appendChild(checkbox);
            tr.appendChild(checkbox_th);
        }
        else if (currentTab == 2) {
            var checkboxesHeaderText = document.createElement("th");
            checkboxesHeaderText.dataset.locale = "mark";
            tr.appendChild(checkboxesHeaderText);
        }
    }
    if (useNumInput) {
        var numHeaderText = document.createElement("th");
        numHeaderText.innerHTML = "#";
        tr.appendChild(numHeaderText);
    }
    table.appendChild(tr);
    //header end
    
    //fill table content
    for (var i=0; i<contentList.length; i++) {
        var rowContentList = contentList[i];
        var tr = createTableRow(rowContentList, useCheckboxes, checkboxesChecked, useNumInput, useId);
        table.appendChild(tr);
    }//end fill table content
}

function createTableRow(rowContentList, useCheckboxes, checkboxesChecked, useNumInput, useId) {
    var tr = document.createElement("tr");

    for (var j=0; j<rowContentList.length; j++) {
        element = rowContentList[j];
        if (j == 0 && !useId) continue;             //id always first
        var td = document.createElement("td");
        if (j == 0 && currentTab == 3) td.style.textAlign = "center";
        if (j == 1) td.className = "name_td";            //name always second
        td.innerHTML = element;
        tr.appendChild(td);
    }

    if (useCheckboxes) {
        var checkbox = document.createElement("input");
        checkbox.setAttribute("type", "checkbox");
        if (checkboxesChecked) checkbox.setAttribute("checked", "true");
        checkbox.setAttribute("class", "innerCheckbox");
        var checkbox_td = document.createElement("td");
        checkbox_td.appendChild(checkbox);
        tr.appendChild(checkbox_td);
    }
    if (useNumInput) {
        var numInputField = document.createElement("input");
        numInputField.type = "text";
        numInputField.className = "numInputField";
        numInputField.maxLength = "4";
        numInputField.style.width = "45px";
        numInputField.style.border = "4px solid transparent";
        numInputField.disabled = true;
        numInputField.value = "";
        var numInputField_td = document.createElement("td");
        numInputField_td.appendChild(numInputField);
        tr.appendChild(numInputField_td);
    }
    return tr;
}


function isAnyInnerCheckboxSelected() {
    var checkboxes = document.getElementsByClassName("innerCheckbox");
    for (var i=0; i<checkboxes.length; i++)
        if (checkboxes[i].checked) return true;
    return false;
}

function disableTableButton(state) {
    var tableButton = document.getElementById("tableButton");
    tableButton.disabled = state;
    if (state) tableButton.style.cursor = "inherit";
    else tableButton.style.cursor = "pointer";
}

/*//beverage={id:.., amount:..}, appendAmountToCurrentAmount(true/false)
function updateStockInDatabase(beverage, appendAmountToCurrentAmount, ) {
    var subtract = 0;
    if (!appendAmountToCurrentAmount) subtract = getBeverageAmountFromDatabase(beverage.id);
    setBeverageAmountAndPriceInDatabase(beverage.id, beverage.amount-subtract);
}

function getBeverageAmountFromDatabase(id) {
    return 0;//xxx
}*/

//appends amount to current
function setBeverageAmountAndPriceInDatabase(id, amount, price) {
    var action = "inventory_append";
    var additionalParameters = "beer_id=" + id + "&amount=" + amount + "&price=" + price;
    serverRequest(action, additionalParameters, "post");
}


//not implemented in database. returns default value
function generateDefaultEmailText(name) {
    return "We would like to order 50 bottles of " + name + ".\n\n" +
        "Adress:\n blablabla\n uppsala\n sverige\n\n" + 
        "Best Regards\nThe Flying Dutchman (Crossing the sea)";
}


function validateNumInputFieldText(text, emptyOkay, decimalOkay) {
    if (emptyOkay == undefined) emptyOkay = false;
    if (decimalOkay == undefined) decimalOkay = false;
    if (text.length == 0) return emptyOkay;
    var array = text.split("");
    for (var i=0; i<array.length; i++) {
        if (!isDigit(array[i]))
            if (!(decimalOkay && (array[i]=="." || array[i]==","))) return false;
    }
    return true;
}

function setTheme(theme) {
    if (theme == "dark") {
        document.getElementById("darkStylesheet").disabled = false;
        document.getElementById("lightStylesheet").disabled = true;
        
        if (document.readyState == "complete") {
            document.getElementById("darkThemeButton").setAttribute("class", "selectedImage imageButton");
            document.getElementById("whiteThemeButton").setAttribute("class", "imageButton");
            document.getElementById("helpButton").src = "helpButton_white.png";
        }
    }
    else if (theme == "white") {
        document.getElementById("darkStylesheet").disabled = true;
        document.getElementById("lightStylesheet").disabled = false;
        
        if (document.readyState == "complete") {
            document.getElementById("darkThemeButton").setAttribute("class", "imageButton");
            document.getElementById("whiteThemeButton").setAttribute("class", "selectedImage imageButton");
            document.getElementById("helpButton").src = "helpButton_black.png";
        }
    }
    else console.log("error theme");
    
    systemEnvironment.theme = theme;
}



//type="get"/"post"
function serverRequest(action, additionalParameters, type) {
    //safety net. Not supposed to be here.
    /*if (action == "inventory_get") return JSON.parse(getOfflineResponse()).payload;*/
    //
    
    var user = systemEnvironment.username;
    if (user == null) throw new Error("No credentials!");
    
    var request = "http://pub.jamaica-inn.net/fpdb/api.php?username=" + user + "&password=" + user + 
			"&action=" + action + "&" + additionalParameters;
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open(type, request, false);
    xmlHttp.send();
    var result = xmlHttp.responseText;
    //var result = getOfflineResponse();
    var data = JSON.parse(result).payload;
    return data;
}














//-----------------------------------------------------------------------------------------------

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