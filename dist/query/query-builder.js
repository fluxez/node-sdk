"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryBuilder = void 0;
class QueryBuilder {
    constructor(httpClient, config, logger) {
        // Query state
        this.queryType = 'SELECT';
        this.table = '';
        this.selectColumns = ['*'];
        this.whereConditions = [];
        this.joinClauses = [];
        this.orderByClause = [];
        this.groupByColumns = [];
        this.havingConditions = [];
        this.distinctFlag = false;
        this.returningColumns = [];
        // For INSERT
        this.insertData = [];
        // For UPDATE
        this.updateData = {};
        this.httpClient = httpClient;
        this.config = config;
        this.logger = logger;
    }
    /**
     * Start a SELECT query
     */
    from(table) {
        const newBuilder = this.clone();
        newBuilder.queryType = 'SELECT';
        newBuilder.table = table;
        return newBuilder;
    }
    /**
     * Select specific columns
     */
    select(...columns) {
        this.selectColumns = columns.length > 0 ? columns : ['*'];
        return this;
    }
    /**
     * Add DISTINCT
     */
    distinct() {
        this.distinctFlag = true;
        return this;
    }
    /**
     * Add WHERE condition
     */
    where(column, operatorOrValue, value) {
        let operator = '=';
        let actualValue;
        if (value === undefined) {
            actualValue = operatorOrValue;
        }
        else {
            operator = operatorOrValue;
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
    orWhere(column, operatorOrValue, value) {
        let operator = '=';
        let actualValue;
        if (value === undefined) {
            actualValue = operatorOrValue;
        }
        else {
            operator = operatorOrValue;
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
    whereIn(column, values) {
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
    whereNotIn(column, values) {
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
    whereNull(column) {
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
    whereNotNull(column) {
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
    whereBetween(column, min, max) {
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
    whereLike(column, pattern) {
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
    whereILike(column, pattern) {
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
    gt(column, value) {
        return this.where(column, '>', value);
    }
    /**
     * Greater than or equal
     */
    gte(column, value) {
        return this.where(column, '>=', value);
    }
    /**
     * Less than
     */
    lt(column, value) {
        return this.where(column, '<', value);
    }
    /**
     * Less than or equal
     */
    lte(column, value) {
        return this.where(column, '<=', value);
    }
    /**
     * Not equal
     */
    ne(column, value) {
        return this.where(column, '!=', value);
    }
    /**
     * IN operator
     */
    in(column, values) {
        return this.whereIn(column, values);
    }
    /**
     * NOT IN operator
     */
    notIn(column, values) {
        return this.whereNotIn(column, values);
    }
    /**
     * LIKE operator
     */
    like(column, pattern) {
        return this.whereLike(column, pattern);
    }
    /**
     * ILIKE operator (case-insensitive)
     */
    ilike(column, pattern) {
        return this.whereILike(column, pattern);
    }
    /**
     * IS NULL
     */
    isNull(column) {
        return this.whereNull(column);
    }
    /**
     * IS NOT NULL
     */
    isNotNull(column) {
        return this.whereNotNull(column);
    }
    /**
     * BETWEEN operator
     */
    between(column, min, max) {
        return this.whereBetween(column, min, max);
    }
    /**
     * Complex OR conditions
     */
    or(...callbacks) {
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
    orGt(column, value) {
        return this.orWhere(column, '>', value);
    }
    orGte(column, value) {
        return this.orWhere(column, '>=', value);
    }
    orLt(column, value) {
        return this.orWhere(column, '<', value);
    }
    orLte(column, value) {
        return this.orWhere(column, '<=', value);
    }
    orNe(column, value) {
        return this.orWhere(column, '!=', value);
    }
    orIn(column, values) {
        this.whereConditions.push({
            column,
            operator: 'IN',
            value: values,
            type: 'OR',
        });
        return this;
    }
    orLike(column, pattern) {
        return this.orWhere(column, 'LIKE', pattern);
    }
    orIlike(column, pattern) {
        return this.orWhere(column, 'ILIKE', pattern);
    }
    /**
     * Raw WHERE condition
     */
    whereRaw(sql, params) {
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
    join(table, firstColumn, operator, secondColumn) {
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
    leftJoin(table, firstColumn, operator, secondColumn) {
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
    rightJoin(table, firstColumn, operator, secondColumn) {
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
    fullJoin(table, firstColumn, operator, secondColumn) {
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
    groupBy(...columns) {
        this.groupByColumns = columns;
        return this;
    }
    /**
     * Add HAVING condition
     */
    having(column, operatorOrValue, value) {
        let operator = '=';
        let actualValue;
        if (value === undefined) {
            actualValue = operatorOrValue;
        }
        else {
            operator = operatorOrValue;
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
    orderBy(column, direction = 'ASC') {
        // Normalize direction to uppercase for consistency
        const normalizedDirection = direction.toUpperCase();
        this.orderByClause.push({ column, direction: normalizedDirection });
        return this;
    }
    /**
     * Add LIMIT
     */
    limit(limit) {
        this.limitValue = limit;
        return this;
    }
    /**
     * Add OFFSET
     */
    offset(offset) {
        this.offsetValue = offset;
        return this;
    }
    /**
     * Pagination helper
     */
    paginate(page, perPage = 20) {
        this.limitValue = perPage;
        this.offsetValue = (page - 1) * perPage;
        return this;
    }
    /**
     * INSERT query
     */
    insert(data) {
        const newBuilder = this.clone();
        newBuilder.queryType = 'INSERT';
        newBuilder.insertData = Array.isArray(data) ? data : [data];
        return newBuilder;
    }
    /**
     * UPDATE query
     */
    update(data) {
        const newBuilder = this.clone();
        newBuilder.queryType = 'UPDATE';
        newBuilder.updateData = data;
        return newBuilder;
    }
    /**
     * DELETE query
     */
    delete() {
        const newBuilder = this.clone();
        newBuilder.queryType = 'DELETE';
        return newBuilder;
    }
    /**
     * Add RETURNING clause
     */
    returning(...columns) {
        this.returningColumns = columns.length > 0 ? columns : ['*'];
        return this;
    }
    /**
     * Aggregate functions
     */
    count(column = '*') {
        this.selectColumns = [`COUNT(${column}) as count`];
        return this;
    }
    sum(column) {
        this.selectColumns = [`SUM(${column}) as sum`];
        return this;
    }
    avg(column) {
        this.selectColumns = [`AVG(${column}) as avg`];
        return this;
    }
    min(column) {
        this.selectColumns = [`MIN(${column}) as min`];
        return this;
    }
    max(column) {
        this.selectColumns = [`MAX(${column}) as max`];
        return this;
    }
    /**
     * Execute the query
     */
    async execute() {
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
    async first() {
        this.limitValue = 1;
        const result = await this.execute();
        return result.data?.[0] || null;
    }
    /**
     * Get all results
     */
    async get() {
        const result = await this.execute();
        return result.data || [];
    }
    /**
     * Get single value
     */
    async value(column) {
        this.selectColumns = [column];
        const result = await this.first();
        return result ? result[column] : null;
    }
    /**
     * Check if record exists
     */
    async exists() {
        this.selectColumns = ['1'];
        this.limitValue = 1;
        const result = await this.execute();
        return result.data.length > 0;
    }
    /**
     * Get query object for manual execution
     */
    toQuery() {
        return this.buildQuery();
    }
    /**
     * Get SQL string (for debugging)
     */
    toSQL() {
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
    buildQuery() {
        const query = {
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
    async single() {
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
    then(onfulfilled, onrejected) {
        // Make the QueryBuilder thenable by executing when then() is called
        return this.execute().then(onfulfilled, onrejected);
    }
    /**
     * Catch method for promise-like behavior
     */
    catch(onrejected) {
        return this.then(null, onrejected);
    }
    /**
     * Clone the builder for immutability
     */
    clone() {
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
exports.QueryBuilder = QueryBuilder;
//# sourceMappingURL=query-builder.js.map