/* obtener las librerias */
var express = require("express");
var nunjucks = require("nunjucks");
var bodyParser = require("body-parser");
var socketio = require("socket.io");
var http = require("http");
var app = express();
var servidor = http.createServer(app);
servidor.listen(8000);

console.log("servidor funcionando");

/*usamos body parser para recibir datos del cliente*/
app.use(bodyParser.urlencoded({
	extended : true
}));
console.log("body parser configurado");

app.use("/imagenes", express.static(__dirname + "/imagenes"));
app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));

console.log("rutas estaticas configuradas");

/*configurar la carpeta de vistas*/
nunjucks.configure(__dirname + "/vistas", {
	express : app
});

console.log("sistemas de templates configurado");

app.get("/", function(req, res) {
	res.render("index.html");
	console.log("index enviado");
});

app.get("/chat", function(req, res) {
	res.render("chat.html");
	console.log("chat enviado");
});

//configuración de los sockets
var io = socketio.listen(servidor);
//variable que guarda a los usuarios conectados
var usuariosOnline = {};

io.sockets.on("connection", function(socket) {

	socket.on("reanudaSesion", function(usuario) {
		socket.username = usuario.idUsuario;
		console.log(usuario.idUsuario);
		//añadimos al usuario a la lista global donde almacenamos usuarios
		usuariosOnline[usuario.idUsuario] = socket.username;
		console.log("se ha añadido: " + usuario.idUsuario + " a la lista de usuarios");
		socket.emit("listaUsuarios", usuariosOnline);
		console.log(usuariosOnline);
	});

	socket.on("loginUsuario", function(usuario) {
		//si existe el nombre de usuario en el chat
		if (usuariosOnline[usuario.idUsuario]) {
			console.log("id de usuario ocupado");
			socket.emit("noDisponible");
		}//fin if
		else {
			//Guardamos el nombre de usuario en la sesión del socket para este cliente
			socket.username = usuario.idUsuario;
			console.log(usuario.idUsuario);
			//añadimos al usuario a la lista global donde almacenamos usuarios
			usuariosOnline[usuario.idUsuario] = socket.username;
			console.log("se ha añadido: " + usuario.idUsuario + " a la lista de usuarios");
			socket.emit("listaUsuarios", usuariosOnline);
			console.log(usuariosOnline);
		}//fin else
	});
	//fin socket.on loginUsuario
	socket.on("mensajeUsuario", function(Mensaje) {
		console.log(Mensaje.Mensaje);
		console.log(Mensaje.Usuario);
		io.sockets.emit("nuevoMensaje", {
			Usuario : Mensaje.Usuario,
			Mensaje : Mensaje.Mensaje
		});
		console.log("mensaje enviado");
	});
});
