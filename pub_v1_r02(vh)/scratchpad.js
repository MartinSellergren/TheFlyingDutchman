
var request = "http://pub.jamaica-inn.net/fpdb/api.php?username=aamsta&password=aamsta&action=purchases_get"
var result = httpGet(request);
console.log("The result data", result);
var parseResult = JSON.parse(result);
var data = parseResult['payload'];

var categories = {};

for (var i = 0; i < data.length-1 ; i++) {
  
    console.log("-------------------")

    
    var request2 = "http://pub.jamaica-inn.net/fpdb/api.php?username=aamsta&password=aamsta&action=beer_data_get&beer_id=" + data[i].beer_id;
    var result2 = httpGet(request2);
    var parseResult2 = JSON.parse(result2);
    var beerdata = parseResult2['payload'];
    console.log("beerdata", beerdata);
    if (beerdata.length != 1) {
        continue;
    }
    categories[beerdata[0].varugrupp] = beerdata[0].varugrupp;
    
    var beer_cat = beerdata[0].varugrupp.toLowerCase();
    
    console.log(beer_cat);
    if (beer_cat.indexOf('alkohol') > 0) {
        console.log('Alkoholfritt! 1')
        }
        
      else   if (beer_cat.indexOf('öl') > 0) {
        console.log('Öl 2')
        }
        
    else   if (beer_cat.indexOf('vin') > 0) {
        console.log('Vin! 3')
        }
    else   if (beer_cat.indexOf('cider') > 0) {
        console.log('Cider 4')
        }
    else   if (beer_cat.indexOf('blanddryck') > 0) {
        console.log('Blanddrycker 5')
        }
    
     console.log("-------------------")
    
}

console.log("catts:");
console.log(categories);



console.log("okay");

/*
Exception: beerdata[0] is undefined
@Scratchpad/6:19:5
*/
/*
Exception: missing ; before statement
@Scratchpad/6:24
*/
/*
Exception: missing ) after condition
@Scratchpad/6:26
*/
