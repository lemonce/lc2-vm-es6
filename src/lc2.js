const {Statement} = require('es-vm');

class LC2Statement extends Statement {
	*autowait(vm) {
		const autoWait = vm.options.wait;
		if (autoWait >= 0) {
			yield vm.$setTimeout(() => vm.$run(), autoWait);
			yield 'VM::BLOCKED';
		}
	}

	*getLimit($) {
		let limit = $.vm.options.limit;
		if (this.limit) {
			limit = yield* this.limit.doExecution($);
		}

		return limit;
	}

	output($, type, data) {
		$.vm.emit('driver', {
			type,
			data: Object.assign({
				position: this.position
			}, data)
		});
	}
	
	linkSegment(segment) {
		if (!Array.isArray(segment)) {
			throw new Error('[LCVM-DEV]: Invalid segment.');
		}

		const linkedSegment = [];

		segment.forEach(statement => {
			linkedSegment.push(this.linkNode(statement));
		});

		return linkedSegment;
	}
}

class DriverStatement extends LC2Statement {

	/**
	 * Get the selector of a statement and update it to $IT.
	 * If selector from statement is empty, use $IT instead.
	 * @param {Object} context
	 */
	*getSelector($) {
		if (this.selector) {
			const selector = yield* this.selector.doExecution($);

			return $.scope.$IT = selector;
		}
		
		if(!$.scope.$IT) {
			throw new Error('[LCVM]: Empty selector founded.');
		}

		return $.scope.$IT;
	}
}

class ControlStatement extends LC2Statement {
	// *executeSegment($, segment, callback) {
	// 	for (let statement of segment) {
	// 		const statementRuntime = statement.doExecution($);
	// 		let ret, $done = false;
			
	// 		while (!$done) {
	// 			const {done, value} = statementRuntime.next(ret);

	// 			if(callback(value)) {
	// 				break;
	// 			}
				
	// 			$done = done;
	// 			ret = yield value;
	// 		}
	// 	}

	// }
}

exports.ControlStatement = ControlStatement;
exports.DriverStatement = DriverStatement;
exports.LC2Statement = LC2Statement;