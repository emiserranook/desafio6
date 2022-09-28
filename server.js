const express = require("express");
const Contenedor = require("./api/productos.js");

const router = express.Router();
const app = express();


// Configuración Websocket

const { Server: IOServer } = require("socket.io");
const { Server: HttpServer } = require("http");
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const PORT = 8080;

// Objeto donde se guardan los mensajes

const messages = [];

// Métodos de la clase
let productos = new Contenedor();

// ---------------------------------
// Conectamos websocket

io.on("connection", (socket) => {
	console.log('Usuario con id: ', socket.id, ' se ha conectado');

	// Socket chat
	socket.emit("messages", messages);

	socket.on("new-message", (data) => {
		data.date = new Date().toLocaleDateString()
		messages.push(data);

		
		io.sockets.emit("messages", messages);

	});

	// Socket productos

	socket.emit("productList", productos.itemList )

	socket.on("newProduct", (data) => {
		let producto = productos.getAll();
		productos.post(producto)
		io.sockets.emit("productList", productos.itemList)
	})

})

//--------------------------------------------
//establecemos la configuración de ejs

app.set("view engine", "ejs");
app.set("views", "./views");
//--------------------------------------------



app.use(express.static("public")); //quiza views?


app.use("/", router);

app.get("/", (req, res) =>{
	res.sendFile("index.html")
})

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

// router.get("/", (req, res) => {
// 	const prods = productos.getAll();

// 	res.render("layouts/index", {
// 		productos: prods,
// 		hayProductos: prods.length,
// 	});
// });

router.post("/", (req, res) => {
	const producto = req.body;
	productos.post(producto);
	res.redirect("/");
});




httpServer.listen(PORT, () => console.log("servidor Levantado"));