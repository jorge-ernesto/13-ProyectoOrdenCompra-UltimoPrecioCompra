/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { log, search, record } = N;

        function getUltimoPrecioCompraSoles_byOCAndArticle(ordenCompraId, itemId) {

            // Declarar variables
            let ultimaOrdenCompraId = null;
            let tipoCambio = null;
            let arrayUltimaOrdenCompra = [];
            let ultimoPrecioCompraSoles = null;

            /****************** OBTENER ULTIMA ORDEN DE COMPRA ******************/
            // El id no esta definido o esta vacio
            if (!ordenCompraId || ordenCompraId.trim() == '') {
                ordenCompraId = '@NONE@';
            }

            // Crear una búsqueda para obtener los registros
            let searchObj = search.create({
                type: 'purchaseorder',
                columns: [
                    search.createColumn({ name: "internalid", label: "ID interno" }),
                    search.createColumn({
                        name: "tranid",
                        sort: search.Sort.DESC,
                        label: "Número de documento"
                    })
                ],
                filters: [
                    ["mainline", "is", "F"], // Muestra solo detalle
                    "AND",
                    ['item', 'anyof', itemId],
                    'AND',
                    ['internalid', 'noneof', ordenCompraId] // Excluir la orden de compra actual o no excluir nada
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                // Obtener informacion
                let { columns } = result;
                ultimaOrdenCompraId = result.getValue(columns[0]);

                // Detener la búsqueda
                return false;
            });

            // Debug
            // console.log('ultimaOrdenCompraId', ultimaOrdenCompraId); // En ClientScript
            // log.debug('ultimaOrdenCompraId', ultimaOrdenCompraId); // En UserEventScript

            // Validar ultima orden de compra
            if (ultimaOrdenCompraId) {

                /****************** OBTENER ULTIMO TIPO DE CAMBIO ******************/
                // Crear una búsqueda para obtener los registros
                let searchObj = search.create({
                    type: 'purchaseorder',
                    columns: [
                        search.createColumn({ name: "internalid", label: "ID interno" }),
                        search.createColumn({
                            name: "tranid",
                            sort: search.Sort.DESC,
                            label: "Número de documento"
                        }),
                        search.createColumn({ name: "exchangerate", label: "Tipo de cambio" })
                    ],
                    filters: [
                        ["mainline", "is", "T"], // Muestra solo cabecera
                        "AND",
                        ['internalid', 'anyof', ultimaOrdenCompraId]
                    ]
                });

                // Ejecutar la búsqueda y recorrer los resultados
                searchObj.run().each(function (result) {
                    // Obtener informacion
                    let { columns } = result;
                    tipoCambio = result.getValue(columns[2]); // Si la moneda es soles, el TC por defecto es 1

                    // Detener la búsqueda
                    return false;
                });

                // Debug
                // console.log('tipoCambio', tipoCambio); // En ClientScript
                // log.debug('tipoCambio', tipoCambio); // En UserEventScript

                /****************** OBTENER ULTIMO PRECIO DE COMPRA ******************/
                // Crear una búsqueda para obtener los registros
                let searchObj_ = search.create({
                    type: 'purchaseorder',
                    columns: [
                        search.createColumn({ name: "internalid", label: "ID interno" }),
                        search.createColumn({
                            name: "tranid",
                            sort: search.Sort.DESC,
                            label: "Número de documento"
                        }),
                        search.createColumn({
                            name: "line",
                            sort: search.Sort.ASC,
                            label: "ID linea"
                        }),
                        search.createColumn({ name: "item", label: "Artículo" }),
                        search.createColumn({
                            name: "displayname",
                            join: "item",
                            label: "Nombre para mostrar"
                        }),
                        search.createColumn({ name: "unitabbreviation", label: "Unidades" }),
                        search.createColumn({ name: "quantityuom", label: "Cantidad en unidades de la transacción" }),
                        search.createColumn({ name: "fxrate", label: "Tasa de artículo (moneda extrajera)" }),
                        search.createColumn({ name: "fxamount", label: "Importe (moneda extranjera)" }),
                        search.createColumn({
                            name: "formulanumeric",
                            formula: "TO_NUMBER({fxamount})",
                            label: "Fórmula (numérica) - Importe (moneda extranjera)"
                        })
                    ],
                    filters: [
                        ["mainline", "is", "F"], // Muestra solo detalle
                        "AND",
                        ['item', 'anyof', itemId],
                        "AND",
                        ['internalid', 'anyof', ultimaOrdenCompraId]
                    ]
                });

                // Ejecutar la búsqueda y recorrer los resultados
                searchObj_.run().each(function (result) {
                    // Obtener informacion
                    let { columns } = result;
                    let columnItem = result.getValue(columns[3]);
                    let columnQuantityUom = result.getValue(columns[6]);
                    let columnPrice = result.getValue(columns[7]);
                    let columnFxAmount = result.getValue(columns[9]);

                    // Procesar informacion
                    let columnPriceCalculate = (parseFloat(columnFxAmount) / parseFloat(columnQuantityUom)).toFixed(2);

                    // Insertar informacion en array
                    arrayUltimaOrdenCompra.push({
                        columnItem,
                        columnQuantityUom,
                        columnPrice,
                        columnFxAmount,
                        columnPriceCalculate
                    });
                    return true;
                });

                arrayUltimaOrdenCompra.forEach((element, i) => {
                    // console.log('element', element); // En ClientScript
                    // log.debug('element', element); // En UserEventScript

                    // Es articulo
                    if (element.columnItem == itemId) {

                        // Obtener ultimo precio de compra
                        ultimoPrecioCompraSoles = parseFloat(element.columnPriceCalculate) * parseFloat(tipoCambio);
                    }
                });
            }

            // Debug
            // console.log('ultimaOrdenCompraId', ultimaOrdenCompraId); // En ClientScript
            // log.debug('ultimaOrdenCompraId', ultimaOrdenCompraId); // En UserEventScript

            // Validar ultima orden de compra
            if (ultimaOrdenCompraId && false) {

                // Cargar el registro de la orden de compra
                let purchaseOrder = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: ultimaOrdenCompraId
                });

                /****************** OBTENER ULTIMO TIPO DE CAMBIO ******************/
                // Obtener datos
                let tipoCambio = purchaseOrder.getValue('exchangerate'); // Si la moneda es soles, el TC por defecto es 1

                // Debug
                // console.log('tipoCambio', tipoCambio); // En ClientScript
                // log.debug('tipoCambio', tipoCambio); // En UserEventScript

                /****************** OBTENER ULTIMO PRECIO DE COMPRA ******************/
                // Lista de articulos
                let sublistName = 'item';
                let lineCount = purchaseOrder.getLineCount({ sublistId: sublistName });
                let itemSublist = purchaseOrder.getSublist({ sublistId: sublistName });

                for (let i = 0; i < lineCount; i++) {
                    // console.log('i', i); // En ClientScript
                    // log.debug('i', i); // En UserEventScript

                    let columnItem = purchaseOrder.getSublistValue({
                        sublistId: sublistName,
                        fieldId: 'item',
                        line: i
                    });
                    let columnPrice = purchaseOrder.getSublistValue({
                        sublistId: sublistName,
                        fieldId: 'rate',
                        line: i
                    });

                    // Es articulo
                    if (columnItem == itemId) {

                        // Obtener ultimo precio de compra
                        ultimoPrecioCompraSoles = parseFloat(columnPrice) * parseFloat(tipoCambio);
                    }
                }
            }

            return ultimoPrecioCompraSoles;
        }

        return { getUltimoPrecioCompraSoles_byOCAndArticle }

    });
