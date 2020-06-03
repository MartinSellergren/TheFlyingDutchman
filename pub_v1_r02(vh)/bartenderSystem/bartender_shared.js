/// @file bartender_shared.js
/// Some shared functions. Use is not widly implemented.

function setTextByLanguage(lang)
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
   
    for(var i = 0; i < data.length; i++)
        data[i].innerHTML = langPack[data[i].getAttribute("data-locale")];
    
    // data-placeholder
    data = getAllElementsWithAttribute("data-placeholder");
   
    for(var i = 0; i < data.length; i++)
        data[i].placeholder = langPack[data[i].getAttribute("data-placeholder")];
    
    // data-value
    data = getAllElementsWithAttribute("data-value");
   
    for(var i = 0; i < data.length; i++)
        data[i].value = langPack[data[i].getAttribute("data-value")];
    
    // Then, toggle the selected attribute
    if(lang == "en")
    {
        document.getElementById("enImgButton").setAttribute("class", "selectedImage imageButton");
        document.getElementById("svImgButton").setAttribute("class", "imageButton");
    }
    else if(lang == "sv")
    {
        document.getElementById("enImgButton").setAttribute("class", "imageButton");
        document.getElementById("svImgButton").setAttribute("class", "selectedImage imageButton");
    }

}

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

function getCredential(uname) {
    return (uname + 'pub').hashCode();
}

String.prototype.hashCode = function() {    
    var hash = 0, i, chr, len;

    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
};
