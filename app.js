
const express = require("express");
const bodyparser = require("body-parser");
// const date=require(__dirname+"/date.js");
const mongoose=require("mongoose");
const _ =require("lodash");

const app = express();

// const items = ['BuY foods', 'cook foods'];
// const workitem = [];

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://127.0.0.1:27017/wikiDB",{useNewUrlParser:true});


const itemschema={
    name:String

}
const Item =mongoose.model("Item",itemschema);

const item1=new Item({
    name : "welcome to list item"

});
const item2=new Item({
    name : "hit + button to add new item"

});

const item3=new Item({
    name : "hit this to delete"

});
const defaultItem=[item1,item2,item3];

const listschema={
    name:String,
    items:[itemschema]
};
const List=mongoose.model("List",listschema);

app.get("/", function (req, res) {
    
    Item.find({},function(err,founditems){
        if(founditems.length===0){
            Item.insertMany(defaultItem,function(err){
                if(err){
                    console.log(err);
                }
                else{
                    console.log("successfully saved items to db:");
                }
            });
                 
        res.redirect("/");
        }
    else{ 
        res.render("list", { listtitle: "Today", newlistitem: founditems });
    }
});

});
app.get("/:customlistname",function(req,res){
const customlistname=_.capitalize(req.params.customlistname);

List.findOne({name:customlistname},function(err,foundlist){
    if(!err){
        if(!foundlist){
            //create a new list
            const list=new List({
                name:customlistname,
                items:defaultItem
            });
            list.save();
            res.redirect("/"+customlistname);
        }
        else{
            //show an existing list
            res.render("list",{ listtitle: foundlist.name, newlistitem: foundlist.items});
        }
    }
});

});

app.post("/", function (req, res) {

    let itemName = req.body.newitem;
    let listname=req.body.list;

    const item=new Item({
        name:itemName
    });
    if(listname==="Today"){
          item.save();
        res.redirect("/");
         }
         else{
            List.findOne({name:listname},function(err,foundlist){
                foundlist.items.push(item);
                foundlist.save();
                res.redirect("/"+listname);
            })
         }

});
app.post("/delete",function(req,res){
const checkItemid=req.body.checkbox;
const listName=req.body.listname;
if(listName==="Today"){

    Item.findByIdAndRemove(checkItemid,function(err){
        if(!err){
            console.log("successfully deleted");
        }
    })
    res.redirect("/");
}
else{
    List.findOneAndUpdate({name:listName},{$pull: {items:{_id:checkItemid}}},function(err,foundlist){
if(!err){
    res.redirect("/"+listName);
}
    });
}
});


app.get("/about",function(req,res){
    res.render("about");
})

app.listen(3000, function () {
    console.log("port is running good::");
});