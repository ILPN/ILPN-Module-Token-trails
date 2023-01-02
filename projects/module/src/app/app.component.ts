import {Component, OnDestroy} from '@angular/core';
import {DropFile, FD_PETRI_NET, PetriNet, PetriNetParserService} from 'ilpn-components';
import {BehaviorSubject, combineLatest, filter, map, Observable, Subscription} from 'rxjs';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

    public readonly FD_PN = FD_PETRI_NET;

    public model$: BehaviorSubject<PetriNet | undefined>;
    public specs$: BehaviorSubject<Array<PetriNet>>;

    public modelNet$: Observable<PetriNet>;
    public specFirstNet$: Observable<PetriNet>;

    private _latest$: Subscription;

    constructor(private _parser: PetriNetParserService) {
        this.model$ = new BehaviorSubject<PetriNet | undefined>(undefined);
        this.specs$ = new BehaviorSubject<Array<PetriNet>>([]);
        this.modelNet$ = this.model$.pipe(filter(v => v !== undefined)) as Observable<PetriNet>;
        this.specFirstNet$ = this.specs$.pipe(filter(v => v.length > 0), map(v => v[0]));
        this._latest$ = combineLatest([this.model$, this.specs$]).subscribe( ([model, specs]) => {
            if (model !== undefined && specs.length > 0) {
                this.computeTokenTrails(model, specs);
            }
        });
    }

    ngOnDestroy(): void {
        this._latest$.unsubscribe();
    }

    modelUpload(files: Array<DropFile>) {
        this.model$.next(this._parser.parse(files[0].content));
        console.debug('model', this.model$.value);
    }

    specUpload(files: Array<DropFile>) {
        this.specs$.next(files.map(f => this._parser.parse(f.content)).filter(v => !!v) as Array<PetriNet>);
        console.debug('specs', this.specs$.value);
    }

    private computeTokenTrails(model: PetriNet, specs: Array<PetriNet>) {


    }
}
