import rule from '../../src/rules/my';
import {
  RuleTester,
  batchedSingleLineTests,
  getFixturesRootDir,
} from '../RuleTester';

const ruleTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: getFixturesRootDir(),
  },
});

ruleTester.run('no-typescript-default-import', rule, {
  valid: ['console.log(1);'],
  invalid: batchedSingleLineTests({
    code: `
import('file-saver').then(module => module);
    `,
    output: `
import * as ts from 'typescript';
    `,
    errors: [
      {
        messageId: 'noTSDefaultImport',
        line: 2,
      },
    ],
  }),
});
