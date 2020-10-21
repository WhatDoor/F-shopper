json = require('./dump')

let HAYSTACK = json.content
let data = {}

//Rough Chop to get each item
let blocks = HAYSTACK.split("View more options")

for (item of blocks) {
    console.log(item);
    console.log("===================================================================");

    //Process the rough chop to populate json
    
    //NAME
    let item_name_list = item.match('(?<=title=\\").*?(?=\\")');
    let item_name = ""

    if (item_name_list == null) {
        continue; //Skip over if name can't be found
    } else {
        item_name = item_name_list[0]

        //Special Char formatting - this is not a great long term solution, either parse as UTF-8 when comparing or find a way to convert dynamically
        item_name = item_name.replace(/&#8217;/g, "\'")
        item_name = item_name.replace(/&#039;/g, "\'")
        item_name = item_name.replace(/&amp;/g, "&")
        item_name = item_name.replace(/&ntilde;/g, "n")
        item_name = item_name.replace(/l&eacute;/g, "n")

        data[item_name] = {};
    }

    //Half Price Item
    let half_special_list = item.match('sf-halfspecial');

    if (half_special_list == null) {
        data[item_name]['half_special'] = false
    } else {
        data[item_name]['half_special'] = true
    }

    //2 for 1 price item
    let two_for_one = false;
    let two_for_one_list = item.match('saleoptiondesc\\">2 for');
    if (two_for_one_list != null) {
        two_for_one = true
    }

    //Regular Price - get start index and end index then get substring. 
    let regular_price_list = null;

    //No regular price for two for x price items
    if (two_for_one) {
        data[item_name]['regular_price'] = undefined

    } else {
        //Multi Stage check required because how the regular price is listed is not consistent
        regular_price_list = item.match('(?<=Was ).*?(?=, Save)');

        if (regular_price_list == null) {
            regular_price_list = item.match('(?<=regprice\\\">).*?(?=<\\\/span)');
        }
        
        if (regular_price_list == null) {
            data[item_name]['regular_price'] = undefined
        } else {
            regular_price = regular_price_list[0]
            data[item_name]['regular_price'] = regular_price
        }
    }

    //Sale Price
    let sale_price_list = item.match('(?<=pricedisplay\\\"\>).*?(?=<\\\/span)')

    if (sale_price_list == null) {
        data[item_name]['sale_price'] = undefined
    } else {
        sale_price = sale_price_list[0]

        //Divide price down by 2 to get single unit price
        if (two_for_one) {
            sale_price = "$" + String(parseFloat(sale_price.slice(1))/2)
        }

        data[item_name]['sale_price'] = sale_price
    }

    //Comparative Price
    let comparative_price_list = item.match('(?<=comparativeText\\\"\>).*?(?=<\\\/p>)')

    if (comparative_price_list == null) {
        data[item_name]['comparative_price'] = undefined
    } else {
        comparative_price = comparative_price_list[0]
        data[item_name]['comparative_price'] = comparative_price
    }

    //Amount Saved
    let reg_p = data[item_name]['regular_price']
    let sale_p = data[item_name]['sale_price']

    if (reg_p != undefined && sale_p != undefined) {
        data[item_name]['amount_saved'] = "$" + String(parseFloat(reg_p.slice(1)) - parseFloat(sale_p.slice(1)))
    } else {
        data[item_name]['amount_saved'] = undefined
    }
    
}

console.log(data);
