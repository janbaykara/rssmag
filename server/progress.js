export default class Progress {
	constructor(emitter) {
		this.percent = 0
		this.emitter = emitter
	}

	assign(proportion) {
		return (percent, ...messages) => {
			this.percent += percent/proportion
			this.emitter({
				loadingPercent: this.percent,
				loadingMessage: [...messages].join(' ')
			});
		}
	}
}
