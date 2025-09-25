import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import { QueryResult, OrderDirection, WhereOperator } from './types';
export declare class QueryBuilder {
    private httpClient;
    private config;
    private logger;
    private queryType;
    private table;
    private selectColumns;
    private whereConditions;
    private joinClauses;
    private orderByClause;
    private groupByColumns;
    private havingConditions;
    private limitValue?;
    private offsetValue?;
    private distinctFlag;
    private returningColumns;
    private insertData;
    private updateData;
    constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger);
    /**
     * Start a SELECT query
     */
    from(table: string): QueryBuilder;
    /**
     * Select specific columns
     */
    select(...columns: string[]): QueryBuilder;
    /**
     * Add DISTINCT
     */
    distinct(): QueryBuilder;
    /**
     * Add WHERE condition
     */
    where(column: string, operatorOrValue: WhereOperator | any, value?: any): QueryBuilder;
    /**
     * Add OR WHERE condition
     */
    orWhere(column: string, operatorOrValue: WhereOperator | any, value?: any): QueryBuilder;
    /**
     * WHERE IN condition
     */
    whereIn(column: string, values: any[]): QueryBuilder;
    /**
     * WHERE NOT IN condition
     */
    whereNotIn(column: string, values: any[]): QueryBuilder;
    /**
     * WHERE NULL condition
     */
    whereNull(column: string): QueryBuilder;
    /**
     * WHERE NOT NULL condition
     */
    whereNotNull(column: string): QueryBuilder;
    /**
     * WHERE BETWEEN condition
     */
    whereBetween(column: string, min: any, max: any): QueryBuilder;
    /**
     * WHERE LIKE condition
     */
    whereLike(column: string, pattern: string): QueryBuilder;
    /**
     * WHERE ILIKE condition (case-insensitive)
     */
    whereILike(column: string, pattern: string): QueryBuilder;
    /**
     * Convenient shorthand methods for common operators
     */
    /**
     * Greater than
     */
    gt(column: string, value: any): QueryBuilder;
    /**
     * Greater than or equal
     */
    gte(column: string, value: any): QueryBuilder;
    /**
     * Less than
     */
    lt(column: string, value: any): QueryBuilder;
    /**
     * Less than or equal
     */
    lte(column: string, value: any): QueryBuilder;
    /**
     * Not equal
     */
    ne(column: string, value: any): QueryBuilder;
    /**
     * IN operator
     */
    in(column: string, values: any[]): QueryBuilder;
    /**
     * NOT IN operator
     */
    notIn(column: string, values: any[]): QueryBuilder;
    /**
     * LIKE operator
     */
    like(column: string, pattern: string): QueryBuilder;
    /**
     * ILIKE operator (case-insensitive)
     */
    ilike(column: string, pattern: string): QueryBuilder;
    /**
     * IS NULL
     */
    isNull(column: string): QueryBuilder;
    /**
     * IS NOT NULL
     */
    isNotNull(column: string): QueryBuilder;
    /**
     * BETWEEN operator
     */
    between(column: string, min: any, max: any): QueryBuilder;
    /**
     * Complex OR conditions
     */
    or(...callbacks: Array<(qb: QueryBuilder) => void>): QueryBuilder;
    /**
     * OR conditions with shorthand methods
     */
    orGt(column: string, value: any): QueryBuilder;
    orGte(column: string, value: any): QueryBuilder;
    orLt(column: string, value: any): QueryBuilder;
    orLte(column: string, value: any): QueryBuilder;
    orNe(column: string, value: any): QueryBuilder;
    orIn(column: string, values: any[]): QueryBuilder;
    orLike(column: string, pattern: string): QueryBuilder;
    orIlike(column: string, pattern: string): QueryBuilder;
    /**
     * Raw WHERE condition
     */
    whereRaw(sql: string, params?: any[]): QueryBuilder;
    /**
     * Add JOIN
     */
    join(table: string, firstColumn: string, operator: string, secondColumn: string): QueryBuilder;
    /**
     * Add LEFT JOIN
     */
    leftJoin(table: string, firstColumn: string, operator: string, secondColumn: string): QueryBuilder;
    /**
     * Add RIGHT JOIN
     */
    rightJoin(table: string, firstColumn: string, operator: string, secondColumn: string): QueryBuilder;
    /**
     * Add FULL OUTER JOIN
     */
    fullJoin(table: string, firstColumn: string, operator: string, secondColumn: string): QueryBuilder;
    /**
     * Add GROUP BY
     */
    groupBy(...columns: string[]): QueryBuilder;
    /**
     * Add HAVING condition
     */
    having(column: string, operatorOrValue: WhereOperator | any, value?: any): QueryBuilder;
    /**
     * Add ORDER BY
     */
    orderBy(column: string, direction?: OrderDirection): QueryBuilder;
    /**
     * Add LIMIT
     */
    limit(limit: number): QueryBuilder;
    /**
     * Add OFFSET
     */
    offset(offset: number): QueryBuilder;
    /**
     * Pagination helper
     */
    paginate(page: number, perPage?: number): QueryBuilder;
    /**
     * INSERT query
     */
    insert(data: Record<string, any> | Record<string, any>[]): QueryBuilder;
    /**
     * UPDATE query
     */
    update(data: Record<string, any>): QueryBuilder;
    /**
     * DELETE query
     */
    delete(): QueryBuilder;
    /**
     * Add RETURNING clause
     */
    returning(...columns: string[]): QueryBuilder;
    /**
     * Aggregate functions
     */
    count(column?: string): Promise<number>;
    sum(column: string): QueryBuilder;
    avg(column: string): QueryBuilder;
    min(column: string): QueryBuilder;
    max(column: string): QueryBuilder;
    /**
     * Execute the query
     */
    execute<T = any>(): Promise<QueryResult<T>>;
    /**
     * Get first result
     */
    first<T = any>(): Promise<T | null>;
    /**
     * Get all results
     */
    get<T = any>(): Promise<T[]>;
    /**
     * Get single value
     */
    value<T = any>(column: string): Promise<T | null>;
    /**
     * Check if record exists
     */
    exists(): Promise<boolean>;
    /**
     * Get query object for manual execution
     */
    toQuery(): any;
    /**
     * Get SQL string (for debugging)
     */
    toSQL(): string;
    /**
     * Build the query object
     */
    private buildQuery;
    /**
     * Execute the query and get the first result (for single() method compatibility)
     */
    single(): Promise<any>;
    /**
     * Then method for promise-like behavior
     */
    then(onfulfilled?: ((value: any) => any) | null, onrejected?: ((reason: any) => any) | null): Promise<any>;
    /**
     * Catch method for promise-like behavior
     */
    catch(onrejected?: ((reason: any) => any) | null): Promise<any>;
    /**
     * Transform WHERE conditions to backend format
     */
    private transformWhereConditions;
    /**
     * Transform JOIN clauses to backend format
     */
    private transformJoins;
    /**
     * Clone the builder for immutability
     */
    private clone;
}
//# sourceMappingURL=query-builder.d.ts.map