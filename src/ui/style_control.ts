import type { IControl, Map } from "maplibre-gl";
import {DOM} from "../util/dom.ts";
import {useSettingsStore} from "../store/settings.ts";

export class StyleControl implements IControl {

    _map: Map;
    _container: HTMLElement;

    _styleButton: HTMLButtonElement;

    constructor() {
        this._container = DOM.create('div', 'maplibregl-ctrl maplibregl-ctrl-group');
        this._container.addEventListener('contextmenu', (e) => e.preventDefault());

        const settingsStore = useSettingsStore();

        this._styleButton = this._createButton('maplibregl-ctrl-style', (e) => {
            // Toggle the value of the store
            settingsStore.useVectorTiles = !settingsStore.useVectorTiles;
        });
        DOM.create('span', 'maplibregl-ctrl-icon', this._styleButton).setAttribute('aria-hidden', 'true');
    }

    onAdd(map: Map) {
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

    getDefaultPosition(): ControlPosition {
        return 'bottom-right';
    }

}