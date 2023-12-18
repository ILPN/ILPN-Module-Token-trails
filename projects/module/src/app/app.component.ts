import {Component, OnDestroy} from '@angular/core';
import {
    DropFile,
    FD_PETRI_NET,
    FD_PETRI_NET_SPEC,
    Marking,
    PetriNet,
    PetriNetParserService,
    TokenTrailValidationResult,
    TokenTrailValidatorService
} from 'ilpn-components';
import {BehaviorSubject, combineLatest, filter, map, Observable, Subject, Subscription, take} from 'rxjs';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {

    public readonly FD_PN = FD_PETRI_NET;
    public readonly FD_SPEC = FD_PETRI_NET_SPEC;

    private readonly ENABLED_PLACE = '#a0ffa0';
    private readonly ENABLED_PLACE_SELECTED = '#30d030';
    private readonly DISABLED_PLACE = '#ffa0a0';
    private readonly DISABLED_PLACE_SELECTED = '#ff3030';

    public model$: BehaviorSubject<PetriNet | undefined>;
    public specs$: BehaviorSubject<Array<PetriNet>>;
    public modelFill$: Subject<Map<string, string> | undefined>;
    public specMarking$: Subject<Marking>;

    public modelNet$: Observable<PetriNet>;
    public specFirstNet$: Observable<PetriNet>;

    private _latest$: Subscription;
    private _tokenTrail: Map<string, Marking> | undefined;
    private _lastClickedPlaceId?: string;
    private _currentFill?: Map<string, string>;

    constructor(private _parser: PetriNetParserService,
                private _tokenTrails: TokenTrailValidatorService) {
        this.model$ = new BehaviorSubject<PetriNet | undefined>(undefined);
        this.specs$ = new BehaviorSubject<Array<PetriNet>>([]);
        this.modelFill$ = new Subject<Map<string, string> | undefined>();
        this.specMarking$ = new Subject<Marking>();

        this.modelNet$ = this.model$.pipe(filter(v => v !== undefined)) as Observable<PetriNet>;
        this.specFirstNet$ = this.specs$.pipe(filter(v => v.length > 0), map(v => v[0]));
        this._latest$ = combineLatest([this.model$, this.specs$]).subscribe(([model, specs]) => {
            if (model !== undefined && specs.length > 0) {
                this.computeTokenTrails(model, specs);
            }
        });
    }

    ngOnDestroy(): void {
        this._latest$.unsubscribe();
        this.model$.complete();
        this.specs$.complete();
        this.modelFill$.complete();
        this.specMarking$.complete();
    }

    modelUpload(files: Array<DropFile>) {
        this.clearState();
        this.model$.next(this._parser.parse(files[0].content));
        console.debug('model', this.model$.value);
    }

    specUpload(files: Array<DropFile>) {
        this.clearState();
        this.specs$.next(files.map(f => this._parser.parse(f.content)).filter(v => !!v) as Array<PetriNet>);
        console.debug('specs', this.specs$.value);
    }

    modelPlaceClicked(pid: string) {
        // TODO no click on drag
        if (this._tokenTrail === undefined || this._currentFill === undefined) {
            return;
        }

        if (this._lastClickedPlaceId !== undefined) {
            this.swapFill(this._lastClickedPlaceId);
        }
        if (pid === this._lastClickedPlaceId) {
            this._lastClickedPlaceId = undefined;
            this.modelFill$.next(this._currentFill);
            this.specMarking$.next(this.specs$.value[0].getInitialMarking());
            return;
        }
        this._lastClickedPlaceId = pid;
        this.swapFill(this._lastClickedPlaceId);

        this.modelFill$.next(this._currentFill);
        this.specMarking$.next(this._tokenTrail.get(pid) ?? new Marking({}));
    }

    private clearState() {
        this._lastClickedPlaceId = undefined;
        this._currentFill = undefined;
        this.modelFill$.next(this._currentFill);
    }

    private computeTokenTrails(model: PetriNet, specs: Array<PetriNet>) {
        this._tokenTrail = undefined;
        this._tokenTrails.validate(model, specs[0]).pipe(take(1)).subscribe(r => {
            for (const solution of r) {
                this.removeNetPrefixFromMarking(solution);
            }
            console.debug(r);

            this._tokenTrail = new Map<string, Marking>();

            this._currentFill = new Map<string, string>();
            for (const result of r) {
                this._currentFill.set(result.placeId, result.valid ? this.ENABLED_PLACE : this.DISABLED_PLACE);

                if (result.valid) {
                    this._tokenTrail.set(result.placeId, result.tokenTrail);
                }
            }
            this.modelFill$.next(this._currentFill);
        })
    }

    private swapFill(pid: string) {
        this._currentFill!.set(pid, this.getSwapColor(this._currentFill!.get(pid)!));
    }

    private getSwapColor(color: string): string {
        switch (color) {
            case this.ENABLED_PLACE:
                return this.ENABLED_PLACE_SELECTED;
            case this.ENABLED_PLACE_SELECTED:
                return this.ENABLED_PLACE;
            case this.DISABLED_PLACE:
                return this.DISABLED_PLACE_SELECTED;
            case this.DISABLED_PLACE_SELECTED:
                return this.DISABLED_PLACE;
            default:
                return '#0000ff';
        }
    }

    private removeNetPrefixFromMarking(r: TokenTrailValidationResult) {
        const trimmedMarking = new Marking();
        for (const pid of r.tokenTrail.getKeys()) {
            if (pid.startsWith('n0_')) {
                trimmedMarking.set(pid.substring(3), r.tokenTrail.get(pid)!);
            } else {
                console.error(`solution marking contains places without net prefixes! ${pid}`);
                trimmedMarking.set(pid, r.tokenTrail.get(pid)!);
            }
        }
        r.tokenTrail = trimmedMarking;
    }
}
