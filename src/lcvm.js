const {ESVM, Scope, signal, Statement} = require('es-vm');
const CallStatement = require('./native/call');
const callMain = new CallStatement({BODY: {IDENTIFIER: 'main', ARGUMENTS: []}});

signal.register('CONTROL_SUSPEND', {interception: true});
signal.register('CONTROL_STOP', {interception: true});
signal.register('RETURN');

const defaultOptions = {
	strict: false,
	wait: 500,
	limit: 5000,
	times: 1,
	interval: 3000,
	screen: {
		width: null,
		height: null
	}
};

class LCVM extends ESVM {
	constructor({processMap, options = {}, global} = {}) {
		super();
		
		this.processMap = processMap;
		this.options = Object.assign({}, defaultOptions, options);
		this.rootScope = new Scope();
		this.loop = 0;
		this.callingStack = [];

		this.on('program-end', () => this.loopEnd());
		this.on('program-start', () => {
			const loop = this.loop;
			Object.assign(this.rootScope, {
				get $LOOP() { return loop; }
			});

			global && global.forEach(statement => {
				const run = Statement.linkNode(statement).doExecution(this, this.rootScope);
				for(let tick of run);
			});
		});
	}
	
	pushScope(scopeObject) {
		this.callingStack.push(scopeObject);
		return this;
	}

	popScope() {
		// const {invoking} = 
		this.callingStack.pop();
		return this;
	}

	loopEnd () {
		this.emit('loop-end', this);

		this.loop += 1;
		if (this.loop < this.options.times) {
			this.signal = signal.get('BOOTING');
			setTimeout(() => {
				this.callMainProcess();
			}, this.options.interval);
		} else {
			this.caseEnd();
		}
	}

	caseEnd () {
		this.$runtime = null;
		this.$state = 'ready';
		this.emit('case-end', this);
	}

	/**
	 * @method $getProcess
	 * @param {String} identifier The identifier of a Process.
	 * @return {ProcessStatement}
	 */
	getProcess(identifier) {
		return this.processMap[identifier];
	}

	run(executionNode, scope) {
		this.loadProgram(executionNode);
		Object.assign(this.rootScope, scope);
		this.$run();

		return this.ret;
	}
	
	loadProgram(statement) {
		if (!(statement instanceof Statement)) {
			throw new Error('[ESVM-DEV]: Invalid statement.');
		}
		this.$runtime = statement.doExecution(this, this.rootScope = new Scope());
	}

	callMainProcess() {
		this.loadProgram(callMain);
		this.$launch();

		return this;
	}

	get state() { return this.$state; }
	getPosition() { return this.position; }
	start() {
		this.$bootstrap();
		this.$state = 'running';
		setTimeout(() => this.callMainProcess(), this.options.interval);
		return this;
	}

	resume() {
		this.$state = 'running';
		this.$run();
		return this;
	}

	stop() {
		if (this.signal === signal.get('IDLE')) {
			return this;
		}
		this.$halt();
		this.$state = 'ready';
		return this;
	}
}

exports.LCVM = LCVM;