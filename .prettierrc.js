module.exports = {
    // 语句末尾是否添加分号
    semi: true,

    // 多行时是否在最后一行添加尾随逗号
    trailingComma: 'es5',

    // 是否使用单引号
    singleQuote: true,

    // 每行代码的最大字符数，超过会自动换行
    printWidth: 100,

    // 每个缩进级别的空格数
    tabWidth: 4,

    // 是否使用制表符而不是空格进行缩进
    useTabs: false,

    // 行尾换行符格式
    endOfLine: 'auto',

    // 箭头函数仅有一个参数时，参数是否添加括号
    arrowParens: 'avoid',

    // 是否在对象字面量、数组元素等之间打印空格
    bracketSpacing: true,

    // JSX 标签括号位置
    // true - 将多行 JSX 元素的 > 放在最后一行的末尾
    // false - 将 > 单独放在一行
    jsxBracketSameLine: false,

    // JSX 中是否使用单引号
    jsxSingleQuote: true,

    // HTML 空白敏感度
    htmlWhitespaceSensitivity: 'css',

    // 引号样式
    quoteProps: 'as-needed',

    // Vue 文件中的 <script> 和 <style> 标签是否缩进
    vueIndentScriptAndStyle: false,

    // 是否对 Markdown 文本进行换行
    proseWrap: 'preserve',

    // 是否对引号内的内容进行换行
    requirePragma: false,

    overrides: [
        {
            files: '*.vue',
            options: {
                parser: 'vue',
                htmlWhitespaceSensitivity: 'ignore',
            },
        },
        {
            files: '*.json',
            options: {
                parser: 'json',
                printWidth: 200,
            },
        },
        {
            files: '*.md',
            options: {
                parser: 'markdown',
                proseWrap: 'always',
            },
        },
        {
            files: '*.css',
            options: {
                parser: 'css',
            },
        },
        {
            files: '*.less',
            options: {
                parser: 'less',
            },
        },
        {
            files: '*.scss',
            options: {
                parser: 'scss',
            },
        },
        {
            files: '*.yaml',
            options: {
                parser: 'yaml',
                singleQuote: false, // YAML 使用双引号
            },
        },
    ],
};
