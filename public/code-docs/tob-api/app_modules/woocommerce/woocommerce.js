const WooCommerceAPI = require('woocommerce-api');

const qp = require('../connect/connect_test_PGP.js').query
const tx 		= require('../connect/connect_test_PGP.js').tx
const db 		= require('../connect/connect_test_PGP.js').db
 

const WooCommerce = new WooCommerceAPI({
  url: 'http://www.take-outbuddy.com',
  consumerKey: 'ck_be6cecfd3a222a02f030493f2a1488c9dc36b12b',
  consumerSecret: 'cs_44c94d3e15040d131dac04c0d4b83b0eccadc8de',
  wpAPI: true,
  wpAPIPrefix: 'wc-api'
});

//this function imports all the item data from woocommerce into the database.
function getProducts(data){
  return new Promise((resolve, reject) => {
    //console.log(WooCommerce);
    return WooCommerce.getAsync('products').then((result, error) => {
      //return JSON.parse(result.toJSON().body);
      if(!error){
        //have to insert all the items into the database.
        var x = JSON.parse(result.toJSON().body);
        console.log(x.products);
        var products = x.products;

        var wc_ref, cat_name, wc_id, sku, price, sale_price, on_sale;
        var items = [];

        var i = 0;
        for(i =0; i < products.length; i++){
            //need to search for vendor id in database based on name.

            // insert cat name, cat id, woo com id, woo com refrence, sku, and vendor id
            console.log('');
            console.log('=====================================================')
            console.log('woocom reference', href); //changed to use wc v3 api
            console.log('cat name', products[i].categories[0]);
            console.log('woo com id', products[i].id);
            console.log('sku', products[i].sku);
            console.log('price', products[i].price);
            console.log('sale price', products[i].sale_price);
            console.log('on sale', products[i].on_sale);
            console.log('=====================================================')
            console.log('');


            var href = 'http://www.take-outbuddy.com/wc-api/v3/products/' + products[i].id;
             wc_ref = href;
             cat_name = products[i].categories[0];
             wc_id = products[i].id;
             sku = products[i].sku;
             price = products[i].price;
             sale_price = (products[i].sale_price == null) ? null : products[i].sale_price;
             on_sale =  products[i].on_sale;


             if(sale_price == null){
               console.log('SET SALE PRICE TO NULL');
             }
            var x = {"wc_ref" :  wc_ref, "cat_name": cat_name, "wc_id": wc_id, "sku": sku, "price": price, "sale_price": sale_price, "on_sale": on_sale }
            items[i] = x;
        }

        return items;
        resolve(); //this may not need to be here (need to test)

      }else{
        reject(error);
        //callback(error, null);
      }
    })
    .then(items =>{

      // 7/8/2018 - Note: Need to finish this route by adding some preliminary checks to determine if vendor exists in database before adding the items.

      var qry_string = "INSERT INTO item(woo_com_href, cat_name , woo_com_id, sku, price, sale_price, on_sale) VALUES"//forming the string => INSERT INTO "tmp"("col_a","col_b") VALUES + ('a1','b1'),('a2','b2')
      for(var i = 0; i < items.length; i++){
        qry_string = qry_string + `( '` + items[i].wc_ref + `','` + items[i].cat_name + `','` +  items[i].wc_id + `','` + items[i].sku +
         `','`  + items[i].price + `',` + items[i].sale_price + `,'` + items[i].on_sale + `' ),`;
      }
      qry_string = qry_string.replace(/.$/,";"); //string last comma and putting semicolon.
      console.log('HERE IS QUERY STRING:', qry_string);
      
      var promise = qp(qry_string, []).then(insert_result =>{
        console.log(insert_result);
        resolve(insert_result);
      })
      return tx([promise]);
    
    });

  })
}


//this function is used to verifiy the orders that are received and sent from WC to our api and retrieve the emails for
//the vendors involved with the purchase.
function retrieveMailList(data) {

  console.log('HERE IS SAMPLE DATA RECEIVED:', data);
  var vendQry = "SELECT name,email FROM vendors WHERE name = " //'Munchies Corner' OR name = 'TEST_STORE_1';
  var qry = "SELECT item.vendor_id, vendors.name AS vendors_name, vendors.email AS vendors_email, item.sku AS sku, item.price AS price, item.on_sale AS on_sale FROM item LEFT JOIN vendors ON  item.vendor_id = vendors.id WHERE item.sku =";
  var or = " OR sku =";

  //query that will be used to join the tables with necessary data of email, vendor id, and sku, and make sure to list the data from the skus provied (example):

  console.log(qry);
  for(var i = 0; i < data.length; i++){
    qry = qry + data[i].sku;
    if(i + 1 !== data.length)
      qry = qry + or;
  } 
  
  console.log('HERE IS QUERY STRING:', qry);

  var promise = qp(qry, []).then(result =>{
      console.log('Data length:',   data.length);
      console.log('Result length:', result.length)
    for(var i = 0; i < result.length; i++){
      //need to match item with qty
      for(var j = 0; j < data.length; j++){
        console.log('data sku: ' + data[j].sku + '===' + 'result sku: ' + result[i].sku);
        if(data[j].sku == result[i].sku)
          result[i].quantity = data[j].quantity;
      }
    }
    console.log('Here is the query result.', result);
    return result;
  });
  return tx([promise]);
}

function retrieveVendors() {
  var qry_string = "SELECT name FROM vendors;"
  console.log('HERE IS QUERY STRING:', qry_string);
  
  var promise = qp(qry_string, []);
  return tx([promise]);
}



//{"id":1,"name":"Munchies Corner","email":null,"phone":null
/*function test_heroku_dbCon() {
  //var qry_string = "INSERT INTO item(cat_name,woo_com_id, woo_com_href, sku, vendor_id) values($1, $2, $3, $4, $5);";
  // data input values:
  const values = [{col_a: 'TEST_STORE_1', col_b: 'EMAIL_1'}, {col_a: 'TEST_STORE_2', col_b: 'EMAIL_2'}];


  
  //Possible option is to cocatenate the above query string and use this isntead to insert multiple items. it is supported natively by psql.
  //need to check case when there are no items to insert. (IMPORTANT, also need to save pgp module with npm to package.json.)
  var qry_string = "INSERT INTO vendors(name, email) VALUES"
  //forming the string => INSERT INTO "tmp"("col_a","col_b") VALUES + ('a1','b1'),('a2','b2')
  for(var i = 0; i < values.length; i++){
    qry_string = qry_string + `('` + values[i].col_a + `','` + values[i].col_b + `'),`;
  }
  qry_string = qry_string.replace(/.$/,";"); //string last comma and putting semicolon.
  console.log('HERE IS QUERY STRING:', qry_string);
  
  var promise = qp(qry_string, []);
  return tx([promise]);
}*/



module.exports = {
  getProducts : getProducts,
  retrieveMailList : retrieveMailList,
  retrieveVendors: retrieveVendors

};