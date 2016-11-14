const Statement = require('../statement');
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
			this.url = this.$linkBySymbol(BODY.URL);
		}
		
		*execute(vm) {
			yield* this.url.execute(vm);
			yield vm.$fetch({method, args: {selector: vm.ret}});
			yield vm.$writeback(null, vm.ret);
		}
	}

	return SelectorStatementClass.register(symbol);
}

for(let symbol in methodSymbolMap) {
	SelectorStatementFactory(symbol, methodSymbolMap[symbol]);
}
module.exports = SelectorStatementFactory;