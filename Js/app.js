// app.js — Lógica del Taller 02: Simulador de Factura y Cajero Bancario
//
// Estructura general del archivo:
//   1. Navegación      → función que alterna la pestaña visible entre los dos casos.
//   2. Caso 1 – Factura
//      2a. Referencias al DOM  → inputs, botones, tabla y área de resumen.
//      2b. Variables globales  → tres vectores paralelos + contador de productos.
//      2c. Event listeners     → conectan botones con sus funciones.
//      2d. Funciones           → agregar, renderizar, eliminar, calcular, limpiar.
//   3. Caso 2 – Banco
//      3a. Referencias al DOM  → input de monto, botones, tabla y display de saldo.
//      3b. Variables globales  → dos vectores de movimientos + saldo acumulado.
//      3c. Event listeners     → conectan botones con sus funciones.
//      3d. Funciones           → registrar, renderizar, calcular resumen, limpiar.
//   4. Utilidades      → función alertar() reutilizada en ambos casos.
//   5. Inicialización  → llamadas iniciales para renderizar las tablas vacías.
//
// Convención de nombres:
//   • btn*    → referencia a un elemento <button>.
//   • input*  → referencia a un elemento <input>.
//   • tabla*  → referencia a un elemento <table>.
//   • resumen* → referencia al contenedor del resumen (div + textarea).


// TALLER 02 - Técnica de Programación | UNEMI
// Unidad 3-4: Programación Modular
// Tema: Codificación de validación de datos con Vectores


// NAVEGACIÓN ENTRE CASOS

// mostrarTab(tab)
// Alterna la visibilidad entre las dos secciones (factura / banco).
// Algoritmo:
//   1. Quita la clase 'visible' de ambas secciones y 'activo' de ambas pestañas.
//   2. Según el parámetro 'tab', agrega 'visible' a la sección correspondiente
//      y 'activo' a su pestaña para resaltarla visualmente.
// Parámetros:
//   tab {string} — 'factura' | 'banco'
function mostrarTab(tab) {
  document.getElementById('seccionFactura').classList.remove('visible')
  document.getElementById('seccionBanco').classList.remove('visible')
  document.getElementById('tabFactura').classList.remove('activo')
  document.getElementById('tabBanco').classList.remove('activo')

  if (tab === 'factura') {
    document.getElementById('seccionFactura').classList.add('visible')
    document.getElementById('tabFactura').classList.add('activo')
  } else {
    document.getElementById('seccionBanco').classList.add('visible')
    document.getElementById('tabBanco').classList.add('activo')
  }
}


// CASO 1: SIMULADOR DE FACTURA DE VENTAS (ECUADOR)

// SECCIÓN 1A — REFERENCIAS AL DOM (Factura)
// Cada constante apunta al elemento HTML por su id único.
// Se declaran aquí para estar disponibles en listeners y funciones.

// Input de texto: nombre del producto que se va a agregar
const inputNombreProducto = document.getElementById('inputNombreProducto')

// Input numérico: cantidad de unidades del producto (mínimo 1)
const inputCantidad       = document.getElementById('inputCantidad')

// Input numérico: precio unitario del producto en dólares
const inputPrecio         = document.getElementById('inputPrecio')

// Botón que llama a agregarProducto() para insertar en los vectores
const btnAgregar          = document.getElementById('btnAgregar')

// Botón que llama a calcularFactura() para obtener subtotal, IVA y total
const btnCalcular         = document.getElementById('btnCalcular')

// Botón que llama a limpiarFactura() para reiniciar todo el caso 1
const btnLimpiarFactura   = document.getElementById('btnLimpiarFactura')

// Tabla donde se muestran los productos agregados fila por fila
const tablaItems          = document.getElementById('tablaItems')

// Contenedor div del resumen; se muestra u oculta con la clase 'd-none'
const resumenFactura      = document.getElementById('resumenFactura')

// Textarea de solo lectura donde se imprime el resumen de la factura
const resumenFacturaTexto = document.getElementById('resumenFacturaTexto')

// SECCIÓN 1B — VARIABLES GLOBALES (Factura)

// productos[i]  → nombre del producto en la posición i
// cantidades[i] → unidades del producto en la posición i
// precios[i]    → precio unitario del producto en la posición i
// Los tres vectores son paralelos: el índice i relaciona los tres datos.
let productos    = []
let cantidades   = []
let precios      = []

// Contador manual de productos; equivale a productos.length
// pero se mantiene explícito para seguir la convención del taller.
let numProductos = 0

// SECCIÓN 1C — EVENT LISTENERS (Factura)

// Agrega el producto ingresado a los vectores y actualiza la tabla
btnAgregar.addEventListener('click', function () {
  agregarProducto()
})

// Calcula el total de la factura y muestra el resumen
btnCalcular.addEventListener('click', function () {
  calcularFactura()
})

// Reinicia todos los vectores, la tabla y el resumen
btnLimpiarFactura.addEventListener('click', function () {
  limpiarFactura()
})

// Oculta la alerta de la factura en cuanto el campo corregido sea válido
// Borra la alerta de factura al escribir O al hacer clic en cualquier campo



// SECCIÓN 1D — FUNCIONES (Factura)

// agregarProducto()
// Lee los tres inputs, valida con switch y agrega el producto a los vectores.
// Algoritmo:
//   1. Valida con switch(true) que nombre no esté vacío, cantidad > 0 y precio > 0.
//   2. Recorre los vectores con for para buscar si el producto ya existe.
//      • Si existe: suma la cantidad al registro existente (no duplica).
//      • Si no existe: inserta en la posición numProductos e incrementa el contador.
//   3. Llama a renderTablaFactura() para reflejar el cambio en la tabla.
//   4. Limpia los inputs y devuelve el foco al campo de nombre.
// Complejidad: O(n) por la búsqueda lineal del nombre.
function agregarProducto() {
  const nombre   = inputNombreProducto.value.trim()
  const cantidad = parseInt(inputCantidad.value)
  const precio   = parseFloat(inputPrecio.value)

  // Validaciones con switch: evalúa cada caso hasta encontrar el primer error
  switch (true) {
    case nombre === '':
      resumenFacturaTexto.value = 'Ingresa el nombre del producto.'
      return
    case isNaN(cantidad) || cantidad <= 0:
      resumenFacturaTexto.value = 'Ingresa una cantidad válida (mayor a 0).'
      return
    case isNaN(precio) || precio <= 0:
      resumenFacturaTexto.value = 'Ingresa un precio válido (mayor a $0).'
      return
  }

  // Búsqueda lineal del producto por nombre con for
  let indiceExistente = -1
  for (let i = 0; i < numProductos; i++) {
    if (productos[i] === nombre) {
      indiceExistente = i
      break  // producto encontrado, salir del ciclo
    }
  }

  // Si ya existe, acumula la cantidad; si no, inserta como nuevo registro
  if (indiceExistente !== -1) {
    cantidades[indiceExistente] = cantidades[indiceExistente] + cantidad
  } else {
    productos[numProductos]  = nombre
    cantidades[numProductos] = cantidad
    precios[numProductos]    = precio
    numProductos = numProductos + 1
  }

  renderTablaFactura()
  inputNombreProducto.value = ''
  inputCantidad.value = 1
  inputPrecio.value = ''
  inputNombreProducto.focus()
}

// renderTablaFactura()
// Reconstruye el contenido del <tbody> de tablaItems a partir de los vectores.
// Algoritmo:
//   1. Elimina todas las filas de datos (conserva las 2 de encabezado).
//   2. Recorre los vectores con for e inserta una fila por producto con:
//      nombre | cantidad | precio unitario | subtotal | botón eliminar
//   3. Si numProductos === 0, inserta una fila de mensaje vacío y oculta el resumen.
// Complejidad: O(n).
function renderTablaFactura() {
  // Eliminar filas de datos anteriores (filas 0 y 1 son encabezados)
  while (tablaItems.rows.length > 2) {
    tablaItems.deleteRow(2)
  }

  for (let i = 0; i < numProductos; i++) {
    let subtotalItem = cantidades[i] * precios[i]
    let fila = tablaItems.insertRow()
    fila.innerHTML =
      '<td>' + productos[i] + '</td>' +
      '<td>' + cantidades[i] + '</td>' +
      '<td>$' + precios[i].toFixed(2) + '</td>' +
      '<td>$' + subtotalItem.toFixed(2) + '</td>' +
      '<td><button onclick="eliminarItem(' + i + ')">X</button></td>'
  }

  // Tabla vacía: mostrar mensaje y ocultar resumen
  if (numProductos === 0) {
    let fila = tablaItems.insertRow()
    fila.innerHTML = "<td colspan='5'>Sin productos agregados</td>"

  }
}

// eliminarItem(pos)
// Elimina el producto en la posición 'pos' desplazando los vectores con for.
// Algoritmo:
//   Recorre desde pos hasta numProductos-2 y sobreescribe cada posición
//   con el valor del siguiente elemento (desplazamiento hacia la izquierda).
//   Luego decrementa numProductos para ignorar el último elemento duplicado.
// Complejidad: O(n) en el peor caso (eliminar el primer elemento).
// Parámetros:
//   pos {number} — índice (0-based) del producto a eliminar.
function eliminarItem(pos) {
  for (let i = pos; i < numProductos - 1; i++) {
    productos[i]  = productos[i + 1]
    cantidades[i] = cantidades[i + 1]
    precios[i]    = precios[i + 1]
  }
  numProductos = numProductos - 1
  renderTablaFactura()
}

// calcularFactura()
// Recorre los vectores con for para obtener subtotal, IVA, descuento y total.
// Algoritmo:
//   1. Valida que haya al menos un producto.
//   2. En un solo for: acumula subtotal, suma unidades y detecta el producto más caro.
//   3. Calcula IVA = subtotal × 15%.
//   4. Aplica descuento con if...else if:
//      • subtotal > $20 → descuento = 5% del subtotal.
//      • subtotal > $0  → descuento = 0 (sin descuento).
//   5. total = subtotal + IVA - descuento.
//   6. Arma el texto del resumen con un segundo for y lo muestra en el textarea.
// Complejidad: O(n) — dos recorridos lineales del vector.
function calcularFactura() {
  if (numProductos === 0) {
    resumenFacturaTexto.value = 'Agrega al menos un producto antes de calcular.'
    return
  }

  // Acumuladores e inicialización con el primer elemento
  let subtotal        = 0
  let precioMaximo    = precios[0]
  let productoMasCaro = productos[0]
  let totalUnidades   = 0

  // Recorrido único: subtotal, unidades y producto más caro
  for (let i = 0; i < numProductos; i++) {
    subtotal      += cantidades[i] * precios[i]
    totalUnidades += cantidades[i]

    // Comparación para encontrar el producto de mayor precio unitario
    if (precios[i] > precioMaximo) {
      precioMaximo    = precios[i]
      productoMasCaro = productos[i]
    }
  }

  // Promedio ponderado: subtotal total / total de unidades vendidas
  let promedioPrecio = subtotal / totalUnidades

  // IVA del 15% sobre el subtotal (tasa vigente en Ecuador)
  let iva = subtotal * 0.15

  // Descuento con if...else if según el requerimiento del taller
  let descuento = 0
  if (subtotal > 20) {
    descuento = subtotal * 0.05  // 5% de descuento por compra mayor a $20
  } else if (subtotal > 0) {
    descuento = 0                // sin descuento para compras menores
  }

  let total = subtotal + iva - descuento

  // Segundo for: armar listas de texto para el resumen
  let listaNombres = '', listaCantidades = '', listaPrecios = ''
  for (let i = 0; i < numProductos; i++) {
    let sep = i < numProductos - 1 ? ', ' : ''  // separador entre elementos
    listaNombres    += productos[i]          + sep
    listaCantidades += cantidades[i]         + sep
    listaPrecios    += precios[i].toFixed(2) + sep
  }

  // Construir el texto del resumen línea por línea
  let texto = ''
  texto += 'Productos:          ' + listaNombres              + '\n'
  texto += 'Cantidades:         ' + listaCantidades            + '\n'
  texto += 'Precios:            ' + listaPrecios               + '\n'
  texto += 'Subtotal:           $' + subtotal.toFixed(2)       + '\n'
  texto += 'IVA (15%):          $' + iva.toFixed(2)            + '\n'
  texto += 'Descuento (5%):     $' + descuento.toFixed(2)      + '\n'
  texto += 'Total:              $' + total.toFixed(2)           + '\n'
  texto += '--- Estadísticas ---'                               + '\n'
  texto += 'Total unidades:     ' + totalUnidades              + '\n'
  texto += 'Promedio precio:    $' + promedioPrecio.toFixed(2) + '\n'
  texto += 'Producto más caro:  ' + productoMasCaro + ' ($' + precioMaximo.toFixed(2) + ')' + '\n'
  texto += '--- % por producto sobre subtotal ---'             + '\n'

  // Tercer for: calcular y listar el porcentaje de cada producto sobre el subtotal
  for (let i = 0; i < numProductos; i++) {
    let subtotalItem    = cantidades[i] * precios[i]
    let porcentajeItem  = (subtotalItem / subtotal) * 100
    texto += productos[i] + ': $' + subtotalItem.toFixed(2) +
             ' (' + porcentajeItem.toFixed(1) + '% del subtotal)' + '\n'
  }

  // Porcentaje que representa el IVA, descuento y total sobre el subtotal
  let porcIVA       = (iva       / subtotal) * 100
  let porcDescuento = subtotal > 20 ? 5 : 0
  let porcTotal     = (total     / subtotal) * 100
  texto += 'IVA representa:     ' + porcIVA.toFixed(1)       + '% del subtotal' + '\n'
  texto += 'Descuento aplica:   ' + porcDescuento.toFixed(1) + '% del subtotal' + '\n'
  texto += 'Total vs subtotal:  ' + porcTotal.toFixed(1)     + '%'

  resumenFacturaTexto.value = texto

}

// limpiarFactura()
// Reinicia todos los vectores, contadores y elementos visuales del Caso 1.
// Efecto colateral: llama a renderTablaFactura() para mostrar la tabla vacía.
function limpiarFactura() {
  productos    = []
  cantidades   = []
  precios      = []
  numProductos = 0
  renderTablaFactura()

  resumenFacturaTexto.value = ''
  inputNombreProducto.value = ''
  inputCantidad.value = 1
  inputPrecio.value = ''

}


// CASO 2: CAJERO BANCARIO INTELIGENTE
// SECCIÓN 2A — REFERENCIAS AL DOM (Banco)

// Input numérico: monto de la operación (depósito o retiro) en dólares
const inputMonto         = document.getElementById('inputMonto')

// Botón que llama a registrarMovimiento('Deposito')
const btnDeposito        = document.getElementById('btnDeposito')

// Botón que llama a registrarMovimiento('Retiro')
const btnRetiro          = document.getElementById('btnRetiro')

// Botón que llama a verResumenBanco() para calcular y mostrar estadísticas
const btnVerResumen      = document.getElementById('btnVerResumen')

// Botón que llama a limpiarBanco() para reiniciar todo el caso 2
const btnLimpiarBanco    = document.getElementById('btnLimpiarBanco')

// Tabla donde se listan los movimientos registrados
const tablaMovimientos   = document.getElementById('tablaMovimientos')

// Contenedor div del resumen bancario; se muestra u oculta con 'd-none'
const resumenBanco       = document.getElementById('resumenBanco')

// Textarea de solo lectura donde se imprime el resumen bancario
const resumenBancoTexto  = document.getElementById('resumenBancoTexto')

// Elemento <b> que muestra el saldo disponible actualizado en tiempo real
const saldoActualDisplay = document.getElementById('saldoActualDisplay')

// SECCIÓN 2B — VARIABLES GLOBALES (Banco)

// tiposMovimiento[i]  → 'Deposito' | 'Retiro' para el movimiento i
// montosMovimiento[i] → valor en dólares del movimiento i
// Los dos vectores son paralelos: el índice i relaciona tipo y monto.
let tiposMovimiento  = []
let montosMovimiento = []

// Contador manual de movimientos registrados
let numMovimientos   = 0

// Saldo acumulado en tiempo real; se actualiza en cada operación
let saldoActual      = 0

// SECCIÓN 2C — EVENT LISTENERS (Banco)

// Registra un depósito con el monto ingresado
btnDeposito.addEventListener('click', function () {
  registrarMovimiento('Deposito')
})

// Registra un retiro con el monto ingresado (valida saldo suficiente)
btnRetiro.addEventListener('click', function () {
  registrarMovimiento('Retiro')
})

// Calcula y muestra el resumen con totales y estadísticas
btnVerResumen.addEventListener('click', function () {
  verResumenBanco()
})

// Reinicia vectores, tabla, saldo y resumen del caso 2
btnLimpiarBanco.addEventListener('click', function () {
  limpiarBanco()
})

// Oculta la alerta del banco en cuanto el monto ingresado sea válido
// Borra la alerta del banco al escribir O al hacer clic en el campo



// SECCIÓN 2D — FUNCIONES (Banco)

// registrarMovimiento(tipo)
// Valida el monto e inserta un nuevo movimiento en los vectores.
// Algoritmo:
//   1. Parsea el monto con parseFloat y valida que sea > 0.
//   2. Usa switch(tipo) para determinar la operación:
//      • 'Deposito': suma el monto al saldoActual.
//      • 'Retiro':   verifica con if que el monto no supere el saldo;
//                    si hay fondos suficientes, resta el monto.
//   3. Guarda el tipo y monto en los vectores paralelos.
//   4. Actualiza la tabla y el display de saldo.
// Parámetros:
//   tipo {string} — 'Deposito' | 'Retiro'
function registrarMovimiento(tipo) {
  let monto = parseFloat(inputMonto.value)

  if (isNaN(monto) || monto <= 0) {
    resumenBancoTexto.value = 'Ingresa un monto válido (mayor a $0).'
    return
  }

  // switch para clasificar y ejecutar la operación según el tipo
  switch (tipo) {
    case 'Deposito':
      saldoActual = saldoActual + monto
      break
    case 'Retiro':
      // Validar saldo suficiente antes de restar
      if (monto > saldoActual) {
        resumenBancoTexto.value = 'Saldo insuficiente. Disponible: $' + saldoActual.toFixed(2)
        return
      }
      saldoActual = saldoActual - monto
      break
  }

  // Guardar el movimiento en los vectores paralelos
  tiposMovimiento[numMovimientos]  = tipo
  montosMovimiento[numMovimientos] = monto
  numMovimientos = numMovimientos + 1

  renderTablaMovimientos()
  actualizarSaldo()
  inputMonto.value = ''
}

// renderTablaMovimientos()
// Reconstruye el <tbody> de tablaMovimientos a partir de los vectores.
// Algoritmo:
//   1. Elimina filas de datos anteriores (conserva los 2 encabezados).
//   2. Recorre los vectores con for e inserta una fila por movimiento con:
//      número | tipo | signo + monto
//   3. Si numMovimientos === 0, inserta fila de mensaje vacío y oculta el resumen.
// Complejidad: O(n).
function renderTablaMovimientos() {
  // Eliminar filas de datos anteriores (filas 0 y 1 son encabezados)
  while (tablaMovimientos.rows.length > 2) {
    tablaMovimientos.deleteRow(2)
  }

  for (let i = 0; i < numMovimientos; i++) {
    let signo = tiposMovimiento[i] === 'Deposito' ? '+' : '-'  // signo según el tipo
    let fila  = tablaMovimientos.insertRow()
    fila.innerHTML =
      '<td>' + (i + 1) + '</td>' +
      '<td>' + tiposMovimiento[i] + '</td>' +
      '<td>' + signo + '$' + montosMovimiento[i].toFixed(2) + '</td>'
  }

  // Sin movimientos: mostrar mensaje y ocultar resumen
  if (numMovimientos === 0) {
    let fila = tablaMovimientos.insertRow()
    fila.innerHTML = "<td colspan='3'>Sin movimientos registrados</td>"

  }
}

// actualizarSaldo()
// Escribe el saldo actual formateado en el elemento de display.
// Se llama después de cada depósito o retiro exitoso.
function actualizarSaldo() {
  saldoActualDisplay.textContent = '$' + saldoActual.toFixed(2)
}

// verResumenBanco()
// Recorre los vectores con for para calcular totales y estadísticas del banco.
// Algoritmo:
//   1. Valida que haya al menos un movimiento registrado.
//   2. En un solo for: clasifica con if entre depósitos y retiros,
//      acumula totales y detecta el movimiento de mayor monto.
//   3. Calcula saldo final y promedio por movimiento.
//   4. Arma el texto del resumen con un segundo for y lo muestra en el textarea.
// Complejidad: O(n) — dos recorridos lineales del vector.
function verResumenBanco() {
  if (numMovimientos === 0) {
    resumenBancoTexto.value = 'No hay movimientos registrados aún.'
    return
  }

  let totalDepositado = 0
  let totalRetirado   = 0
  let montoMaximo     = 0
  let tipoMaximo      = ''

  // Recorrido único: clasificar movimientos y detectar el mayor
  for (let i = 0; i < numMovimientos; i++) {
    if (tiposMovimiento[i] === 'Deposito') {
      totalDepositado += montosMovimiento[i]
    } else {
      totalRetirado += montosMovimiento[i]
    }

    // Comparación para encontrar el movimiento de mayor monto
    if (montosMovimiento[i] > montoMaximo) {
      montoMaximo = montosMovimiento[i]
      tipoMaximo  = tiposMovimiento[i]
    }
  }

  let saldoFinal         = totalDepositado - totalRetirado
  let promedioMovimiento = (totalDepositado + totalRetirado) / numMovimientos
  let totalMovido        = totalDepositado + totalRetirado

  // Porcentaje de depósitos y retiros sobre el total movido
  let porcDepositado = totalMovido > 0 ? (totalDepositado / totalMovido) * 100 : 0
  let porcRetirado   = totalMovido > 0 ? (totalRetirado   / totalMovido) * 100 : 0

  // Contadores de cantidad de depósitos y retiros
  let cantDepositos = 0
  let cantRetiros   = 0
  for (let i = 0; i < numMovimientos; i++) {
    if (tiposMovimiento[i] === 'Deposito') {
      cantDepositos++
    } else {
      cantRetiros++
    }
  }
  let porcCantDep = (cantDepositos / numMovimientos) * 100
  let porcCantRet = (cantRetiros   / numMovimientos) * 100

  // Segundo for: listar cada operación con su porcentaje sobre el total movido
  let texto = 'Operaciones:\n'
  for (let i = 0; i < numMovimientos; i++) {
    let porc = totalMovido > 0 ? (montosMovimiento[i] / totalMovido) * 100 : 0
    texto += tiposMovimiento[i] + ': $' + montosMovimiento[i].toFixed(2) +
             ' (' + porc.toFixed(1) + '% del total movido)' + '\n'
  }
  texto += '--- Totales ---'                                                        + '\n'
  texto += 'Total depositado:   $' + totalDepositado.toFixed(2) +
           ' (' + porcDepositado.toFixed(1) + '% del total movido)'                + '\n'
  texto += 'Total retirado:     $' + totalRetirado.toFixed(2) +
           ' (' + porcRetirado.toFixed(1) + '% del total movido)'                  + '\n'
  texto += 'Total movido:       $' + totalMovido.toFixed(2)                        + '\n'
  texto += 'Saldo final:        $' + saldoFinal.toFixed(2)                         + '\n'
  texto += '--- Estadísticas ---'                                                   + '\n'
  texto += 'Total movimientos:   ' + numMovimientos                                + '\n'
  texto += 'Depósitos:           ' + cantDepositos +
           ' (' + porcCantDep.toFixed(1) + '% de operaciones)'                     + '\n'
  texto += 'Retiros:             ' + cantRetiros +
           ' (' + porcCantRet.toFixed(1) + '% de operaciones)'                     + '\n'
  texto += 'Promedio por mov.:  $' + promedioMovimiento.toFixed(2)                 + '\n'
  texto += 'Mayor movimiento:   $' + montoMaximo.toFixed(2) + ' (' + tipoMaximo + ')'

  resumenBancoTexto.value = texto

}

// limpiarBanco()
// Reinicia todos los vectores, contadores, saldo y elementos visuales del Caso 2.
// Efecto colateral: llama a renderTablaMovimientos() y actualizarSaldo().
function limpiarBanco() {
  tiposMovimiento  = []
  montosMovimiento = []
  numMovimientos   = 0
  saldoActual      = 0
  renderTablaMovimientos()
  actualizarSaldo()

  resumenBancoTexto.value = ''
  inputMonto.value = ''

}


// UTILIDADES

// alertar(id, msg)
// Muestra u oculta un elemento de alerta según si el mensaje está vacío o no.
// Algoritmo:
//   • msg === '' → agrega 'd-none' para ocultar el elemento.
//   • msg !== '' → asigna el texto y quita 'd-none' para mostrarlo.
// Parámetros:
//   id  {string} — id del elemento HTML que actúa como alerta.
//   msg {string} — mensaje de error a mostrar, o '' para ocultarlo.
function alertar(id, msg) {
  let el = document.getElementById(id)
  if (!el) return
  if (msg === '') {
    el.style.display = 'none'
  } else {
    el.textContent = msg
    el.style.display = 'block'
  }
}


// INICIALIZACIÓN

// Renderiza las tablas vacías al cargar la página para mostrar el estado inicial
renderTablaFactura()
renderTablaMovimientos()
actualizarSaldo()