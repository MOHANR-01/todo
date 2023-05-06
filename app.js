const express = require("express") ;
const bodyParser = require("body-parser") ;
const mongoose = require("mongoose") ;
const _ = require("lodash") ;

const app = express() ;

app.set('view engine', 'ejs') ;

app.use(bodyParser.urlencoded({extended: true})) ;
app.use(express.static("public")) ;


//CONNECTING THE APP TO THE DB :
// const url = "mongodb://127.0.0.1:27017/todolistDB" ;
const url = "mongodb+srv://Mohan:MOHANR.1604@todo.oymfmoa.mongodb.net/todo?retryWrites=true&w=majority" ;
mongoose.connect( url, {useNewUrlParser: true} ) ;

//CREATING A SCHEMA :
const itemsSchema = new mongoose.Schema ({ name: String }) ;

const listSchema = new mongoose.Schema({
  name: String ,
  items: [itemsSchema]
}) ;

//CREATING A MODEL W.R.T THE ITEMS-SCHEMA :
const Item = mongoose.model( "Item", itemsSchema ) ;

const List = mongoose.model( "List", listSchema ) ;

const item1 = new Item({ name: "Item-1" }) ;
const item2 = new Item({ name: "Item-2" }) ;
const item3 = new Item({ name: "Item-3" }) ;

const defaultItems = [item1, item2, item3] ;



app.get("/", async (req, res) => {

  try 
  {  
    const foundItems = await Item.find({}) ;
    if (foundItems.length === 0) 
    {
      Item.insertMany( defaultItems ) ;
      res.redirect("/") ;
    }
    else 
    {
      res.render( "list", {listTitle: "Today", newListItems: foundItems }) ;
    }
  }
  catch (err) 
  {
    console.log(err.message);
  } ;

}) ;


app.get( "/:customListName", async (req, res) => {

  const customListName = _.capitalize(req.params.customListName) ;

  try 
  {
    const foundList = await List.findOne({name: customListName}) ;
    if (!foundList)
    {
      //CREATING A NEW LIST
      const list = new List({
        name: customListName ,
        items: defaultItems 
      }) ;
      list.save() ;

      res.redirect("/"+customListName) ;
    } 
    else 
    {
      //SHOWING AN EXISTING LIST
      res.render( "list", {listTitle: foundList.name, newListItems: foundList.items}) ;  
    }
  } 
  catch (err) 
  {
    console.log(err.message);
  }
}) ;


app.post( "/", async (req, res) => {

  const itemName = req.body.newItem ;
  const listName = req.body.list ;

  const item = new Item({ name: itemName }) ;

  if (listName === "Today") 
  {
    item.save() ;
    res.redirect("/") ;
  }
  else
  {
    try 
    {
      const foundList = await List.findOne( {name: listName} ) ;
      foundList.items.push(item) ;
      foundList.save() ;
      
      setTimeout(() => res.redirect("/" + listName) , 10) ;
    }
    catch (err) 
    {
      console.log(err.message);
    }
  }
}) ;


app.post( "/delete", async (req, res) => {

  const checkedItemId = req.body.checkBox ;
  const listName = req.body.listName ;

  if (listName === 'Today') 
  {  
    try 
    {
      await Item.findByIdAndDelete( checkedItemId ) ;
    }
    catch (err) 
    {
      console.log(err.message);
    }
    res.redirect("/") ;
  }
  else
  {    
    try 
    {
      await List.findOneAndUpdate( {name: listName}, {$pull: {items: {_id: checkedItemId}}} ) ;
      res.redirect("/" + listName) ;
    }
    catch (err)
    {
      console.log(err.message);
    }
  }

}) ;


app.get("/about", (req, res) => res.render("about") ) ;


//CREATING A SERVER :
app.listen(3000, () => console.log("Server started on port 3000") );