const {Statement} = require('es-vm');
const methodSymbolMap = {
	'LC<!': 'isDisplay',
	'LC<#': 'getLength',
	'LC<@': 'getText',
	'LC<-': 'getWidth',
	'LC<|': 'getHeigth',
	'LC<<': 'getLeft',
	'LC<^': 'getTop',
};

function SelectorStatementFactory(symbol, method) {
	
	class SelectorStatementClass extends Statement {
		constructor ({POSITION, BODY}) {
			super({POSITION});
			this.selector = this.$linkBySymbol(BODY.SELECTOR);
		}
		
		*execute(vm, scope) {
			yield* this.selector.doExecution(vm, scope);
			yield vm.fetch({method,
				args: {
					selector: vm.ret
				}
			}, undefined, () => {
				vm.writeback(null, false);
				vm.$run();
			});
			yield vm.writeback(null, vm.ret);
		}
	}

	return SelectorStatementClass.register(symbol);
}

for(let symbol in methodSymbolMap) {
	SelectorStatementFactory(symbol, methodSymbolMap[symbol]);
}
module.exports = SelectorStatementFactory;