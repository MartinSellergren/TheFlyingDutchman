var langPack_en = {
    order: "ORDER",
    total: "Total",
    search: "Search",
    finish: "Finish",
    clear: "CLEAR",
	setting: "Settings",
    language: "Language:",
    theme: "Theme:",
    saveAndExit: "Save and Exit",
    logout: "Logout",
    inventory: "Inventory",
    help: "Help",
	searchText: "Search key word",
	clear: "CLEAR",
    category: "Category",
    purchases: "Purchases",
    shortcut: "drop shortcut here",
    credit: "Credit:",
    time: "Time",
    bname: "Name",
    price: "Price",
    cat: "All",
    catI: "Alchol Free",
    catII: "Beer",
    catIII: "Wine",
    catIV: "Cider",
    catV: "Mixed Drinks",
    resetTimer: "25 seconds left before log Out!<br>Do you need more time?",
    confirmYes: "Yes!",
    confirmNo: "No!",    
    welcome: "Welcome ",
    account: "Account",
    checkout: "Check Out",
    close: "Close",
    pay: "Pay",
    checkAll: "Check All",
    uncheckAll: "Uncheck All",
    randomBeer: "Random Beer",
    
     //inventory management
    "Generated orders": "Generated orders",
    "Incoming inventory": "Incoming inventory",
    "Beverage edit": "Beverage edit",
    "These are the sent o": "These are the sent orders. Mark the ones which have<br>been answered " + 
        "and set the incoming count.",
    "send to:": "send to:",
    "sent to:": "sent to:",
    "message:": "message:",
    "Changes will be lost when you": "<b>N.B.</b> Changes will be lost when you leave or refresh " +
                                        "this tab.<br>See help for more info.",
    "name": "name",
    "id": "id",
    "in stock": "in stock",
    "date sent": "date sent",
    "mark": "mark",
    "edit": "edit",
    "cancel": "cancel",
    "confirm": "confirm",
    "There are no generated orders.": "There are no generated orders.",
    "There are no sent orders.": "There are no sent orders.",
    "There are no beverages in the database.": "There are no beverages in the database.",
    "help text, beverage edit-tab": "<u>Help, beverage edit-tab</u><br><br><br>",
    "stock count:": "stock count:",
    "pub price:": "pub price:",
    "obsolete (don't order new ones):": "obsolete (don't order new ones):",
    "stock status low limit:": "stock status low limit:",
    "default email adress:": "default email address:",
    "default email text:": "default email text:",
    "generate order now:": "generate order now:",
    "do it": "do it",
    "send": "send",
    "update stock": "update stock",
    
    "help text, generated orders-tab": "<u>Help, generated orders-tab</u><br><br><br>" +
        "Here the generated inventory orders are listed. An order is generated if the stock count is low " +
        "or if you've manually generated a new order. Select the ones you wish to send and click the send button. " +
        "You can also edit the details of a specific order in the popup menu opened then you click on " +
        "a beverage name. But beware when you edit the details of a specific order. When you're done " +
        "editing you should send the order right away, because when you leave or refresh this tab, " + 
        "the details will be reverted back to default values. For permanent changes, use the beverage " +
        "edit-tab to edit those default values.",
    
    "help text, incoming inventory-tab": "<u>Help, incoming inventory-tab</u><br><br><br>" +
        "Here you can see the sent orders and " +
        "specify that a sent order has been answered - and update the stock thereby. " +
        "First check the checkbox in the mark column and then enter the newly arrived count. " +
        "This will be added to the current count for that beverage when you click the update " +
        "stock button. Note that this button will be unclickable unless you've " +
        "entered an integer for every checked row.",
    
    "beverage edit help": "<u>Help, beverage edit</u><br><br><br>" +
        "There are two tabs on this popup, under the edit-tab you edit the details for current beverage " + 
        "and on the info-tab, various information is listed." +
        "<br><br>Under the edit-tab:<br>" +
        "- 'stock count' manually sets the quantity in stock.<br>" +
        "- 'pub price' is the sale price in the pub.<br>" +
        "- 'obsolete' marks that the beverage should be taken out of stock. Sale continues as usual " + 
            "but no new orders appear in the generated orders-tab.<br>" +
        "- 'stock status low limit' is the limit that specifies if a beverage stock count is low. " +
            "When the stock count is same or under this limit, an order will be generated (unless obsolete beverage).<br>" +
        "- 'generate order now'-button will generate an order right away, regardless of stock count. " +
            "Not able to do if an order already exists or if beverage is obsolete.<br>" +
        "- 'default email address' is the default email address used in orders for this specific beverage.<br>" +
        "- 'default email text' is the default text in orders for this specific beverage."
};

var langPack_sv = {
    order: "Beställning",
    total: "Totalt",
    search: "Sök",
    finish: "Slutför",
    clear: "RENSA",
    setting: "Inställningar",
    language: "Språk:",
    theme: "Tema:",
    saveAndExit: "Spara och Avsluta",
    logout: "Logga Ut",
    inventory: "Inventering",
    help: "Hjälp",
	searchText: "Sök nyckelord",
	clear: "RENSA",
    category: "Kategori",
    purchases: "Tidigare Köp",
    shortcut: "Lägg Till Favorit",
    credit: "Saldo:",
    time: "Tid",
    bname: "Namn",
    price: "Pris",
    cat: "Alla",
    catI: "Alkoholfritt",
    catII: "Öl",
    catIII: "Vin",
    catIV: "Cider",
    catV: "Blanddrycker",
    resetTimer: "25 sekunder kvar till utloggning!<br>Behöver du mer tid?",
    confirmYes: "Ja!",
    confirmNo: "Nej!",     
    welcome: "Välkommen ",
    account: "Konto",
    checkout: "Kolla",
    close: "Stänga",
    pay: "Betala",
    checkAll: "Markera alla",
    uncheckAll: "avmarkera alla",
    randomBeer: "Slumpad Öl",
    
    //inventory management
    "Generated orders": "Nya beställningar",
    "Incoming inventory": "Besvarade beställningar",
    "Beverage edit": "Dryckesspecifika val",
    "These are the sent o": "Här listas de skickade beställningarna. Markera de som har <br>blivit besvarade " +
        "och fyll i antalet nyinkomna.",
    "send to:": "skicka till:",
    "sent to:": "skickat till:",
    
    "message:": "meddelande:",
    "Changes will be lost when you": "<b>N.B.</b> Ändringar går förlorade när du lämnar eller uppdaterar " +
                                        "denna flik.<br>Se hjälp för mer info.",
    "name": "namn",
    "id": "id",
    "in stock": "i lager",
    "date sent": "datum skickad",
    "mark": "markera",
    "edit": "ändra",
    "cancel": "avbryt",
    "confirm": "bekräfta",
    "There are no generated orders.": "Inga genererade beställningar.",
    "There are no sent orders.": "Inga skickade beställningar.",
    "There are no beverages in the database.": "Inga drycker i databasen.",
    "help text, beverage edit-tab": "hjälp text, ...",
    "stock count:": "lagerantal:",
    "pub price:": "pubpris:",
    "obsolete (don't order new ones):": "utgående dryck (inga nya beställningar):",
    "stock status low limit:": "låg-nivå för lagerstatus:",
    "default email adress:": "standard emailadress:",
    "default email text:": "standard emailtext:",
    "generate order now:": "generera order nu:",
    "do it": "kör",
    "send": "skicka",
    "update stock": "updatera lagret",
    
    
    "help text, generated orders-tab": "<u>Hjälp, nya beställningar</u><br><br><br>" +
        "Här listas de genererade beställningarna för nya drycker. En beställning är genererad om dess lagerstatus är " +
        "låg eller om du manuellt genererat en beställning. Markera de du önskar skicka och klicka på skicka-knappen. " +
        "Du kan också ändra en specifik beställning i popup-fönstret som öppnas när du klickar på en drycks namn. " +
        "Men se upp när du ändrar en specifik order. När du har ändrat klart " +
        "bör du skicka beställningen på en gång, för när du lämnar eller uppdaterar denna flik " + 
        "kommer beställningen återgå till sina standardvärden. För permanenta ändringar, använd " +
        "'dryckesspecifika val-fliken'.",
    
    "help text, incoming inventory-tab": "<u>Hjälp, besvarade beställningar</u><br><br><br>" +
        "Här kan du se de skickade beställningarna och " +
        "ange att en beställning har besvarats - och då också uppdatera dryckens lagerstatus. " +
        "Bocka först för kryssrutan för en beställning i markera-kolumnen, och ange sedan antalet nyinkomna drycker. " +
        "Detta kommer adderas till dryckens nuvarande lagerstatus när du klickar på 'uppdatera lagret-knappen'. " +
        "Notera att denna knapp ej går att klicka på om du inte angett ett heltal för varje ibockad rad.",
    
    "beverage edit help": "<u>Hjälp, dryckesspecifika val</u><br><br>" +
        "Det finns två flikar på denna popup, under fliken 'ändra' finns val för den aktuella drycken " + 
        "och under fliken 'info' listas diverse information om den." +
        "<br><br>Under fliken 'ändra':<br>" +
        "- 'lagerantal', för att manuellt sätta lagerantalet.<br>" +
        "- 'pubpris' är försäljningspriset i puben.<br>" +
        "- 'utgående dryck' anger att drycken ska tas ur sortimentet. Försäljningen fortsätter som vanligt " + 
            "men inga nya beställningar uppträder under 'nya beställningar-fliken'.<br>" +
        "- 'låg-nivå lagerstatus' är gränsen som anger att lagerstatusen är låg för aktuell dryck. " +
            "När lagerstatusen är lika med eller under denna gräns kommer en ny beställning genereras, " +
            "(såvida drycken ej är utgående).<br>" +
        "- 'generera order nu'-knappen genererar en ny order på direkten, oberoende av lagerstatus. " +
            "Ej möjligt om en beställning redan finns eller om drycken är utgående.<br>" +
        "- 'standard emailadress' är emailadressen som används för beställningar av denna dryck och ej annat anges.<br>" +
        "- 'standard emailtext' är emailtexten som används för beställningar av denna dryck och ej annat anges."
};