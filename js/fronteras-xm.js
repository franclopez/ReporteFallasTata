$(function() {
        
            	   /********Init Connection with kinvey Back End********/
                   var promiseInit = Kinvey.init({
                        appKey    : 'kid_PVvB5PRZEi',
                        appSecret : '5ba92a5b5d7e40949f84a445b747eaf4'
                    });
                    promiseInit.then(function(activeUser) {
                        var promisePing = Kinvey.ping();
                        promisePing.then(function(response) {
                          console.log('Kinvey Ping Success. Kinvey Service is alive, version: ' + response.version + ', response: ' + response.kinvey);
                        }, function(error) {
                          console.log('Kinvey Ping Failed. Response: ' + error.description);
                        });
                    }, function(error) {
                       loginError.text('Problemas conectando con el backend. Por favor intente mas tarde');
                    });
                    
                    /************ login ************/
                    var loginForm = $('#login_form');
                    var loginError =  $('#login_error');
                    console.log("Log In");
                    loginForm.on('submit', function(e) {
                        e.preventDefault();
                        loginError.text('');
                        $.mobile.loading('show');
                        var usernameField = loginForm.find('[name="username"]');
                        var username = $.trim(usernameField.val());
                        var passwordField = loginForm.find('[name="password"]');
                        var password = $.trim(passwordField.val());
            			console.log("Autenticando usuario...");
                        console.log(username);
                        console.log(password);
                        var user = Kinvey.getActiveUser();
                        
        				Kinvey.User.logout({
        						success: function() {
        							console.log("Desconectando");
        						},
        						error: function(e) {
        							console.log("Usuario no conectado");
        						}
        				});
        				
        				Kinvey.User.login(username, password, {
        						success: function() {
        						console.log("Loggeado.");
        							loginForm.removeClass('loading');
        							$.mobile.loading('hide');
        							usernameField.val(''); //clear fields
        							passwordField.val('');
        							$.mobile.changePage('#menu'); //change to menu page
        						},
        						error: function(error){
        							console.log(error);
        							$.mobile.loading('hide');
        							loginError.text('Por Favor Ingrese Un Usuario y Contraseña Válidos');
        						}
        				 });
        				 return false;
                    });
                    
                    //Logout
        			
        			$("#logout").click(function () {
                        showConfirmLogout();
                    });
        			
        			var showConfirmLogout = function() {
        				console.log("Por invocar confirm.");
        				if(navigator.notification){
        					navigator.notification.confirm(
        					'Desea Salir de la Aplicación?',     
        					doLogout,      
        					'Logout',            
        					['Cancelar','Salir']
        					);
        				}
        				else {
        					console.log("Notificaciones no disponibles...Logging out");
        					var user = Kinvey.getActiveUser();
        					Kinvey.User.logout({
        						success: function() {
        							$.mobile.changePage('#logon');
        						},
        						error: function(e) {
        							$.mobile.changePage('#logon'); 
        						}
        					});
        				}
        			};
        			
        			var doLogout = function (buttonIndex) {
        				console.log("buttonIndex "+buttonIndex);
        				if(buttonIndex == 2) {
        					$.mobile.loading('show');
        					console.log("Logging out");
        					var user = Kinvey.getActiveUser();
        					 Kinvey.User.logout({
        						success: function() {
        							$.mobile.changePage('#logon'); 
        							$.mobile.loading('hide');
        							navigator.app.exitApp();
        						},
        						error: function(e) {
        							$.mobile.changePage('#logon'); 
        							$.mobile.loading('hide');
        						}
        					});
        				}
        				else {
        					return false;
        				}
        			};
        			
        			//Menu Page
        			$(document).on("pageshow", "#menu", function () {
        				var user = Kinvey.getActiveUser();
        				console.log(user);
        				var txtBienv = "Bienvenido al sistema de reporte de Fallos: " + user.first_name + " " + user.last_name;
        				$('#bienvenidaText').text(txtBienv);
        				console.log(txtBienv);
        			});
        			
        			//Busqueda de requerimientos
        			$(document).on("pageinit", "#requerimientosBusqueda", function () {
        				console.log("pageinit del requerimientosBusqueda");
                        $.mobile.loading('show');
        				var query = new Kinvey.Query();
        				query.equalTo('Nombre', 'Revisión');
        				var query2 = new Kinvey.Query();
        				query2.equalTo('Nombre', 'Evaluado');
        				query.or(query2);
        				var promise = Kinvey.DataStore.find('EstadosRequerimiento', query, {
        					success: function(items) {
        					   var list = $("#reqBusEstReq");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Nombre, item.Id));
        					   });
        					}
        				  });
                          var promise2 = Kinvey.DataStore.find('TiposRequerimiento', null, {
            				success: function(items) {
        					   var list = $("#reqBusTipReq");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Nombre, item.Id));
        					   });
                               $.mobile.loading('hide');
        					}
        				  });
                          
                    });
        			
        			$(document).on("pageshow", "#requerimientosBusqueda", function () {
        					console.log("pageshow del requerimientosBusqueda");
        					$("#reqBusEstReq").prop('selectedIndex', 0);
        					$("#reqBusEstReq").selectmenu('refresh');              
        					$("#reqBusTipReq").prop('selectedIndex', 0);
        					$("#reqBusTipReq").selectmenu('refresh'); 
        					$("#reqBusCodSIc").val("");
        					$("#reqBusReqID").val("");
        			});
        			
        			            
                    //Busqueda de Fronteras
            		$(document).on("pageinit", "#fronterasBusqueda", function () {
        				var promise = Kinvey.DataStore.find('TiposFrontera', null, {
        					success: function(items) {
        					   var list = $("#fronBusFronTipo");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Nombre, item.Id));
        					   });
        					}
        				});
        				var promise2 = Kinvey.DataStore.find('NivelesTension', null, {
            				success: function(items) {
        					   var list = $("#fronBusNivTension");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Descripcion, item.Id));
        					   });
        					}
        				});
                        var queryDpto = new Kinvey.Query();
                        queryDpto.ascending('NombreDepartamento');
                        var promiseDepto = Kinvey.DataStore.find('Departamentos', queryDpto, {
            				success: function(items) {
        					   var list = $("#fronBusDepartamento");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.NombreDepartamento, item.IdDepartamento));
        					   });
        					}
        				});
        			});
        			
        			$(document).on("pageshow", "#fronterasBusqueda", function () {
        				console.log("pageshow del fronterasBusqueda");
        				$("#fronBusFronTipo").prop('selectedIndex', 0);
        				$("#fronBusFronTipo").selectmenu('refresh');              
        				$("#fronBusNivTension").prop('selectedIndex', 0);
        				$("#fronBusNivTension").selectmenu('refresh'); 
        				$("#fronBusDepartamento").prop('selectedIndex', 0);  
        				$("#fronBusDepartamento").selectmenu('refresh'); 
        				$("#fronBusCiudad").prop('selectedIndex', 0); 
        				$("#fronBusCiudad").selectmenu('refresh');
        				$("#fronBusSic").val("");
        				$("#fronBusCodProCon").val("");
        				$("#fronBusNombre").val("");
        				$("#fronBusNiu").val("");
        				$("#fronBusAgente").val("");
        			});
                    
                    $('#fronBusDepartamento').change(function() {
        			  $.mobile.loading('show');
        			  var query = new Kinvey.Query();
                      query.ascending('NombreCiudad');
        			  query.equalTo('IdDepartamento', this.value);
                      $("#fronBusCiudad").empty();
                      $("#fronBusCiudad").append(new Option("Seleccione...", ''));
                      $("#fronBusCiudad").selectmenu('refresh');              
        			  $("#fronBusCiudad").prop('selectedIndex', 0);
                      var promiseCiudad = Kinvey.DataStore.find('Ciudades', query, {
            				success: function(items) {
        					   var list = $("#fronBusCiudad");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.NombreCiudad, item.IdCiudad));
        					   });
        					   $.mobile.loading('hide');
        					}
        				});
        			});
        			
        			var requerimientoInfo = {
        				id : null,
        				result : null
        			}
        			
        			$(document).on('vclick', '#desReqListaRequerimientos li a', function(){  
        				requerimientoInfo.id = $(this).attr('data-id');
        				$.mobile.changePage( "#desistirRequerimiento", { transition: "slide", changeHash: false });
        				$.mobile.loading('show');
        				console.log("Obteniendo Requerimiento con id: " +requerimientoInfo.id);
        				var promise = Kinvey.DataStore.find('TiposFrontera', null, {
        					success: function(items) {
        					   var list = $("#desReqTipFrontera");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Nombre, item.Id));
        					   });
        					}
        				});
        				var promise2 = Kinvey.DataStore.find('TiposRequerimiento', null, {
        					 success: function(items) {
        					   var list = $("#desReqTipRequerimiento");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Nombre, item.Id));
        					   });
        					   
        					 }
        				});
        				var query = new Kinvey.Query();
        				query.equalTo('_id', requerimientoInfo.id);
        				var promiseCiudad = Kinvey.DataStore.find('Requerimientos', query, {
        					 success: function(response) {
        					   $.each(response, function(index, item) {
        							console.log("Requerimiento found: "+item.IDRequerimiento);
        							$("#desReqRequerimiento").val(item.IDRequerimiento);
        							$('#desReqRequerimiento').textinput('disable');
        							document.getElementById("desReqFecSolicitud").valueAsDate = new Date();
        							$('#desReqFecSolicitud').textinput('disable');
        							$("#desReqNomFrontera").val(item.Agente);
        							$('#desReqNomFrontera').textinput('disable');
        							$("#desReqRepFrontera").val(item.Agente);
        							$('#desReqRepFrontera').textinput('disable');
        							$("#desReqTipRequerimiento").val(item.TipoRequerimiento).selectmenu('refresh');
        							$('#desReqTipRequerimiento').selectmenu('disable');
        							$("#desReqTipFrontera").val(item.TipoFrontera).selectmenu('refresh');
        							$('#desReqTipFrontera').selectmenu('disable');
        							$("#desReqReqAsociado").val(item.IDRequerimiento);
        							$('#desReqReqAsociado').textinput('disable');
        							$("#desReqCodSic").val(item.CodigoSIC);
        							$('#desReqCodSic').textinput('disable');
        							$('#desReqContacto').val("");
        							$('#desReqMotDesistimiento').val("");
        					   });
        					   $.mobile.loading('hide');
        					 }
        				});
        			});
        			
        		  //Realizar Busqueda de Requerimientos
                    $("#reqBusSearch").click(function () {
        			  if( ($("#reqBusEstReq").val() !== "" )  || ($("#reqBusCodSIc").val() !== "" ) || ($("#reqBusReqID").val() !== "" ) || ($("#reqBusTipReq").val() !== "" ) ) {
        				 $.mobile.changePage('#detalleRequerimiento');
                         $.mobile.loading('show');
        				 $('#desReqListaRequerimientos').empty();
                         console.log("Buscando requerimientos....");
            			 var reqBusEstReq = $("#reqBusEstReq").val();
        				 var query = new Kinvey.Query();
        				 query.equalTo('EstadoRequerimiento', reqBusEstReq);
        				 var reqBusCodSIc = $("#reqBusCodSIc").val();
        				 var query2 = new Kinvey.Query();
        				 query2.equalTo('CodigoSIC', reqBusCodSIc);
        				 query.or(query2);
        				 var reqBusReqID = $("#reqBusReqID").val();
        				 var query3 = new Kinvey.Query();
        				 query3.equalTo('IDRequerimiento', reqBusReqID);
        				 query.or(query3);
        				 var reqBusTipReq = $("#reqBusTipReq").val();
        				 var query4 = new Kinvey.Query();
        				 query4.equalTo('TipoRequerimiento', reqBusTipReq);
        				 query.or(query4);
        				 
        				 var promiseRequerimientos = Kinvey.DataStore.find('Requerimientos', query, {
            				success: function(items) {
        					   console.log("Consulta satisfactoria de requerimientos");
                               $('#desReqListaRequerimientos').append('<li data-role="list-divider" role="heading">Seleccione Para Desistir</li>');
        					   $.each(items, function(index, item) {
        						  console.log(item.CodigoSIC);
        						  $('#desReqListaRequerimientos').append('<li data-theme="c"><a href="" data-transition="slide" data-id="' +item._id
        						  + '"><b class="highlight">IDReq:</b>  ' + item.IDRequerimiento + '<br/><b class="highlight">Agente:</b>  ' + item.Agente+ '<br/><b class="highlight">CodigoSIC:</b>  '  + item.CodigoSIC
        						  +'</a></li>');
        					   });
        					   $('#desReqListaRequerimientos').listview('refresh');
        					   $.mobile.loading('hide');
        					},
        					error: function(e) {
        						console.log("Problemas consultando requerimientos");
        						$.mobile.loading('hide');
        					}
        				 });
                        }
        				else {
        				  showAlert("Debe ingresar al menos un criterio de búsqueda","Error");
        				}
                    });
        			
        						
        			$("#desReqBtnDesistir").click(function () {
                        showConfirmDesistir();
                    });
        			
        			var goHome = function() {
        				$.mobile.changePage('#menu');
        			}
        			
        			var showConfirmDesistir = function() {
        			  if( ($("#desReqContacto").val() !== "" )  && ($("#desReqMotDesistimiento").val() !== "" )) {
        				if(navigator.notification){
        					navigator.notification.confirm(
        					'Desea Desistir el Requerimiento?',     
        					doDesistir,      
        					'Desistir Requerimiento',            
        					['Cancelar','Desistir']
        					);
        				}
        				else {
        					alert("Se desistirá el requerimiento");
        					goHome();
        				}
        			  }
        			  else {
        				showAlert("Por Favor Ingrese Todos Los Campos","Error");
        			  }
        			};
                    
        			var doDesistir = function(buttonIndex) {
        				if(buttonIndex == 2) {
        				  navigator.notification.alert('Se Desistió el Requerimiento',     
        						goHome,      
        						'Desistir Requerimiento',
        						'OK');
        				}
        			}
        						
                    var fronteraInfo = {
        				id : null,
        				result : null
        			}
        			
        			$(document).on('vclick', '#desReqListaFronteras li a', function(){
        				fronteraInfo.id = $(this).attr('data-id');
        				$.mobile.changePage( "#reporteFallaHurto", { transition: "slide", changeHash: false });
        				$.mobile.loading('show');
        				$('#image').attr('src', "img/spacer.png");
        				console.log("Obteniendo frontera con id: " +fronteraInfo.id);
        				var promise = Kinvey.DataStore.find('TiposFrontera', null, {
        					success: function(items) {
        					   var list = $("#falHurTipFrontera");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Nombre, item.Id));
        					   });
        					}
        				});
        				var promise2 = Kinvey.DataStore.find('TiposRequerimiento', null, {
        					 success: function(items) {
        					   var list = $("#falHurTipRequerimiento");
        					   $.each(items, function(index, item) {
        						  list.append(new Option(item.Nombre, item.Id));
        					   });
        					 }
        				});
        				var query = new Kinvey.Query();
        				query.equalTo('_id', fronteraInfo.id);
        				var promiseFrontera = Kinvey.DataStore.find('Fronteras', query, {
        					 success: function(response) {
        					   $.each(response, function(index, item) {
        							console.log("Frontera found: "+item.CodigoSIC);
        							document.getElementById("falHurFechaInicio").valueAsDate = new Date();
        							$('#falHurFechaInicio').textinput('disable');
        							document.getElementById("falHurFecMax").valueAsDate = new Date();
        							$('#falHurFecMax').textinput('disable');
        							$("#falHurRequerimiento").val(item.CodigoPropioContador);
        							$('#falHurRequerimiento').textinput('disable');
        							$("#falHurContacto").val(item.Contacto);
        							$('#falHurContacto').textinput('disable');
        							$("#falHurRepFrontera").val(item.RepresentanteFrontera);
        							$('#falHurRepFrontera').textinput('disable');
        							$("#falHurTipRequerimiento").val('3').selectmenu('refresh');
        							$('#falHurTipRequerimiento').selectmenu('disable');
        							$("#falHurTipFrontera").val(item.TipoFrontera).selectmenu('refresh');
        							$('#falHurTipFrontera').selectmenu('disable');
        							$("#falHurAgeReporta").val(item.Agente);
        							$('#falHurAgeReporta').textinput('disable');
        							$("#falHurCodSIC").val(item.CodigoSIC);
        							$('#falHurCodSIC').textinput('disable');
        							$("#falHurNomFrontera").val(item.Nombre);
        							$('#falHurNomFrontera').textinput('disable');
        							$("#falHureqMedida").val("");
        							$("#falHurTipReporte").prop('selectedIndex', 0);
        							$("#falHurTipReporte").selectmenu('refresh');
        							$.mobile.loading('hide');
        					   });
        					 }
        				});
        			});
        						
                    //Realizar Busqueda de Fronteras
                    $("#fronBusSearch").click(function () {
        			   if( ($("#fronBusSic").val() !== "" )  || ($("#reqBusEstReq").val() !== "" ) || ($("#fronBusFronTipo").val() !== "" ) || ($("#fronBusNombre").val() !== "" ) ||
        			    ($("#fronBusNivTension").val() !== "" )  || ($("#fronBusNiu").val() !== "" ) || ($("#fronBusCiudad").val() !== "" ) || ($("#fronBusAgente").val() !== "" ) ) {
                         $.mobile.changePage('#detalleFronteras');
        				 $.mobile.loading('show');
        				 $('#desReqListaFronteras').empty();
                         console.log("Buscando fronteras....");
        				 var fronBusSic = $("#fronBusSic").val();
        				 var query = new Kinvey.Query();
        				 query.equalTo('CodigoSIC', fronBusSic);
        				 var fronBusCodProCon = $("#reqBusEstReq").val();
        				 var query2 = new Kinvey.Query();
        				 query2.equalTo('CodigoPropioContador', fronBusCodProCon);
        				 query.or(query2);
        				 var fronBusFronTipo = $("#fronBusFronTipo").val();
        				 var query3 = new Kinvey.Query();
        				 query3.equalTo('TipoFrontera', fronBusFronTipo);
        				 query.or(query3);
        				 var fronBusNombre = $("#fronBusNombre").val();
        				 var query4 = new Kinvey.Query();
        				 query4.equalTo('Nombre', fronBusNombre);
        				 query.or(query4);
        				 var fronBusNivTension = $("#fronBusNivTension").val();
        				 var query5 = new Kinvey.Query();
        				 query5.equalTo('NivelTension', fronBusNivTension);
        				 query.or(query5);
        				 var fronBusNiu = $("#fronBusNiu").val();
        				 var query6 = new Kinvey.Query();
        				 query6.equalTo('NIU', fronBusNiu);
        				 query.or(query6);
        				 var fronBusCiudad = $("#fronBusCiudad").val();
        				 var query7 = new Kinvey.Query();
        				 query7.equalTo('Ciudad', fronBusCiudad);
        				 query.or(query7);
        				 var fronBusAgente = $("#fronBusAgente").val();
        				 var query8 = new Kinvey.Query();
        				 query8.equalTo('Agente', fronBusAgente);
        				 query.or(query8);
        				 
        				 var promiseFronteras = Kinvey.DataStore.find('Fronteras', query, {
            				success: function(items) {
        					   console.log("Consulta satisfactoria de fronteras");
        					   $('#desReqListaFronteras').append('<li data-role="list-divider" role="heading">Seleccione</li>');
        					   $.each(items, function(index, item) {
        						  console.log(item.CodigoSIC);
        						  $('#desReqListaFronteras').append('<li data-theme="c"><a href=""  data-transition="slide" data-id="' +item._id
        						  + '"><b class="highlight" >Codigo Interno:</b>  ' + item.NIU + '<br/><b class="highlight">Nombre:</b> ' + item.Nombre+ '<br/><b class="highlight">Codigo:</b>  '  + item.CodigoSIC
        						  +'</a></li>');
        					   });
        					   $('#desReqListaFronteras').listview('refresh');
        					   $.mobile.loading('hide');
        					},	
        					error: function(e) {
        						showAlert("Problemas consultando fronteras","Error");
        						$.mobile.loading('hide');
        					}
        				 });
        			  }
        			  else {
        				  showAlert("Debe ingresar al menos un criterio de búsqueda","Error");
        			  }
                    });
        			
        			$("#falHurBtnGuardar").click(function () {
                        showConfirmReporte();
                    });
        			
        			var showConfirmReporte = function() {
        			   if( ($("#falHureqMedida").val() !== "" )  && ($("#falHurTipReporte").val() !== "" )) {
        				if(navigator.notification){
        					navigator.notification.confirm(
        					'Desea Registrar el Requerimiento?',     
        					doRegistrar,      
        					'Registrar Falla Hurto',            
        					['Cancelar','Registrar']
        					);
        				}
        				else {
        					alert("Se registró el requerimiento");
        					goHome();
        				}
        			  }
        			  else {
        				showAlert("Por Favor Ingrese Todos Los Campos","Error");
        			  }
        			};
                    
        			var doRegistrar = function(buttonIndex) {
        			 if(buttonIndex == 2) {
        				navigator.notification.alert('Se registró el Requerimiento',     
        					goHome,      
        					'Registrar Requerimiento',
        					'OK');
        			 }
        			}
                    
                    $(document).bind("mobileinit", function () {
                        $.mobile.listview.prototype.options.filterPlaceholder = "Filtrar Datos...";
                    });
        			
        			 var showAlert = function (message, title) {
                        if (navigator.notification) {
                            navigator.notification.alert(message, null, title, 'OK');
                        } else {
                            alert(title ? (title + ": " + message) : message);
                        }
                    };
        			
        			var tomarFoto = function () {
        				console.log('Por tomar foto...');
        				if (!navigator.camera) {
        					showAlert("Camera API not supported", "Error");
        					return;
        				}
        				var options =   {   quality: 50,
        									destinationType: Camera.DestinationType.DATA_URL,
        									sourceType: 1,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        									encodingType: 0,     // 0=JPG 1=PNG
        									saveToPhotoAlbum: true
        								};
        				navigator.camera.getPicture(
        					function(imageData) { 
        						$('#image').attr('src', "data:image/jpeg;base64," + imageData);
        					},
        					function() {
        						showAlert('Error tomando foto. Intente de nuevo más tarde', "Error");
        					},
        					options);
        				return false;
        			};
        			
        			$("#tomarFotoBtn").click(function () {
        			  tomarFoto(); 
        			});
        			
        });