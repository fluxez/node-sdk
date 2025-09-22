export type QueryType = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
export type WhereOperator = '=' | '!=' | '<' | '<=' | '>' | '>=' | 'LIKE' | 'ILIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL' | 'BETWEEN' | 'RAW';
export type JoinType = 'INNER' | 'LEFT' | 'RIGHT' | 'FULL';
export type OrderDirection = 'ASC' | 'DESC' | 'asc' | 'desc';
export type AggregateFunction = 'COUNT' | 'SUM' | 'AVG' | 'MIN' | 'MAX';
export interface WhereCondition {
    column: string;
    operator: WhereOperator;
    value: any;
    type: 'AND' | 'OR';
}
export interface JoinClause {
    type: JoinType;
    table: string;
    firstColumn: string;
    operator: string;
    secondColumn: string;
}
export interface OrderByClause {
    column: string;
    direction: OrderDirection;
}
export interface SelectQuery {
    type: 'SELECT';
    table: string;
    columns: string[];
    distinct?: boolean;
    where?: WhereCondition[];
    joins?: JoinClause[];
    groupBy?: string[];
    having?: WhereCondition[];
    orderBy?: OrderByClause[];
    limit?: number;
    offset?: number;
}
export interface InsertQuery {
    type: 'INSERT';
    table: string;
    data: Record<string, any>[];
    returning?: string[];
}
export interface UpdateQuery {
    type: 'UPDATE';
    table: string;
    data: Record<string, any>;
    where?: WhereCondition[];
    returning?: string[];
}
export interface DeleteQuery {
    type: 'DELETE';
    table: string;
    where?: WhereCondition[];
    returning?: string[];
}
export interface QueryResult<T = any> {
    data: T[];
    count?: number;
    metadata?: Record<string, any>;
}
//# sourceMappingURL=types.d.ts.map