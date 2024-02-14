/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { log } = N;

        function error_log(title, data) {
            throw `${title} -- ${JSON.stringify(data)}`;
        }

        return { error_log }

    });
