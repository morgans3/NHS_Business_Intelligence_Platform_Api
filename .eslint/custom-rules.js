module.exports = {
    "expressjs-status-codes": {
        meta: {
            docs: {
                description: "Use appropriate status codes",
                category: 'Possible Errors',
                recommended: false,
            },
            schema: [],
        },
        create: (context) => ({
            CallExpression(node) {
                // if (node.callee.name === 'json') {
                //     console.log(node);
                // }
                //Add custom rule here
            }
        })
    },
};