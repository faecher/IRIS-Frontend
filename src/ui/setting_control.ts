import type {ControlPosition, IControl, Map} from "maplibre-gl";
import { DOM } from "../util/dom.ts";
import router from "../router.ts";

export class SettingControl implements IControl {

    _map: Map;
    _container: HTMLElement;

    _styleButton: HTMLButtonElement;

    constructor() {
        this._container = DOM.create('div', 'maplibregl-ctrl maplibregl-ctrl-group');
        this._container.addEventListener('contextmenu', (e) => e.preventDefault());

        this._styleButton = this._createButton('maplibregl-ctrl-settings', () => {
            // Toggle the value of the store
            router.push('/settings');
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