const {
    SERVER_PASSWORD,
    SERVER_PORT,
    SERVER_USERNAME,
    clean,
    createWebDAVClient,
    createWebDAVServer,
    useCustomXmlResponse,
    restoreRequests
} = require("../../helpers.node.js");

describe("stat", function () {
    beforeEach(function () {
        this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
            username: SERVER_USERNAME,
            password: SERVER_PASSWORD
        });
        clean();
        this.server = createWebDAVServer();
        return this.server.start();
    });

    afterEach(function () {
        return this.server.stop();
    });

    it("correctly stats files", function () {
        return this.client.stat("/alrighty.jpg").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/alrighty.jpg");
            expect(stat).to.have.property("basename", "alrighty.jpg");
            expect(stat).to.have.property("lastmod").that.is.a.string;
            expect(stat).to.have.property("type", "file");
            expect(stat).to.have.property("size", 52130);
            expect(stat).to.have.property("mime", "image/jpeg");
        });
    });

    it("correctly stats files with '%' in the path (#221)", function () {
        return this.client.stat("/file % name.txt").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/file % name.txt");
            expect(stat).to.have.property("basename", "file % name.txt");
        });
    });

    it("correctly stats directories with '%' in the path (#221)", function () {
        return this.client.stat("/two%20words").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/two%20words");
            expect(stat).to.have.property("basename", "two%20words");
        });
    });

    it("correctly stats directories", function () {
        return this.client.stat("/webdav/server").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/webdav/server");
            expect(stat).to.have.property("basename", "server");
            expect(stat).to.have.property("lastmod").that.is.a.string;
            expect(stat).to.have.property("type", "directory");
            expect(stat).to.have.property("size", 0);
        });
    });

    it("stats the root", function () {
        return this.client.stat("/").then(function (stat) {
            expect(stat).to.be.an("object");
            expect(stat).to.have.property("filename", "/");
            expect(stat).to.have.property("basename", "");
            expect(stat).to.have.property("lastmod").that.is.a.string;
            expect(stat).to.have.property("type", "directory");
            expect(stat).to.have.property("size", 0);
        });
    });

    it("throws 404 on non-existent file", function () {
        return expect(
            this.client.stat("/does-not-exist")
        ).to.eventually.be.rejected.and.have.property("status", 404);
    });

    describe("when requesting stat from NGinx webdav server", function () {
        beforeEach(function () {
            this.client = createWebDAVClient(`http://localhost:${SERVER_PORT}/webdav/server`, {
                username: SERVER_USERNAME,
                password: SERVER_PASSWORD
            });
            useCustomXmlResponse("nginx-not-found");
        });

        afterEach(function () {
            restoreRequests();
        });

        it("throws 404 on non-existent file", function () {
            return expect(
                this.client.stat("/does-not-exist")
            ).to.eventually.be.rejected.and.have.property("status", 404);
        });
    });

    describe("with details: true", function () {
        it("returns data property", function () {
            return this.client.stat("/", { details: true }).then(function (result) {
                expect(result).to.have.property("data").that.is.an("object");
            });
        });

        it("returns headers", function () {
            return this.client.stat("/", { details: true }).then(function (result) {
                expect(result).to.have.property("headers").that.is.an("object");
            });
        });

        it("returns props", function () {
            return this.client.stat("/", { details: true }).then(function (result) {
                expect(result.data).to.have.property("props").that.is.an("object");
                expect(result.data.props).to.have.property("getlastmodified").that.matches(/GMT$/);
            });
        });

        it("allows requesting a custom set of properties", function () {
            return this.client
                .stat("/alrighty.jpg", {
                    data: `<?xml version="1.0"?>
                    <d:propfind xmlns:d="DAV:">
                        <d:prop>
                            <d:getlastmodified />
                        </d:prop>
                    </d:propfind>`,
                    details: true
                })
                .then(function (result) {
                    expect(result).to.have.nested.property("data.props").that.is.an("object");
                    expect(Object.keys(result.data.props)).to.deep.equal(["getlastmodified"]);
                });
        });
    });
});
