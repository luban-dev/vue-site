export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'build', //   build：主要目的是修改项目构建系统(例如 glup，webpack，rollup 的配置等)的提交
        'ci', //   ci：主要目的是修改项目继续集成流程(例如 Travis，Jenkins，GitLab CI，Circle等)的提交
        'chore', //   chore：不属于以上类型的其他类型
        'docs', //   docs：文档更新
        'feat', //   feat：新增功能
        'fix', //   fix：bug 修复
        'perf', //   perf：性能优化
        'refactor', //   refactor：重构代码(既没有新增功能，也没有修复 bug)
        'revert', //   revert：回滚某个更早之前的提交
        'style' //   style：不影响程序逻辑的代码修改(修改空白字符，补全缺失的分号等)
      ]
    ]
  }
};
