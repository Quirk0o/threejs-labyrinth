import $ from 'jquery'
import template from "./Blocker.html"
import "./Blocker.css"

export default class Blocker {

    constructor() {
        this.el = $(template);
    }

    display() {
        this.el.css('display', 'flex');
    }
    
    hide() {
        this.el.css('display', 'none');
    }

    render() {
        this.el.html(this.instructions);
    }

    click(cb) {
        this.el.click(cb);
    }
}