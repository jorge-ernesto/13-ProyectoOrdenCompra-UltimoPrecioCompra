// Notas del archivo:
// - Secuencia de comando:
//      - Biomont UE Orden de Compra (customscript_bio_ue_orden_compra)
// - Registro:
//      - Orden de Compra (purchaseorder)

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['./lib/Bio.Library.Search', './lib/Bio.Library.Helper', 'N'],

    function (objSearch, objHelper, N) {

        const { log } = N;

        /******************/

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit(scriptContext) {

            // Obtener el newRecord y type
            let { newRecord, type } = scriptContext;

            // Modo crear
            if (type == 'create') {

                // Obtener el newRecord
                newRecord = newRecord;

                // Obtener datos
                let ordenCompraId = newRecord.getValue('id');
                let exchangerate = newRecord.getValue('exchangerate'); // Si la moneda es soles, el TC por defecto es 1

                // Debug
                let data = {
                    'ordenCompraId': ordenCompraId,
                    'exchangerate': exchangerate,
                };
                log.debug('data', data);

                // Lista de articulos
                let sublistName = 'item';
                let lineCount = newRecord.getLineCount({ sublistId: sublistName });
                let itemSublist = newRecord.getSublist({ sublistId: sublistName });

                // Debug
                // log.debug('lineCount', lineCount);
                // log.debug('itemSublist', itemSublist);

                for (let i = 0; i < lineCount; i++) {
                    // log.debug('i', i);

                    let columnItem = newRecord.getSublistValue({
                        sublistId: sublistName,
                        fieldId: 'item',
                        line: i
                    });
                    let columnPrice = newRecord.getSublistValue({
                        sublistId: sublistName,
                        fieldId: 'rate',
                        line: i
                    });

                    // Obtener ultimo precio de compra, desde la ultima Orden de Compra registrada con el Articulo
                    let ultimoPrecioCompraSoles = objSearch.getUltimoPrecioCompraSoles_byOCAndArticle(ordenCompraId, columnItem);

                    // Debug
                    // log.debug('ultimoPrecioCompraSoles', ultimoPrecioCompraSoles);

                    // Validar ultimo precio de compra
                    if (ultimoPrecioCompraSoles) {

                        // Setear ultimo precio de compra
                        newRecord.setSublistValue({
                            sublistId: sublistName,
                            fieldId: 'custcol_bio_cam_oc_ultimo_precio', // Ver campo en Netsuite ---> BIO_CAM_OC_ULTIMO_PRECIO (custcol_bio_cam_oc_ultimo_precio) ----> https://6462530.app.netsuite.com/app/common/custom/columncustfield.nl?id=8503
                            line: i,
                            value: (parseFloat(ultimoPrecioCompraSoles) / parseFloat(exchangerate)).toFixed(2) || null
                        });
                    }
                }

                // Detener envio
                // objHelper.error_log('debug', 'Detener envio');
            }
        }

        return { beforeSubmit };

    });
