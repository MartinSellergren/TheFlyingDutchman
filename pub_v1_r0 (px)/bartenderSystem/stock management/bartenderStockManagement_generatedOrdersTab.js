function openGeneratedOrdersTab(table) {
    document.getElementById("helpButton").style.visibility = "visible";
    var action = "inventory_get";
    var additionalParameters = "";
    var data = serverRequest(action, additionalParameters, "get");
    
    generatedOrdersList = [];
    allBeveragesList = [];
    
    //fill generatedOrdersList (and allBeveragesList)
    for (var i=0; i<data.length; i++) {
        var beverage = data[i];
        var id = beverage.beer_id;
        var name = beverage.namn;
        if (beverage.namn2.length > 0) name = name + " (" + beverage.namn2 + ")";
        var count = beverage.count;
        var price = beverage.pub_price;
        
        /*var emailAdress = beverage.orderEmailAdress;
        var emailText = beverage.orderEmailText;
        var stockStatusLowLimit = beverage.stockStatusLowLimit;*/
        //not implemented in database so default values from bartenderStockManagement.js:
        emailAdress = DEFAULT_EMAIL_ADRESS;
        emailText = DEFAULT_EMAIL_TEXT;
        stockStatusLowLimit = DEFAULT_STOCK_STATUS_LOW_LIMIT;
        if (emailText == "default") emailText = generateDefaultEmailText(name);
        
        var orderData = {"id":id, "name":name, "count":count, "emailAdress":emailAdress,
                         "emailText":emailText, "stockStatusLowLimit":stockStatusLowLimit, "price":price};
        allBeveragesList.push(orderData);
        
        if (!testIfToPushOrderToGeneratedOrdersList(orderData)) continue;
        generatedOrdersList.push(orderData);
    }
    pushGeneratedOrdersListToLocalStorage();
    
    
    if (generatedOrdersList.length == 0) {
        var caption = document.createElement("caption");
        caption.dataset.locale = "There are no generated orders.";
        table.appendChild(caption);
        return;
    }
    
    generatedOrdersList.sort(sortOrders);
    fillGeneratedOrdersTable(table);
}

function fillGeneratedOrdersTable(table) {
    var captionText = "";
    var buttonText = "send";
    var headerList = ["name", "in stock"];
    var useCheckboxes = true;
    var checkboxesChecked = true;
    var contentList = [];
    for (var i=0; i<generatedOrdersList.length; i++) {
        beverage = generatedOrdersList[i];
        contentList.push( [beverage.id, beverage.name, beverage.count] );
    }
    var useNumInput = false;
    var useId = false;
    
    fillTable(table, captionText, buttonText, headerList, useCheckboxes,
              checkboxesChecked, contentList, useNumInput, useId);
    generatedOrdersTabNS.addListeners();
    document.getElementsByTagName("caption")[0].style.height = "25px";
}

function setAllCheckboxes(state) {
    var checkboxes = document.getElementsByClassName("innerCheckbox");
    for (var i=0; i<checkboxes.length; i++) {
        checkboxes[i].checked = state;
    }
    disableTableButton(!state);
}

function sendSelectedOrders() {
    if (!confirm("Are you sure you want to send the selected orders?")) return;    //confirmation
    
    var checkboxes = document.getElementsByClassName("innerCheckbox");
    for (var i=0; i<checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            var beverage = generatedOrdersList[i];
            storeSentOrderInLocalStorage(beverage);
            removeGeneratedOrderFromLocalStorage(beverage);
            sendEmail(beverage.emailAdress, beverage.emailText);
        }
    }
    openTab(1);
}

/*function getBeverageById(id) {
    for (var i=0; i<generatedOrdersList.length; i++)
        if (generatedOrdersList[i].id == id) return generatedOrdersList[i];
}*/

function sortOrders(a, b) {
    if (Number(a.count) < Number(b.count)) return -1;
    else if (Number(a.count) > Number(b.count)) return 1;
    else return a.name.localeCompare(b.name);
}

function testIfToPushOrderToGeneratedOrdersList(order) {    
    if (order.name.length == 0) return false;
    
    //allready generated?
    if (localStorage.getItem(order.id + "_orderGenerated") != null) return true;
    
    //allready sent?
    if (localStorage.getItem(order.id + "_orderSent") != null) return false;
    
    if (order.count < 0 || order.count > order.stockStatusLowLimit) return false;
    
    //else generate new order
    return true;
}

function toggleEditEmailDetails(button) {
    var emailAdressTextfield = document.getElementById("emailAdressTextfield");
    var emailTextArea = document.getElementById("emailTextArea");
    var emailPopupHelpText = document.getElementById("emailPopupHelpText");
    
    if (emailAdressTextfield.disabled) {
        emailAdressTextfield.disabled = false;
        emailTextArea.disabled = false;
        emailPopupHelpText.style.visibility = "visible";
    }
    else {
        emailAdressTextfield.disabled = true;
        emailTextArea.disabled = true;
        //emailPopupHelpText.style.visibility = "hidden";
    }
}

function confirmEmailPopup(beverage) {
    beverage.emailAdress = document.getElementById("emailAdressTextfield").value;
    beverage.emailText = document.getElementById("emailTextArea").value;
    closePopup();
}

function sendEmail(emailAdress, emailText) {
    //console.log("email sent:\n" + emailAdress + "\n" + emailText);   
}


var generatedOrdersTabNS = {
    fillPopupDiv_help: function(helpTextP) {
        helpTextP.dataset.locale = "help text, generated orders-tab";
    },
    
    addListeners: function() {
        document.getElementById("tableButton").onclick = function() { sendSelectedOrders(); };
        
        var selectAll_checkbox = document.getElementById("selectAll_checkbox");
        selectAll_checkbox.onchange = function() { setAllCheckboxes(selectAll_checkbox.checked); };
        if (generatedOrdersList.length < 2) selectAll_checkbox.style.visibility = "hidden";
        
        var name_td_list = document.getElementsByClassName("name_td");
        for (var i=0; i<name_td_list.length; i++) {
            (function() {
                var j = i;
                name_td_list[j].onclick = function() { openPopup(generatedOrdersList[j]); };
            })();
        }
        
        var innerCheckbox = document.getElementsByClassName("innerCheckbox");
        for (var i=0; i<innerCheckbox.length; i++) {
            innerCheckbox[i].onchange = function() {
                if (!isAnyInnerCheckboxSelected()) {
                    disableTableButton(true);
                    document.getElementById("selectAll_checkbox").checked = false;
                }
                else {
                    disableTableButton(false);
                }
            };
        }
    }
};


function pushGeneratedOrdersListToLocalStorage() {
    for (var i=0; i<generatedOrdersList.length; i++)
        storeGeneratedOrderInLocalStorage(generatedOrdersList[i]);
}