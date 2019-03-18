//example input
var vendors_receipts =[ { vendor_id: 1,
    vendors_name: 'Pizza Planet',
    vendors_email: 'felipecan22@gmail.com',
    sku: 2702,
    price: 8.99,
    on_sale: false,
    quantity: 5 },
     { vendor_id: 1,
     vendors_name: 'Munchies Corner',
     vendors_email: 'felipecan22@gmail.com',
     sku: 2602, price: 1.99, on_sale: true, quantity: 5 },
     { vendor_id: 1,
     vendors_name: 'Munchies Corner',
     vendors_email: 'felipecan22@gmail.com',
     sku: 2603, price: 3.99, on_sale: true, quantity: 2 } ]

var vendors = [{"name":"Pizza Planet"},{"name":"TEST_STORE_2"},{"name":"Munchies Corner"}];
//var vendors = [{"name":"Pizza Planet"},{"name":"Munchies Corner"}];
//expected output
    /**
     * --1--
     * Munchies Corner  Items:
     *  1. item 1 - price
     *  2. item 3 - price
     * 
     *  
     *  Munchies Corner receipt - subtotal - total
     * 
     * 
     * ---2--
     * Pizza Planet Items
     * 1. item 1 - price
     * 
     *  Pizza Planet receipt - subtotal - total
     */

 //<start>
    //forming dictionary
    var dict = {}; 
    for(i = 0; i < vendors.length; i++){
        dict[vendors[i].name] = [];
    }
    //var dict = { "Munchies Corner": [], "Pizza Planet":[]}; //(Hard coded)

    var receipts = [];

    //currently only putting together all the items and their prices
    for(i = 0; i < vendors_receipts.length; i++){
        try{
            dict[vendors_receipts[i].vendors_name].push({
                sku:   vendors_receipts[i].sku,
                price: vendors_receipts[i].price, //need to make sale price is retrieved if on sale. (check db for example above on item with sku 2602)
                qty: vendors_receipts[i].quantity,
                email: vendors_receipts[i].vendors_email
            });
        }
        catch{
            console.log('Vendor not found in vendor list, vendor name:', vendors_receipts[i].vendors_name);
        }
    }
    //form receipt  (use dict to list all items for each vendor in receipt and use )
    //remember to both create new table schema and modify current one to include item names, need to update 
    //current route that imports all items from WC to include the name.

    var vendorsOrderInfo = [];
    for(vendor in dict){
        var info = {};
        console.log('');
        console.log(vendor);

        var items_list = "";
        try{
            var vendors_items = dict[vendor]; 
            var i = 1;
            var total = 0;
            vendors_items.forEach(item => {
                items_list = items_list + " \n "+ i +". SKU " + item.sku + " ($" + item.price + " x " + item.qty 
                + ") >> SUB TOTAL " +  (item.price * item.qty);
                total = total + (item.price * item.qty);
                i++;
            });
            items_list = items_list + "\n Total (+taxes):" + (total + (total * 0.0825)).toFixed(2);//hardcoded

            console.log(items_list);
            info.vendor_name = vendor;
            info.item_name = "(NULL)"
            info.email = dict[vendor][0].email;
            info.receipt = items_list;

            vendorsOrderInfo.push(info);
        }
        catch{}
    }

    console.log('');
    console.log('Completed Object to send emails with totals/receipt/email:\n')
    console.log(vendorsOrderInfo);
    console.log('');

//<end>