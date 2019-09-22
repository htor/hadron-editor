function test (any) {
  const href = any.split('#').pop()
  return `<a href="${href}" title="${href}">${href}</a>`
}

console.log(test('foo'))
console.log(test('foo'))
console.log(test('foo/bar'))
console.log(test('foo/bar##baz'))
console.log(test('foo/bar#sub##baz'))
console.log(test('#sub##baz'))
console.log(test('#sub#baz'))
