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
                    search.createColumn({
                        name: "internalid",
                        sort: search.Sort.DESC,
                        label: "ID interno"
                    })
                ],
                filters: [
                    ['item', 'anyof', itemId],
                    'AND',
                    ['internalid', 'noneof', ordenCompraId] // Excluir la orden de compra actual
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

            /****************** OBTENER ULTIMO PRECIO DE COMPRA ******************/
            // Validar ultima orden de compra
            if (ultimaOrdenCompraId) {

                // Cargar el registro de la orden de compra
                let purchaseOrder = record.load({
                    type: record.Type.PURCHASE_ORDER,
                    id: ultimaOrdenCompraId
                });

                // Obtener datos
                let exchangerate = purchaseOrder.getValue('exchangerate'); // Si la moneda es soles, el TC por defecto es 1

                // Lista de articulos
                let sublistName = 'item';
                let lineCount = purchaseOrder.getLineCount({ sublistId: sublistName });
                let itemSublist = purchaseOrder.getSublist({ sublistId: sublistName });

                for (let i = 0; i < lineCount; i++) {
                    // log.debug('i', i); // En UserEventScript
                    // console.log('i', i); // En ClientScript

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
                        ultimoPrecioCompraSoles = parseFloat(columnPrice) * parseFloat(exchangerate);
                    }
                }
            }

            return ultimoPrecioCompraSoles;
        }

        return { getUltimoPrecioCompraSoles_byOCAndArticle }

    });
