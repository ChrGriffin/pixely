const { expect } = require('chai')
const { Pixely } = require('../Pixely')
const fs = require('fs')
const path = require('path')

describe('Pixely', () => {
  it('exposes itself ;)', () => {
    expect(Pixely).to.exist
  })

  it('throws when no constructor values are passed', () => {
    expect(() => {
      new Pixely()
    }).to.throw('Source parameter required')
  })

  it('does not throws when a source value is passed', () => {
    expect(() => {
      new Pixely('./images/pancake.jpg')
    }).to.not.throw()
  })

  it('it generates files', (done) => {
    let pixely = new Pixely(path.resolve(__dirname, './images/pancake.jpg'), path.resolve(__dirname, '../output'))
    pixely.make().then(() => {
      let htmlExists = fs.existsSync(path.resolve(__dirname, '../output/pixely.html'))
      let cssExists = fs.existsSync(path.resolve(__dirname, '../output/pixely.css'))

      expect(htmlExists).to.equal(true)
      expect(cssExists).to.equal(true)
      done();
    })
      .catch(console.log)
  })
})