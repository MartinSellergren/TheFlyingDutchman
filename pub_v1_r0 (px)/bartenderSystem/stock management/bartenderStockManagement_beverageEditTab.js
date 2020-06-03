function openBeverageEditTab(table) {
    currentPopupTab = 1;   //global, 1 or 2
    helpContentDivOpen = false;
    
    document.getElementById("helpButton").style.visibility = "hidden";
    var action = "inventory_get";
    var additionalParameters = "";
    var data = serverRequest(action, additionalParameters, "get");
    
    allBeveragesList = [];
    
    //fill allBeveragesList
    for (var i=0; i<data.length; i++) {
        var temp = data[i];
        var id = temp.beer_id;
        var name = temp.namn;
        if (temp.namn2.length > 0) name = name + " (" + temp.namn2 + ")";
        var count = temp.count;
        var price = temp.pub_price;
        
        /*var emailAdress = beverage.orderEmailAdress;
        var emailText = beverage.orderEmailText;
        var stockStatusLowLimit = beverage.stockStatusLowLimit;*/
        //not implemented in database so default values from bartenderStockManagement.js:
        var emailAdress = DEFAULT_EMAIL_ADRESS;
        var emailText = DEFAULT_EMAIL_TEXT;
        var stockStatusLowLimit = DEFAULT_STOCK_STATUS_LOW_LIMIT;
        if (emailText == "default") emailText = generateDefaultEmailText(name);
        
        var hasGeneratedOrder = hasGeneratedOrderTest(id);
        var allPrices = {"sbl_price":temp.sbl_price, "pub_price":temp.pub_price, "price":temp.price};
        
        var beverage = {"id":id, "name":name, "count":count, "price":price, "emailAdress":emailAdress,                                              "emailText":emailText, "stockStatusLowLimit":stockStatusLowLimit,
                        "hasGeneratedOrder":hasGeneratedOrder, "allPrices":allPrices};
        
        if (beverage.name.length == "") continue;
        allBeveragesList.push(beverage);
    }
    
    if (allBeveragesList.length == 0) {
        var caption = document.createElement("caption");
        caption.dataset.locale = "There are no beverages in the database.";
        table.appendChild(caption);
        return;
    }
    //allBeveragesList.sort();
    fillBeverageEditTable(table);
}

function fillBeverageEditTable(table) {
    var captionText = "";
    var buttonText = "none";
    var headerList = ["id", "name"];
    var useCheckboxes = false;
    var checkboxesChecked = false;
    var contentList = [];
    for (var i=0; i<allBeveragesList.length; i++) {
        var beverage = allBeveragesList[i];
        contentList.push( [beverage.id, beverage.name] );
    }
    var useNumInput = false;
    var useId = true;
    
    fillTable(table, captionText, buttonText, headerList, useCheckboxes,
              checkboxesChecked, contentList, useNumInput, useId);
    beverageEditTabNS.addListeners();
}

function hasGeneratedOrderTest(id) {
    if (localStorage.getItem(id + "_orderGenerated") != null) return true;
    else return false;
}

var beverageEditTabNS = {
    fillPopupDiv_help: function(helpTextP) {
        helpTextP.dataset.locale = "help text, beverage edit-tab";
    },
    
    fillPopupDiv: function (popupContentDiv, data) {
        var beverage = data.beverage;
        var clickedTableRow = data.clickedTableRow;
        
        var leftPlaceholder = document.createElement("div");
        leftPlaceholder.id = "leftPlaceholder_beverageEdit";
        
        var label = document.createElement("p");
        label.id = "label_beverageEdit";
        label.innerHTML = beverage.name;
        
        //tabs
        var rightPlaceholder = document.createElement("div");
        rightPlaceholder.id = "rightPlaceholder_beverageEdit";
        
        var editTabButton = document.createElement("p");
        editTabButton.dataset.locale = "edit";
        //editTabButton.style.display = "inline-block";
        editTabButton.id = "editTabButton_beverageEdit";
        //editTabButton.style.background = "rgb(35,31,32)";
        editTabButton.classList.add("selectedEditBeveragePopupTab");
        var infoTabButton = document.createElement("p");
        infoTabButton.innerHTML = "info";
        //infoTabButton.style.display = "inline-block";
        infoTabButton.id = "infoTabButton_beverageEdit";
             
        var helpButton = document.getElementById("helpButton");
        helpButton.id = "helpButton_beverageEdit";
        helpButton.style.visibility = "visible";
        
        leftPlaceholder.appendChild(helpButton);
        /*rightPlaceholder.appendChild(editTabButton);
        rightPlaceholder.appendChild(infoTabButton);*/
        
        var topDiv = document.createElement("div");
        topDiv.id = "topDiv_beverageEdit";
        topDiv.appendChild(leftPlaceholder);
        topDiv.appendChild(label);
        topDiv.appendChild(rightPlaceholder);
        topDiv.appendChild(editTabButton);
        topDiv.appendChild(infoTabButton);
        
        popupContentDiv.appendChild(topDiv);
        
        
        //-------------content
        var tabContentDiv1 = document.createElement("div");
        tabContentDiv1.style.width = "100%";        
        var tabContentDiv2 = document.createElement("div");
        tabContentDiv2.style.width = "100%";
        tabContentDiv2.style.display = "none";
        
        fillPopupEditTab(tabContentDiv1, beverage, clickedTableRow);
        //fillPopupInfoTab(tabContentDiv2, beverage);
        popupContentDiv.appendChild(tabContentDiv1);
        popupContentDiv.appendChild(tabContentDiv2);
        
        beverageEditTabNS.fixHelpPopup(popupContentDiv, helpButton);
        
        editTabButton.onclick = function() {
            currentPopupTab = 1;
            document.getElementById("defocus").onclick = "";
            
            editTabButton.classList.add("selectedEditBeveragePopupTab");
            infoTabButton.classList.remove("selectedEditBeveragePopupTab");
            tabContentDiv1.style.display = "block";
            tabContentDiv2.style.display = "none";
        };
        infoTabButton.onclick = function() {
            currentPopupTab = 2;
            document.getElementById("defocus").onclick = function() { closeBeverageEditPopup() };
            if (tabContentDiv2.children.length == 0) fillPopupInfoTab(tabContentDiv2, beverage);
            
            infoTabButton.classList.add("selectedEditBeveragePopupTab");
            editTabButton.classList.remove("selectedEditBeveragePopupTab");
            tabContentDiv1.style.display = "none";
            tabContentDiv2.style.display = "block";
        };
    },
    
    addListeners: function() {
        var name_tdList = document.getElementsByClassName("name_td");
        for (var i=0; i<name_tdList.length; i++) {
            (function() {
                var j = i;
                name_tdList[j].onclick = function() { openPopup({"beverage":allBeveragesList[j], 
                                                                 "clickedTableRow": this.parentElement})};
            })();
        }
    },
    
    fixHelpPopup: function(popupContentDiv, helpButton) {
        var defocus = document.getElementById("defocus");
        
        var helpContentDiv = document.createElement("div");
        helpContentDiv.className = "popupContentDiv";
        helpContentDiv.dataset.locale = "beverage edit help";
        helpContentDiv.style.display = "none";
        popupContentDiv.parentElement.appendChild(helpContentDiv);
        
        helpContentDiv.id = "helpContentDiv_beverageEdit";
        popupContentDiv.id = "popupContentDiv_beverageEdit";
        
        helpButton.src = "helpButton_white.png";
        helpButton.onclick = function() {
            helpContentDivOpen = true;
            popupContentDiv.style.display = "none";
            helpContentDiv.style.display = "block";
            defocus.onclick = function() {
                beverageEditTabNS.closeHelpContentDiv(helpContentDiv, popupContentDiv, defocus);
            }
        }
    },
    
    closeHelpContentDiv: function(helpContentDiv, popupContentDiv, defocus) {
        helpContentDivOpen = false;                
        popupContentDiv.style.display = "block";
        helpContentDiv.style.display = "none";
        if (currentPopupTab == 1) defocus.onclick = "";
        else defocus.onclick = function() { closeBeverageEditPopup() };
    },
};

function fillPopupEditTab (tabContentDiv, beverage, clickedTableRow) {
    tabContentDiv.innerHTML = "";
    
    var r1 = document.createElement("div");
    r1.className = "beverageEditPopupRow";
    var countLabel = document.createElement("p");
    countLabel.dataset.locale = "stock count:";
    countLabel.style.display = "inline-block";
    var countInputField = document.createElement("input");
    countInputField.type = "text";
    countInputField.placeholder = Math.abs(beverage.count);
    countInputField.maxLength = "4";
    countInputField.style.width = "45px";
    countInputField.value = "";
    countInputField.id = "countInputField_beverageEditPopup";
    r1.appendChild(countLabel);
    r1.appendChild(countInputField);
    
    var r2 = document.createElement("div");
    r2.className = "beverageEditPopupRow";
    var priceLabel = document.createElement("p");
    priceLabel.dataset.locale = "pub price:";
    priceLabel.style.display = "inline-block";
    var priceInputField = document.createElement("input");
    priceInputField.type = "text";
    priceInputField.placeholder = beverage.price;
    priceInputField.maxLength = "4";
    priceInputField.style.width = "45px";
    priceInputField.value = "";
    priceInputField.id = "priceInputField_beverageEditPopup";
    r2.appendChild(priceLabel);
    r2.appendChild(priceInputField);
    
    var r3 = document.createElement("div");
    r3.className = "beverageEditPopupRow";
    var obsoleteLabel = document.createElement("p");
    obsoleteLabel.dataset.locale = "obsolete (don't order new ones):";
    obsoleteLabel.style.display = "inline-block";
    var obsoleteCheckbox = document.createElement("input");
    obsoleteCheckbox.type = "checkbox";
    obsoleteCheckbox.checked = (beverage.count.toString().charAt(0)=="-") ? true : false;
    
    
    obsoleteCheckbox.id = "obsoleteCheckbox_beverageEditPopup";
    r3.appendChild(obsoleteLabel);
    r3.appendChild(obsoleteCheckbox);
    
    var r4 = document.createElement("div");
    r4.className = "beverageEditPopupRow";
    var lowLimitLabel = document.createElement("p");
    lowLimitLabel.dataset.locale = "stock status low limit:";
    lowLimitLabel.style.display = "inline-block";
    var lowLimitInputField = document.createElement("input");
    lowLimitInputField.type = "text";
    lowLimitInputField.placeholder = beverage.stockStatusLowLimit;
    lowLimitInputField.maxLength = "4";
    lowLimitInputField.style.width = "45px";
    lowLimitInputField.value = "";
    lowLimitInputField.id = "lowLimitInputField_beverageEditPopup";
    r4.appendChild(lowLimitLabel);
    r4.appendChild(lowLimitInputField);
    
    var r5 = document.createElement("div");
    r5.className = "beverageEditPopupRow";
    var emailAdressLabel = document.createElement("p");
    emailAdressLabel.dataset.locale = "default email adress:";
    emailAdressLabel.style.display = "inline-block";
    var emailAdressInputField = document.createElement("input");
    emailAdressInputField.type = "text";
    emailAdressInputField.placeholder = beverage.emailAdress;
    emailAdressInputField.style.width = "200px";
    emailAdressInputField.value = "";
    emailAdressInputField.id = "emailAdressInputField_beverageEditPopup";
    r5.appendChild(emailAdressLabel);
    r5.appendChild(emailAdressInputField);
    
    var r6 = document.createElement("div");
    //r6.className = "beverageEditPopupRow";
    r6.style.lineHeight = "40px";                               //!
    var emailTextLabel = document.createElement("p");
    emailTextLabel.dataset.locale = "default email text:";
    emailTextLabel.style.display = "inline-block";
    var emailTextArea = document.createElement("textarea");
    emailTextArea.value = beverage.emailText;
    emailTextArea.id = "emailTextArea_beverageEditPopup";
    emailTextArea.style.height = "105px";
    emailTextArea.style.display = "inline-block";
    r6.appendChild(emailTextLabel);
    r6.appendChild(emailTextArea);
    
    var r7 = document.createElement("div");
    r7.className = "beverageEditPopupRow";
    var generateOrderLabel = document.createElement("p");
    generateOrderLabel.dataset.locale = "generate order now:";
    generateOrderLabel.style.display = "inline-block";
    var generateOrderButton = document.createElement("input");
    generateOrderButton.type = "button";
    generateOrderButton.id = "generateOrderButton_beverageEditPopup";
    generateOrderButton.dataset.value = "do it";
    generateOrderButton.disabled = (beverage.hasGeneratedOrder || obsoleteCheckbox.checked) ? true : false;
    obsoleteCheckbox.onclick = function() { generateOrderButton.disabled = obsoleteCheckbox.checked; };
    generateOrderButton.onclick = function() { 
        localStorage.setItem(beverage.id + "_orderGenerated", "");
        obsoleteCheckbox.checked = false;
        beverage.hasGeneratedOrder = true;
        this.disabled = true;
    };
    r7.appendChild(generateOrderLabel);
    r7.appendChild(generateOrderButton);
    
    
    var cancelButton = document.createElement("input");
    cancelButton.type = "button";
    cancelButton.dataset.value = "cancel";
    cancelButton.className = "cancelButton";
    cancelButton.onclick = function() {
        /*it is possible to deselect obsolete checkbox, click generate order and then cancel ->and generate an order for an             obsolete beverage. therfore is the following needed: */
        for (var i=0; i<allBeveragesList.length; i++)
            removeGeneratedOrderFromLocalStorage(allBeveragesList[i]);
        //...
        
        closeBeverageEditPopup(); 
    };

    var confirmButton = document.createElement("input");
    confirmButton.type = "button";
    confirmButton.dataset.value = "confirm";
    confirmButton.className = "confirmButton";
    confirmButton.onclick = function() { confirmBeverageEditPopup(beverage, clickedTableRow, 
                                                                  countInputField, priceInputField, 
                                                                  obsoleteCheckbox, lowLimitInputField,
                                                                  emailAdressInputField, emailTextArea); };    
    var r8 = document.createElement("div");
    r8.id = "buttonsTempDiv";
    //r8.style.position = "absolute";
    //r8.style.bottom = "0";
    r8.appendChild(cancelButton);
    r8.appendChild(confirmButton);
    
    
    tabContentDiv.appendChild(r1);
    tabContentDiv.appendChild(r2);
    tabContentDiv.appendChild(r3);
    tabContentDiv.appendChild(r4);
    tabContentDiv.appendChild(r7);
    tabContentDiv.appendChild(r5);
    tabContentDiv.appendChild(r6);
    tabContentDiv.appendChild(r8);
}

function fillPopupInfoTab (tabContentDiv, beverage) {
    tabContentDiv.innerHTML = "";
    infoObj = getAdditionalBeverageInfoFromDatabase(beverage.id);
    infoObj.sbl_price = beverage.allPrices.sbl_price;
    infoObj.pub_price = beverage.allPrices.pub_price;
    infoObj.price = beverage.allPrices.price;
    
    for (var key in infoObj) {
        if (infoObj.hasOwnProperty(key)) {            
            var row = document.createElement("p");
            row.innerHTML = key + ": " + infoObj[key];
            row.className = "beverageEditPopupRow";
            
            tabContentDiv.appendChild(row);
        }
    }
}

function getAdditionalBeverageInfoFromDatabase(id) {
    var action = "beer_data_get";
    var additionalParameters = "beer_id=" + id;
    var data = serverRequest(action, additionalParameters, "get");
    return data[0];
}



function confirmBeverageEditPopup(beverage, clickedTableRow, countInputField, priceInputField, 
                                   obsoleteCheckbox, lowLimitInputField, emailAdressInputField, emailTextArea) {
    var ok = true;
    if (!validateNumInputFieldText(countInputField.value, true)) {
        ok = false;
        countInputField.parentElement.style.borderColor = "red";
    }
    if (!validateNumInputFieldText(priceInputField.value, true, true)) {
        ok = false;
        priceInputField.parentElement.style.borderColor = "red";
    }
    if (!validateNumInputFieldText(lowLimitInputField.value, true)) {
        ok = false;
        lowLimitInputField.parentElement.style.borderColor = "red";
    }
    
    if (ok) {
        if (countInputField.value != "") beverage.newCount = countInputField.value; //newCount just temporary
        else beverage.newCount = beverage.count;
        if (priceInputField.value != "") beverage.price = priceInputField.value;
        if (lowLimitInputField.value != "") beverage.stockStatusLowLimit = lowLimitInputField.value;
        if (emailAdressInputField.value != "") beverage.emailAdress = emailAdressInputField.value;
        if (emailTextArea.value != "") beverage.emailText = emailTextArea.value;
        
        if (obsoleteCheckbox.checked && beverage.newCount != "0") {
            localStorage.removeItem(beverage.id + "_orderGenerated");
            beverage.newCount = "-" + Math.abs(beverage.count);
        }
        else beverage.newCount = Math.abs(beverage.newCount);
        
        updateBeverageDataInDatabase(beverage);
        closeBeverageEditPopup();
    }else {
        setTimeout(function() {
            countInputField.parentElement.style.borderColor = "transparent";
            priceInputField.parentElement.style.borderColor = "transparent";
            lowLimitInputField.parentElement.style.borderColor = "transparent";
        }, 2000);
    }
}

function closeBeverageEditPopup() {
    var helpButton = document.getElementById("helpButton_beverageEdit");
    helpButton.id = "helpButton";
    document.getElementById("mainBody").appendChild(helpButton);
    helpButton.style.visibility = "hidden";
    helpButton.onclick = function() { openPopup("help") };
    currentPopupTab = 1;
    if (systemEnvironment.theme == "white")
        document.getElementById("helpButton").src = "helpButton_black.png";
    
    closePopup();
}

function updateBeverageDataInDatabase(beverage) {
    setBeverageAmountAndPriceInDatabase(beverage.id, (Number(beverage.newCount)-Number(beverage.count)), beverage.price);
    beverage.count = beverage.newCount;
    //defaultEmailAdress, defaultEmailText, stockStatusLowLimit not implemented in database (so no save)
}