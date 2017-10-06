import JsonDB from 'node-json-db';
const defaultDir = './';

// Implement the driver here.
export default class nodeJsonDriver {
		constructor(options = {}) {
			this._driver = 'node-json'
			this._store = new JsonDB((options.dir || './')+'db.json', options.autosave || true, options.humanReadable || false);

			// Create DB if none
			try {
				this._store.getData('/urls')
			} catch(e) {
				this._store.push('/urls', {})
			}
		}

		// Get around the / / / obj nagivation of node-json-db
		toKey (url) {
			return '/urls/'+(url.replace(/\//g,'•'))
		}

		clear () {
			this._store.push('/urls', {})
			return Promise.resolve()
    }

		setItem (url, value) {
			let key = this.toKey(url)
			this._store.push(key, value)
			return Promise.resolve(value)
    }

		getItem (url) {
			let key = this.toKey(url)
			let result
			try {
				result = this._store.getData(key)
			} catch(e) {
				result = null
			}
			return Promise.resolve(result)
    }

		removeItem (url) {
			let key = this.toKey(url)
			this._store.delete(key)
			return Promise.resolve()
    }
}
