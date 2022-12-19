import {Component} from '@angular/core';
import {FD_PETRI_NET, PetriNetParserService} from 'ilpn-components';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public readonly FD_PN = FD_PETRI_NET;
    constructor(private _parser: PetriNetParserService) {
    }
}
