'use strict';

/* 
    ===========================
    === rename to config.js ===
    ===========================
*/

module.exports = {
    jeedom: {
        port: 443,
        host: '192.168.0.1',
        path: '/core/api/jeeApi.php',
        apikey: 'your-jeedom-api-key',    
    },
    cmds: [
        {
            id: '33',
            name: 'Lumiere du bureau',
            type: 'light',
            description: 'Interrupteur',
            categories: 'SWITCH',
            cmd: {
                /*'dim': 277,*/
                'on': 278,
                'off': 279,
                'state': 280,
            }
        },
        {
            id: '31',
            name: 'Lumiere de la salle de bain',
            type: 'light',
            description: 'Interrupteur',
            categories: 'SWITCH',
            cmd: {
                'on': 266,
                'off': 267,
                'state': 268,
            }
        }
    ]
};
