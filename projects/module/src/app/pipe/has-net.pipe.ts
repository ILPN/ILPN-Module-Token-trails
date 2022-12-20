import {Pipe, PipeTransform} from '@angular/core';
import {PetriNet} from 'ilpn-components';


@Pipe({
    name: 'hasNet'
})
export class HasNetPipe implements PipeTransform {

    transform(value: Array<PetriNet> | PetriNet | undefined | null, ...args: unknown[]): boolean {
        if (value === undefined || value === null) {
            return false;
        }
        if (Array.isArray(value)) {
            return value.length !== 0;
        }
        return true;
    }

}
