const { expect } = require('chai')
const { Pixely } = require('../Pixely')
const fs = require('fs')
const path = require('path')

describe('Pixely', () => {

    describe('Instantiation', () => {

        it('exists', () => {
            expect(Pixely).to.exist
        })

        it('throws an exception when no constructor values are passed', () => {
            expect(() => {
                new Pixely()
            }).to.throw('Source parameter required')
        })

        it('does not throw an exception when a source value is passed', () => {
            expect(() => {
                new Pixely(path.resolve(__dirname, './images/geralt.jpg'))
            }).to.not.throw()
        })
    })

    describe('Image Processing', () => {

        it('it generates files', (done) => {
            let pixely = new Pixely(path.resolve(__dirname, './images/geralt.jpg'), path.resolve(__dirname, '../output'))
            pixely.make().then(() => {
                let htmlExists = fs.existsSync(path.resolve(__dirname, '../output/pixely.html'))
                let cssExists = fs.existsSync(path.resolve(__dirname, '../output/pixely.css'))

                expect(htmlExists).to.equal(true)
                expect(cssExists).to.equal(true)
                done();
            })
        }).timeout(10000)
    })
})
