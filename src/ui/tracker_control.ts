import type { IControl, Map } from "maplibre-gl";
import {DOM} from "../util/dom.ts";

export class TrackerControl implements IControl {

    _map: Map;
    _container: HTMLElement;

    _trackerListButton: HTMLButtonElement;

    constructor() {
        this._container = DOM.create('div', 'maplibregl-ctrl maplibregl-ctrl-group');
        this._container.addEventListener('contextmenu', (e) => e.preventDefault());

        this._trackerListButton = this._createButton('maplibregl-ctrl-tracker-settings', (e) => {
            console.log("Pressed!");
        });
        DOM.create('span', 'maplibregl-ctrl-icon', this._trackerListButton).setAttribute('aria-hidden', 'true');
    }

    onAdd(map: Map){
        this._map = map;

        return this._container;
    }
    onRemove(){
        DOM.remove(this._container);
        delete this._map;
    }

    _createButton(className: string, fn: (e?: any) => unknown) {
        const a = DOM.create('button', className, this._container) as HTMLButtonElement;
        a.type = 'button';
        a.addEventListener('click', fn);
        return a;
    }

}