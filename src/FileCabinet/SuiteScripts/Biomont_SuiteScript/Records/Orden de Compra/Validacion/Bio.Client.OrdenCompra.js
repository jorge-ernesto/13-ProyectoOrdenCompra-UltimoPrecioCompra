// Notas del archivo:
// - Secuencia de comando:
//      - Biomont CS Orden de Compra (customscript_bio_cs_orden_compra)
// - Registro:
//      - Orden de Compra (purchaseorder)

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./lib/Bio.Library.Search', 'N'],

    function (objSearch, N) {

        const { log } = N;

        /******************/

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

            console.log('pageInit');
        }

        /**
         * Function to be executed when field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number. Will be undefined if not a sublist or matrix field
         * @param {number} scriptContext.columnNum - Line number. Will be undefined if not a matrix field
         *
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {

            // Siempre se ejecuta, ya sea a nivel de cabecera o a nivel de linea (sublista)
            // console.log('fieldChanged', scriptContext);

            // Esta función setValueSubList se encarga de manejar valores por defecto en la sublista
            setValueSubList(scriptContext);
        }

        function setValueSubList(scriptContext) {

            // Esto se ejecuta cuando se hacen cambios en el campo "item" de la sublista "item"
            if (scriptContext.fieldId == 'item') {

                // console.log('fieldChanged', scriptContext);
                // console.log('sublistId', scriptContext.sublistId);
                // console.log('line', scriptContext.line);

                // Obtener el currentRecord
                let recordContext = scriptContext.currentRecord;

                // Obtener datos
                let ordenCompraId = recordContext.getValue('id');
                let exchangerate = recordContext.getValue('exchangerate'); // Si la moneda es soles, el TC por defecto es 1

                // Debug
                let data = {
                    'ordenCompraId': ordenCompraId,
                    'exchangerate': exchangerate,
                };
                console.log('data', data);

                // Validar que sea la sublista "item"
                if (scriptContext.sublistId == 'item') {

                    // Obtener el indice de la linea modificada
                    let line = scriptContext.line;

                    // Obtener item
                    let itemId = recordContext.getCurrentSublistValue({
                        sublistId: 'item',
                        fieldId: 'item',
                        line: line
                    });

                    // Validar item
                    if (itemId) {

                        // Obtener ultimo precio de compra, desde la ultima Orden de Compra registrada con el Articulo
                        let ultimoPrecioCompraSoles = objSearch.getUltimoPrecioCompraSoles_byOCAndArticle(ordenCompraId, itemId);

                        // Debug
                        // console.log('ultimoPrecioCompraSoles', ultimoPrecioCompraSoles);

                        // Validar ultimo precio de compra
                        if (ultimoPrecioCompraSoles) {

                            // Setear ultimo precio de compra
                            recordContext.setCurrentSublistValue({
                                sublistId: 'item',
                                fieldId: 'custcol_bio_cam_oc_ultimo_precio', // Ver campo en Netsuite ---> BIO_CAM_OC_ULTIMO_PRECIO (custcol_bio_cam_oc_ultimo_precio) ----> https://6462530.app.netsuite.com/app/common/custom/columncustfield.nl?id=8503
                                line: line,
                                value: (parseFloat(ultimoPrecioCompraSoles) / parseFloat(exchangerate)).toFixed(2) || null
                            });
                        }
                    }
                }
            }
        }

        return {
            pageInit: pageInit,
            fieldChanged: fieldChanged
        };

    });
