const a = {
	'SYMBOL': 'PROCESS',
	'BODY': {
		'IDENTIFIER': 'main',
		'PARAMETER': [],
		'SEGMENT': [
			{
				'SYMBOL': 'LC<@',
				'BODY': {
					'SELECTOR': {
						'SYMBOL': 'LITERAL::SIMPLE',
						'BODY': {
							'DESTINATION': 'title',
						}
					}
				}
			}
		]
	}
};

'use strict';
const {LCVM} = require('../src');
const {Statement} = require('es-vm');
const assert = require('assert');

describe.skip('DEBUG::', function () {
	const vm = new LCVM();
	
	vm.on('fetch', (rpc, invoking) => {
		rpc.async(() => {
			return new Promise(resolve => {
				setTimeout(() => resolve(3434),200)
			}).then(ret => {
				rpc.setRet(ret);
			});					
		});
	});

	it('fuck', function (done) {
		vm.run(Statement.linkNode(a));
	});

});