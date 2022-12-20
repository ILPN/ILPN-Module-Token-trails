import {Pipe, PipeTransform} from '@angular/core';
import {PetriNet} from 'ilpn-components';
import {HasNetPipe} from './has-net.pipe';


@Pipe({
    name: 'hasNoNet'
})
export class HasNoNetPipe extends HasNetPipe {

    override transform(value: Array<PetriNet> | PetriNet | undefined | null, ...args: unknown[]): boolean {
        return !super.transform(value, args);
    }

}
