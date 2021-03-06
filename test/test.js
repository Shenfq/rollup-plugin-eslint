const { rollup } = require("rollup");
const nodeResolve = require("rollup-plugin-node-resolve");
const { eslint } = require("../");

process.chdir("test");

test("should lint files", () => {
  let count = 0;
  return rollup({
    input: "fixtures/undeclared.js",
    plugins: [
      eslint({
        formatter: results => {
          count += results[0].messages.length;
          const message = results[0].messages[0].message;
          expect(message).toEqual("'x' is not defined.");
        }
      })
    ]
  }).then(() => {
    expect(count).toEqual(1);
  });
});

test("should not fail with default options", () => {
  return rollup({
    input: "fixtures/undeclared.js",
    plugins: [eslint()]
  });
});

test("should ignore node_modules with exclude option", () => {
  let count = 0;
  return rollup({
    input: "fixtures/modules.js",
    plugins: [
      nodeResolve({ jsnext: true }),
      eslint({
        configFile: "fixtures/.eslintrc-babel",
        formatter: () => {
          count += 1;
        }
      })
    ]
  }).then(() => {
    expect(count).toEqual(0);
  });
});

test("should ignore files according .eslintignore", () => {
  let count = 0;
  return rollup({
    input: "fixtures/ignored.js",
    plugins: [
      eslint({
        formatter: () => {
          count += 1;
        }
      })
    ]
  }).then(() => {
    expect(count).toEqual(0);
  });
});

test("should fail with enabled throwOnWarning and throwOnError options", () => {
  return expect(
    rollup({
      input: "fixtures/use-strict.js",
      plugins: [
        eslint({
          throwOnWarning: true,
          throwOnError: true,
          formatter: () => ""
        })
      ]
    }).catch(e => Promise.reject(e.toString()))
  ).rejects.toMatch(/Warnings or errors were found/);
});

test("should fail with enabled throwOnError option", () => {
  return expect(
    rollup({
      input: "fixtures/use-strict.js",
      plugins: [
        eslint({
          throwOnError: true,
          formatter: () => ""
        })
      ]
    }).catch(e => Promise.reject(e.toString()))
  ).rejects.toMatch(/Errors were found/);
});

test("should fail with enabled throwOnWarning option", () => {
  return expect(
    rollup({
      input: "fixtures/use-strict.js",
      plugins: [
        eslint({
          throwOnWarning: true,
          formatter: () => ""
        })
      ]
    }).catch(e => Promise.reject(e.toString()))
  ).rejects.toMatch(/Warnings were found/);
});

test("should not fail with throwOnError and throwOnWarning disabled", () => {
  return rollup({
    input: "fixtures/use-strict.js",
    plugins: [
      eslint({
        throwOnError: false,
        throwOnWarning: false,
        formatter: () => ""
      })
    ]
  });
});

test("should fail with not found formatter", () => {
  expect(() => {
    eslint({ formatter: "not-found-formatter" });
  }).toThrowError(/There was a problem loading formatter/);
});

test("should not fail with found formatter", () => {
  return rollup({
    input: "fixtures/use-strict.js",
    plugins: [
      eslint({
        formatter: "stylish"
      })
    ]
  });
});
