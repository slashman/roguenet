function InputBox (input, textBox, onSubmit, initialText = "") {
    this.input = input;
    this.charBuffer = initialText;
    this.onSubmit = onSubmit;
    this.textBox = textBox;
    this.required = true;
}

InputBox.prototype = {
    _updateShownText: function() {
        let showText = this.masked ? this.maskBuffer() : this.charBuffer;
        this.textBox.setText(showText + (this.active ? "_" : ""));
		this.textBox.draw();
		this.textBox.term.render();
    },
    setText: function (text) {
        this.charBuffer = text;
        let showText = this.masked ? this.maskBuffer() : this.charBuffer;
        this.textBox.setText(showText + (this.active ? "_" : ""));
		this.textBox.draw();
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
        if (this.textBox.isFull()) {
            return;
        }
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
    },
    maskBuffer: function () {
        let ret = "";
        for (let i = 0; i < this.charBuffer.length; i++) {
            ret += "*";
        }
        return ret;
    }
}

module.exports = InputBox;