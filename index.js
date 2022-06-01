const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const port = process.env.PORT || 5000;


// verify token function
function verifyToken(token) {
	let email;
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
		if (err) {
			email = 'Invalid email'
		}
		if (decoded) {
			console.log(decoded)
			email = decoded
		}
	});
	return email;
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.z1u0v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
	try{
		await client.connect();
		console.log('db connected');
		const productCollection = client.db('fasionhouse').collection("products");
		const myCollection = client.db('fasionhouse').collection("myproducts");
		const blogCollection = client.db('fasionhouse').collection("blogs");
		const categoryCollection = client.db('fasionhouse').collection("categories");
		const bannerCollection = client.db('fasionhouse').collection("banners");

		// ===========================================
		//			Token Controller				//
		//============================================
		 app.post("/login", (req, res) => {
            const email = req.body;
			console.log(email);
            const token = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            res.send({ token });
        })

		// ===========================================
		//			Product Controller				//
		//============================================
		
		// POST Product
		app.post('/product', async (req, res) => {
			 const product = req.body;
			 const result = await productCollection.insertOne(product);
			 res.send(result);
		});

		// Update Product
		app.put('/product/:id', async (req, res)=>{
			const id = req.params.id;
			const product = req.body;
			const filter = {_id: ObjectId(id)};
			const options ={ upsert: true };
			const updateProduct = {
				$set:{
					title: product.title,
					description: product.description,
					price: product.price,
					quantity: product.quantity,
					supplier: product.supplier,
					review: product.review,
					img: product.img
				}
			};
			const result = await productCollection.updateOne(filter, updateProduct, options);
			res.send(result);
		});

		// Update quantity
		app.put('/quantity/:id', async (req, res) => {
			const id = req.params.id;
			const product = req.body;
			const filter = {_id: ObjectId(id)};
			const options = { upsert: true};
			const updateProduct = {
				$set: {quantity: product.quantity}
			};
			const result = await productCollection.updateOne(filter, updateProduct, options);
			console.log(result);
			res.send(result);
		});

		// Delete Product
		app.delete('/product/:id', async (req, res) => {
			const id = req.params.id;
		    const productId = { _id: ObjectId(id) };
		    const result = await productCollection.deleteOne(productId);
		    res.send(result);
		});

		// Get All Products
		app.get('/products', async (req, res) => {
			const query = {};
			const cursor = productCollection.find(query);
			const products = await cursor.toArray();
			res.send(products);
		});
		
		// Get Products by Email
		app.get("/myproducts", async (req, res) => {
            const tokenInfo = req.headers.authorization;
            const [email, accessToken] = tokenInfo.split(" ")
            const decoded = verifyToken(accessToken)

            if (email === decoded.email) {
                const myproducts = await productCollection.find({email:email}).toArray();
                res.send(myproducts);
            }
            else {
                res.send({ success: 'UnAuthoraized Access' })
            }
		})

		// Get Single Product
		app.get('/product/:id', async (req, res) => {
			const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product);
		});


		// ===========================================
		//		MyProduct Product Controller		//
		//============================================

		// // Add Secuire Product API
		 app.post("/myproduct", async (req, res) => {
            const myproduct = req.body;
			const tokenInfo = req.headers.authorization;
			const [email, accessToken] = tokenInfo.split(" ")
			const decoded = verifyToken(accessToken)
			if (email === decoded.email) {
                const result = await myCollection.insertOne(myproduct);
            	res.send(result);
            }
            else {
                res.send({ success: 'UnAuthoraized Access' })
            }
        });

		// ===========================================
		//				Blog Controller				//
		//============================================

		// POST Blog
		app.post('/blog', async (req, res) => {
			 const blog = req.body;
			 const result = await blogCollection.insertOne(blog);
			 res.send(result);
		});

		// Update Blog
		app.put('/blog/:id', async (req, res)=>{
			const id = req.params.id;
			const blog = req.body;
			const filter = {_id: ObjectId(id)};
			const options ={ upsert: true };
			const updateBlog = {
				$set:{
					title: blog.title,
					description: blog.description,
					author: blog.author,
					img: blog.img
				}
			};
			const result = await blogCollection.updateOne(filter, updateBlog, options);
			res.send(result);
		});

		// Delete Blog
		app.delete('/blog/:id', async (req, res) => {
			const id = req.params.id;
		    const blogId = { _id: ObjectId(id) };
		    const result = await blogCollection.deleteOne(blogId);
		    res.send(result);
		});

		// Get All Blogs
		app.get('/blogs', async (req, res) => {
			const query = {};
			const cursor = blogCollection.find(query);
			const blogs = await cursor.toArray();
			res.send(blogs);
		});


		// ===========================================
		//			Category Controller				//
		//============================================

		// POST Category
		app.post('/category', async (req, res) => {
			 const category = req.body;
			 const result = await categoryCollection.insertOne(category);
			 res.send(result);
		});

		// Update Category
		app.put('/category/:id', async (req, res)=>{
			const id = req.params.id;
			const category = req.body;
			const filter = {_id: ObjectId(id)};
			const options ={ upsert: true };
			const updateCategory = {
				$set:{
					title: category.title,
					description: category.description,
					img: category.img
				}
			};
			const result = await categoryCollection.updateOne(filter, updateCategory, options);
			res.send(result);
		});

		// Delete Category
		app.delete('/category/:id', async (req, res) => {
			const id = req.params.id;
		    const categoryId = { _id: ObjectId(id) };
		    const result = await categoryCollection.deleteOne(categoryId);
		    res.send(result);
		});

		// Get All Categories
		app.get('/categories', async (req, res) => {
			const query = {};
			const cursor = categoryCollection.find(query);
			const categories = await cursor.toArray();
			res.send(categories);
		});

		// ===========================================
		//			Banner Controller				//
		//============================================

		// POST Banner
		app.post('/banner', async (req, res) => {
			 const banner = req.body;
			 const result = await bannerCollection.insertOne(banner);
			 res.send(result);
		});

		// Update Banner
		app.put('/banner/:id', async (req, res) => {
			const id = req.params.id;
			const banner = req.body;
			const filter = {_id: ObjectId(id)};
			const options ={ upsert: true };
			const updateBanner = {
				$set:{
					title: banner.title,
					description: banner.description,
					img: banner.img
				}
			};
			const result = await bannerCollection.updateOne(filter, updateBanner, options);
			res.send(result);
		});

		// Delete Banner
		app.delete('/banner/:id', async (req, res) => {
			const id = req.params.id;
		    const bannerId = { _id: ObjectId(id) };
		    const result = await bannerCollection.deleteOne(bannerId);
		    res.send(result);
		});

		// Get All Banners
		app.get('/banners', async (req, res) => {
			const query = {};
			const cursor = bannerCollection.find(query);
			const banners = await cursor.toArray();
			res.send(banners);
		});


	}
	finally{
		// await client.close();
	}
}
run().catch(console.dir)

app.get('/', (req, res) => {
	res.send("Server side is running")
})
app.listen(port, ()=>{
	console.log('server is running');
})