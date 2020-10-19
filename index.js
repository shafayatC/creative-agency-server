const express = require('express'); 
const cors = require('cors');
const bodyParser = require('body-parser'); 
const fileUpload = require('express-fileupload');
require('dotenv').config()
// mongodb
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.q1oby.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express(); 
// default options
app.use(fileUpload());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


client.connect(err => {
  const adminCollection = client.db(process.env.DB_NAME).collection("adminList");
  const serviceCollection = client.db(process.env.DB_NAME).collection("service");
  const orderCollection = client.db(process.env.DB_NAME).collection("order");
  const reviewCollection = client.db(process.env.DB_NAME).collection("review");

  // add new admin
    app.post('/addAdmin', (reg, res)=>{
        const addAdmin = reg.body;
        console.log(reg.body);
        serviceCollection.insertOne(addAdmin)
        .then(function(result) {
          res.send(result.insertedCount > 0);
        })
    })

   //  check admin login 
    app.post('/adminCheck', (reg, res)=> {

        console.log("body check : " +reg.body.email); 
        adminCollection.find(reg.body)
        .toArray((err, documents) => {
            console.log(documents)
            res.send(documents.length > 0);
        })

   })   
 
   // add service with file 
   app.post('/addService', function(req, res) {

      const file = req.files.file; 
      const name = req.body.name; 
      const description = req.body.description; 
      const newImg = file.data;
      const encImg = newImg.toString('base64');
 
      var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
      };

      serviceCollection.insertOne({name, description, image})
      .then(result=> res.send(result.insertedCount > 0))
      
      if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }

  })

  // show all service 
  app.get('/serviceList', (req, res)=> {
    serviceCollection.find()
    .toArray((err, documents) => {
        res.send(documents);
    })

  })

  //post an order by user
  app.post('/orderService', (req, res) =>{
    
    const name = req.body.name; 
    const email = req.body.email; 
    const service = req.body.service;  
    const detail = req.body.detail;  
    const price = req.body.price;  
    const status = req.body.status; 
    const icon= req.body.icon; 
    // image upload 
    const file = req.files.file; 
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
        contentType: file.mimetype,
        size: file.size,
        img: Buffer.from(encImg, 'base64')
    };

    orderCollection.insertOne({name, email, service, detail, price, image, icon, status})
      .then(result=> res.send(result.insertedCount > 0))
    }) 

  // show user order stutus 
  app.get('/userOrderList/:email', (req, res) => {

    orderCollection.find({email: req.params.email})
    .toArray ( (err, documents) =>{
      res.send(documents);
    })

  })
  // show all order stutus 
  app.get('/userOrderList', (req, res) => {

      orderCollection.find()
      .toArray ( (err, documents) =>{
        res.send(documents);
      })

  })
  // update the order status
  app.patch('/updateOrderStatus/:id', (req, res)=>{

        console.log("id: " +req.params.id + "status : " + req.body.status);
        
        orderCollection.updateOne({ _id: ObjectId(req.params.id)},
          { $set: { status: req.body.status}
        })
        .then(function(result) {
          console.log(result)
        })    
        
  })
  
// add  review 
  app.post('/addReview', (reg, res)=>{
    const review = reg.body;

    reviewCollection.insertOne(review)
    .then(function(result) {
      res.send(result.insertedCount > 0);
    })
  })
// show reviews
  app.get('/reviewList', (req, res) => {

    reviewCollection.find()
    .toArray ( (err, documents) =>{
      res.send(documents);
    })

  })
   //root url 
    app.get('/', (reg, res) => {
        res.send("products");
    })
 
});


app.listen(process.env.PORT || '4000')