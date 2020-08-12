import { SzBaseElement, SzCustomElement } from '@sahaz/web-ui/core';
import { fromEvent } from 'rxjs';

import template from './custom-form.html';
import { SzPopupManger } from '../popup/service';
import './custom-form.scss';
import { SzSliderManger, SzSliderConfig } from '@sahaz/web-ui/components';
import { SzDemoOptions } from '../options/options';
import { SzHeader } from '../header/header';
export class SzCustomForm extends SzBaseElement {

    public isCaptureMode: boolean = true;
    constructor() {
        super(template);
        this.init();
    }

    init(): void {
        (this.elementRef.popupBtn as HTMLButtonElement).addEventListener('click', () => {
            const popupManger = new SzPopupManger();
            popupManger.open(SzCustomForm);
        });

        (this.elementRef.sliderBtn as HTMLButtonElement).addEventListener('click', () => {
            const popupManger = new SzSliderManger();
            const config = SzSliderConfig.create();
            config.maxWidth = '400px';
            const slider = popupManger.open(SzCustomElement.get('sz-options'), config);
            slider.elementInstance.close = () => slider.close();
        });
    }

    public drawable(canvas: HTMLCanvasElement): void {

        const drawLine = (context: any, x1: any, y1: any, x2: any, y2: any) => {
            context.beginPath();
            context.strokeStyle = 'black';
            context.lineWidth = 0;
            context.clearRect(0, 0, canvas.width, canvas.height);
            context.strokeRect(x1, y1, x2 - x1, y2 - y1);
            context.closePath();
        }
        let x = 0;
        let y = 0;

        const context = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let mouseMoveEvent = (e: MouseEvent) => {
            drawLine(context, x, y, e.offsetX, e.offsetY);
        };
        canvas.addEventListener('mousedown', e => {
            x = e.offsetX;
            y = e.offsetY;
            canvas.addEventListener('mousemove', mouseMoveEvent);
        });



        canvas.addEventListener('mouseup', e => {
            canvas.removeEventListener('mousemove', mouseMoveEvent);
            drawLine(context, x, y, e.offsetX, e.offsetY);
            console.log(x, y, e.offsetX - x, e.offsetY - y);
            const status = (window as any).onSnapshot;
            const bodyBound = document.body.getBoundingClientRect();
            const clipBoundary = { x, y: (y - bodyBound.top), width: e.offsetX - x, height: (e.offsetY - y) };

            if (clipBoundary.width < 0) {
                clipBoundary.x = (clipBoundary.x + clipBoundary.width);
                clipBoundary.width = -clipBoundary.width;
            }

            if (clipBoundary.height < 0) {
                clipBoundary.y = (clipBoundary.y + clipBoundary.height);
                clipBoundary.height = -clipBoundary.height;
            }

            console.log(clipBoundary);
            context.clearRect(0, 0, canvas.width, canvas.height);
            status && status(clipBoundary);
            x = 0;
            y = 0;
            this.disableCapture(canvas);
        });


    }

    public initCapture(): void {

        const canvas = document.createElement('canvas');
        document.body.appendChild(canvas);
        this.drawable(canvas);
        this.isCaptureMode = false;
    }

    public disableCapture(canvas: HTMLCanvasElement): void {
        canvas.remove();
        setTimeout(() => this.isCaptureMode = true, 1000);
    }

    public pause(): void {
        const win = window as any;
        win.onPause && win.onPause();
    }

    public resume(): void {
        const win = window as any;
        win.onResume && win.onResume();
    }
}