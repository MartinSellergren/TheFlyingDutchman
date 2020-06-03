function openIncomingInventoryTab(table) {
    document.getElementById("helpButton").style.visibility = "visible";
    sentOrdersList = [];
    mirrorSentOrdersListFromLocalStorage();
    
    if (sentOrdersList.length == 0) {
        var caption = document.createElement("caption");
        caption.dataset.locale = "There are no sent orders.";
        table.appendChild(caption);
        return;
    }
    
    sentOrdersList.sort( function(a, b) {
        if (Date.parse(a.dateSent) < Date.parse(b.dateSent)) return -1;
        else if (Date.parse(a.dateSent) > Date.parse(b.dateSent)) return 1;
        else return a.name.localeCompare(b.name);
    });
    fillIncomingInventoryTable(table);
}

function mirrorSentOrdersListFromLocalStorage() {   //make sure allBeveragesList is filled before called
    for (var i=0; i<allBeveragesList.length; i++) {
        var beverage = allBeveragesList[i];
        if (localStorage.getItem(beverage.id + "_orderSent") != null) {
            var name = beverage.name;
            var price = beverage.price;
            var dateSent = localStorage.getItem(beverage.id + "_dateOrderSent");
            var emailAdress = localStorage.getItem(beverage.id + "_emailAdress");
            var emailText = localStorage.getItem(beverage.id + "_emailText");
            sentOrdersList.push( {"id":beverage.id, "name":name, "price":price, "dateSent":dateSent,
                                  "emailAdress":emailAdress, "emailText":emailText} );
        }
    }
}

function fillIncomingInventoryTable(table) {
    var captionText = "These are the sent orders. Mark the ones which have been answered<br>" + 
        "and set the incoming count.";
    var buttonText = "update stock";
    var headerList = ["name", "date sent"];
    var useCheckboxes = true;
    var checkboxesChecked = false;
    var contentList = [];
    for (var i=0; i<sentOrdersList.length; i++) {
        order = sentOrdersList[i];
        contentList.push( [order.id, order.name, order.dateSent] ); //N.B always send id, then useId=false
    }
    var useNumInput = true;
    var useId = false;
    
    fillTable(table, captionText, buttonText, headerList,
              useCheckboxes, checkboxesChecked, contentList, useNumInput, useId);
    incomingInventoryTabNS.addListeners();
}



var incomingInventoryTabNS = {
    fillPopupDiv_help: function(helpTextP) {
        helpTextP.dataset.locale = "help text, incoming inventory-tab";
    },
    
    addListeners: function() {
        document.getElementById("tableButton").onclick = function() { incomingInventoryTabNS.updateStock(); };
        //document.getElementById("selectAll_checkbox").style.visibility = "hidden";
        
        var name_td_list = document.getElementsByClassName("name_td");
        for (var i=0; i<name_td_list.length; i++) {
            (function() {
                var j = i;
                name_td_list[j].onclick = function() { openPopup(sentOrdersList[j]); };
            })();
        }
        
        
        var innerCheckbox = document.getElementsByClassName("innerCheckbox");
        for (var i=0; i<innerCheckbox.length; i++) {
            (function() {
                var j = i;
                var checkbox = innerCheckbox[j];
                checkbox.onchange = function() {
                    var numInputField = checkbox.parentElement.parentElement.children[3].children[0];
                    if (checkbox.checked) {
                        numInputField.disabled = false;
                        numInputField.style.borderColor = "red";
                        disableTableButton(true);
                    }else {
                        numInputField.disabled = true;
                        numInputField.style.borderColor = "transparent";
                        numInputField.value = "";
                        if (isAllNumInputFieldsOkay()) disableTableButton(false);
                        if (!isAnyInnerCheckboxSelected()) disableTableButton(true);
                    }
                };
            })();
        }
        
        
        var numInputFields = document.getElementsByClassName("numInputField");
        for (var i=0; i<numInputFields.length; i++) {
            (function() {
                var j = i;
                numInputFields[j].onkeyup = function() {
                    if (validateNumInputFieldText(numInputFields[j].value))
                        numInputFields[j].style.borderColor = "transparent";
                    else numInputFields[j].style.borderColor = "red";
                
                    if (isAllNumInputFieldsOkay()) disableTableButton(false);
                    else disableTableButton(true);
                };
                numInputFields[j].onfocus = function() {
                    numInputFields[j].parentElement.parentElement.classList.add("numInputFieldEditFocus");
                };
                numInputFields[j].onblur = function() {
                    numInputFields[j].parentElement.parentElement.classList.remove("numInputFieldEditFocus");
                };
            })();
        }
    },
    
    updateStock: function() {
        if (!confirm("Are you sure you want to update stock?")) return;    //confirmation
        var updateBeveragesList = incomingInventoryTabNS.generateUpdateBeveragesList();
        for (var i=0; i<updateBeveragesList.length; i++) {
            setBeverageAmountAndPriceInDatabase(updateBeveragesList[i].id, updateBeveragesList[i].amount, 
                                               updateBeveragesList[i].price);
            removeSentOrderFromLocalStorage(updateBeveragesList[i]);
        }
        openTab(2);
    },
    
    generateUpdateBeveragesList: function() {
        var numInputFields = document.getElementsByClassName("numInputField");
        var updateBeveragesList = [];

        for (var i=0; i<numInputFields.length; i++) {
            if (validateNumInputFieldText(numInputFields[i].value))
                updateBeveragesList.push({"id":sentOrdersList[i].id, "amount":numInputFields[i].value,
                                          "price":sentOrdersList[i].price});
        }
        return updateBeveragesList;
    },
};
        
function isAllNumInputFieldsOkay() {
    var inputFields = document.getElementsByClassName("numInputField");
    for (var i=0; i<inputFields.length; i++) {
        if (inputFields[i].disabled) continue;
        if (!validateNumInputFieldText(inputFields[i].value)) return false;
    }
    return true;
}

function isDigit(n) {
    for (var i=0; i<10; i++) if (n == i.toString()) return true;
    return false;
}