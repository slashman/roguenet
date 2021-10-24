const InputBox = require("./InputBox.class");
const TextBox = require("./TextBox.class");

const xBase = 5;
const yBase = 5;

module.exports = {
	init(term, game, display) {
		this.term = term;
		this.game = game;
		this.displayNameBox = new InputBox(
			this.game.input,
			new TextBox(this.term, 1, 30, { x: xBase + 15, y: yBase + 3}, display),
			val => {
				this.displayNameBox.setActive(false);
				this.savedDisplayName = val;
				this.pronounsBox.setActive(true);
			}
		);
		this.pronounsBox = new InputBox(
			this.game.input,
			new TextBox(this.term, 1, 30, { x: xBase + 15, y: yBase + 4}, display),
			val => {
				this.pronounsBox.setActive(false);
				this.savedPronouns = val;
				this.speciesBox.setActive(true);
			}
		);
		this.speciesBox = new InputBox(
			this.game.input,
			new TextBox(this.term, 1, 30, { x: xBase + 15, y: yBase + 5}, display),
			val => {
				this.speciesBox.setActive(false);
				this.savedSpecies = val;
				this.specialtyBox.setActive(true);
			}
		);
		this.specialtyBox = new InputBox(
			this.game.input,
			new TextBox(this.term, 1, 30, { x: xBase + 15, y: yBase + 6}, display),
			val => {
				this.specialtyBox.setActive(false);
				this.savedSpecialty = val;
				this.bioBox.setActive(true);
			}
		);
		this.bioBox = new InputBox(
			this.game.input,
			new TextBox(this.term, 1, 30, { x: xBase + 15, y: yBase + 7}, display),
			val => {
				this.bioBox.setActive(false);
				this.savedBio = val;
				this.submit();
			}
		);
	},
	submit() {
		this.game.client.saveBadgeInfo(
			this.savedDisplayName,
			this.savedPronouns,
			this.savedSpecies,
			this.savedSpecialty,
			this.savedBio
		);
		this.game.display.setMode('GAME');
		this.game.input.setMode('MOVEMENT');
		// TODO: The last textbox is remaining on screen until it's refreshed, for some reason.
	},
	activate(data) {
		this.displayNameBox.setText(data.displayName);
		this.pronounsBox.setText(data.pronouns);
		this.speciesBox.setText(data.species);
		this.specialtyBox.setText(data.specialty);
		this.bioBox.setText(data.bio);
		this.displayNameBox.setActive(true);
		this.game.display.refresh();
	},
	render() {
		this.print(":: Your Badge ::", xBase, yBase, 255, 85, 85);
		this.print("User ", xBase, yBase + 2);
		this.print("Display Name", xBase, yBase + 3);
		this.print("Pronouns", xBase, yBase + 4);
		this.print("Species", xBase, yBase + 5);
		this.print("Specialty", xBase, yBase + 6);
		this.print("Bio", xBase, yBase + 7);

		this.displayNameBox.draw();
		this.pronounsBox.draw();
		this.speciesBox.draw();
		this.specialtyBox.draw();
		this.bioBox.draw();
	},
	print(text, x, y, r = 170, g = 170, b = 170) {
		this.term.putString(text, x, y, r, g, b);
	}
}