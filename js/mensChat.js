window.addEventListener("load", chat);

function chat() {
	//Elementos del DOM que vamos a manipular
	//----Elementos del Login
	var socket = io.connect(location.origin);
	var bloqueChat = document.getElementById("chat");
	var bloqueLogin = document.getElementById("login");
	var cLogin = document.getElementById("cLogin");
	var nUsuario = document.getElementById("nuevoUsuario");
	var agregar = document.getElementById("agregar");
	var usuarioDisp = true;
	//----Elemtos del Chat
	var mensaje = document.getElementById("mensaje");
	var enviar = document.getElementById("enviar");
	var uslist = document.getElementById("listaUs");
	var Usuario = "";
	verifica();

	function verifica() {
		if (localStorage.Usuario === undefined) {
			bloqueLogin.style.display = 'block';
			nUsuario.focus();
		}//fin if
		else {
			bloqueChat.style.display = 'block';
			Usuario = localStorage.Usuario;
			socket.emit("reanudaSesion", {
				idUsuario : localStorage.Usuario
			});
			mensaje.focus();
		}//fin else
	}//fin función verifica


	nUsuario.addEventListener("keydown", function(tecla) {
		if (tecla.keyCode === 13) {
			agregarUsuario();
		}
	});
	agregar.addEventListener("click", agregarUsuario);

	function agregarUsuario() {
		if (nUsuario.value.length < 4) {
			alert("el usuario debe contener mínimo 5 caracteres");
		}//fin if
		else {
			socket.emit("loginUsuario", {
				idUsuario : nUsuario.value
			});
			//fin del socket.emit loginUsuario
			setTimeout(function() {
				validaUsuario();
			}, 500);
		}//fin else
	}//fun función agregarUsuario


	socket.on("noDisponible", function() {
		alert("usuario no disponible");
		localStorage.clear();
		usuarioDisp = false;
	});
	//fin del socket.on noDisponible

	function validaUsuario() {
		if (usuarioDisp === true) {
			localStorage.setItem("Usuario", nUsuario.value);
			bloqueLogin.style.display = 'none';
			verifica();
		}//fin if
		else {
			usuarioDisp = true;
			nUsuario.focus();
		}//fin else
		nUsuario.value = "";
	}//fin validaUsuario


	mensaje.addEventListener("keydown", function(tecla) {
		if (tecla.keyCode === 13) {
			enviar.click();
		}
	});
	enviar.addEventListener("click", envia);
	function envia(evento) {
		if (mensaje.value.length > 0) {
			socket.emit("mensajeUsuario", {
				Mensaje : mensaje.value,
				Usuario : Usuario
			});
		}//fin if
		mensaje.value = "";
		mensaje.focus();
	}//fin función envia


	socket.on("nuevoMensaje", function(datos) {
		if (datos.Usuario === Usuario) {
			contenedor.innerHTML += "<div class='contMsnD'><div class='espMsnD'><div class='tmMsn'><p class='Msn'>" + datos.Mensaje + "</p></div><img class='user' src='../imagenes/User.png'>";
		} else {
			contenedor.innerHTML += "<div class='contMsnI'><div class='espMsnI'><img class='user' src='../imagenes/User.png'><div class='tmMsn'><p class='Msn'>" + datos.Mensaje;
		}
		//pone el scroll al final si hay un voreflow en y
		contenedor.scrollTop = contenedor.scrollHeight;
	});

	socket.on("listaUsuarios", function(usuariosOnline) {
		uslist.innerHTML = "";
		function agregaUsuariosList(obj) {
			var result = "";
			for (var i in obj) {
				result += "<li style= 'text-align: left;'>" + obj[i];
			}
			return result;
		}
		uslist.innerHTML += agregaUsuariosList(usuariosOnline);
	});

}//fin función chat

