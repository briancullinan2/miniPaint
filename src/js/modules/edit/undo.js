import app from '../../app.js';
import Base_state_class from './../../core/base-state.js';


class Edit_undo_class {

	constructor() {
		//singleton
		if (app.GUI && app.GUI.Edit_undo) {
			return app.GUI.Edit_undo;
		}
		app.GUI.Edit_undo = this;

		this.Base_state = new Base_state_class();
		this.events();
	}

	events(){
		var _this = this;

		document.querySelector('#undo_button').addEventListener('click', function (event) {
			_this.Base_state.undo();
		});
	}

	undo() {
		this.Base_state.undo();
	}
}

export default Edit_undo_class;
