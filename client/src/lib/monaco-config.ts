// Monaco Editor configuration for SQL syntax highlighting
// This would be used if we wanted to integrate Monaco Editor instead of a textarea

export const sqlLanguageConfig = {
  keywords: [
    'SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP',
    'ALTER', 'INDEX', 'TABLE', 'DATABASE', 'COLUMN', 'PRIMARY', 'KEY', 'FOREIGN',
    'REFERENCES', 'CONSTRAINT', 'UNIQUE', 'NOT', 'NULL', 'DEFAULT', 'AUTO_INCREMENT',
    'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'ON', 'USING',
    'GROUP', 'BY', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'ALL',
    'DISTINCT', 'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IF', 'EXISTS',
    'IN', 'BETWEEN', 'LIKE', 'IS', 'AND', 'OR', 'XOR', 'NOT',
    'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'FLOOR', 'CEIL',
    'SUBSTRING', 'CONCAT', 'UPPER', 'LOWER', 'TRIM', 'LENGTH',
    'NOW', 'CURDATE', 'CURTIME', 'DATE', 'TIME', 'TIMESTAMP',
    'INT', 'INTEGER', 'BIGINT', 'SMALLINT', 'TINYINT', 'DECIMAL', 'NUMERIC',
    'FLOAT', 'DOUBLE', 'REAL', 'BOOLEAN', 'BOOL', 'BIT',
    'CHAR', 'VARCHAR', 'TEXT', 'BLOB', 'BINARY', 'VARBINARY',
    'DATE', 'TIME', 'DATETIME', 'TIMESTAMP', 'YEAR',
    'ENUM', 'SET', 'JSON'
  ],
  operators: [
    '=', '!=', '<>', '<', '>', '<=', '>=', '+', '-', '*', '/', '%',
    '&&', '||', '!', '&', '|', '^', '~', '<<', '>>'
  ],
  builtinFunctions: [
    'ABS', 'ACOS', 'ADDDATE', 'ADDTIME', 'AES_DECRYPT', 'AES_ENCRYPT',
    'ASCII', 'ASIN', 'ATAN', 'ATAN2', 'AVG', 'BENCHMARK', 'BIN',
    'BINARY', 'BIT_AND', 'BIT_COUNT', 'BIT_LENGTH', 'BIT_OR', 'BIT_XOR',
    'CAST', 'CEIL', 'CEILING', 'CHAR', 'CHAR_LENGTH', 'CHARACTER_LENGTH',
    'COALESCE', 'COERCIBILITY', 'COLLATION', 'COMPRESS', 'CONCAT',
    'CONCAT_WS', 'CONNECTION_ID', 'CONV', 'CONVERT', 'CONVERT_TZ',
    'COS', 'COT', 'COUNT', 'CRC32', 'CURDATE', 'CURRENT_DATE',
    'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'CURRENT_USER', 'CURTIME',
    'DATABASE', 'DATE', 'DATE_ADD', 'DATE_FORMAT', 'DATE_SUB',
    'DATEDIFF', 'DAY', 'DAYNAME', 'DAYOFMONTH', 'DAYOFWEEK', 'DAYOFYEAR'
  ]
};

export const sqlTheme = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword.sql', foreground: '569cd6' },
    { token: 'string.sql', foreground: 'ce9178' },
    { token: 'number.sql', foreground: 'b5cea8' },
    { token: 'comment.sql', foreground: '6a9955' },
    { token: 'operator.sql', foreground: 'd4d4d4' },
    { token: 'identifier.sql', foreground: '9cdcfe' },
  ],
  colors: {
    'editor.background': '#0f172a',
    'editor.foreground': '#e2e8f0',
    'editorLineNumber.foreground': '#64748b',
    'editorGutter.background': '#1e293b',
  }
};
