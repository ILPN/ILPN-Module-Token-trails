import {Component} from '@angular/core';
import {DropFile, FD_PETRI_NET, PetriNet, PetriNetParserService} from 'ilpn-components';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    public readonly FD_PN = FD_PETRI_NET;

    public model: PetriNet | undefined;
    public specs: Array<PetriNet> = [];

    constructor(private _parser: PetriNetParserService) {
    }

    modelUpload(files: Array<DropFile>) {
        this.model = this._parser.parse(files[0].content);
        console.debug('model', this.model);
        this.computeTokenTrails();
    }

    specUpload(files: Array<DropFile>) {
        this.specs = files.map(f => this._parser.parse(f.content)).filter(v => !!v) as Array<PetriNet>;
        console.debug('specs', this.specs);
        this.computeTokenTrails();
    }

    private computeTokenTrails() {
        if (this.model === undefined || this.specs === undefined) {
            return;
        }

    }
}
