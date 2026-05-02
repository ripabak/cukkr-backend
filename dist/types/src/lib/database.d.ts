import { Pool } from 'pg';
import * as schemas from '../../drizzle/schemas';
export declare const db: import("drizzle-orm/node-postgres").NodePgDatabase<typeof schemas> & {
    $client: Pool;
};
