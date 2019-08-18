import {Injectable} from '@angular/core'
import 'rxjs/add/operator/map';

@Injectable()
export class global  {
    public accept = false;
    
    public constructor()
     { 
       console.log('global')
    }
};