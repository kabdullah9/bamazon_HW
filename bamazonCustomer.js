var mysql = require("mysql");
var inquirer = require("inquirer");
var cTable = require("console.table");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "bamazon_db"
});

connection.connect(function (err) {
  if (err) throw err;
  start();
});

function start() {
  inquirer
    .prompt({
      name: "products",
      type: "confirm",
      message: "would you like to select a product?",
    })
    .then(function (data) {
      if (data.products) {
        showList();
      }
      else {
        endBuy();
      }
    });
}

function endBuy() {
  connection.end();
  console.log("");
  console.log("Thank you for checking out out inventory! Have a good day!")
  console.log("");
}

function showList() {
  var query = connection.query("SELECT * FROM products", function (err, data) {
    if (err) throw err;
    console.log("");
    console.table(data);
    console.log("");
    buyItem();
  });
}

function buyItem() {
  inquirer.prompt([
    {
      name: "Item",
      type: "input",
      message: "Select the ID of the item you would like to buy?"
    },
    {
      name: "Stock",
      type: "input",
      message: "how much would you like to buy?"
    },
  ]).then(function (data) {
    
    var pIt = data.Item;
    var pSt = data.Stock;
    var query = "SELECT * FROM products WHERE item_id=" + pIt;

    connection.query(query, function (err, data2) {

      var num = data2.length;
      if (num > 0) {

        var qtyLeft = data2[0].stock_quantity;

        if (qtyLeft >= pSt) {
          var totalCost = data2[0].price * pSt;
          var newQty = qtyLeft - pSt;
          var query2 = "UPDATE products SET stock_quantity =" + newQty + " WHERE item_id=" + pIt;

          connection.query(query2, function (err, data3) {
            if (err) throw err;
            console.log("");
            console.log("order Complete!");
            console.log("");
            console.log("total Proce for" + pSt + "of the " + data2[0].product_name + "was: $" + totalCost);
            console.log("");
            showList();
          });
        } else {
          console.log("");
          console.log("insufficient amount!\n");
          console.log("");
          showList();
        }
      } else {
        console.log("");
        console.log("\nItem not found!!\n");
        console.log("");
        showList();

      }
    });
  })
}
