const inlineEvents = ['click', 'change', 'focusout', 'focusin'];

export class SzBaseElement extends HTMLElement {

    public template: string;
    public elementRef: { [key: string]: HTMLElement };
    private commentMap = new Map<string, SzComment[]>();

    public onDisconnect: () => void;

    constructor(template?: string, mode?: 'open' | 'closed') {
        super();
        if (template) {
            this.loadTemplate(template, mode);
            this.initInlineEventBinding();
            this.initNodeIfStatus();
            this.setRefElements();
        }
    }

    private loadTemplate(temp: string, mode: 'open' | 'closed'): void {
        if (mode) {
            const template = document.createElement('template') as HTMLTemplateElement;
            template.innerHTML = temp;
            this.attachShadow({ mode });
            this.shadowRoot.appendChild(template.content.cloneNode(true));
        } else {
            this.innerHTML = temp;
        }
    }

    public connectedCallback(): void {
        console.log('connectedCallback');
        //   this.updateDom();
    }

    /** this method include all the inline action added in the template */
    private initInlineEventBinding(): void {
        const self = this as any;
        inlineEvents.forEach((eventName: string) => {
            this.querySelectorAll(`[${eventName}]`).forEach((item: HTMLElement) => {
                const key = item.getAttribute(eventName);
                item.addEventListener(eventName, () => {
                    self[key]();
                });
            });
        });

    }

    public disconnectedCallback(): void {
        console.log('called');
        this.onDisconnect && this.onDisconnect();
    }


    private initNodeIfStatus(): void {
        const regPattern = new RegExp(/([\[\]\-_a-z0-9A-Z\.]+)/g);
        this.querySelectorAll(`[if]`).forEach((item: HTMLElement) => {
            const val = item.getAttribute('if');;
            const name = val && val.match(regPattern)[0];
            console.log(name, val);
            !Object.hasOwnProperty.call(this, name) && Object.defineProperty(this, name, {
                get: () => { return (this as any)[`_${name}`]; },
                set: (value: any) => {
                    console.log('set', name, value);
                    (this as any)[`_${name}`] = value;
                    this.updateDom();
                    // this.updateCurrentDom(this.commentMap.get(name), value);
                },
            });
            this.seCommentElement(val, item);
        });
    }

    /** @deprecated */
    protected updateDomOld(): void {
        this.commentMap.forEach((val: SzComment[], key: string) => {
            key = key.replace(/([A-Za-z0-9]+)/g, 'this.$1');
            console.log(key);
            //TODO: need to change eval to Function
            const value = eval(key);
            console.log(value);
            if (value) {
                val.forEach((item) => item.comment.replaceWith(item.dom))
            } else {
                val.forEach((item) => item.dom.replaceWith(item.comment))
            }
        });
    }

    protected updateDom(): void {
        console.dir(this);
        this.commentMap.forEach((val: SzComment[], key: string) => {
            key = key.replace(/([\[\]\-_a-z0-9A-Z\.]+)/g, 'this.$1')

            const fun = new Function(`return ${key}`);
            const evalVal = (() => fun.call(this))();
            console.log(key, evalVal);
            if (evalVal) {
                val.forEach((item) => item.comment.replaceWith(item.dom))
            } else {
                val.forEach((item) => item.dom.replaceWith(item.comment))
            }
        });
    }

    protected updateCurrentDom(val: SzComment[], ifDom?: boolean): void {
        if (ifDom) {
            val.forEach((item) => item.comment.replaceWith(item.dom))
        } else {
            val.forEach((item) => item.dom.replaceWith(item.comment))
        }
    }

    /** This method set the element to the value assigned to the ref attribute  */
    protected setRefElements(...refs: string[]): void {
        var obj: { [key: string]: HTMLElement } = {};
        this.querySelectorAll(`[ref]`).forEach((item: HTMLElement) => {
            const name = item.getAttribute('ref');
            obj[name] = item;

        });

        this.elementRef = obj;
    }

    private seCommentElement(key: string, ele: HTMLElement): void {
        let comment = this.commentMap.get(key);
        comment = comment || [];
        //  comment.push()

        if (this.commentMap.has(key)) {
            comment = this.commentMap.get(key);
            comment.push(SzComment.create(ele));
        } else {
            this.commentMap.set(key, [SzComment.create(ele)]);
        }
    }
}

export class SzComment {
    private static counter = 0;
    comment: Comment;
    dom: HTMLElement;
    private constructor() { }
    public static create(ele: HTMLElement): SzComment {
        const comment = document.createComment(`${SzComment.counter++}`);
        const self = new SzComment();
        self.comment = comment;
        self.dom = ele;
        console.log(self);
        return self;

    }
}