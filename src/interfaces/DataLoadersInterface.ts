import { DataLoaderParam } from './DataLoaderParamInterface';
import * as DataLoader from 'dataloader';

import { PostInstance } from '../models/PostModel';
import { UserInstance } from './../models/UserModel';

export interface DataLoadersInterface {
    
    userLoader: DataLoader<DataLoaderParam<number>, UserInstance>;
    postLoader: DataLoader<DataLoaderParam<number>, PostInstance>;

};