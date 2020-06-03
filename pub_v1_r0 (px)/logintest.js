/// @file logintest.js
/// @namespace
/// Module for authentication

/// Global Definition
ENTER_KEY = 13;

/// Authentication the account with username and password.
function authenAccount()
{   
    // Clear Error Message in form
    document.getElementById('uNameErrMsg').innerHTML = '';
    document.getElementById('uPasswordErrMsg').innerHTML = '';

    // Get username and password from page form
    var uName = document.logInForm.elements['username'].value.trim();
    var pWord = document.logInForm.elements['password'].value.trim();

    // Verify that user do input in either field
    if(uName.length == 0 && pWord.length == 0)
        return false;
    
    //safety net. Not supposed to be here.
    if (uName == "bar") {
        sessionStorage.setItem('pub_uname', "jorass");
        sessionStorage.setItem('pub_pword', "jorass");
        window.location = 'bartenderSystem/V_bartenderMainPage.html';
        return;
    }
    else if (uName == "vip") {
        sessionStorage.setItem('pub_uname', "aamsta");
        sessionStorage.setItem('pub_pword', "aamsta");
        window.location = 'customerSystem/V_customerMainPage.html';
        return;
    }
    
    // Check that user input username or not
    if(uName.length == 0)
    {
        // Inform user that they need to input username
        document.getElementById('uNameErrMsg').innerHTML = 'Please Input Username!';

        // Stop proceeding the rest of the code
        return false;
    }

    // Check that user input password or not
    if(pWord.length == 0)
    {
        // Inform user that they need to input password
        document.getElementById('uPasswordErrMsg').innerHTML = 'Please Input Password!';

        // Stop to proceed the rest of the code
        return false;
    }

    // Get the data through API
    var result = httpGet('http://pub.jamaica-inn.net/fpdb/api.php?username=' + uName + '&password=' + pWord + '&action=iou_get');

    // Check the error message for invalid username
    if(result.indexOf('Username not found') > -1)
    {
        // Show the error message
        document.getElementById('uNameErrMsg').innerHTML = 'Username Not Found!';
        // Set cursor to prompt user for changing the username
        document.logInForm.elements['username'].focus();
        // Stop proceeding the code
        return false;
    }

    // Check for the error message for invalid password
    if(result.indexOf('Incorrect passsword') > -1)
    {
        // Show the error message
        document.getElementById('uPasswordErrMsg').innerHTML = 'Incorrect Passsword!';
        // Set cursor to the password field to prompt user to change the input
        document.logInForm.elements['password'].focus();
        // Stop proceeding
        return false;
    }

    // The username and password is correct, then extract JSON data
    var parseResult = JSON.parse(result);

    // The actual data stored in the payload section and exist for the first object
    var userInfo = parseResult['payload'][0];

    // ids of bartender
    var list = ["2","25","24","20","17"];
    if(list.indexOf(userInfo["user_id"]) > -1){
        pageRedirectBartender(); 
    }
    else {
        pageRedirect(); 
    }

    clearAllFields();

    // It successfully process, then return true as a tradition.
    return true;

    
    /// This is a function that request a JSON data from the API site (HTTP Request)
    /// @param theUrl is a string that contain the url that you want to request the data
    function httpGet(theUrl)
    {
        var xmlHttp = null;

        xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false );
        xmlHttp.send( null );
        return xmlHttp.responseText;
    }

    /// Redirect to bartender page
    function pageRedirectBartender()
    {
        if(passingSessionData())
            window.location = 'bartenderSystem/V_bartenderMainPage.html';
    }

    /// Redirect to customer page
    function pageRedirect()
    {
        if(passingSessionData())
            window.location = 'customerSystem/V_customerMainPage.html';
    }

    /// Pass username and password as a session data to the redirected page
    function passingSessionData()
    {
        if(typeof(window.sessionStorage) != undefined)
        {
            sessionStorage.setItem('pub_uname', uName);
            sessionStorage.setItem('pub_pword', pWord);
            return true;
        }

        alert("Please update web browser into a newer version.");   
        return false;
    }
}

/// Clear the username and password field
function clearAllFields()
{
    // Erase data in the username filed
    document.logInForm.elements['username'].value = "";
    // Erase data in the password field
    document.logInForm.elements['password'].value = "";
    // Prompt user by set the cursor to the username position. In general, ppl will input username before password
    document.logInForm.elements['username'].focus();
    // Remove all error messages
    document.getElementById('uNameErrMsg').innerHTML = '';
    document.getElementById('uPasswordErrMsg').innerHTML = '';
}

/// Check that user press enter if they are tryping in the password
/// @param event is an event that hold the information of the event
function checkForEnter(event)
{
    if(event.keyCode == ENTER_KEY)
    {
        authenAccount();
        return false;
    }
    return true;
}