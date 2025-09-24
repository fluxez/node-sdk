import { AxiosInstance } from 'axios';
import { FluxezConfig } from '../types/config';
import { Logger } from '../utils/logger';
import {
  QueryType,
  SelectQuery,
  InsertQuery,
  UpdateQuery,
  DeleteQuery,
  WhereCondition,
  JoinClause,
  OrderByClause,
  QueryResult,
  AggregateFunction,
  JoinType,
  OrderDirection,
  WhereOperator,
} from './types';

export class QueryBuilder {
  private httpClient: AxiosInstance;
  private config: FluxezConfig;
  private logger: Logger;
  
  // Query state
  private queryType: QueryType = 'SELECT';
  private table: string = '';
  private selectColumns: string[] = ['*'];
  private whereConditions: WhereCondition[] = [];
  private joinClauses: JoinClause[] = [];
  private orderByClause: OrderByClause[] = [];
  private groupByColumns: string[] = [];
  private havingConditions: WhereCondition[] = [];
  private limitValue?: number;
  private offsetValue?: number;
  private distinctFlag: boolean = false;
  private returningColumns: string[] = [];
  
  // For INSERT
  private insertData: Record<string, any>[] = [];
  
  // For UPDATE
  private updateData: Record<string, any> = {};
  
  constructor(httpClient: AxiosInstance, config: FluxezConfig, logger: Logger) {
    this.httpClient = httpClient;
    this.config = config;
    this.logger = logger;
  }
  
  /**
   * Start a SELECT query
   */
  public from(table: string): QueryBuilder {
    const newBuilder = this.clone();
    newBuilder.queryType = 'SELECT';
    newBuilder.table = table;
    return newBuilder;
  }
  
  /**
   * Select specific columns
   */
  public select(...columns: string[]): QueryBuilder {
    this.selectColumns = columns.length > 0 ? columns : ['*'];
    return this;
  }
  
  /**
   * Add DISTINCT
   */
  public distinct(): QueryBuilder {
    this.distinctFlag = true;
    return this;
  }
  
  /**
   * Add WHERE condition
   */
  public where(
    column: string,
    operatorOrValue: WhereOperator | any,
    value?: any
  ): QueryBuilder {
    let operator: WhereOperator = '=';
    let actualValue: any;
    
    if (value === undefined) {
      actualValue = operatorOrValue;
    } else {
      operator = operatorOrValue as WhereOperator;
      actualValue = value;
    }
    
    this.whereConditions.push({
      column,
      operator,
      value: actualValue,
      type: 'AND',
    });
    
    return this;
  }
  
  /**
   * Add OR WHERE condition
   */
  public orWhere(
    column: string,
    operatorOrValue: WhereOperator | any,
    value?: any
  ): QueryBuilder {
    let operator: WhereOperator = '=';
    let actualValue: any;
    
    if (value === undefined) {
      actualValue = operatorOrValue;
    } else {
      operator = operatorOrValue as WhereOperator;
      actualValue = value;
    }
    
    this.whereConditions.push({
      column,
      operator,
      value: actualValue,
      type: 'OR',
    });
    
    return this;
  }
  
  /**
   * WHERE IN condition
   */
  public whereIn(column: string, values: any[]): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'IN',
      value: values,
      type: 'AND',
    });
    return this;
  }
  
  /**
   * WHERE NOT IN condition
   */
  public whereNotIn(column: string, values: any[]): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'NOT IN',
      value: values,
      type: 'AND',
    });
    return this;
  }
  
  /**
   * WHERE NULL condition
   */
  public whereNull(column: string): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'IS NULL',
      value: null,
      type: 'AND',
    });
    return this;
  }
  
  /**
   * WHERE NOT NULL condition
   */
  public whereNotNull(column: string): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'IS NOT NULL',
      value: null,
      type: 'AND',
    });
    return this;
  }
  
  /**
   * WHERE BETWEEN condition
   */
  public whereBetween(column: string, min: any, max: any): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'BETWEEN',
      value: [min, max],
      type: 'AND',
    });
    return this;
  }
  
  /**
   * WHERE LIKE condition
   */
  public whereLike(column: string, pattern: string): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'LIKE',
      value: pattern,
      type: 'AND',
    });
    return this;
  }
  
  /**
   * WHERE ILIKE condition (case-insensitive)
   */
  public whereILike(column: string, pattern: string): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'ILIKE',
      value: pattern,
      type: 'AND',
    });
    return this;
  }

  /**
   * Convenient shorthand methods for common operators
   */
  
  /**
   * Greater than
   */
  public gt(column: string, value: any): QueryBuilder {
    return this.where(column, '>', value);
  }

  /**
   * Greater than or equal
   */
  public gte(column: string, value: any): QueryBuilder {
    return this.where(column, '>=', value);
  }

  /**
   * Less than
   */
  public lt(column: string, value: any): QueryBuilder {
    return this.where(column, '<', value);
  }

  /**
   * Less than or equal
   */
  public lte(column: string, value: any): QueryBuilder {
    return this.where(column, '<=', value);
  }

  /**
   * Not equal
   */
  public ne(column: string, value: any): QueryBuilder {
    return this.where(column, '!=', value);
  }

  /**
   * IN operator
   */
  public in(column: string, values: any[]): QueryBuilder {
    return this.whereIn(column, values);
  }

  /**
   * NOT IN operator
   */
  public notIn(column: string, values: any[]): QueryBuilder {
    return this.whereNotIn(column, values);
  }

  /**
   * LIKE operator
   */
  public like(column: string, pattern: string): QueryBuilder {
    return this.whereLike(column, pattern);
  }

  /**
   * ILIKE operator (case-insensitive)
   */
  public ilike(column: string, pattern: string): QueryBuilder {
    return this.whereILike(column, pattern);
  }

  /**
   * IS NULL
   */
  public isNull(column: string): QueryBuilder {
    return this.whereNull(column);
  }

  /**
   * IS NOT NULL
   */
  public isNotNull(column: string): QueryBuilder {
    return this.whereNotNull(column);
  }

  /**
   * BETWEEN operator
   */
  public between(column: string, min: any, max: any): QueryBuilder {
    return this.whereBetween(column, min, max);
  }

  /**
   * Complex OR conditions
   */
  public or(...callbacks: Array<(qb: QueryBuilder) => void>): QueryBuilder {
    // Apply OR conditions by running callbacks
    callbacks.forEach((callback) => {
      const subQuery = new QueryBuilder(this.httpClient, this.config, this.logger);
      callback(subQuery);
      // Merge the conditions from subQuery as OR conditions
      subQuery.whereConditions.forEach((condition) => {
        this.whereConditions.push({
          ...condition,
          type: 'OR',
        });
      });
    });
    return this;
  }

  /**
   * OR conditions with shorthand methods
   */
  public orGt(column: string, value: any): QueryBuilder {
    return this.orWhere(column, '>', value);
  }

  public orGte(column: string, value: any): QueryBuilder {
    return this.orWhere(column, '>=', value);
  }

  public orLt(column: string, value: any): QueryBuilder {
    return this.orWhere(column, '<', value);
  }

  public orLte(column: string, value: any): QueryBuilder {
    return this.orWhere(column, '<=', value);
  }

  public orNe(column: string, value: any): QueryBuilder {
    return this.orWhere(column, '!=', value);
  }

  public orIn(column: string, values: any[]): QueryBuilder {
    this.whereConditions.push({
      column,
      operator: 'IN',
      value: values,
      type: 'OR',
    });
    return this;
  }

  public orLike(column: string, pattern: string): QueryBuilder {
    return this.orWhere(column, 'LIKE', pattern);
  }

  public orIlike(column: string, pattern: string): QueryBuilder {
    return this.orWhere(column, 'ILIKE', pattern);
  }
  
  /**
   * Raw WHERE condition
   */
  public whereRaw(sql: string, params?: any[]): QueryBuilder {
    this.whereConditions.push({
      column: '',
      operator: 'RAW',
      value: { sql, params },
      type: 'AND',
    });
    return this;
  }
  
  /**
   * Add JOIN
   */
  public join(
    table: string,
    firstColumn: string,
    operator: string,
    secondColumn: string
  ): QueryBuilder {
    this.joinClauses.push({
      type: 'INNER',
      table,
      firstColumn,
      operator,
      secondColumn,
    });
    return this;
  }
  
  /**
   * Add LEFT JOIN
   */
  public leftJoin(
    table: string,
    firstColumn: string,
    operator: string,
    secondColumn: string
  ): QueryBuilder {
    this.joinClauses.push({
      type: 'LEFT',
      table,
      firstColumn,
      operator,
      secondColumn,
    });
    return this;
  }
  
  /**
   * Add RIGHT JOIN
   */
  public rightJoin(
    table: string,
    firstColumn: string,
    operator: string,
    secondColumn: string
  ): QueryBuilder {
    this.joinClauses.push({
      type: 'RIGHT',
      table,
      firstColumn,
      operator,
      secondColumn,
    });
    return this;
  }
  
  /**
   * Add FULL OUTER JOIN
   */
  public fullJoin(
    table: string,
    firstColumn: string,
    operator: string,
    secondColumn: string
  ): QueryBuilder {
    this.joinClauses.push({
      type: 'FULL',
      table,
      firstColumn,
      operator,
      secondColumn,
    });
    return this;
  }
  
  /**
   * Add GROUP BY
   */
  public groupBy(...columns: string[]): QueryBuilder {
    this.groupByColumns = columns;
    return this;
  }
  
  /**
   * Add HAVING condition
   */
  public having(
    column: string,
    operatorOrValue: WhereOperator | any,
    value?: any
  ): QueryBuilder {
    let operator: WhereOperator = '=';
    let actualValue: any;
    
    if (value === undefined) {
      actualValue = operatorOrValue;
    } else {
      operator = operatorOrValue as WhereOperator;
      actualValue = value;
    }
    
    this.havingConditions.push({
      column,
      operator,
      value: actualValue,
      type: 'AND',
    });
    
    return this;
  }
  
  /**
   * Add ORDER BY
   */
  public orderBy(column: string, direction: OrderDirection = 'ASC'): QueryBuilder {
    // Normalize direction to uppercase for consistency
    const normalizedDirection = direction.toUpperCase() as 'ASC' | 'DESC';
    this.orderByClause.push({ column, direction: normalizedDirection });
    return this;
  }
  
  /**
   * Add LIMIT
   */
  public limit(limit: number): QueryBuilder {
    this.limitValue = limit;
    return this;
  }
  
  /**
   * Add OFFSET
   */
  public offset(offset: number): QueryBuilder {
    this.offsetValue = offset;
    return this;
  }
  
  /**
   * Pagination helper
   */
  public paginate(page: number, perPage: number = 20): QueryBuilder {
    this.limitValue = perPage;
    this.offsetValue = (page - 1) * perPage;
    return this;
  }
  
  /**
   * INSERT query
   */
  public insert(data: Record<string, any> | Record<string, any>[]): QueryBuilder {
    const newBuilder = this.clone();
    newBuilder.queryType = 'INSERT';
    newBuilder.insertData = Array.isArray(data) ? data : [data];
    return newBuilder;
  }
  
  /**
   * UPDATE query
   */
  public update(data: Record<string, any>): QueryBuilder {
    const newBuilder = this.clone();
    newBuilder.queryType = 'UPDATE';
    newBuilder.updateData = data;
    return newBuilder;
  }
  
  /**
   * DELETE query
   */
  public delete(): QueryBuilder {
    const newBuilder = this.clone();
    newBuilder.queryType = 'DELETE';
    return newBuilder;
  }
  
  /**
   * Add RETURNING clause
   */
  public returning(...columns: string[]): QueryBuilder {
    this.returningColumns = columns.length > 0 ? columns : ['*'];
    return this;
  }
  
  /**
   * Aggregate functions
   */
  public count(column: string = '*'): QueryBuilder {
    this.selectColumns = [`COUNT(${column}) as count`];
    return this;
  }
  
  public sum(column: string): QueryBuilder {
    this.selectColumns = [`SUM(${column}) as sum`];
    return this;
  }
  
  public avg(column: string): QueryBuilder {
    this.selectColumns = [`AVG(${column}) as avg`];
    return this;
  }
  
  public min(column: string): QueryBuilder {
    this.selectColumns = [`MIN(${column}) as min`];
    return this;
  }
  
  public max(column: string): QueryBuilder {
    this.selectColumns = [`MAX(${column}) as max`];
    return this;
  }
  
  /**
   * Execute the query
   */
  public async execute<T = any>(): Promise<QueryResult<T>> {
    const query = this.buildQuery();
    
    this.logger.debug('Executing query', query);
    
    const response = await this.httpClient.post('/query/execute', query);
    
    return {
      data: response.data.rows || response.data.data || response.data,
      count: response.data.count,
      metadata: response.data.metadata,
    };
  }
  
  /**
   * Get first result
   */
  public async first<T = any>(): Promise<T | null> {
    this.limitValue = 1;
    const result = await this.execute<T>();
    return result.data?.[0] || null;
  }
  
  /**
   * Get all results
   */
  public async get<T = any>(): Promise<T[]> {
    const result = await this.execute<T>();
    return result.data || [];
  }
  
  /**
   * Get single value
   */
  public async value<T = any>(column: string): Promise<T | null> {
    this.selectColumns = [column];
    const result = await this.first<Record<string, T>>();
    return result ? result[column] : null;
  }
  
  /**
   * Check if record exists
   */
  public async exists(): Promise<boolean> {
    this.selectColumns = ['1'];
    this.limitValue = 1;
    const result = await this.execute();
    return result.data.length > 0;
  }
  
  /**
   * Get query object for manual execution
   */
  public toQuery(): any {
    return this.buildQuery();
  }
  
  /**
   * Get SQL string (for debugging)
   */
  public toSQL(): string {
    const query = this.buildQuery();
    // This is a simplified SQL generation - actual implementation would be more complex
    let sql = '';
    
    switch (query.type) {
      case 'SELECT':
        sql = `SELECT ${query.distinct ? 'DISTINCT ' : ''}${query.columns.join(', ')} FROM ${query.table}`;
        break;
      case 'INSERT':
        sql = `INSERT INTO ${query.table} (...) VALUES (...)`;
        break;
      case 'UPDATE':
        sql = `UPDATE ${query.table} SET ...`;
        break;
      case 'DELETE':
        sql = `DELETE FROM ${query.table}`;
        break;
    }
    
    return sql;
  }
  
  /**
   * Build the query object
   */
  private buildQuery(): any {
    const query: any = {
      type: this.queryType,
      table: this.table,
    };
    
    switch (this.queryType) {
      case 'SELECT':
        query.columns = this.selectColumns;
        query.distinct = this.distinctFlag;
        break;
      case 'INSERT':
        query.data = this.insertData;
        break;
      case 'UPDATE':
        query.data = this.updateData;
        break;
      case 'DELETE':
        // No additional data needed
        break;
    }
    
    // Add common clauses
    if (this.whereConditions.length > 0) {
      query.where = this.whereConditions;
    }
    
    if (this.joinClauses.length > 0) {
      query.joins = this.joinClauses;
    }
    
    if (this.groupByColumns.length > 0) {
      query.groupBy = this.groupByColumns;
    }
    
    if (this.havingConditions.length > 0) {
      query.having = this.havingConditions;
    }
    
    if (this.orderByClause.length > 0) {
      query.orderBy = this.orderByClause;
    }
    
    if (this.limitValue !== undefined) {
      query.limit = this.limitValue;
    }
    
    if (this.offsetValue !== undefined) {
      query.offset = this.offsetValue;
    }
    
    if (this.returningColumns.length > 0) {
      query.returning = this.returningColumns;
    }
    
    return query;
  }
  
  /**
   * Execute the query and get the first result (for single() method compatibility)
   */
  public async single(): Promise<any> {
    this.limit(1);
    const result = await this.execute();
    
    if (result && result.data && Array.isArray(result.data) && result.data.length > 0) {
      return result.data[0];
    }
    
    return null;
  }


  /**
   * Then method for promise-like behavior
   */
  public then(
    onfulfilled?: ((value: any) => any) | null,
    onrejected?: ((reason: any) => any) | null
  ): Promise<any> {
    // Make the QueryBuilder thenable by executing when then() is called
    return this.execute().then(onfulfilled, onrejected);
  }

  /**
   * Catch method for promise-like behavior
   */
  public catch(onrejected?: ((reason: any) => any) | null): Promise<any> {
    return this.then(null, onrejected);
  }
  
  /**
   * Clone the builder for immutability
   */
  private clone(): QueryBuilder {
    const newBuilder = new QueryBuilder(this.httpClient, this.config, this.logger);
    
    // Copy all state
    newBuilder.queryType = this.queryType;
    newBuilder.table = this.table;
    newBuilder.selectColumns = [...this.selectColumns];
    newBuilder.whereConditions = [...this.whereConditions];
    newBuilder.joinClauses = [...this.joinClauses];
    newBuilder.orderByClause = [...this.orderByClause];
    newBuilder.groupByColumns = [...this.groupByColumns];
    newBuilder.havingConditions = [...this.havingConditions];
    newBuilder.limitValue = this.limitValue;
    newBuilder.offsetValue = this.offsetValue;
    newBuilder.distinctFlag = this.distinctFlag;
    newBuilder.returningColumns = [...this.returningColumns];
    newBuilder.insertData = [...this.insertData];
    newBuilder.updateData = { ...this.updateData };
    
    return newBuilder;
  }
}