document.write("database test");

/*beer id: 1137903. array:payload-----------------------------------------------------------------------------------------

var action = "inventory_get";
{"namn", "namn2", "sbl_price", "pub_price", "beer_id", "count", "price"}

var action = "purchases_get";
{"namn", "namn2", "transaction_id", "user_id", "beer_id", "timestamp", "price"}

var action = "purchases_get_all";
{"namn", "namn2", "transaction_id", "user_id", "beer_id", "timestamp", "price", "first_name", "last_name", "username"}

var action = "purchases_append";
	var additionalParameter = "beer_id=..";
(minskar beer count med 1)

var action = "payments_get";
{"transaction_id", "user_id", "admin_id", "amount", "timestamp"}

var action = "payments_get_all";
{"admin_username", "timestamp", "amount", "admin_id", "username", "first_name", "last_name"}

var action = "payments_append";
	var additionalParameter = "amount=..";
user:xxx

var action = "iou_get";
{"user_id", "first_name", "last_name", "assets"}

var action = "iou_get_all";
{"username", "first_name", "last_name", "assets"}

var action = "beer_data_get";
	var additionalParameter = "beer_id=..";
{"nr", "artikelid", "varnummer", "namn", "namn2", "prisinklmoms", "volymiml", "prisperliter", "saljstart", "slutlev", "varugrupp", "forpackning", "forslutning", "ursprung", "ursprunglandnamn", "producent", "leverantor", "argang", "provadargang", "alkoholhalt", "modul", "sortiment", "ekologisk", "koscher"}

var action = "user_edit";
	var additionalParameter = "new_username=...&new_password=...&first_name=...&last_name=...&email=...&phone=...";
(går att updatera, ej skapa ny användare)

var action = "inventory_append";
	var additionalParameter = "beer_id=...&amount=..&price=..";
(price ändras ej. beer count ändras med amount)
-----------------------------------------------------------------------------------------------------------------------------*/

var user = "ervtod";

var action = "inventory_get";
	var additionalParameter = "";

/*--------------------------------*/

var pass = user;
var url = "http://pub.jamaica-inn.net/fpdb/api.php?username=" + user + "&password=" + pass + 
			"&action=" + action + "&" + additionalParameter;
console.log(url);

var req = new XMLHttpRequest();
req.open("Get", url, false);
req.send();
/*var array = JSON.parse(req.responseText);*/
var text = JSON.stringify(req.responseText, null, 2);

console.log(text);