import {Injectable} from '@angular/core'
import 'rxjs/add/operator/map';

@Injectable()
export class global  {
    public accept = false;
    public running = false;
    public showDetails = false;
    
    public constructor()
     { 
       console.log('global')
    }
};