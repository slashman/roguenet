function InputBox (input, textBox, onSubmit) {
    this.input = input;
    this.charBuffer = "";
    this.onSubmit = onSubmit;
    this.textBox = textBox;
    this.required = true;
}

InputBox.prototype = {
    _updateShownText: function() {
        this.textBox.setText(this.charBuffer + (this.active ? "_" : ""));
		this.textBox.draw();
		this.textBox.term.render();
    },
    submit: function (){
        if (this.required && this.charBuffer.trim() == "") {
            return;
        }
        this.onSubmit(this.charBuffer);
        if (this.clearOnSent) {
            this.charBuffer = "";
        }
        this._updateShownText();
    },
    cancelMessage: function (){
        this.charBuffer = "";
        this._updateShownText();
    },
    removeCharacter: function () {
        this.charBuffer = this.charBuffer.slice(0, -1);
        this._updateShownText();
    },
    addCharacter: function (char) {
        this.charBuffer += char;
        this._updateShownText();
    },
    draw: function () {
        this.textBox.draw();
    },
    activate: function () {
        if (this.input.activeInputBox && this.input.activeInputBox.active) {
            this.input.activeInputBox.active = false;
            this.input.activeInputBox._updateShownText();
        }
        this.input.activeInputBox = this;
        this.active = true;
        this._updateShownText();
    }
}

module.exports = InputBox;