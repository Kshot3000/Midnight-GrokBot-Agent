import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyJsRuntimeDeployPath,
  STILL_BBOARD_PATHS,
  OFFICIAL_HELLO,
  UPSTREAM_JS_RUNTIME_DEPLOY,
} from '../src/js-runtime-deploy-gap.mjs';

describe('js-runtime-deploy-gap', () => {
  it('marks the two guides as still using bboard', () => {
    for (const path of STILL_BBOARD_PATHS) {
      const result = classifyJsRuntimeDeployPath(path);
      assert.equal(result.ok, false);
      assert.equal(result.kind, 'still-using-bboard');
      assert.match(result.hint, /1579/);
      assert.equal(result.upstream, UPSTREAM_JS_RUNTIME_DEPLOY);
    }
  });

  it('accepts the hello-world replacement page', () => {
    const result = classifyJsRuntimeDeployPath(OFFICIAL_HELLO);
    assert.equal(result.ok, true);
    assert.equal(result.kind, 'hello-replacement');
  });

  it('leaves other paths alone', () => {
    const result = classifyJsRuntimeDeployPath('/tutorials');
    assert.equal(result.ok, true);
    assert.equal(result.kind, 'other');
  });
});
